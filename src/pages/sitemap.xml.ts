import { fetchAllPageSlugs } from '../lib/queries/allPages';
import { fetchAllBlogPostSlugs } from '../lib/queries/allBlogPosts';

export const prerender = false;

export async function GET() {
  const siteUrl = 'https://{{VERCEL_PREVIEW_DOMAIN}}';

  // Fetch all data
  const [pages, posts] = await Promise.all([
    fetchAllPageSlugs(),
    fetchAllBlogPostSlugs()
  ]);

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static/Home Page -->
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Dynamic Pages -->
  ${pages
      .filter(page => page.slug && page.slug !== 'home')
      .map(page => `
  <url>
    <loc>${siteUrl}/${page.slug}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`.trim())
      .join('\n')}

  <!-- Blog Posts -->
  ${posts
      .filter((post: any) => post.slug)
      .map((post: any) => `
  <url>
    <loc>${siteUrl}/blog/${post.slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`.trim())
      .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
