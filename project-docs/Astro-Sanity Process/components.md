# Shared Component Inventory and Change Gate

This template has one registered-page assembly system. The inventory below is derived from `studio/schemaTypes/documents/page.ts` and `src/components/sections/SectionRenderer.astro`; verify these code files before changing the list.

| Sanity type | Shared Astro component | Primary use |
|---|---|---|
| `heroSection` | `HeroSection.astro` | Page introduction and primary conversion action |
| `serviceGridSection` | `ServiceGridSection.astro` | Service/category links |
| `processSection` | `ImageCardSection.astro` | Image-led process or feature cards |
| `serviceAreaSection` | `ServiceAreaSection.astro` | Coverage/community lists |
| `ctaSection` | `CtaSection.astro` | Conversion band |
| `contactSection` | `ContactSection.astro` | Contact details/map/links |
| `blogListSection` | `BlogListSection.astro` | Automatic blog listing |
| `iconGridSection` | `IconGridSection.astro` | Benefits/differentiators |
| `twoColTextImageSection` | `TwoColTextImageSection.astro` | Rich explanation with imagery |
| `leadFormSection` | `LeadFormSection.astro` | Lead capture |
| `htmlSection` | `HtmlSection.astro` | Approved legal content or vetted embed only |
| `faqSection` | `FaqSection.astro` | Customer Q&A |
| `areasSection` | `AreasSection.astro` | Grouped city/state lists |
| `stepsSection` | `StepsSection.astro` | Sequential customer journey |

Global `MainLayout.astro`, header, and footer are site shell components, not page-content templates.

## Change gate

Before proposing a new component or variant, demonstrate that no registered component can meet a repeatable need through its existing content contract and approved design-system variation. The architecture owner must approve the reusable direction before implementation.

Every approved change must be complete across schema, TypeScript, all GROQ projections, section contract, canonical renderer, shared component, editor guidance, CMS readback, and affected-route desktop/mobile verification. A change that works only on one page is a HOLD, not a new component.
