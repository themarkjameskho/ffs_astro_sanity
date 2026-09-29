# WordPress → Astro + Sanity Migration Playbook

**v2.2 — August 2026. v2.0 was rewritten from the Bed Bug BBQ migration (459 documents, 1,501
media files, 296 redirects) and from what went wrong on Chapman; v2.1 adds everything the staging
verification then surfaced, in Phase J; v2.2 adds Phase H2 (merge-aware seeding over earlier work)
and the seventh top-level failure mode, from Chapman's 2026-08-11 seed-package work — where a
"correct" plan would have silently destroyed 81 already-migrated blog bodies.** v1.0 was written
from the BBBQ *rebuild* and described the shape of the work correctly but not the traps. Every "⚠️"
below is something that actually bit us, with the fix that worked.

Use this together with `project-docs/LIFECYCLE-CHECKLIST.md`. The single most important change from
v1.0: **the gates are now measurements, not opinions.** Every phase ends in a number you can check,
because on Chapman the failure was invisible until a developer clicked a sub-page and got a 404.

---

## The five things that actually go wrong

If you read nothing else, read this. Four of the five are silent — the build passes, the site
deploys, and the damage only shows up in Search Console weeks later.

**1. Sub-page URLs 404 while main pages work.** Sanity's default slugify collapses `/` to `-`, so a
nested slug typed as `services/water-heater-repair` is stored as `services-water-heater-repair`. The
catch-all route looks a page up by its **full path**, so the hyphenated slug can never match.
Single-segment slugs survive slugify unchanged, which is why main pages look fine and only sub-pages
break. **This blocked Chapman for days.** Fix: `pathSlugify` in
`studio/schemaTypes/utils/slugValidation.ts`, wired into every nestable slug field, then redeploy the
Studio. Schema changes don't reach editors until `sanity deploy`.

**2. Post URLs get silently relocated to `/blog/`.** `blogPost` documents are only reachable through
`src/pages/blog/[slug].astro`, so if the WordPress originals lived at the root, every one of them
404s. The wrong fixes are to import posts as `page` documents (keeps the URL, destroys the post
model) or to accept `/blog/` (keeps the model, breaks every URL). Fix: make the URL a property of the
document — see "Post URLs" below.

**3. Inherited links point at pages that don't exist.** A repo forked from another client ships that
client's hardcoded hrefs in `src/data/navigation.ts` and `ServiceAreaSection.astro`. They render, they
look real, and they 404. Bed Bug BBQ was still shipping BBBGN's Tulsa city links weeks in.

**4. `studioHost` belongs to another client.** `studio/sanity.cli.js` ships with the previous
client's `*.sanity.studio` hostname. Running `sanity deploy` without checking targets **their live
Studio**. Check `grep studioHost studio/sanity.cli.js` before every first deploy.

**5. The layout crashes on every page.** `MainLayout.astro` references `brandLogoPath` in the
`og:image` and `twitter:image` tags, and that variable is defined nowhere — the computed value is
`absoluteLogoUrl`. Every render throws `ReferenceError`, so *nothing* works and it looks like a
catastrophic import failure. It ships in the template. Fix both references before the first page load.

**6. Redirects that destroy live pages.** A WordPress redirect export will contain rules whose
*source* is a currently-published page — including self-redirects. Inert on WordPress; in
`vercel.json` a self-redirect is an infinite loop and the rest 301 live pages into oblivion. Always
validate redirect sources against the published-URL set.

**7. Your own earlier import is already in the dataset — and re-seeding erases it.** Migrations run
across many sessions, and earlier sessions leave real work behind as drafts. On Chapman the dataset
held **270 drafts** the current plan knew nothing about, including 81 blog posts whose ~20 KB
Portable Text bodies and featured images came from an earlier *approved* body-migration run. The
current plan's posts were metadata-only (`content: []`), so a createOrReplace seed would have wiped
every body — with a green log, because replacing a draft is not an error. Separately, five planned
routes were already owned by drafts under **different ids**, so seeding would have shipped two
documents per URL. Fix: Phase H2 — diff the plan against existing drafts per document before any
write, seed with explicit per-document actions, and check **route** collisions, not just id
collisions.

