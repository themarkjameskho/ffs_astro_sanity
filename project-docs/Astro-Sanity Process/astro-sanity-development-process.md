# Astro + Sanity Development Process

## Outline
1. Discovery & Planning
2. Environment & Tooling Setup
3. Project Initialization
4. Design System & UI Foundation
5. Sanity Content Architecture
6. Astro Feature Development
7. Integration & Data Wiring
8. Performance, Accessibility & SEO
9. Quality Assurance & Hardening
10. Deployment & Release
11. Post-Launch Operations

## Companion playbooks (read these alongside, not after)

- **`wordpress-to-astro-migration.md`** — if you're migrating an existing WordPress site rather than building from scratch. Its phases (A through H) overlay onto Phases 1, 6, 7, and 10 below: Phase A/B (intake + URL inventory) maps to Phase 1; Phase C (fork cleanup) and D (content migration) map to Phase 6; Phase E (redirect map) and F (parity audit) map to Phase 7 and 9; Phases G/H (DNS cutover + verification) map to Phase 10.
- **`dev-to-live-workflow.md`** — once the site is shipping changes day-to-day. Describes the local-edit → push → Vercel-deploy → verify loop, the ISR cache behavior, and the env-var rules.
- **`deployment.md`** — project-specific runbook. The real env vars, real domains, real deployment log live here.

---

## How to Use This Playbook
- Follow the phases in order; do not advance until each phase’s **Exit Criteria** are met.
- Each phase includes: people involved, required inputs, a beginner-friendly checklist, senior developer notes, automation hooks, and deliverables.
- Every command assumes you are at the project root. Substitute `npm` with `pnpm` or `yarn` if preferred.
- Keep the documentation in this folder updated as you work. Each artefact referenced is the source of truth for its topic.
- AI agents can process the **Step-by-Step Checklist** entries sequentially; humans should skim the goals and notes first to understand context.

## Roles & Audience
- **Project Owner:** Non-technical stakeholder providing goals, budget, approvals.
- **Lead/Senior Developer:** Owns technical decisions, mentors team, keeps automation working.
- **Content Strategist / Editor:** Defines content requirements and authoring workflow.
- **Designer:** Supplies the visual system used to build Astro components.
- **QA Lead:** Validates functionality against acceptance criteria.
- **AI Agent / Automation:** Executes scripted steps; must follow checklists verbatim.

## Prerequisites
- Workstation with Node.js 18+ (`.nvmrc` will be added), Git, and the Sanity CLI (`npm install -g @sanity/cli`).
- Access to Git hosting (GitHub assumed), deployment platform (Vercel assumed), and Sanity project credentials.
- Ability to run shell commands and edit Markdown/TypeScript files.
- Optional: Accounts for monitoring (e.g., Sentry), analytics (e.g., Google Analytics), and visual testing (e.g., Chromatic).

## Glossary
- **Astro:** Static-first web framework for building fast sites. <https://docs.astro.build/>
- **Sanity Studio:** Headless CMS editing interface; you configure schemas for editors to manage content.
- **Dataset:** Named bucket of Sanity content (e.g., `production`, `staging`).
- **GROQ:** Sanity’s query language used to fetch structured data.
- **Hydration:** Process of activating interactive components on the client. Astro keeps most content static.
- **Preview Mode:** Secure feature allowing editors to see unpublished Sanity drafts in the Astro site.
- **CTA:** Call to Action—buttons or links encouraging a user to act.
- **CI/CD:** Continuous Integration/Deployment pipeline that runs tests and pushes code automatically.
- **UAT:** User Acceptance Testing—final review by stakeholders before launch.

---

## Phase 1 – Discovery & Planning

> 🔀 **Migrating from WordPress?** Run `wordpress-to-astro-migration.md` Phases A (intake) and B (URL inventory) in parallel with this phase. The URL inventory from Phase B drives the content-model scope and the redirect map, so do it now while requirements are still being gathered, not after.

**Goals**
- Capture project scope, success criteria, and delivery milestones.
- Confirm user personas, core user journeys, and required content types.
- Choose the deployment, hosting, and monitoring stack.

**People & Roles**
- Project Owner, Senior Developer, Designer, Content Strategist.

