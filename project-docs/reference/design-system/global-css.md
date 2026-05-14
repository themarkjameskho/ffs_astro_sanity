# Global Styles Reference (`src/styles/global.css`)

Comprehensive guide to the global stylesheet that establishes typography, layout primitives, and component-level styling for Top Bed Bug Exterminator. This file supplements Tailwind utility usage with bespoke rules, motion, and accessibility affordances.

## Imports & Dependencies
- `@import url('https://fonts.googleapis.com/...')` loads the Maven Pro and Teko font families.
- `@import './tokens.css'` exposes the color and spacing CSS custom properties shared across the design system.
- `@import 'tailwindcss'` ensures Tailwind’s base styles and utility classes are available before custom rules apply.

## Root-Level Variables
- Defines `--font-base`, `--font-heading`, and a `--header-height` custom property with responsive overrides at `768px` and `1024px`.
- `--header-height` is updated in JavaScript (see `Header.astro`) to keep layout spacing accurate as the header transforms on scroll.

## Base Typography & Color
- Global `html`/`body` rules set fluid typography, line-height, smoothing, and inherit background/text colors from `tokens.css`.
- Reusable typography helpers:
  - `.company-name`, `.company-name__line`, `.footer-section-title` define brand-specific title treatments.
  - Default heading selectors (`h1`–`h6`) apply the heading font stack with responsive sizes; `.h1`–`.h6` utility classes provide equivalent styles for non-semantic tags.
  - `p` creates consistent paragraph spacing.
  - `.heading-accent` applies the primary accent color.

## Header & Navigation
- `header.is-scrolled` styles the sticky header state (background blur, shadows) and constrains the logo dimensions when scrolled.
- Link treatments remove underline transitions for header/nav anchors.
- Desktop dropdown menu:
  - `.header-nav` variants ensure hover/focus styles, accent colors, and dropdown palette.
- `.mobile-call-wrapper` positions the call-to-action button on narrow viewports.
- `.mobile-nav-toggle` handles the hamburger/toggle control with focus-ring treatments.

## Mobile Menu System
All selectors prefixed with `.mobile-menu` manage the off-canvas navigation experience:
- Base container uses fixed positioning, `pointer-events`, and opacity to control visibility.
- `.mobile-menu__backdrop` and `.mobile-menu__panel` provide overlay and sliding panel behavior; safe-area insets protect against device UI.
- Branding block (`__branding`, `__brand-logo`, `__brand-name`, `__brand-tagline`) mirrors the main logo/identity.
- Navigation items:
  - `.mobile-menu__link`, `--toggle`, `--static`, and `__sublink` manage list behavior, uppercase typography, and nested submenu transitions.
  - Data attributes (`aria-expanded`) are used to expand/collapse submenus; CSS rotates chevron icons accordingly.
- Contact panel (`__contact`, `__contact-link`, `__help-*`, `__cta`) presents quick actions beneath the nav list.
- `body.has-mobile-nav` prevents background scroll when the panel is open.
- `@media (prefers-reduced-motion: reduce)` strips transitions from mobile menu interactions for accessibility.

## Theming & Utility Classes
- `.theme-inverse` flips text color context for dark sections while adapting `.btn-secondary`.
- `.btn-text`, `.surface-1`, `.surface-2`, `.surface-border`, `.text-inverse`, `.lucide` offer reusable helpers for text, surfaces, or icon sizing.
- Tailwind `@apply` is used for concise dependency on spacing and radius utilities.

## Layout Helpers
- `.container-lg` standardizes the layout container width and horizontal padding.
- `.section-padding` and `.section-padding-tight` offer consistent vertical rhythm options.

## Hero System
- `.hero-wrap`, `.hero-overlay`, and modifiers control hero background imagery and gradients. The default min-height is a global fallback; components can override via Tailwind utilities.
- `.hero-foreground`, `.hero-highlights`, `.chip` and variants handle hero content positioning and highlight badges.
- `.hero-ambient` uses blurred gradient blobs with a `heroFloat` animation for ambient lighting effects; respects animation timing.
- `.hero-grid` and `.hero-aside` coordinate split-layout hero sections with responsive adjustments.

## Surfaces & Cards
- `.card`, `.card-elevated`, `.card-surface` provide shadow, border, and hover animations for content blocks.
- `.hover-underline` adds an animated underline for interactive text.

## Form Elements
- `.input` and `.label` wrap Tailwind utilities with consistent colors, focus states, and spacing.

## Buttons
- `.btn` base class sets shared typography, motion, and sheen effect (`::after` gradient sweep).
- Variants: `.btn-primary`, `.btn-secondary`, `.btn-accent`, `.btn-outline-light`, `.btn-block`.
- Motion accessibility: `prefers-reduced-motion` removes transitions when users opt out.
- `.btn-text` is a lightweight text-only variant.

## FAQ & Expandable Elements
- `.faq-item` customizes `<details>` elements with borders, shadow changes, and `summary::after` icons that rotate when open.
- `.step`, `.step-num` style ordered progression lists.
- `.image-frame` applies consistent framing to media.

## Timeline Pattern
- `.timeline`, `.timeline-step`, `.timeline-index` deliver a vertical timeline with connecting gradients, hover elevation, and responsive offsets.

## Scrollable Carousel Utilities
- `.scroll-row` establishes horizontal scrolling with snap points and custom scrollbar styling.
- `.scroll-card` ensures each testimonial or card aligns with the snap grid.
- `.quote-mark` styles decorative quote circles.

## Highlighted Badges & Chips
- `.contact-bubble`, `.feature-index`, `.badge-soft`, `.pill`, `.chip` variants support pill-shaped callouts with brand color mixing.

## Miscellaneous Utilities
- `.contact-bubble`, `.feature-index`, `.badge-soft`, `.site-footer` spacing ensure consistent embellishments and footer padding.
- `.mobile-menu__secondary-link`, `.mobile-menu__contact-link`, `.mobile-menu__help-*` provide typography and layout variations in the mobile drawer.

## Motion & Accessibility Considerations
- Explicit focus outlines (`outline: 2px solid var(--color-brand-orange)`) appear across interactive controls for keyboard navigation.
- `prefers-reduced-motion` blocks remove transitions for mobile drawer and buttons.
- Off-canvas menus toggle `pointer-events` to avoid accidental interactions while hidden.

## Integration Notes
- Many color references rely on variables from `tokens.css` (e.g., `--color-brand-navy`, `--color-button-primary-bg`). Updating tokens propagates theme changes automatically.
- Tailwind utilities used via `@apply` expect Tailwind to be configured (see `tailwind.config.ts`). Removing Tailwind would require replacing those directives with plain CSS.
- Header height adjustments and sticky logo swaps are coordinated with `Header.astro` script logic; avoid renaming `--header-height` without updating the component script.
- The stylesheet assumes Google Fonts are available; local fallbacks (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Arial`, `sans-serif`) maintain legibility if remote fonts fail.

## Extending the Stylesheet
- Follow the existing section comment pattern when adding new component blocks for discoverability.
- Prefer using or extending existing utilities (e.g., `.surface-*`, `.btn-*`) to maintain brand consistency.
- When creating new animations, duplicate the `prefers-reduced-motion` guard to preserve accessibility.

