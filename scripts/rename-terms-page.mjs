#!/usr/bin/env node
/**
 * Rename the {{BRAND_ABBREV}} "Terms of Use" page document so its URL matches the
 * original live site at {{SITE_URL}}/terms-of-service/.
 *
 *   - Sets slug.current = "terms-of-service"
 *   - Sets title         = "Terms of Service" (only when current title is
 *                          one of the legacy variants — never blindly
 *                          overwrites custom titles)
 *
 * Idempotent: if the doc is already at terms-of-service, it does nothing.
 *
 * Usage (from the project root):
 *
 *   # 1. Preview what would change — no writes:
 *   node --env-file=.env scripts/rename-terms-page.mjs --dry-run
 *
 *   # 2. Once preview looks correct, run it for real:
 *   node --env-file=.env scripts/rename-terms-page.mjs
 *
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN in .env.
 * The token needs Editor permission (the read-write token already in .env
 * does).
 */
import { createClient } from '@sanity/client';

const DRY_RUN = process.argv.includes('--dry-run');

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_API_TOKEN in env.');
  console.error('Run with: node --env-file=.env scripts/rename-terms-page.mjs');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-05-01',
  useCdn: false,
  token
});

// Look for any document still on a legacy terms slug. We deliberately
// include `terms-of-service` so the script is idempotent — if the rename
// already happened, we'll just report it and exit cleanly.
const query = `*[_type == "page" && slug.current in [
  "terms-of-use",
  "terms-of-service",
  "terms-and-conditions"
]]{
  _id,
  _rev,
  _type,
  _updatedAt,
  title,
  "slug": slug.current,
  pageType
}`;

console.log(`\nFetching terms-style page docs from ${projectId}/${dataset}…\n`);

let docs;
try {
  docs = await client.fetch(query);
} catch (err) {
  console.error('Sanity fetch failed:', err.message ?? err);
  process.exit(1);
}

if (!docs.length) {
  console.log('No terms-style page found. Nothing to do.');
  process.exit(0);
}

console.log(`Found ${docs.length} candidate doc(s):\n`);
docs.forEach((d) => {
  console.log(`  _id:        ${d._id}`);
  console.log(`  title:      ${d.title ?? '(no title)'}`);
  console.log(`  slug:       ${d.slug}`);
  console.log(`  pageType:   ${d.pageType ?? '(none)'}`);
  console.log(`  updatedAt:  ${d._updatedAt}`);
  console.log('');
});

// Pick the doc we actually want to rename. Prefer terms-of-use; if it's
// already terms-of-service we'll just confirm and exit; refuse to touch
// terms-and-conditions silently (different legal doc, different content).
const target = docs.find((d) => d.slug === 'terms-of-use')
  ?? docs.find((d) => d.slug === 'terms-of-service');

if (!target) {
  console.log('Found terms-style docs but none with slug `terms-of-use` or `terms-of-service`.');
  console.log('Refusing to auto-rename `terms-and-conditions` — please review manually.');
  process.exit(0);
}

if (target.slug === 'terms-of-service' && target.title === 'Terms of Service') {
  console.log('Doc is already at slug=terms-of-service and title="Terms of Service". Nothing to do.');
  process.exit(0);
}

const newTitle =
  target.title && /^terms of (use|service|and conditions)$/i.test(target.title.trim())
    ? 'Terms of Service'
    : target.title;

const patch = {
  set: {
    'slug.current': 'terms-of-service',
    title: newTitle
  }
};

console.log('Planned patch on doc', target._id, ':');
console.log(`  slug.current  "${target.slug}"  →  "terms-of-service"`);
console.log(`  title         "${target.title ?? '(none)'}"  →  "${newTitle ?? '(unchanged)'}"`);

if (DRY_RUN) {
  console.log('\n--dry-run set — no write made. Re-run without --dry-run to apply.');
  process.exit(0);
}

console.log('\nApplying patch…');
try {
  const result = await client
    .patch(target._id)
    .set(patch.set)
    .commit({ visibility: 'async' });
  console.log('Patched. New _rev:', result._rev);
} catch (err) {
  console.error('Patch failed:', err.message ?? err);
  process.exit(1);
}

// Also patch the draft, if one exists, so the change is reflected in
// Studio's editor view without forcing the editor to publish a stale draft.
const draftId = target._id.startsWith('drafts.') ? target._id : `drafts.${target._id}`;
try {
  const draft = await client.fetch(`*[_id == $id][0]{ _id, _rev, title, "slug": slug.current }`, { id: draftId });
  if (draft) {
    console.log(`\nDraft found (${draft._id}). Patching it too so Studio stays in sync…`);
    await client
      .patch(draft._id)
      .set(patch.set)
      .commit({ visibility: 'async' });
    console.log('Draft patched.');
  } else {
    console.log('\nNo draft for this doc — published-only state, fine.');
  }
} catch (err) {
  console.error('Draft patch failed (non-fatal):', err.message ?? err);
}

console.log('\nDone. Verify in Studio: /desk/page;' + target._id);
console.log('Then trigger a Sanity webhook (or just edit-and-republish in Studio) so Vercel ISR refreshes the page.');
