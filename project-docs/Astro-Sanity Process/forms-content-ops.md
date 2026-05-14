# Phase Guidance: Forms, Blog Operations, Optimization & Deployment

This guide documents the exact conventions we established while building the Heat Tech site so the same implementation can be repeated for new projects. Follow these steps verbatim; every section assumes the Astro + Sanity stack already mirrors the structure in this repo.

---

## 1. CTA Alignment & Color Rules (Reference Implementation)

**Why:** Every section now exposes collapsible CTA settings in Sanity and renders consistent buttons in Astro. Reuse the same pattern when cloning this site.

1. **Sanity schema setup**
   - Add a `fieldset` named `cta` (or `secondaryCta`) with `collapsible: true` and `collapsed: true`.
   - Fields inside the fieldset: `ctaLabel`, `ctaLink`, `ctaSubtitle`, `ctaSubtitlePlacement` (`above` or `below`), `ctaSubtitleHeadingLevel` (`h2`/`h3`).
   - Reference schemas for examples: `processSection.ts`, `iconGridSection.ts`, `serviceGridSection.ts`, `serviceAreaSection.ts`, `heroSection.ts`.
2. **Astro component rules**
   - CTA wrappers default to `flex flex-col items-center text-center gap-2` and only shift to `md:text-left md:items-start` when the section alignment requires it.
   - Buttons always have `class="btn-primary inline-flex justify-center mx-auto md:mx-0"` (center on mobile, realign on desktop).
   - Subtitle placement is honored by conditionally rendering `CtaSubtitle` above or below the button.
   - Color logic:
     - White/Yellow backgrounds use black body copy, blue highlight (`#0675c9`), blue buttons on yellow (`#0675c9`).
     - Blue/Dark Blue backgrounds use white body copy, yellow highlight (`#FFC83A`), yellow buttons.
3. **Testing checklist**
   - Sanity Studio: confirm CTA fieldset collapses/expands and defaults to `below` / `h3`.
   - Astro dev build: inspect Hero, CTA Section, Image Card, Service Grid, Service Area, Icon Grid on mobile and desktop; ensure buttons are centered on mobile and aligned with text on desktop.

> **Tip:** When cloning the site, copy the existing schemas/components instead of starting from scratch. All colors, typography, and spacing follow the same helpers.

---

## 2. Lead Capture Form (Replicable Pattern)

Goal: Create a reliable, production-ready lead form that captures user submissions and forwards to a webhook/CRM.

### ⚠️ Important: Hardcoded Forms are Recommended

**After production testing, we found that hardcoded forms are more reliable than component-based dynamic forms.** Here's why:

- **Dynamic Sanity-powered forms** (with field arrays) can have timing issues where scripts don't attach properly to dynamically rendered form elements
- **Hardcoded forms** guarantee the HTML structure exists when the script loads, ensuring event listeners attach correctly
- Both approaches work with the same submission endpoint and webhook flow

### Recommended Approach: Hardcoded Forms

1. **Schema (`leadFormSection` object)**
   - Minimal fields: `title`, `subtitle`, `body` (Portable Text), `backgroundTheme`, `alignment`, `successMessage`, `errorMessage`
   - **Do NOT include a `fields` array** - keep form fields hardcoded in the component
   - This schema primarily controls the section's appearance and messaging

