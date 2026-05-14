# Project Structure Overview

## Directory Map
- `src/`
  - `components/` – UI building blocks (`sections/`, `ui/`, `forms/`, `meta/`).
  - `layouts/` – Page-level wrappers (e.g., `BaseLayout.astro`).
  - `lib/` – Utilities, API clients (`sanityClient.ts`, `queries.ts`).
  - `pages/` – Route definitions (`index.astro`, `[...slug].astro`, `api/` endpoints).
  - `styles/` – Global CSS/Tailwind entrypoints.
- `public/` – Static assets served as-is (images, favicon, robots.txt).
- `studio/` – Sanity Studio application (schemas, desk structure, config).
- `project-docs/` – Architecture, process, and checklist documentation.
  - `Astro-Sanity Process/` – This playbook and supporting templates.
- `scripts/` – Node/TS utilities (e.g., seeding, data migrations).

## Key Commands
- `npm run dev` – Start Astro development server.
- `npm run build` – Generate production build.
- `npm run lint` – Run ESLint across `src/`.
- `npm run typecheck` – Execute `astro check` for TypeScript + Astro types.
- `npm run test` – Execute unit tests (Vitest).
- `npm run test:e2e` – Execute end-to-end tests (Playwright).
- `npm run studio` – Launch Sanity Studio locally.
- `npm run seed:sanity` – Seed content into configured Sanity dataset.
- `npm run diagnose` – Composite script for lint/type/test (expected to be added).

## Environment Files
- `.env` – Local development secrets (never commit).
- `.env.local` / `.env.production` – Optional overrides per environment.
- `.env.example` – Template listing all required variables (`SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, etc.).

## Branching Convention (Suggested)
- `main` – Production-ready code.
- `develop` – Aggregated staging branch (optional).
- `feature/<short-description>` – Feature work; merge via pull request.
- `hotfix/<issue>` – Emergency fixes targeting production.

