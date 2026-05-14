import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset) {
  throw new Error('Missing SANITY_PROJECT_ID or SANITY_DATASET in environment.');
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  token,
  useCdn: false
});

const folder = path.resolve('./public/heat_tech_content_json');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith('.json')) {
      return [fullPath];
    }
    return [];
  });
}

function slugFromFilename(filePath) {
  const relative = path.relative(folder, filePath).replace(/\\/g, '/');
  const withoutExt = relative.replace(/\.json$/, '');
  const parts = withoutExt
    .split('/')
    .map((segment) =>
      segment
        .replace(/^{{fork_source_slug}}_/, '')
        .replace(/_json$/, '')
        .replace(/_/g, '-')
    );
  return parts.join('/');
}

const processedFile = path.resolve('./scripts/.last-import.json');

function hasFileChanged(filePath) {
  if (!fs.existsSync(processedFile)) return true;
  const cache = JSON.parse(fs.readFileSync(processedFile, 'utf-8'));
  const lastHash = cache[filePath];
  const current = fs.statSync(filePath).mtimeMs;
  return lastHash !== current;
}

function rememberFile(filePath) {
  let cache = {};
  if (fs.existsSync(processedFile)) {
    cache = JSON.parse(fs.readFileSync(processedFile, 'utf-8'));
  }
  cache[filePath] = fs.statSync(filePath).mtimeMs;
  fs.writeFileSync(processedFile, JSON.stringify(cache, null, 2));
}

async function importFile(filePath) {
  if (!hasFileChanged(filePath)) {
    console.log(`Skipped (unchanged) ${filePath}`);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const content = JSON.parse(raw);
  const page = content.page;
  const slug = page.slug?.current ?? slugFromFilename(filePath);
  const docId = `page-${slug.replace(/\//g, '-')}`;

  await client.createOrReplace({
    _id: docId,
    _type: 'page',
    title: page.title,
    pageType: page.pageType,
    slug: { _type: 'slug', current: slug },
    sections: page.sections,
    seo: page.seo ?? { seoTitle: page.title, seoDescription: page.description ?? '' }
  });

  rememberFile(filePath);
  console.log(`Imported page ${slug}`);
}

async function run() {
  const files = walk(folder);
  for (const file of files) {
    await importFile(file);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
