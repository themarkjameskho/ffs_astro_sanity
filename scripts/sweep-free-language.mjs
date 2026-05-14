#!/usr/bin/env node
/**
 * Bulk sweep promotional "free"-style language from {{BRAND_ABBREV}}'s Sanity content.
 *
 *   # 1. Preview what would change — no writes:
 *   node --env-file=.env scripts/sweep-free-language.mjs --dry-run
 *
 *   # 2. Apply the changes (also patches drafts so Studio stays in sync):
 *   node --env-file=.env scripts/sweep-free-language.mjs --apply
 *
 * What it does:
 *   - Auto-replaces high-confidence compound phrases like
 *       "free quote"          -> "quote"
 *       "free, no-obligation" -> "no-obligation"
 *       "complimentary inspection" -> "inspection"
 *     in every page + blog post (both published and draft).
 *   - Fixes article agreement that results from the removal
 *       "a inspection"  -> "an inspection"
 *   - Reports any remaining standalone "free" / "complimentary" / etc.
 *     that need human judgement (NOT auto-replaced) so editors can decide
 *     in Studio.
 *
 * Safety:
 *   - Dry-run by default. Refuses to write unless --apply is passed.
 *   - Per-doc patches are atomic with optimistic concurrency control
 *     (ifRevisionId) so a concurrent edit in Studio won't be silently
 *     clobbered — the patch fails and the script tells you which doc.
 *   - Only touches string fields. Never modifies _id, _type, slug, refs,
 *     image assets, dates, or any structural data.
 */
import { createClient } from '@sanity/client';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const DRY_RUN = !APPLY;

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

// =============================================================================
// 1) AUTO-REPLACEMENT RULES (article-aware, case-aware)
// =============================================================================
// Each rule handles its own article agreement when an "a" / "A" / "an" / "An"
// precedes the matched phrase. Service words are split into two groups:
//   - VOWEL_SOUND_WORDS: take "an" (estimate, inspection, assessment, advice)
//   - CONSONANT_SOUND_WORDS: take "a"  (quote, consultation, service, trial)
// Rules are applied in order. Earlier rules can consume text that later rules
// would also match.

// Helper: rewrite the leading article so it matches the replacement word's
// initial sound. Preserves the leading article's case ("A" → "An", "a" → "an").
function articleFor(art, useAn) {
  if (art === 'A') return useAn ? 'An' : 'A';
  return useAn ? 'an' : 'a';
}

// Per client (Cliff Poindexter, 2026-05-12):
//   {{BRAND_ABBREV}} OFFERS for free:  Consultation (phone), Estimate, Quote
//   {{BRAND_ABBREV}} DOES NOT offer free:  Inspection  (the in-home visit)
//
// So the sweep is narrow: only remove "free" / "complimentary" when the
// service word is "inspection". Everything else stays.
const AUTO_REPLACEMENTS = [
  // 1. "a/A FREE inspection" → "an/An inspection" (preserve word case)
  [/\b([Aa])(\s+)(?:FREE|Free|free)\s+(inspection|inspections|Inspection|Inspections)\b/g,
    (_, art, ws, word) => `${articleFor(art, true)}${ws}${word}`],

  // 2. Standalone "FREE inspection" — no preceding article. Drop FREE.
  [/\b(?:FREE|Free|free)\s+(inspection|inspections|Inspection|Inspections)\b/g, '$1'],

  // 3. "a/A Complimentary inspection" → "an/An inspection"
  [/\b([Aa])(\s+)(?:Complimentary|complimentary|COMPLIMENTARY)\s+(inspection|inspections|Inspection|Inspections)\b/g,
    (_, art, ws, word) => `${articleFor(art, true)}${ws}${word}`],

  // 4. Standalone "Complimentary inspection" — no preceding article.
  [/\b(?:Complimentary|complimentary|COMPLIMENTARY)\s+(inspection|inspections|Inspection|Inspections)\b/g, '$1']
];

// No blanket article-fix step. The replacement rules above are article-aware
// per phrase, which avoids flipping legit "a unique" / "a one-X" to "an".
function fixIndefiniteArticles(text) {
  return text;
}

// =============================================================================
// 3) REPORT PATTERNS (NOT auto-replaced — flagged for manual review)
// =============================================================================
// Standalone uses where the right replacement is context-dependent.
const REPORT_PATTERNS = [
  { name: 'free (standalone)',    regex: /\bfree\b/i },
  { name: 'complimentary',        regex: /\bcomplimentary\b/i },
  { name: 'no cost',              regex: /\bno cost\b/i },
  { name: 'no charge',            regex: /\bno charge\b/i }
];

// =============================================================================
// Helpers
// =============================================================================

function applyAutoReplacements(text) {
  if (typeof text !== 'string') return text;
  let out = text;
  for (const [pattern, replacement] of AUTO_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return fixIndefiniteArticles(out);
}

function findReportableMatches(text) {
  if (typeof text !== 'string') return [];
  const hits = [];
  for (const p of REPORT_PATTERNS) {
    const idx = text.search(p.regex);
    if (idx >= 0) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(text.length, idx + 40);
      hits.push({
        patternName: p.name,
        snippet: (start > 0 ? '…' : '') +
                 text.slice(start, end).replace(/\s+/g, ' ').trim() +
                 (end < text.length ? '…' : '')
      });
    }
  }
  return hits;
}

