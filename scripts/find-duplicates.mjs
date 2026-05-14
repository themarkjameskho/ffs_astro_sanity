import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false
});

async function findDuplicates() {
  const pages = await client.fetch(
    '*[_type == "page" && pageType == "bed-bug-treatment"] { _id, title, slug, _updatedAt } | order(title asc)'
  );

  console.log('All bed-bug-treatment pages:\n');
  pages.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title}`);
    console.log(`   ID: ${p._id}`);
    console.log(`   Slug: ${p.slug?.current || '(none)'}`);
    console.log(`   Updated: ${new Date(p._updatedAt).toLocaleString()}`);
    console.log();
  });

  // Find exact duplicates
  const titleMap = {};
  pages.forEach((p) => {
    if (!titleMap[p.title]) titleMap[p.title] = [];
    titleMap[p.title].push(p._id);
  });

  console.log('\n=== DUPLICATES ===\n');
  let duplicateCount = 0;
  Object.entries(titleMap).forEach(([title, ids]) => {
    if (ids.length > 1) {
      console.log(`❌ "${title}": ${ids.length} pages`);
      ids.forEach((id) => console.log(`   - ${id}`));
      duplicateCount += ids.length - 1; // Count extras
      console.log();
    }
  });

  if (duplicateCount === 0) {
    console.log('✅ No duplicates found');
  } else {
    console.log(`\n⚠️  Total duplicate pages to delete: ${duplicateCount}`);
  }
}

findDuplicates();
