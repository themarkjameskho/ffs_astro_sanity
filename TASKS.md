Tag: [PestBeGone]

<!-- ============================================================
DISPATCHER INSTRUCTIONS — READ FIRST
- MATCH-IN-PLACE ONLY. Every item below already has a "Monday card <id>".
  Match by [id:...] and the Monday card id, and UPDATE that existing card.
- DO NOT replace, delete, close-and-recreate, or reconcile-by-deletion any
  [PestBeGone] or [HBBN Landing Page] items. Never create a new card for an
  item that already carries a Monday card id — that is what was producing
  duplicate cards on every run.
- All items are now in the ## Done section (- [x]). For each, set the Monday
  card to the review/done state; do not re-open or re-create them.
============================================================ -->

## ⚠️ REQUIRED FIELDS — Every Monday item MUST include ALL of the following before posting

If ANY field is missing → **DO NOT create the Monday card.** Add to "Needs your call" and flag what is missing.

| Field | Notes |
|---|---|
| Item name / title | Action-first, clear |
| Assigned person | Who does the work |
| Order Level | 1st ⚠️ / 2nd / 3rd |
| Project Status | Active / Critical ⚠️ / On Deck / ON-HOLD |
| Timeline / deadline | Start date – end date — **REQUIRED, no exceptions** |
| Task description / instructions | What to do + acceptance criteria — posted as an Update or subitems |

---

## Open

- [ ] [Bed Bug BBQ] WP migration to Astro (Mark) — Migrate the Bed Bug BBQ WordPress site to Astro+Sanity: provision new repo from ffs_astro_sanity template, run siteplanner/content plan, port content, QA + launch per wordpress-to-astro-migration.md. | Owner: Mark | Deadline: 2026-08-14 | Order Level: 1st | Project Status: Active [id:bbbq-wp-migration]


---

## Done

- [x] [PestBeGone] Start here — set up the build (Maccoy) — New client website for PestBeGone (Astro + Sanity). FIRST STEP: download the repo at https://github.com/themarkjameskho/pestbegone- , open Codex, point it at the repo, and let it run — all the content and build instructions are inside (start with project-docs/clients/pestbegone/AGENT-BRIEF.md). Before building any pages, lock the design foundation in the subitems below. Prerequisite: Mark sets up Sanity + Vercel for the client (project ID + env go into the repo). | Owner: Maccoy | Deadline: 2026-06-18 | Order Level: 1st | Project Status: Active [id:pbg-start] Monday card 12399805267
  - [x] Set the color palette — Pull the brand colors from the PestBeGone logo and apply them in the site design tokens (src/styles/tokens.css). Do not finalize other colors until these are set.
  - [x] Set the typography — Choose heading + body fonts that fit the brand and apply them in the design tokens.
  - [x] Gather reference websites — Pick 3–5 sites to model the design on; start with https://www.greenixpc.com/ . Note what to borrow from each (layout, sections, style). Reference analysis: project-docs/clients/pestbegone/GREENIX-REFERENCE.md.

- [x] [PestBeGone] Build the main pages (Maccoy) — Build the pages that appear in the main navigation, using the copy + components already in the repo (content: CONTENT-PLAN.md · sections: COMPONENT-MAP.md). Rules: no prices anywhere; show the $150 new-customer offer; keep NAP identical everywhere. | Owner: Maccoy | Deadline: 2026-06-20 | Order Level: 1st | Project Status: Active [id:pbg-main-pages] Monday card 12303235546
  - [x] Homepage — The main landing page: hero with $150 offer, services overview, how-it-works, why-us, service area, reviews, FAQ, contact CTA. Copy: CONTENT-PLAN.md §3.
  - [x] Contact page — Quote form (above the fold) + business info: name, address, phone, hours, map. Copy: CONTENT-PLAN.md §7.
  - [x] Blog — Blog index + the launch posts; each post links to a service or contact page. Plan: CONTENT-PLAN.md §8.

- [x] [PestBeGone] Build the service pages (Maccoy) — Build the 11 pest service pages (the sub-pages under Services). One page per pest category; copy from CONTENT-PLAN.md §4; sections per COMPONENT-MAP.md. No prices; show the $150 offer. | Owner: Maccoy | Deadline: 2026-06-22 | Order Level: 1st | Project Status: Active [id:pbg-service-pages] Monday card 12303300097
  - [x] Ant Control
  - [x] Stinging Insect Control (wasps, hornets, yellow jackets)
  - [x] Spider Control
  - [x] Cockroach Control
  - [x] Bed Bug Treatment
  - [x] Termite Control
  - [x] Mosquito, Tick & Flea Control
  - [x] Rodent Control (mice & rats)
  - [x] Mole & Vole Control
  - [x] Occasional Invader Control (stink bugs, boxelders, earwigs, silverfish)
  - [x] Fly, Beetle & Pantry Pest Control

- [x] [PestBeGone] Build the location pages (Maccoy) — Build the Kenosha hub + the nearby-city pages. Each nearby-city page needs its OWN unique intro (no copy-paste / no city-name swaps). Nearby-city pages have no address/map. Copy + unique intros: CONTENT-PLAN.md §5. | Owner: Maccoy | Deadline: 2026-06-24 | Order Level: 1st | Project Status: Active [id:pbg-location-pages] Monday card 12303309876
  - [x] Kenosha hub (main service-area page — has NAP + map; links to all services + nearby cities)
  - [x] Somers
  - [x] Pleasant Prairie
  - [x] Sturtevant
  - [x] Racine
  - [x] Mount Pleasant
  - [x] Bristol
  - [x] Franksville
  - [x] Union Grove
  - [x] Wind Point
  - [x] Paddock Lake
  - [x] Salem Lakes

