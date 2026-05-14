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
  console.log('Checking for duplicate page slugs...\n')
  const pages = await client.fetch(query)
  
  // Group by normalized slug
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
    console.log('✅ NO DUPLICATE PAGES FOUND')
  } else {
    console.log(`❌ Found ${duplicates.length} duplicate page groups:\n`)
    duplicates.forEach(([slug, docs]) => {
      console.log(`  /${slug}:`)
      docs.forEach(doc => {
        console.log(`    - ${doc.title} (${doc._id})`)
      })
    })
  }
  
  console.log('\n\n--- Checking blog posts ---\n')
  
  const postQuery = `*[_type == "blogPost" && defined(slug)] {
    _id,
    title,
    slug
  } | order(slug.current)`
  
  const posts = await client.fetch(postQuery)
  
  // Group by normalized slug
  const postSlugMap = new Map()
  posts.forEach(post => {
    if (!post.slug || !post.slug.current) return
    
    const normalizedSlug = post.slug.current
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .replace(/\/+/g, '/')
    
    if (!postSlugMap.has(normalizedSlug)) {
      postSlugMap.set(normalizedSlug, [])
    }
    postSlugMap.get(normalizedSlug).push(post)
  })
  
  // Find duplicates
  const postDuplicates = Array.from(postSlugMap.entries()).filter(([, docs]) => docs.length > 1)
  
  if (postDuplicates.length === 0) {
    console.log('✅ NO DUPLICATE BLOG POSTS FOUND')
  } else {
    console.log(`❌ Found ${postDuplicates.length} duplicate post groups:\n`)
    postDuplicates.forEach(([slug, docs]) => {
      console.log(`  /${slug}:`)
      docs.forEach(doc => {
        console.log(`    - ${doc.title} (${doc._id})`)
      })
    })
  }
  
} catch (err) {
  console.error('Error:', err.message)
}
