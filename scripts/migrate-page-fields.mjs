import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: './studio/.env.local' });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
});

async function migratePageFields() {
  try {
    console.log('Fetching all pages...');
    
    const pages = await client.fetch(`*[_type == "page"]`);
    console.log(`Found ${pages.length} pages to migrate`);

    for (const page of pages) {
      const updates = {
        _id: page._id,
        _type: 'page',
      };

      // Migrate top-level fields to pageInfo
      if (page.title || page.slug || page.pageType) {
        updates.pageInfo = {
          title: page.title,
          slug: page.slug,
          pageType: page.pageType,
        };
      }

      // Migrate seo to seoInfo
      if (page.seo) {
        updates.seoInfo = {
          seoTitle: page.seo.seoTitle,
          seoDescription: page.seo.seoDescription,
          canonicalUrl: page.seo.canonicalUrl,
          ogImage: page.seo.ogImage,
        };
      }

      // Keep sections as-is
      if (page.sections) {
        updates.sections = page.sections;
      }

      // Remove old fields
      const unset = [];
      if (page.title) unset.push('title');
      if (page.slug) unset.push('slug');
      if (page.pageType) unset.push('pageType');
      if (page.seo) unset.push('seo');

      try {
        // Patch the document
        await client
          .patch(page._id)
          .set(updates)
          .unset(unset)
          .commit();
        
        console.log(`✓ Migrated page: ${page.title || page._id}`);
      } catch (error) {
        console.error(`✗ Error migrating page ${page._id}:`, error.message);
      }
    }

    console.log('\n✓ Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePageFields();
