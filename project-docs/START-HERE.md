# FFS Astro + Sanity Standard — Start Here

This repository is the official Fast Forward Search starting point for Astro + Sanity marketing websites. It has one page-assembly architecture and three delivery tracks:

| Track | Use it when | Required starting inputs |
|---|---|---|
| Fresh build | A new client has no existing public site/content to preserve. | Approved project brief, reference set, design system, content architecture, page/content plan. |
| WordPress migration | An existing WordPress site, indexed URLs, or inherited content must be preserved. | Everything for a fresh build, plus a verified WordPress baseline, content/URL inventory, metadata inventory, media manifest, and redirect map. |
| Landing page | The scope is one campaign or microsite page (or a small defined set), whether new or inherited. | A scoped brief, conversion goal, approved design-system variant, content architecture, tracking/form requirements, and a decision on whether existing URLs/content make it a migration. |

## Start with the local Project Starter

Run `npm run start:project` before beginning a new client project. It opens a local-only workspace at `http://127.0.0.1:4399` with:

- Fresh Build, WordPress Migration, and Landing Page selection;
- track-specific required-input checks;
- a visual catalog of registered hero and section variants; and
- an intake record written to `project-docs/clients/<client-slug>/STARTER-INTAKE.json`.

The starter is under `tools/project-starter/`, not `src/`, and is not included in an Astro build or website deployment. It contains no credentials and must not be used to record them.

## Non-negotiable rules

1. Run `npm run start:project`, then read `AGENTS.md`, this file, `LIFECYCLE-CHECKLIST.md`, and `standards/COMPONENT-AND-CONTENT-STANDARD.md` before changing code, schemas, content, or project documentation.
2. Pages are Sanity documents. `src/pages/[...slug].astro` loads a page; the canonical `src/components/sections/SectionRenderer.astro` renders its ordered, registered sections. Do not create a page-specific Astro template, presentation route branch, renderer bypass, copied markup, or one-off CSS.
3. The design system is the client-specific layer. Change tokens and approved shared variants; do not fork page structure to achieve a look.
4. Every substantive section needs a heading and structured content. New body copy is Portable Text. Do not use standalone title-only layout bands to imitate WordPress spacing.
5. A new field, component, or variant is a whole-system change: schema → TypeScript → every GROQ projection → section contract → canonical renderer → shared component → Studio/readback → affected-route checks.
6. A migration preserves substantive source content, URLs, metadata, and media provenance. Layout wrappers may be consolidated into complete Astro/Sanity sections; no substantive source content is silently dropped.

## Choose a track

- [Fresh build track](tracks/FRESH-BUILD.md)
- [WordPress migration track](tracks/WORDPRESS-MIGRATION.md)
- [Landing-page track](tracks/LANDING-PAGE.md)
- [Component and content standard](standards/COMPONENT-AND-CONTENT-STANDARD.md)
- [AI-agent instructions](audiences/AI_AGENTS.md)
- [Developer instructions](audiences/DEVELOPERS.md)
- [Stakeholder/approver guide](audiences/STAKEHOLDERS.md)

## Gate language

Use only these results: **PASS**, **SCOPED PASS**, **HOLD**, or **NOT APPLICABLE**. A draft, a local code change, a Studio write, a deployment, and a public verification are separate evidence states.

**Current template-standardisation gate:** SCOPED PASS for documentation and intake guidance. HOLD for enforcing the Portable Text body rule in every existing schema until the shared-component inventory and compatibility rollout are approved and implemented.
