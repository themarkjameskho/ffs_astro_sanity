# FFS Astro + Sanity Standard Template

The official Fast Forward Search starting point for Astro + Sanity marketing websites. It supports a **Fresh Build**, **WordPress Migration**, and **Landing Page/Microsite** track through one shared Sanity-driven component architecture.

Start at [`project-docs/START-HERE.md`](project-docs/START-HERE.md). It defines the required project brief, reference set, design system, content architecture, track-specific evidence, and mandatory gates.

## What's in the box

- **Astro 5** with `output: 'static'` and `@astrojs/vercel`; CMS routes explicitly opt out with `prerender = false` and are cached through ISR (`expiration: 60`)
- **Sanity Studio v3** under `studio/` with schemas pre-wired for a section-based content model (Hero, IconGrid, TwoColText/Image, Steps, FAQ, ImageCard, ServiceArea, Areas, LeadForm, HtmlEmbed, etc.)
- **One canonical section renderer** (`src/components/sections/SectionRenderer.astro`) that maps Sanity section types to Astro components
- **Form handler** (`src/pages/api/contact.ts`) with Cloudflare Turnstile verification and webhook forwarding
- **ISR revalidation** API (`src/pages/api/revalidate.ts`) for Sanity webhook → instant content updates
- **MainLayout** with mast-bar, header nav + drawer, footer pre-CTA, footer NAP block, JSON-LD schema, GA4 idle-defer, CallRail body-mount with `is:inline`
- **Neutral starter palette** in `src/styles/tokens.css` (slate blue + green CTA + red accent) — meant to be replaced per project
- **Wordpress→Sanity import script** under `scripts/` (idempotent on slug)
- **Project docs** under `project-docs/Astro-Sanity Process/` — playbook, deployment runbook, dev-to-live workflow, brand intake questionnaire

## How to start a new project from this template

### Path A — Brand-new build (no existing WordPress site)

```bash
# 1. Clone or duplicate the template
git clone https://github.com/themarkjameskho/ffs_astro_sanity.git my-client-site
cd my-client-site
rm -rf .git && git init && git add -A && git commit -m "feat: scaffold from ffs_astro_sanity template"

# 2. Run the setup script — interactive prompts for every {{PLACEHOLDER}}
chmod +x template-setup.sh
./template-setup.sh

# 3. Install dependencies
npm install
cd studio && npm install && cd ..

# 4. Run the dev server
npm run dev
```

Before component work, complete the Fresh Build readiness inputs in `project-docs/tracks/FRESH-BUILD.md`: project brief, reference set, design system, and content/component map.

### Path B — Migrating from WordPress

Same start (Path A steps 1–4), then follow `project-docs/tracks/WORDPRESS-MIGRATION.md` and `project-docs/Astro-Sanity Process/wordpress-to-astro-migration.md` before changing content or redirects.

### Path C — Landing page or microsite

Follow `project-docs/tracks/LANDING-PAGE.md`. It uses the same Sanity page documents, renderer, shared components, forms, and design tokens—not a custom one-page template.

## Placeholders this template uses

Every `{{PLACEHOLDER}}` in code/docs is a deliberate fill-in-the-blank. The setup script prompts for the values you have ready and leaves the rest for later. Full list:

| Placeholder | Where it goes | When to fill |
|---|---|---|
| `{{BRAND_NAME}}` | Title, mast-bar, footer NAP, schema.org, hero copy | Phase 1 brand intake |
| `{{BRAND_ABBREV}}` | Mast-bar tagline, schema `alternateName` | Phase 1 |
| `{{brand_slug}}` | `package.json` name, webhook path, headers | Phase 1 |
| `{{SITE_DOMAIN}}` | Canonical URLs, OG image base, sitemap | After Vercel domain claimed |
| `{{SITE_URL}}` | Full `https://...` for canonical, JSON-LD `url` | Same as above |
| `{{VERCEL_PREVIEW_DOMAIN}}` | Preview URL references | When Vercel project created |
| `{{vercel_project_slug}}` | Vercel deploy ID matching | Same |
| `{{SANITY_PROJECT_ID}}` | All Sanity client config + env | Phase 5 Sanity setup |
| `{{GA4_MEASUREMENT_ID}}` | gtag snippet in MainLayout | Phase 1 if client has GA |
| `{{CALLRAIL_COMPANY_ID}}` | swap.js URL in MainLayout `<body>` | Phase 1 if CallRail wired |
| `{{CALLRAIL_SWAP_KEY}}` | Same URL — second segment | Same |
| `{{PHONE_PRIMARY_FORMATTED}}` | Display strings in header/footer | Phase 1 NAP |
| `{{PHONE_PRIMARY_E164}}` | `tel:` link `href` | Same |
| `{{PHONE_SECONDARY_*}}` | If multiple service areas with separate lines | Same |
| `{{NAP_STREET_ADDRESS}}` | Footer NAP, schema `PostalAddress` | Phase 1 |
| `{{NAP_CITY}}` / `{{NAP_ZIP}}` | Same | Same |
| `{{NAP_LATITUDE}}` / `{{NAP_LONGITUDE}}` | schema.org `GeoCoordinates`, map embed | Phase 1 |
| `{{AUTOMATION_WEBHOOK_URL}}` | `.env` and Vercel env | Phase 1 if form handler chosen |
| `{{PUBLIC_TURNSTILE_SITE_KEY}}` | Form widget config | Pre-launch (Cloudflare dashboard) |
| `{{TURNSTILE_SECRET_KEY}}` | Server-side verify in `/api/contact.ts` | Same |
| `{{FORK_SOURCE_PROJECT}}` | Code comments referencing where a pattern came from | Optional — leave as-is or remove |

