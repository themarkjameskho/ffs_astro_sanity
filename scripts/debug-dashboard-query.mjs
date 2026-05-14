import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false
});

const DASHBOARD_QUERY = `{
  "documentsWithSlugs": *[_type in ["page","blogPost"] && defined(slug.current)]{
    _id,
    _type,
    title,
    "slug": slug.current
  }
}`;

async function debugDashboardQuery() {
  const data = await client.fetch(DASHBOARD_QUERY);
  
  console.log(`Total documents: ${data.documentsWithSlugs.length}\n`);
  
  // Check for duplicates with the EXACT same logic as the widget
  const slugMap = new Map();
  data.documentsWithSlugs.forEach((doc) => {
    if (!doc.slug) {
      console.log(`⚠️  Document without slug: ${doc.title} (${doc._id})`);
      return;
    }
    // Widget's normalization logic
    const normalizedSlug = doc.slug.toLowerCase().replace(/^\/+|\/+$/g, '');
    const entries = slugMap.get(normalizedSlug) ?? [];
    entries.push({ _id: doc._id, _type: doc._type, title: doc.title });
    slugMap.set(normalizedSlug, entries);
  });

  const groups = Array.from(slugMap.entries())
    .filter(([, docs]) => docs.length > 1)
    .map(([slug, documents]) => ({ slug, documents }))
    .sort((a, b) => b.documents.length - a.documents.length);

  console.log(`Duplicate slug groups: ${groups.length}\n`);
  
  groups.slice(0, 5).forEach(({ slug, documents }) => {
    console.log(`"${slug}" - ${documents.length} documents:`);
    documents.forEach((doc) => {
      console.log(`  • [${doc._type}] ${doc.title}`);
      console.log(`    ${doc._id}`);
    });
    console.log();
  });
}

debugDashboardQuery();
