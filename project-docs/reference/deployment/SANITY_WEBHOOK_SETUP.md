> ⚠️ **STALE — kept for historical reference only.** Written for the {{FORK_SOURCE_PROJECT}} fork. For the current {{BRAND_ABBREV}} setup see [`{{BRAND_ABBREV}}_ISR_WEBHOOK.md`](./{{BRAND_ABBREV}}_ISR_WEBHOOK.md).

# Sanity Webhooks Setup for Live Content Updates

## Problem
With ISR enabled, pages are cached and only refresh after cache expiry. The current config uses a 60-second ISR expiration, so updates can lag up to ~1 minute.

## Solution: Sanity Webhooks + On-Demand ISR (Optional)

This setup triggers revalidation **immediately** when you publish content in Sanity.

---

## Step 1: Verify the Revalidation API Endpoint

The endpoint now exists at:
- `src/pages/api/revalidate.ts`

It validates the webhook secret and triggers on-demand revalidation by calling page URLs with the `x-prerender-revalidate` header.

Note: ISR requires pages to be pre-rendered. Ensure dynamic routes like `src/pages/[...slug].astro` and `src/pages/blog/[slug].astro` include `export const prerender = true`.

---

## Step 2: Configure Sanity Webhook

### In Sanity Studio:

1. Go to **Sanity > Manage > API > Webhooks**
2. Click **+ Create Webhook**

### Webhook Configuration:

| Field | Value |
|-------|-------|
| **Name** | `vercel-revalidate` |
| **URL** | `https://{{fork_source_slug}}pestcontrol.com/api/revalidate` |
| **Events** | Select all three: |
| | ☑ Create |
| | ☑ Update |
| | ☑ Delete |
| **HTTP Method** | POST |
| **HTTP Headers** | Add header: |
| | Key: `x-vercel-webhook-secret` |
| | Value: [Your secret from Step 3] |

### Optional - Filter by Type:
Add this to only revalidate when specific content types change:

```json
{
  "_type": "page"
}
```

Or for all types:
```json
{}
```

---

## Step 3: Add Webhook Secret to Vercel

### In Vercel Dashboard:

1. Go to your project > **Settings > Environment Variables**
2. Add new variable:
   - **Name**: `SANITY_WEBHOOK_SECRET`
   - **Value**: Generate a secure random string (use: `openssl rand -hex 32`)
   - **Environments**: Production, Preview, Development

### To generate the secret:
```bash
openssl rand -hex 32
```

This outputs something like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

3. Copy this value
4. Use same value in Sanity webhook header (Step 2)
5. Redeploy Vercel to load the environment variable

⚠️ `astro.config.mjs` uses `SANITY_WEBHOOK_SECRET` as the ISR `bypassToken`. The same secret must be used in the Sanity webhook header.

---

## Step 4: Test the Webhook

### Test in Sanity:

1. Go back to **Sanity > Manage > API > Webhooks**
2. Find your `vercel-revalidate` webhook
3. Click **⋯ > Test delivery**
4. Check the response:
   - ✅ Status: 200 = Success
   - ❌ Status: 401 = Secret mismatch
   - ❌ Status: 500 = Server error

### Test in Real:

1. Edit any page in Sanity (change title, description, etc.)
2. Click **Publish**
3. Within 60 seconds (or immediately if webhook fires), check your website
4. Content should be updated!

---

## How It Works

1. **You publish in Sanity** → Triggers webhook
2. **Webhook sends POST** to `/api/revalidate` with secret
3. **Vercel validates secret** → Allows revalidation
4. **Vercel revalidates on next request** → On-demand ISR
5. **Next visitor sees new content** quickly

---

## Alternative: Time-Based ISR Only (Simpler, Less Immediate)

Time-based revalidation is already configured in `astro.config.mjs` via:

```javascript
adapter: vercel({
  webAnalytics: { enabled: true },
  isr: { expiration: 60 }
})
```

Increase `expiration` if you want longer cache windows. This approach is simpler but updates appear only after cache expiry.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook shows 401 | Secret mismatch - verify both values match exactly |
| Webhook shows 500 | Check Vercel logs: `vercel logs` |
| Content still not updating | Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete) |
| Pages revalidate but old content | Redeploy from Vercel dashboard to clear all caches |

---

## Recommended: Add Cache Headers for `/api/revalidate`

If you add the revalidate endpoint, set cache headers in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/api/revalidate",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    }
  ]
}
```

---

## Summary

✅ **Sanity webhooks** = Instant updates when you publish
✅ **Time-based ISR** = Updates every 1 hour (simpler setup)
✅ **Manual redeploy** = Quick fix but tedious

**Recommended for your site**: **Sanity Webhooks** (most professional, instant updates)
