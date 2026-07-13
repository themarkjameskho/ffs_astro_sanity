> ⚠️ **STALE — kept for historical reference only.** Written for the {{FORK_SOURCE_PROJECT}} fork. For the current {{BRAND_ABBREV}} setup see [`{{BRAND_ABBREV}}_ISR_WEBHOOK.md`](./{{BRAND_ABBREV}}_ISR_WEBHOOK.md).

# On-Demand ISR Setup - Complete Guide

## Current Repo Status

- ✅ `astro.config.mjs` enables ISR (`expiration: 60`) and uses `SANITY_WEBHOOK_SECRET` as the bypass token.
- Historical note: older versions of this repo used pre-rendered dynamic routes. The current template uses `export const prerender = false` for dynamic CMS routes so Vercel renders on demand and caches via ISR.
- ✅ `src/pages/api/revalidate.ts` is implemented.
- ✅ `vercel.json` includes a no-cache header for `/api/revalidate`.
- ✅ `.env.example` documents `SANITY_WEBHOOK_SECRET`.

---

## ⚠️ Manual Steps Required (Do These Now)

### Step 1: Generate Secure Webhook Secret

Run this command in your terminal:

```bash
openssl rand -hex 32
```

This outputs something like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0`

**Copy this value** - you'll need it for Steps 2 and 3.

---

### Step 2: Add Environment Variable to Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Click **Environment Variables** (left sidebar)
3. Click **+ Add New**
4. Fill in:
   - **Name**: `SANITY_WEBHOOK_SECRET`
   - **Value**: Paste the token from Step 1
   - **Environments**: Select all three (Production, Preview, Development)
5. Click **Save**

⚠️ **Important**: Do this BEFORE redeploying, or the webhook won't work!

---

### Step 3: Redeploy from Vercel

After adding the environment variable:

1. Go to **Vercel Dashboard** → Your Project
2. Find the latest deployment
3. Click the **⋯ menu** → **Redeploy**
4. Select **"Use existing Build Cache"**
5. Wait for deployment to complete

---

### Step 4: Configure Sanity Webhook

1. Go to **https://sanity.io** → Your project
2. Click **Manage** (top right)
3. Go to **API → Webhooks**
4. Click **+ Create**

#### Webhook Details:

| Field | Value |
|-------|-------|
| **Name** | `vercel-revalidate-prod` |
| **URL** | `https://{{fork_source_slug}}pestcontrol.com/api/revalidate` |
| **HTTP Method** | `POST` |
| **Events** | ☑ Create, ☑ Update, ☑ Delete |
| **Include drafts** | ☑ Yes (optional) |

#### Add HTTP Header:

| Field | Value |
|-------|-------|
| **Key** | `x-vercel-webhook-secret` |
| **Value** | Paste token from Step 1 |

Click **Create**

---

### Step 5: Test the Webhook

1. In Sanity, find the webhook you just created
2. Click **Test delivery** (or find similar option)
3. Should see response with status **200** ✅

If you get **401**: Secret mismatch - go back to Step 1-3
If you get **500**: Check Vercel logs - `vercel logs`

---

### Step 6: Test End-to-End

1. Open your website in one window
2. Open Sanity in another window
3. **Edit any content** in Sanity (e.g., change a page title)
4. **Publish the change**
5. **Refresh your website** within 60 seconds (or immediately if webhook fires)
6. ✅ Should see updated content!

---

## 🔄 How It Works Now

### When you publish content in Sanity:

1. **Sanity triggers webhook** → Sends POST to `/api/revalidate`
2. **Webhook validates secret** → Confirms it's from Sanity
3. **API calls pages with** `x-prerender-revalidate` → Marks them for ISR refresh
4. **Pages revalidate** → Next visitor gets fresh content
5. **Content appears live** → Typically within seconds ✅

### Cache Strategy:

- **API Endpoint** (`/api/revalidate`): No cache (always fresh)
- **Pages**: Cached for ISR expiration (currently 60 seconds)
  - After expiry, pages automatically revalidate on next visit
  - If Sanity webhook fires, they revalidate immediately
  - **Best of both worlds**: Fast CDN + Fresh content

---

## ✅ What's Better Than Before

| Feature | Before | Now |
|---------|--------|-----|
| **Content Update Speed** | Manual redeploy or wait for expiry | Instant (webhook) / ≤ 60s |
| **Publishing Workflow** | Publish in Sanity → Wait | Publish → Live ✅ |
| **Cache Strategy** | None (static forever) | ISR (expiration + webhook) |
| **CDN Performance** | Good | Better (cached pages) |
| **Freshness** | Stale | Always fresh |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Webhook returns **401** | Check `SANITY_WEBHOOK_SECRET` in Vercel matches Sanity webhook header |
| Webhook returns **500** | Run `vercel logs` to see error details |
| Content still old after publish | Clear browser cache (Cmd+Shift+Delete) |
| Sanity webhook not firing | Test delivery manually in Sanity dashboard |
| Pages taking too long to update | ISR revalidates on next visit, max 60 seconds |

---

## 📋 Checklist

- [ ] Generated SANITY_WEBHOOK_SECRET with `openssl rand -hex 32`
- [ ] Added SANITY_WEBHOOK_SECRET to Vercel environment variables
- [ ] Redeployed from Vercel dashboard
- [ ] Created webhook in Sanity with correct URL and secret
- [ ] Tested webhook (got 200 response)
- [ ] Tested end-to-end (published content, saw update)

---

## 🚀 You're Done!

Your website now has **professional ISR with instant content updates**:
- ✅ Publish in Sanity → Content live immediately (webhook) or within 60 seconds
- ✅ CDN cached pages for fast performance
- ✅ Zero manual deploys needed
- ✅ Scalable to millions of pages

This is the standard setup for production company websites! 🎉
