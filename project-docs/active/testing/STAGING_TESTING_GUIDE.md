# Staging Testing Checklist - Before Going Live

## Current Setup Status

✅ **ISR Enabled**
- `astro.config.mjs` uses Vercel ISR with `expiration: 60`.
- Pages revalidate on the next request after cache expiry.

⚠️ **On-demand revalidation optional**
- `/api/revalidate` exists but requires a Sanity webhook and `SANITY_WEBHOOK_SECRET` to enable immediate updates.

---

## Testing Steps

### Step 1: Verify Vercel Build
1. Go to: https://vercel.com/projects → your project
2. Check the latest deployment (should be from your recent push)
3. Look for status: **✅ Ready** or ⏳ Building
4. If there are errors, check the build logs

### Step 2: Check Staging URL
Your deployment has a staging URL (different from production):
- **Production:** `https://{{fork_source_slug}}pestcontrol.com`
- **Staging/Preview:** `https://heat-tech-pest-control-*.vercel.app` (auto-generated)

Find it in Vercel dashboard under your deployment.

### Step 3: Test Build Locally (Optional but Recommended)
```bash
cd /Users/Mark/Downloads/Projects/heat_tech_pest_control
npm run build
```

### Step 4: Verify ISR Behavior
1. Edit a page in Sanity
2. Publish the change
3. Wait 60 seconds (cache expiry)
4. Refresh the staging URL
5. ✅ Confirm updated content appears

### Step 5: (Optional) Enable On-Demand Revalidation
If you want updates without waiting for cache expiry:
1. Implement `/api/revalidate` (see `project-docs/reference/deployment/SANITY_WEBHOOK_SETUP.md`)
2. Add `SANITY_WEBHOOK_SECRET` in Vercel
3. Create a Sanity webhook to `/api/revalidate`
4. Test delivery → expect **200**

---

## What to Check Before Going Live

**✅ All Green:**
- [ ] Vercel build succeeds
- [ ] Staging URL is accessible
- [ ] ISR refreshes content after 60s
- [ ] No console errors in browser
- [ ] Pages load fast

**If On-Demand ISR is enabled:**
- [ ] Sanity webhook configured and returns 200
- [ ] Edit → Publish → See update immediately

---

## Quick Troubleshooting

| Issue | Solution |
|------|----------|
| Build fails with TypeScript error | Run `npm run build` locally to see error |
| Content not updating | Wait for cache expiry (60s) or check webhook delivery |
| Staging URL not working | Check Vercel deployment status |
| ISR not revalidating | Ensure no build errors and retry after 60s |

---

## Environment Variables (Minimum)

**Required:**
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`

**Optional (if on-demand ISR is enabled):**
- `SANITY_WEBHOOK_SECRET`
