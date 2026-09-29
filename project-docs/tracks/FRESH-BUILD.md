# Track: Fresh Build

Use this track only when the client has no existing public site or indexed content that must be retained. If an existing domain, site, or indexed URLs are in scope, classify the project as a migration instead.

## Definition of ready

Before development begins, the client folder must contain:

1. **Project brief** — audience, business goals, services, service areas, scope, exclusions, approver, launch target, forms/analytics requirements, and claims that are actually approved.
2. **Reference set** — approved visual/competitor/content references with an explanation of what may be learned from each. References inform the design system; they are not templates to copy.
3. **Design system** — brand tokens, type scale, color/contrast decisions, spacing, responsive rules, button/CTA system, image direction, and approved shared variants.
4. **Content architecture** — site map, page purpose, primary CTA, section order, heading plan, source material, SEO title/description, and a mapping to registered components for every page.
5. **Infrastructure inputs** — confirmed client slug, domain, GitHub destination, Sanity project/datasets, Vercel ownership, and environment-variable plan. Never invent these values.

## Required sequence

1. Classify and record the project as Fresh Build.
2. Complete the pre-development section of `../LIFECYCLE-CHECKLIST.md` and `../Astro-Sanity Process/astro-sanity-development-process.md`.
3. Review the design system before editing components or CSS. Brand variation belongs in tokens and approved shared variants.
4. Complete the content/component map using `../standards/COMPONENT-AND-CONTENT-STANDARD.md`.
5. Provision client infrastructure and repository only after required values are known.
6. Build pages as Sanity content using the canonical route and renderer.
7. Complete development, pre-launch, launch, and public verification gates in the lifecycle checklist.

**Gate:** HOLD when the brief, design system, or component map is absent. It is safe to draft open questions, but not to invent content or begin page-specific implementation.
