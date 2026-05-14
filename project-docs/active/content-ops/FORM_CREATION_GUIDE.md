# Form Creation Guide - {{FORK_SOURCE_PROJECT}}

A comprehensive guide to creating and deploying forms in the {{FORK_SOURCE_PROJECT}} Astro + Sanity stack.

---

## Quick Reference

**Form Type**: Hardcoded Astro component with inline script submission
**Submission Method**: POST to `/api/contact` → n8n webhook forwarding
**Framework**: Astro 5.x with TypeScript
**Status**: ✅ Production Ready (Desktop 99/100 PageSpeed)

---

## Step 1: Schema Setup (Sanity)

Add `leadFormSection` to your page schema:

```typescript
// studio/schemaTypes/page.ts
import { defineField } from 'sanity';

export const leadFormSection = defineField({
  name: 'leadFormSection',
  type: 'object',
  title: 'Lead Form Section',
  icon: () => '📋',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Form Title',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      title: 'Subtitle (optional)'
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      title: 'Description (optional)'
    }),
    defineField({
      name: 'backgroundTheme',
      type: 'string',
      title: 'Background Theme',
      options: {
        list: [
          { title: 'White', value: 'white' },
          { title: 'Blue', value: 'blue' },
          { title: 'Dark Blue', value: 'darkBlue' }
        ]
      },
      initialValue: 'white'
    }),
    defineField({
      name: 'alignment',
      type: 'string',
      title: 'Content Alignment',
      options: {
        list: [
          { title: 'Center', value: 'center' },
          { title: 'Left', value: 'left' }
        ]
      },
      initialValue: 'center'
    }),
    defineField({
      name: 'successMessage',
      type: 'string',
      title: 'Success Message',
      initialValue: 'Thanks! A {{FORK_SOURCE_PROJECT}} specialist will contact you shortly.'
    }),
    defineField({
      name: 'errorMessage',
      type: 'string',
      title: 'Error Message',
      initialValue: 'Something went wrong. Please call us directly while we fix the form.'
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Form Logo (optional)',
      description: 'Logo displayed above the form'
    })
  ]
});
```

---

## Step 2: Astro Component (`LeadFormSection.astro`)

Create a hardcoded form component with these characteristics:

✅ **Static HTML** - All form fields hardcoded, not generated from Sanity
✅ **Inline Script** - Uses `<script is:inline>` (NOT `type="module"`)
✅ **Proper State Management** - Uses span visibility, not textContent
✅ **Accessible** - Proper labels, aria-live regions, required attributes

### File Location
`src/components/sections/LeadFormSection.astro`

### Key Components

**1. Form ID**: Always use `contact_form` for navigation hash compatibility
```html
<form id="contact_form" method="post" action="/api/contact" class="space-y-4">
```

**2. Standard Fields to Include**
```
✓ First Name (text, required)
✓ Last Name (text, required)
✓ Phone Number (tel, required)
✓ Email Address (email, required)
✓ Address (text, required)
✓ Method of Contact (select: "Call Me", "Email Me", "Text Me")
✓ Best Time (select: "Morning", "Afternoon", "Evening")
✓ Message (textarea, required)
```

**3. Hidden Fields for Tracking**
```html
<input type="hidden" name="formTitle" value={props.title ?? 'Contact Form'} />
<input type="hidden" name="pageSlug" value={pageSlugValue} />
```

**4. Status Message Area**
```html
<div
  id="contact_form-status"
  class="min-h-6 text-center text-sm font-medium"
  aria-live="polite"
></div>
```

**5. Submit Button with Span Labels**
```html
<button type="submit" class="btn-primary" data-role="submit-btn">
  <span data-default-label>Submit</span>
  <span data-loading-label class="hidden">Submitting...</span>
</button>
```

