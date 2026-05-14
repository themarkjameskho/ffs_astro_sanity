import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false
});

async function checkAllPages() {
  // Get ALL pages including drafts and check raw data
  const pages = await client.fetch(
    '*[_type == "page"] { _id, title, pageType, slug }'
  );

  console.log('=== ALL PAGES ===\n');
  pages.forEach((p) => {
    console.log(`${p.title}`);
    console.log(`  pageType: ${p.pageType}`);
    console.log(`  ID: ${p._id}`);
    console.log();
  });

  // Find duplicates by exact match
  const byTitle = {};
  pages.forEach((p) => {
    if (!byTitle[p.title]) byTitle[p.title] = [];
    byTitle[p.title].push(p);
  });

  console.log('=== PAGES WITH SAME TITLE ===\n');
  let dupeCount = 0;
  Object.entries(byTitle).forEach(([title, items]) => {
    if (items.length > 1) {
      console.log(`❌ "${title}": ${items.length} pages`);
      items.forEach((item) => {
        console.log(`   - ${item._id} (${item.pageType})`);
      });
      dupeCount += items.length - 1;
      console.log();
    }
  });

  if (dupeCount === 0) {
    console.log('✅ No pages with duplicate titles');
  }
}

checkAllPages();
