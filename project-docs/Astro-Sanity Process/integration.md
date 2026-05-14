# Astro ↔ Sanity Integration Guide

## Environment Variables
| Variable | Description | Where Used | Source |
|----------|-------------|------------|--------|
| `SANITY_PROJECT_ID` | Sanity project identifier | `sanityClient.ts`, Studio | Sanity Manage > Project Settings |
| `SANITY_DATASET` | Dataset name (`production`, `staging`, etc.) | `sanityClient.ts` | Sanity Manage > Datasets |
| `SANITY_API_TOKEN` | Read token for server-side fetches | `sanityClient.ts`, webhooks | Sanity Manage > API > Tokens |
| `SANITY_PREVIEW_TOKEN` | Draft-enabled token for preview routes | Preview endpoints | Sanity Manage > API > Tokens |
| `PREVIEW_SECRET` | Random string used to authenticate preview URLs | API route (`/api/preview`) | Generate locally, store securely |
| `TURNSTILE_SITE_KEY` | Client-side site key for Cloudflare Turnstile widget | Contact forms (frontend) | Cloudflare Turnstile dashboard |
| `PUBLIC_AUTOMATION_WEBHOOK_URL` | Overrides `/api/contact` if automation webhook needs a different endpoint | `ContactSection.astro`, `api/contact.js` | n8n or automation platform |

> Add any additional service credentials (e.g., Sentry DSN, analytics keys) in this table as they are introduced.

## Sanity Client (`src/lib/sanityClient.ts`)
```ts
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  perspective: 'published',
  token: import.meta.env.SANITY_API_TOKEN,
});
```

- Set `perspective: 'previewDrafts'` when preview mode is active.
- For public, cacheable content use CDN (`useCdn: true`) or add caching headers on fetch.

## GROQ Queries (`src/lib/queries.ts`)
- `ALL_PAGES` – Fetch slugs for `getStaticPaths`.
- `PAGE_BY_SLUG` – Retrieve page with sections, related data, SEO.
- `SITE_SETTINGS` – Global meta (logo, contact info, default SEO).
- Add query tests where possible (`npm run sanity:test-queries`).

## Preview Flow
1. User clicks “Preview” in Sanity Studio.
2. Studio hits `/api/preview` with `secret` and `slug`.
3. Endpoint validates `secret === PREVIEW_SECRET`, sets preview cookie, redirects to `/preview?slug=...`.
4. Preview page uses `SANITY_PREVIEW_TOKEN` to fetch draft content (set `perspective: 'previewDrafts'`).
5. User sees unpublished changes; removing cookie exits preview mode.

## Webhooks
| Name | Trigger | Destination | Purpose |
|------|---------|-------------|---------|
| `staging-revalidate` | `publish` events on `page`, `siteSettings` | `https://staging.example.com/api/revalidate` | Trigger ISR or rebuild |
| `prod-revalidate` | Same as above | `https://www.example.com/api/revalidate` | Keep production in sync |
| `dataset-backup` | Daily schedule | Cloud function / script | Optional backup |

**Setup Steps**
1. In Sanity Manage → API → Webhooks → Create new webhook.
2. Use POST method, include `Authorization` header with bearer token if required.
3. Enable `Filter` to limit to specific document types.
4. Test webhook delivery; confirm 200 response.

## Error Handling
- Log unmatched sections in `SectionRenderer` (`console.warn`) and raise backlog tickets.
- Use try/catch around Sanity fetches; redirect to `/` or 404 if data missing.
- Implement telemetry (Sentry) in API routes to capture failing webhooks.

## Caching Strategy
- For static builds, rely on Astro’s prerendering; use incremental/static regeneration via hosting provider when webhook fired.
- For SSR/Edge, add caching headers (e.g., `Cache-Control: s-maxage=60, stale-while-revalidate=300`).

## Cloudflare Turnstile (Spam Protection)
1. Create a Turnstile site in Cloudflare and note the **site key** (used on the client).
2. Add the site key to the frontend form component via `TURNSTILE_SITE_KEY`.
3. The form serializes the Turnstile token (`cf-turnstile-response`) and sends it to n8n. Validate the token within your automation workflow using the Turnstile secret.
4. For local development without Turnstile, omit the widget or leave the site key blank.