**6. Form Handler Script**
```javascript
<script is:inline>
  const form = document.getElementById('contact_form');
  if (form) {
    const statusEl = document.getElementById('contact_form-status');
    const submitBtn = form.querySelector('[data-role="submit-btn"]');
    const defaultLabel = submitBtn?.querySelector('[data-default-label]');
    const loadingLabel = submitBtn?.querySelector('[data-loading-label]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const bodyData = new URLSearchParams();
      formData.forEach((value, key) => bodyData.append(key, value.toString()));
      
      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        if (defaultLabel && loadingLabel) {
          defaultLabel.classList.add('hidden');
          loadingLabel.classList.remove('hidden');
        }
      }
      
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: bodyData.toString()
        });
        
        if (response.ok) {
          form.reset();
          if (statusEl) {
            statusEl.textContent = 'Thanks! A {{FORK_SOURCE_PROJECT}} specialist will contact you shortly.';
            statusEl.className = "min-h-6 text-center text-sm font-medium text-emerald-600";
          }
        } else {
          throw new Error("Submission failed");
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = 'Something went wrong. Please call us directly while we fix the form.';
          statusEl.className = "min-h-6 text-center text-sm font-medium text-red-600";
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (defaultLabel && loadingLabel) {
            defaultLabel.classList.remove('hidden');
            loadingLabel.classList.add('hidden');
          }
        }
      }
    });
  }
</script>
```

### Full Component Template

See `src/components/sections/LeadFormSection.astro` for the complete production implementation.

---

## Step 3: API Endpoint (`/api/contact`)

Create `src/pages/api/contact.ts`:

```typescript
import type { APIRoute } from 'astro';

const WEBHOOK_URL = import.meta.env.AUTOMATION_WEBHOOK_URL;

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.text();
    
    if (!WEBHOOK_URL) {
      throw new Error('AUTOMATION_WEBHOOK_URL not configured');
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Forwarded-By': '{{BRAND_ABBREV_LOWER}}-contact-form'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return new Response(JSON.stringify({ error: 'Submission failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

---

## Step 4: Environment Configuration

### Local Development (`.env.local`)
```
AUTOMATION_WEBHOOK_URL=https://hmstr.app.n8n.cloud/webhook/YOUR_WEBHOOK_ID
```

### Production (Vercel)
1. Go to Vercel Project Settings → Environment Variables
2. Add: `AUTOMATION_WEBHOOK_URL` = `https://your-webhook-url`
3. Select: Development, Preview, Production
4. Save and redeploy

---

## Step 5: n8n Webhook Setup

### Create n8n Workflow
1. Log into n8n dashboard
2. Create new workflow
3. Add "Webhook" trigger node:
   - **Authentication**: None
   - **HTTP Method**: POST
   - **Response mode**: On Received
   - Copy the generated webhook URL

4. Add nodes as needed:
   - **HTTP Request** (optional) - Forward to CRM API
   - **Email** - Send confirmation email
   - **Slack** - Notify team

5. Deploy workflow and copy webhook URL

### Wire Webhook to Astro
Paste the n8n webhook URL into `AUTOMATION_WEBHOOK_URL` environment variable.

---

## Step 6: Testing Checklist

### Local Testing
- [ ] Run `npm run dev`
- [ ] Navigate to contact page
- [ ] Fill all required fields
- [ ] Click Submit
- [ ] Verify button shows "Submitting..."
- [ ] Verify success message appears in green
- [ ] Verify form stayed on page (no redirect)
- [ ] Check n8n webhook received data
- [ ] Test with empty required field - should show browser validation error
- [ ] Test on mobile viewport - form should be responsive

### Staging Testing
- [ ] Deploy to Vercel preview
- [ ] Test form submission end-to-end
- [ ] Verify webhook receives data
- [ ] Check email notifications (if configured)
- [ ] Monitor n8n workflow execution logs

### Production Checklist
Before deploying to production:
- [ ] Webhook URL is correct in Vercel env vars
- [ ] Form submission receives no server errors
- [ ] Success message displays correctly
- [ ] Team receives notifications from n8n
- [ ] Mobile viewport is responsive
- [ ] PageSpeed Lighthouse score is maintained (90+)
- [ ] Form fields match CRM expectations
- [ ] Spam/validation is working

