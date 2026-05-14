# Agent Guide: {{FORK_SOURCE_PROJECT}}

## Multi-Agent Workflow
- Docs live under `project-docs/`.
- Agent role cards and TOML profiles live under `project-docs/agents/`.
- Audience entry points live under `project-docs/audiences/`.
- Trigger phrase: `check work`

## Project Snapshot (as of 2026-01-22)
- Stack: Astro 5 + Tailwind CSS 4 + TypeScript + Sanity Studio v3.
- Routing: `src/pages/[...slug].astro` loads page data via `src/lib/pageLoader.ts` (Sanity queries).
- Deployment config: `astro.config.mjs` enables the Vercel adapter with ISR (`expiration: 60`) and uses `SANITY_WEBHOOK_SECRET` as the bypass token.
- ISR requires pre-rendered pages: dynamic routes set `export const prerender = true` (e.g., `src/pages/[...slug].astro`, `src/pages/blog/[slug].astro`).
- On-demand revalidation endpoint (`/api/revalidate`) is implemented; enable by setting `SANITY_WEBHOOK_SECRET` and configuring the Sanity webhook.

## Documentation Map (Status-Based)
- Canonical index: `project-docs/README.md`
- Reusable playbook: `project-docs/Astro-Sanity Process/README.md`

### Active (use for current work)
- Setup & ops: `project-docs/active/setup/ASTRO-SANITY-VERCEL-SETUP.md`, `project-docs/active/setup/SANITY_DASHBOARD_SETUP.md`
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
1. Copy `project-docs/Astro-Sanity Process/` into the new repo and follow the lifecycle in `astro-sanity-development-process.md`.
2. Pull the active guides from `project-docs/active/` as your runbook for setup, content ops, and testing.
3. Use `project-docs/reference/` for design system, SEO, and ISR/webhook patterns if needed.
4. Keep new work out of `archive/` and update `project-docs/README.md` with any new active docs.
