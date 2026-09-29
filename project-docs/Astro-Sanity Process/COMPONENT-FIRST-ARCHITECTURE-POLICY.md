# Component-First Architecture Policy

**Status: Mandatory for every FFS Astro + Sanity build, rebuild, migration, and AI-assisted change.**

This policy makes shared-component architecture an acceptance gate, not a stylistic preference. Developers, reviewers, and AI agents must follow it together with `project-docs/LIFECYCLE-CHECKLIST.md` and the applicable development or migration playbook. A change that violates this policy is not ready to merge or release, even if it builds and looks correct on one route.

## The rule

Build a reusable site system and assemble pages from it. Do not build a separate design, Astro component, route renderer, or CSS treatment for each page or for each similar page.

- Page-specific differences belong in Sanity content: wording, selected media, card data, ordering, links, and other authored values.
- Presentation differences belong in an explicit, reusable variant on the shared component, selected through a documented Sanity field and available to every page that uses that component.
- A page route loads its page data and hands its ordered `sections[]` to the canonical page/section renderer. The homepage may have its own route entry, but it must assemble the same registered shared section components rather than introduce a parallel visual system.
- Repeated page families may use one shared family-level renderer only when the content type genuinely requires different behavior (for example, article body rendering). The renderer must be reusable across the family, data-driven, and registered in the architecture. It must not become a disguised one-page template.

**Never add** route/slug/title/section-key conditions to choose visual structure, substitute a component, inject authored copy or media, hide a section, or change styling. Do not create per-page Astro templates, copied markup, CSS overrides, or renderer bypasses to achieve a page-specific appearance. Content matching (such as interpreting a heading's words) is not a substitute for a schema field.

## When a new component or variant is justified

Prefer this order:

1. Reuse the existing component and change only its Sanity content.
2. If the same component needs a distinct presentation, add a named variant to that component's Sanity schema and shared renderer.
3. Create a new component only for a genuinely different, repeatable content capability that cannot be expressed clearly by the existing component or one of its variants.

Before step 2 or 3, document the use cases, why existing components do not fit, intended page-family reach, editor controls, accessibility and responsive behavior, and acceptance tests. The architecture owner must approve the proposal before implementation. A new variant must be viable for all pages of the component family; it cannot be a slug-only escape hatch. A one-off page requirement is not, by itself, justification for a new component.

## Required end-to-end contract

A component change is incomplete until the whole content contract is wired and checked. For any new or changed component/variant, review and update every applicable layer:

1. **Sanity schema:** fields, validation, descriptions, previews, and supported variants.
2. **TypeScript contract:** accurate types and optional/required semantics.
3. **GROQ:** all page queries and reusable fragments project the fields (including nested media and crop/hotspot data).
4. **Page/section contract:** required content, allowed combinations, and variant invariants are validated.
5. **Renderer:** one canonical dispatch path maps the Sanity section type to the shared component; unknown types fail visibly in development/QA rather than silently disappearing or becoming a different section.
6. **Component and shared styles:** render every declared field; use design tokens and responsive/accessibility rules. Do not add page-specific selectors.
7. **Content migration:** map the source content into the correct schema fields and official component; preserve approved copy, media, order, links, and intent. Do not silently invent content or substitute local assets.
8. **Tests and readback:** test schema/query/type/renderer agreement and verify the actual Sanity document and rendered route at representative viewport sizes.

If an editor can set a field in Sanity but the query or component does not render it, the feature is not complete. If the UI displays an option that the schema does not officially support, remove or fully implement that option before release.

## Section and content invariants

- A marketing section must have a meaningful heading **and useful content beyond the heading**: body copy, a list, cards, media, FAQs, a form, or a clear conversion action. A heading-only section is a contract failure. If a heading is intentionally used only as an anchor/decorative divider, model it as that explicit utility rather than a content section.
- Use the component matching the content's purpose. Do not repurpose a CTA, icon grid, image card, or two-column narrative as a different section type through renderer heuristics.
- Images belong to the field and visual position specified by the component contract. A request for images on each card means each card's schema item must own/render its image; a section-level image is not equivalent. Define crop, aspect ratio, alt text, and edge-to-edge behavior explicitly in the shared variant.
- When a card has an image, follow the official image-card variant: do not also show a redundant icon unless the schema explicitly defines and the design approves both.
- Do not add hidden fallback copy, sample assets, or “looks close enough” content when migrated CMS fields are absent. Preserve a truly blank/optional state only where the component contract explicitly allows it; otherwise report the missing required field and block acceptance.

## Migration rules

1. Inventory the source page's sections, content, images, links, and interactions before implementation. Map each source section to an existing Sanity section type and shared Astro component.
2. Reuse the same component for similar sections across pages. Keep legitimate page differences in each Sanity document, not in route code.
3. If no component fits, stop and write a component/variant proposal. Do not create the page template first and rationalize it later.
4. Migrate one representative page, prove its complete Sanity-to-browser path, then migrate the rest of the family through the same contract.
5. Retire obsolete/legacy renderer paths only after content has been mapped and route parity is verified. Do not leave parallel legacy and shared renderers active indefinitely.
6. Review every route in the affected family, not just the route used during development. Confirm there are no missing, duplicate, title-only, or mis-typed sections and no content loss.

## Required review and release gate

The developer/AI author must include this evidence in the change summary:

- Existing component/variant considered and why it was reused or extended.
- Schema → types → GROQ → contract → renderer → component field mapping.
- Search evidence that no new slug/title/_key-specific presentation branch or page-only component was added.
- Sanity readback for the edited page(s) and route-level verification for every affected page family.
- Desktop and mobile checks for section order, title/body spacing, media placement/crop, card count/layout, CTA behavior, and console/runtime errors.
- Tests/build results and any unsupported/missing legacy content, clearly marked as blockers rather than patched with invented defaults.

Reviewer checklist:

- [ ] All affected pages use the canonical renderer and the same shared component contract.
- [ ] No page-specific template, component, CSS, slug/title/key branch, content heuristic, or renderer bypass was introduced.
- [ ] Every visible section has the required title and meaningful content beyond the title.
- [ ] All requested media and per-card fields are mapped through Sanity, types, GROQ, and the component.
- [ ] Only named, schema-defined, reusable variants are used; editor controls match actual output.
- [ ] All affected routes pass desktop/mobile and published-Sanity readback checks.

Any unchecked item is a **HOLD**. Record an explicit, time-bounded architecture exception only when the project owner approves it; identify the owner, affected routes, reason, removal/migration plan, and expiry. Do not treat a legacy exception as permission to create another.

## Lessons from a production migration (anonymized)

Recent migration and live-page reviews exposed why the gate is strict:

- A bespoke homepage/service-area rendering path bypassed the shared section loop, so fixes did not reach all pages consistently.
- Slug- and content-matching branches in shared renderers altered section order, transformed one section type into another, and supplied hard-coded titles, copy, and media. The CMS document no longer described what the visitor saw.
- An image request for individual cards was implemented as a section-level image; icons remained beside images and the card-image edges/crop did not follow an official variant. The underlying schema/query/component contract had not been made explicit first.
- A route displayed a standalone title-only section after a page migration. Build success could not detect this; route-family and CMS content verification were needed.

These are architecture and integration failures, not requests for page-specific CSS. The remedy is one source of truth: Sanity content + registered schema variants + the shared renderer/component pipeline, verified from Studio through the published route.
