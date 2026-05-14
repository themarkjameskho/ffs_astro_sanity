#!/usr/bin/env node
/**
 * Scan every published Sanity document (page + blogPost) for "free"-style
 * promotional language that {{BRAND_ABBREV}} doesn't want on the live site.
 *
 *   node --env-file=.env scripts/find-free-language.mjs
 *
 * Output: one line per match with doc title, slug, where in the document
 * the phrase lives, and a snippet of surrounding text. Read-only — does
 * not edit anything in Sanity. Use the report to make the edits manually
 * in Studio.
 *
 * Patterns scanned (case-insensitive):
 *   - "free" (whole word, so "freedom" doesn't match)
 *   - "no-obligation" / "no obligation"
 *   - "complimentary"
 *   - "no cost" / "no charge"
 */
import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_API_TOKEN in env.');
  console.error('Run with: node --env-file=.env scripts/find-free-language.mjs');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-11-01',
  useCdn: false,
  token
});

// Match "free" as a whole word so it doesn't false-positive on "freedom",
// "freelance", etc. Other phrases are loose substring matches.
const PATTERNS = [
  { name: 'free',           regex: /\bfree\b/i },
  { name: 'no-obligation',  regex: /no[- ]obligation/i },
  { name: 'complimentary',  regex: /complimentary/i },
  { name: 'no cost',        regex: /\bno cost\b/i },
  { name: 'no charge',      regex: /\bno charge\b/i }
];

function matchAll(text) {
  if (typeof text !== 'string' || !text) return [];
  return PATTERNS.flatMap((p) => {
    const all = [];
    let cursor = 0;
    while (cursor < text.length) {
      const slice = text.slice(cursor);
      const m = slice.match(p.regex);
      if (!m) break;
      all.push({ patternName: p.name, index: cursor + (m.index ?? 0), matched: m[0] });
      cursor += (m.index ?? 0) + m[0].length;
    }
    return all;
  });
}

function snippet(text, index, span = 40) {
  const start = Math.max(0, index - span);
  const end = Math.min(text.length, index + span);
  let s = text.slice(start, end).replace(/\s+/g, ' ').trim();
  if (start > 0) s = '…' + s;
  if (end < text.length) s = s + '…';
  return s;
}

/**
 * Recursively walk any Sanity document/object/array. Whenever we hit a
 * string, scan it. Emit a match record with the JSON-pointer-like field
 * path so the editor can find it in Studio.
 */
function walk(node, path, onMatch) {
  if (node == null) return;
  if (typeof node === 'string') {
    const hits = matchAll(node);
    for (const h of hits) {
      onMatch({ path, snippet: snippet(node, h.index), patternName: h.patternName });
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, `${path}[${i}]`, onMatch));
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      // Skip Sanity system fields — they're metadata, not editable copy.
      if (k.startsWith('_')) continue;
      walk(v, path ? `${path}.${k}` : k, onMatch);
    }
  }
}

const query = `*[_type in ["page", "blogPost"] && !(_id in path("drafts.**"))]{
  _id,
  _type,
  title,
  "slug": slug.current,
  ...
}`;

console.log(`\nScanning ${projectId}/${dataset} for "free"-style language…\n`);

let docs;
try {
  docs = await client.fetch(query);
} catch (err) {
  console.error('Sanity fetch failed:', err.message ?? err);
  process.exit(1);
}

console.log(`Loaded ${docs.length} published docs (page + blogPost). Scanning…\n`);

let totalMatches = 0;
const perDoc = [];

for (const doc of docs) {
  const matches = [];
  walk(doc, '', (m) => matches.push(m));
  if (matches.length > 0) {
    perDoc.push({ doc, matches });
    totalMatches += matches.length;
  }
}

if (totalMatches === 0) {
  console.log('✅ No "free"-style language found in any published page or blog post.');
  process.exit(0);
}

console.log(`Found ${totalMatches} match(es) across ${perDoc.length} document(s).\n`);
console.log('Edit each one in Sanity Studio. Paths show where in the document\n' +
            'the phrase lives — use them to navigate the editor.\n');
console.log('─'.repeat(96));

for (const entry of perDoc) {
  const { doc, matches } = entry;
  const slugDisplay = doc.slug ? `/${doc.slug}/` : '(no slug)';
  console.log(`\n📄 ${doc._type.toUpperCase()} · ${doc.title ?? '(no title)'}`);
  console.log(`   _id:   ${doc._id}`);
  console.log(`   slug:  ${slugDisplay}`);
  console.log(`   ${matches.length} match(es):`);
  for (const m of matches) {
    console.log(`     • [${m.patternName}] at ${m.path || '(root)'}`);
    console.log(`       "${m.snippet}"`);
  }
}

console.log('\n' + '─'.repeat(96));
console.log(`\nTotal: ${totalMatches} match(es) across ${perDoc.length} docs.`);
console.log('Open Sanity Studio (npm run sanity:dev) and edit each one.\n');
