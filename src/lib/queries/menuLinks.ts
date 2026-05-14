import groq from 'groq';
import { getSanityClient } from '../sanityClient';

export type MenuLink = {
  label: string;
  href: string;
  slug?: string;
};

type PageEntry = {
  title?: string | null;
  slug?: string | null;
};

const MENU_PAGES_QUERY = groq`
  *[
    _type == "page" &&
    pageType == $pageType &&
    defined(slug.current) &&
    count(sections) > 0 &&
    !(_id in path("drafts.**"))
  ] | order(title asc) {
    title,
    "slug": slug.current
  }
`;

const normalizeSlug = (value?: string | null) => {
  if (!value) return '';
  return value.trim().replace(/^\/+/, '').replace(/\/+$/, '');
};

const slugDepth = (slug: string) => slug.split('/').filter(Boolean).length;

const slugToHref = (slug: string) => {
  const normalized = normalizeSlug(slug);
  if (!normalized || normalized === 'home') return '/';
  return `/${normalized}/`;
};

type FetchOptions = {
  slugPrefix?: string;
  depth?: number;
  signal?: AbortSignal;
};

/**
 * Fetches page documents for use in navigation menus.
 * Uses published perspective + explicit draft filtering, then applies optional prefix/depth filters client-side.
 */
export async function fetchMenuLinksByPageType(pageType: string, options: FetchOptions = {}): Promise<MenuLink[]> {
  const client = getSanityClient();
  if (!client) return [];

  const { slugPrefix, depth, signal } = options;
  const normalizedPrefix = slugPrefix ? normalizeSlug(slugPrefix) : '';

  try {
    const results =
      (await client.fetch<PageEntry[]>(
        MENU_PAGES_QUERY,
        { pageType },
        signal ? { signal } : undefined
      )) ?? [];

    return results
      .map((entry) => {
        const slug = normalizeSlug(entry.slug);
        return {
          label: (entry.title ?? '').trim(),
          href: slugToHref(slug),
          slug
        };
      })
      .filter((item) => Boolean(item.label) && Boolean(item.slug))
      .filter((item) => (normalizedPrefix ? item.slug?.startsWith(normalizedPrefix) : true))
      .filter((item) => (typeof depth === 'number' ? slugDepth(item.slug || '') === depth : true))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.warn('Failed to fetch menu links from Sanity', { pageType, error });
    return [];
  }
}
