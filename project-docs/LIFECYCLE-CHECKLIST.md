# FFS Astro+Sanity Lifecycle Checklist

Use this checklist for every new build, rebuild, or WordPress migration before handing work between people or agents. It is mandatory guidance for both AI agents and human developers.

For a new build, use this checklist together with `project-docs/Astro-Sanity Process/astro-sanity-development-process.md`.

For a WordPress → Astro + Sanity migration, use this checklist together with `project-docs/Astro-Sanity Process/wordpress-to-astro-migration.md`.

Do not move to the next stage until the current section is complete or every open item is explicitly documented with an owner. It is intentionally stage-based so incomplete requirements do not leak into development, development output does not skip QA, and launch does not depend on memory.

## 1. Pre-Development Requirements

Do not hand the repo to development until these are either complete or explicitly marked as open decisions.

### Repo Provisioning
Do this before anything else: [NEW_CLIENT_REPO_SETUP.md](active/setup/NEW_CLIENT_REPO_SETUP.md),
which carries the commands, the verification for each step, and the rules agents must follow
(never invent a value; stop after two failed attempts; confirm state before deleting).

- [ ] `ffs_astro_sanity` duplicated to a folder named for the client.
- [ ] `node_modules`, build output and **`.env*` deleted from the copy** — a carried-over `.env.local` points every command at the previous client's Sanity project and token.
- [ ] Dependencies reinstalled (`npm install` in root and `studio/`).
- [ ] `./template-setup.sh` run; remaining hardcoded fork-source brand, domains, city links and `studioHost` grepped and cleared.
- [ ] `npm run template:audit` passes.
- [ ] `.gitignore` covers `.env*` and `node_modules` **before** the first commit — a committed token must be rotated, not deleted.
- [ ] `git init`, first commit, **private** GitHub repo created, remote connected, first push landed.
- [ ] **Project routed: fresh build or WordPress migration.** It is a migration if URLs are already indexed at the domain — including a "redesign" — and a restructure of existing URLs is a migration too. Decision and reasoning written into `project-docs/clients/<client>/`.
- [ ] The matching workflow doc opened and being followed: `astro-sanity-development-process.md` for a fresh build, `wordpress-to-astro-migration.md` for a migration.

### Project Scope
- [ ] Project classified as one of: Fresh Build, WordPress Migration, Landing Page/Microsite, or rebuild; selection recorded in `project-docs/clients/<client>/`.
- [ ] `project-docs/START-HERE.md` and the matching track were read before work began.
- [ ] Client name, brand slug, production domain, and target launch date confirmed.
- [ ] Primary services, service areas, and launch page list confirmed.
- [ ] Decision-maker and final approver identified.
- [ ] Known exclusions documented: pages not migrating, offers not allowed, services not sold, locations not served.

### Brand And Business Inputs
- [ ] Logo files collected or placeholder explicitly approved.
- [ ] Brand colors and typography direction confirmed.
- [ ] NAP confirmed: business name, address, city, state, ZIP, primary phone, secondary phone if any.
- [ ] Phone formats prepared for display, `tel:` links, schema, and CallRail.
- [ ] Hours, emergency/same-day claims, guarantees, coupons, and pricing rules confirmed.
- [ ] Google Business Profile URL or map location confirmed.
- [ ] Reviews source confirmed; no fabricated reviews.

### SEO And Site Planner
- [ ] Site type follows the FFS home-service/pest-control structure.
- [ ] Content plan completed: page purpose, sections, page copy, SEO title, meta description.
- [ ] Writer prompts/workflow used: `project-docs/active/content-ops/WRITER_PROMPTS_AND_WORKFLOW.md`.
- [ ] Component map completed: every page maps to existing standard sections.
- [ ] Content architecture completed for every page: H1/H2 plan, Portable Text body fields, list-title/item hierarchy, CTA hierarchy, and source material.
- [ ] Service-area and location-page uniqueness requirements documented.
- [ ] Redirect inventory started for migrations.
- [ ] Blog/import scope confirmed.

### Sanity Provisioning
Full procedure, verification per step, and the destructive defaults to watch:
[SANITY_PROVISIONING.md](active/setup/SANITY_PROVISIONING.md). Steps are ordered by
dependency and must not be reordered — the webhook needs a deployed URL, so it cannot be
done first. Steps 1, 2 and 4 are browser-only: an agent without browser access hands those
to a human rather than attempting an API workaround.

