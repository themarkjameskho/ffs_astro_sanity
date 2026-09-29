# Product Backlog

> Maintain this file as a lightweight source of truth when an external tracker is unavailable. Keep items ordered by priority.

## Legend
- `💎` High priority / launch-critical
- `📈` Growth / optimization
- `🧪` Experiment or hypothesis
- `🧹` Maintenance / refactor

## Upcoming Releases
| Release | Target Date | Goals | Owner |
|---------|-------------|-------|-------|
| R1 | yyyy-mm-dd | Launch MVP marketing site | |
| R2 | yyyy-mm-dd | | |

## Backlog Items
| ID | Title | Type | Status | Notes / Links |
|----|-------|------|--------|---------------|
| 001 |  | 💎 | Todo | |
| 002 |  | 📈 | Todo | |
| 003 |  | 🧹 | Todo | |

## Icebox / Future Ideas
- 

## Completed (Archive)
- yyyy-mm-dd – Item title – Result/outcome.

## Template hardening for client migrations (from the Bed Bug BBQ retro, 2026-08)

Full rationale and cost-when-hit: `retrospectives/2026-08-bedbugbbq-wp-migration.md`.
Procedure these support: `wordpress-to-astro-migration.md` v2.1.

**P0 — bugs shipping to every new client**
- [ ] `MainLayout.astro`: `brandLogoPath` is undefined and used twice — every route throws. Use `absoluteLogoUrl`.
- [ ] Add `pathSlugify` to every nestable slug field (page, blogPost) — nested slugs otherwise can never resolve. THE CHAPMAN BLOCKER.
- [ ] Repair or delete the shipped Kadence mapper — it emits field names from an older schema and loses content silently.
- [ ] Make `studioHost` a `{{PLACEHOLDER}}` — it ships as a previous client's LIVE Studio host.
- [ ] `sanity.cli.js`: load `.env.local` as well as `.env`.
- [ ] Move hardcoded location/service links out of `navigation.ts` + `ServiceAreaSection.astro` into a data module.
- [ ] Replace `example.com` fallbacks with a build-time failure.

- [ ] **Breadcrumb component + per-page `BreadcrumbList`.** `MainLayout` gates the full
      `@graph` behind `isHomePage`, and the homepage `BreadcrumbList` carries only "Home".
      There is no breadcrumb UI component at all, so any client with a nested page tree
      migrates from WordPress *losing* breadcrumbs — navigation and rich results both.
      Derive the trail from the full-path slug (the `pathSlugify` payoff) and render it on
      every non-home route, emitting matching schema from the same derived trail.

- [ ] **Collapse the five webhook docs into one.** `SANITY_WEBHOOK_SETUP.md`,
      `WEBHOOK_ISR_SETUP.md`, `WEBHOOK_SETUP_QUICK_REF.md`, `ISR_SETUP_CHECKLIST.md` (stale) and
      `WEBHOOK_TESTING_GUIDE.md` all describe the same three-step task, and each states a
      different subset of it — only one mentioned Create/Update/Delete, none warned about
      Sanity's `Secret` field or dataset scoping until now. Five partial copies of a procedure
      is the same failure as no copy: nobody knows which is authoritative, so it gets re-derived
      on the call. Keep one, delete the rest, link it from the lifecycle checklist.

**P1 — make migrations repeatable**
- [ ] Promote the WXR importer into the template (wxr-source, parse-blocks-raw, classify, sections, import-from-wxr with --dry-run + rails). Biggest single win.
- [ ] `npm run check:links` — every internal href resolves to a real Sanity document. Would have caught Chapman on day one.
- [ ] `npm run check:slugs` — assert every page slug is its full path.
- [ ] Add the blog-URL architecture: `postHref`, `postBySlug`, catch-all fallback to blogPost, extracted article component, `/blog/[slug]` as 301.
- [ ] Make the Sanity client `perspective` env-driven so drafts can be previewed.
- [ ] Ship `check-sanity-token.mjs` and `publish-drafts.mjs`.

**P2 — polish**
- [ ] Generic placeholder image at a known path.
- [ ] Deterministic `_key` generation in importers.
- [ ] Fold `check:links` + `check:slugs` into `template:audit`.
- [ ] Commit a per-client migration report (dry-run output) so figure changes are attributable.

**If only three get done:** the MainLayout crash, `pathSlugify`, and `check:links`.