## Security Notes
- Never expose API tokens in client-side bundles; only use `import.meta.env.SANITY_API_TOKEN` in server context.
- Rotate tokens quarterly; document token rotation procedure here once defined.
- Restrict webhook IPs or add signing secret if supported by hosting platform.

## Checklist
- [ ] `.env.example` lists all variables in this guide.
- [ ] Preview endpoint deployed and tested.
- [ ] Webhook delivery verified in both staging and production.
- [ ] Query tests added to CI (`npm run sanity:test-queries`).
- [ ] Token rotation calendar entry created.

## Sanity Studio Authoring UX
The Studio now ships with built-in guidance so editors can see how each option behaves without digging through design docs.

1. **Icons + Descriptions**
   - Every schema (`studio/schemaTypes`) imports a Lucide icon from `react-icons/lu` and sets a top-level `description`.
   - Individual `defineField` calls include short helper copy so content creators know when to use highlight text, how CTA subtitle placement works, or what background themes do. When cloning the setup, copy these definitions verbatim to keep parity between markets.

2. **CTA Fieldsets**
   - Sections that expose CTAs (Hero, Image Card, Icon Grid, Service Grid, Service Area, Two Column, CTA band) group the related fields under collapsible fieldsets. Editors see “CTA Settings” or “Secondary CTA Settings” by default, which keeps the form compact while preserving all advanced options.

3. **Desk Structure Enhancements**
   - `studio/deskStructure.ts` now organizes Pages by pageType with matching icons (Home, Pest Control, Bed Bug, etc.), plus quick access list items for Blog Posts and Global Settings. When building another site, update the `PAGE_GROUPS` array to match that brand’s sitemap.

4. **Dependency**
   - `react-icons` is added to `studio/package.json` to power the schema + desk icons. Include this package in any derived project so the Studio compiles without manual SVG imports.

5. **Deployment**
   - After schema changes, run `npm run deploy --prefix studio` to push the latest authoring experience to `https://{project}.sanity.studio/`. We already deployed {{FORK_SOURCE_PROJECT}}’s Studio, so editors will see the guidance immediately.

These UX affordances live entirely within Studio and do not affect front-end bundle size or performance.

## Contact Form → AI Automation Webhook
Use this workflow when sending form submissions to your automation tool (default `/api/contact` proxies to n8n). The form now posts using the `application/x-www-form-urlencoded` mime type end-to-end to match common automation expectations.

1. **n8n Preparation**
   - Create a Webhook node that accepts `POST` requests.
   - Configure authentication (shared secret header or Basic Auth). Share the expected header name/value with the dev team.
   - Set the response to return `200` quickly; handle long-running logic asynchronously.

2. **Frontend Configuration**
   - Add environment variable placeholders to `.env.example` (or environment dashboard):
     ```
     PUBLIC_AUTOMATION_WEBHOOK_URL=
     AUTOMATION_WEBHOOK_URL=
     ```
     `PUBLIC_` is safe for client-side overrides (e.g., preview builds); `AUTOMATION_WEBHOOK_URL` stays server-only for production secrets.
   - Lead forms (the new `leadFormSection` component) and legacy contact modules both submit to `/api/contact` unless a `formAction` is set on the section. The server route forwards to the env webhook, so you only change destinations in one place.
   - All forms serialize `FormData` with `URLSearchParams` and send it as `application/x-www-form-urlencoded`.
   - The server-side proxy (`src/pages/api/contact.ts`) forwards the payload using the same mime type and adds the `X-Forwarded-By: {{BRAND_ABBREV_LOWER}}-contact-form` header so downstream automation can identify the source.
   - Sample payload emitted to the automation webhook (URL encoded):
     ```
     firstName=Jane&lastName=Doe&email=jane%40example.com&phone=773-839-3893&zip=60614&preferredDate=2025-04-22&message=Need%20an%20inspection&pageSlug=contact&sectionKey=lead-form&formTitle=Contact%20{{FORK_SOURCE_PROJECT}}&layoutVariant=white&referer=https%3A%2F%2F{{fork_source_slug}}pest.com%2Fcontact&submittedAt=2025-04-20T16%3A35%3A41.000Z
     ```
   - Adjust mapping in your automation workflow to read URL-encoded inputs; n8n, Zapier, and similar tools auto-parse this format.

