import groq from 'groq';
import { getSanityClient } from '../sanityClient';

const ALL_PAGES_QUERY = groq`
  *[
    _type == "page" &&
    defined(slug.current) &&
    count(sections) > 0 &&
    !(_id in path("drafts.**"))
  ]{
    title,
    "slug": slug.current,
    pageType
  }
`;

const normalizeSlug = (value?: string | null) => {
  if (!value) return '';
  return value.trim().replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();
};

export type PageSlugEntry = {
  title?: string;
  slug?: string;
  pageType?: string;
};

type FetchAllPageSlugsOptions = {
  signal?: AbortSignal;
};

export async function fetchAllPageSlugs(options: FetchAllPageSlugsOptions = {}) {
  const client = getSanityClient();
  if (!client) return [] as PageSlugEntry[];
  const { signal } = options;
  try {
    const results =
      (await client.fetch<PageSlugEntry[]>(
        ALL_PAGES_QUERY,
        {},
        signal ? { signal } : undefined
      )) ?? [];
    return results.map((entry) => ({
      ...entry,
      title: typeof entry.title === 'string' ? entry.title.trim() : '',
      slug: normalizeSlug(entry.slug)
    }));
  } catch (error) {
    console.warn('Failed to fetch page slugs from Sanity', error);
    return [];
  }
}
