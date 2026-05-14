# Development → Live Workflow

This is the day-to-day loop for getting a change from "I just touched a file" to "it's live on the production domain." It complements the deeper phase work in `astro-sanity-development-process.md` and `deployment.md`. Follow this whenever you're shipping anything that isn't a from-scratch new project.

## TL;DR Loop

```
local edit → npm run dev (verify) → commit → git push origin main
        ↓
Vercel auto-deploys main in ~60–90 seconds
        ↓
ISR cache invalidates on first request (or via webhook from Sanity)
        ↓
hard-refresh live URL → verify → done
```

## Architecture this workflow assumes

- **Code:** `main` branch on GitHub auto-deploys to Vercel production. Feature work on `feature/*` branches gets preview URLs.
- **Build:** `output: 'static'` with `@astrojs/vercel`. Most pages have `prerender = false` so they're rendered at request time and cached at the edge via Vercel ISR (`expiration: 60`).
- **Content:** Sanity is the source of truth for page content. Content edits don't require a code deploy — a webhook from Sanity hits `/api/revalidate` and busts the ISR cache.
- **Env:** Local secrets live in `.env` (gitignored). Production secrets live in Vercel → Project → Settings → Environment Variables. Anything client-readable must be prefixed `PUBLIC_`.

## The three change types — pick the right path

