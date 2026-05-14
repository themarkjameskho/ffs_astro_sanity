# Deployment Runbook — {{BRAND_ABBREV}} ({{BRAND_NAME}})

This is the {{BRAND_ABBREV}}-specific runbook. For the generic Astro+Sanity playbook see `astro-sanity-development-process.md`. For the daily ship loop see `dev-to-live-workflow.md`. For the WordPress→Astro migration that produced this build, see `wordpress-to-astro-migration.md`.

## 1. Overview

- **Live domain:** {{SITE_URL}}/
- **Preview domain (Vercel-managed):** https://{{VERCEL_PREVIEW_DOMAIN}}/
- **Hosting:** Vercel (`@astrojs/vercel` adapter)
- **DNS:** Cloudflare → A record at apex pointing to `76.76.21.21`; `www` CNAME to `cname.vercel-dns.com`
- **Source repo:** github.com/themarkjameskho/{{vercel_project_slug}}
- **Branch model:** `main` auto-deploys to production. Branches get preview URLs. No `develop` branch — small team, single environment.
- **Render mode:** `output: 'static'` with ISR (`expiration: 60`). Most pages are `prerender = false` so they SSR on first request and edge-cache for 60 seconds. Sanity webhook to `/api/revalidate` busts the cache instantly on content publish.
- **Build command:** `npm run build`
- **Output directory:** `dist` (Vercel adapter handles routing)

## 2. Environment Variables

All must be set in **Vercel → Project → Settings → Environment Variables**, scoped to Production + Preview + Development. After adding or changing a value, **redeploy** — env vars are baked at build time.

| Key | Scope | Source | Notes |
|-----|-------|--------|-------|
| `SANITY_PROJECT_ID` | server | Sanity Manage | Value: `{{SANITY_PROJECT_ID}}`. Safe to commit. |
| `SANITY_DATASET` | server | Sanity Manage | Value: `production`. |
| `SANITY_API_TOKEN` | server only | Sanity → API → Tokens | Read+write. Rotated 2026-05. Never commit. Never paste in chat. |
| `PUBLIC_SANITY_PROJECT_ID` | client | mirror of above | Needed by client-side Sanity helpers. |
| `PUBLIC_SANITY_DATASET` | client | mirror of above | Needed by client-side Sanity helpers. |
| `SANITY_STUDIO_PROJECT_ID` | studio | mirror of above | For local Studio dev. |
| `SANITY_STUDIO_DATASET` | studio | mirror of above | For local Studio dev. |
| `SANITY_WEBHOOK_SECRET` | server only | URL with secret query param | Vercel ISR revalidate URL: `https://{{VERCEL_PREVIEW_DOMAIN}}/api/revalidate?secret=<token>`. The bypass token is configured in `astro.config.mjs` under `vercel.isr.bypassToken`. |
| `AUTOMATION_WEBHOOK_URL` | server only | n8n workflow URL | Production: `{{AUTOMATION_WEBHOOK_URL}}`. Form submissions POST here from `/api/contact.ts`. |
| `PUBLIC_TURNSTILE_SITE_KEY` | client | Cloudflare Dashboard → Turnstile → {{BRAND_ABBREV}} widget | Identifies the Turnstile widget config. Safe to expose. |
| `TURNSTILE_SECRET_KEY` | server only | Cloudflare Dashboard → Turnstile → {{BRAND_ABBREV}} widget | Used by `/api/contact.ts` to verify tokens before forwarding to n8n. Never commit, never log. |

### Inline analytics + tracking (no env vars, hardcoded in MainLayout.astro)

These values live in `src/components/layouts/MainLayout.astro` because they're not secrets and they need to be in the document head/body without an env round-trip:

