# Retrospective — Bed Bug BBQ WordPress → Sanity migration

**August 2026. 459 documents (125 pages, 334 posts), 842 sections, 1,501 media files, 296 redirects
protecting 199,070 recorded 404 hits.** Zero content written to production by mistake, zero
destructive actions taken on a wrong assumption, and every figure in the final import reproducible
from a single command.

Chapman ran the same playbook and stalled for days on a 404 nobody could explain. The difference was
not effort or skill — it was **method**. This document records the method, then the concrete template
work that would let the next client get the same result without a senior person watching it.

Companion docs: `wordpress-to-astro-migration.md` v2.1 is the procedure. This is the *why it worked*
and *what to build next*.

---

## Part 1 — What made it smooth

### Measure first, build second

Before any code ran, the WordPress export was audited into four artifacts: a URL inventory, the
existing redirects with hit counts, the SEO meta per URL, and a reconciled media manifest. That took
one sitting and produced numbers — 125 published pages, 337 posts, 1,509 attachments, 283 redirects,
463 URLs carrying SEO meta.

Those numbers did the real work. Every later step had a target to hit, so "is this right?" became a
comparison rather than a judgement. It also surfaced facts nobody would have found by browsing: the
live sitemap was advertising only 146 of 337 posts, and the SEOPress Schemas export was completely
empty.

Chapman skipped this and had no baseline to check against, so the 404s had nothing to be measured
*from*.

### A dry run that works with no network and writes nothing

This was the single highest-leverage decision. `--dry-run` classifies and builds all 459 documents in
memory, prints the full report, and touches nothing. It needs no Sanity access at all.

That made iteration free. The importer was run more than a dozen times against real data while it was
still wrong, at zero risk — which is what allowed the mapping to be *tuned* rather than guessed. The
Chapman equivalent was editing a document in Studio and reloading a page.

### Write the expected number down before running the command

This is the part that actually caught the bugs, and it is nearly free.

The block audit predicted 1,119 sections. The first real run reported **5,213**, with one component at
86% — that mismatch is what exposed WordPress omitting the `core/` namespace from block comments,
which had turned every paragraph into its own section. Later, a publish step predicted 458 drafts and
reported **0**, which exposed GROQ's `path()` not globbing inside a segment.

Neither bug threw an error. Both produced a *plausible* wrong answer. **A number predicted in advance
is the only thing that turns a plausible wrong answer into a signal.**

### Rails that make mistakes cheap instead of catastrophic

The importer only ever writes drafts, only writes ids it owns, refuses to modify anything it did not
create without `--force`, and is idempotent on slug. The publish helper refuses to run against
production at all.

Those rails were the reason a wrong instruction — mine, telling someone to delete a "stale" document
that was actually the fix — cost a conversation instead of a rebuild.

### Record the decision *and* apply it in code

We recorded the `/contact-bedbugbbq/` → `/contact/` rename in the URL inventory, signed it off in the
runbook, and shipped the 301 in `vercel.json`. Every artefact agreed. The importer still produced the
old slug, because a decision written in three documents was applied in none of them.

**A decision isn't done until something executable enforces it.** The fix — an override map whose
applications are *printed in the run output* — is small; the discipline of noticing is the point.

### Verify by measurement, not by browsing

The verification gate is a status-code sweep over URL *shapes* most likely to break (root,
single-segment, two-level nested, three-level nested, a root-level post, and `/blog/<slug>` which must
301), plus a grep of rendered HTML for `wp-content/uploads` that must return zero.

Chapman's 404s were found by a developer clicking around. That is not a gate — it is luck with a
deadline.

### A second reviewer who verifies state before acting

Three of the bugs in the final stretch were mine, and all three were caught the same way: the person
executing queried the actual documents before running the step, found reality didn't match the
instruction, and **stopped instead of guessing**. Once by refusing a delete that would have destroyed
the fix.

Worth stating as a standing rule: **before any destructive step, query the current state and confirm
it matches the model that justified the step.** It is a read-only check that costs seconds.

### What we would do differently

Fix the template's known bugs *first*. The `MainLayout` crash and the inherited Tulsa links were both
already recorded as known issues, and both were hit anyway — the crash after the import, when it
briefly looked like the import had failed. **A known bug that isn't fixed is a bug you will pay for
twice**: once discovering it, once re-discovering it.

Also, compile earlier. The routing changes were written where `astro check` couldn't run, and that gap
should have been closed at the time rather than flagged and deferred.

---

## Part 2 — Template improvements, in priority order

