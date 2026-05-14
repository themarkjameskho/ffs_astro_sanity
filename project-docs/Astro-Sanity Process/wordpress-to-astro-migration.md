# WordPress → Astro + Sanity Migration Playbook

This is the migration-specific companion to `astro-sanity-development-process.md`. Run this **before** Phase 6 (Astro Feature Development) of the main process — ideally during Phase 1 (Discovery), so the URL inventory and redirect map drive scope, and the parity audit drives the QA exit criteria. The checklists below are derived from the {{BRAND_ABBREV}} rebuild (May 2026), which was forked from an earlier {{FORK_SOURCE_PROJECT}} codebase and migrated from a WordPress + Cloudways stack to Astro + Sanity + Vercel.

## Why this exists as its own phase

A from-scratch Astro project follows the standard 11-phase playbook. A migration from a live WordPress site adds five concerns the standard playbook does not cover:

1. **Inherited-fork cleanup.** If the new build is a fork of another Astro site (we forked {{FORK_SOURCE_PROJECT}}), it carries that site's analytics tags, tracking snippets, brand copy, and even hardcoded domains. None of those are valid for the new client.
2. **URL inventory and parity.** The live WordPress site has indexed URLs Google relies on. Every one needs to either exist on the new site or have a 301 redirect, or you lose rankings.
3. **Content migration.** WordPress pages + blog posts need to move into Sanity without breaking image references, slug structure, or publish dates.
4. **DNS cutover.** The live domain is currently pointing at the WordPress host (e.g., Cloudways at 216.150.x.x). Pointing it at Vercel is a one-shot operation with a real chance of breaking the site if the apex A record vs CNAME interaction is mis-configured (we hit this exact bug — `apex CNAME` was winning over an attempted `A` record).
5. **Third-party drop-ins.** Forms, CallRail, GA, reviews widgets, push-notification SDKs, etc. — all need to be re-wired to the new tags/keys, not the inherited fork's.

## Outline

1. Pre-migration intake (fork audit + access)
2. Discovery & URL inventory
3. Inherited-fork cleanup
4. Content migration (WordPress XML → Sanity)
5. Redirect map
6. Parity & QA audit
7. DNS cutover
8. Post-cutover verification

---

## Phase A – Pre-Migration Intake

**Goals**
- Identify which assets we're inheriting (codebase, content, third-party accounts) and which are new.
- Get every credential needed before any code is touched.

**People & Roles**
- Project Owner (provides client accounts), Senior Developer, Account Manager / Client Success.

**Inputs**
- Client list of: domain name(s), Cloudflare / DNS account, hosting account (Cloudways/WP Engine/etc.), Google Analytics property ID, CallRail company ID, n8n / Zapier / HubSpot webhook URL, Sanity organization, any existing fork repo.

**Step-by-Step Checklist**
1. **Get credentials in writing.** Create a private 1Password (or equivalent) vault for the project. Required entries before coding starts:
   - GitHub repo + collaborator invites
   - Sanity project ID + admin invite
   - Vercel project + admin invite
   - Cloudflare DNS access
   - Google Analytics property (with new measurement ID)
   - CallRail company ID + swap snippet
   - Form-handler webhook URL (n8n, Zapier, HubSpot, etc.)
   - WordPress / Cloudways admin (for content export)
2. **Determine the source repo.** If forking an existing Astro+Sanity project, record both the source URL and the commit SHA being forked. Note known-inherited items in `project-docs/Astro-Sanity Process/requirements.md` so they're caught in Phase C.
3. **Document the WordPress baseline.** Pull `sitemap.xml`, `robots.txt`, and the HTML of the home page + 5 representative inner pages. Save raw copies under `project-docs/archive/wordpress-baseline/` so the new build's parity can be diffed against them later.
4. **Verify owner authority.** Confirm the client (not the prior agency) owns the domain registrar, the DNS zone, the analytics property, and the form webhook. Migrations stall when the prior agency still holds keys.

**Deliverables**
- Credential vault populated with every entry listed above.
- WordPress baseline archived under `project-docs/archive/wordpress-baseline/`.
- Source-fork commit SHA recorded in `requirements.md`.

**Exit Criteria**
- A new developer can log into every system from the credential vault alone.
- The baseline HTML snapshot + sitemap exist on disk.
- Client has confirmed ownership of domain, DNS, analytics, and webhook.