| Service | ID | Location in code |
|---|---|---|
| Google Analytics 4 ({{BRAND_ABBREV}} property) | `{{GA4_MEASUREMENT_ID}}` | `<script>` block early in `<head>` (deferred to `requestIdleCallback` or first user interaction) |
| CallRail company | `{{CALLRAIL_COMPANY_ID}}` (swap key `{{CALLRAIL_SWAP_KEY}}`) | `<script is:inline>` immediately before `</body>` (CallRail's recommended placement) |

> ⚠️ **Do NOT swap GA back to `{{LEGACY_GA_ID_DO_NOT_USE}}`.** That's {{FORK_SOURCE_PROJECT}}'s measurement ID — inherited from the fork. The current value (`{{GA4_MEASUREMENT_ID}}`) is {{BRAND_ABBREV}}'s. There's a code comment in MainLayout warning about this; do not strip it.

> ⚠️ **CallRail script must have `is:inline`.** Without it, Astro processes the tag as a build-time module and silently strips the external `src` from the deployed HTML. We hit this exact bug — preconnect to `cdn.callreports.com` was loading but the script tag was missing. The Turnstile script tag has the same requirement.

## 3. Pre-Deploy Checklist

Before pushing anything user-facing to `main`:

1. [ ] `npm run dev` renders the changed page locally
2. [ ] Browser console has no errors on that page
3. [ ] Forms still submit (test once if you touched anything form-related)
4. [ ] If you added an env var: it's also in Vercel → Settings → Environment Variables
5. [ ] If you added a third-party `<script src>`: it has `is:inline`
6. [ ] Commit message uses a conventional prefix (`feat:`, `fix:`, `perf:`, `a11y:`, `chore:`, `docs:`)
7. [ ] `git pull --rebase origin main` before push (avoid the "Updates were rejected" loop)

## 4. Release Workflow

For everyday code changes, the flow is:

```bash
cd /Users/Mark/Downloads/{{vercel_project_slug}}-main
git pull --rebase origin main
# ... make changes ...
git add -A
git commit -m "fix: <short description>"
git push origin main
```

Vercel auto-builds from `main`. Build typically completes in 60–90 seconds. Watch the deployment in Vercel → Deployments. **Read the build log if it fails** — the most common failure is a TypeScript error in Sanity types or a broken GROQ query.

For risky changes (Sanity schema migrations, redirect map edits, third-party integration swaps):

1. Branch first: `git checkout -b feature/<short-name>`
2. Push the branch and let Vercel build a preview URL
3. Verify the preview URL against the pre-deploy checklist
4. Open a PR → merge to `main` when ready

## 5. Post-Deploy Verification

Run within 5 minutes of every production deploy:

1. [ ] Vercel shows the new deployment as "Ready"
2. [ ] Open the live URL in incognito + hard refresh (Cmd+Shift+R)
3. [ ] DevTools → Network tab → reload → confirm 200 status on:
   - `cdn.sanity.io/...` (content)
   - `cdn.callreports.com/companies/{{CALLRAIL_COMPANY_ID}}/.../swap.js`
   - `js.callreports.com` (form tracker, loads after swap.js)
   - `www.googletagmanager.com/gtag/js?id={{GA4_MEASUREMENT_ID}}`
   - `challenges.cloudflare.com/turnstile/v0/api.js`
4. [ ] No console errors on the live URL
5. [ ] If your change is visible (copy, layout, etc.): it's actually visible
6. [ ] If you touched the form: submit a test entry, verify it lands in n8n
7. [ ] If you touched a tracking script: do a phone-call or GA Realtime test
8. [ ] Add a row to the Deployment Log (section 8 below) if the change is user-facing

### Force cache-miss verification

If the live URL still shows old content after deploy, force a cache miss to confirm the new build is being served:

```bash
curl -s "{{SITE_URL}}/?cb=$(date +%s)" | grep -oE '<title>[^<]+</title>'
```

If the response shows the new content with this query string, the build is live and you're just seeing the ISR edge cache (60-second expiration). If the response still shows old content with cache-busted query, the deploy didn't update — re-check Vercel.

## 6. Rollback Procedure

### Code rollback (fastest)

1. Vercel → Deployments → find the last known-good deployment.
2. Click ⋯ → **Promote to Production**. Vercel re-points the production alias at that build immediately (no rebuild).
3. Notify the client that you've rolled back and are investigating.
4. Open a Git revert commit when you're ready to land the rollback in source:
   ```bash
   git revert <bad-commit-sha>
   git push origin main
   ```

### Content rollback (Sanity)

Sanity keeps history per document. To roll back content:

1. Sanity Studio → open the document → click the timestamp dropdown next to the title → choose a previous version → Publish.
2. The webhook will fire automatically, invalidating ISR.
3. Hard-refresh the live URL to verify.

### DNS rollback

If the DNS swap broke (it did once — apex CNAME flattening issue), revert in Cloudflare:

1. Cloudflare DNS → delete the new A record at apex.
2. Re-add the previous record pointing back at the WordPress / old host IP (we kept `216.150.16.65` / Cloudways IPs in our records during {{BRAND_ABBREV}} cutover so we could revert).
3. Flush local DNS: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`
4. Verify with `dig <domain> +short`.

## 7. Known Operational Hazards

| Hazard | Mitigation |
|---|---|
| Env var added in Vercel but build was already running | Trigger a manual redeploy after saving env vars. They only apply to *new* builds. |
| Vercel auto-config dialog re-breaking DNS | If a "let Vercel manage your DNS" prompt appears in the Domains panel, **decline it**. It tried to replace our working A record with a broken CNAME setup more than once during {{BRAND_ABBREV}} cutover. |
| Cloudflare CNAME flattening at apex | Never have both an apex `CNAME` and an apex `A` record. The CNAME silently wins. Always use `A → 76.76.21.21` for apex with Vercel. |
| Browser favicon cache | Bump `?v=N` in the favicon link in `MainLayout.astro` when artwork changes. Browsers and Cloudflare cache favicons for days otherwise. |
| Astro stripping external `<script src>` | Always add `is:inline` to third-party `<script>` tags. Without it, Astro silently removes the tag from the deployed HTML. |
| ISR cache showing old content for up to 60s | Hard-refresh twice. First refresh re-renders SSR, second gets the fresh build from the edge. |
| GA gtag.js blocking TBT | We load GA with a manual `requestIdleCallback` + interaction-trigger defer. If a future change reverts this, mobile PageSpeed Performance drops 5–8 points. |
| CallRail "verifier never returns" | Script must be in `<body>` (right before `</body>`), not in `<head>`. CallRail's account-side checker doesn't detect head-mounted snippets. |

## 8. Deployment Log

| Date | Env | Commit | Summary | Owner | Notes |
|------|-----|--------|---------|-------|-------|
| YYYY-MM-DD | prod | <commit-sha> | Initial scaffold from ffs_astro_sanity template | <owner> |  |
|  |  |  |  |  |  |
