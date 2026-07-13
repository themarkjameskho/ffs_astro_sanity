# Bed Bug Treatment Website — Master Spec Overview v2.0

> Governing site-architecture spec for FFS Astro+Sanity bed bug sites. This is the
> navigational guide to the full spec set — it describes **what the site is**, **how it's
> structured**, and **which spec sheet to use for each page type**. It does NOT replace the
> individual page-type specs (LOC-A, LOC-B, SP, SLP, CP, BL).
>
> Companion source: `site-overview-spec-v2.html` (same folder — open for the visual version).

## 01 — What This Site Is

An SEO-first lead-generation website for a bed bug treatment business. Goal: rank in both
traditional Google search and Google Maps local pack, then convert that traffic into quote
requests and phone calls. Every page type serves one or both of those goals.

Two build configurations:

- **Single-operator** — one physical location, one service area. The homepage IS the GBP
  (Google Business Profile) landing page and must satisfy all local SEO requirements; GBP
  links directly to the homepage. ~44 pages before blog for a location serving 6 cities.
- **Franchise / multi-location** — multiple physical locations, each with its own GBP. The
  homepage is a brand hub and location router and receives NO GBP link. Each location has its
  own LOC-A page that its GBP links to. Page count multiplies per location.

The six core page types work the same in both configs; the **homepage** and **contact page**
differ by configuration. Each individual spec sheet calls out variant differences.

## 02 — The 6 Page Types

| ID | Name | URL pattern | Role (short) | Key constraints |
|----|------|-------------|--------------|-----------------|
| **HP** | Homepage | `/` | Brand hub / GBP landing (single-op) or location router (franchise) | Config-dependent |
| **LOC-A** | GBP Location Page | `/locations/[state]/[city]/` | Page GBP links to; local-pack hub for its service-area cluster | GBP linked · NAP required · internal hub · 1 per GBP location |
| **LOC-B** | Proximity Page | `/locations/[state]/[city]/` | Satellite page for a surrounding city; captures nearby-city queries with no physical address there | No GBP · **unique content required** · 4–10 per LOC-A · NO LocalBusiness schema |
| **SP** | Service Page | `/services/[service]/` | Authoritative national deep-content page per treatment method; service hub | 5 pages total · 800–1,200 words min · no city modifier |
| **SLP** | Service + Location | `/services/[service]/[state]/[city]/` | Highest-converting pages; service + city intent | 5 × all cities · **unique intro required** · link UP not across |
| **CP** | Contact Page | `/contact/` | Conversion endpoint of last resort | 1 page sitewide · form above fold · minimal outbound links · single-op/franchise variants |
| **BL** | Blog | `/blog/` + `/blog/[slug]/` | Top-of-funnel informational intent; topical authority | Article + Person schema · every post links to ≥1 money page |

## 03 — URL Architecture

| ID | URL pattern | Example |
|----|-------------|---------|
| HP | `/` | `example.com/` |
| LOC-A | `/locations/[state]/[city]/` | `/locations/illinois/chicago/` |
| LOC-B | `/locations/[state]/[nearby-city]/` | `/locations/illinois/oak-park/` |
| SP | `/services/[service-slug]/` | `/services/heat-treatment/` |
| SLP | `/services/[service]/[state]/[city]/` | `/services/heat-treatment/illinois/chicago/` |
| CP | `/contact/` | `example.com/contact/` |
| BL | `/blog/` + `/blog/[slug]/` | `/blog/early-signs-of-bed-bugs/` |

**URL conventions (sitewide):** lowercase only · hyphens not underscores · trailing slash
consistent throughout · full state/city slugs (no abbreviations) · no query strings in
canonical URLs.

**Fixed service slugs:** `heat-treatment` · `aprehend-treatment` · `chemical-treatment` ·
`canine-inspection` · `bed-bug-inspection`.

> Trailing-slash note for FFS Astro+Vercel builds: keep `trailingSlash: true` in `vercel.json`
> and ensure footer/nav hrefs match the canonical trailing slash (see auto-memory).

## 04 — Site Link Structure (authority flow, top → bottom)

```
                         Homepage (HP)
                              │
        ┌──────────┬─────────┼──────────┬──────────┐
     Service     LOC-A     Blog idx   Contact
     Pages ×5   (1/loc)    /blog/     /contact/
        │          │
   ┌────┴────┐  ┌──┴──────────┬───────────┐
  SLP ×cities  LOC-B 4–10   SLP ×5      Blog posts
```

