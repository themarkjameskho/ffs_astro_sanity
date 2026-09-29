# Evergreen Lawn & Pest Control — Build Plan

> Source: `evergreen-website-build-spec.html` v0.1 (Draft — Incomplete, pending client info).
> Governing docs: `AI-BUILD-WORKFLOW.md` · `LIFECYCLE-CHECKLIST.md` · Master Spec v2.0 · `PRE-LAUNCH-QA.md`.
> Rule per workflow step 1: brief is incomplete — log missing items, don't block planning.

## Client snapshot

| Field | Value |
|---|---|
| Business | Evergreen Lawn & Pest Control |
| Domain | evergreenlawnsnwa.com |
| Region | Northwest Arkansas (Fayetteville metro) |
| Contacts | Shane, Travis (Owner: Daryl) |
| Stack | Astro + Sanity + Vercel |
| Integrations | Fieldroutes portal, CallRail, GA4, GSC; optional AI missed-call/form-to-text post-launch |

## Step 0 — Provision the repo (this thread)

Per AI-BUILD-WORKFLOW step 4. Suggested folder: `/Volumes/juandemarkho/Projects/evergreen_lawn_pest`
(full site → no `landingpage_` prefix). Mark must create the folder and add it to the Cowork
project before Claude can copy into it. Then:

```bash
# Local duplicate (exclude git/build cruft), fresh git history
rsync -a --exclude node_modules --exclude .git --exclude dist --exclude .astro \
  /Volumes/juandemarkho/Projects/ffs_astro_sanity/ /Volumes/juandemarkho/Projects/evergreen_lawn_pest/
cd /Volumes/juandemarkho/Projects/evergreen_lawn_pest
git init && git add -A && git commit -m "feat: scaffold from ffs_astro_sanity template"
./template-setup.sh          # fill known values, skip pending ones
npm install && npm run template:audit
```

Then: copy this doc + spec into the new repo's `project-docs/clients/evergreen/`, align CLAUDE.md /
README / vercel.json / tokens.css so nothing says "template", push to GitHub.

## template-setup.sh placeholder values

| Placeholder | Value | Status |
|---|---|---|
| BRAND_NAME | Evergreen Lawn & Pest Control | ✅ |
| BRAND_ABBREV / lower | ELP / elp (confirm) | ✅ |
| brand_slug | evergreen-lawn-pest | ✅ |
| SITE_DOMAIN / SITE_URL | evergreenlawnsnwa.com / https://evergreenlawnsnwa.com | ✅ |
| vercel_project_slug | evergreen-lawn-pest | ✅ |
| SANITY_PROJECT_ID | Mark provisions (own project vs shared 45mefpsu — decide) | ⏳ FFS |
| GA4_MEASUREMENT_ID | FFS to create or get from client | ⏳ |
| CALLRAIL ids | pending CallRail setup (needs phone) | ⏳ |
| PHONE_* (all formats) | pending client | ⏳ |
| NAP_* (address, geo) | pending client — must match GBP exactly | ⏳ |

## Site architecture (Master Spec v2.0)

No LOC-A — Homepage is the GBP-linked primary page (single-operator model).

| Type | URL | Count | Status |
|---|---|---|---|
| HP | `/` | 1 | Build now (placeholders) |
| SP | `/services/lawn-care/`, `/services/pest-control/`, `/services/bed-bugs/` | 3+ | Shells now; slugs LOCKED only after client confirms service list |
| SLP | `/services/[service]/[city]/` | TBD | ⛔ Blocked — city list |
| LOC-B | `/locations/[city]/` | TBD | ⛔ Blocked — city list |
| BL | `/blog/`, `/blog/[slug]/` | ongoing | Template ready |
| CP | `/contact/` | 1 | Build now |

Unique Content Rule applies to every SLP/LOC-B — no city-swap templating.
Likely NWA cities (confirm): Fayetteville, Springdale, Rogers, Bentonville, Siloam Springs, Bella Vista, Centerton.

## Spec → template component map

| Spec requirement | Existing component |
|---|---|
| Hero (H1 + CTA) | `HeroSection.astro` |
| Services grid | `ServiceGridSection.astro` / `IconGridSection.astro` |
| Trust bar / why-us | `IconGridSection.astro` + `TwoColTextImageSection.astro` |
| Process steps | `StepsSection.astro` |
| FAQ (min 4/service, FAQPage schema) | `FaqSection.astro` |
| Service area map / city list | `ServiceAreaSection.astro` / `AreasSection.astro` (see INTERACTIVE-SERVICE-AREA-MAP.md) |
| Contact form (Name/Phone/City-Zip/Service/Message, "Get My Free Quote", inline confirm) | `LeadFormSection.astro` + `ContactSection.astro` |
| CTA blocks | `CtaSection.astro` |
| Fieldroutes portal block | `HtmlSection.astro` stub until embed arrives |
| Blog | `BlogListSection.astro` + blog schema |

Sanity: use template's `page` + `globalSettings` + blog docs. Spec's servicePage/locationPage map to
`page` with pageType per Master Spec; add `testimonial` + `teamMember` docs (not in template — new schemas).
`siteSettings` fields (NAP, hours, phone, logo, gaId) → `globalSettings`.

## Can build now (repo ready even with incomplete spec)

1. Provision repo (Step 0), run template-setup.sh with known values.
2. Global layout: nav, footer, CTA bar, trust bar — placeholder content.
3. HP shell, CP shell, SP template — placeholder copy/imagery slots.
4. Routing per architecture table; proposed slugs marked unconfirmed.
5. New Sanity schemas: testimonial, teamMember; Fieldroutes stub block.
6. Perf baseline per PERFORMANCE-STANDARD.md (sizes px cap, fonts, islands).
7. CONTENT-PLAN.md + COMPONENT-MAP.md + AGENT-BRIEF.md for dev handoff.

## Blocked — awaiting client (from spec §8)

Phone · hours · address (GBP-exact) · GBP URL · final service list + slugs · NWA city list ·
review count/rating · years in business · certifications · guarantee · 3–5 differentiators ·
logo + brand colors · photography · Fieldroutes embed · Maps embed · response-time SLA.
FFS side: GA4 ID, Sanity project, Vercel project, CallRail (needs phone).

## Stage gates

- LIFECYCLE-CHECKLIST.md per stage; `npm run template:audit` before handoff.
- Slugs locked before any SLP/LOC-B build (redirect overhead otherwise).
- PRE-LAUNCH-QA.md full run + Domain & SEO section before go-live; CWV targets LCP <2.5s / CLS <0.1 / INP <200ms.
- Mark provisions Sanity + Vercel in parallel; Mark signs off plan + launch.