| Change type | Where it happens | How it goes live |
|---|---|---|
| Code (Astro / TS / CSS) | Local editor → Git | Push to `main` → Vercel rebuild |
| Content (page copy, blog post, images) | Sanity Studio | Publish → webhook → ISR cache busts |
| Config / Env var | Vercel dashboard | Save + **redeploy** (env vars don't apply to the current build) |

Common mistake: changing an env var in Vercel and not redeploying. Builds bake env vars in at compile time, so the next request won't see the new value until you trigger a fresh deploy.

---

## Code Changes — Full Loop

### 1. Branch & develop locally

```bash
git checkout main
git pull --rebase origin main
# small/simple change: stay on main
# anything risky or in-progress: branch
git checkout -b feature/<short-name>
npm run dev   # starts Astro on localhost:4321
```

### 2. Verify locally before committing

Even for "obviously safe" changes:

- [ ] Visit the page you touched at `localhost:4321` and confirm it renders.
- [ ] Visit one unrelated page (e.g., `/blog/`) to confirm you didn't break global layout.
- [ ] Open the browser console — zero JS errors.
- [ ] If you touched a form: submit it. If you touched a navigation link: click it.

### 3. Commit with a meaningful message

Prefix conventions we use:

- `feat:` new capability
- `fix:` bug fix
- `perf:` performance work (PageSpeed-affecting)
- `a11y:` accessibility fix
- `chore:` no user-visible change (tooling, docs, refactor)
- `docs:` documentation only

```bash
git add -A
git commit -m "fix(callrail): add is:inline so Astro doesn't strip the external script tag"
```

### 4. Push to main (or open a PR if working on a branch)

```bash
git push origin main
```

If the push is rejected with "Updates were rejected because the remote contains work" — someone (or another machine) pushed since your last pull. Rebase and try again:

```bash
git pull --rebase origin main
git push origin main
```

> 💡 **Rebasing pattern.** If you find yourself rebasing every push, that's a sign work is happening on the same branch from multiple machines (e.g., you on one laptop, Claude Code on another). It's normal — just keep rebasing.

### 5. Watch the Vercel build

- Vercel → Deployments → your latest build should appear within 5 seconds of the push.
- Build typically takes 45–90 seconds.
- **Read the build log if it fails.** TypeScript errors and broken Sanity queries are the two most common failures.

### 6. Verify on the live URL

```bash
# Wait ~90 seconds after the deploy shows "Ready" in Vercel,
# then hard-refresh in incognito so you're not seeing a cached version.
curl -sI https://<live-domain>/ | head -5
# Look for: x-vercel-cache: MISS (first request) or HIT (subsequent)
```

For pages cached aggressively at the edge, force a cache miss to verify the new build is being served:

```bash
curl -s "https://<live-domain>/?cb=$(date +%s)" | grep -oE '<title>[^<]+</title>'
```

### 7. Mark the rollout complete

- Note the deploy in `deployment.md` deployment log if it's user-facing.
- If a client or team member is waiting on the change, paste them the live URL.

---

## Content Changes — Full Loop

Editors don't touch code. The flow is:

1. Editor logs into Sanity Studio (`/studio` route or `<sanity-org>.sanity.studio`).
2. Edits the document, clicks **Publish**.
3. Sanity fires a webhook at `https://<live-domain>/api/revalidate?secret=<token>`.
4. The revalidate endpoint invalidates the ISR cache for that route.
5. Next request to that page gets a fresh build.

### Verification checklist for editors

- [ ] Hard-refresh the live URL of the page they just edited.
- [ ] If the change doesn't show within 30 seconds, ping a developer — webhook may be misconfigured.

### When developers need to look at webhook failures

```bash
# In Sanity Manage → API → Webhooks → view delivery history
# Look for non-2xx responses on the most recent attempt.
```

Common failure modes:

| Symptom | Likely cause |
|---|---|
| Webhook returns 401 | `SANITY_WEBHOOK_SECRET` env var in Vercel doesn't match the secret in the Sanity webhook config |
| Webhook returns 500 | The route handler in `src/pages/api/revalidate.ts` crashed — check Vercel function logs |
| Webhook says "delivered" but page doesn't update | Hit the page once cold — ISR fills cache on first request, so the *next* visitor sees the new content |

---

## Env Var Changes — Full Loop

Most common pitfall in this workflow: editing `.env` locally, watching it work in dev, then forgetting that the live site can't see it.

### Rules

1. **`.env` is gitignored.** Whatever you put in it stays on your laptop.
2. **Vercel env vars are the source of truth for production.** Vercel → Project → Settings → Environment Variables.
3. **Variables with `PUBLIC_` prefix are visible in the browser.** Everything else is server-side only.
4. **Env vars are baked at build time.** Adding or changing a var requires a redeploy — Deployments → ⋯ on the latest → Redeploy.

### When adding a new secret (example: a new third-party API key)

1. Add a placeholder entry to `.env` locally so you can develop:
   ```
   NEW_API_KEY=__PASTE_KEY_HERE__
   ```
2. Update `.env.example` with the placeholder (this gets committed; the real `.env` does not).
3. Add the same key to Vercel with the real value, scoped to all three environments (Production, Preview, Development).
4. Trigger a redeploy.
5. Verify the deployed page can read the env var (look for the expected behavior, e.g., the new API call succeeding).

### Graceful-fallback pattern

When a feature depends on an env var that might not be set yet (during the gap between code deploy and Vercel env-var setup), guard the feature so missing keys disable it rather than crashing the page:

```ts
const FEATURE_ENABLED =
  typeof process.env.MY_KEY === 'string' &&
  process.env.MY_KEY.length > 0 &&
  !process.env.MY_KEY.startsWith('__PASTE_');
```

We use this pattern for Cloudflare Turnstile in `LeadFormSection.astro` so a missing secret doesn't break the form.

---

## Gotchas worth knowing

### Astro `<script>` tags — use `is:inline` for external `src`

Astro processes any `<script>` tag without `is:inline` as a build-time module. If the script has nothing to bundle (just an external `src`), Astro silently **strips it from the output HTML**. This bit us on CallRail.

**Always do this for third-party scripts:**

```astro
<script is:inline src="https://cdn.example.com/widget.js"></script>
```

**Not this:**

```astro
<script src="https://cdn.example.com/widget.js"></script>
```

### Browser favicon cache is aggressive

Even after deploy, browsers and Cloudflare keep serving the old favicon for hours. Cache-bust with a version query string:

```astro
<link rel="icon" type="image/png" sizes="any" href="/favicon.png?v=3" />
```

Bump the `?v=N` any time the favicon artwork changes. The file URL stays the same; the query string forces a re-fetch.

### Vercel ISR cache lag

After deploy, the first request to a route does the SSR work; subsequent requests get the edge-cached HTML for up to 60 seconds. So if you hard-refresh once and the new version isn't there, refresh once more. The second request usually shows the new build.

### Vercel build vs Vercel deploy

Pushing to `main` triggers a *build*. The build produces a deploy. The deploy goes live a few seconds later. "Ready" in the Vercel UI means the build succeeded, not necessarily that DNS-fronted requests are hitting it yet. Wait 60–90 seconds before declaring success.

### Branch vs `main` workflow

We're loose about this. For {{BRAND_ABBREV}} we pushed most changes directly to `main` because there's a single developer + single environment. For anything risky (Sanity schema migrations, redirect changes, third-party integration changes), branch first and use the Vercel preview URL to test before merging to `main`.

---

## Pre-Push Checklist (one-pager)

Stick this in your terminal alias or PR template. Run through it before every push to `main`.

- [ ] `npm run dev` still renders the page you changed
- [ ] Browser console has zero errors on that page
- [ ] If you touched a form: it submits successfully
- [ ] If you touched navigation: every link still works
- [ ] If you touched a `<script>` tag: it has `is:inline` (unless it's a bundled module)
- [ ] If you added an env var: it's also in Vercel → Settings → Environment Variables
- [ ] Commit message has a conventional prefix (`feat:`, `fix:`, `perf:`, etc.)
- [ ] `git pull --rebase origin main` before push to avoid merge mess

## Post-Deploy Verification Checklist (one-pager)

Run this within 5 minutes of every production deploy.

- [ ] Vercel deployment shows "Ready" (green)
- [ ] Live URL loads without errors (incognito + hard refresh)
- [ ] If the change is visible: it's visible
- [ ] Network tab shows GA, CallRail, Sanity, Turnstile (whichever are wired) returning 200
- [ ] No console errors on the live URL
- [ ] If you touched a route: that route returns 200
- [ ] If you touched a redirect: the old URL still 301s to the new URL
- [ ] Add a row to `deployment.md` deployment log if the change is user-facing
