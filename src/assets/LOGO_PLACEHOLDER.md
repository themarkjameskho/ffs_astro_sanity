# Logo placeholder

This directory contains the brand logo. The template ships with a placeholder
PNG (`brand_logo.png`) and a placeholder wordmark SVG (`logo-wordmark.svg`)
that both read `{{BRAND_NAME}}` — clearly identifiable as not-yet-replaced.

When the client provides the real logo, save it here as `brand_logo.png`
(or `.svg`) at minimum 480×96 for the header. The MainLayout import already
points at `brand_logo.png`, so just dropping a new file at that path is
enough — no code edits needed.

If your client's logo isn't horizontal, you may also want to provide:
- A square / stacked variant for mobile drawer and small contexts
- A monochrome variant for the legal footer strip (white-on-dark)
- A simplified icon-only mark for the favicon

Update `src/components/layouts/MainLayout.astro` to reference any new variants.
