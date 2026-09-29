# Sanity Components & Content Model Guide

> **Audience:** site owners, content editors, project managers, and AI assistants working on an FFS Astro + Sanity website.
>
> **Purpose:** explain what can be built in Sanity today, which fields drive each part of a page, and when a change needs a developer. This document describes the current repository implementation, not a generic Sanity setup. The governing standard is `../../standards/COMPONENT-AND-CONTENT-STANDARD.md`; code remains the source of truth where this guide has not yet caught up with the Portable Text compatibility rollout.

## 1. The short version

The website is built from modular **Page** documents in Sanity. A page contains basic information (title, URL, page type, and SEO) plus an ordered list of **sections**. Each section is a reusable visual component: for example, a hero, service grid, FAQ, or lead form.

Sanity controls content, images, links, section order, and the supported layout/theme choices. Astro controls the underlying component code, visual system, form delivery logic, navigation behaviour, and anything not exposed as a Studio field.

**Editorial rule:** use an existing section whenever it fits. A new visual pattern, a new field, a different form integration, or a new section type is developer work and must be added to the schema, query, TypeScript types, canonical renderer, and shared component together. Do not create a page-only template or section.

## 2. How a page becomes a live webpage

```text
Sanity Page document
  ├─ Page Information: title, slug, page type
  ├─ SEO Settings: title, description, canonical URL, social image, optional JSON-LD
  └─ Page Sections: ordered reusable blocks
          ↓
Astro page loader reads the page by URL
          ↓
SectionRenderer selects the matching Astro component
          ↓
The visitor sees the page in the same section order as Studio
```

The source of truth for available section types is `studio/schemaTypes/documents/page.ts`. The renderer is `src/components/sections/SectionRenderer.astro`.

## 3. Roles and safe boundaries

| Task | Site owner/editor | AI assistant | Developer |
|---|---|---|---|
| Create a page with supported sections | Yes | Yes, with approved source material | May assist |
| Edit approved copy, images, titles, and links | Yes | Yes, with review | May assist |
| Reorder existing sections | Yes | Yes, after an agreed page outline | May assist |
| Create new schema fields or section types | No | No | Yes |
| Change CSS, responsive layout, renderer logic, or navigation | No | No | Yes |
| Change form destinations, webhook credentials, analytics, or deployment settings | No | No | Yes, with authority |
| Publish to production | Only the designated approver | Never implicitly | Only when authorized |

An AI may draft content and prepare a field-by-field entry plan. It must not present a draft as approved, publish content, invent business facts, claims, addresses, service coverage, reviews, prices, guarantees, certifications, or image descriptions it cannot verify.

## 4. Core content model

### 4.1 Page (`page`)

Use this for marketing, service, location, contact, home, and other standard pages.

| Studio group | Fields | Notes |
|---|---|---|
| Page Information | `title` **required**, `slug`, `pageType` **required** | Slug determines the URL. Use lower-case, hyphenated paths and preserve established URLs unless a redirect is planned. |
| SEO Settings | `seoTitle` (max 60), `seoDescription` (max 160), `canonicalUrl`, `ogImage` + required alt text, `schemaCode` | Leave canonical blank to use the site default. `schemaCode` expects valid JSON-LD, not ordinary text. |
| Page Sections | `sections[]` **required**, minimum one | Drag to change public page order. Only the 14 types in Section 5 can be added. |

Supported page types are Home, Pest Control, Bed Bug Treatment, Service Area, Contact, Blog, and Service Detail. Page type supports navigation/grouping; it does not create a new design by itself.

### 4.2 Global Settings (`globalSettings`)

This is the site-wide source for default business and SEO information. Edit it carefully because a single change can affect many pages.

| Field group | Fields | Where it is used |
|---|---|---|
| Contact Info | company name, street address, city, state, ZIP, primary phone, email, service areas, map embed | Footer and structured data; section-level values may override it. |
| Default SEO | SEO title, description, canonical URL, Open Graph image | Fallback metadata when a page or post has no custom values. |
| Social Links | label + full HTTPS URL | Footer and contact cards. |

Never use the service-area list to imply a physical office. It is an internal coverage list, not proof of address or eligibility for LocalBusiness schema.

### 4.3 Blog documents