The setup script (`template-setup.sh`) handles the common ones interactively. The longer-tail ones (Turnstile keys, GA after the client provides it) get filled in during their phase.

## Architecture rules (do not break)

These are load-bearing patterns. The plugin's skills enforce them; this README documents them so manual edits don't regress.

1. **Astro `<script>` tags need `is:inline`** for external `src`. Without it, Astro silently strips the tag from deployed HTML. Already wired correctly in MainLayout — don't remove the directive.
2. **CallRail script lives in `<body>`**, immediately before `</body>`. CallRail's account-side verifier doesn't detect head-mounted scripts. Already placed correctly.
3. **GA4 gtag is idle-deferred.** The boilerplate uses `requestIdleCallback` + first-interaction trigger so it doesn't block LCP/TBT.
4. **Env vars are baked at Vercel build time.** Add/change a var → trigger a redeploy. The setup script reminds you.
5. **WCAG accessibility floor:** no `opacity:<0.5>` or `filter:blur(...)` on text-containing elements. Composites contrast below AA. The `--emergency-text` token exists for the small-red-text-on-cream case where the brand red would fail.
6. **Performance targets:** Mobile ≥ 85, Desktop ≥ 95, Accessibility = 100. The PageSpeed skill in the plugin diagnoses regressions.

## Project structure

```
ffs_astro_sanity/
├── src/
│   ├── pages/                # Astro routes (index, [...slug], blog/[slug], api/)
│   ├── components/
│   │   ├── layouts/MainLayout.astro    # Top-level shell — mast-bar, nav, footer
│   │   └── sections/         # Sanity-section components (Hero, IconGrid, etc.)
│   ├── styles/
│   │   ├── tokens.css        # Design tokens (REPLACE PER PROJECT)
│   │   └── critical.css      # Inlined into <head>
│   ├── lib/                  # sanityClient, portableText, queries, helpers
│   ├── types/                # Sanity TS types
│   └── assets/               # Local images including logo placeholder
├── studio/                   # Sanity Studio config + schemas
│   └── schemaTypes/
├── public/                   # Static assets, fonts, favicon (replace)
├── project-docs/
│   └── Astro-Sanity Process/ # Playbook + deployment runbook
├── scripts/                  # WP import, content audit, brand-leak scan
├── astro.config.mjs
├── vercel.json               # Redirects (replace per project) + headers
├── package.json
├── .env.example              # Copy to .env and fill in
├── template-setup.sh         # Interactive placeholder replacement
└── TEMPLATE_README.md        # ← you are here
```

## Lineage

This template is the cumulative learning from three Astro+Sanity rebuilds:

1. **Top Bed Bug Pros** — first project on the stack. Section components + design tokens originated here.
2. **HeatTech Pest Control** — second project. Section system, form webhook contract, ISR on-demand revalidation pattern.
3. **Bed Bugs Be Gone Now** — third project. Surfaced inherited-fork leak bugs (GA, CallRail), Astro `is:inline` script-stripping, Cloudflare apex-CNAME-flattening DNS trap, WCAG-vs-opacity-composite accessibility failures.

Every new project teaches us something. The right move when that happens is to update **this template** + the `astro-sanity-migration` plugin, so the next project after benefits. Don't write a one-off note in the project docs — write it where every future project will see it.

## License

MIT — copy, modify, redistribute. See `LICENSE`.
