#!/usr/bin/env node
/**
 * Scan every Sanity document for embedded references to the slow
 * third-party scripts PageSpeed flagged on {{SITE_DOMAIN}}.
 *
 *   node --env-file=.env scripts/find-third-party-embeds.mjs
 *
 * For each match, prints the doc type, title, slug, the field path
 * where the offending string appears, and a snippet so we can decide
 * what to do (delete, defer, or replace) in Sanity Studio.
 *
 * Read-only. Touches nothing.
 */
import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_API_TOKEN in env.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-11-01',
  useCdn: false,
  token
});

// PageSpeed-flagged offenders, ordered roughly by impact.
const TARGETS = [
  { name: 'Google Reviews widget',     regex: /reviewsonmywebsite\.com/i,  cost: '244ms + 104ms reflow + 29 KiB JS' },
  { name: 'Local Impact badge',        regex: /localimpact\.com/i,         cost: '708 + 955 + 963 ms chain' },
  { name: 'romw-cdn (reviews CDN)',    regex: /romw-cdn\./i,               cost: 'image-heavy reviews CDN' },
  { name: 'New Relic monitoring',      regex: /nr-data\.net/i,             cost: '1,871 ms — longest chain!' },
  { name: 'CallRail external_forms',   regex: /callreports\.com.*external_forms/i, cost: '13 KiB legacy JS' },
  { name: 'cdnjs FontAwesome',         regex: /cdnjs\.cloudflare\.com\/.*font-?awesome/i, cost: 'font-display swap missing' },
  { name: 'cdnjs Swiper',              regex: /cdnjs\.cloudflare\.com\/.*swiper/i,        cost: 'CSS render-block' },
  { name: 'Google Tag Manager',        regex: /googletagmanager\.com\/gtm/i, cost: '64 KiB unused JS' }
];

function findMatches(text) {
  if (typeof text !== 'string' || !text) return [];
  const hits = [];
  for (const t of TARGETS) {
    const m = text.match(t.regex);
    if (m) {
      const i = m.index ?? 0;
      const start = Math.max(0, i - 50);
      const end = Math.min(text.length, i + 80);
      hits.push({
        name: t.name,
        cost: t.cost,
        snippet: (start > 0 ? '…' : '') +
                 text.slice(start, end).replace(/\s+/g, ' ').trim() +
                 (end < text.length ? '…' : '')
      });
    }
  }
  return hits;
}

function walk(node, path, onMatch) {
  if (node == null) return;
  if (typeof node === 'string') {
    for (const h of findMatches(node)) onMatch({ path, ...h });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((c, i) => walk(c, `${path}[${i}]`, onMatch));
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('_')) continue;
      walk(v, path ? `${path}.${k}` : k, onMatch);
    }
  }
}

const query = `*[_type in ["page", "blogPost", "globalSettings"]]{ ... }`;
console.log(`\nScanning ${projectId}/${dataset} for slow third-party embeds…\n`);

let docs;
try {
  docs = await client.fetch(query);
} catch (err) {
  console.error('Sanity fetch failed:', err.message ?? err);
  process.exit(1);
}

console.log(`Loaded ${docs.length} document(s). Scanning…\n`);

let totalDocs = 0;
let totalHits = 0;
const tally = {};

for (const doc of docs) {
  const matches = [];
  walk(doc, '', (m) => matches.push(m));
  if (matches.length === 0) continue;
  totalDocs++;
  totalHits += matches.length;
  const slug = doc.slug?.current ?? '(no slug)';
  console.log('─'.repeat(96));
  console.log(`📄 ${doc._type.toUpperCase()} · ${doc.title ?? '(no title)'} · /${slug}/`);
  console.log(`   _id: ${doc._id}`);
  for (const m of matches) {
    tally[m.name] = (tally[m.name] ?? 0) + 1;
    console.log(`     • [${m.name}] (${m.cost})`);
    console.log(`       at ${m.path || '(root)'}`);
    console.log(`       "${m.snippet}"`);
  }
  console.log('');
}

console.log('═'.repeat(96));
console.log(`\nSummary: ${totalHits} match(es) across ${totalDocs} document(s).\n`);
for (const [name, count] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${count.toString().padStart(3)} × ${name}`);
}
console.log('\nDocuments above are where the slow third-party embeds live.');
console.log('Open Sanity Studio → navigate to each doc → decide: delete, defer, or replace.\n');
