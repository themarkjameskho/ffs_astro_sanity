# Sanity Content Model — Standard Repository Contract

This is the implementation-facing companion to `../../standards/COMPONENT-AND-CONTENT-STANDARD.md` and `../../active/content-ops/SANITY-COMPONENTS-AND-CONTENT-MODEL-GUIDE.md`.

## Source-of-truth order

1. Individual Sanity schemas in `studio/schemaTypes/` — exact field names, validation, and permitted values.
2. `studio/schemaTypes/documents/page.ts` — page document and registered section union.
3. `src/types/sections.ts` — runtime TypeScript contracts.
4. `src/lib/queries/` — GROQ projections.
5. `src/components/sections/SectionRenderer.astro` — canonical component map.
6. The editor guide — current supported editorial usage.

Documentation never authorizes a field or variant absent from the code above.

## Standard page contract

Every marketing page is a `page` document with required `title`, `slug`, `pageType`, `sections[]`, and managed SEO fields. The catch-all Astro route loads the content and sends the ordered section array to the canonical renderer.

Registered section types are: `heroSection`, `serviceGridSection`, `processSection`, `serviceAreaSection`, `ctaSection`, `contactSection`, `blogListSection`, `iconGridSection`, `twoColTextImageSection`, `leadFormSection`, `htmlSection`, `faqSection`, `areasSection`, and `stepsSection`.

## Required semantic content shape

For every substantive section, model the content in this order when applicable: optional eyebrow; meaningful section heading; optional subtitle; Portable Text body; optional titled list group; CTA helper/title; primary action; optional secondary action. The page hero owns the H1; section headings are normally H2; group/item nesting follows H3/H4/H5.

## Portable Text policy

New section body prose must use a Portable Text field. Existing string/text descriptions are compatibility fields only. Do not delete legacy fields or bulk-convert existing documents until the approved shared rollout includes schema, query, type, renderer, CMS readback, route, visual-regression, and rollback evidence.

## Migration policy

Map WordPress source blocks to the registered section contract. Several consecutive source blocks may become one complete section, but substantive content, metadata, source URLs, and media provenance must remain traceable in the import map. No page-specific schema or template is permitted to avoid normalization.