---

## Phase A — Intake and exports

**Ask for three exports, not one** (WP Admin → Tools → Export): **All content**, **Redirections**,
and **Schemas** if the client runs SEOPress Pro. Expect surprises in the latter two — on Bed Bug BBQ
the Schemas export was *empty* (all 67 values were the serialized-empty `a:0:{}`), and the
Redirections export turned out to be a subset: three more redirects were stored as postmeta on
regular pages. Extract from both and merge.

**Do not use the Media export for media.** It is images-only and silently omits PDFs. Bed Bug BBQ
lost three PDFs that were live download links on four published pages. Ask instead for the
`wp-content/uploads/` folder copied wholesale, preserving the `YYYY/MM` structure.

**Commit the WXR gzipped.** A 25 MB export gzips to ~2.3 MB, which is small enough to live in git and
makes the whole import reproducible for anyone who clones. `lib/wxr-source.mjs` reads `.xml.gz`
directly, so nobody has to remember to extract it. Put it in
`project-docs/archive/wordpress-baseline/`.

**Credentials.** You need far less than v1.0 claimed. The import needs **only** a write-scoped
`SANITY_API_TOKEN`. You do **not** need a WP application password — the WXR replaces the REST API —
and you do not need the ISR or form webhooks until QA. When you do reach QA, the ISR webhook is
three steps and two traps — `openssl rand -hex 32`, the value into Vercel as
`SANITY_WEBHOOK_SECRET` and into Sanity as a custom `x-vercel-webhook-secret` header (**not** the
`Secret` field, which signs a different header and 401s), scoped to one dataset. See
[SANITY_WEBHOOK_SETUP.md](../reference/deployment/SANITY_WEBHOOK_SETUP.md).

⚠️ **Values pasted inside `{{ }}` braces.** Placeholders get filled by pasting the real value
*between* the braces, so the line reads `SANITY_API_TOKEN={{sk…}}`. The value is right and every
request 401s. This happened three times on one repo. Before reporting anything as "not provided",
check whether the braces contain something other than a SCREAMING_SNAKE name. Run
`node scripts/check-sanity-token.mjs` — it checks brace-wrapping, read auth, and whether the token
actually has **write** scope via a `dryRun` mutation that creates nothing.

**Exit:** three exports on disk, WXR gzipped and committed, token check passes clean.

---

## Phase B — Baseline audit

Produce four artifacts in `project-docs/archive/wordpress-baseline/`. All four are inputs to later
phases, and all four are cheap compared to discovering the same facts by hand.

`url-inventory.csv` — every URL with type, page-type classification, lastmod, and a
KEEP/RENAME/RETIRE decision. `existing-redirects.csv` — every redirect with hit counts, sorted by
traffic, with a `target_status` column. `seo-meta.csv` — the SEOPress title, description and target
keyword per URL; Bed Bug BBQ recovered these for **463 URLs**, which is the difference between
porting meta like-for-like and rewriting it. `media-manifest.json` — every attachment reconciled
against the local files, carrying alt text.

⚠️ **Do not trust the live sitemap as the URL inventory.** Bed Bug BBQ's sitemap listed 146 of 337
published posts and 60 of 125 pages. It was not noindex — zero pages carried the flag. It was a
**lastmod cutoff**: every entry had been modified after a certain date, and everything older was
simply absent, a SEOPress sitemap cache that never regenerated. Count from the WXR, always, and treat
a sitemap/WXR mismatch as a finding to report rather than a discrepancy to reconcile.

**Exit:** all four CSVs exist; published page and post counts come from the WXR and are stated
explicitly; any sitemap gap is quantified.

---

## Phase C — Inherited-fork cleanup

Everything in v1.0 still applies — GA, CallRail, brand copy, domains — plus two additions.

**Replace hardcoded link arrays with one data module.** `src/data/navigation.ts` and
`ServiceAreaSection.astro` carry the source fork's hrefs. Don't patch them in place; derive the real
list from the URL inventory into a single `src/data/serviceArea.ts` that nav and sections both read
from, so the links can't drift apart again.