---

## Phase B – Discovery & URL Inventory

**Goals**
- Produce a definitive list of every URL on the WordPress site, classified into KEEP / RENAME / RETIRE.
- Use that list to size the Sanity content model and the redirect map.

**People & Roles**
- Senior Developer, Content Strategist, SEO Specialist (optional).

**Inputs**
- WordPress `sitemap.xml` + paginated sitemaps (most sites split into post-sitemap, page-sitemap, category-sitemap).
- GA traffic export (last 90 days) so KEEP/RETIRE decisions are data-informed.

**Step-by-Step Checklist**
1. **Fetch every sitemap variant.** WordPress sitemaps are usually split (`post-sitemap1.xml`, `page-sitemap.xml`, `category-sitemap.xml`, `service-area-sitemap.xml`). Pull them all.
2. **Build a single CSV** under `project-docs/reference/deployment/` with columns: `url, type, last_modified, ga_pageviews_90d, decision (KEEP|RENAME|RETIRE), new_slug, redirect_target`.
3. **Flag duplicate-slug fossils.** WordPress generates `-2` slugs when a duplicate is created and never cleaned up (we hit `/service-area/kenosha-wi-2/`). Add 301 entries for these to the canonical slug.
4. **Flag taxonomy URLs that don't survive.** WordPress `/category/*` and `/tag/*` pages don't map to Sanity by default. Decide once: either rebuild them as Sanity-backed pages, or 301 the whole subtree to `/blog/`.
5. **Cross-check against the live HTML.** Run `curl -s https://<site>/ | grep -oE 'href="[^"]+"'` on the top 10 pages by traffic and verify every internal link in that output is either in the inventory or 301'd.
6. **Decide canonical paths.** WordPress sites often have both trailing-slash and non-trailing-slash variants reachable. Pick one (Astro defaults to trailing-slash, which we use) and add the other side to the redirect map.

**Deliverables**
- `project-docs/reference/deployment/url-inventory.csv` (or similar) with all live URLs classified.
- `project-docs/reference/deployment/{{BRAND_ABBREV}}_REDIRECTS.md`-style document listing every 301.

**Exit Criteria**
- Every URL with ≥1 GA pageview in the last 90 days has a `decision` value (no blanks).
- Duplicate `-2` slugs, taxonomy URLs, and pagination URLs are all decided.
- The redirect map is reviewed by the SEO lead (or client) before any `vercel.json` redirects are written.

---

## Phase C – Inherited-Fork Cleanup

**Goals**
- Strip every brand, tracking, copy, and domain reference from the source fork. Leave nothing that could fire analytics into the wrong property or display the old brand name.

**People & Roles**
- Senior Developer, AI agent (for grep-and-replace passes).

**Inputs**
- The forked codebase + the source-fork brand name (e.g., "{{FORK_SOURCE_PROJECT}}").
- New client's brand tokens, analytics measurement ID, CallRail company ID, webhook URL, domain name.

**Step-by-Step Checklist**

> ⚠️ **This is where migrations silently leak.** Inherited GA tags send your traffic into the prior client's property. Inherited CallRail snippets route calls to the prior client's phone tracking. Both bugs were live in {{BRAND_ABBREV}} until we audited.

1. **Grep for the source brand.** Search every file under `src/`, `studio/`, `scripts/`, and `project-docs/`:
   ```bash
   grep -rni "<source-brand>" --include="*.{astro,ts,tsx,mjs,md,json,css}" .
   ```
   Replace with the new brand name. Re-grep until clean.
