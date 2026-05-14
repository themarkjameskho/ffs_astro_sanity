# Component Inventory

## Status Key
- `✅` implemented & documented
- `🚧` in progress
- `📝` planned / not started

## Global Foundations
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| LayoutShell | 📝 | `src/layouts/Layout.astro` | Primary page wrapper |
| Header | 📝 | `src/components/navigation/Header.astro` | Responsive nav |
| Footer | 📝 | `src/components/navigation/Footer.astro` | |
| SEOHead | 📝 | `src/components/meta/SEOHead.astro` | Handles meta tags |

## Content Blocks
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| HeroSection | 📝 | `src/components/blocks/HeroSection.astro` | Supports rich text + CTA |
| FeatureList | 📝 | `src/components/blocks/FeatureList.astro` | |
| TestimonialSlider | 📝 | `src/components/blocks/TestimonialSlider.astro` | Consider Astro island |
| ContactForm | 📝 | `src/components/forms/ContactForm.astro` | Integrate with form backend |

## Utilities & Shared Elements
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Button | 📝 | `src/components/ui/Button.astro` | Variants + icon support |
| Badge | 📝 | `src/components/ui/Badge.astro` | |
| Icon | 📝 | `src/components/ui/Icon.astro` | Pulls from icon set |

## Sanity Portable Text Renderers
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| PortableTextRenderer | 📝 | `src/components/cms/PortableTextRenderer.astro` | Maps blocks to Astro components |
| ImageWithCaption | 📝 | `src/components/cms/ImageWithCaption.astro` | Uses Sanity asset pipeline |

## Documentation Tasks
- Keep this inventory synced with `project-docs/Astro-Sanity Process/architecture/overview_architecture.md`.
- Update with props interface snippets as components stabilize.
- Link to Storybook/MDX demos when available.