/**
 * Walk a document recursively. Where we hit a string, apply auto-replacements
 * and collect any reportable matches that remain. Returns:
 *   - newDoc: same shape as input but with string transforms applied
 *   - changes: [{ path, before, after }] for every string that changed
 *   - reports: [{ path, snippet, patternName }] for everything still flagged
 */
function transform(doc) {
  const changes = [];
  const reports = [];

  function walk(node, path) {
    if (node == null) return node;

    if (typeof node === 'string') {
      const before = node;
      // Never auto-edit slugs — changing a slug breaks the page's URL and
      // any external link/SEO equity pointing at it. Same for ids/refs.
      const isUntouchablePath =
        path.endsWith('slug.current') ||
        path.includes('slug.current.') ||
        path === '_id' || path === '_rev' || path === '_type' ||
        path.endsWith('._ref') || path.endsWith('._key');
      const after = isUntouchablePath ? before : applyAutoReplacements(before);
      if (before !== after) changes.push({ path, before, after });
      const remaining = findReportableMatches(after);
      for (const r of remaining) reports.push({ path, ...r });
      return after;
    }

    if (Array.isArray(node)) {
      return node.map((child, i) => walk(child, `${path}[${i}]`));
    }

    if (typeof node === 'object') {
      const result = {};
      for (const [k, v] of Object.entries(node)) {
        // Pass system fields (_id, _type, _rev, _key, etc.) through unchanged.
        if (k.startsWith('_')) {
          result[k] = v;
          continue;
        }
        result[k] = walk(v, path ? `${path}.${k}` : k);
      }
      return result;
    }

    return node;
  }

  const newDoc = walk(doc, '');
  return { newDoc, changes, reports };
}

// =============================================================================
// Run
// =============================================================================

console.log(`\n${DRY_RUN ? '🔍 DRY-RUN' : '✏️  APPLY'} mode — ${projectId}/${dataset}\n`);

const query = `*[_type in ["page", "blogPost"]]{ ... }`;
let docs;
try {
  docs = await client.fetch(query);
} catch (err) {
  console.error('Sanity fetch failed:', err.message ?? err);
  process.exit(1);
}

console.log(`Loaded ${docs.length} document(s) (published + drafts).\n`);

let totalDocsChanged = 0;
let totalReplacements = 0;
let totalReportsRemaining = 0;
const failures = [];

for (const doc of docs) {
  const { newDoc, changes, reports } = transform(doc);
  if (changes.length === 0 && reports.length === 0) continue;

  const slug = doc.slug?.current ?? '(no slug)';
  const heading = `${doc._type.toUpperCase()} · ${doc.title ?? '(no title)'} · ${slug}`;
  console.log('\n' + '─'.repeat(96));
  console.log(`📄 ${heading}`);
  console.log(`   _id: ${doc._id}`);

  if (changes.length > 0) {
    totalDocsChanged += 1;
    totalReplacements += changes.length;
    console.log(`   ${changes.length} auto-replacement(s):`);
    for (const c of changes) {
      console.log(`     • ${c.path}`);
      console.log(`         - ${JSON.stringify(c.before).slice(0, 140)}`);
      console.log(`         + ${JSON.stringify(c.after).slice(0, 140)}`);
    }
  }

  if (reports.length > 0) {
    totalReportsRemaining += reports.length;
    console.log(`   ${reports.length} remaining match(es) — review manually in Studio:`);
    for (const r of reports) {
      console.log(`     ⚠️  [${r.patternName}] at ${r.path || '(root)'}`);
      console.log(`         "${r.snippet}"`);
    }
  }

  if (APPLY && changes.length > 0) {
    try {
      const result = await client
        .patch(doc._id)
        .ifRevisionId(doc._rev)
        .set(newDoc)
        .commit({ visibility: 'async' });
      console.log(`   ✅ Patched (new _rev: ${result._rev})`);
    } catch (err) {
      const reason = err.message ?? String(err);
      failures.push({ id: doc._id, reason });
      console.log(`   ❌ Patch FAILED: ${reason}`);
    }
  }
}

console.log('\n' + '═'.repeat(96));
console.log(`Summary:`);
console.log(`  docs with auto-replacements:   ${totalDocsChanged}`);
console.log(`  total auto-replacements:       ${totalReplacements}`);
console.log(`  remaining manual-review hits:  ${totalReportsRemaining}`);

if (DRY_RUN) {
  if (totalReplacements > 0) {
    console.log(`\n🔍 This was a dry-run. Re-run with --apply to actually write changes:`);
    console.log(`   node --env-file=.env scripts/sweep-free-language.mjs --apply`);
  }
} else {
  console.log(`  patch failures:                ${failures.length}`);
  if (failures.length > 0) {
    console.log('\n❌ Some patches failed — likely because the doc was edited in Studio');
    console.log('   while this script was running. Re-run the script to retry.');
    failures.forEach((f) => console.log(`   • ${f.id}: ${f.reason}`));
    process.exit(1);
  }
}

if (totalReportsRemaining > 0) {
  console.log(`\n⚠️  ${totalReportsRemaining} match(es) need human review — auto-replace was too`);
  console.log(`   risky for these (standalone "free", "complimentary", etc.). Open Studio,`);
  console.log(`   navigate to each path printed above, and decide what to do per case.`);
}

console.log('');
