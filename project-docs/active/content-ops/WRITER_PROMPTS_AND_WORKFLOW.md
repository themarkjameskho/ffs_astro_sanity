# Writer Prompts And Workflow

Use this for all AI-assisted content writing before content is entered into Sanity or handed to development. The goal is better output: specific, source-grounded, section-ready copy that follows the FFS home-service/pest-control architecture and does not create SEO or legal risk.

This workflow applies to both:
- New builds
- WordPress → Astro + Sanity migrations

It must be used together with:
- `project-docs/LIFECYCLE-CHECKLIST.md`
- `project-docs/reference/seo/site-overview-spec-v2.md`
- `project-docs/active/content-ops/CONTENT_WRITER_GUIDE.md`

## Non-Negotiable Writing Rules

- Do not invent reviews, ratings, certifications, warranties, prices, same-day availability, emergency service, service areas, or years in business.
- Do not write city-name-only location pages. Each location/service-location page needs unique local context, examples, and opening copy.
- Do not copy raw WordPress block text without rewriting it into the standard section model.
- Do not create `htmlSection` content except for legal copy or approved third-party embeds.
- Do not use a CTA label as a URL. CTA links must be real paths such as `/contact-us/`, anchors such as `/contact-us/#contact_form`, or valid `tel:` links.
- Do not use “free,” “guaranteed,” “100%,” “safe,” “non-toxic,” or pricing claims unless the client explicitly approved them.
- Keep NAP identical everywhere.
- Every page must map to available Sanity section types.

## Required Inputs Before Writing

If any required input is missing, the writer or AI agent must produce an “Open Items” list instead of pretending the information exists.

- Client/brand name
- Domain and canonical URL preference
- Business type: bed bug, pest control, or other home service
- Service list
- Service area list
- NAP and phone numbers
- Approved offers, guarantees, and forbidden claims
- Review source and whether reviews may be quoted
- Brand tone and reference sites
- Page list and URL structure
- For migrations: WordPress URL inventory and source page content

## Output Standard

Every generated page must use this output structure:

```md
# Page: <Page Title>

Page Type:
Slug:
Primary Keyword:
Secondary Keywords:
Search Intent:
Target Audience:
Unique Angle:
Open Items:

SEO Title:
SEO Description:

## Section Stack

1. heroSection
   - Title:
   - Highlight Text:
   - Subtitle:
   - Bullets:
   - Primary CTA Label:
   - Primary CTA Link:
   - Secondary CTA Label:
   - Secondary CTA Link:
   - Image/Map Notes:

2. <sectionType>
   - Title:
   - Description/Body:
   - Items:
   - CTA:

## Internal Links
- <anchor text> → <path>

## Uniqueness Notes
- What makes this page distinct from related service/location pages?

## Compliance Notes
- Claims used:
- Claims avoided:
- Required approvals:
```

## Workflow

### Step 1: Classify The Work

Use this prompt first.

```text
You are planning content for an FFS Astro + Sanity home-service site.

Classify this work as one of:
- New build
- WordPress migration
- Rebuild
- Landing-page microsite

Inputs:
<paste client brief, sitemap, URL list, or project notes>

Return:
1. Classification
2. Missing requirements
3. Page types needed
4. Whether WordPress migration workflow is required
5. Risks that would reduce content quality

Do not write page copy yet.
```

### Step 2: Create The Content Plan

Use after requirements are mostly known.

```text
You are the site planner and content strategist for an FFS Astro + Sanity home-service site.

Use these rules:
- Follow the FFS home-service/pest-control architecture.
- Map every page to standard Sanity section types.
- Do not invent claims, reviews, prices, guarantees, or service areas.
- Flag missing inputs as Open Items.
- Location and service-location pages must have unique angles, not city-name swaps.

Inputs:
Brand:
Business type:
Services:
Service areas:
NAP:
Approved offers/claims:
Forbidden claims:
Reference sites:
Existing WordPress URLs, if migration:
Target launch page list:

Return:
1. Site structure
2. URL plan
3. Page-by-page content plan
4. Page-by-page section stack
5. SEO title and meta description for every page
6. Internal-link plan
7. Open items
8. Migration redirect notes, if applicable
```

### Step 3: Draft A Standard Page

Use for homepage, service pages, contact, and hub pages.

