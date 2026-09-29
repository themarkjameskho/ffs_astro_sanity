# Track: WordPress Migration

This track overlays the Fresh Build track. It applies whenever an existing WordPress site, public domain, indexed URL, redirect estate, or inherited content is in scope — including a redesign.

## Additional definition of ready

Before content import or URL changes, capture and retain:

1. WordPress export and a source snapshot.
2. Complete URL inventory, including pages, posts, archives, attachments, redirects, and the KEEP/RENAME/RETIRE decision for each URL.
3. SEO metadata inventory: titles, descriptions, canonicals, robots directives, and structured data where present.
4. Media manifest with source, alt text, captions, and destination status.
5. Existing redirect map, including traffic/hit evidence when available.
6. Content normalization map showing which WordPress blocks become which supported Sanity section(s).
7. Content-parity and redirect-verification plans.

## Required sequence

1. Complete the Fresh Build inputs; the design system and content architecture still apply.
2. Follow `../Astro-Sanity Process/wordpress-to-astro-migration.md` and the lifecycle checklist end to end.
3. Archive baseline evidence before imports or redirect edits.
4. Normalize source blocks into complete sections using the component and content standard. Preserve substantive content and source provenance.
5. Run imports dry before writing, then read back imported content from Sanity.
6. Verify content parity, canonical URLs, metas, media, forms, redirects, sitemap/robots, representative routes, and 404 behaviour on staging and after launch.

**Gate:** HOLD if the source baseline or redirect inventory is incomplete. A sitemap alone is not an adequate URL inventory.