| Document | Purpose | Required / key fields |
|---|---|---|
| `blogPost` | A public article | `title`, `slug`, `publishedAt`; optional excerpt, featured image, SEO, author text, categories, tags, Portable Text body and inline images. Featured-image alt text is required when an image is used. |
| `category` | Blog grouping | `name`, `slug`, optional description. |
| `tag` | Flexible topic label | `name`, `slug`. |
| `author` | Reusable author profile | `name`, `slug`, optional bio and image. |
| `serviceAreaFolder` | Studio organization only | name, optional description, display order. It does not create a public URL or page. |

## 5. Reusable page sections

### A. Hero Section (`heroSection`)

**Best for:** the first, above-the-fold section of a page.

**Astro component:** `src/components/sections/HeroSection.astro`

**Content fields:** title, highlighted title text, subtitle, Portable Text body, optional bullet heading/list (maximum 8), primary and optional secondary CTA label/link, CTA helper text, optional coupon, and one- or two-column layout.

**Media/layout fields:** right-column image (alt text required), image size and frame style, right-column subtitle, map iframe markup, and a full background image (alt text required).

**Use it well:** one clear H1-level message, short supporting copy, one primary action. Use the map/media fields only with confirmed assets and embeds.

### B. Service Grid (`serviceGridSection`)

**Best for:** a concise list of service offerings or service-category links.

**Astro component:** `src/components/sections/ServiceGridSection.astro`

**Required:** section title and at least one item.

**Each item:** label **required**, optional description, image icon, link label, and link URL.

**Layout choices:** stacked, two-column, or three-column T layout. The T layout also supports a secondary title, description, and CTA.

**Use it well:** link only to existing approved paths. Do not turn a grid into a long text section; use Two Column or an HTML/legal section where appropriate.

### C. Image Card / Process Section (`processSection`)

**Best for:** process steps, service highlights, comparison cards, or image-led feature cards.

**Astro component:** `src/components/sections/ImageCardSection.astro`

**Core fields:** title, subtitle, alignment, background theme, image position, desktop column count (2–4), and optional section CTA.

**Cards:** each card needs a label; it can also include title highlight, subtitle, Portable Text description, divider, item heading/body/list, image and alt text.

**Use it well:** keep cards parallel in length and purpose. This is called `processSection` in data but appears as **Image Card Section** in Studio.

### D. Service Area Section (`serviceAreaSection`)

**Best for:** a coverage list with links to real location/service-area pages.

**Astro component:** `src/components/sections/ServiceAreaSection.astro`

**Required:** at least one community, with a required name and optional link.

**Other fields:** title, highlight, subtitle, description, CTA, helper text, map embed URL, and fallback side image.

**Use it well:** confirm the business serves each location before adding it; do not make coverage wording sound like a physical office unless that is true.

### E. CTA Section (`ctaSection`)

**Best for:** a focused conversion band between or after content sections.

**Astro component:** `src/components/sections/CtaSection.astro`

**Required:** heading.

**Preferred button pattern:** Primary Button (`label`, `link`, style) and optional Secondary Button. The older `ctaLabel` and `ctaLink` fields exist only for backward compatibility; use Primary Button for new work.

**Layout choices:** full width or boxed panel; stacked or two-column content; supported color themes; optional eyebrow, rich-text body, highlighted words, and CTA helper text.

### F. Contact Section (`contactSection`)

**Best for:** a full contact/details area with optional quick links and map.

**Astro component:** `src/components/sections/ContactSection.astro`

**Fields:** optional heading/subtitle; location title; company, address, phone, phone link, email; a 1–3 column quick-link list; map embed URL.

**Use it well:** use `tel:` for phone links and `mailto:` for email links. Verify every NAP value against the approved business record before saving.

### G. Blog List Section (`blogListSection`)

**Best for:** showing the latest blog posts on a landing page.

**Astro component:** `src/components/sections/BlogListSection.astro`

**Fields:** title, highlighted title text, description, optional category-slug filter, and posts to show (3–12; default 6).

**Use it well:** the filter expects an existing Sanity category **slug**, not its display name. This section selects posts automatically; do not try to add individual cards here.

### H. Icon Grid (`iconGridSection`)

**Best for:** benefits, differentiators, certifications, or short feature summaries.

**Astro component:** `src/components/sections/IconGridSection.astro`

**Required:** at least one item, each with a label.

