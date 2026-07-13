# FFS Astro+Sanity Pre-Launch QA Checklist

Applies to all FFS Astro+Sanity sites (HeatTech, BBBGN, TBBP, Chapman, future builds).
Run before any go-live, and re-run the **Domain & SEO** section after any deploy that touches `astro.config.mjs`, sitemap, `robots.txt`, redirects, or canonicals.
For the full stage-gate checklist from requirements through launch, use `project-docs/LIFECYCLE-CHECKLIST.md`.
Last updated: 2026-06-15 (created after BBBGN shipped with the dead preview domain in its sitemap → 86 false 404s in Ahrefs).

---

## 1. Domain & SEO (the section that caused the BBBGN incident — never skip)

The single most common bug is the **wrong domain hardcoded somewhere**: a `.vercel.app` preview URL, or another FFS site's domain copy-pasted in. Verify the production domain (e.g. `https://bedbugsbegonenow.com`) is correct and consistent in ALL of:

- [ ] `astro.config.mjs` → `site` is the production domain (NOT a `*.vercel.app` URL).
- [ ] `src/pages/sitemap.xml.ts` and `sitemap-index.xml.ts` → derive the domain from `context.site` (single source of truth), not a hardcoded string.
- [ ] `public/robots.txt` → `Sitemap:` line points to THIS site's domain (not HeatTech/TBBP/another project).
- [ ] Canonical tags on a live page point to the production domain with the correct trailing slash.
- [ ] Open Graph / Twitter `og:url`, `og:image` use the production domain.
- [ ] Fetch `/sitemap.xml` on the live domain and spot-check 3–4 `<loc>` URLs actually return 200 (not the preview domain, not 404).
- [ ] `robots.txt` is reachable and not `Disallow: /`.
- [ ] No leftover `*.vercel.app` references in `src/`, `public/`, or config: `grep -rn "vercel.app" src public astro.config.mjs`.

## 2. Routing & redirects

- [ ] `trailingSlash: 'always'` in config AND `trailingSlash: true` behavior in `vercel.json` (no-slash URLs must not 404).
- [ ] Every renamed/changed slug has a 301 redirect in `vercel.json`.
- [ ] Footer/nav hrefs match the canonical trailing-slash form exactly.
- [ ] 404 page renders correctly for a genuinely missing URL.

## 3. Links & broken hrefs (the `/Contact Us Today!/` incident)

Sanity link fields — and WP-imported portable text — sometimes hold the **label text** in the href (e.g. `"Contact Us Today!"`, `"Learn More"`). `normalizeInternalHref` would otherwise turn that into a 404 like `/Contact Us Today!/` (it prepends `/` and appends a trailing slash to any string).

- [ ] No internal link resolves to a path containing spaces or label punctuation (check Ahrefs → "404 pages" and "Page has links to broken page").
- [ ] CTA/button hrefs in Sanity point to real destinations, not the button label (e.g. "Learn More" → the actual treatment page, "Contact Us Today!" → `/contact-us/`).
- [ ] Guard is in place: `normalizeInternalHref` (`src/lib/links.ts`) returns `undefined` for whitespace hrefs, and the portable-text link mark (`src/lib/portableText.ts`) renders plain text instead of falling back to the raw bad href.
- [ ] Ahrefs "Links to 404 pages" is empty after a fresh crawl.

## 4. Vercel / deploy

- [ ] Confirm the Vercel **production branch** matches the intended git branch (don't assume GitHub default == production).
- [ ] Production domain is attached in Vercel and resolves (not `DEPLOYMENT_NOT_FOUND`).
- [ ] `npm run build` passes locally.
- [ ] `npm run template:audit` passes locally (placeholder scan, route-mode scan, domain-leak scan, production build).
- [ ] Required env vars set in Vercel (Sanity project/dataset, webhook secret, Turnstile keys, automation webhook URL).

## 5. Performance (see PERFORMANCE-STANDARD.md for detail)

- [ ] PSI mobile ≥ 90; LCP < 2.5s, CLS < 0.1, TBT < 200ms on home + one location page.
- [ ] Every `<img>` has explicit width/height and a px-capped `sizes` (no trailing `vw`).
- [ ] Hero/LCP image preloaded; below-fold images `loading="lazy"`.
- [ ] Third-party scripts (CallRail, gtag) load async/deferred, never sync in `<head>`.

## 6. Functionality

- [ ] Lead form submits successfully and routes to the correct destination/clientId (per-location).
- [ ] Call-tracking numbers swap correctly (CallRail) after any script change.
- [ ] Phone/`tel:` links and map embeds work.
- [ ] Sanity content edits trigger ISR revalidation (webhook works).

## 7. Content / brand

- [ ] Brand name, logo, colors, phone numbers, and service-area cities are THIS site's — no other FFS project's content leaked in.
- [ ] Privacy Policy + Terms of Service pages exist and are linked.
- [ ] For WordPress migrations, run `npm run report:html-sections`. Every `htmlSection` is either converted to a standard section or explicitly approved as a legal/embed exception.
- [ ] Location and service pages have unique intros/body copy; no city-name-only swaps across pages.

---

### Quick grep before every go-live

```bash
grep -rn "vercel.app" src public astro.config.mjs        # no preview URLs
grep -rni "heattech\|topbedbug\|chapman\|tbbp" public/robots.txt src/pages/sitemap*.ts   # no cross-site leaks
```

After a deploy/crawl, also confirm Ahrefs shows **0** under both "404 pages" and "Links to 404 pages" (catches label-as-href links from §3).
