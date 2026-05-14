import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false
});

async function listDuplicates() {
  const pages = await client.fetch(
    '*[_type == "page" && pageType == "bed-bug-treatment"] { _id, title, slug, _createdAt, _updatedAt } | order(_updatedAt desc)'
  );

  console.log('Bed Bug Treatment Pages:\n');
  pages.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title}`);
    console.log(`   ID: ${p._id}`);
    console.log(`   Slug: ${p.slug?.current || '(none)'}`);
    console.log(`   Created: ${new Date(p._createdAt).toLocaleDateString()}`);
    console.log(`   Updated: ${new Date(p._updatedAt).toLocaleDateString()}`);
    console.log();
  });

  // Check for duplicates by title
  const byTitle = {};
  pages.forEach((p) => {
    byTitle[p.title] = (byTitle[p.title] || 0) + 1;
  });

  console.log('\nDuplicate titles:');
  Object.entries(byTitle).forEach(([title, count]) => {
    if (count > 1) {
      console.log(`  ❌ "${title}": ${count} pages`);
    }
  });
}

listDuplicates();
