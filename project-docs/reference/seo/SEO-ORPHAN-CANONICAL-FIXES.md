# Orphan and Canonical Fixes

This note documents how orphan pages and canonical URLs are handled in the current Astro + Sanity build.

## Orphan Pages (Discovery + Build Coverage)

Problem: Pages created in Sanity were not guaranteed to be generated or discoverable if their routes were not explicitly listed.

Resolution:
- `src/lib/queries/allPages.ts` fetches all Sanity page slugs and normalizes them.
- `src/pages/[...slug].astro` uses `getStaticPaths()` to generate a static route for every slug and ensures the `home` page is always included.
- `astro.config.mjs` enables the `@astrojs/sitemap` integration so all built routes land in `sitemap.xml`.

Outcome: every Sanity page gets a built route and is surfaced to crawlers via the sitemap, preventing orphaned pages.

## Canonical URLs (Duplicate + Mismatch Protection)

Problem: Canonical URLs could drift from the actual path or point to incorrect variants.

Resolution:
- `src/lib/canonical.ts` builds canonicals from the preferred origin and normalizes paths (lowercase + trailing slash).
- Internal canonical overrides from Sanity are only accepted when they match the current path; mismatches are ignored.
- `src/components/layouts/MainLayout.astro` uses the canonical builder for `<link rel="canonical">` and for OG/Twitter URL tags.
- `src/lib/pageLoader.ts` passes `seo.canonicalUrl` from Sanity as the optional override.

Outcome: each page publishes a stable canonical URL, and incorrect CMS overrides no longer create duplicates.
