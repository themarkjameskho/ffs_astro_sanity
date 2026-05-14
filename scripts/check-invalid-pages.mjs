import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

const ALLOWED_PAGE_TYPES = [
  'home',
  'pest-control',
  'bed-bug-treatment',
  'service-area',
  'contact',
  'blog',
  'service-detail'
];

async function findInvalidPages() {
  console.log('🔍 Searching for pages with invalid pageType values...\n');

  try {
    // Get ALL pages and check their pageType
    const query = `*[_type == "page"] { _id, title, pageType } | order(title asc)`;
    const pages = await client.fetch(query);

    if (pages.length === 0) {
      console.log('No pages found.');
      return;
    }

    console.log(`📊 Total pages: ${pages.length}\n`);
    console.log('Pages by type:');

    const byType = {};
    pages.forEach((p) => {
      const type = p.pageType || '(undefined)';
      byType[type] = (byType[type] || 0) + 1;
    });

    Object.entries(byType).forEach(([type, count]) => {
      const valid = ALLOWED_PAGE_TYPES.includes(type);
      console.log(`  ${valid ? '✅' : '❌'} "${type}": ${count} page(s)`);
    });

    // Find invalid ones
    const invalid = pages.filter((p) => !ALLOWED_PAGE_TYPES.includes(p.pageType));

    if (invalid.length > 0) {
      console.log(`\n⚠️  Found ${invalid.length} page(s) with invalid pageType:\n`);
      invalid.forEach((p) => {
        console.log(`  • ${p.title} (pageType: "${p.pageType}")`);
      });
    } else {
      console.log('\n✅ All pages have valid pageType values!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findInvalidPages();