**Inputs**
- `project-docs/Astro-Sanity Process/requirements.md`.
- Brand guidelines, analytics reports, prior site lessons learned.
- Stakeholder interview notes.

**Step-by-Step Checklist**
1. Schedule a discovery workshop; record decisions live in `project-docs/Astro-Sanity Process/requirements.md`.
2. Capture personas and accessibility requirements under sections 2 and 3 of `project-docs/Astro-Sanity Process/requirements.md`.
3. Define success metrics/KPIs and add them to section 6.
4. Agree on hosting, monitoring, and deployment targets; document in section 5 and `project-docs/Astro-Sanity Process/architecture/overview.md`.
5. Draft high-level backlog items in `project-docs/Astro-Sanity Process/backlog.md` (populate IDs, titles, target release).
6. Summarize technology decisions in `project-docs/Astro-Sanity Process/architecture/overview.md`, including environment matrix.

**Senior Dev Tasks**
- Facilitate a requirements workshop; log decisions in `project-docs/Astro-Sanity Process/requirements.md`.
- Produce an architecture one-pager covering Astro, Sanity datasets, hosting, and integrations.
- Define metrics and error budgets that will guide performance work.

**Deliverables**
- Approved requirements checklist.
- Architecture diagram (even ascii) committed under `project-docs/Astro-Sanity Process/architecture/`.
- Backlog draft tracked in issue tracker or `project-docs/Astro-Sanity Process/backlog.md`.

**Automation Hooks**
- Set up GitHub labels and project board columns for each phase.

**Exit Criteria**
- `project-docs/Astro-Sanity Process/requirements.md` sections 1–7 are filled with project-specific details.
- `project-docs/Astro-Sanity Process/architecture/overview.md` contains hosting/integration decisions and environment matrix.
- `project-docs/Astro-Sanity Process/backlog.md` lists at least the MVP release and three prioritized backlog items.
- Stakeholders confirm scope, personas, and KPIs in writing.

---

## Phase 2 – Environment & Tooling Setup
**Goals**
- Prepare reproducible local environments for Astro and Sanity Studio.
- Ensure shared linting, formatting, and testing tools are available CI/CD.

**People & Roles**
- Senior Developer (lead), DevOps/Platform Engineer (optional), AI agent (for scripted setup).

**Inputs**
- Decisions from Phase 1 (`project-docs/Astro-Sanity Process/requirements.md`, `project-docs/Astro-Sanity Process/architecture/overview.md`).
- Access to source control and CI provider (GitHub assumed).
- Preferred package manager (default: npm).

**Step-by-Step Checklist**
1. Verify tooling availability:
   - `node -v` (expect 18.x); if missing run `nvm install 18 && nvm use 18`.
   - `npm install -g @sanity/cli`.
2. Create `.nvmrc` at repo root: `echo "18.20.4" > .nvmrc`.
3. Update `README.md` with prerequisites (Node, Git, Sanity CLI) and OS-specific notes.
4. Install base dev dependencies:
   ```bash
   npm install -D eslint prettier eslint-plugin-astro eslint-config-prettier typescript
   ```
5. Add `.eslintrc.cjs` and `.prettierrc` with Astro support; include sample config in README.
6. Update `package.json` scripts:
   - `"dev"`, `"build"`, `"lint"`, `"format"`, `"typecheck"`, `"studio"`.
7. Create `.github/workflows/ci.yml` running:
   ```yaml
   - uses: actions/setup-node@v4
   - run: npm ci
   - run: npm run lint
   - run: npm run typecheck
   ```
8. Document verification commands in README (“Run `npm run lint && npm run typecheck`”).
9. Execute `npm run lint` and `npm run typecheck` locally to ensure setup works.

**Senior Dev Tasks**
- Document prerequisites (`node`, `pnpm`/`npm`, `sanity` CLI) in `README.md`.
- Create `.nvmrc` or similar to pin Node version.
- Configure linting (`eslint`, `stylelint`), formatting (`prettier`), and testing harness.
- Bootstrap CI workflows (GitHub Actions or equivalent) to run lint, test, and type checks.

**Deliverables**
- Updated `README.md` quick-start section.
- `package.json` scripts for `dev`, `build`, `lint`, `test`, `studio`.
- Continuous integration pipeline passing.

