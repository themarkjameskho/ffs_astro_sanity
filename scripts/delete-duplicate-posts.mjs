import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function findAndDeleteDuplicates() {
  // Get all blog posts with slugs
  const posts = await client.fetch(
    '*[_type == "blogPost" && defined(slug.current)] { _id, title, "slug": slug.current } | order(slug asc)'
  );

  console.log(`Total blog posts: ${posts.length}\n`);

  // Find duplicates by slug
  const slugMap = {};
  posts.forEach((p) => {
    const slug = p.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    if (!slugMap[slug]) slugMap[slug] = [];
    slugMap[slug].push(p);
  });

  // Find duplicate groups
  const duplicates = [];
  Object.entries(slugMap).forEach(([slug, items]) => {
    if (items.length > 1) {
      console.log(`❌ "${slug}" - ${items.length} posts:`);
      items.forEach((item, idx) => {
        console.log(`   ${idx === 0 ? '✓ KEEP' : '✗ DELETE'}: ${item.title} (${item._id})`);
      });
      duplicates.push(items.slice(1)); // Keep first, delete rest
      console.log();
    }
  });

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log(`\n⚠️  Found ${duplicates.length} duplicate groups\n`);

  // Flatten array and collect IDs to delete
  const idsToDelete = duplicates.flat().map((item) => item._id);
  console.log(`IDs to delete (${idsToDelete.length}):`);
  idsToDelete.forEach((id) => console.log(`  - ${id}`));

  // Ask for confirmation and delete
  console.log(`\n🗑️  Deleting ${idsToDelete.length} duplicate posts...`);

  try {
    const mutations = idsToDelete.map((id) => ({
      delete: { id }
    }));

    const result = await client.transaction(mutations).commit();
    console.log(`\n✅ Successfully deleted ${result.length} duplicate posts!`);
  } catch (error) {
    console.error('❌ Error deleting duplicates:', error.message);
    process.exit(1);
  }
}

findAndDeleteDuplicates();
