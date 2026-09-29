# FFS Astro+Sanity Performance Standard

Applies to all FFS Astro+Sanity sites (HeatTech, BBBGN, TBBP, Chapman, future builds).
Target: PSI mobile ≥ 90, LCP < 2.5s, CLS < 0.1, TBT < 200ms.
Last updated: 2026-06-12 (derived from HeatTech + BBBGN PSI audits).

## 1. Third-party scripts

- **CallRail/CallReports `swap.js`**: load with `async` (HeatTech pattern). Exception: if CallRail's verifier fails with async/head placement, place it `is:inline` before `</body>` (BBBGN pattern — documented in its MainLayout, do not move).
- **gtag.js**: always `async`. Optionally defer to first interaction/3s idle (BBBGN pattern) when chasing the last few points.
- Never load any third-party script synchronously in `<head>`.

## 2. Preconnects (max 4 `preconnect`, rest `dns-prefetch`)

Required origins for sites using CallRail + Sanity + GA:
`https://cdn.sanity.io` (crossorigin), `https://cdn.callreports.com`, `https://js.callreports.com` (swap.js fetches swap_session.json from here), `https://www.googletagmanager.com`.

## 3. Images (Sanity CDN)

- Always `fm=webp` (or `auto=format`) — never ship PNG/JPG from cdn.sanity.io.
- Every `<img>` gets explicit `width`/`height` (parse from the asset `_ref`, which encodes `WxH`) — prevents CLS.
- **`sizes` must end in a px cap, not vw.** Containers are capped (~1152px), so `33vw`/`50vw` over-fetches. Measured slot widths: 3-col card ≈ 360px, 4-col ≈ 270px, 2-col ≈ 560px, half-column image ≈ 560–640px, 2×2 gallery cell ≈ 360px.
- srcset entries should bracket the px cap: include one entry at ~1× the cap and one at ~1.5–2× for high-DPR. Don't ship a 1200w file for a 360px slot.
- Hero/LCP image: `loading="eager"`, `fetchpriority="high"`, `<link rel="preload" as="image">` with `imagesrcset`/`imagesizes`, separate mobile/desktop preloads via `media`. Everything below the fold: `loading="lazy" decoding="async"`.
- Logos: use SVG when possible (BBBGN's 220×80 raster logo costs ~20 KiB; an SVG would be ~3 KiB). Raster fallback: webp q60-ish — don't bother going lower, diminishing returns.

## 4. Fonts

Self-host woff2, `<link rel="preload" as="font">` only the weights used above the fold (max 3).

## 5. Verification checklist (every perf PR)

1. `npm run build` passes locally.
2. PSI mobile + desktop after deploy; check "Improve image delivery" and "Render-blocking requests" are clear.
3. Confirm call-tracking numbers still swap (CallRail) after any script-loading change.
4. CLS = 0 on home + one location page.

## Known per-site deviations

- **BBBGN**: swap.js stays before `</body>`, `is:inline` (CallRail verifier requirement, May 2026). gtag deferred to interaction.
- **HeatTech**: swap.js async in head.
