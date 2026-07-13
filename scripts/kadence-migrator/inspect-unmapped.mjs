#!/usr/bin/env node
/**
 * Diagnostic: identify top-level kadence/rowlayout blocks that the current
 * rowlayout.mjs classifier will NOT match against any of its known patterns
 * (hero / info-box-grid / 2-col text+image), causing them to fall through
 * to the recursive default and — in 36 BBBGN cases — produce 0 sections.
 *
 * READ-ONLY. Fetches WP pages via REST API and writes a local JSON report.
 * Never writes to Sanity. Never deploys. Never modifies WP.
 *
 * Usage:
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/kadence-migrator/inspect-unmapped.mjs
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/kadence-migrator/inspect-unmapped.mjs --slug=home
 *
 * Output:
 *   scripts/kadence-migrator/unmapped-rowlayouts.json
 *     - For every top-level rowlayout: { slug, classification, signature, attrs }
 *     - Grouped at the bottom by signature so common patterns surface.
 */
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBlocks } from './lib/parse-blocks.mjs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- CLI ----------
const slugArg = process.argv.find((a) => a.startsWith('--slug='));
const onlySlug = slugArg ? slugArg.split('=')[1] : null;

// ---------- Env ----------
const WP_SOURCE_URL = process.env.WP_SOURCE_URL;
const WP_REST_USER = process.env.WP_REST_USER;
const WP_REST_APP_PASSWORD = process.env.WP_REST_APP_PASSWORD;
if (!WP_SOURCE_URL || !WP_REST_USER || !WP_REST_APP_PASSWORD) {
  console.error('❌ Missing WP_SOURCE_URL / WP_REST_USER / WP_REST_APP_PASSWORD in .env');
  process.exit(1);
}
const wpAuthHeader =
  'Basic ' + Buffer.from(`${WP_REST_USER}:${WP_REST_APP_PASSWORD}`).toString('base64');

