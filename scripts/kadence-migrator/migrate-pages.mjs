#!/usr/bin/env node
/**
 * Kadence → Sanity page migrator (v0.1).
 *
 * Pulls every page from a WordPress source via REST API (with auth so
 * we get raw block markers), parses Kadence Block-editor patterns, maps
 * each block to one of our Sanity section schemas, uploads images to
 * Sanity's asset CDN, and writes draft Sanity documents.
 *
 * Usage: see scripts/kadence-migrator/README.md
 *
 * This is a STARTER. It handles ~80% of the Kadence patterns we see on
 * pest-control / home-services sites; anything else falls through to a
 * raw-HTML htmlSection so nothing breaks. The fallthroughs are listed in
 * the migration-report.json so the next iteration knows what to map.
 */
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBlocks } from './lib/parse-blocks.mjs';
import { mapBlockToSection } from './block-mappers/index.mjs';
import { uploadImageFromUrl } from './lib/sanity-assets.mjs';
import { htmlToPortableText } from './lib/portable-text.mjs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- CLI args ----------
const args = new Set(process.argv.slice(2));
const slugArg = process.argv.find((a) => a.startsWith('--slug='));
const onlySlug = slugArg ? slugArg.split('=')[1] : null;
const DRY_RUN = args.has('--dry-run');
const SKIP_IMAGES = args.has('--skip-images');
const VERBOSE = args.has('--verbose');

// ---------- Env validation ----------
const WP_SOURCE_URL = process.env.WP_SOURCE_URL;
const WP_REST_USER = process.env.WP_REST_USER;
const WP_REST_APP_PASSWORD = process.env.WP_REST_APP_PASSWORD;
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET ?? 'production';
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;

if (!WP_SOURCE_URL || !WP_REST_USER || !WP_REST_APP_PASSWORD) {
  console.error('❌ Missing WP_SOURCE_URL / WP_REST_USER / WP_REST_APP_PASSWORD in .env');
  process.exit(1);
}
if (!DRY_RUN && (!SANITY_PROJECT_ID || !SANITY_API_TOKEN)) {
  console.error('❌ Missing SANITY_PROJECT_ID / SANITY_API_TOKEN (use --dry-run to skip).');
  process.exit(1);
}

const sanity = DRY_RUN
  ? null
  : createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: '2024-01-01',
      token: SANITY_API_TOKEN,
      useCdn: false,
    });

const wpAuthHeader =
  'Basic ' +
  Buffer.from(`${WP_REST_USER}:${WP_REST_APP_PASSWORD}`).toString('base64');