**Rebrand the Studio, not just the site.** `sanity.cli.js` (`studioHost`), `sanity.config.ts`
(`name`, `title`, `subtitle`) and `studio/package.json` all carry the previous client's identity.

⚠️ **Fix `MainLayout.astro`'s `brandLogoPath` before anything else.** It is an undefined variable
used twice in the social meta tags; `absoluteLogoUrl` is the value intended. Until it is fixed every
route throws and no other verification means anything.

⚠️ **`sanity.cli.js` only loads `../.env`.** If the repo uses `.env.local`, the Studio throws
"Missing SANITY project configuration" on deploy. Load both.

**Exit:** `grep -rniE '<old-brand>|<old-domain>|G-<old-GA>' src studio public` returns nothing;
`grep studioHost studio/sanity.cli.js` names *this* client; no hardcoded city or service links remain
outside a data module.

---

## Phase D — Block mapping

**Two rules, both non-negotiable.** No new section schema — route everything to the 14 types already
registered in `studio/schemaTypes/documents/page.ts`. And **`htmlSection` is for embedding
something**, never a fallback: if a block doesn't resolve to a real component, either the detection
rule is wrong or the block is WordPress chrome that should be **dropped**.

⚠️ **Read the object schemas before claiming a section type is missing.** The instinct to add a
`textSection` for prose bands is wrong: `twoColTextImageSection` already has a portable-text
`description`, `bulletTitle`, six background themes, an `imagePlacement` toggle and h2/h3 heading
levels. Its `images` field is `required().min(1)`, so a prose band needs a **placeholder image** —
attach one shared asset, never one per section, and alternate `imagePlacement` while cycling
`backgroundTheme` so consecutive bands don't look identical.

⚠️ **The mapper that ships with the template was written against an older schema.** It emits
`heroSection.primaryCta{label,href}` where the schema has `primaryCtaLabel`,
`twoColTextImageSection.image` + `imagePosition` where the schema has `images[]` + `imagePlacement`,
`ctaSection.primaryCta` where the schema has `primaryButton{label,link,style}`, and
`faqSection.items` where the schema has `faqs`. Documents built that way lose content silently.
Verify every field name and enum value against the schema files.

⚠️ **Detection order is load-bearing**, because most patterns are supersets of simpler ones. Test in
this order: drop chrome → real embed → real form block → map/contact → accordion → tabs → hero
(`h1` + bg or button) → post feed → areas → reviews → enumerated steps → icon grid → service grid →
2-col with image → CTA → prose with placeholder → drop empties. **If CTA is tested before hero, every
hero on the site lands in the wrong component.**

Three counting rules that change the numbers by multiples. **Collapse consecutive bare top-level
blocks** (paragraph, heading, list) into one section — without it, Bed Bug BBQ's 841-section import
measured 5,213 and `twoColTextImageSection` looked like 86% of the site. **WordPress omits the `core/`
namespace** in block comments, so normalise `paragraph` → `core/paragraph` or the collapsing never
fires. And **require real enumeration for `stepsSection`** — matching bare words like "process" or
"inspection" dragged 148 ordinary prose bands in, because that vocabulary is everywhere in
pest-control copy.

**Drop WordPress chrome rather than migrating it.** `[seopress_breadcrumbs]` shortcodes, empty
rowlayouts and spacers. Migrating breadcrumbs ships a duplicate trail on top of the layout's own.

**Exit:** a dry-run report showing zero fallbacks, how many of the 14 components are used, how many
distinct variants are exercised, and what was dropped and why. Report component spread as a quality
metric — a mapping that only touches three components produces monotonous pages.

---

## Phase E — Slugs and post URLs

This is the phase v1.0 didn't have, and the one that cost Chapman the most time.

**Every page slug is the FULL path.** `locations/cleveland-ohio/parma-bed-bug-exterminator`, not
`parma-bed-bug-exterminator`. `fetchPageBySlug` only tries slash-position variants of the whole path
— never the last segment — so a short slug can never resolve. Add `pathSlugify` to every nestable
slug field so typing *and* the Generate button both preserve slashes, then **redeploy the Studio**.

