import sanityClient from '@sanity/client';
import 'dotenv/config';

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// Map old page types to new ones
const pageTypeMap = {
  commercialPestControl: 'pest-control',
  heatTreatmentForPests: 'bed-bug-treatment',
  // Add other mappings as needed
};

async function fixPageTypes() {
  console.log('🔍 Finding pages with invalid pageType values...');

  try {
    // Get all pages with old pageType values
    const query = `*[_type == "page" && pageType in [${Object.keys(pageTypeMap)
      .map((k) => `"${k}"`)
      .join(', ')}]] | order(_updatedAt desc)`;

    const pages = await client.fetch(query);

    if (pages.length === 0) {
      console.log('✅ No pages with invalid pageType values found!');
      return;
    }

    console.log(`\n📋 Found ${pages.length} pages to update:\n`);
    pages.forEach((page) => {
      console.log(`  • ${page.title} (${page.pageType} → ${pageTypeMap[page.pageType]})`);
    });

    // Confirm before proceeding
    console.log('\n⚠️  This will update the above pages. Continuing...\n');

    // Update pages in batches
    const mutations = pages.map((page) => ({
      patch: {
        id: page._id,
        set: {
          pageType: pageTypeMap[page.pageType]
        }
      }
    }));

    const result = await client.transaction(mutations).commit();

    console.log(`✅ Successfully updated ${result.length} pages!`);
    console.log('\nUpdated pages:');
    result.forEach((page) => {
      console.log(`  • ${page.title}`);
    });
  } catch (error) {
    console.error('❌ Error updating pages:', error.message);
    process.exit(1);
  }
}

fixPageTypes();