**Automation Hooks**
- Add setup verification script (`scripts/verify-env.ts`) invoked pre-commit.

**Exit Criteria**
- Toolchain commands succeed on fresh machine following README.
- `.nvmrc` committed and recognized by team.
- CI pipeline configured and green on default branch.
- Any automation scripts (`verify-env`) exist and run without failures.

---

## Phase 3 – Project Initialization
**Goals**
- Scaffold Astro frontend and Sanity studio with baseline configuration.
- Establish shared config (TypeScript path aliases, Tailwind, env vars).

**People & Roles**
- Senior Developer, Frontend Developer, AI agent (for scripted scaffolding).

**Inputs**
- Repository with tooling baseline from Phase 2.
- Sanity account with project access.
- Branding decisions for theme setup.

**Step-by-Step Checklist**
1. Scaffold Astro (if new project):
   ```bash
   npm create astro@latest
   ```
   - Choose TypeScript, strict mode, no sample content unless required.
2. Initialize Git repo if needed: `git init && git add . && git commit -m "chore: scaffold astro app"`.
3. Install dependencies: `npm install`.
4. Add Tailwind (if design system requires):
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
5. Initialize Sanity Studio in `/studio`:
   ```bash
   sanity init --dataset production --project <PROJECT_ID>
   ```
   - Choose clean schema; confirm local dev port.
6. Add `.env.example` with:
   ```
   SANITY_PROJECT_ID=
   SANITY_DATASET=production
   SANITY_API_TOKEN=
   ```
7. Update `astro.config.mjs` with needed integrations (Tailwind, sitemap placeholder).
8. Configure `tsconfig.json` paths, e.g.:
   ```json
   "paths": {
     "@components/*": ["src/components/*"],
     "@lib/*": ["src/lib/*"]
   }
   ```
9. Update `tailwind.config.ts` content paths to include `src/**/*.{astro,ts,tsx}`.
10. Run `npm run dev` (Astro) and `npm run studio` to confirm both servers start.
11. Create `project-docs/Astro-Sanity Process/structure.md` summarizing key directories and commands.
12. If the site needs a lead-capture form, establish the webhook contract early:
    - Record the destination URL, authentication expectations, and required fields in `project-docs/Astro-Sanity Process/integration.md`.
    - Add `PUBLIC_AUTOMATION_WEBHOOK_URL=` to `.env.example` (and any private server-side secret the automation requires).
    - Decide on payload format (we standardize on `application/x-www-form-urlencoded` so Zapier/n8n make parsing trivial).
    - Note the sample payload you’ll emit once the form is wired.

**Senior Dev Tasks**
- Run `npm create astro@latest` or reuse template; commit initial structure.
- Initialize Sanity studio (`sanity init`) with dataset naming convention (e.g., `production`, `staging`).
- Create `.env.example` documenting required secrets (Sanity project ID, dataset, tokens).
- Wire `astro.config.mjs`, `tsconfig.json`, and Tailwind to agreed conventions.
- Capture webhook/form specifics in `integration.md`: endpoint URL, payload format (`x-www-form-urlencoded`), expected response codes, and retry/error handling plan.

**Deliverables**
- Clean baseline project compiles with `npm run dev`.
- Documented folder structure in `project-docs/Astro-Sanity Process/structure.md`.

**Automation Hooks**
- Introduce `npm run diagnose` to sanity-check configs (lint + type check).

**Exit Criteria**
- Astro and Sanity dev servers run locally without runtime errors.
- `.env.example` lists every environment variable required for dev/staging/prod.
- `project-docs/Astro-Sanity Process/structure.md` created with descriptions of `src`, `public`, `studio`, `project-docs`.
- Initial commit pushed; repository clean (`git status` shows no changes).

---

## Phase 4 – Design System & UI Foundation
**Goals**
- Build reusable components, tokens, and global styles that align with UX direction.
- Ensure responsive breakpoints and accessibility are foundational.

**People & Roles**
- Designer, Frontend Developer, Accessibility Specialist.

**Inputs**
- Approved design mockups or style guide.
- Tailwind configuration and base layout from Phase 3.

