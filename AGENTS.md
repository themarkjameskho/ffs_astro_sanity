# Agent Guide: {{FORK_SOURCE_PROJECT}}

## Multi-Agent Workflow
- Docs live under `project-docs/`.
- Mandatory lifecycle gate: `project-docs/LIFECYCLE-CHECKLIST.md`.
- Agent role cards and TOML profiles live under `project-docs/agents/`.
- Audience entry points live under `project-docs/audiences/`.
- Trigger phrase: `check work`

## Required First Read (Every Change)
1. `project-docs/START-HERE.md` — classify the work as Fresh Build, WordPress Migration, Landing Page, or governed existing-project change.
2. `project-docs/LIFECYCLE-CHECKLIST.md` — use the matching stage gate.
3. `project-docs/standards/COMPONENT-AND-CONTENT-STANDARD.md` — required page architecture, rich-text, heading/list, CTA, and migration-normalization rules.
4. The selected track under `project-docs/tracks/`.

## Mandatory Project Starter (New Client Work)

Before starting a Fresh Build, WordPress Migration, or Landing Page, run `npm run start:project` and complete the local-only Project Starter. It records the selected track, required inputs, and approved component/variant plan in `project-docs/clients/<client-slug>/STARTER-INTAKE.json`.

- The starter is served from `tools/project-starter/`, outside `src/`, so it is never included in the Astro production build or deployed website.
- Do not start implementation until the intake record exists and the matching lifecycle pre-development gate is complete.
- The starter is an intake guardrail, not a place for secrets. Never enter tokens, API keys, or credentials.

When the trigger phrase **`check work`** is used, report: selected track, lifecycle stage, gate result (`PASS`, `SCOPED PASS`, `HOLD`, or `NOT APPLICABLE`), first blocker, owner, next action, and evidence required.

## Mandatory Build/Migration Guidance
- Every AI agent and developer must use `project-docs/LIFECYCLE-CHECKLIST.md` as the stage-gate checklist.
- For a new build, follow `project-docs/LIFECYCLE-CHECKLIST.md` plus `project-docs/Astro-Sanity Process/astro-sanity-development-process.md`.
- For a WordPress → Astro + Sanity migration, follow `project-docs/LIFECYCLE-CHECKLIST.md` plus `project-docs/Astro-Sanity Process/wordpress-to-astro-migration.md`.
- **Mandatory component-first architecture:** follow `project-docs/Astro-Sanity Process/COMPONENT-FIRST-ARCHITECTURE-POLICY.md` on every change. Assemble pages from registered shared components driven by Sanity; do not create page-specific templates, visual route/slug/title branches, renderer bypasses, or one-off CSS. Treat violations as a HOLD and obtain architecture-owner approval before proposing a reusable component or variant.
- **Mandatory content architecture:** every substantive section has a meaningful heading; new section body copy is Sanity Portable Text; titled lists use logical H3/H4/H5 hierarchy; and CTAs use a verified primary action plus an optional secondary action. Do not use standalone title-only layout bands. Existing plain-string body fields are compatibility-only until a shared migration is approved and implemented.
- **Mandatory migration normalization:** preserve substantive WordPress content, URLs, metadata, and media provenance. Consolidate adjacent WordPress layout blocks into complete supported sections and record the mapping; never silently drop substantive content.
- Do not move from pre-development to development, development to pre-launch, or pre-launch to launch until the matching checklist section is complete or open items are explicitly documented.

## Project Snapshot (as of 2026-01-22)
- Stack: Astro 5 + Tailwind CSS 4 + TypeScript + Sanity Studio v3.
- Routing: `src/pages/[...slug].astro` loads page data via `src/lib/pageLoader.ts` (Sanity queries).
- Deployment config: `astro.config.mjs` enables the Vercel adapter with ISR (`expiration: 60`) and uses `SANITY_WEBHOOK_SECRET` as the bypass token.
- Dynamic CMS routes intentionally use `export const prerender = false`; Vercel renders them on demand and caches them via ISR. Do not add `getStaticPaths()` unless intentionally switching to pre-rendered static pages.
- On-demand revalidation endpoint (`/api/revalidate`) is implemented; enable by setting `SANITY_WEBHOOK_SECRET` and configuring the Sanity webhook.

