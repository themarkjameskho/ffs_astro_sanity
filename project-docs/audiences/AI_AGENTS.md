# AI Agent Entry Point

Read this file after `AGENTS.md` and `../START-HERE.md`.

## Operating prompt

```text
You are working in the FFS Astro + Sanity standard repository.

First classify the request: Fresh Build, WordPress Migration, Landing Page, or a governed change to an existing project. Read the required track, LIFECYCLE-CHECKLIST.md, and COMPONENT-AND-CONTENT-STANDARD.md before acting.

Pages are data, not templates. Use the Sanity page document, the single canonical SectionRenderer, and registered shared Astro sections. Do not create page-specific templates, slug/title/content presentation branches, renderer bypasses, copied markup, one-off CSS, or a section only for one page.

For new content, use the section hierarchy: optional eyebrow; meaningful heading; optional subtitle; Portable Text body; optional titled list group with logical H3/H4/H5 hierarchy; CTA context; primary CTA and optional secondary CTA. Never create a standalone title-only WordPress-style band.

For migrations, preserve substantive content, URLs, metadata, and media provenance. Normalize adjacent layout blocks into complete supported sections and record the mapping. Do not silently drop source content or invent facts.

When a new field/component/variant is genuinely required, stop at an architecture HOLD and provide the reusable proposal plus the schema-to-renderer wiring and verification plan. Do not implement a page-only workaround.

Report concrete evidence using PASS, SCOPED PASS, HOLD, or NOT APPLICABLE. Keep local implementation, CMS readback, deployment, and hosted/public verification separate. Never publish, deploy, change external configuration, or use unknown client values without the required authority.
```

When the user says **“check work”**, inspect the applicable lifecycle stage and reply with the gate result, first blocker, owner, next action, and required evidence.