2. **Astro Component (`LeadFormSection.astro`)**
   - Hardcode all form fields directly in the template (not generated from Sanity)
   - Standard fields to include:
     ```
     - First Name (text, required)
     - Last Name (text, required)
     - Phone Number (tel, required)
     - Email Address (email, required)
     - Address (text, required)
     - Method of Contact (select: "Call Me", "Email Me", "Text Me")
     - Best Time (select: "Morning", "Afternoon", "Evening")
     - Message (textarea, required)
     ```
   - Form submission handler:
     ```javascript
     form.addEventListener('submit', async (event) => {
       event.preventDefault();
       const formData = new FormData(form);
       const bodyData = new URLSearchParams();
       formData.forEach((value, key) => bodyData.append(key, value.toString()));
       
       // Show loading state
       submitBtn.disabled = true;
       defaultLabel.classList.add('hidden');
       loadingLabel.classList.remove('hidden');
       
       try {
         const response = await fetch(form.action, {
           method: 'POST',
           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
           body: bodyData.toString()
         });
         
         if (response.ok) {
           form.reset();
           statusEl.textContent = props.successMessage;
           statusEl.className = "min-h-6 text-center text-sm font-medium text-emerald-600";
         } else {
           throw new Error("Submission failed");
         }
       } catch (err) {
         statusEl.textContent = props.errorMessage;
         statusEl.className = "min-h-6 text-center text-sm font-medium text-red-600";
       } finally {
         submitBtn.disabled = false;
         defaultLabel.classList.remove('hidden');
         loadingLabel.classList.add('hidden');
       }
     });
     ```
   - Use `<script is:inline>` (NOT `type="module"`) for the form handler
   - Important: Use span visibility toggle for button states, NOT textContent changes

3. **Submission Endpoint**
   - Create `/src/pages/api/contact.ts` (Astro endpoint):
     ```typescript
     import type { APIRoute } from 'astro';
     
     const WEBHOOK_URL = import.meta.env.AUTOMATION_WEBHOOK_URL;
     
     export const POST: APIRoute = async ({ request }) => {
       if (request.method !== 'POST') {
         return new Response('Method not allowed', { status: 405 });
       }
     
       try {
         const formData = await request.text();
         
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
   - Set `AUTOMATION_WEBHOOK_URL` in `.env.local` (for local dev) and Vercel environment variables (for production)
   - The endpoint forwards form data to your webhook (e.g., n8n, Make, Zapier, or CRM)

4. **Form Configuration**
   - Form ID: `contact_form` (matches navigation hash in header)
   - Form action: `/api/contact` (absolute path, resolved at build time)
   - Hidden fields to include:
     ```html
     <input type="hidden" name="formTitle" value={props.title ?? 'Contact Form'} />
     <input type="hidden" name="pageSlug" value={pageSlugValue} />
     ```

5. **Testing Checklist**
   - ✅ Fill all required fields and submit
   - ✅ Verify button shows "Submitting..." while sending
   - ✅ Verify form stays on page (no redirect)
   - ✅ Verify success message appears in green below the form
   - ✅ Verify webhook receives the submission
   - ✅ Submit with empty required field - browser should show inline validation error
   - ✅ Test on mobile and desktop viewports
   - ✅ Test with slow network (DevTools throttling) - button state should be accurate

6. **Reference Implementation**
   - See `src/components/sections/LeadFormSection.astro` for current production code
   - See `src/components/layouts/MainLayout.astro` for the coupon form pattern (also hardcoded and working perfectly)
   - Both use identical submission logic and prove the pattern works reliably

### Alternative: Dynamic Forms (Advanced, Use with Caution)

If you need truly dynamic form fields from Sanity:
- Ensure the `<script is:inline>` block runs **after** all form elements are rendered
- Consider using Astro's `define:vars` to pass computed IDs to the script
- Add comprehensive console logging to debug script attachment issues
- **Recommendation:** Only use if fields need to change frequently without code deployment

> **Why We Chose Hardcoding:** For most projects, form fields are stable. Hardcoding eliminates the complexity of dynamic rendering and guarantees reliable form submission. The slight inconvenience of updating component code is far outweighed by reliability gains.

---

## 3. Blog Export / Import Workflow

Use this workflow anytime you need to migrate blog posts between projects/datasets.

1. **Export (source project):**
   ```bash
   cd studio
   sanity dataset export production ../backups/blog-production-$(date +%Y%m%d).ndjson \
     --types blogPost,author,category
   ```
2. **Import (target project):**
   ```bash
   cd studio
   sanity dataset import ../backups/blog-production-20250114.ndjson production \
     --replace --missing
   ```
3. **GROQ wiring:** ensure `src/lib/queries/pageByType.ts` and `pageBySlug.ts` request the blog fields you need (`featuredImage`, `slug.current`, `excerpt`, etc.).
4. **Astro pages:** add `src/pages/blog/[slug].astro` that receives the GROQ query result and renders SEO tags, breadcrumbs, and the Portable Text body.
5. **Verification checklist:**
   - Run `npm run dev` and open `/blog` plus a sample `/blog/my-post`.
   - Sanity Studio preview: editors should see a preview pane hitting Astro dev server.
   - Deploy preview build and spot-check OG tags/Lighthouse.

---

## 4. Optimization, SEO & QA Pass

Perform these steps before every release:

1. **Performance & bundle checks**
   - `npm run build && npx @11ty/eleventy-img --input dist` (optional) to ensure assets compress as expected.
   - `npx astro check --verbose` to catch type + accessibility regressions.
   - Run Lighthouse in Chrome for mobile + desktop (target 90+ performance).
2. **SEO**
   - Confirm every page sets `<title>`, `<meta name="description">`, canonical URL, OG and Twitter tags (use `src/components/Seo.astro`).
   - Ensure JSON-LD is injected for the business (`Organization` or `LocalBusiness`).
   - Validate sitemap: `npx astro build && npx sitemap-validator dist/sitemap.xml`.
3. **Accessibility + QA**
   - `npx @axe-core/cli http://localhost:4321` for automated checks.
   - Keyboard test each CTA (focus state visible, enter key submits forms).
   - Verify CTA buttons remain centered on mobile for every section.
