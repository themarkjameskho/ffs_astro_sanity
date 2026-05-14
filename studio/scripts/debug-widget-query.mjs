import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '84xx7zeu',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-01',
  token: process.env.SANITY_API_TOKEN
})

// Exact query from the widget
const query = `{
  "documentsWithSlugs": *[_type in ["page","blogPost"] && defined(slug.current)]{
    _id,
    _type,
    title,
    "slug": slug.current
  }
}`

try {
  console.log('Fetching documentsWithSlugs from widget query...\n')
  const result = await client.fetch(query)
  const docs = result.documentsWithSlugs
  
  console.log(`Total documents with slugs: ${docs.length}\n`)
  
  // Print first 20 to see what we're getting
  docs.slice(0, 20).forEach(doc => {
    console.log(`${doc.title} (${doc._type}) - ${doc._id} - slug: ${doc.slug}`)
  })
  
  // Now simulate the widget's deduplication logic
  console.log('\n--- Simulating widget deduplication logic ---\n')
  
  // First, deduplicate by _id and exclude drafts
  const uniqueDocsMap = new Map()
  docs.forEach((doc) => {
    // Skip drafts
    if (doc._id?.startsWith('draft.')) {
      console.log(`Skipping draft: ${doc.title}`)
      return
    }
    if (!doc._id || !doc.slug) return
    if (!uniqueDocsMap.has(doc._id)) {
      uniqueDocsMap.set(doc._id, doc)
    }
  })
  
  console.log(`\nAfter deduplication by _id and draft filtering: ${uniqueDocsMap.size} docs\n`)
  
  // Now check for duplicate slugs
  const slugMap = new Map()
  uniqueDocsMap.forEach((doc) => {
    if (!doc.slug) return
    
    // Normalize slug
    const normalizedSlug = doc.slug
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .replace(/\/+/g, '/')
    
    const entries = slugMap.get(normalizedSlug) ?? []
    entries.push({ _id: doc._id, _type: doc._type, title: doc.title })
    slugMap.set(normalizedSlug, entries)
  })
  
  // Only show actual duplicates (2+ entries)
  const groups = Array.from(slugMap.entries())
    .filter(([, docs]) => docs.length > 1)
    .map(([slug, documents]) => ({ slug, documents }))
    .sort((a, b) => b.documents.length - a.documents.length)
  
  console.log(`Found ${groups.length} duplicate slug groups:\n`)
  groups.forEach(group => {
    console.log(`  /${group.slug}:`)
    group.documents.forEach(doc => {
      console.log(`    - ${doc.title} (${doc._type}) [${doc._id}]`)
    })
  })
  
} catch (err) {
  console.error('Error:', err.message)
}
