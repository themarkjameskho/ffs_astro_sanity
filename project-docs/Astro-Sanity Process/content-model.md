# Sanity Content Model

> Use this file to document every schema, its fields, validation rules, and the Astro component that renders it.

## 1. Document Types
| Type Key | Purpose | Required Fields | Astro Route / Component | Notes |
|----------|---------|-----------------|-------------------------|-------|
| `page` | Generic marketing page | `title`, `slug`, `sections[]`, `seo` | `src/pages/[...slug].astro` | |
| `homePage` | Homepage variant (if separate) |  |  |  |
|  |  |  |  |  |

## 2. Section / Object Types
| Schema Key | Used By | Required Fields | Astro Component | Validation |
|------------|---------|-----------------|-----------------|------------|
| `heroSection` | `page.sections[]` | `heading`, `body`, `cta` | `src/components/sections/Hero.astro` | `Rule.required()` on heading |
| `featureStack` | `page.sections[]` | `items[]` | `src/components/sections/WhyChooseUs.astro` | Ensure min 3 items |
| `contactDetails` | `page.sections[]` | `address`, `phone`, `hours` | `src/components/sections/ContactDetails.astro` | Phone format regex |
|  |  |  |  |  |

## 3. Global Settings
| Schema | Description | Astro Usage | Notes |
|--------|-------------|-------------|-------|
| `siteSettings` | Global brand + SEO config | `src/lib/queries.ts` (`SITE_SETTINGS`) | |

## 4. Editorial Guidelines
- **Naming:** Page titles should be 50–60 characters; slugs should be hyphenated lowercase.
- **Images:** Minimum width 1600px, aspect ratio 16:9 preferred. Always add alt text summarizing content.
- **Rich Text:** Limit heading depth to `h3`. Use blockquote for testimonials only.
- **Taxonomy:** Tag services by category (`heat-treatment`, `chemical-treatment`, etc.) for future filtering.

## 5. Datasets
| Dataset | Purpose | Access | Notes |
|---------|---------|--------|-------|
| `production` | Live content | Read + write (editors), deploy tokens (read) | |
| `staging` | Prelaunch/UAT | Same as production | |
| `development` | Optional local dataset | Developers only | |

## 6. Preview Payloads
- `getPreviewPage(slug: string)` – Include drafts, return sections array typed for Astro.
- Ensure portable text serializers align with `SectionRenderer`.

## 7. Outstanding Questions
- [ ] Do we need localized content?
- [ ] Should testimonials live in a separate collection?
- [ ] What is the approval workflow for publishing?

