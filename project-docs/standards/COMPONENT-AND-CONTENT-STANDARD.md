# Component and Content Standard

## 1. One page architecture

The standard system is deliberately simple:

```text
Sanity page document → page loader / GROQ → typed section contract
→ one canonical SectionRenderer → registered shared Astro section → page
```

Header and footer are global layout concerns. All marketing-page content is a registered Sanity section. The slug route identifies content; it must never decide the visual presentation. A `pageType` may support content organization, navigation, or valid data behaviour, but may not select a different page template or visual branch.

The authoritative enforcement policy remains `Astro-Sanity Process/COMPONENT-FIRST-ARCHITECTURE-POLICY.md`.

## 2. Required section content architecture

Use the fields a registered component supports, but preserve this semantic order whenever the information is present:

1. **Eyebrow** — optional short context; not a replacement for a heading.
2. **Section heading** — required for every substantive section. It is normally an H2; the page hero owns the one H1.
3. **Subtitle / lead-in** — optional concise supporting line.
4. **Body** — optional but, when used, must be Sanity Portable Text (rich text), not a plain-string body field.
5. **List group** — optional. A list group has its own title and structured items.
6. **CTA context** — optional CTA title/helper text, then a primary button and optional secondary button.

The content fields are optional only when the component makes their absence meaningful. A section may not exist only to render a decorative title or spacing band.

### Heading and list hierarchy

- Page hero: H1; later substantive sections: H2.
- A list-group title under a section H2 is H3; an item title in that group is H4.
- If the immediate group/item title is H4, its nested item titles are H5.
- Do not skip levels, create more than one H1, or use visual styling to fake a heading. A bullet with no title remains list text, not a heading.
- The renderer must emit semantic list markup (`ul`/`ol` and `li`) even when a titled item uses an H4/H5 inside its list item.

### CTA hierarchy

The primary CTA is the main conversion action for the section. A secondary CTA is optional and must be genuinely secondary. Both require a verified destination. A label is not a URL; button labels and helper text are never substituted for `href` values.

## 3. Portable Text rule and compatibility rollout

**New work:** every field that represents section body copy must be modeled as Portable Text. This includes explanatory prose and item descriptions where the item is intended to carry body copy.

**Existing implementation:** some registered schemas/components still expose legacy `string`/`text` description fields. They remain only for backward compatibility while the system is upgraded. Do not use them for newly authored body copy. Do not remove or rename them until the migration plan proves existing Sanity documents, all queries, types, renderers, and visual output remain intact.

Before enforcing the rule in code, create and approve a shared rollout packet with: field-by-field inventory; Portable Text schema/renderer contract; legacy-data migration or read compatibility; GROQ/type updates; CMS readback evidence; desktop/mobile regression checks; and a rollback path. This is a component-first change, not a per-page cleanup.

## 4. WordPress normalization rule

WordPress often represents one logical section as several consecutive visual blocks: a title band, prose band, list, image, and CTA. In Astro + Sanity, normalize those adjacent blocks into one complete supported section whenever their purpose is one content unit.

- Preserve every substantive sentence, list item, heading, media record, metadata value, and source URL in the migration inventory or its mapped destination.
- Preserve source meaning; do not invent replacement copy.
- Do not create title-only sections merely because WordPress displayed a title separately.
- Keep a mapping record when multiple WordPress blocks become one section.
- WordPress chrome, duplicate widgets, spacers, and layout-only wrappers are not substantive content. Record their disposition; do not silently discard meaningful content.

## 5. Components and variants

Use a registered component first. If it does not fit, ask whether the need is an approved variant of an existing shared component before proposing a new shared component. A component/variant proposal must state: repeatable use case, content contract, accessibility and responsive behaviour, design-token needs, migration impact, and verification plan.

The following are HOLD violations unless the architecture owner approves the reusable solution first:

- a page-specific Astro template;
- a route, slug, title, section-key, or content-matching visual branch;
- an alternate renderer or rendering bypass;
- copied section markup or page-only CSS;
- a one-off schema field that exists solely for one page;
- raw HTML used as a general marketing-page builder.