**Post URLs belong to the document, not the route.** When the originals lived at the root, keep them
there and keep them as `blogPost` documents:

The catch-all `[...slug].astro` tries a `page` first and falls back to a `blogPost` before 404ing.
One `postHref` helper is the single source of truth for a post's URL — its slug, nothing prefixed.
The article markup lives in one component (`BlogPostArticle.astro`) used by both paths, because two
copies drift and then a post looks different depending on how you reached it. And
`src/pages/blog/[slug].astro` becomes a **301 only**, and only when the post exists — a blind
redirect turns a bad URL into a broken-looking redirect. Two live URLs for one article is duplicate
content, which is the exact problem Phase F exists to prevent.

⚠️ **Grep for hardcoded `/blog/${slug}/`.** `BlogListSection.astro` had **seven**, one of them inside
its client-side `<script>` — a separate scope that needs its own copy of the helper.

**Exit:** a nested page URL and a root-level post URL both return 200; `/blog/<slug>/` returns 301 to
the post's canonical path; no hardcoded post-URL construction remains.

---

## Phase F — Redirect map

Port every existing redirect — these are already-earned traffic. Bed Bug BBQ's 296 entries protect
**199,070 recorded 404 hits**, and the top single redirect had 3,747.

⚠️ **Validate every redirect source against the published-URL set.** Four of Bed Bug BBQ's 283 had a
*live page* as their source, including one that redirected to **itself** (an infinite loop in
`vercel.json`) and two pointing at `/category/…` paths that never existed on that site. Exclude them
and say why.

⚠️ **Flatten chains.** Vercel does not follow a redirect to another redirect, and Google discounts
chains. Also repoint anything that *targets* a URL you're about to start redirecting, or you create a
new chain at cutover.

⚠️ **Duplicate-slug pairs: the ORIGINAL is canonical.** WordPress generates `-2` and `-old` slugs and
then, in our experience, redirects the *original* to the fossil — donating the equity of the URL that
earned it. Bed Bug BBQ had four such pairs; the original held the longer or equal copy in every one.
Fold the fossil into the original, and make sure the import **excludes the fossils** or the new site
republishes them as live competitors.

Then check the indexing consequences, because redirects alone don't undo the damage. On Bed Bug BBQ
the live sitemap advertised two fossils and omitted all four originals, so Google had most likely
settled on the wrong canonical. Changing canonicals is disruptive by nature — **expect a dip before
recovery**, and verify with Search Console URL Inspection after cutover rather than assuming.

**Exit:** `vercel.json` parses; no self-redirects; no chains; no duplicate sources; no source is a
live page except intentional renames; trailing-slash canonicaliser last; recorded hit count stated.

---

## Phase G — Media seeding

**The XML is what makes the files useful.** It carries `_wp_attachment_image_alt` (Bed Bug BBQ: alt
text for all but 130 of 1,501 files), the parent page of each attachment, plus title, caption and
date. Regenerating a thousand alt attributes by hand is days of work and skipping it fails
accessibility QA.

⚠️ **Key assets on the file PATH, not the WP attachment id.** WordPress commonly has several
attachment records pointing at one file — keying on the id uploads the same image twice.

⚠️ **In-content `<img src>` points at resized derivatives, not originals.** Bed Bug BBQ had 171
references to `-1024x683` / `-150x150` variants that don't exist in the export, plus `-scaled` cases
(WordPress renames anything over 2560px). Strip the size suffix and upload the original — Sanity's
CDN resizes on demand, which is better than importing WordPress's thumbnails. Don't bulk-convert to
WebP either; request `?fm=webp` in the image URL builder and respect the px cap in
`PERFORMANCE-STANDARD.md`.

**Never commit the media folder.** Hundreds of MB of binaries sit in git history forever. Gitignore
the folder, commit the manifest.

**Watch for cross-domain hot-links.** Five Bed Bug BBQ images were served from `bedbugtogo.com`, a
different domain. They keep depending on it after cutover unless pulled across.

**Exit:** every in-content upload URL resolves to a local file or is explicitly listed as an
exception; a grep of the imported dataset for `wp-content/uploads` returns **zero** — make that a
hard pre-launch gate.

