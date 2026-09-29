# FFS Astro + Sanity Standard Template

This repository is the official Fast Forward Search Astro + Sanity starting point for home-service, pest-control, and bed-bug SEO sites. It supports Fresh Builds, WordPress Migrations, and Landing Pages/Microsites through one standardized, Sanity-driven shared-component system.

Start with [project-docs/START-HERE.md](project-docs/START-HERE.md). Every AI agent and developer must follow the lifecycle checklist, selected delivery track, and component/content standard before making a change.

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
- `src/components/sections/SectionRenderer.astro` is the one canonical marketing-section renderer. Do not add page-specific templates or slug/title/content-based presentation branches.

## Deployment & Live Updates

The site runs on Vercel with **ISR (Incremental Static Regeneration)**. Two separate update paths:

| What changed | How it propagates |
| --- | --- |
| **Content** (Sanity edit → Publish) | Sanity webhook → `POST /api/revalidate` → Vercel invalidates the page → fresh content on next request (seconds) |
| **Code** (git push to `main`) | Vercel auto-deploys → full rebuild (~2–3 min) |

**Production URL:** set with `SITE_URL` / `PUBLIC_SITE_URL`.

**Sanity webhook config** (set up in `sanity.io/manage` → API → Webhooks):
- Name: `<brand>-webhook`
- URL: `<production-site-url>/api/revalidate` *(no `?secret=` query string)*
- Dataset: `* (all datasets)`
- HTTP method: `POST`
- HTTP Header (Advanced settings) — Name: `x-vercel-webhook-secret`, Value: same value as the `SANITY_WEBHOOK_SECRET` env var in Vercel
- Trigger on: ☑ Create ☑ Update ☑ Delete
- Drafts / Versions: unchecked
- Bottom "Secret" field in Advanced settings: leave blank

Common mistake: putting the secret in the URL as `?secret=...` instead of in HTTP Headers. The endpoint reads from the header.

Dynamic CMS pages (`[...slug].astro`, blog posts, sitemaps) intentionally use `prerender = false`. They are rendered on demand and cached by Vercel ISR. Do not add `getStaticPaths()` to those routes unless the project intentionally switches back to pre-rendered static pages.

Full setup, verification, and troubleshooting references live under `project-docs/reference/deployment/`.

## Troubleshooting
- If Astro type generation gets stuck, delete `.astro/` and restart the dev server.
- If Sanity content is not loading, verify the environment variables above are present and correct.
- Use the Node version in `.nvmrc` when working with Astro or Sanity Studio if you run into local runtime issues.