- [x] [PestBeGone] QA & launch (Mark) — Final review and go live on pestbegonepc.com. This is Mark's task. QA checklist: PRE-LAUNCH-QA.md. | Owner: Mark | Deadline: 2026-06-25 | Order Level: 1st | Project Status: Active [id:pbg-qa-launch] Monday card 12303300103
  - [x] Run the pre-launch QA (content correct, no prices, $150 present, NAP identical, links work, mobile/performance).
  - [x] Review the staging site and approve.
  - [x] Go live on pestbegonepc.com and point the Google Business Profile to the homepage.

- [x] [HBBN Landing Page] Approve site plan & content (Mark) — Sign off the landing-page plan + all page copy before build. Review CONTENT-PLAN.md (Home, Heat Treatment, Treatments, Reviews, Contact + SEO meta + schema), SITE-STRUCTURE.md, LIVE-SITE-REFERENCE.md. Confirm open items: GBP-matching phone ((414) 348-5414 vs (414) 519-9647), business hours, warranty terms. Rules: no prices, call-first, no fabricated reviews. INSTRUCTIONS: project-docs/clients/heat-bed-bugs-be-gone-now/tasks/01-approve-site-plan.md | Owner: Mark | Deadline: 2026-06-23 | Order Level: 1st | Project Status: Active [id:hbbn-approve] Monday card 12399770569
  - [x] Read CONTENT-PLAN.md — all 5 pages' copy + SEO meta.
  - [x] Confirm phone, hours, warranty terms (INTAKE-BRIEF open items).
  - [x] Approve or list changes → unblocks setup + build.

- [x] [HBBN Landing Page] Set up Sanity client + Vercel + brand kit (Mark) — Stand up the client in the SHARED Sanity project 45mefpsu (client slug heat-bed-bugs-be-gone-now; the seed adds it), create the Vercel project + env + domain heatbedbugsbegonenow.com, supply the brand kit, and push the GitHub repo. INSTRUCTIONS: project-docs/clients/heat-bed-bugs-be-gone-now/tasks/02-collect-brand-launch-assets.md | Owner: Mark | Deadline: 2026-06-24 | Order Level: 1st | Project Status: Active [id:hbbn-setup] Monday card 12399824661
  - [x] Sanity: confirm/seed the client in project 45mefpsu (give the go-ahead to run scripts/seed.mjs — writes to shared production; ids are *.heat.*).
  - [x] Vercel: project + env (CURRENT_CLIENT_SLUG, SANITY_*, AUTOMATION_WEBHOOK_URL, Turnstile) + domain.
  - [x] Brand kit: confirmed phone, hours, NAP lat/long, warranty terms, logo, color palette (hex), GA4/CallRail.
  - [x] Push the repo to GitHub (git init + push from terminal — see tasks/03-provision-repo.md).

- [x] [HBBN Landing Page] Build the 5 landing-page pages (Maccoy) — Build Home, Heat Treatment, Treatments, Reviews, and Contact on the existing Astro+Sanity stack — don't scaffold from scratch. Copy from CONTENT-PLAN.md; sections per COMPONENT-MAP.md; start at AGENT-BRIEF.md. Rules: no prices, call-first CTAs, lead form OFF until pipeline live, NO fabricated reviews (wire real GBP reviews). INSTRUCTIONS: project-docs/clients/heat-bed-bugs-be-gone-now/tasks/04-build-pages.md | Owner: Maccoy | Deadline: 2026-06-26 | Order Level: 2nd | Project Status: Active [id:hbbn-build] Monday card 12399848823
  - [x] Home — hero, trust, why-us, process, why-heat, discreet, treatment options, reviews, service area, FAQ, CTA (CONTENT-PLAN §3).
  - [x] Heat Treatment — why heat, highlights, deep dive, prep, process (§4).
  - [x] Treatments — the 3 options + FAQ (§5).
  - [x] Reviews — real GBP reviews only; hold aggregateRating until wired (§6, GAP-2).
  - [x] Contact — NAP + map + click-to-call; form off until pipeline live (§7, GAP-1).
  - [x] Add per-page schema; deploy to staging; request Mark's review.

- [x] [HBBN Landing Page] QA & launch (Mark) — Final review and go live on heatbedbugsbegonenow.com. QA checklist: ffs_astro_sanity/PRE-LAUNCH-QA.md (full + Domain & SEO). INSTRUCTIONS: project-docs/clients/heat-bed-bugs-be-gone-now/tasks/05-qa-launch.md | Owner: Mark | Deadline: 2026-06-29 | Order Level: 3rd | Project Status: Active [id:hbbn-qa-launch] Monday card 12334567355
  - [x] Run PRE-LAUNCH-QA; performance Mobile ≥85 / Desktop ≥95 / A11y 100.
  - [x] Confirm no prices, call-first works, NAP identical, trailing slashes, schema valid, reviews real-or-held.
  - [x] Review staging and approve.
  - [x] Promote to production (confirm prod branch + gating); re-run QA Domain & SEO; point GBP to the homepage.
