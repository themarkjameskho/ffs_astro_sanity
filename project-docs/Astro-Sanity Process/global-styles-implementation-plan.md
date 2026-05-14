# Global Styles Implementation Plan

> Complete this plan after analyzing the designer/client global styles document. Map every token and guideline to concrete implementation details (Tailwind config, CSS variables, responsive rules) so developers and AI agents can execute without ambiguity.

## 1. Inputs
- **Source document:** `design-inputs/<file-name>.md`
- **Review log:** `global-styles-review.md`
- **Author:** 
- **Date:** 

## 2. Token Mapping
### Typography
| Style Name | Size (px/rem) | Line-Height | Font Family | Responsive Strategy | Tailwind Config / CSS Variable |
|------------|---------------|-------------|-------------|---------------------|--------------------------------|
| Heading 1 |  |  |  | e.g., `clamp(2.5rem, 1vw + 2rem, 3.5rem)` | `theme.extend.fontSize.h1`, `--font-h1` |
| Heading 2 |  |  |  |  |  |
| Body |  |  |  |  |  |
| Label |  |  |  |  |  |

### Color Palette
| Token | Hex / RGBA | Usage | Tailwind Key | CSS Variable |
|-------|------------|-------|--------------|--------------|
| Primary |  | Buttons, links | `colors.primary.DEFAULT` | `--color-primary` |
| Primary Dark |  | Hover state | `colors.primary.dark` | `--color-primary-dark` |
| Surface |  | Backgrounds |  |  |

### Spacing & Layout
| Token | Value | Notes | Tailwind Mapping |
|-------|-------|-------|------------------|
| Base spacing |  | e.g., 4px grid | `theme.extend.spacing` |
| Section padding |  | | `.section-padding` utility |

### Motion
| Animation | Spec | Accessibility Notes | Implementation |
|-----------|------|---------------------|----------------|
| Button hover |  | Provide reduced-motion fallback | `@keyframes` name, Tailwind plugin, etc. |

## 3. Component Implementation
| Component | Spec Reference | Implementation Notes | Responsive Behaviour | Status |
|-----------|----------------|----------------------|----------------------|--------|
| Header | Page 3, “Navigation” | Sticky with shadow; update `--header-height` JS hook | Collapse to mobile menu ≤768px | Todo |
| Hero | Page 5 | Gradient overlay, ambient animation | Reflow text stack at ≤1024px | Todo |
| CTA Button | Page 7 | Glow on focus, 3D hover | Full-width on mobile | Todo |

## 4. SEO & Accessibility Actions
- Semantic hierarchy adjustments:
- Contrast fixes:
- Font loading strategy (preload vs. swap):
- CLS mitigation (e.g., font fallback metrics):

## 5. Tasks & Ownership
| Task | Owner | Due Date | Status | Notes |
|------|-------|----------|--------|-------|
| Update `tailwind.config.ts` typography scale |  |  | Todo | |
| Adjust `global.css` for section padding |  |  | Todo | |
| Validate clamp outputs across breakpoints |  |  | Todo | |

## 6. Verification Checklist
- [ ] Tailwind config matches tokens.
- [ ] Global CSS overrides documented with reasons.
- [ ] Responsive screenshots captured at 360px / 768px / 1024px / 1440px.
- [ ] Lighthouse accessibility warning-free for global elements.
- [ ] Review sign-off by Design + SEO.

## 7. Sign-off
- **Developer:**  / Date:
- **Design Lead:**  / Date:
- **SEO Reviewer:**  / Date:

