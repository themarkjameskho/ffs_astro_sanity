# Brand Variants, Navigation & Video Hover

This note documents the conditional branding logic that was introduced for the Chicago variant, the catch‑all page routing, and the reusable video hover behaviour on treatment cards. Use it as the checklist the next time we add a new market or tweak the hover experience.

## 1. Path-Based Location Detection
- Helper: `src/lib/location.ts` exports `getLocationFromPath()` which maps `pathname` → `'default' | 'chicago'`.
- Layout wiring: `src/layouts/BaseLayout.astro` calls the helper once and passes `location` into both the header and footer. Any new layout should follow the same pattern.
- Header/footer components **must** accept a `location?: 'default' | 'chicago'` prop when we reuse them elsewhere.

### Adding Another Market
1. Extend the `SiteLocation` union in `src/lib/location.ts` and update `getLocationFromPath()` with the new prefix.
2. Thread the new location through the header/footer props (add brand assets, nav links, contact info).
3. Update the Chicago-specific logic in the footer (and any other conditional sections) to switch on the expanded union.

## 2. Navigation Rules
- Default site nav: `Home` `/`, `Bed Bug Treatment` `/bed-bug-treatment`, dropdown `Location` → `Chicago`, and `Contact` `/contact-us`.
- Chicago nav (detected via pathname): `Home` `/chicago`, `Bed Bug Treatment` `/chicago/bed-bug-treatment`, `Contact` `/chicago/contact-us`. The `Location` dropdown is hidden to avoid pointing back to itself.
- Footer mirrors the same link set; the Chicago variant also renders an orange “Chicago” label above the company name (see `src/components/layout/Footer.astro`). Reuse the same patterns when adding another city.

### Sanity Slug Requirements
- Astro now uses `src/pages/[...slug].astro` (catch-all). Slugs in Sanity **must not** include leading/trailing slashes. Example: `chicago/bed-bug-treatment` ✅, `/chicago/bed-bug-treatment/` ❌.
- After changing slugs in Sanity, restart `npm run dev` to refresh the route manifest. Always publish the document before testing the route.

## 3. Treatment Card Video Hover
File: `src/components/ui/PrimaryServicesCard.astro`

- Videos are lazy-loaded and only play on hover for devices that advertise `hover: hover` & `pointer: fine` (desktop/laptop). Touch devices fall back to the static image—no bandwidth wasted and no odd hover triggers.
- The script sets up event listeners on `mouseenter` / `mouseleave`, attaches `<source>` tags on demand, and resets playback when the pointer exits.
- To temporarily disable hover globally without deleting code, set `const supportsHover = false;` (or early-return right after the matchMedia check). The logic stays intact for quick reactivation.

### Adding/Updating Videos
1. Place MP4 + WebM variants in `public/videos/` (VP9 WebM is generated via the documented ffmpeg command).
2. Pass the MP4 path from Sanity (or fallback mapping). The card automatically derives the `.webm` sibling.
3. The poster image falls back to the treatment thumbnail so the card always has a visual.

## 4. Troubleshooting Checklist
- Seeing `Page not found` for a CMS route: confirm the slug in Sanity has no leading/trailing slash and the page file is still `[...slug].astro`.
- Chicago branding not swapping: check `getLocationFromPath()` still returns `'chicago'` for the path; run `npm run dev` and observe `Astro.url.pathname` via `console.log` in the header if needed.
- Video hover missing: ensure the device reports hover support or temporarily force-enable by removing the matchMedia guard.

Keeping these sections in sync will let us roll new markets or experiments quickly without reverse-engineering today’s work.

## 5. SEO Protocol fields
- The page schema now exposes `seo` as a collapsible object in Sanity. Editors can set Title, Description, Canonical URL, OG Image, and raw JSON-LD.
- Astro fetches the object via `page.seo` and passes it to `BaseLayout`. Any non-empty `schemaMarkup` is emitted as `<script type="application/ld+json">`.
- Keep JSON-LD valid; invalid JSON will break the head rendering. Recommend running the snippet through Google's Rich Results Test before publishing.
