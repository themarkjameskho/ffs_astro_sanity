# Kadence → Sanity Block Mapping Log

A running log of every Kadence (Block editor) pattern we encounter during a WordPress migration and how we map it to registered Sanity section schemas. **Keep this file alive across projects** — it is evidence for a future governed Kadence-to-Sanity import tool.

> **Why this log exists.** Our FFS migration target stack is consistent: clients on Gutenberg with Kadence Theme + Kadence Blocks. Unlike Elementor/Divi soup, Kadence saves content with explicit HTML comment markers (`<!-- wp:kadence/rowlayout -->`, etc.) that make deterministic block → section mapping feasible. Logging every pattern we see now means the parser we eventually write is grounded in real client data, not guesses.

## How to use this file

1. **Before migrating each page** of the client's WP site, open the page in WP Admin → Edit. Note every Kadence block used.
2. **For each block pattern** not already in the table below, add a row. Include: a description of how it's used, the Sanity section you mapped it to, and any quirks.
3. **If a block doesn't fit any existing Sanity section,** log it in "Unmapped patterns" below. It is a candidate for an approved reusable variant or shared section, never a page-only workaround. `htmlSection` is limited to approved legal copy or vetted embeds.
4. **At the end of the project,** commit this file. Future Kadence migrations start with a richer table.

## Block patterns observed

| Kadence block / pattern | First seen on (URL) | What it looks like on the live site | Mapped to our Sanity section | Field mapping + quirks |
|---|---|---|---|---|
| `kadence/rowlayout` + bg image + `kadence/advancedheading` h1 + 2 `kadence/advancedbtn` | _example: /home_ | Full-width hero with background image, large headline, two CTAs side-by-side | `heroSection` (layout: 1-col, side-image=none) | h1 → `title`, sub → `subtitle`, button #1 → `primaryCta`, button #2 → `secondaryCta`. Bg image → upload as Sanity asset, reference via `backgroundImage`. |
| `kadence/info-box` × N in `kadence/rowlayout` | _example: /home_ | Grid of 3–4 cards, each icon + heading + paragraph | `iconGridSection` (size: medium, layout: vertical-card) | Each info-box → one item in the grid. Heading → `title`, paragraph → `description` (portable text), icon → `icon` asset. |
| `kadence/iconlist` | _example: /home features_ | List of bulleted items with icons (checkmark, star, etc.) | Inline bullets inside another section (e.g., `heroSection.bullets[]` or `twoColTextImageSection.bullets[]`) | If the iconlist stands alone as its own section, wrap it in `iconGridSection` (layout: horizontal). |
| `kadence/accordion` (FAQ accordion) | _example: /faq_ | Toggle list with Q&A pairs | `faqSection` | Pane title → `question`, pane content → `answer` (portable text). Preserve order from Kadence. |
| `kadence/rowlayout` 2-column (image one side, text the other) | _example: /about_ | Image on left/right, heading + paragraph + bullets on the other | `twoColTextImageSection` | `imagePosition`: 'left' or 'right' based on which column has the image. Image → upload + reference. Heading → `title`, paragraph(s) → `body` portable text. |
| `kadence/testimonials` | _example: /home_ | Carousel or grid of customer reviews | **HOLD — reusable testimonial variant required** | Preserve review provenance and propose a shared component/variant before import; do not embed marketing HTML. |
| `kadence/form` | _example: /contact_ | Lead form with name/email/message/etc. | `leadFormSection` | Fields are fixed in our schema (firstName, lastName, phone, email, address, methodOfContact, bestTime, message). If the Kadence form has different fields, decide: extend the schema OR pre-fill defaults. |
| `kadence/spacer` / `kadence/divider` | _various_ | Empty vertical space | **Ignored** — visual spacing is handled by our section component padding. |
| `kadence/btn-template` (single button outside a row) | _various_ | Standalone CTA block | Convert to a primary/secondary CTA inside whatever section contains it. If truly standalone, wrap in `ctaSection`. |
| `core/paragraph` / `core/heading` (raw Gutenberg, not Kadence) | _various_ | Plain text outside any Kadence wrapper | Folded into the nearest section's portable-text body. |

## Unmapped patterns (need a decision)

When a Kadence pattern doesn't fit any existing Sanity section, log it here. Each entry needs a decision: **(a)** use an existing shared component/approved variant, **(b)** propose a new reusable shared component through the architecture gate, or **(c)** restructure the content during migration to fit existing sections.

| Pattern | Seen on | Why it doesn't fit | Decision |
|---|---|---|---|
| _example row — delete when filling in real data_ | _example: /pricing_ | Pricing comparison table with feature checkmarks across 3 tiers | HOLD for architecture-owner decision: approved reusable comparison variant or content restructuring |

## REST API extraction reference

For automated extraction once enough patterns are logged:

```bash
# Generate an Application Password in WP admin: Users → Your Profile → Application Passwords
# Then fetch raw block content (the "?context=edit" gives us the <!-- wp:* --> markers):

curl -u "user:APP_PASSWORD" \
  "https://<wp-site>/wp-json/wp/v2/pages?context=edit&per_page=50" \
  > pages-raw.json

# Each page has content.raw containing the block markers.
# Posts: replace /pages with /posts.
# Media: replace with /media (returns image URLs + alt text + metadata).
```

## When to promote this to an agent

Conditions for graduating the log to a governed Kadence-to-Sanity import tool:

- [ ] At least 2 Kadence-based client migrations completed using this log
- [ ] Block-pattern table covers 80%+ of patterns seen across those clients
- [ ] "Unmapped" list is short and stable (no new patterns in the last migration)
- [ ] We've shipped at least one Sanity schema extension to fill an unmapped gap (proves the schema can evolve cleanly)

When those four boxes are checked, the agent is worth building. Until then, manual rebuild with this log open is the right speed.
