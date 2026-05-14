#!/usr/bin/env node
/**
 * Read-only inspection. Run before any import to see what's already in
 * the Sanity blogPost collection so we don't accidentally clobber
 * existing edits.
 *
 *   node --env-file=.env scripts/inspect-existing-blog-posts.mjs
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

const query = `*[_type == "blogPost"] | order(publishedAt desc){
  _id,
  _createdAt,
  _updatedAt,
  title,
  "slug": slug.current,
  "hasFeaturedImage": defined(featuredImage.asset),
  "isImported": _id match "imported-post-*",
  "contentBlocks": count(content)
}`;

console.log(`Querying blogPost documents from ${projectId}/${dataset}…\n`);

let docs;
try {
  docs = await client.fetch(query);
} catch (err) {
  console.error('Sanity fetch failed:', err.message ?? err);
  process.exit(1);
}

if (!docs.length) {
  console.log('Result: 0 blogPost documents in Sanity.');
  console.log('→ Safe to run the WP import — it will create all 76 posts from scratch.');
  process.exit(0);
}

const imported = docs.filter((d) => d.isImported);
const manual = docs.filter((d) => !d.isImported);
const withImages = docs.filter((d) => d.hasFeaturedImage);

console.log(`Found ${docs.length} blogPost documents:\n`);
console.log(`  ${imported.length}  with _id starting with "imported-post-" (created by the wp-import script)`);
console.log(`  ${manual.length}  with manually-assigned _id (created in Studio or via another script)`);
console.log(`  ${withImages.length}  have a featured image already attached`);
console.log('');

console.log('First 10 by latest update:');
console.log('  ' + '_id'.padEnd(38) + ' | slug'.padEnd(60) + ' | images? | updated');
console.log('  ' + '-'.repeat(140));
for (const d of docs.slice(0, 10)) {
  const id = (d._id || '').slice(0, 36).padEnd(38);
  const slug = ('/' + (d.slug || '(no slug)')).slice(0, 56).padEnd(60);
  const img = (d.hasFeaturedImage ? '   ✓   ' : '   —   ').padEnd(9);
  console.log(`  ${id}| ${slug}| ${img}| ${d._updatedAt}`);
}

console.log('\nRecommendation:');
if (imported.length === docs.length && manual.length === 0) {
  console.log('  → All docs were created by the wp-import script. Re-running with the');
  console.log('    same XML will overwrite each with current WP content (safe, idempotent).');
} else if (manual.length > 0 && imported.length === 0) {
  console.log('  → All docs were manually created in Studio. The wp-import script will');
  console.log('    create 76 NEW docs alongside them. You will end up with duplicates.');
  console.log('    Either delete the manual docs first OR skip the wp-import.');
} else {
  console.log('  → Mixed origin. Investigate the manually-created docs before importing.');
  console.log('    The imported ones can be safely refreshed; the manual ones risk duplication.');
}
