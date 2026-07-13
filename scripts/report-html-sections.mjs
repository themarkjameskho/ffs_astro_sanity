#!/usr/bin/env node
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const failOnAny = process.argv.includes('--fail-on-any');
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.log('Skipping htmlSection report: SANITY_PROJECT_ID or SANITY_API_TOKEN is not configured.');
  process.exit(0);
}

if (!/^[a-z0-9-]+$/.test(projectId) || /\{\{.*\}\}/.test(projectId) || /\{\{.*\}\}/.test(token)) {
  console.log('Skipping htmlSection report: Sanity environment values are still placeholders.');
  process.exit(0);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-05-01',
  token,
  useCdn: false
});

const query = `*[_type == "page" && count(sections[_type == "htmlSection"]) > 0]{
  _id,
  title,
  "slug": slug.current,
  "htmlSections": sections[_type == "htmlSection"]{
    _key,
    title,
    "preview": coalesce(pt::text(htmlContent), htmlContent)[0...140]
  }
} | order(slug asc)`;

const pages = await client.fetch(query);

if (!pages.length) {
  console.log('No pages contain htmlSection blocks.');
  process.exit(0);
}

console.log(`Found ${pages.length} page(s) with htmlSection blocks:\n`);
for (const page of pages) {
  console.log(`- /${page.slug ?? '(missing-slug)'} — ${page.title ?? '(untitled)'}`);
  for (const section of page.htmlSections ?? []) {
    console.log(`  - ${section.title ?? section._key ?? '(untitled htmlSection)'}: ${section.preview ?? ''}`);
  }
}

if (failOnAny) {
  console.error('\nhtmlSection gate failed. Convert these sections or document explicit launch exceptions.');
  process.exit(1);
}
