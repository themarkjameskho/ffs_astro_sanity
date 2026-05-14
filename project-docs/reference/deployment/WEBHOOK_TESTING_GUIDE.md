# Webhook Setup & Testing Guide

## ✅ Webhook Configured

**Webhook URL:** `https://hmstr.app.n8n.cloud/webhook/0bc118b1-bc6d-49be-8c8f-f68d10628f4a`

**Environment Variable:** `AUTOMATION_WEBHOOK_URL` in `.env.local`

## How It Works

1. **User submits form** (Lead form or Coupon form)
2. **Form sends data** to `/api/contact` endpoint
3. **API endpoint** forwards data to your n8n webhook
4. **n8n processes** the submission (email notifications, CRM updates, etc.)

## Test Locally

### Option 1: Direct Form Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to any page with a form (e.g., `/contact`)

3. Fill out and submit the form

4. Check console for success/error messages

### Option 2: Manual cURL Test

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Test User&email=test@example.com&phone=918-416-7098&message=Test submission&formTitle=Test Form"
```

### Option 3: Check n8n Webhook Directly

Visit the n8n webhook URL in your browser to see:
- Recent executions
- Request payloads
- Response status

## Form Locations

### Lead Forms (Dynamic)
- Contact Page (`/contact`)
- Service pages with lead forms
- Any page with `leadFormSection`

### Coupon Redemption Form
- Triggered from hero section coupon cards
- Modal form when you click "Special Offer" buttons

## Environment Variables

Add to `.env.local` for local testing:

```env
AUTOMATION_WEBHOOK_URL=https://hmstr.app.n8n.cloud/webhook/0bc118b1-bc6d-49be-8c8f-f68d10628f4a
```

For Vercel/Production, add through Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add `AUTOMATION_WEBHOOK_URL` with your webhook URL
3. Apply to all environments (Production, Preview, Development)

## Form Fields Sent to Webhook

```json
{
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "918-416-7098",
  "message": "Form message content",
  "formTitle": "Contact Form | Coupon Redemption | Lead Form",
  "pageSlug": "current-page-slug",
  "referer": "referring-page-url",
  "submittedAt": "2025-11-26T15:30:45.123Z"
}
```

## Testing Checklist

- [ ] Lead form on `/contact` submits successfully
- [ ] Coupon form submission works
- [ ] Webhook receives data in n8n
- [ ] n8n sends confirmation email
- [ ] Error handling shows user-friendly message
- [ ] Phone number validation works
- [ ] Email validation works
- [ ] Required fields are enforced

## Troubleshooting

### Form shows error "Automation webhook is not configured"
- Check `.env.local` has `AUTOMATION_WEBHOOK_URL` set
- Restart dev server after changing `.env`

### n8n webhook receives nothing
- Check webhook URL is correct
- Verify n8n webhook is active
- Check browser console for submission errors

### Webhook returns 502 error
- n8n workflow might have an error
- Check n8n logs for details
- Verify webhook payload format

## Ready for Launch! ✅

All forms are configured and ready to receive submissions.