```text
You are writing section-ready copy for an FFS Astro + Sanity home-service site.

Write only copy that can fit the existing Sanity section model.

Rules:
- Hero title is the only H1.
- Section titles after hero are H2.
- Card/item titles are H3.
- Subtitle fields are supporting copy, not headings.
- CTA links must be real URLs or tel links.
- Do not use raw HTML.
- Do not invent claims, reviews, prices, guarantees, or certifications.
- Keep copy specific to the page's search intent.

Page brief:
<paste page brief from content plan>

Brand facts:
<paste approved facts>

Related pages to avoid duplicating:
<paste related page summaries>

Return in the Output Standard format.
```

### Step 4: Draft A Location Or Service-Location Page

Use this instead of the standard page prompt for city/location SEO pages.

```text
You are writing a unique location/service-location page for an FFS Astro + Sanity home-service site.

The page must not be a city-name swap.

Rules:
- Create a distinct opening angle for this city or service area.
- Use only verifiable local context from the provided inputs.
- If local details are missing, write an Open Items list instead of inventing neighborhoods, landmarks, or claims.
- Vary examples, customer situations, service emphasis, and internal links from related pages.
- Keep NAP identical and do not imply a physical office in a city unless approved.
- No fabricated reviews.

Page:
City/service area:
Service:
Approved local details:
Nearby pages already written:
Brand facts:
CTA destination:

Return:
1. Full Output Standard
2. A short "Why this page is unique" note
3. A "Similarity Risk" note comparing it to nearby pages
```

### Step 5: Rewrite Migrated WordPress Copy

Use for WordPress → Astro + Sanity migrations.

```text
You are migrating WordPress content into the FFS Astro + Sanity section model.

Task:
Rewrite the source page into clean Sanity sections. Do not preserve Kadence/Gutenberg layout language unless it is meaningful content.

Rules:
- Convert the page into standard section types.
- Do not output raw HTML except for legal content or approved embeds.
- Preserve accurate service details, NAP, URLs, and claims.
- Remove inherited old-brand wording.
- Flag any unverifiable claim instead of repeating it.
- Keep the original search intent and redirect implications in mind.

Source URL:
Old page title:
Old page copy:
Approved new brand facts:
Target slug:
Related pages:

Return:
1. Output Standard
2. Source facts preserved
3. Claims requiring approval
4. Suggested redirects
5. Any content that would otherwise become htmlSection
```

### Step 6: Blog Prompt

```text
You are writing a blog post for an FFS Astro + Sanity home-service site.

Rules:
- Original analysis only. Do not spin another post.
- 600+ words minimum unless the content plan says otherwise.
- H1 is the blog title only.
- Body uses H2 sections and H3 subsections only when needed.
- Include 3-5 internal links to relevant service/location/contact pages.
- Include external authority links only when useful and reputable.
- Do not invent claims, reviews, prices, guarantees, or certifications.

Blog brief:
Keyword:
Audience:
Service/location relevance:
Approved facts:
Internal links available:
Forbidden claims:

Return:
Title:
Slug:
Excerpt:
SEO Title:
SEO Description:
Category:
Tags:
Featured Image Brief:
Body:
Internal Links Used:
Open Items:
```

### Step 7: Editor QA Prompt

Run this before content is approved.

```text
You are the editor/QA reviewer for FFS Astro + Sanity content.

Review this draft against:
- Lifecycle checklist
- Content Writer Guide
- FFS SEO unique-content rule
- Sanity section compatibility
- Legal/claim safety
- Migration cleanliness, if applicable

Draft:
<paste draft>

Return:
1. Pass/fail
2. Blocking issues
3. Non-blocking improvements
4. Missing requirements
5. Duplicate/similarity risk
6. Claims that need approval
7. Section-contract issues
8. Final revised copy, only if fixes are straightforward
```

## Better Output Checklist

Use this to judge whether the prompt output is good enough.

- [ ] The page has a clear search intent and audience.
- [ ] The section stack maps directly to Sanity section types.
- [ ] The hero is concise and not overloaded.
- [ ] CTA labels and links are usable.
- [ ] Local/service pages have a unique angle.
- [ ] No unsupported claims are introduced.
- [ ] No raw HTML is needed except approved legal/embed cases.
- [ ] Internal links are relevant and valid.
- [ ] SEO title and description are within limits.
- [ ] Open items are clearly listed instead of hidden.
