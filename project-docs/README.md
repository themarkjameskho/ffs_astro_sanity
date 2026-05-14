# Project Documentation Index

This folder is organized by status so new projects can reuse the right guidance quickly.
Current deployment uses Vercel ISR (`expiration: 60` in `astro.config.mjs`); use the deployment reference docs only if you want on-demand revalidation via webhook.

## 1) Start Here (Reusable Playbook)
- `project-docs/Astro-Sanity Process/README.md` (full lifecycle playbook)
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
- `project-docs/active/setup/SANITY_DASHBOARD_SETUP.md`

### Content Operations
- `project-docs/active/content-ops/CONTENT_WRITER_GUIDE.md`
- `project-docs/active/content-ops/FORM_CREATION_GUIDE.md`

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