// ---------- Fetch ----------
async function fetchAllPages() {
  const pages = [];
  let page = 1;
  while (true) {
    const url = `${WP_SOURCE_URL.replace(/\/$/, '')}/wp-json/wp/v2/pages?context=edit&per_page=50&page=${page}&_fields=id,slug,title,content`;
    const res = await fetch(url, { headers: { Authorization: wpAuthHeader } });
    if (!res.ok) {
      if (res.status === 400 && page > 1) break;
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

// ---------- Classifier (mirrors rowlayout.mjs, no side effects) ----------
function classifyRowlayout(block) {
  const inner = block.innerBlocks ?? [];
  const childTypes = inner.flatMap((b) => collectChildTypes(b));
  const bgImage = block.attrs?.bgImg ?? block.attrs?.overlayImage?.url ?? null;

  const hasHeading =
    childTypes.includes('kadence/advancedheading') || childTypes.includes('core/heading');
  const hasButton = childTypes.includes('kadence/advancedbtn');
  if (bgImage && hasHeading && hasButton) return 'hero';

  const columns = inner.filter((b) => b.name === 'kadence/column');
  const infoBoxes = columns
    .map((c) => c.innerBlocks?.find((b) => b.name === 'kadence/info-box'))
    .filter(Boolean);
  if (infoBoxes.length >= 2 && infoBoxes.length === columns.length) return 'iconGrid';

  if (columns.length === 2) {
    const imageColIdx = columns.findIndex((c) =>
      (c.innerBlocks ?? []).some((b) => b.name === 'core/image' || b.name === 'kadence/image'),
    );
    const textColIdx = columns.findIndex((c) =>
      (c.innerBlocks ?? []).some(
        (b) => b.name !== 'core/image' && b.name !== 'kadence/image',
      ),
    );
    if (imageColIdx >= 0 && textColIdx >= 0 && imageColIdx !== textColIdx) return 'twoColTextImage';
  }

  return 'default-fallthrough';
}

function collectChildTypes(block) {
  const types = [block.name];
  for (const child of block.innerBlocks ?? []) types.push(...collectChildTypes(child));
  return types;
}

// ---------- Signature ----------
function signatureOf(block) {
  // Compact human-readable shape: e.g. "row[col(heading,paragraph,advancedbtn) col(image)]"
  const inner = block.innerBlocks ?? [];
  const parts = inner.map((b) => {
    if (b.name === 'kadence/column') {
      const kids = (b.innerBlocks ?? []).map((k) => k.name.replace(/^(kadence|core)\//, '')).join(',');
      return `col(${kids || '∅'})`;
    }
    return b.name.replace(/^(kadence|core)\//, '');
  });
  return `row[${parts.join(' ')}]`;
}

function attrsSummary(block) {
  const a = block.attrs ?? {};
  return {
    bgImg: a.bgImg ?? a.overlayImage?.url ?? null,
    bgColor: a.bgColor ?? null,
    columns: a.columns ?? null,
    inheritMaxWidth: a.inheritMaxWidth ?? null,
    minHeight: a.minHeight ?? null,
    paddingDesktop: a.paddingDesktop ?? null,
    htmlAnchor: a.anchor ?? null,
  };
}

function childPreview(block, depth = 0, maxDepth = 3) {
  // Shallow tree preview so we can see what's inside columns
  if (depth >= maxDepth) return { name: block.name, truncated: true };
  return {
    name: block.name,
    innerBlocks: (block.innerBlocks ?? []).map((c) => childPreview(c, depth + 1, maxDepth)),
    innerHTMLPreview: (block.innerHTML ?? '').slice(0, 120).replace(/\s+/g, ' '),
  };
}

// ---------- Main ----------
async function main() {
  console.log(`📥 Fetching pages from ${WP_SOURCE_URL}…`);
  const allPages = await fetchAllPages();
  const pages = onlySlug ? allPages.filter((p) => p.slug === onlySlug) : allPages;
  console.log(`   ${pages.length} pages.\n`);

  const rows = []; // every top-level rowlayout, classified
  for (const wpPage of pages) {
    const slug = wpPage.slug;
    const rawContent = wpPage.content?.raw ?? wpPage.content?.rendered ?? '';
    const blocks = parseBlocks(rawContent);
    for (const block of blocks) {
      if (block.name !== 'kadence/rowlayout') continue;
      const classification = classifyRowlayout(block);
      rows.push({
        slug,
        classification,
        signature: signatureOf(block),
        attrs: attrsSummary(block),
        ...(classification === 'default-fallthrough'
          ? { preview: childPreview(block) }
          : {}),
      });
    }
  }

  // Totals
  const byClass = rows.reduce((acc, r) => {
    acc[r.classification] = (acc[r.classification] ?? 0) + 1;
    return acc;
  }, {});

  // Group fallthroughs by signature so common patterns surface
  const fallthroughs = rows.filter((r) => r.classification === 'default-fallthrough');
  const bySignature = {};
  for (const r of fallthroughs) {
    if (!bySignature[r.signature]) bySignature[r.signature] = [];
    bySignature[r.signature].push({ slug: r.slug, attrs: r.attrs });
  }
  const groupedSignatures = Object.entries(bySignature)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([signature, occurrences]) => ({
      signature,
      count: occurrences.length,
      examples: occurrences.slice(0, 5),
    }));

  const report = {
    generatedAt: new Date().toISOString(),
    source: WP_SOURCE_URL,
    totalRowlayouts: rows.length,
    classificationBreakdown: byClass,
    fallthroughGroupedBySignature: groupedSignatures,
    fallthroughDetails: fallthroughs,
  };

  const out = path.join(__dirname, 'unmapped-rowlayouts.json');
  await fs.writeFile(out, JSON.stringify(report, null, 2));

  console.log(`Top-level rowlayouts: ${rows.length}`);
  console.log(`Classification breakdown:`);
  Object.entries(byClass)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));
  console.log(`\nFallthroughs grouped by signature (top 10):`);
  groupedSignatures.slice(0, 10).forEach((g) => {
    console.log(`  ${String(g.count).padStart(3)}×  ${g.signature}`);
    console.log(`        e.g. ${g.examples.map((e) => e.slug).join(', ')}`);
  });
  console.log(`\n📄 Full report: ${path.relative(process.cwd(), out)}`);
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err);
  process.exit(1);
});