**Step-by-Step Checklist**
1. Collect the designer/client global styles document (PDF/MD). Convert to Markdown if required and store it under `project-docs/Astro-Sanity Process/design-inputs/` (follow the conversion tips in `design-inputs/README.md`).
2. Parse the document for typography scales, spacing tokens, color palette, motion guidance, and responsive rules. Capture findings and risk flags in `project-docs/Astro-Sanity Process/global-styles-review.md`.
3. Draft `project-docs/Astro-Sanity Process/global-styles-implementation-plan.md` mapping each documented token/component to Tailwind config entries, CSS variables, and responsive breakpoints (mobile/tablet/desktop).
4. Translate confirmed design tokens into `tailwind.config.ts` (`theme.extend.colors`, typography, spacing) following the implementation plan.
5. Create shared CSS variables or utilities in `src/styles/global.css` (or `base.css`) where Tailwind tokens are insufficient; note any exceptions in the implementation plan.
6. Build layout primitives:
   - `src/layouts/BaseLayout.astro`
   - Navigation and footer components under `src/components/navigation/`.
7. Implement shared UI atoms (Button, Badge, Icon) with accessible defaults (ARIA labels, focus states) using the agreed tokens.
8. Document component props and usage in `project-docs/Astro-Sanity Process/components.md` (`Status` column → `🚧` or `✅`).
9. Validate responsive typography and spacing:
   - Test heading/body scales at 360px, 768px, 1024px, 1440px.
   - Ensure clamp calculus or media queries from the implementation plan match rendered output; log discrepancies in the review doc.
10. If Storybook is used:
   ```bash
   npx storybook init
   npm run storybook
   ```
   Add stories for each new component.
11. Run accessibility linting (`npm run lint`) and manual keyboard tests (Tab navigation, focus outlines).
12. Update README with instructions for running Storybook or component docs if applicable.

**Senior Dev Tasks**
- Translate design tokens into `tailwind.config.ts` or CSS variables.
- Create core components (`Layout`, `Header`, `Footer`, `CTA`, `Button`, `Section`).
- Document component API in `project-docs/Astro-Sanity Process/components.md`.
- Review the designer global styles document, highlight implementation risks, and produce remediation recommendations in `project-docs/Astro-Sanity Process/global-styles-review.md`.
- Translate the agreed styles into an actionable plan (`project-docs/Astro-Sanity Process/global-styles-implementation-plan.md`) covering responsive typography, spacing, and component states.
- Implement global typography, spacing, and color utilities.

**Deliverables**
- Storybook or `.mdx` component library demo (if using component explorer).
- Accessibility baseline checked with Axe or eslint-plugin-jsx-a11y.
- Completed analysis of the designer global styles document (`design-inputs/` source + `global-styles-review.md` recommendations).
- Implementation plan detailing how styles map to Tailwind/CSS (`global-styles-implementation-plan.md`).

**Automation Hooks**
- Add visual regression workflow if Storybook is present.

**Exit Criteria**
- Core layout renders sample content at mobile, tablet, and desktop without visual regressions.
- `project-docs/Astro-Sanity Process/components.md` reflects each implemented component with notes/paths.
- `project-docs/Astro-Sanity Process/global-styles-review.md` documents findings, SEO/UX risks, and agreed next steps.
- `project-docs/Astro-Sanity Process/global-styles-implementation-plan.md` is completed and kept in sync with actual Tailwind/global CSS configuration.
- Accessibility audit reveals no critical blockers; issues logged with owners.
- Designers approve component fidelity.

---

## Phase 5 – Sanity Content Architecture
**Goals**
- Model content types to support planned pages and marketing agility.
- Configure Sanity Studio with user roles, schemas, and best-in-class editing experience.

**People & Roles**
- Content Strategist, Senior Developer, Sanity Administrator.

**Inputs**
- Personas and page goals from `project-docs/Astro-Sanity Process/requirements.md`.
- Component inventory from `project-docs/Astro-Sanity Process/components.md`.
- Sanity project credentials.