---

## Phase H — Import, with rails

**Write drafts, always.** Never publish from a script into production.

**Never assume an empty dataset.** A freshly provisioned Sanity project already holds a dozen system
documents. The importer should fetch existing ids, write only ids it owns (`page-<slug>` /
`post-<slug>`), and **refuse to modify anything it did not create** without `--force`. Report the
not-owned ids rather than silently skipping them.

**Be idempotent on slug** so a re-run updates in place. Use deterministic `_key`s, not random ones,
or every re-run rewrites every section.

⚠️ **`src/lib/sanityClient.ts` pins `perspective: 'published'`, so the site cannot see drafts.** A
freshly imported dataset 404s on every URL, which reads exactly like a failed import. Verify by
publishing in a throwaway `staging` dataset — `scripts/kadence-migrator/publish-drafts.mjs` does this
and refuses to run against production. Production stays drafts for human review.

**Image assets are per-dataset.** The production import re-uploads everything. Expected, not waste.

**Exit:** dry-run figures reproduce exactly; staging import writes the expected count; the not-owned
list is accounted for.

---

## Phase H2 — Merge-aware seeding over earlier work (new in v2.2, from Chapman)

Phase H's "never assume an empty dataset" is about *system* documents and *other people's* ids. This
phase is about the harder case: documents from **your own earlier sessions**, under ids the plan
legitimately owns. Ownership rules don't protect you from yourself — a replace-based seeder will
happily overwrite an id it owns, and the run reports success while destroying approved work.

**Run a read-only pre-seed gate before any write, and make it produce a per-document verdict.** On
Chapman this diffed the frozen plan against the live dataset and classified every planned document:
byte-identical (172), absent (64), or **differing** (93 — where the differences turned out to be 81
fully-migrated blog bodies the plan would have flattened). The gate also takes a **full-dataset
backup** (Chapman: 868 documents, path + SHA-256 recorded) before anything mutates. If an intended
id already exists, stop and *compare the stored document* — never overwrite merely because it is a
draft you own.

⚠️ **Check route collisions, not just id collisions.** Two documents with different ids can own the
same URL — Chapman had five (`/contact/`, `/plumbing-services/` among them), created when an earlier
session seeded pages under ad-hoc ids and the deterministic plan later generated its own. Id checks
pass; the site ships two documents per route. The gate must assert URL uniqueness across
*existing + planned* documents combined. Resolution is a decision, not a default — on Chapman the
existing ids were adopted into the plan (remapped in the generator, never by hand-editing JSON).

**Seed with explicit per-document action classes**, computed from the diff and reconciled against the
verdict report before the write: `SKIP_IDENTICAL`, `CREATE`, `REPLACE` (only where the plan's version
is approved to win), and `PATCH_METADATA_ONLY` for documents where the existing draft owns content
the plan doesn't carry. For patches, hard-code a **protected-field list** (`content`,
`featuredImage`, body-derived fields) the seeder may never touch, assert it in tests, and verify in
readback that protected fields kept their pre-seed hash. Any drift between expected and actual class
counts is a blocking finding, not something to force through.

**Who owns a field is a decision to put in front of Mark, not a merge heuristic.** On Chapman the
calls were: existing drafts own blog bodies; the plan owns metadata, taxonomy and SEO; the plan's 12
improved pages replace; existing ids win the 5 route collisions. Record the ratified decisions in the
evidence register and encode them in code — a future session must be able to see *why* the seeder
patches instead of replaces.

**The operator flow is dry-run → write → dry-run.** The second dry-run must report zero pending
mutations — that is the idempotency proof. Re-count published documents afterwards and verify their
pre-seed count/hash is unchanged.

Three smaller Chapman lessons that belong here:

⚠️ **Compute `blocking` from real gates — never hard-code it, in either direction.** The plan builder
shipped with `blocking: errors.length > 0 || true` as a placeholder hold. Safe, but it also means the
flag is meaningless until someone remembers to remove it — and the removal moment is exactly when a
mistake ships. Every gate (coverage, schema, media, body, collision) must be a computed condition,
and the pipeline must build the plan in **one deterministic command** — Chapman's base-plan builder,
run casually after later integrations, would have overwritten them.

