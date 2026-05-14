# Architecture Overview

## High-Level Diagram
- Diagram file reference (e.g., `architecture.drawio` or `architecture.svg`):
- Core services: `Astro` (frontend), `Sanity` (CMS), deployment target, CDN, integrations.

## System Components
- **Frontend**: Framework, rendering mode (SSG/SSR), routing strategy, state management.
- **CMS**: Sanity dataset strategy (production/staging), schema governance, preview pipeline.
- **APIs & Integrations**: Third-party services, authentication, analytics, marketing tools.
- **Infrastructure**: Hosting provider, CI/CD tooling, monitoring stack, secrets management.

## Data Flow
- Content authoring flow (Sanity Studio → dataset → Astro build/preview).
- Run-time data fetching and caching strategy.
- Webhook or revalidation triggers.

## Environment Matrix
| Environment | Purpose | Branch | Dataset | Notes |
|-------------|---------|--------|---------|-------|
| Development | Local dev | feature/* | local | Hot module reload |
| Staging | QA / UAT | develop | staging | Preview URLs |
| Production | Live | main | production | Observability enabled |

## Security & Compliance
- Authentication/authorization model for Studio.
- Secrets storage (env vars, vault).
- Audit/logging requirements.

## Operational Considerations
- Backup/restore plan for Sanity datasets.
- Disaster recovery & rollback strategy.
- Monitoring & alerting thresholds.

