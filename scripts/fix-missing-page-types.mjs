import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function fixMissingPageTypes() {
  console.log('🔧 Fixing pages with missing pageType...\n');

  try {
    // Get pages with undefined pageType
    const pages = await client.fetch(
      '*[_type == "page" && !defined(pageType)] { _id, title }'
    );

    if (pages.length === 0) {
      console.log('✅ No pages with missing pageType!');
      return;
    }

    console.log(`Found ${pages.length} page(s) with missing pageType:\n`);
    pages.forEach((p) => console.log(`  • ${p.title}`));

    // Assign pageType based on title
    const mutations = pages.map((page) => {
      let pageType = 'pest-control'; // default

      if (
        page.title.toLowerCase().includes('conventional') ||
        page.title.toLowerCase().includes('heat treatment')
      ) {
        pageType = 'bed-bug-treatment';
      }

      console.log(`  → "${page.title}" will be set to: "${pageType}"`);

      return {
        patch: {
          id: page._id,
          set: { pageType }
        }
      };
    });

    console.log('\n⏳ Updating pages...\n');
    const result = await client.transaction(mutations).commit();

    console.log(`✅ Successfully updated ${result.length} page(s)!`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixMissingPageTypes();
