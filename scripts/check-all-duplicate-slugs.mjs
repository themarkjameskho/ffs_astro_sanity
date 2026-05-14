import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false
});

async function checkAllDuplicateSlugs() {
  const docs = await client.fetch(
    '*[_type in ["page","blogPost"] && defined(slug.current)] { _id, _type, title, "slug": slug.current } | order(slug asc)'
  );

  console.log('Checking pages AND blog posts for duplicate slugs...\n');
  
  const slugMap = {};
  docs.forEach((d) => {
    if (!slugMap[d.slug]) slugMap[d.slug] = [];
    slugMap[d.slug].push(d);
  });

  let duplicateCount = 0;
  const duplicates = [];
  
  Object.entries(slugMap).forEach(([slug, items]) => {
    if (items.length > 1) {
      console.log(`❌ "/${slug}" - ${items.length} documents:`);
      items.forEach((item) => {
        console.log(`   • ${item.title} (${item._type})`);
      });
      duplicateCount++;
      duplicates.push({ slug, items });
      console.log();
    }
  });

  if (duplicateCount === 0) {
    console.log('✅ No duplicate slugs found');
  } else {
    console.log(`\n⚠️  Total duplicate slug groups: ${duplicateCount}`);
    console.log(`Total duplicate documents: ${docs.length - Object.keys(slugMap).length}`);
  }
}

checkAllDuplicateSlugs();