2. **Grep for the source domain.** Same search for hardcoded fork domain (e.g., `{{fork_source_slug}}pestcontrol.com`). Replace with the new domain in canonical URLs, OG images, sitemap URLs, schema.org JSON-LD, etc.
3. **Replace the GA4 measurement ID.** In `MainLayout.astro` (or wherever `gtag` is loaded), swap to the new property. **Verify in DevTools after deploy** that `gtag/js?id=G-NEW-ID` loads. Leave a code comment naming the old + new IDs and a "do not revert" warning — we hit a near-revert twice on {{BRAND_ABBREV}}.
4. **Replace the CallRail snippet.** Get the new company ID + swap key from the client's CallRail dashboard. Place the snippet **before `</body>`, not in `<head>`** — CallRail's account-side verifier doesn't detect head-mounted snippets. Add `is:inline` to the script tag so Astro doesn't strip it at build time (see "Astro `is:inline` gotcha" in `dev-to-live-workflow.md`).
5. **Replace the form webhook.** Update `AUTOMATION_WEBHOOK_URL` in `.env` AND in Vercel project env vars. If the form handler uses an `X-Forwarded-By` header (or similar), rename it to the new brand. Submit a real test entry and confirm it lands in n8n/Zapier with the new identifier.
6. **Replace mast-bar / hero / footer copy.** Source-fork copy ("Single-day {{FORK_SOURCE_PROJECT}} · 30-day re-treat free") leaks into the top bar, hero, footer pre-CTA, and meta descriptions. Search Sanity content as well — not just code.
7. **Replace favicon + brand mark.** Drop new `favicon.png` (and any high-res variant) into `public/`. Cache-bust the link with `?v=N` in `MainLayout.astro` because browsers cache favicons aggressively.
8. **Replace the `/src/assets/favicon.png` or any other source-fork shield/logo** sitting in `src/assets/`. Forks tend to leave these around.

**Deliverables**
- A grep-clean codebase: no references to the source-fork brand, domain, GA ID, or CallRail company ID remain.
- Verified live deploy showing the new GA + CallRail loading in DevTools Network tab.

**Exit Criteria**
- `grep -rni "<old-brand>\|<old-domain>\|G-<old-GA-id>\|companies/<old-callrail-id>" .` returns zero matches outside `project-docs/archive/`.
- A test phone call through the new CallRail swap-number shows up in CallRail's dashboard.
- A test form submission lands in the new webhook destination, not the old one.

---

## Phase D – Content Migration (WordPress XML → Sanity)

**Goals**
- Move WordPress pages and blog posts into Sanity without losing image references, slugs, publish dates, or categories.

**People & Roles**
- Senior Developer, Content Editor (for QA sweep).

**Inputs**
- WordPress XML export (`Tools → Export → All Content`).
- Sanity project ID + a write-scoped API token.

**Step-by-Step Checklist**
1. **Export from WordPress.** WP Admin → Tools → Export → All Content → Download Export File. Save the `.xml` under `project-docs/archive/wordpress-baseline/`.
2. **Audit before import.** Open the XML and confirm: (a) post count matches WP's "All Posts" view, (b) `<wp:post_status>` includes both `publish` and `draft` only if you want both migrated, (c) image URLs in `<content:encoded>` are absolute (they need to be downloadable from your dev machine).
3. **Write a one-shot import script** under `scripts/` (do **not** make it a long-lived service). The script:
   - Parses the XML
   - Downloads referenced images to Sanity via the asset API
   - Creates Sanity `blogPost` (or `page`) documents with slug, title, body (as portable text), publish date, categories
   - Idempotent on slug — running twice updates instead of duplicating
4. **Dry-run on staging dataset first.** Run with `--dataset=staging` or equivalent flag. Spot-check 5 posts in Sanity Studio. Verify body renders, images embed, slugs match.
5. **Promote to production dataset** only after the staging spot-check passes. Record the run with `submittedAt` so you can roll back by deleting documents created on that date.
6. **Re-render every imported post** through the Astro template at `localhost:4321/blog/<slug>/` and compare against the WordPress version. Fix any block types your portable-text serializer doesn't handle (we missed inline-image sizing on first pass — fix it in `src/lib/portableText.ts`).

**Deliverables**
- Idempotent import script under `scripts/`.
- All blog/page documents present in Sanity production dataset with matching slugs.

**Exit Criteria**
- Sanity post count equals the WordPress baseline post count (or differs by an explicit, documented exclusion list).
- Random-sample 5 blog URLs render in Astro with images intact and identical to WP.
- Slugs are unchanged from WP (or every changed slug has a redirect in Phase E).

---

## Phase E – Redirect Map

**Goals**
- Every WordPress URL with traffic continues to resolve on the new site, either natively or via 301.

**People & Roles**
- Senior Developer, SEO Specialist (optional).

**Inputs**
- URL inventory from Phase B.
- The decided canonical-trailing-slash convention.

