# FFS Astro+Sanity Lifecycle Checklist

Use this checklist for every new build, rebuild, or WordPress migration before handing work between people or agents. It is mandatory guidance for both AI agents and human developers.

For a new build, use this checklist together with `project-docs/Astro-Sanity Process/astro-sanity-development-process.md`.

For a WordPress → Astro + Sanity migration, use this checklist together with `project-docs/Astro-Sanity Process/wordpress-to-astro-migration.md`.

Do not move to the next stage until the current section is complete or every open item is explicitly documented with an owner. It is intentionally stage-based so incomplete requirements do not leak into development, development output does not skip QA, and launch does not depend on memory.

## 1. Pre-Development Requirements

Do not hand the repo to development until these are either complete or explicitly marked as open decisions.

### Project Scope
- [ ] Project classified as one of: new build, WordPress migration, landing-page microsite, or rebuild.
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
- [ ] Mitch writer draft and Charlie editor review completed using `project-docs/agents/` and `project-docs/active/content-ops/WRITER_PROMPTS_AND_WORKFLOW.md`.
- [ ] Component map completed: every page maps to existing standard sections.
- [ ] Service-area and location-page uniqueness requirements documented.
- [ ] Redirect inventory started for migrations.
- [ ] Blog/import scope confirmed.

### Infrastructure Inputs
- [ ] Sanity project/dataset decision confirmed.
- [ ] Vercel project/domain decision confirmed.
- [ ] Required env vars listed: `SITE_URL`, Sanity vars, webhook secret, form webhook, Turnstile, GA4, CallRail.
- [ ] Form destination confirmed: n8n, Zapier, CRM, or temporary hold.
- [ ] DNS access and launch owner confirmed.

### Repo Readiness
- [ ] `template-setup.sh` values collected or replacement method documented.
- [ ] Client docs copied into `project-docs/clients/<client>/`.
- [ ] `README.md`, `AGENTS.md`, `tokens.css`, and deployment docs aligned to this client.
- [ ] `npm run template:audit` passes before handoff.

## 2. During Development

Use this checklist while pages, schemas, migrations, and components are being built.

### Build Discipline
- [ ] Build uses the existing Astro + Sanity architecture; no separate scaffold.
- [ ] New page content goes through Sanity page documents and standard section schemas.
- [ ] AI-written copy follows the Mitch -> Charlie workflow and includes Open Items instead of invented facts.
- [ ] New UI uses existing section/component patterns unless a new reusable pattern is justified.
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
- [ ] Charlie editor blockers are resolved or explicitly accepted by the approver.
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
- [ ] Sanity webhook reaches `/api/revalidate`.
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