3. **Testing**
   - Use the n8n test URL in staging to confirm submissions arrive.
   - Inspect the workflow run data to ensure field mapping matches the form contract.

4. **Deployment**
   - Replace the test URL with the production webhook before launch.
   - Rotate the shared secret periodically and update both sides.

## Serverless Deployment Notes
We ran into a repeatable Vercel 500 (`FUNCTION_INVOCATION_FAILED`) after introducing `/api/contact`. The root cause: Vercel’s default Astro preset looked for `dist/server/entry.mjs`, but our build initially emitted only static assets. Fix steps:

1. **Adapter configuration**
   - Ensure `astro.config.mjs` imports the Vercel adapter (`import vercel from '@astrojs/vercel'` or `@astrojs/vercel/serverless'`) and sets `export default defineConfig({ adapter: vercel() })`.
   - Remove the manual `output: 'server'` override; the adapter determines the correct output format.

2. **Vercel runtime + framework overrides**
   - Commit `vercel.json` with:
     ```json
     {
       "framework": null,
       "buildCommand": "npm run build",
       "outputDirectory": ".vercel/output",
       "installCommand": "npm install",
       "functions": {
         "*": { "runtime": "nodejs20.x" }
       }
     }
     ```
   - Setting `framework: null` tells Vercel to deploy the `.vercel/output` bundle produced by Astro instead of assuming the legacy static preset.
   - Pinning `runtime` to Node 20 matches Astro’s engine requirement and prevents the default Node 18 runtime from crashing.

3. **Verification**
   - Run `npm run build` locally; the log should show `[@astrojs/vercel] Bundling function ... dist/server/entry.mjs`.
   - Deploy; serverless routes now succeed, and Vercel serves the generated bundle without `ERR_MODULE_NOT_FOUND`.

## Coupon Modal (Redeem Offer workflow)

Hero sections ship with a reusable Redeem Offer modal so every project launches with the same UX + automation contract. When enabling coupons in a new build, follow this checklist:

1. **Sanity schema updates**
   - `studio/schemaTypes/objects/heroSection.ts`: the `coupon` object contains:
     - `ctaTitle` – human-readable coupon name shown in the modal (e.g., "Initial Service").
     - `amount` – short offer text (e.g., "Now $69"). Requires a coupon image when present.
     - `subheading` / `description` – optional supporting copy for the hero card.
     - `ctaLabel` – button text (defaults to “REDEEM OFFER”). There is _no_ CTA link; clicks open the modal via JS.
     - `image` – artwork shown on the hero coupon card.

2. **Front-end wiring**
   - `HeroSection.astro` renders the coupon card and adds `data-coupon-trigger`, `data-coupon-title`, `data-coupon-offer`, and `data-service-name` attributes to the button. No extra wiring is required in content.
   - `MainLayout.astro` hosts the global coupon modal. The inline script listens for `[data-coupon-trigger]` clicks and injects those values into the modal headline, offer line, and hidden inputs before opening it.
   - The modal submits to `/api/contact` (or the automation webhook if `PUBLIC_AUTOMATION_WEBHOOK_URL` is set) with the following hidden fields: `couponTitle`, `service`, `formTitle`, `pageSlug`. Your automation workflow should read `couponTitle` to route leads to the correct campaign.

3. **Modal styling (reference implementation)**
   - Card: white background `#fdfdfd`, 3px dashed `#0675c9` border, rounded corners, {{FORK_SOURCE_PROJECT}} logo centered at the top.
   - Layout: Redeem Offer label → coupon title (`ctaTitle`) → offer amount (`amount`) → minimal form (First/Last, Email/Phone, Address, Message).
   - Buttons: single blue pill “Submit” button; no cancel button (the × icon handles dismissal).
   - All styling lives in the CSS block near the modal markup in `MainLayout.astro`. Reuse this block on future projects for consistency.

4. **Automation notes**
   - Form payloads are `application/x-www-form-urlencoded`. Ensure automation tools parse the body before mapping fields.
   - Always log coupon titles in CRM/email notifications so marketing can measure redemption by offer.

5. **QA checklist**
   - Clicking a hero coupon button opens the modal and displays the correct title + offer.
   - Form submission posts to the correct endpoint and includes `couponTitle` in the payload.
   - Escape key, overlay click, or the × button closes the modal.
   - Modal remains accessible on mobile (viewport width < 360px) without clipping.