**Step-by-Step Checklist**
1. Add redirects to `vercel.json` under `"redirects": [...]`. Use 301 (permanent). Wildcard patterns for taxonomies (`/category/:path*` → `/blog/`).
2. Group redirects by category in the JSON so future edits don't conflict: brand rename redirects, duplicate-slug redirects, taxonomy redirects, manual one-offs.
3. Document every redirect in `project-docs/reference/deployment/{{BRAND_ABBREV}}_REDIRECTS.md` (or equivalent), with: source URL, destination URL, reason, decision-maker.
4. **Test the redirect chain.** After deploy:
   ```bash
   for url in $(cat redirect-test-urls.txt); do
     echo -n "$url → "
     curl -sIL "$url" | grep -E "^(location|HTTP)" | tail -2
   done
   ```
   Every old URL should respond with `HTTP/2 308` (Vercel's 301 equivalent) then `200` at the final URL.
5. **Avoid redirect loops.** If `/foo` redirects to `/foo/`, make sure `/foo/` doesn't redirect back to `/foo`. Astro's `trailingSlash: 'always'` handles this if you let it.

**Deliverables**
- `vercel.json` updated with the full redirect map.
- `project-docs/reference/deployment/{{BRAND_ABBREV}}_REDIRECTS.md` documenting every entry.

**Exit Criteria**
- Every URL in the Phase B `KEEP` and `RENAME` categories returns 200 (directly or via redirect).
- Every URL in the `RETIRE` category returns 301 → `/blog/` or `/` (no 404s for URLs that previously had traffic).
- No redirect loops detected by the test command above.

---

## Phase F – Parity & QA Audit

**Goals**
- Confirm the new Astro site has equivalent or better content, SEO signals, and analytics than the WordPress site — **before** you swap DNS.

**People & Roles**
- Senior Developer, QA Lead, Content Editor, Project Owner.

**Inputs**
- New site on a Vercel preview URL (e.g., `{{VERCEL_PREVIEW_DOMAIN}}`).
- WordPress live site (still on `{{SITE_DOMAIN}}`).
- URL inventory + redirect map from Phases B and E.

**Step-by-Step Checklist**
1. **Fetch both sitemaps and diff them.** WordPress live vs Astro preview. Every URL on the live should either exist on the new site or be in the redirect map. Use:
   ```bash
   curl -s https://<live-wp>/sitemap.xml | grep -oE '<loc>[^<]+' | sort > wp.txt
   curl -s https://<preview>/sitemap.xml | grep -oE '<loc>[^<]+' | sort > new.txt
   diff wp.txt new.txt
   ```
2. **Verify GA + CallRail are firing on the preview.** Load the preview URL → DevTools → Network tab → reload. Confirm `gtag/js?id=G-<NEW>` and `cdn.callreports.com/companies/<NEW>` both have status 200.
3. **Run PageSpeed on 3 representative URLs** (homepage, a service-area page, a blog post). Record scores in `quality-matrix.md`. Mobile ≥ 85 and Desktop ≥ 95 are realistic targets when CallRail + GA are loaded; document the polyfill-floor anything below 90 is hitting.
4. **Test the form end-to-end.** Submit a test entry. Confirm it lands in n8n/Zapier with the new `X-Forwarded-By` (or equivalent) identifier. If Turnstile is on the form, also test the "submit without checking" path returns the friendly error message.
5. **Click every nav + footer link.** Easy to forget after content migration; an inherited fork's footer often has the old client's NAP (name/address/phone).
6. **Verify schema.org JSON-LD.** Run Google Rich Results test on the homepage. Local business name, phone, address, services should all match the new client.
7. **Verify favicon, OG image, theme-color meta.** Open in social previewers (linkedin.com/post-inspector, dev.twitter.com card validator).

**Deliverables**
- Parity audit report (markdown ok) noting any discrepancies and their resolution.
- PageSpeed scores recorded in `quality-matrix.md`.

**Exit Criteria**
- Sitemap diff resolves to: every WP URL is either in the new site or in the redirect map.
- Form submission confirmed in the new webhook destination.
- GA + CallRail confirmed loading on preview.
- Project Owner has signed off on side-by-side comparison.

---

## Phase G – DNS Cutover

**Goals**
- Swap the live domain from WordPress to Vercel cleanly. Site stays up the entire time.

**People & Roles**
- Senior Developer (executes), Project Owner (notified, on standby).

**Inputs**
- Cloudflare (or other) DNS access.
- Vercel project with the production domain claimed but not yet pointing at it.
- Active business hours window — schedule the cutover when sales are quiet (early morning, weekend morning).

**Step-by-Step Checklist**

> ⚠️ **DNS bugs that bit us on {{BRAND_ABBREV}}.** Cloudflare's CNAME flattening at the apex caused our `A` record to be silently ignored when a `CNAME` also existed at apex. Vercel's "let Vercel manage DNS" auto-config kept trying to *re-add* the broken CNAME after we deleted it. Read both warnings below before touching DNS.

1. **Pre-flight check.** Confirm:
   - The new site is fully Phase F sign-off.
   - The current WordPress site is unchanged — no last-minute content changes to migrate.
   - Cloudflare's proxy (the orange cloud) state on your existing records, so you can match it.
2. **In Vercel:** Project → Settings → Domains → add the production domain (e.g., `{{SITE_DOMAIN}}` + `www.{{SITE_DOMAIN}}`). Vercel will tell you the target it expects (`76.76.21.21` for apex via A; `cname.vercel-dns.com` for www via CNAME).
3. **In Cloudflare DNS:**
   - **Delete any existing apex `CNAME` record.** If you skip this, Cloudflare's CNAME flattening will keep serving the old target.
   - Add an `A` record at apex (`@`) pointing to `76.76.21.21`. Match the existing proxy state.
   - Confirm `www` is a `CNAME` to `cname.vercel-dns.com`. If it already pointed to the WP host, replace it.
4. **Decline Vercel's "let us manage your DNS" prompt** if it appears. We hit this exact loop: Vercel kept proposing to "fix" our DNS by replacing the working `A` record with the broken `CNAME` setup it preferred. Cancel that dialog every time it shows.
5. **Flush local DNS cache** before testing:
   ```bash
   sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
   ```
6. **Verify the swap propagated.** From your machine:
   ```bash
   dig <domain> +short
   # Expect: 76.76.21.21 (or a Vercel edge IP)
   ```
   From a third-party resolver (Google):
   ```bash
   dig <domain> @8.8.8.8 +short
   ```
   Both should match. If `dig` still returns the WP IP after 15 minutes, suspect a CNAME you missed at apex.
7. **Open the live URL in an incognito window.** Confirm it shows the new Astro site, not the WP site.

**Deliverables**
- Working live site on the new domain.
- DNS-cutover entry in `deployment.md` deployment log.

**Exit Criteria**
- `dig <domain>` from two resolvers returns Vercel's edge.
- Live URL loads the new Astro site without "Vercel: site not configured" or "Cloudways: site not found" errors.
- HTTPS certificate is valid (Vercel auto-provisions Let's Encrypt — usually within 60 seconds).

---

## Phase H – Post-Cutover Verification

**Goals**
- Confirm everything that should be tracking the new client *is* tracking the new client, and nothing is leaking back to the old config.

**People & Roles**
- Senior Developer, Marketing Lead (for analytics validation), Client (for first lead test).

**Inputs**
- Live site on the new domain.
- Access to GA, CallRail, and the form-webhook destination.

**Step-by-Step Checklist**
1. **Hard-refresh the live URL** in incognito. Open DevTools → Network tab → reload. Look for and confirm status 200 on:
   - `cdn.sanity.io/...` (content fetched from Sanity)
   - `cdn.callreports.com/companies/<NEW-ID>/.../swap.js`
   - `js.callreports.com` (form tracker)
   - `www.googletagmanager.com/gtag/js?id=G-<NEW>`
   - `challenges.cloudflare.com/turnstile/v0/api.js` (if Turnstile is on)
2. **Confirm no old IDs are loading.** Grep the Network tab (or `curl | grep`) for the previous client's GA ID or CallRail ID. If anything matches, you missed a file in Phase C.
3. **Phone-call test.** Dial the swap number shown on the live site from an unrecognized phone. Wait 2 minutes, then check the new CallRail dashboard for the call record. If it's missing, CallRail isn't loading (re-verify the script is in `<body>` with `is:inline`).
4. **Form test.** Submit a real (test) entry. Verify it lands in the new n8n/Zapier with the new `X-Forwarded-By` header.
5. **GA Realtime test.** Open analytics.google.com → Realtime → confirm your incognito visit shows up under the new property within 30 seconds.
6. **Re-run PageSpeed** on the live URL (now it gets real Core Web Vitals from field data). Record the post-cutover scores in `quality-matrix.md`.
7. **Submit the new sitemap** to Google Search Console under the migrated property (or set up a new property if the WP one was under a different ownership).

**Deliverables**
- Sign-off note in the deployment log confirming GA, CallRail, form, and Sanity content are all serving from the live domain correctly.
- PageSpeed snapshot post-cutover.

**Exit Criteria**
- A test phone call appears in the new CallRail dashboard.
- A test form submission appears in the new webhook destination.
- A test page view appears in the new GA property within 60 seconds.
- The site has been up for at least 24 hours without 5xx errors in Vercel's logs.

---

## Common Migration Failures (and how we found them)

| Failure | Symptom | Root cause | Where it bit us |
|---|---|---|---|
| Inherited GA tag | Traffic disappearing from your new property | Forked codebase still had source-client's `G-XXXX` | {{BRAND_ABBREV}} was firing into {{FORK_SOURCE_PROJECT}}'s GA for hours |
| Inherited CallRail | Calls not showing in your dashboard, but swap numbers display | Forked codebase still has source-client's company ID | Same fork-leak as above |
| CallRail "never returns a result" in their verifier | Script is in HTML but verifier doesn't detect it | Script was in `<head>`, CallRail spec wants `<body>` | Cory flagged via support chat |
| CallRail script silently missing from deployed HTML | Preconnect to callreports.com works but swap.js never loads | Astro strips external `<script src>` tags without `is:inline` | Caught only by view-source on the deployed page |
| DNS swap leaves site dead | `dig` returns WP host IP, browser shows "site not configured" | Apex `CNAME` existed alongside the new `A` record; Cloudflare's CNAME flattening won | Hour-long outage during {{BRAND_ABBREV}} cutover |
| Vercel re-breaking DNS | Working `A` record gets replaced with broken `CNAME` | Clicking "let Vercel manage DNS" overrides manual record | Loop until we declined the auto-config dialog |
| Source-fork brand in mast-bar / footer | Live site has old client's name in copy | Sanity dataset was cloned from fork with old content | "Single-day {{FORK_SOURCE_PROJECT}} · 30-day re-treat free" visible on {{BRAND_ABBREV}} live |
| WP `-2` duplicate slugs | 404s on URLs with traffic | WP makes `slug-2` when a duplicate is created | `/service-area/kenosha-wi-2/` had 90-day pageviews |
| Form leaking to old webhook | Test submissions land in source-fork's n8n flow | `AUTOMATION_WEBHOOK_URL` env var wasn't updated in Vercel | Submitted under "{{BRAND_ABBREV_LOWER}}-contact-form" identifier |

---

## Migration Sign-off Checklist (one-pager)

Stick this in the PR description or deployment ticket. Every item must be checked before DNS swap.

- [ ] Source-fork commit SHA recorded in `requirements.md`
- [ ] All credentials in shared vault
- [ ] WordPress baseline (sitemap + 5 page HTML) archived
- [ ] URL inventory CSV complete with KEEP/RENAME/RETIRE for every URL with GA traffic
- [ ] `grep` for old brand name returns 0 matches outside `project-docs/archive/`
- [ ] `grep` for old domain returns 0 matches outside `project-docs/archive/`
- [ ] GA measurement ID swapped + verified loading in DevTools
- [ ] CallRail company ID swapped + script placed before `</body>` with `is:inline`
- [ ] Form webhook URL swapped in `.env` AND in Vercel env vars
- [ ] Mast-bar, footer NAP, hero copy reviewed for inherited copy
- [ ] Favicon + brand mark replaced, cache-busted with `?v=N`
- [ ] WordPress XML import dry-ran against staging, then promoted to production
- [ ] Sanity post count matches WP baseline
- [ ] Redirect map in `vercel.json` covers every RENAME/RETIRE URL
- [ ] Redirect chain test command shows no 404s for URLs with traffic
- [ ] PageSpeed scores recorded for 3 representative URLs
- [ ] Preview parity audit signed off by Project Owner
- [ ] DNS swap plan reviewed (apex A record, no apex CNAME, declined Vercel auto-config)
- [ ] Post-cutover phone-call test passed in new CallRail
- [ ] Post-cutover form test passed in new webhook
- [ ] Post-cutover GA Realtime test passed in new property
- [ ] 24-hour uptime confirmed in Vercel logs
