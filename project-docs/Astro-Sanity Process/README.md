# Astro + Sanity Process Playbook

This folder contains the reusable documentation set for bootstrapping a new Astro + Sanity project — including migrating an existing WordPress site onto the stack. Start with `../START-HERE.md` to select the Fresh Build, WordPress Migration, or Landing Page track; then use this playbook for the detailed lifecycle.

## Pick the right entry point

| If you're doing this... | Start here |
|---|---|
| Starting a brand-new project from scratch | `astro-sanity-development-process.md` (11 phases) |
| Migrating an existing WordPress site to Astro+Sanity | `wordpress-to-astro-migration.md` (run alongside the main playbook) |
| Creating a campaign landing page or microsite | `../tracks/LANDING-PAGE.md`, then classify it as fresh or migration |
| Day-to-day code changes on an already-live site | `dev-to-live-workflow.md` |
| Setting up or troubleshooting deployment | `deployment.md` |

## How to Use
1. Pick the right entry point from the table above.
2. Read and apply `COMPONENT-FIRST-ARCHITECTURE-POLICY.md` and `../standards/COMPONENT-AND-CONTENT-STANDARD.md` on every project and AI/developer change.
3. For new projects, kick off with `astro-sanity-development-process.md` and progress phase by phase.
4. For migrations, run `wordpress-to-astro-migration.md` in parallel — its phases (A through H) overlay onto Phases 1, 6, 7, and 10 of the main playbook.
5. Populate each supporting template as you work (requirements, content model, backlog, etc.).
6. Store designer deliverables (PDF/MD) inside `design-inputs/` and capture your analysis in the paired review/implementation documents.
7. Keep artefacts updated — each Markdown file is the single source of truth for that topic.

## Key Files
| File | Purpose |
|------|---------|
| `astro-sanity-development-process.md` | End-to-end development phases, checklists, exit criteria. |
| `wordpress-to-astro-migration.md` | Migration-specific playbook: fork cleanup, URL inventory, content import, DNS cutover. |
| `COMPONENT-FIRST-ARCHITECTURE-POLICY.md` | Mandatory shared-component, Sanity-driven page assembly and no-page-template gate. |
| `dev-to-live-workflow.md` | Daily ship loop: local change → commit → deploy → verify. |
| `requirements.md` | Business goals, audience, scope, success metrics. |
| `architecture/overview.md` | System diagram, environment matrix, operational notes. |
| `backlog.md` | Lightweight release planning and prioritized work items. |
| `components.md` | Component inventory with implementation status and locations. |
| `content-model.md` | Sanity schema documentation and editorial guidelines. |
| `global-styles-review.md` | Findings from designer global-style docs (accessibility, SEO risks). |
| `global-styles-implementation-plan.md` | Mapping from global-style decisions to Tailwind/CSS implementation. |
| `integration.md` | Sanity ↔ Astro integration details (env vars, webhooks, preview). |
| `page-contracts.md` | Required fields and component mapping per page template. |
| `quality-matrix.md` | Performance, accessibility, SEO targets and checklists. |
| `test-plan.md` | Manual + automated testing scope and UAT sign-off tracking. |
| `deployment.md` | Project-specific release checklist, environment variables, rollback strategy. |
| `retrospectives/` | Ongoing post-launch insights and action items. |

## New Project Checklist
- [ ] Copy this folder into the new repo’s `project-docs/`.
- [ ] Update `requirements.md`, `architecture/overview.md`, and `backlog.md` during discovery.
- [ ] Add designer files to `design-inputs/` and complete the global styles review + implementation plan before coding UI.
- [ ] Keep `quality-matrix.md`, `test-plan.md`, and `deployment.md` current as you iterate.
- [ ] After launch, track retrospectives and improvements in `retrospectives/`.

## WordPress Migration Checklist
- [ ] Read `wordpress-to-astro-migration.md` end-to-end before pushing the first commit.
- [ ] Phase A: credentials vault + WP baseline archived
- [ ] Phase B: URL inventory CSV complete
- [ ] Phase C: inherited-fork cleanup (no old brand/domain/GA/CallRail IDs in source)
- [ ] Phase D: content imported into Sanity (counts match WP baseline)
- [ ] Phase E: redirect map in `vercel.json` + documented in `reference/deployment/`
- [ ] Phase F: parity audit signed off on preview URL
- [ ] Phase G: DNS swap executed (apex A record, no apex CNAME)
- [ ] Phase H: post-cutover phone-call + form + GA Realtime tests passed