⚠️ **An evidence hash without its extraction rule is not evidence.** A ref-2811 fragment hash
recorded by an earlier session could not be re-derived from any live page because nobody wrote down
*how* it was computed. It had to be superseded by a reproducible hash, identical across all 15
affected pages. Record the rule with the hash, always. Related: a reusable block appearing on a page
in the WXR is **not** page-level evidence — Chapman's approved set covered 13 pages while the WXR
showed 15; the two extras needed their own rendered proof before the mapping could claim them.

⚠️ **Validation caps can silently rewrite source content.** Studio `seoTitle`/`seoDescription` length
rules set as hard errors would have forced truncation of 36 source titles during migration. During a
migration, fidelity beats style rules: demote length caps to warnings so source values land verbatim,
and let editors shorten them afterwards as a content decision.

**Exit:** pre-seed gate `PASS` with backup path + SHA-256 recorded; per-document action classes
reconcile against the diff verdicts; zero route collisions across existing + planned; write completed;
second dry-run reports zero mutations; protected fields verified unchanged by hash in readback;
published-document count/hash unchanged.

---

## Phase I — Verification gates

Measure, don't browse. On Chapman the 404s were found by a developer clicking around; that is not a
gate.

Run a **status-code sweep** over a sample that deliberately includes the shapes most likely to break:
the homepage, a single-segment page, a **two-level nested page**, a **three-level nested page**, a
root-level post, the blog index, and `/blog/<post-slug>/` which must return **301**. Then **grep the
rendered HTML** of five pages for `wp-content/uploads` — every count must be zero. Then confirm the
sections with no WordPress source render (on Bed Bug BBQ, `areasSection` on the metro hub, fed from
`serviceArea.ts`), that the shared placeholder resolves to **one** asset id across different pages,
and that a post's canonical points at its root URL.

**A missing verification script is a gap worth closing.** `npm run template:audit` covers
placeholders, routes and domain leaks but does **not** check that every internal href resolves to a
real Sanity document. That check — collect every href the nav and sections emit, assert a matching
page or post exists — is what would have caught Chapman on day one.

---

## Phase J — What staging verification found (and why each was invisible)

Everything in this phase was found *after* a dry run that reproduced its expected figures exactly.
That is the lesson: a correct dry run proves the mapping, not the result. Each item below produced a
**plausible wrong answer instead of an error**, which is the failure mode to design against.

**The layout crash — `ReferenceError: brandLogoPath is not defined`.** Every route 500s, so the
symptom is indistinguishable from a failed import. Fix: use `absoluteLogoUrl`, already computed at the
top of `MainLayout.astro`. Check for it during fork cleanup, not during verification.

**The root document gets no slug at all.** `/` reduces to the empty string, and any `prune()` helper
that strips empty values drops it — so the homepage document ships with the `slug` object present but
`current` absent, while every other page is fine. The catch-all resolves a bare root request to the
slug `home`, so nothing matches. Fix: an explicit override mapping `/` → `home`. Verify by asserting
the homepage document's `slug.current` is a non-empty string, not by loading the page.

**An approved RENAME lands in the redirect map but never in the content.** The decision was recorded
in `url-inventory.csv`, the 301 was live in `vercel.json`, and the importer — correctly told to
preserve original URLs — kept the WordPress slug. Result: the old URL 301s to a path with no document
behind it, so a signed-off rename becomes a 404. Fix: a slug-override map the importer applies, and
**report the overrides in the run output** so they are visible rather than assumed. Rule: every
`RENAME` row in the inventory needs a corresponding override, and the counts should match.

**Document id is identity; slug is address.** Do not make the id follow a slug override. If it does,
every rename orphans the previous document and breaks any reference to the old id. Deriving the id
from the WordPress `post_name` and letting the slug change independently keeps `createOrReplace`
updating in place and the run idempotent. State this in a comment — otherwise it looks like a bug and
someone "fixes" it. Corollary: **after a rename, there is nothing to delete.** An instruction to clean
up "the old document" will delete the correction instead.

