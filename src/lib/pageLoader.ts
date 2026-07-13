import { fetchPageBySlug } from './queries/pageBySlug';
import { fetchPageByType } from './queries/pageByType';
import { siteProfile } from '../data/siteProfile';
import type { Sections } from '../types/sections';

export type PageData = {
  title: string;
  description?: string;
  sections: Sections[];
  canonicalUrl?: string;
};

const normalizeSlug = (value?: string) => {
  if (!value) return '';
  return value.trim().replace(/^\/+/, '').replace(/\/+$/, '');
};

type LoadOptions = {
  pageType?: string;
  slug?: string;
  fallbackSections?: Sections[];
};

const SLUG_FALLBACKS: Record<string, string[]> = {
  'terms-of-service': ['terms-and-conditions', 'terms-of-use']
};

export async function loadPage({ pageType, slug, fallbackSections }: LoadOptions): Promise<PageData> {
  // Load page data with slug priority over pageType
  let page = null;
  const normalizedSlug = normalizeSlug(slug);
  
  if (normalizedSlug) {
    page = await fetchPageBySlug(normalizedSlug);

    if (!page) {
      const fallbackSlugs = SLUG_FALLBACKS[normalizedSlug] ?? [];
      for (const fallbackSlug of fallbackSlugs) {
        page = await fetchPageBySlug(fallbackSlug);
        if (page) break;
      }
    }
  } else if (pageType) {
    page = await fetchPageByType(pageType);
  }

  // Ensure sections is always an array
  const sections = Array.isArray(page?.sections) && page.sections.length > 0 
    ? page.sections 
    : Array.isArray(fallbackSections) ? fallbackSections : [];

  return {
    title: page?.seo?.seoTitle ?? page?.title ?? siteProfile.brandName,
    description: page?.seo?.seoDescription ?? undefined,
    canonicalUrl: page?.seo?.canonicalUrl ?? undefined,
    sections
  };
}
