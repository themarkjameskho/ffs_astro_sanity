> ⚠️ **STALE — kept for historical reference only.** Written for the {{FORK_SOURCE_PROJECT}} fork. For the current {{BRAND_ABBREV}} setup see [`/project-docs/reference/deployment/{{BRAND_ABBREV}}_ISR_WEBHOOK.md`](../../reference/deployment/{{BRAND_ABBREV}}_ISR_WEBHOOK.md).

# Complete Astro + Sanity + Vercel Setup Guide

This document provides a comprehensive walkthrough of how to set up an Astro project with Sanity CMS and deploy it to Vercel. This configuration is production-tested and handles content updates, builds, and deployments correctly.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Dependencies](#dependencies)
3. [Environment Variables](#environment-variables)
4. [Sanity Configuration](#sanity-configuration)
5. [Astro Configuration](#astro-configuration)
6. [Vercel Setup](#vercel-setup)
7. [Build & Deployment](#build--deployment)
8. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
project-root/
├── src/
│   ├── components/
│   │   ├── sections/          # Section components rendered dynamically
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout wrapper components
│   │   └── analytics/         # Tracking components
│   ├── layouts/
│   │   ├── Base.astro         # Root layout wrapper
│   │   └── BaseLayout.astro   # Page layout with header/footer
│   ├── lib/
│   │   ├── sanity.ts          # Sanity client initialization
│   │   ├── sanityClient.ts    # Alternative client config
│   │   ├── queries.ts         # GROQ queries for content
│   │   ├── image.ts           # Image optimization utilities
│   │   ├── links.ts           # Link resolution helpers
│   │   └── section-adapters.ts # Legacy content transformation
│   ├── pages/
│   │   ├── [...slug].astro    # Dynamic page routes (catch-all)
│   │   ├── index.astro        # Homepage
│   │   ├── 404.astro          # 404 page
│   │   ├── robots.txt.ts      # SEO robots file
│   │   └── sitemap-*.xml.ts   # Dynamic sitemap generation
│   ├── styles/
│   │   ├── global.css         # Global styles
│   │   └── tokens.css         # Design tokens & CSS variables
│   ├── types/
│   │   ├── cms.ts             # TypeScript types for CMS content
│   │   └── site.ts            # Site-wide type definitions
│   ├── assets/
│   │   ├── fonts/             # Self-hosted fonts (.woff2)
│   │   ├── brand/             # Logo & brand assets
│   │   └── hero/              # Hero section images
│   ├── env.d.ts               # TypeScript environment variable types
│   └── components/
│       ├── SectionRenderer.astro  # Dynamic section rendering
│       └── analytics/
│           └── GoogleTag.astro    # Google Analytics component
│
├── studio/                    # Sanity CMS configuration (optional, can be external)
│   ├── schemas/               # Content type definitions
│   ├── components/            # Custom Sanity UI components
│   ├── sanity.config.ts       # Sanity studio config
│   └── sanity.cli.ts          # Sanity CLI config
│
├── public/
│   ├── robots.txt             # SEO robots directive
│   ├── sitemap.xsl            # Sitemap styling
│   └── videos/                # Video assets
│
├── api/                       # Serverless functions (Vercel)
│   └── contact.js             # Contact form handler
│
├── astro.config.mjs           # Astro configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── package.json               # Dependencies & scripts
├── .env.local                 # Local environment variables (not committed)
└── .gitignore                 # Git exclusions
```

---

## Dependencies

### Installation

```bash
npm install
```

### Key Dependencies

```json
{
  "dependencies": {
    "@astrojs/sitemap": "^3.6.0",      # Automatic sitemap generation
    "@sanity/client": "^7.11.2",       # Sanity CMS client
    "@sanity/image-url": "1.2.0",      # Image optimization builder
    "@tailwindcss/vite": "^4.1.14",    # Tailwind CSS integration
    "astro": "^5.14.1",                # Astro framework
    "groq": "^4.10.2",                 # Query language for Sanity
    "node-fetch": "^3.3.2",            # HTTP client for API calls
    "tailwindcss": "^4.1.14"           # Utility-first CSS framework
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.5",        # TypeScript checker
    "typescript": "^5.9.3"              # TypeScript support
  }
}
```

### Why These Dependencies?

- **@sanity/client**: Core library for querying Sanity CMS
- **@sanity/image-url**: Generates optimized image URLs with responsive sizing
- **groq**: Query language for Sanity (similar to GraphQL)
- **@astrojs/sitemap**: Auto-generates XML sitemaps for SEO
- **@tailwindcss/vite**: Integrates Tailwind as a Vite plugin for better bundling

---

## Environment Variables

### Local Development (`.env.local`)

Create `.env.local` in the project root (NOT committed to git):

```bash
# Sanity Configuration
SANITY_PROJECT_ID=f6y3bqzx
SANITY_DATASET=production
SANITY_API_VERSION=2023-10-01

# Public variables (safe to expose in client code)
PUBLIC_SANITY_PROJECT_ID=f6y3bqzx
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2023-10-01

# Third-party services
PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_key_here
PUBLIC_AUTOMATION_WEBHOOK_URL=https://your-webhook-url.com

# Secrets (server-side only)
TURNSTILE_SECRET_KEY=your_turnstile_secret_here
SANITY_WEBHOOK_SECRET=your_secure_webhook_secret
```

### TypeScript Environment Types (`src/env.d.ts`)

```typescript
interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly PUBLIC_AUTOMATION_WEBHOOK_URL?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly SANITY_DATASET?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  readonly SANITY_API_VERSION?: string;
  readonly PUBLIC_SANITY_API_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Why Public vs. Private Variables?

- **PUBLIC_*** variables: Exposed to client-side code, accessible in browsers
- **SANITY_*** variables: Server-side only, used during build and SSR
- **SECRET keys**: Never exposed to client, stored securely in Vercel

---

## Sanity Configuration

### Sanity Client Setup (`src/lib/sanity.ts`)

```typescript
import { createClient } from '@sanity/client';

const projectId = import.meta.env.SANITY_PROJECT_ID || 'f6y3bqzx';
const dataset = import.meta.env.SANITY_DATASET || 'production';
const apiVersion = import.meta.env.SANITY_API_VERSION || '2023-10-01';

export const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,  // Use CDN for faster reads (cached content)
});
```

### GROQ Queries (`src/lib/queries.ts`)

Example query structure for fetching pages:

```typescript
import groq from 'groq';

// Fetch all pages for static pre-rendering
export const ALL_PAGES = groq`
  *[_type == "page" && defined(slug.current)] | order(_createdAt asc) {
    _id,
    title,
    "slug": slug.current,
    pageType,
    "_updatedAt": coalesce(_updatedAt, _createdAt),
    "_createdAt": _createdAt
  }
`;

// Fetch single page with all content
export const PAGE_BY_SLUG = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    description,
    "slug": slug.current,
    sections[]{
      // Nested query to fetch section data
      ...,
      _type == "heroSection" => {
        title,
        subtitle,
        body,
        backgroundImage{asset->{url, metadata}, alt}
      }
    }
  }
`;
```

### Key Sanity Concepts

1. **CDN Mode** (`useCdn: true`): Caches content at edge, faster for reads
2. **API Version**: Pin to specific date to avoid breaking changes
3. **Dataset**: Usually `production` for live content, `staging` for drafts
4. **GROQ**: Query language; `*[condition]` selects docs, `| order()` pipes results

---

## Astro Configuration

### Main Config (`astro.config.mjs`)

```javascript
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.topbedbugexterminator.com',  // For sitemap generation
  
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,        // Split CSS into chunks for better caching
      minify: 'terser',          # Minify JavaScript
      rollupOptions: {
        output: {
          manualChunks: {
            tailwind: ['tailwindcss'],  # Separate Tailwind chunk
          },
        },
      },
    },
  },
  
  build: {
    inlineStylesheets: 'always',  # Inline CSS in HTML to avoid render-blocking
  },
});
```

**Note:** The current repo uses the Vercel adapter with ISR (`expiration: 60`) and `SANITY_WEBHOOK_SECRET` as the `bypassToken`. See `astro.config.mjs` for the authoritative config.

### Key Build Optimizations

- **CSS Code Split**: Separate CSS files for better cache invalidation
- **Inline Stylesheets**: Critical CSS inlined in HTML for faster FCP
- **Manual Chunks**: Tailwind CSS in separate bundle for better caching
- **Site URL**: Required for sitemap generation and canonical links

### TypeScript Config (`tsconfig.json`)

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsxImportSource": "astro",
    "jsx": "react-jsx"
  }
}
```

---

## Vercel Setup

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the project root directory

### Step 2: Environment Variables in Vercel

**Go to Project Settings → Environment Variables**

Add the following variables for all environments (Production, Preview, Development):

```
SANITY_PROJECT_ID=f6y3bqzx
SANITY_DATASET=production
SANITY_API_VERSION=2023-10-01
PUBLIC_SANITY_PROJECT_ID=f6y3bqzx
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2023-10-01
PUBLIC_TURNSTILE_SITE_KEY=your_key
PUBLIC_AUTOMATION_WEBHOOK_URL=https://...
TURNSTILE_SECRET_KEY=your_secret
SANITY_WEBHOOK_SECRET=your_secure_webhook_secret
```

⚠️ **Important**: Make sure `PUBLIC_*` variables are set to "Exposed to Client" if needed.

### Step 3: Build & Output Settings

In Vercel Project Settings → Build & Output:

- **Framework**: Astro (should auto-detect)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Deployment Triggers

By default, Vercel deploys on:
- Every push to `main` branch → Production
- Every push to other branches → Preview deployments
- Pull requests → Preview environments

**ISR is already enabled** in `astro.config.mjs` (`expiration: 60`), so content updates are picked up on the next request after cache expiry (no rebuild required).

**If you want immediate updates on publish**, set up on-demand revalidation:
1. Ensure `/api/revalidate` is deployed (already in `src/pages/api/revalidate.ts`).
2. Create a Sanity webhook to call `/api/revalidate` with your secret header (`SANITY_WEBHOOK_SECRET`).

---

## Build & Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Production Build Process

1. **Fetch Content**: Astro queries Sanity during build via GROQ
2. **Generate Static Pages**: Create HTML files in `dist/` directory
3. **Optimize Assets**: Images, CSS, JavaScript bundled and minified
4. **Deploy to Edge**: Vercel distributes `dist/` to global CDN

### How Pages Are Generated

#### Dynamic Page Routes (`src/pages/[...slug].astro`)

```astro
---
import { ALL_PAGES } from '../lib/queries';
import { sanity } from '../lib/sanity';

// Pre-render all pages
export async function getStaticPaths() {
  const pages = await sanity.fetch(ALL_PAGES);
  return pages.map(page => ({
    params: { slug: page.slug.split('/') },
    props: { page }
  }));
}

const { slug } = Astro.params;
const { page } = Astro.props;
---

<!-- Render page content here -->
```

**Result**: Static HTML files generated for:
- `/` (homepage)
- `/about` 
- `/services`
- `/contact`
- etc.

#### Content Updates Workflow

1. **Edit content in Sanity CMS**
2. **Publish changes**
3. **Webhook triggers Vercel build**
4. **Build fetches fresh content**
5. **Static HTML regenerated**
6. **New pages deployed to edge**

---

## Troubleshooting

### Issue: Vercel Build Fails After Git Commit

**Symptoms**: Code changes committed but build still fails; Sanity content unchanged.

**Causes & Solutions**:

1. **Missing Environment Variables**
   ```bash
   # Check Vercel Settings → Environment Variables
   # Verify SANITY_PROJECT_ID, SANITY_DATASET are set
   ```

2. **Build Command Incorrect**
   ```bash
   # Should be: npm run build
   # NOT: npm run dev
   ```

3. **Output Directory Wrong**
   ```bash
   # Must be: dist
   # NOT: .astro or build
   ```

4. **Outdated Build Cache**
   ```bash
   # Vercel dashboard → Deployments → Redeploy (with cache cleared)
   ```

5. **Node Version Mismatch**
   ```bash
   # In Vercel, set Node version in project settings
   # Recommended: 20.x or latest
   ```

### Issue: Sanity Content Not Updating on Site

**Symptoms**: Updated content in Sanity but site still shows old data.

**Solutions**:

1. **ISR Cache Not Expired Yet**
   ```bash
   # Wait 60 seconds for ISR cache to expire
   # Then refresh the page to trigger revalidation
   ```

2. **CDN Caching Old Content**
   ```bash
   # Vercel Settings → Caching → Purge all
   # Or wait for ISR cache to refresh
   ```

3. **On-Demand Webhook Not Configured (Optional)**
   ```bash
   # Create /api/revalidate endpoint
   # Sanity: Settings → API → Webhooks
   # URL: https://{{fork_source_slug}}pestcontrol.com/api/revalidate
   # Add header: x-vercel-webhook-secret
   # Test webhook delivery
   ```

4. **Sanity Query Returns Wrong Data**
   ```bash
   # Check GROQ query in src/lib/queries.ts
   # Test in Sanity API explorer
   # Verify slug.current matches URL structure
   ```

### Issue: Images Not Loading from Sanity

**Symptoms**: Broken image placeholders; 404 errors for image URLs.

**Solutions**:

1. **Missing Image Optimization Code**
   ```typescript
   // src/lib/image.ts should include:
   import imageUrlBuilder from '@sanity/image-url';
   
   export const urlFor = (src) => {
     return builder.image(src)
       .width(800)
       .auto('format')
       .quality(75)
       .url();
   };
   ```

2. **Image Not Published in Sanity**
   ```bash
   # Sanity: Verify image is uploaded and published
   # Check asset exists in dataset
   ```

3. **CORS Issues**
   ```bash
   # Sanity CDN should auto-allow; check Sanity dashboard
   # Verify project ID is correct in SANITY_PROJECT_ID
   ```

### Issue: Performance Issues After Deployment

**Symptoms**: Site slow; Lighthouse scores drop after deploy.

**Optimizations Already Configured**:

- ✅ CSS inlining (`inlineStylesheets: 'always'`)
- ✅ Image optimization via Sanity URL builder
- ✅ Tailwind CSS chunking for better caching
- ✅ Edge deployment for global CDN
- ✅ Static generation (no server rendering overhead)

**Additional Steps**:

```javascript
// In astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'always',  // Critical path optimization
  },
  // Enable compression on Vercel
  vite: {
    build: {
      minify: 'terser',           // Aggressive minification
    }
  }
});
```

---

## Complete Example: From Git Commit to Live Site

### Step-by-Step Workflow

```
1. Local Development
   ├─ Edit component/content
   ├─ npm run dev (test locally)
   └─ git commit & git push

2. GitHub Webhook Fires
   ├─ Repository updated
   └─ Vercel receives deployment trigger

3. Vercel Build
   ├─ npm install (dependencies)
   ├─ npm run build (Astro static generation)
   │  ├─ Fetch all pages from Sanity
   │  ├─ Generate static HTML files
   │  ├─ Optimize images & CSS
   │  └─ Output to dist/
   ├─ Run tests (if configured)
   └─ Deploy to edge network

4. Content Update (ISR)
   ├─ Edit content in Sanity CMS
   ├─ Publish changes
   ├─ ISR cache expires (≤ 60s) or webhook triggers `/api/revalidate`
   ├─ Vercel revalidates on next request
   └─ Updated HTML served without a full rebuild

5. Live Site
   ├─ User visits {{fork_source_slug}}pestcontrol.com
   ├─ Vercel CDN serves ISR-cached HTML
   ├─ Images served from Sanity CDN
   └─ Fast, cached response with periodic refresh
```

---

## Key Takeaways

✅ **Astro builds static HTML** during deploy, then ISR refreshes after cache expiry  
✅ **Environment variables** are used at build and during ISR revalidation  
✅ **Vercel automates deployments** via git pushes  
✅ **Sanity webhooks** can trigger on-demand revalidation (optional)  
✅ **Global CDN** ensures fast delivery worldwide  
✅ **ISR** keeps content fresh without full rebuilds  

## Support & References

- [Astro Docs](https://docs.astro.build)
- [Sanity Docs](https://www.sanity.io/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)

---

*Last Updated: January 22, 2026*  
*Configuration tested with: Astro 5.14.1, Sanity 7.11.2, Node 20.x*
