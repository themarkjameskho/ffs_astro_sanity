import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false
});

async function findCrossDuplicates() {
  const docs = await client.fetch(
    '*[_type in ["page","blogPost"] && defined(slug.current)] { _id, _type, title, "slug": slug.current } | order(slug asc)'
  );

  console.log('Checking for duplicate slugs across pages AND blog posts...\n');
  
  const slugMap = {};
  docs.forEach((d) => {
    // Normalize slug: remove leading/trailing slashes
    const normalizedSlug = d.slug.toLowerCase().replace(/^\/+|\/+$/g, '');
    if (!slugMap[normalizedSlug]) slugMap[normalizedSlug] = [];
    slugMap[normalizedSlug].push(d);
  });

  let duplicateCount = 0;
  
  Object.entries(slugMap).forEach(([slug, items]) => {
    if (items.length > 1) {
      console.log(`❌ "${slug}" - ${items.length} documents:`);
      items.forEach((item) => {
        console.log(`   • [${item._type}] ${item.title}`);
        console.log(`     ID: ${item._id}`);
      });
      duplicateCount++;
      console.log();
    }
  });

  if (duplicateCount === 0) {
    console.log('✅ No duplicate slugs found');
  } else {
    console.log(`\n⚠️  Total duplicate slug groups: ${duplicateCount}`);
  }
}

findCrossDuplicates();
