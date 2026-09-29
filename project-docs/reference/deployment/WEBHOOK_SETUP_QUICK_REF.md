> ⚠️ **STALE — kept for historical reference only.** Written for the {{FORK_SOURCE_PROJECT}} fork. For the current {{BRAND_ABBREV}} setup see [`{{BRAND_ABBREV}}_ISR_WEBHOOK.md`](./{{BRAND_ABBREV}}_ISR_WEBHOOK.md).

# 🚀 On-Demand ISR Setup - Quick Start

## What This Does
Whenever you publish content in Sanity, your website updates automatically without waiting for ISR cache expiry. **No manual redeploys needed!**

---

## 👉 DO THIS NOW (5 steps)

### Step 1: Generate Token
```bash
openssl rand -hex 32
```
Copy the output (looks like: `a1b2c3d4e5f6...`)

### Step 2: Add to Vercel
- Vercel Dashboard → Your Project → Settings → Environment Variables
- **Name**: `SANITY_WEBHOOK_SECRET`
- **Value**: Paste token from Step 1
- Click Save

### Step 3: Verify `/api/revalidate`
- Confirm `src/pages/api/revalidate.ts` exists
- Redeploy if you just added it

### Step 4: Create Sanity Webhook
- sanity.io → Your Project → Manage → API → Webhooks → + Create
- **Name**: `vercel-revalidate-prod`
- **URL**: `https://{{PRODUCTION_DOMAIN}}/api/revalidate`
- **Method**: POST
- **Events**: ☑ Create, ☑ Update, ☑ Delete
- **Add Header**: Key: `x-vercel-webhook-secret` | Value: Token from Step 1
- **Dataset**: pick the one dataset this deploy reads — not `* (all datasets)`
- **Leave `Secret` empty** — it signs a different header and yields 401
- Click Create

### Step 5: Test
- In Sanity: Find your webhook → Test delivery → Should get **200** ✅
- Edit a page, publish, refresh website → Should see update immediately ✅

---

## ✅ Done!

Your website now has instant content updates from Sanity.

**Need help?** Check `project-docs/reference/deployment/WEBHOOK_ISR_SETUP.md` for detailed troubleshooting.