## Documentation Map (Status-Based)
- Canonical index: `project-docs/README.md`
- Reusable playbook: `project-docs/Astro-Sanity Process/README.md`

### Active (use for current work)
- Setup & ops: `project-docs/active/setup/NEW_CLIENT_REPO_SETUP.md` (step 1 — duplicate template, rebrand, GitHub, route fresh-build vs migration), `project-docs/active/setup/SANITY_PROVISIONING.md` (step 2 — project, token, Studio deploy, members, webhook), `project-docs/active/setup/ASTRO-SANITY-VERCEL-SETUP.md`, `project-docs/active/setup/SANITY_DASHBOARD_SETUP.md`

### Rules when running the two setup docs
- Never invent a value. Client slug, domain, GitHub org, project ID, member emails: ask, do not guess.
- Never skip a step's Verify command, and never report a step complete without running it. Report actual output, not a summary.
- Stop after two failed attempts at the same step. Report the command, the real output, and the expectation.
- Before any delete or overwrite, read the current state and confirm it matches what the doc assumes. If it differs, the assumption is wrong — stop.
- Never print a Sanity token into chat, a log, a commit or a document.
- `sanity deploy` is destructive when `studio/sanity.cli.js` still carries the template's `studioHost` — it targets another client's live Studio. Read that value before deploying.
- Sanity project creation, token minting and member invites are browser-only. Without browser access, hand them to a human with the exact values needed; do not attempt an API workaround.
- Content ops: `project-docs/active/content-ops/CONTENT_WRITER_GUIDE.md`, `project-docs/active/content-ops/FORM_CREATION_GUIDE.md`
- Testing: `project-docs/active/testing/STAGING_TESTING_GUIDE.md`
- Open issue: `project-docs/active/open-issues/SECTIONS_NEEDING_WIDTH_HEIGHT_FIX.md` (CLS fix list)

### Reference (stable guidance)
- Design system: `project-docs/reference/design-system/`
- SEO: `project-docs/reference/seo/SEO-ORPHAN-CANONICAL-FIXES.md`
- Variants: `project-docs/reference/variants/brand-variants.md`
- ISR/webhooks (only if ISR remains enabled): `project-docs/reference/deployment/`

### Archive (historical, 2024-2025)
- Performance and optimization logs: `project-docs/archive/performance/`
- Hero + responsiveness fixes: `project-docs/archive/hero/`, `project-docs/archive/responsiveness/`
- Audits: `project-docs/archive/audits/`
- Sanity optimization reviews: `project-docs/archive/sanity/`
- Backups/cleanup/exports: `project-docs/archive/backups/`, `project-docs/archive/cleanup/`, `project-docs/archive/exports/`

## Project Assessment (Documentation Relevancy)
- Strongest reusable asset: the Astro-Sanity playbook (all files under `project-docs/Astro-Sanity Process/`).
- Active guidance is concentrated in setup, content ops, testing, and the open CLS fixes list.
- Most performance and UX documentation is dated November–December 2025 (e.g., 2025-11-19 through 2025-12-18) and should be treated as historical evidence, not current metrics.
- Archived deployment docs include a static-only rollback summary; keep those as historical context unless you intentionally disable ISR.
- Some archived deployment docs include secrets or webhook URLs; scrub or rotate before sharing.

## For New, Similar Projects
1. Copy `project-docs/LIFECYCLE-CHECKLIST.md` and `project-docs/Astro-Sanity Process/` into the new repo.
2. Use `LIFECYCLE-CHECKLIST.md` as the required stage gate for AI agents and developers.
3. For new builds, follow `astro-sanity-development-process.md`.
4. For WordPress migrations, follow `wordpress-to-astro-migration.md` alongside the new-build process.
5. Pull the active guides from `project-docs/active/` as your runbook for setup, content ops, and testing.
6. Use `project-docs/reference/` for design system, SEO, and ISR/webhook patterns if needed.
7. Keep new work out of `archive/` and update `project-docs/README.md` with any new active docs.