**Step-by-Step Checklist**
1. Map each page or module to a Sanity document type; capture in `project-docs/Astro-Sanity Process/content-model.md`.
2. Create/modify schema files under `studio/schemas/` (e.g., `page.ts`, `sections/hero.ts`).
3. Add validation rules (e.g., required fields, slug uniqueness).
4. Configure desk structure (`deskStructure.ts`) so editors see intuitive navigation.
5. Create additional datasets if needed:
   ```bash
   sanity dataset create staging
   sanity dataset create production
   ```
6. Build seed script (`scripts/seed-sanity.ts`) to populate sample documents:
   ```bash
   npm run seed:sanity
   ```
7. Document editorial guidelines (naming, image ratios, alt-text expectations) in `project-docs/Astro-Sanity Process/content-model.md`.
8. Assign roles/permissions in Sanity Manage (Editors, Developers).
9. Demo authoring workflow to content team; gather feedback and update docs.

**Senior Dev Tasks**
- Draft content model diagram mapping to Astro routes.
- Implement schema definitions under `studio/schemas/`; include validation rules.
- Set up preview payload builders and GROQ queries for each content type.
- Configure initial dataset with seed content using `sanity dataset import` or custom scripts.

**Deliverables**
- Schema documentation stored in `project-docs/Astro-Sanity Process/content-model.md`.
- Editorial guidelines (naming, slugging, image ratios).

**Automation Hooks**
- Seed script (`npm run seed:sanity`) and dataset backup automation.

**Exit Criteria**
- Editors can create, preview, and publish sample pages without developer intervention.
- `project-docs/Astro-Sanity Process/content-model.md` lists each document & object schema, required fields, and corresponding Astro component.
- Seed script runs successfully against staging dataset.
- Access controls and roles verified (editor cannot modify schemas, etc.).

---

## Phase 6 – Astro Feature Development
**Goals**
- Build page-level routes and core marketing modules using Astro islands and components.
- Enforce performance budgets and typed data contracts.

**People & Roles**
- Frontend Developer, Senior Developer.

**Inputs**
- Sanity schemas and content from Phase 5.
- Component library from Phase 4.
- Queries planned for `SectionRenderer`.

**Step-by-Step Checklist**
1. Ensure `src/pages/index.astro` and `src/pages/[...slug].astro` exist; scaffold additional page templates as needed (e.g., `services.astro`).
2. In `[...slug].astro`, implement:
   - `getStaticPaths` using `ALL_PAGES` query.
   - Fetch page data via `PAGE_BY_SLUG`.
   - Graceful redirects for unknown slugs.
3. Build/extend `src/components/SectionRenderer.astro` to map section types to Astro components; log warnings for unknown templates.
4. Create section components under `src/components/sections/` aligning prop names with Sanity schema fields.
5. Define Sanity data types in `src/types/cms.ts` (e.g., `Page`, `HeroSection`, `FeatureStack`).
6. Implement utility helpers (CTA resolver, slug sanitizer) under `src/lib/`.
7. Add unit tests with Vitest:
   ```bash
   npm install -D vitest @testing-library/astro
   npm run test
   ```
8. Update `project-docs/Astro-Sanity Process/page-contracts.md` summarizing field requirements and component mappings.
9. Populate or adjust Sanity content to validate each section renders properly.

**Senior Dev Tasks**
- Create page templates under `src/pages/` keyed to Sanity document types.
- Implement the dynamic catch-all route in `src/pages/[...slug].astro` to resolve Sanity slugs and hand off to shared renderers.
- Implement shared utilities (markdown rendering, rich text components, image helpers).
- Build and maintain `src/components/SectionRenderer.astro` (or equivalent) that dispatches Sanity section data to Astro components with sensible fallbacks.
- Guard against hydration issues by choosing islands for dynamic widgets only.
- Maintain TypeScript types for Sanity documents in `src/types/cms.ts`.

**Deliverables**
- Feature branches merged behind preview URLs.
- Updated `project-docs/Astro-Sanity Process/page-contracts.md` summarizing required fields per page.

**Automation Hooks**
- Add unit tests for utilities and snapshot tests for key templates.

**Exit Criteria**
- Dynamic routes render all configured Sanity content without console errors.
- `project-docs/Astro-Sanity Process/page-contracts.md` exists and maps each page template to required schema fields.
- Unit tests cover helpers and `SectionRenderer` logic; CI passes.
- Unknown section types are either implemented or tracked in backlog with owner.