**GROQ's `path()` does not glob inside a segment.** `*[_id in path("drafts.page-*")]` returns **zero**
for ids like `drafts.page-about-us`, because the wildcard matches whole `.`-delimited segments. It
does not error — it quietly reports nothing to do. `_id match "drafts.page-*"` happens to work but is
tokenised text matching, so it answers a slightly different question. Safest: select `path("drafts.**")`
and apply the ownership rule in JavaScript with `startsWith`, identical to the importer's own rule.

**The blog index does not exist in WordPress.** Its post archive is theme-generated, so there is
nothing in the WXR to import. If you retire category archives to `/blog/`, that decision silently
requires a `/blog/` page — otherwise every one of those redirects lands on a 404. Generate it during
import rather than treating it as a content task.

**A shared placeholder needs to be a real asset.** A dangling image `_ref` is accepted by the mutation
API and then renders broken in Studio. Upload one file once, fail loudly if it is missing, and never
create one placeholder per section.

**Empty in WordPress imports as empty.** Pages with `word_count=0` in the baseline arrive with no
sections. That is fidelity, not a bug — but it needs a content decision (write it or retire it with a
redirect), so surface it from the inventory rather than discovering it in a browser.

**You cannot compile-verify across a file bridge.** `node_modules` installed for one architecture
won't run `astro check` from another. Build on the machine that owns the repo, and treat "I couldn't
compile this" as a thing to say out loud rather than an assumption to leave implicit.

### The rule this phase exists to enforce

**Before any destructive step, query the current state and confirm it matches the model that justified
the step.** Both of the worst near-misses here — deleting a "stale" document that was actually the fix,
and publishing nothing because a query silently matched nothing — would have been prevented by one
read-only check. And **write the expected number down before running the command**, because "expected
458, got 0" is only a signal if someone predicted 458.

## Phases K–L — Cutover and after

Unchanged from v1.0 and still accurate: the apex `CNAME`-versus-`A`-record trap is real, re-run the
QA Domain & SEO section after any deploy touching config, sitemap, robots or canonicals, and submit
the new sitemap in Search Console.

Two additions. **Don't deploy the redirect map to production before the content exists** — category
redirects target `/blog/`, which 404s until the blog index has content. And after cutover, **verify
Google's chosen canonical** on any URL where you changed which version is canonical.

---

## Ownership

Unchanged: FFS provisions and completes the repo, Mark sets up Sanity and Vercel and owns approvals
and the DNS switch, the assigned dev builds from the completed repo. What v2.0 adds is that **the
person running the import owns the verification gates** — the numbers in Phases D, F, G, H and I are
the handoff artifact, not a green build.

## What changed

**v2.2** adds Phase H2 (merge-aware seeding) and failure mode #7, from Chapman's 2026-08-11
seed-package work: pre-seed diffing against existing drafts with per-document action classes and
protected fields, route-collision (not just id-collision) detection, full-dataset backup before any
write, computed (never hard-coded) blocking flags built in one deterministic pipeline command,
reproducible evidence hashes recorded with their extraction rule, page-level (not block-id) evidence
for reusable blocks, and SEO length caps as warnings during migration so source values land verbatim.
Also from Chapman: source exports belong inside the repo (Phase A already says commit the WXR
gzipped — Chapman instead had four exports hardcoded at `~/Downloads` paths across ten scripts;
repoint through one env var with an in-repo default), and the `{{ }}` brace trap in Phase A struck a
fourth time, this time on seven `.env.local` values at once, reading as total Sanity auth failure.

**v2.1** adds Phase J — the ten problems staging verification surfaced after a clean dry run, each with its fix and why it was invisible — plus the layout-crash entry in the top-six and in Phase C.

**v2.0**

Phase E (slugs and post URLs) and Phase I (verification gates) are new. Phase A now asks for three
exports and warns that the Media export omits PDFs. Phase D gains the schema-drift warning, the
detection order, and the three counting rules. Phase F gains source validation, chain flattening and
the duplicate-slug rule. Phase G is rewritten around the manifest and resized variants. Phase H gains
the safety rails and the drafts-perspective trap.
