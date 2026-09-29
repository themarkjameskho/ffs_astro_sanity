> ⚠️ **STALE — kept for historical reference only.** This file was written for the {{FORK_SOURCE_PROJECT}} fork and references `{{fork_source_slug}}pestcontrol.com`. For the current {{BRAND_ABBREV}} setup (ISR config, Sanity webhook, secrets, troubleshooting), see [`SANITY_WEBHOOK_SETUP.md`](./SANITY_WEBHOOK_SETUP.md).

# ISR Setup Checklist - Action Items

## Current Status (Repo)
- ✅ `astro.config.mjs` enables ISR (`expiration: 60`) and uses `SANITY_WEBHOOK_SECRET` as bypass token.
- ✅ `/api/revalidate` endpoint implemented.
- ✅ `SANITY_WEBHOOK_SECRET` documented in `.env.example`.
- ✅ `vercel.json` includes no-cache header for `/api/revalidate`.

---

## If You Want On-Demand Revalidation (Recommended)

### 1) Add the revalidate endpoint
- Create `src/pages/api/revalidate.ts` (see `project-docs/reference/deployment/SANITY_WEBHOOK_SETUP.md`).

### 2) Add env var to Vercel
- **Name**: `SANITY_WEBHOOK_SECRET`
- **Value**: generate via `openssl rand -hex 32`
- Apply to Production, Preview, Development.

### 3) (Optional) Update `vercel.json`
- Add `Cache-Control: no-cache` for `/api/revalidate`.

### 4) Configure Sanity webhook
- **URL**: `https://{{fork_source_slug}}pestcontrol.com/api/revalidate`
- **Header**: `x-vercel-webhook-secret: <SANITY_WEBHOOK_SECRET>`
- Events: Create / Update / Delete.

### 5) Test end-to-end
- Publish content in Sanity → refresh site → confirm update within 60 seconds or immediately.

---

## If You Only Need Time-Based ISR
- Keep the current `expiration: 60` (or adjust it in `astro.config.mjs`).
- No webhook required.