---

## Phase 7 – Integration & Data Wiring
**Goals**
- Connect Astro pages to Sanity content, supporting preview and incremental builds.
- Implement caching strategy and content webhooks.

**People & Roles**
- Senior Developer, DevOps Engineer (optional), Content Editor (for preview testing).

**Inputs**
- GROQ queries concept from Phase 5.
- Environment variable placeholders from `.env.example`.
- Deployment platform access.

**Step-by-Step Checklist**
1. Create Sanity client helper `src/lib/sanityClient.ts`:
   ```ts
   import { createClient } from '@sanity/client';
   export const sanityClient = createClient({
     projectId: import.meta.env.SANITY_PROJECT_ID,
     dataset: import.meta.env.SANITY_DATASET,
     useCdn: false,
     apiVersion: '2024-01-01',
     token: import.meta.env.SANITY_API_TOKEN,
   });
   ```
2. Store secrets securely:
   - Update `.env.example`.
   - Add to local `.env` (never commit).
   - Configure environment variables in Vercel/hosting provider.
3. Implement GROQ queries in `src/lib/queries.ts`; test using Sanity Vision or `sanity query`.
4. Extend `[...slug].astro` for preview mode:
   - Accept `preview` and `token` parameters.
   - Use read token to fetch drafts when preview active.
5. Build preview route `src/pages/preview.astro` or API endpoint to set preview cookies.
6. Create webhook endpoint `src/pages/api/revalidate.ts` or serverless function to trigger rebuild.
7. Configure Sanity Manage > API > Webhooks pointing to staging/production webhook URLs.
8. Document integration details (tokens, previews, webhooks) in `project-docs/Astro-Sanity Process/integration.md`.
9. Test workflow end-to-end:
   - Create draft in Sanity.
   - Hit preview link → verify draft content.
   - Publish document → confirm webhook triggers rebuild/invalidation.
10. Handle missing slugs gracefully (return 404 or redirect) and note behavior in `project-docs/Astro-Sanity Process/integration.md`.

**Senior Dev Tasks**
- Create GROQ queries and fetch logic in `src/lib/sanity/`.
- Ensure the slug route populates `SectionRenderer` with fully typed section arrays, handling preview/staging datasets.
- Add serverless function or edge integration for Sanity webhooks (e.g., `api/revalidate`).
- Configure preview mode with secure tokens and `preview` routes.
- Handle fallbacks for unpublished content and 404 flows.

**Deliverables**
- Working live preview accessible to content editors.
- Webhook endpoints documented in `project-docs/Astro-Sanity Process/integration.md`.

**Automation Hooks**
- Script to validate GROQ queries against schemas (`npm run sanity:test-queries`).

**Exit Criteria**
- Preview links display draft content securely (no token leakage in logs).
- Webhook triggers rebuild or ISR without manual intervention.
- `project-docs/Astro-Sanity Process/integration.md` lists environment variables, webhook URLs, token rotation process.
- 404 handling for unknown slugs verified and documented.

---

## Phase 8 – Performance, Accessibility & SEO
**Goals**
- Optimize asset delivery, ensure accessibility compliance, and bake in SEO/marketing tooling.

**People & Roles**
- Performance Engineer (or Senior Developer), SEO Specialist, Accessibility Lead.

**Inputs**
- Running Astro site with real content.
- Tooling decisions from Phase 1 (monitoring, analytics).

**Step-by-Step Checklist**
1. Enable Astro image optimization in `astro.config.mjs`:
   ```js
   import image from '@astrojs/image';
   export default defineConfig({
     integrations: [image(), /* tailwind, sitemap, etc. */],
   });
   ```
2. Update section components to use `<Image />` with defined widths/heights and `loading="lazy"`.
3. Create SEO helper `src/components/meta/SEOHead.astro` injecting title, description, canonical, Open Graph tags.
4. Install sitemap integration: `npm install @astrojs/sitemap` and configure `site` URL.
5. Add `public/robots.txt` and ensure canonical URLs set using environment base URL.
6. Implement JSON-LD structured data for key pages inside `SEOHead`.
7. Run Lighthouse locally:
   ```bash
   npx @lhci/cli collect --url=http://localhost:4321
   ```
   Record scores in `quality-matrix.md`.