Everything below is generic. None of it is Bed Bug BBQ-specific, and each item is something that cost
real time on this migration or on Chapman.

### P0 — Bugs shipping to every new client

**Fix `MainLayout.astro`'s `brandLogoPath`.** An undefined variable used twice in the social meta
tags; `absoluteLogoUrl` is the intended value. Every route throws `ReferenceError`. *Cost when hit: a
full afternoon of "the import is broken".*

**Add `pathSlugify` to every nestable slug field.** Sanity's default slugify collapses `/` to `-`, so
nested slugs can never match a full-path lookup. **This is the Chapman blocker.** *Cost when hit:
days, plus a developer convinced the platform can't preserve URLs.*

**Repair the shipped Kadence mapper, or delete it.** It emits field names from an older schema —
`heroSection.primaryCta{label,href}` where the schema has `primaryCtaLabel`,
`twoColTextImageSection.image` where it has `images[]`, `ctaSection.primaryCta` where it has
`primaryButton{label,link,style}`, `faqSection.items` where it has `faqs`. Documents built with it
lose content silently. Shipping a broken mapper is worse than shipping none, because it looks usable.

**Make `studioHost` a placeholder, not a real hostname.** It currently ships as a previous client's
live Studio host, so an unwary `sanity deploy` targets *their* infrastructure. Make it
`{{STUDIO_HOST}}` and fail loudly if unreplaced.

**Load `.env.local` in `sanity.cli.js`.** It only reads `../.env`, so a repo using `.env.local` throws
"Missing SANITY project configuration" on deploy.

**Move all hardcoded location and service links into a data module.** `navigation.ts` and
`ServiceAreaSection.astro` ship the fork source's hrefs, which render as real links to pages that
don't exist. One `src/data/serviceArea.ts` that nav and sections both read from.

**Replace `example.com` fallbacks** in `links.ts`, `canonical.ts`, `siteProfile.ts`, `astro.config.mjs`
and `revalidate.ts` with a build-time failure. A silent `example.com` canonical is worse than a crash.

### P1 — Make migrations repeatable rather than heroic

**Promote the WXR importer into the template.** `lib/wxr-source.mjs` (reads `.xml` or `.xml.gz`),
`lib/parse-blocks-raw.mjs` (keeps each block's raw source, normalises the `core/` namespace),
`lib/<brand>-classify.mjs` and `lib/<brand>-sections.mjs`, plus `import-from-wxr.mjs` with its
`--dry-run`, ownership rails and idempotency. Only the classifier's brand-specific thresholds should
need touching per client. **This is the biggest single win available** — it is the difference between
"run the importer and tune it" and "write an importer".

**`npm run check:links`.** Collect every internal href the nav and sections emit, assert a matching
Sanity page or post exists, fail on any that doesn't. **This one check would have caught Chapman on day
one.** `template:audit` currently covers placeholders, routes and domain leaks — not this.

**`npm run check:slugs`.** Assert every page slug equals its full path and flag single-segment slugs
whose page-type implies nesting. Catches the slugify problem before a human clicks anything.

**Add the blog-URL architecture to the template.** `postHref` as the single source of truth, a
`postBySlug` query, the catch-all falling back to `blogPost`, the article markup extracted into a
component used by both routes, and `/blog/[slug]` as a 301. Every migration from a WordPress site with
root-level posts needs this, and it is not obvious enough to rediscover under time pressure.

**Make the client `perspective` env-driven.** It is hardcoded to `published`, so drafts can never be
previewed — and a freshly imported dataset 404s on every URL, which reads as a failed import. Default
to `published`, allow `drafts` for a preview deploy.

**Ship `check-sanity-token.mjs` and `publish-drafts.mjs`.** Small, generic, and both saved real time
here. The token check catches the values-pasted-inside-`{{ }}` problem that has now bitten three times.

### P2 — Polish

Ship a **generic placeholder image** at a known path, since prose bands need one and
`twoColTextImageSection.images` is required. Use **deterministic `_key` generation** in any importer,
or every re-run rewrites every section and diffs become useless. Extend **`template:audit`** to include
`check:links` and `check:slugs` so the gates run by default rather than on request. And commit a
**migration report** per client — the dry-run output, so the next person can tell whether a number
changed because they broke something or because the content did.

### If only three things get done

The `MainLayout` crash, `pathSlugify`, and `check:links`. Between them they cover the failure that
blocked Chapman, the failure that blocks every page render, and the gate that would have caught the
first one automatically.
