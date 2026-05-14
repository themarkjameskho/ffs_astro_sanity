import { getSanityClient } from '../sanityClient';

/**
 * Lightweight query for getStaticPaths - only fetches slug and ID
 * This minimizes data transfer during build
 */
export async function fetchAllBlogPostSlugs() {
  const sanityClient = getSanityClient();

  if (!sanityClient) {
    return [];
  }

  const query = `*[_type == 'blogPost'] | order(publishedAt desc) {
    _id,
    "slug": slug.current
  }`;

  try {
    const posts = await sanityClient.fetch(query);
    return posts;
  } catch (error) {
    console.error('Error fetching blog post slugs:', error);
    return [];
  }
}

/**
 * Full query for displaying blog posts - fetches all necessary data
 * Used when rendering blog posts with metadata, images, and content
 */
export async function fetchAllBlogPosts() {
  const sanityClient = getSanityClient();

  if (!sanityClient) {
    return [];
  }

  const query = `*[_type == 'blogPost'] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featuredImage {
      asset -> {
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    author,
    "categories": categories[]->name,
    "categorySlugs": categories[]->slug.current,
    "tags": tags[]->name,
    content,
    seo {
      metaTitle,
      metaDescription
    }
  }`;

  try {
    const posts = await sanityClient.fetch(query);
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}
