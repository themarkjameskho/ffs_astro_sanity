# Project Documentation Index

This folder is organized by status so new projects can reuse the right guidance quickly. `START-HERE.md` is the canonical entry point for this standard repository.
Current deployment uses Vercel on-demand rendering with ISR caching (`expiration: 60` in `astro.config.mjs`). Dynamic CMS routes use `prerender = false`; webhook revalidation is handled by `/api/revalidate`.

## 1) Start Here (Reusable Playbook)
- `project-docs/START-HERE.md` (official classification and required inputs for Fresh Build, WordPress Migration, and Landing Page work)
- `project-docs/standards/COMPONENT-AND-CONTENT-STANDARD.md` (mandatory one-renderer, rich-text, heading/list/CTA, and migration-normalization rules)
- `project-docs/tracks/FRESH-BUILD.md`
- `project-docs/tracks/WORDPRESS-MIGRATION.md`
- `project-docs/tracks/LANDING-PAGE.md`
- `project-docs/LIFECYCLE-CHECKLIST.md` (mandatory AI/developer stage gates from requirements through launch)
- `project-docs/Astro-Sanity Process/README.md` (full lifecycle playbook)
- `project-docs/Astro-Sanity Process/COMPONENT-FIRST-ARCHITECTURE-POLICY.md` (mandatory shared-component and no-page-template policy for developers and AI agents)
- `project-docs/Astro-Sanity Process/astro-sanity-development-process.md` (phase-by-phase execution)
- `project-docs/Astro-Sanity Process/forms-content-ops.md` (forms, content ops, deployment cadence)

## 2) Agents & Audiences
- `project-docs/audiences/DEVELOPERS.md`
- `project-docs/audiences/STAKEHOLDERS.md`
- `project-docs/audiences/AI_AGENTS.md`
- `project-docs/agents/README.md`

## 3) Active Docs (Current Project)
### Setup & Operations
- `project-docs/active/setup/ASTRO-SANITY-VERCEL-SETUP.md`
- `project-docs/active/setup/NEW_CLIENT_REPO_SETUP.md` — step zero: duplicate the template, rebrand, connect GitHub, route fresh-build vs migration.
- `project-docs/active/setup/SANITY_PROVISIONING.md` — account-level setup for a new client: project, token, Studio deploy, members, webhook. Follows the repo setup above.
- `project-docs/active/setup/SANITY_DASHBOARD_SETUP.md` — the Studio's internal config, desk structure and widgets.

### Content Operations
- `project-docs/active/content-ops/CONTENT_WRITER_GUIDE.md`
- `project-docs/active/content-ops/WRITER_PROMPTS_AND_WORKFLOW.md`
- `project-docs/active/content-ops/FORM_CREATION_GUIDE.md`
- `project-docs/active/content-ops/SANITY-COMPONENTS-AND-CONTENT-MODEL-GUIDE.md` — current editor/AI reference for supported Sanity content types and Astro sections.

### Testing
- `project-docs/active/testing/STAGING_TESTING_GUIDE.md`

### Open Issues / Follow-Ups
- `project-docs/active/open-issues/SECTIONS_NEEDING_WIDTH_HEIGHT_FIX.md`

## 4) Reference Docs (Stable Concepts)
### Design System & Layout
- `project-docs/reference/design-system/global-css.md`
- `project-docs/reference/design-system/GLOBAL_SPACING_SYSTEM.md`
- `project-docs/reference/design-system/SINGLE_SOURCE_SPACING_TRUTH.md`

### SEO & Routing
- `project-docs/reference/seo/SEO-ORPHAN-CANONICAL-FIXES.md`

### Variants
- `project-docs/reference/variants/brand-variants.md`

### Deployment + ISR/Webhooks (Use for on-demand revalidation)
- `project-docs/reference/deployment/SANITY_WEBHOOK_SETUP.md`
- `project-docs/reference/deployment/WEBHOOK_ISR_SETUP.md`
- `project-docs/reference/deployment/WEBHOOK_SETUP_QUICK_REF.md`
- `project-docs/reference/deployment/WEBHOOK_TESTING_GUIDE.md`
- `project-docs/reference/deployment/ISR_SETUP_CHECKLIST.md`

## 5) Archive (Historical Logs & Completed Work)
> These are primarily 2024–2025 completion reports, audits, and optimization logs. Use for context, not as live instructions.

- `project-docs/archive/performance/`
- `project-docs/archive/hero/`
- `project-docs/archive/responsiveness/`
- `project-docs/archive/sanity/`
- `project-docs/archive/audits/`
- `project-docs/archive/deployment/`
- `project-docs/archive/backups/`
- `project-docs/archive/cleanup/`
- `project-docs/archive/exports/`

## Security Note
Some docs include environment variables or webhook URLs used during past deployments. Remove or rotate secrets before sharing externally.