8. Perform accessibility audit with Axe or Playwright accessibility tests; log issues in backlog.
9. Validate Core Web Vitals using Chrome DevTools (record results in `quality-matrix.md`).
10. Update README with instructions for performance testing if necessary.

**Senior Dev Tasks**
- Enable Astro image optimization and configure responsive image sets.
- Audit bundle sizes; leverage `astro check --watch` and Lighthouse CI.
- Add structured data, Open Graph tags, canonical links, sitemap, and robots.txt.
- Run accessibility checks (manual + tooling) and capture issues in backlog.

**Deliverables**
- Performance score targets documented in `project-docs/Astro-Sanity Process/quality-matrix.md`.
- Automated Lighthouse or WebPageTest report stored per release.

**Automation Hooks**
- Integrate Lighthouse CI into deployment pipeline with budget thresholds.

**Exit Criteria**
- Lighthouse scores ≥90 across Performance, Accessibility, Best Practices, SEO.
- `project-docs/Astro-Sanity Process/quality-matrix.md` lists current metrics, thresholds, owners.
- Accessibility issues triaged with owners and due dates.
- Sitemap and robots files deployed and validated (e.g., via Search Console).

---

## Phase 9 – Quality Assurance & Hardening
**Goals**
- Validate business-critical flows, regressions, and content flexibility before launch.

**People & Roles**
- QA Lead, Senior Developer, Content Editor, Project Owner (for UAT sign-off).

**Inputs**
- Feature-complete site from Phases 6–8.
- Staging environment credentials.
- Test data in Sanity.