- [ ] Client project created in the **Fast Forward Search** org (never a personal account); project ID recorded.
- [ ] `production` and `staging` datasets created, both **private**; the dataset each deployment reads is written down.
- [ ] Plan decided, or trial expiry date noted with an owner — seats and dataset privacy are plan-gated.
- [ ] **Editor**-scoped API token created (the importer's writes fail on a Viewer token); `node scripts/check-sanity-token.mjs` passes.
- [ ] Token in `.env.local` and Vercel, committed nowhere, and **not** pasted inside `{{ }}` braces.
- [ ] `studioHost` in `studio/sanity.cli.js` changed from the template default **before the first deploy** — the shipped value targets another client's live Studio.
- [ ] Studio deployed (`npm run deploy --prefix studio`) and loads without a white screen.
- [ ] Team invited with least-privilege roles: client editors as **Editor**, developers as **Developer**, owner as Administrator.
- [ ] Revalidation webhook created last, once the site URL exists — see the Post-Development section for the delivery test.

### Infrastructure Inputs
- [ ] Vercel project/domain decision confirmed.
- [ ] Required env vars listed: `SITE_URL`, Sanity vars, webhook secret, form webhook, Turnstile, GA4, CallRail.
- [ ] Form destination confirmed: n8n, Zapier, CRM, or temporary hold.
- [ ] DNS access and launch owner confirmed.

### Repo Readiness
Repo creation and rebranding are covered in Repo Provisioning above; this is the handoff gate.

- [ ] Client docs copied into `project-docs/clients/<client>/`, including the fresh-build vs migration decision.
- [ ] `README.md`, `AGENTS.md`, `tokens.css`, and deployment docs aligned to this client.
- [ ] `npm run template:audit` passes before handoff.

## 2. During Development

Use this checklist while pages, schemas, migrations, and components are being built.

### Build Discipline
- [ ] Build uses the existing Astro + Sanity architecture; no separate scaffold.
- [ ] New page content goes through Sanity page documents and standard section schemas.
- [ ] AI-written copy follows the writer prompt workflow and includes Open Items instead of invented facts.
- [ ] New UI uses existing section/component patterns unless a new reusable pattern is justified.
- [ ] Follow `project-docs/Astro-Sanity Process/COMPONENT-FIRST-ARCHITECTURE-POLICY.md`: no page-only templates, renderer bypasses, route/title/key presentation branches, content heuristics, or one-off CSS; any proposed shared component/variant is approved before implementation.
- [ ] Changed Sanity fields are wired through schema, TypeScript, every GROQ projection, section contracts, canonical renderer, and shared component; verify CMS readback and all affected routes.
- [ ] Every marketing section has useful content beyond its title; requested per-card media is modeled and rendered on each card through an official shared variant.
- [ ] Every substantive section has a meaningful heading; the page hero owns the only H1 and later sections use logical H2/H3/H4/H5 hierarchy.
- [ ] New body prose uses Portable Text. Legacy plain-string body fields are used only for existing-content compatibility pending the approved shared rollout.
- [ ] No standalone title-only layout bands or page-only section variants were created.
- [ ] Design tokens are updated before one-off styling.
- [ ] No hardcoded client domains, old brands, old GA IDs, old CallRail IDs, or preview URLs in runtime files.
- [ ] Dynamic CMS routes keep `prerender = false`; no `getStaticPaths()` added to CMS routes.

### Content And Section Standards
- [ ] Every page has title, slug, page type, SEO title, SEO description, and at least one section.
- [ ] CTAs have real links, not button labels as hrefs.
- [ ] Internal links use canonical trailing-slash paths.
- [ ] Images have alt text and stable width/height or aspect-ratio handling.
- [ ] Forms use the standard `LeadFormSection` contract and submit through `/api/contact` unless intentionally overridden.
- [ ] Raw `htmlSection` use is limited to legal copy or approved embeds.

### WordPress Migration Work
- [ ] WP baseline archived: URL inventory, page/post counts, media inventory, sitemap if available.
- [ ] Migration scripts run in dry-run first.
- [ ] Kadence/Gutenberg fallbacks reviewed from the migration report.
- [ ] `htmlSection` fallbacks are converted to standard sections where possible.
- [ ] Redirects added for changed, removed, duplicate, category, tag, and legacy URLs.
- [ ] Imported posts/pages spot-checked against WordPress.
- [ ] Consecutive WordPress layout blocks were normalized into complete supported sections; each source-to-destination mapping preserves substantive content, URL/metadata, and media provenance.

### Developer Verification
- [ ] `npm run build` passes.
- [ ] `npm run check:placeholders` passes.
- [ ] `npm run check:routes` passes.
- [ ] `npm run check:domains` passes.
- [ ] `npm run report:html-sections` reviewed when Sanity credentials are available.
- [ ] Mobile and desktop visual checks completed on home, one service page, one location page, blog, and contact.

## 3. Post-Development / Pre-Launch

Use this after development is functionally complete but before DNS or production launch.

### Content Review
- [ ] Stakeholder reviews staging pages against the approved content plan.
- [ ] Brand name, logo, colors, phones, offers, service areas, and NAP are correct everywhere.
- [ ] No prices, claims, guarantees, reviews, or certifications appear unless confirmed.
- [ ] Service/location pages have unique intros and examples; no city-name-only swaps.
- [ ] Privacy Policy and Terms of Service exist and are linked.
- [ ] Blog posts, categories, tags, authors, and featured images are correct.

### Technical QA
- [ ] Full [PRE-LAUNCH-QA.md](../PRE-LAUNCH-QA.md) completed.
- [ ] `npm run template:audit` passes.
- [ ] Production env vars are set in Vercel for Production, Preview, and Development where needed.
- [ ] Sanity Studio opens and editors can publish content.
- [ ] Sanity webhook reaches `/api/revalidate`. Secret is `openssl rand -hex 32`, set as
      `SANITY_WEBHOOK_SECRET` in Vercel **and** as a custom `x-vercel-webhook-secret` HTTP
      header in Sanity — not in Sanity's `Secret` field. Webhook scoped to one dataset,
      firing on Create + Update + Delete. Full steps:
      [SANITY_WEBHOOK_SETUP.md](reference/deployment/SANITY_WEBHOOK_SETUP.md).
- [ ] Lead form submits to the correct destination with the correct source/client identifier.
- [ ] Turnstile works or is explicitly disabled for staging only.
- [ ] GA4 and CallRail scripts load only for the current client.
- [ ] Phone links and map embeds work.

### SEO QA
- [ ] `SITE_URL`, canonical tags, Open Graph URLs, sitemap URLs, and robots sitemap all use the production domain.
- [ ] Redirect map tested for old WordPress URLs and no-slash URLs.
- [ ] Sitemap loads and sampled URLs return 200.
- [ ] No accidental `Disallow: /`.
- [ ] Ahrefs or equivalent crawl has no critical 404/internal-link issues, if available.
- [ ] Schema validates for home and representative inner pages.

### Launch Approval
- [ ] Mark or named approver signs off on staging.
- [ ] Rollback path documented: DNS revert, Vercel rollback, or previous WordPress host details.
- [ ] Launch window agreed.
- [ ] DNS owner and Vercel owner available during launch.

## 4. During Launch

Use this on launch day.

### Before DNS Change
- [ ] Latest production deployment is the approved build.
- [ ] Vercel production branch is correct.
- [ ] Production domain is added to Vercel.
- [ ] DNS records to change are listed before editing.
- [ ] Old WordPress/admin access remains available for rollback.
- [ ] Fresh backup/export exists for WordPress and Sanity where applicable.

### DNS And Production Switch
- [ ] Apex domain points to Vercel using the expected A record.
- [ ] `www` points to Vercel using the expected CNAME.
- [ ] No conflicting apex CNAME remains.
- [ ] HTTPS certificate is active.
- [ ] Production site loads on apex and `www`.
- [ ] Canonical preferred host redirects correctly.

### Immediate Live Smoke Test
- [ ] Home page returns 200.
- [ ] Contact page returns 200.
- [ ] One service page returns 200.
- [ ] One location page returns 200.
- [ ] Blog index and one blog post return 200, if in scope.
- [ ] A missing URL returns the expected 404.
- [ ] Lead form test submission arrives in the correct destination.
- [ ] Phone links use the correct numbers.
- [ ] CallRail number swap works, if enabled.
- [ ] GA4 Realtime sees the launch test visit, if enabled.
- [ ] `/robots.txt`, `/sitemap.xml`, and `/sitemap-index.xml` load on the production domain.

### After Launch
- [ ] Sanity content edit tested and revalidation confirmed.
- [ ] Redirect spot-check completed against the redirect map.
- [ ] Google Business Profile/site links updated if part of scope.
- [ ] Search Console property/sitemap submitted if access is available.
- [ ] Ahrefs or equivalent crawl scheduled.
- [ ] Launch notes recorded: deploy URL, DNS change time, issues, fixes, rollback notes.
- [ ] Any deferred issues added to `TASKS.md` or the client backlog.
