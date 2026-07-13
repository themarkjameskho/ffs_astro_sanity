# Kadence → Sanity Migrator

Automated WordPress page migration for sites running the **Block editor (Gutenberg) + Kadence theme + Kadence Blocks**. Pulls pages via WP REST API, parses Kadence block markers, maps each block to one of our Sanity section schemas, uploads referenced images to Sanity's asset store, and writes the result as **draft** Sanity documents for editor review.

This handles the page-content half of a migration. The blog-post half stays on the existing XML import (`scripts/wp-import/`).

## Prerequisites

1. **Admin access to the WP site.** You need to generate an Application Password (WP Admin → Users → Your Profile → Application Passwords → Add new). This gives the script authenticated access without storing your real WP password.
2. **Sanity write token.** From Sanity Manage → API → Tokens. Read+write scope. Goes in `.env` as `SANITY_API_TOKEN`.
3. **Node 18+** (already a project prerequisite).

## Configuration

Add to your project's `.env`:

```bash
# WordPress source site
WP_SOURCE_URL=https://chapmanplumbingal.com
WP_REST_USER=mark
WP_REST_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx

# Sanity destination (already in .env from template setup)
SANITY_PROJECT_ID=...
SANITY_DATASET=production
SANITY_API_TOKEN=...
```

## Usage

```bash
# Dry-run: parse + show what would be created, don't write to Sanity
node scripts/kadence-migrator/migrate-pages.mjs --dry-run

# For real: writes draft Sanity docs
node scripts/kadence-migrator/migrate-pages.mjs

# One specific page only (good for iteration):
node scripts/kadence-migrator/migrate-pages.mjs --slug=about

# Skip image upload (faster while iterating on block mappings):
node scripts/kadence-migrator/migrate-pages.mjs --skip-images
```

## What gets created

Every WP page becomes a Sanity document with `_id` pattern `drafts.page-<slug>`. These are **drafts** — the editor must publish them via Sanity Studio before they go live. This is intentional: drafts let you QA the migration without affecting production.

Each page document has a `sections[]` array. Every Kadence block in the page becomes one (or sometimes more) entries in that array, mapped per `block-mappers/`.

## What it handles in v0.1

Top-priority Kadence patterns, mapped to our Sanity section schemas:

| Kadence block / pattern | Maps to |
|---|---|
| `kadence/rowlayout` w/ bg image + h1 + button(s) | `heroSection` |
| `kadence/info-box` × N inside a `rowlayout` | `iconGridSection` (vertical-card) |
| `kadence/iconlist` standalone | `iconGridSection` (flat) |
| `kadence/accordion` | `faqSection` |
| `kadence/rowlayout` 2-column with image + text | `twoColTextImageSection` |
| `kadence/form` | `leadFormSection` |
| `kadence/testimonials` | `htmlSection` (fallback) |
| Anything else (unknown block) | `htmlSection` with the raw block HTML preserved |

The "anything else" fallback is the safety valve. The page won't break if a block isn't yet mapped — it just renders as raw HTML, and the migration report tells you which blocks fell through so you can add a mapper next iteration.

## Migration report

After each run the script writes `scripts/kadence-migrator/migration-report.json` summarizing:

- Pages processed (slug, title, section count)
- Blocks encountered (count by type + which mapper handled them)
- Unmapped blocks (block name + which pages they appeared on)
- Images uploaded (count + total bytes)
- Errors (per-page if any)

Use the report to decide which new mappers to write next.

## How to extend

Each Kadence block has its own file under `block-mappers/`. To add a mapper for an unhandled block:

1. Inside `block-mappers/`, create `<kadence-block-name>.mjs`. Use one of the existing mappers as a template.
2. Export a default function `(block, ctx) => sanitySection | sanitySection[] | null`:
   - `block` is the parsed block object (has `.name`, `.attrs`, `.innerBlocks`, `.innerHTML`)
   - `ctx` provides `.uploadImage(url) → Promise<assetRef>`, `.toPortableText(html) → block[]`, `.options` for CLI flags
   - Return a Sanity section object matching your schema, an array of them, or `null` to skip
3. Register the mapper in `block-mappers/index.mjs`
4. Re-run the migrator; the migration report should show your new block being handled

## When this graduates to a Cowork plugin agent

Once the migrator has been run on 2+ Kadence client migrations and the `block-mappers/` directory covers 90%+ of patterns we see, this code should be promoted into the `astro-sanity-migration` Cowork plugin as the `kadence-page-migrator` agent. Then any Cowork conversation can invoke it autonomously.
