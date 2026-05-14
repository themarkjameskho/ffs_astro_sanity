import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false
});

async function findRealDuplicates() {
  const posts = await client.fetch(
    '*[_type == "blogPost" && defined(slug.current)] { _id, title, "slug": slug.current } | order(slug asc)'
  );

  console.log('Checking for duplicate blog posts...\n');
  
  const slugMap = {};
  posts.forEach((p) => {
    // Normalize slug: remove leading/trailing slashes
    const normalizedSlug = p.slug.toLowerCase().replace(/^\/+|\/+$/g, '');
    if (!slugMap[normalizedSlug]) slugMap[normalizedSlug] = [];
    slugMap[normalizedSlug].push(p);
  });

  let duplicateCount = 0;
  const allDuplicates = [];
  
  Object.entries(slugMap).forEach(([slug, items]) => {
    if (items.length > 1) {
      console.log(`❌ "${slug}" - ${items.length} posts:`);
      items.forEach((item) => {
        console.log(`   • ${item.title}`);
        console.log(`     ID: ${item._id}`);
      });
      duplicateCount++;
      allDuplicates.push({ slug, items });
      console.log();
    }
  });

  if (duplicateCount === 0) {
    console.log('✅ No duplicate slugs found');
  } else {
    console.log(`\n⚠️  Total duplicate slug groups: ${duplicateCount}`);
    console.log(`\nTo delete duplicates, use these IDs:`);
    allDuplicates.forEach(({ slug, items }) => {
      // Keep the first one, delete the rest
      items.slice(1).forEach((item) => {
        console.log(`  sanity documents delete ${item._id}`);
      });
    });
  }
}

findRealDuplicates();
