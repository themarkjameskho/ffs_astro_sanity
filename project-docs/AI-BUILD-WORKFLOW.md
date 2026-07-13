# FFS Astro+Sanity — One-Week AI Build Workflow

> The simplified, **AI-driven** path from a client brief to a dev-ready repo. This is not ordinary
> development — the build is done mostly by AI agents, so the human work is intake, planning,
> provisioning, and review. Detailed reference: `project-docs/Astro-Sanity Process/` +
> `project-docs/LIFECYCLE-CHECKLIST.md` + `TEMPLATE_README.md` + `template-setup.sh`. Intake brief example (Cory's format): the PestBeGone
> `*-Website.txt` / `*-GEOTarget.txt` files → stored per client as `INTAKE-BRIEF.md`.

## Naming rule
Name every task by **what it is**, never "Phase 2 / Phase 3." A task name should tell the dev
exactly what gets done (e.g. "Build homepage + service pages," not "Build Phase 1").

## Mandatory stage gate
AI agents and developers must use `project-docs/LIFECYCLE-CHECKLIST.md` for every project:
- New build: lifecycle checklist + `project-docs/Astro-Sanity Process/astro-sanity-development-process.md`.
- WordPress migration: lifecycle checklist + `project-docs/Astro-Sanity Process/wordpress-to-astro-migration.md`.
- A stage is not complete until the matching checklist section is complete or open items are documented with an owner.

## The 6 steps (≈1 week)

**1. Classify + intake.** Receive the client brief. Classify **New build** vs **Rebuild/WP
migration** (sets Path A vs Path B in TEMPLATE_README). Briefs are usually incomplete — log what's
missing as a requirements checklist; don't block planning on it. Use `project-docs/LIFECYCLE-CHECKLIST.md`
as the stage gate.

**2. Run the siteplanner → content plan.** Apply Master Spec v2.0 to produce the per-page content
plan + SEO meta + the page→component map. Deliverables per client: `CONTENT-PLAN.md`,
`COMPONENT-MAP.md`, (+ `GREENIX-REFERENCE.md`-style reference analysis if a benchmark site is named).
Use `project-docs/active/content-ops/WRITER_PROMPTS_AND_WORKFLOW.md` for AI-generated page copy.

**3. Collect brand kit + launch assets.** Gather the `template-setup.sh` placeholder values: brand
name/slug, domain, Sanity project ID, NAP + geo, phone formats, GA4/CallRail, logo + colors, offer +
guarantee terms. This is the "incomplete requirements" from step 1, completed.

**4. Provision the client repo from the template.** Duplicate `ffs_astro_sanity` → rename to the
client (everything needed is already in the repo). Then:
```bash
git clone https://github.com/themarkjameskho/ffs_astro_sanity.git <client-slug>-site
cd <client-slug>-site && rm -rf .git && git init && git add -A \
  && git commit -m "feat: scaffold from ffs_astro_sanity template"
chmod +x template-setup.sh && ./template-setup.sh   # fills {{PLACEHOLDERS}} with the brand kit
```
Copy the client's `CONTENT-PLAN.md` / `COMPONENT-MAP.md` / `AGENT-BRIEF.md` into the new repo's
`project-docs/clients/<client>/`, **align all docs** (CLAUDE.md brand refs, README, vercel.json
redirects, tokens.css) so nothing still says "template," then run `npm run template:audit` and
**push to GitHub**. The repo must be
**complete and dev-ready** at this point (run the completeness checklist). **In parallel, Mark sets
up Sanity + Vercel for the client**; the Sanity project ID + Vercel env values get filled into the repo.

**5. Hand the repo to the dev team.** Give the AI dev team (Maccoy) the new repo + the client docs.
The `AGENT-BRIEF.md` is the engine-agnostic instruction set (Claude or Codex). They build all pages
from the content plan using the existing section components — no scaffolding from scratch.

**6. QA + launch.** Run `PRE-LAUNCH-QA.md` (full + Domain & SEO). Mark signs off on staging, then
promote to production. Re-run the QA Domain & SEO section after any deploy touching config/sitemap/
robots/redirects/canonicals. Use the launch section of `project-docs/LIFECYCLE-CHECKLIST.md` during
the DNS switch and live smoke test.

## Who does what (ownership split)
- **FFS team (us / Mark) — set up the repo:** intake/classify, run the siteplanner, **provision and
  complete the client repo from the template, align all docs, and write clear instructions for the
  assigned dev.** This is the work that happens in this thread. The repo must be *complete and
  dev-ready* before handoff (see the completeness checklist in `tasks/03-provision-repo.md`).
- **Mark — client infrastructure:** after the repo is set up, **Mark sets up Sanity (project +
  dataset + studio) and Vercel (project + env vars + domain) for the client.** Sanity project ID +
  Vercel env feed back into the repo. This is a Mark step, not the dev's.
- **Assigned dev / Maccoy — build:** builds all pages from the completed repo + dev instructions
  (`AGENT-BRIEF.md`) using existing section components. Does NOT provision Sanity/Vercel.
- **Mark — approvals:** step 2 plan sign-off and step 6 launch.
- **Monday:** Mark logs tasks to `TASKS.md`; the dispatcher cards them. Claude never writes Monday.

> Dependency: the dev build (steps 4–5) needs Sanity live; launch (step 6) needs Vercel live — so
> Mark's Sanity/Vercel setup runs in parallel with repo completion and must land before build/deploy.