// ---------- Fetch pages ----------
async function fetchAllPages() {
  const pages = [];
  let page = 1;
  while (true) {
    const url = `${WP_SOURCE_URL.replace(
      /\/$/,
      '',
    )}/wp-json/wp/v2/pages?context=edit&per_page=50&page=${page}&_fields=id,slug,title,content,date,modified,link,parent`;
    const res = await fetch(url, { headers: { Authorization: wpAuthHeader } });
    if (!res.ok) {
      if (res.status === 400 && page > 1) break; // past last page
      throw new Error(`WP fetch failed at ${url}: ${res.status} ${res.statusText}`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    pages.push(...batch);
    if (batch.length < 50) break;
    page += 1;
  }
  return pages;
}

// ---------- Migration report scaffolding ----------
const report = {
  startedAt: new Date().toISOString(),
  source: WP_SOURCE_URL,
  destination: { projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET },
  dryRun: DRY_RUN,
  pages: [],
  blockCounts: {},
  unmappedBlocks: {},
  imagesUploaded: 0,
  errors: [],
};

function recordBlock(name, handled) {
  report.blockCounts[name] = (report.blockCounts[name] ?? 0) + 1;
  if (!handled) {
    report.unmappedBlocks[name] = (report.unmappedBlocks[name] ?? 0) + 1;
  }
}

// ---------- Main ----------
async function main() {
  console.log(`📥 Fetching pages from ${WP_SOURCE_URL}…`);
  const allPages = await fetchAllPages();
  console.log(`   ${allPages.length} pages found.`);
  const pages = onlySlug ? allPages.filter((p) => p.slug === onlySlug) : allPages;
  if (onlySlug && pages.length === 0) {
    console.error(`❌ No page with slug "${onlySlug}" found.`);
    process.exit(1);
  }

  const imageCache = new Map(); // src URL → Sanity asset ref (avoid double uploads)
  const uploadCtx = {
    async uploadImage(url, alt) {
      if (SKIP_IMAGES || DRY_RUN) return { _placeholder: true, src: url, alt };
      if (imageCache.has(url)) return imageCache.get(url);
      try {
        const ref = await uploadImageFromUrl(sanity, url, alt);
        imageCache.set(url, ref);
        report.imagesUploaded += 1;
        return ref;
      } catch (err) {
        report.errors.push({ kind: 'image_upload_failed', url, error: err.message });
        return null;
      }
    },
    toPortableText: htmlToPortableText,
    options: { dryRun: DRY_RUN, skipImages: SKIP_IMAGES, verbose: VERBOSE },
  };

  for (const wpPage of pages) {
    const slug = wpPage.slug;
    const title = wpPage.title?.rendered ?? wpPage.title?.raw ?? slug;
    const rawContent = wpPage.content?.raw ?? wpPage.content?.rendered ?? '';
    console.log(`\n🧩 ${slug} — ${title}`);

    let blocks;
    try {
      blocks = parseBlocks(rawContent);
    } catch (err) {
      report.errors.push({ kind: 'block_parse_failed', slug, error: err.message });
      console.error(`   ❌ Block parse failed: ${err.message}`);
      continue;
    }

    const sections = [];
    for (const block of blocks) {
      recordBlock(block.name, false); // optimistic; mark handled below
      try {
        const result = await mapBlockToSection(block, uploadCtx);
        if (result === null) continue; // intentionally skipped (e.g., spacer)
        const arr = Array.isArray(result) ? result : [result];
        sections.push(...arr);
        // Mark as handled (decrement unmapped, keep blockCount)
        if (report.unmappedBlocks[block.name]) {
          report.unmappedBlocks[block.name] -= 1;
          if (report.unmappedBlocks[block.name] <= 0) delete report.unmappedBlocks[block.name];
        }
      } catch (err) {
        report.errors.push({
          kind: 'block_map_failed',
          slug,
          block: block.name,
          error: err.message,
        });
      }
    }

    const doc = {
      _id: `drafts.page-${slug}`,
      _type: 'page',
      slug: { _type: 'slug', current: slug },
      title,
      sections,
      sourceUrl: wpPage.link,
      migratedAt: new Date().toISOString(),
    };

    if (DRY_RUN) {
      console.log(`   ↳ would write ${sections.length} sections (dry-run)`);
    } else {
      try {
        await sanity.createOrReplace(doc);
        console.log(`   ↳ wrote drafts.page-${slug} (${sections.length} sections)`);
      } catch (err) {
        report.errors.push({ kind: 'sanity_write_failed', slug, error: err.message });
        console.error(`   ❌ Sanity write failed: ${err.message}`);
      }
    }

    report.pages.push({ slug, title, sectionCount: sections.length });
  }

  // ---------- Write report ----------
  report.finishedAt = new Date().toISOString();
  const reportPath = path.join(__dirname, 'migration-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📊 Migration report written to ${path.relative(process.cwd(), reportPath)}`);
  console.log(`   ${report.pages.length} pages, ${report.imagesUploaded} images, ${report.errors.length} errors`);
  if (Object.keys(report.unmappedBlocks).length > 0) {
    console.log(`\n⚠️  Unmapped block types (add mappers to handle these):`);
    Object.entries(report.unmappedBlocks)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => console.log(`     ${count.toString().padStart(4)}  ${name}`));
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err);
  process.exit(1);
});