**Step-by-Step Checklist**
1. Document manual test cases in `project-docs/Astro-Sanity Process/test-plan.md` (navigation, forms, responsive layouts, content variations).
2. Install Playwright for E2E tests:
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```
   Create tests under `tests/e2e`.
3. Configure `package.json` script: `"test:e2e": "playwright test"`.
4. Update CI workflow to run `npm run test` (unit) and `npm run test:e2e` on staging deployments.
5. Execute cross-browser/device tests (Chromium, Firefox, WebKit; mobile viewport).
6. Coordinate UAT session with stakeholders; capture feedback and sign-off in `project-docs/Astro-Sanity Process/test-plan.md`.
7. Track defects in `project-docs/Astro-Sanity Process/backlog.md` or issue tracker; ensure priority/resolution recorded.
8. Re-run tests after fixes; ensure green CI before proceeding.

**Senior Dev Tasks**
- Draft manual test scripts for top user journeys; store in `project-docs/Astro-Sanity Process/test-plan.md`.
- Ensure unit, integration, and end-to-end tests (Playwright/Cypress) cover critical paths.
- Run cross-browser and device matrix testing using BrowserStack or similar.
- Verify CMS authoring workflows and permissions with real users.

**Deliverables**
- Signed-off UAT report.
- Bug triage log with resolution status.

**Automation Hooks**
- Schedule nightly end-to-end tests against staging.

**Exit Criteria**
- `project-docs/Astro-Sanity Process/test-plan.md` contains manual + automated coverage with latest results.
- Critical/high-severity defects closed or accepted with documented rationale.
- Staging pipeline runs unit + E2E suites successfully.
- UAT sign-off recorded by Project Owner and QA Lead.

---

## Phase 10 – Deployment & Release

> 🔀 **Migrating from WordPress?** This is where you execute Phases G (DNS cutover) and H (post-cutover verification) from `wordpress-to-astro-migration.md`. Don't skip the apex-A-vs-apex-CNAME warning in Phase G — Cloudflare's CNAME flattening will silently break your cutover if you let an apex CNAME survive.

> 📘 **Ongoing changes after launch?** Once the site is live, day-to-day ship workflow lives in `dev-to-live-workflow.md`. The release-specific env vars, rollback steps, and deployment log live in `deployment.md`.

**Goals**
- Launch to production with rollback strategy and observability.

**People & Roles**
- Senior Developer, DevOps Engineer, Project Owner, Support Lead.

**Inputs**
- QA sign-off from Phase 9.
- Access to deployment platform (Vercel assumed) and monitoring tools.

**Step-by-Step Checklist**
1. Configure hosting (example: Vercel):
   - Connect GitHub repository to new Vercel project.
   - Assign environment variables for `development`, `preview`, and `production`.
2. Create `project-docs/Astro-Sanity Process/deployment.md` covering:
   - Deployment pipeline overview.
   - Manual deployment steps (if CI/CD fails).
   - Rollback procedure and contacts.
3. Implement release tagging:
   ```bash
   npm version minor
   git push --follow-tags
   ```
4. Set up monitoring/alerting:
   - Install Sentry (`npm install @sentry/astro`), configure DSN in env vars.
   - Configure uptime check (e.g., Vercel Monitoring or Pingdom).
5. Draft release checklist in `project-docs/Astro-Sanity Process/deployment.md` (smoke tests, analytics verification, DNS updates).
6. Deploy to staging (preview) and run smoke tests (`npm run test:e2e -- --project=chromium`).
7. Execute go/no-go meeting; obtain approval from stakeholders.
8. Promote to production (merge to `main` or trigger manual deploy).
9. After deploy, run `npm run postdeploy` (smoke tests, link checker) and log results in `project-docs/Astro-Sanity Process/deployment.md`.

**Senior Dev Tasks**
- Finalize infrastructure-as-code or deployment scripts (Vercel, Netlify, Render, etc.).
- Configure environments (`development`, `staging`, `production`) with matching env vars.
- Set up monitoring (uptime, error tracking, logging) and alert thresholds.
- Prepare release checklist and run go/no-go review.

**Deliverables**
- Deployment runbook in `project-docs/Astro-Sanity Process/deployment.md`.
- Cut release tag and changelog entry.

**Automation Hooks**
- Triggered post-deploy verification script (`npm run postdeploy`).

**Exit Criteria**
- Production deploy successful and monitored (alerts configured/tested).
- `project-docs/Astro-Sanity Process/deployment.md` includes release checklist, rollback plan, on-call contacts.
- Release tag created with changelog entry summarizing changes.
- Smoke test results recorded and linked from `project-docs/Astro-Sanity Process/deployment.md`.

---

## Phase 11 – Post-Launch Operations
**Goals**
- Keep the site healthy, maintain content quality, and enable future iteration.

**People & Roles**
- Project Owner, Senior Developer, Content Editor, Marketing Analyst, Support Lead.

**Inputs**
- Monitoring dashboards (analytics, error tracking).
- Backlog of feature requests and tech debt.
- Support/feedback channels.

**Step-by-Step Checklist**
1. Create `project-docs/Astro-Sanity Process/retrospectives/README.md` explaining cadence (e.g., monthly retros, weekly analytics review).
2. Schedule recurring meetings (calendar invites) for analytics review, content audit, and bug triage.
3. Set up automated link checker or scheduled GitHub Action; document command in README.
4. Store first retrospective notes in `project-docs/Astro-Sanity Process/retrospectives/<YYYY-MM-DD>.md` with action items/owners.
5. Review analytics dashboards; log key metrics and insights in the retrospective file.
6. Update `project-docs/Astro-Sanity Process/backlog.md` with new initiatives (mark `📈`) and tech debt (`🧹`).
7. Plan next 30/60/90 day roadmap updates based on insights; document in retrospective or roadmap section.

**Senior Dev Tasks**
- Monitor analytics and error dashboards; set cadence for reviews.
- Schedule CMS content governance (audits, redirects, broken link scans).
- Capture improvement backlog and tech debt tasks.
- Conduct retrospective; feed insights into next project cycle.

**Deliverables**
- Retrospective notes filed in `project-docs/Astro-Sanity Process/retrospectives/`.
- 30/60/90-day roadmap update.

**Automation Hooks**
- Cron job or GitHub Action for broken link checks and sitemap validation.

**Exit Criteria**
- `project-docs/Astro-Sanity Process/retrospectives/` folder contains first meeting notes with assigned follow-ups.
- Monitoring alerts tested (e.g., simulated downtime triggers notification).
- Backlog updated with post-launch insights and prioritized next steps.
- Content governance schedule documented and shared with editors.
