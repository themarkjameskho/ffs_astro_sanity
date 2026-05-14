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

async function testQuery() {
  const data = await client.fetch(DASHBOARD_QUERY);
  
  console.log(`Total documents returned: ${data.documentsWithSlugs.length}\n`);
  
  // Check for duplicates in the response
  const slugMap = new Map();
  data.documentsWithSlugs.forEach((doc) => {
    const entries = slugMap.get(doc.slug) ?? [];
    entries.push({ _id: doc._id, _type: doc._type, title: doc.title });
    slugMap.set(doc.slug, entries);
  });
  
  const duplicates = Array.from(slugMap.entries())
    .filter(([, docs]) => docs.length > 1)
    .map(([slug, documents]) => ({ slug, documents }));
  
  console.log(`Duplicate slug groups found: ${duplicates.length}\n`);
  
  duplicates.slice(0, 5).forEach(({ slug, documents }) => {
    console.log(`"${slug}" - ${documents.length} documents:`);
    documents.forEach((doc) => {
      console.log(`  • ${doc.title} (${doc._id})`);
    });
    console.log();
  });
}

testQuery();
