# Page Contracts

> Each entry lists the Sanity document or query powering a page, the required fields, and the Astro components involved. Update as new templates are added.

## Home (`/`)
- **Sanity Source:** `page` document with slug `home` (or dedicated `homePage`).
- **Required Fields:** `title`, `heroSection`, `sections[]`, `seo`.
- **Astro Entry:** `src/pages/index.astro`.
- **Renderer:** `SectionRenderer` with site settings.
- **Dependencies:** `Hero`, `PrimaryServicesGrid`, `Testimonials`, `ContactDetails`.
- **Notes:** Fallback to `siteSettings` phone number if section phone missing.

## Generic Page (`/[...slug]`)
- **Sanity Source:** `page` document matched by slug.
- **Required Fields:** `title`, `slug`, `sections[]`, `seo`.
- **Astro Entry:** `src/pages/[...slug].astro`.
- **Renderer:** `SectionRenderer`.
- **Dynamic Behaviour:** Redirect to `/` if slug missing; log unmatched section types.

## Service Landing Page (`/services/<service>`) *(planned)*
- **Sanity Source:** `service` document.
- **Required Fields:** `title`, `slug`, `heroSection`, `serviceDetails`, `faqs`.
- **Astro Entry:** `src/pages/services/[slug].astro` (to be generated).
- **Renderer:** `SectionRenderer` + service-specific components.
- **Notes:** Add canonical URLs to avoid duplicate content across cities.

## Legal Pages (`/privacy`, `/terms`)
- **Sanity Source:** `legalPage` document.
- **Required Fields:** `title`, `slug`, `bodyPortableText`.
- **Astro Entry:** `src/pages/[...slug].astro` (handled via catch-all).
- **Renderer:** `LegalContent` component.
- **Notes:** Use `PortableTextRenderer` for rich text with headings and lists.

## 404 Page (`/404`)
- **Sanity Source:** Optional `notFound` document; fallback to static copy.
- **Astro Entry:** `src/pages/404.astro`.
- **Renderer:** Static component with CTA to contact page.
- **Notes:** Confirm automatic rewrite via hosting platform.

## Upcoming Templates
- [ ] City landing pages (`/city/<name>`) – require geo metadata, schema TBD.
- [ ] Blog index and article templates if content marketing added later.

