import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '84xx7zeu',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-01',
  token: process.env.SANITY_API_TOKEN
})

// Check for duplicate slugs across all pages
const query = `*[_type == "page" && defined(slug)] {
  _id,
  title,
  slug,
  pageType
} | order(slug.current)`

try {
  console.log('Fetching all pages with slugs...\n')
  const pages = await client.fetch(query)
  
  console.log(`Total pages: ${pages.length}\n`)
  
  // Group by slug
  const slugMap = new Map()
  pages.forEach(page => {
    if (!page.slug || !page.slug.current) return
    
    const normalizedSlug = page.slug.current
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .replace(/\/+/g, '/')
    
    if (!slugMap.has(normalizedSlug)) {
      slugMap.set(normalizedSlug, [])
    }
    slugMap.get(normalizedSlug).push(page)
  })
  
  // Find duplicates
  const duplicates = Array.from(slugMap.entries()).filter(([, docs]) => docs.length > 1)
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicate slugs found in database')
  } else {
    console.log(`❌ Found ${duplicates.length} duplicate slug groups:\n`)
    duplicates.forEach(([slug, docs]) => {
      console.log(`  /${slug}:`)
      docs.forEach(doc => {
        console.log(`    - ${doc.title} (${doc._id})`)
      })
      console.log()
    })
  }
} catch (err) {
  console.error('Error:', err.message)
}
