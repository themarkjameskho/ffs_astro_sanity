import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-05-01',
  useCdn: false
});

async function checkAllVariants() {
  const allPages = await client.fetch(
    '*[_type == "page"] { _id, title, pageType, _rev } | order(title asc)'
  );
  
  const treated = allPages.filter(
    (p) => p.title.includes('Heat') || p.title.includes('Conventional')
  );

  console.log('All Heat/Conventional pages:\n');
  treated.forEach((p) => {
    console.log(`${p.title}`);
    console.log(`  pageType: ${p.pageType}`);
    console.log(`  ID: ${p._id}`);
    console.log();
  });

  console.log(`Total: ${treated.length}`);
}

checkAllVariants();