---

## Troubleshooting

### Form Not Submitting
**Problem**: Button shows "Submitting..." but never completes
**Solution**:
- Check browser console for fetch errors
- Verify `/api/contact` endpoint exists
- Check `AUTOMATION_WEBHOOK_URL` is set
- Verify webhook is active in n8n
- Check network tab: Is POST request being sent?

### Success Message Not Appearing
**Problem**: Form submits but no message shows
**Solution**:
- Verify `contact_form-status` div ID exists in HTML
- Check script is using correct ID selector
- Verify response status is 200 OK
- Check browser console for JavaScript errors

### Form Redirects After Submit
**Problem**: Page leaves form section
**Solution**:
- Ensure `event.preventDefault()` is in submit handler
- Check that form `action` is `/api/contact` (not a full URL)
- Verify no `type="submit"` button triggers page navigation

### Webhook Not Receiving Data
**Problem**: n8n not getting form submissions
**Solution**:
- Verify webhook URL in Vercel matches n8n dashboard
- Check n8n workflow is deployed and active
- Monitor n8n logs for errors
- Test webhook with `curl`:
  ```bash
  curl -X POST https://your-webhook-url \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "firstName=John&lastName=Doe&email=test@example.com"
  ```

### Fields Not Appearing
**Problem**: Form shows without input fields
**Solution**:
- Check component is rendering (browser DevTools → Elements)
- Verify all field IDs are unique
- Check CSS classes aren't hiding elements
- Run `npm run astro check` for TypeScript errors

---

## Best Practices

1. **Always Hardcode Forms** - Don't generate from Sanity fields unless absolutely necessary
2. **Use `is:inline`** - Ensures script attaches to form before user interaction
3. **Manage State with Spans** - Toggle visibility, don't change textContent
4. **Validate on Client** - Use HTML5 `required` and `type` attributes
5. **Handle Errors Gracefully** - Show user-friendly messages, not technical errors
6. **Test on Mobile** - Forms must be responsive and easy to tap
7. **Monitor Submissions** - Set up email/Slack notifications for form data
8. **Keep Fields Consistent** - Match form fields to CRM field names exactly

---

## Reference Implementation

See the following files for working code:

- **Component**: `src/components/sections/LeadFormSection.astro`
- **API Endpoint**: `src/pages/api/contact.ts`
- **Coupon Form Reference**: `src/components/layouts/MainLayout.astro` (lines ~380-450)
- **Schema**: `studio/schemaTypes/sections/leadFormSection.ts`

---

## Deployment Notes

### Vercel Specific
1. Build command: `npm run build`
2. Install command: `npm install`
3. Output directory: `dist`
4. Node version: 20.x
5. Environment variables: Set in Vercel project settings

### Custom Domain
- Update DNS CNAME to Vercel
- SSL certificate auto-provisioned
- Forms work immediately on custom domain

---

## FAQ

**Q: Can I make form fields dynamic from Sanity?**
A: Yes, but it requires careful state management. See `forms-content-ops.md` for advanced patterns. Generally not recommended for reliability.

**Q: How do I add honeypot spam protection?**
A: Add a hidden field that bots fill but users don't see, then validate it server-side.

**Q: Can I customize the success message per page?**
A: Yes! Set `successMessage` in Sanity studio for each form section.

**Q: How do I track form submissions in Google Analytics?**
A: Add `gtag('event', 'form_submit', { form_name: 'contact' })` in the success handler.

**Q: What if webhook goes down?**
A: Add error logging and retry logic in the `/api/contact` endpoint, or use a service like Postmark that handles delivery guarantees.

---

## Version History

- **v1.0** (Nov 26, 2025) - Initial release with hardcoded form pattern. Tested in production with 99/100 PageSpeed score.

---

**Questions?** See `project-docs/Astro-Sanity Process/forms-content-ops.md` for additional context.