**Item fields:** label, optional subtitle/description, benefits heading/list, square icon image, and optional item-level CTA. Icons work best as 256px or larger square transparent PNG/SVG assets.

**Section fields:** title, description, color theme, vertical/horizontal layout, flat/card treatment, 2–4 desktop columns, icon size, and optional section CTA.

### I. Two Column Text + Image (`twoColTextImageSection`)

**Best for:** a substantive story, service explanation, or feature explanation alongside a photo/gallery.

**Astro component:** `src/components/sections/TwoColTextImageSection.astro`

**Required:** one to four images.

**Fields:** title, subtitle, Portable Text description, theme, bullet heading/list, bullet marker style, primary/secondary CTA and helper text, image placement (left/right), and image alt text.

**Use it well:** prefer this over creating a new “text section.” It already supports rich text, images, bullets, background themes, and CTAs.

### J. Lead Form (`leadFormSection`)

**Best for:** a lead-capture block.

**Astro component:** `src/components/sections/LeadFormSection.astro`

**Required:** at least one configured field.

**Section fields:** title, subtitle, body, optional logo, background/alignment, form action override, and success/error messages.

**Field types:** text, email, telephone, textarea, select, and checkbox group. Each field needs a technical `name` and human label; select/checkbox fields also require options. Fields can be required and full/half width.

**Important:** do not change `formAction`, introduce sensitive data, or assume a form reaches a CRM without a developer verifying the receiving endpoint. Form submissions normally use the established site endpoint unless deliberately configured otherwise.

### K. HTML Section (`htmlSection`)

**Best for:** approved legal text or a vetted third-party embed.

**Astro component:** `src/components/sections/HtmlSection.astro`

**Required:** `htmlContent`.

**Fields:** optional title, optional highlighted text/subtitle, and HTML content.

**Guardrail:** this is not a general page builder. Use it only for reviewed legal copy or approved embeds. Never paste unknown scripts, tracking code, credentials, or unreviewed third-party HTML.

### L. FAQ (`faqSection`)

**Best for:** answers to real customer questions.

**Astro component:** `src/components/sections/FaqSection.astro`

**Fields:** heading (preferred) or legacy title, highlight, introductory text, FAQ question/answer pairs, single/two-column layout, alignment, color theme, optional final text and button.

**Use it well:** write questions as people ask them and answers that are specific and supportable. Avoid FAQ claims that cannot be proven.

### M. Areas (`areasSection`)

**Best for:** a state-and-city grid where locations need grouping.

**Astro component:** `src/components/sections/AreasSection.astro`

**Required:** at least one state group; each state group needs a title and at least one city; each city needs a name.

**Fields:** title, highlight, description, theme, state groups, city names, optional city links.

**Use it well:** use when state grouping improves clarity; use Service Area Section for a single ungrouped community list.

### N. Steps (`stepsSection`)

**Best for:** a linear “how it works” explanation.

**Astro component:** `src/components/sections/StepsSection.astro`

**Required:** at least one step, and every step needs a title.

**Step fields:** optional label, title, description, bullet heading/list, image with required alt text, and left/right image position.

**Use it well:** order matters. Make every step a genuine stage in the customer journey rather than a repetition of service features.

## 6. Page planning: choose the right section

| Need | Use | Do not use |
|---|---|---|
| Strong opening and primary action | Hero | HTML section or a duplicate CTA |
| List of services | Service Grid | Blog List |
| Image-led features/process cards | Image Card / Process | Steps unless the content is sequential |
| Rich explanation beside imagery | Two Column Text + Image | A new prose-only schema |
| Benefits with icons | Icon Grid | Service Grid where no service links exist |
| Linear customer journey | Steps | Image Card / Process for unrelated cards |
| Simple coverage list | Service Area | Areas if no state grouping is needed |
| Multi-state/city directory | Areas | Service Area if groups are essential |
| Latest or category-filtered articles | Blog List | manually entered blog cards |
| Contact details/map | Contact | Hero map, unless it is truly a hero layout |
| Capture a lead | Lead Form | HTML embed, unless specifically approved |
| Legal copy or reviewed external embed | HTML | normal marketing copy |

## 7. Editorial standards