4. **Content sanity**
   - Use `sanity query '*[_type == "page"]{title, count(sections)}'` to ensure no pages lost sections after migrations.

---

## 5. Deployment Playbook

1. **Astro site**
   - `npm run build` → upload `dist/` to host (Vercel/Netlify). For Vercel, add build step `npm run build` with Node 20.
   - Set env vars (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `PUBLIC_FORMS_ENDPOINT`, etc.).
2. **Sanity Studio**
   - Use Node 20.18 (`nvm use 20.18.0`).
   - `npm run deploy --prefix studio` (rerun if SSL hiccup occurs—you’ll see `sslv3 alert bad record mac` when the CLI uses the wrong Node version).
3. **Post-deploy checklist**
   - Visit `https://{{fork_source_slug}}.sanity.studio/` to confirm schema updates.
   - Smoke test `/` and `/contact-us` on production build; submit lead form with test payload.
   - Invalidate CDN cache if your host doesn’t auto-purge.

---

## 6. Phase Exit Criteria (Forms + Blogs + Optimization)

You can move to the next project only when the following are true:

1. ✅ Lead form component exists with hardcoded fields and passes submission testing
   - Form stays on page after submission
   - Success/error messages display correctly
   - Submissions are received by the webhook
   - Button state management works (shows "Submitting..." and resets properly)
2. ✅ Blog posts can be exported/imported via the documented commands and render correctly in Astro
3. ✅ CTA alignment/color rules are consistent across all sections (verified on mobile + desktop)
4. ✅ Lighthouse, axe, and Astro checks pass; SEO metadata is in place
5. ✅ Astro site and Sanity Studio are both deployed from the latest commit
6. ✅ API endpoint (`/api/contact`) is configured with proper webhook forwarding
7. ✅ Environment variables (`AUTOMATION_WEBHOOK_URL`) are set in production

### Production Launch Checklist

Before going live with a new site:

- [ ] Form tested on staging with real webhook
- [ ] Webhook receiving and processing submissions correctly
- [ ] n8n/Make/Zapier automation sending data to CRM
- [ ] Email confirmations being sent to team and/or customers
- [ ] Form validation working (required fields, email format, etc.)
- [ ] Error messages display if form submission fails
- [ ] Button disabled state prevents double-submissions
- [ ] Mobile viewport: form is usable and responsive
- [ ] Lighthouse score 90+ (performance, accessibility, best practices)
- [ ] All form fields match the CRM's expected field names
- [ ] Honeypot/spam protection configured if needed

Keep this document updated if any step changes—the goal is to reuse the exact process on every heat-treatment landing site going forward.
