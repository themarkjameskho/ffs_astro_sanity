# Bed Bug Be Gone Now Marketing Site

This repository contains the marketing website for Bed Bug Be Gone Now. The site is built with Astro, styled with Tailwind CSS, and powered by Sanity Studio as the CMS for dynamic pages and structured marketing content.

## Tech Stack
- **Astro** for the website front end
- **Tailwind CSS** for styling
- **TypeScript** for shared typing and component safety
- **Sanity Studio** for content management and dynamic page/content updates

## Getting Started
1. Install website dependencies:
   ```sh
   npm install
   ```
2. Start the Astro dev server:
   ```sh
   npm run dev
   ```
3. Install Sanity Studio dependencies:
   ```sh
   cd studio && npm install
   ```
4. Start Sanity Studio:
   ```sh
   cd studio && npm run dev
   ```

## Required Environment Variables
Create the appropriate `.env` files for the site and Studio with these values:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_TOKEN` (read access for draft/preview)
- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
- `SANITY_ORGANIZATION_ID`
- `SANITY_WEBHOOK_SECRET` (shared secret between Sanity webhook and `/api/revalidate`)
- `AUTOMATION_WEBHOOK_URL` (n8n form-submission endpoint)

## Available Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start the Astro development server |
| `npm run build` | Build the production Astro site |
| `npm run preview` | Preview the production build locally |
| `npm run sanity:dev` | Start Sanity Studio from the root project |
| `npm run sanity:deploy` | Deploy Sanity Studio |

## Project Structure
```text
/
├── public/                # Static assets
├── src/
│   ├── components/        # Layouts, UI, and section components
│   ├── lib/               # Data loaders, Sanity queries, and utilities
│   ├── pages/             # Astro routes and dynamic page entrypoints
│   ├── styles/            # Global CSS, tokens, and critical styles
│   └── types/             # Shared TypeScript types
├── studio/                # Sanity Studio project
└── project-docs/          # Internal project documentation
```

## Content Flow
- Page content is queried from Sanity and rendered through Astro dynamic routes.
- Sanity Studio manages reusable sections, marketing content, and dynamic page entries.
- Astro builds and serves published content from Sanity while keeping layout and presentation in the frontend codebase.

## Deployment & Live Updates

The site runs on Vercel with **ISR (Incremental Static Regeneration)**. Two separate update paths:

| What changed | How it propagates |
| --- | --- |
| **Content** (Sanity edit → Publish) | Sanity webhook → `POST /api/revalidate` → Vercel invalidates the page → fresh content on next request (seconds) |
| **Code** (git push to `main`) | Vercel auto-deploys → full rebuild (~2–3 min) |

**Production URL (dev):** `https://{{VERCEL_PREVIEW_DOMAIN}}`

**Sanity webhook config** (set up in `sanity.io/manage` → API → Webhooks):
- Name: `{{BRAND_ABBREV}}-webhook`
- URL: `https://{{VERCEL_PREVIEW_DOMAIN}}/api/revalidate` *(no `?secret=` query string)*
- Dataset: `* (all datasets)`
- HTTP method: `POST`
- HTTP Header (Advanced settings) — Name: `x-vercel-webhook-secret`, Value: same value as the `SANITY_WEBHOOK_SECRET` env var in Vercel
- Trigger on: ☑ Create ☑ Update ☑ Delete
- Drafts / Versions: unchecked
- Bottom "Secret" field in Advanced settings: leave blank

Common mistake: putting the secret in the URL as `?secret=...` instead of in HTTP Headers. The endpoint reads from the header.

All dynamic pages (`[...slug].astro`, blog posts, sitemaps) use `prerender = false` so they're ISR-eligible. Edge cache: 60 seconds.

Full setup, verification, and troubleshooting reference:
**[`project-docs/reference/deployment/{{BRAND_ABBREV}}_ISR_WEBHOOK.md`](./project-docs/reference/deployment/{{BRAND_ABBREV}}_ISR_WEBHOOK.md)**

## Troubleshooting
- If Astro type generation gets stuck, delete `.astro/` and restart the dev server.
- If Sanity content is not loading, verify the environment variables above are present and correct.
- Use the Node version in `.nvmrc` when working with Astro or Sanity Studio if you run into local runtime issues.