1. **Plan before editing.** Write the page purpose, audience, section order, primary CTA, and source material before drafting.
2. **One H1 per page.** The Hero is normally the page's H1. Subsequent substantive section titles are normally H2. A list-group title is H3 and its titled items are H4; nested titled items are H5. Do not use a decorative title-only section.
3. **Use rich text for new body copy.** New section body content must use the Portable Text field supported by the component. Plain-string description fields remain only for existing-content compatibility until the shared rollout is implemented.
4. **Use real links.** Internal links should use the established canonical trailing-slash route, such as `/pest-control/`. Telephone links use `tel:`; email links use `mailto:`.
5. **Treat images as content.** Upload appropriate images, set the crop/hotspot when needed, and write factual alt text describing the image—not marketing slogans or keyword stuffing.
6. **Use factual source material.** Do not invent reviews, success rates, certifications, pricing, availability, coverage, or business addresses.
7. **Keep copy matched to the component.** Cards need concise parallel entries; a Two Column section supports richer explanation; FAQ answers should be direct.
8. **Use SEO fields deliberately.** Keep page SEO titles at 60 characters or fewer and descriptions at 160 characters or fewer. Only add custom canonical URLs or JSON-LD when there is a documented SEO reason.
9. **Save draft, review, then publish.** Content drafting, Studio write, preview approval, and production publication are separate steps.

## 8. AI operating instructions

Give an AI this guide alongside the approved brief and source documents. Its operating rules should be:

```text
You are preparing Sanity content for an Astro website.

1. Use only the document and section types named in this guide.
2. Preserve exact schema field names and permitted option values.
3. Do not create a new section, field, page type, form field type, or layout value.
4. Do not invent facts, NAP details, reviews, locations, service coverage, offers, certifications,
   pricing, images, alt text details, or testimonials. Mark missing information as OPEN.
5. Provide a page plan first: page title, slug, page type, SEO, section order, and a field-by-field
   content payload. Wait for approval before writing to Sanity.
6. Treat drafts, preview approval, and publication as separate actions. Never publish without direct authorization.
7. Escalate to a developer when the request needs a new visual pattern, schema field, renderer behaviour,
   form integration, navigation change, redirect, tracking script, or deployment change.
```

## 9. When to involve a developer

Request developer work when any of the following is true:

- The desired design cannot be made from the 14 listed section types and their existing controls.
- A field needs new validation, a new dropdown value, a new content format, or a new component.
- A link changes an existing URL or requires a redirect.
- A form changes destination, data collection, consent language, spam protection, or analytics.
- An embed includes scripts, cookies, tracking, or a third-party service that has not been approved.
- Page performance, accessibility, structured data, mobile layout, or visual styling needs changing.

A developer change is not complete when the schema file changes locally. It must be wired into the relevant query, TypeScript type, Astro renderer/component, deployed Studio, and tested preview before editors can rely on it.

## 10. Verification checklist for a completed page

- [ ] Page title, slug, and page type are correct.
- [ ] SEO title, description, canonical behaviour, and Open Graph image are reviewed.
- [ ] Section order matches the approved page plan.
- [ ] All required section fields validate in Studio.
- [ ] Every internal link resolves to a real page; phone/email links use the correct format.
- [ ] Images have meaningful alt text and suitable crop/hotspot.
- [ ] Claims, locations, offers, reviews, and business details are verified from approved sources.
- [ ] The form contract is unchanged or has been explicitly tested.
- [ ] The page is reviewed in a preview on desktop and mobile.
- [ ] The authorized approver has approved publication.

## 11. Developer reference map

| Concern | Source of truth |
|---|---|
| Page document and allowed sections | `studio/schemaTypes/documents/page.ts` |
| Individual section fields/validation | `studio/schemaTypes/objects/*.ts` |
| Global, SEO, and contact fields | `studio/schemaTypes/documents/globalSettings.ts`, `studio/schemaTypes/settings/*.ts` |
| Registered Studio schemas | `studio/schemaTypes/index.ts` |
| Section data types | `src/types/sections.ts` |
| Mapping of Sanity section to Astro component | `src/components/sections/SectionRenderer.astro` |
| Page data queries | `src/lib/queries/pageBySlug.ts` and `src/lib/queries/pageByType.ts` |

**Maintenance rule:** whenever a developer changes a schema or component, update this guide in the same change set. The code remains the final source of truth if there is a discrepancy.