- SLP pages sit at the **intersection of both hub systems** (linked from SP *and* LOC-A) —
  the strongest non-homepage pages in the site.
- Every page type links to **Contact**.
- Every blog post links to at least one SP, SLP, or Contact page.

**Two-Click Rule:** every LOC-A reachable within 2 clicks of the homepage; every LOC-B and SLP
within 1 click of their parent LOC-A/SP; no money page more than 3 clicks from the homepage. A
`/locations/` hub page between homepage and LOC-A is acceptable when there are many locations.

## 05 — Page Count Estimates

- **SP:** 5 (fixed, one per method, shared across locations)
- **LOC-A:** 1+ (one per GBP/physical location)
- **LOC-B:** 4–10 per LOC-A (one per surrounding city)
- **SLP:** 5 × every city served (1 location × 7 cities = 35 SLPs)
- **CP:** 1 sitewide
- **Blog:** ongoing (≥1 per content cluster at launch)

Example totals before blog:
- Single location, 6 cities → **49 pages** (1 HP + 5 SP + 1 LOC-A + 6 LOC-B + 35 SLP + 1 CP)
- Franchise, 3 locations × 6 cities → **133 pages**
- Franchise, 10 locations × 8 cities → **547 pages**

## 06 — The Two SEO Systems

- **System 1 — Service Hub:** SP → SLP spokes (one per city for that service). Targets
  "service + city" queries.
- **System 2 — Location Hub:** LOC-A → LOC-B + SLP spokes for that city. Targets
  "exterminator near [city]" / local map-pack queries.

**Intersection:** SLP pages receive a link from their parent SP *and* from their city's
LOC-A. This dual inbound authority makes them the strongest converting pages. **Never break
either link.**

## 07 — The Unique Content Rule (most important quality constraint)

Three page types require genuinely unique intro content — no city-name template swaps. Google
targets geo-templated doorway pages; copy-with-city-swapped pages won't rank and may trigger a
domain-wide quality penalty.

| Page type | What must be unique | Minimum | What can be consistent |
|-----------|--------------------|---------|------------------------|
| **LOC-B** | Intro — local neighborhood, housing type, landmark, drive-time from GBP city | 100–150 words | Services, process, FAQ, CTA structure |
| **SLP** | Intro — why this treatment suits this city's housing type, local reference | 100–150 words | How it works (brief), what to expect, pricing, FAQ structure |
| **Blog** | Full article — original analysis, not AI-spun rewrites | 600+ words | Post template, CTA block, schema structure |

Do NOT require unique intro content: **LOC-A, SP, CP** — each is one-of-a-kind by definition
(one per city / per service / sitewide). Must be accurate and complete, but cross-instance
uniqueness isn't a concern.

## 08 — Spec Sheet Reference

Each per-type spec sheet is self-contained and covers: role, target keywords, required page
assets, schema markup, internal linking rules, canonical directives, a section-by-section
wireframe, and a pre-launch checklist. Use the checklist at the end of each as the final
sign-off before a page goes live.

- **LOC-A — GBP Location Page Spec v2.0** — GBP landing page / local-pack hub. NAP, map embed,
  live review widget, service-area hub, internal-linking hub role. (Single-op: this is the
  homepage spec.)
- **LOC-B — Proximity Page Spec v2.0** — surrounding-city satellites. Unique-content depth;
  what to omit (no NAP, no map); canonical must never point to LOC-A.
- **SP — Service Page Spec v2.0** — all five service pages. 800–1,200 words; four content
  sections (mechanism, use case, what to expect, pricing); required "We Also Offer" block.
- **SLP — Service+Location Page Spec v2.0** — every service+city page. Both hub systems,
  unique-intro requirement (good/bad examples), "link UP not across", never canonical to
  parent SP/LOC-A.
- **CP — Contact Page Spec v2.0** — single `/contact/` page. Form-field anatomy, submit copy,
  two config variants (single-op NAP/map vs franchise location finder), minimal outbound links.
- **BL — Blog Spec (forthcoming)** — interim rules: every post links to ≥1 SP/SLP/Contact; use
  Article + Person schema; four clusters: identification, treatment, prevention, local/seasonal.

### How to use this spec set

- **Starting a new page?** Find its page type, open the matching spec sheet, work through it
  section by section. The wireframe shows what to build; the checklist confirms it's done.
- **Reviewing a finished page?** Use the pre-launch checklist at the end of the relevant spec.
  Every item must pass before go-live.
- **Not sure which type?** One service in one city = SLP. All services for one city = LOC-A or
  LOC-B. One service nationally = SP.
