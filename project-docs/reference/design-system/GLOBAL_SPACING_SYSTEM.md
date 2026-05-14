# Global Section Spacing System

## Overview
This document defines the standardized spacing system for all section components. This covers the **SECTION WRAPPER LEVEL ONLY** - not the internal cards, items, or grid content within sections.

---

## Tailwind Spacing Values to Pixels

| Tailwind Class | Mobile (px) | Tablet (md: px) | Notes |
|---|---|---|---|
| `p-4` | 16px | 16px | Small padding |
| `p-6` | 24px | 24px | Medium padding |
| `py-8` | 32px | 32px | Vertical spacing |
| `py-12` | 48px | 48px | Standard vertical spacing |
| `py-16` | 64px | 64px | Large vertical spacing |
| `py-20` | 80px | 80px | Extra large vertical spacing |
| `px-4` | 16px | 16px | Mobile horizontal |
| `px-6` | 24px | 24px | Desktop horizontal |
| `md:px-6` | 16px (mobile) → 24px (desktop) | Responsive horizontal |

---

## Current Section Spacing Breakdown

### HORIZONTAL (Left/Right Padding)

**All Sections:**
- Mobile: `px-4` = **16px left + 16px right** (32px total)
- Desktop (md:): `px-6` = **24px left + 24px right** (48px total)
- Applied via `.section-container` utility

**Exception - Full-width sections (HeroSection, CtaSection, LeadFormSection):**
- No horizontal padding on section wrapper
- Inner content has `.section-container` applying `px-4 md:px-6`

---

### VERTICAL (Top/Bottom Padding)

**Three Standard Sizes:**

#### **Standard (`.section-padding`)**
- Mobile: `py-12` = **48px top + 48px bottom** (96px total)
- Desktop (md:): `py-16` = **64px top + 64px bottom** (128px total)
- **Used for**: Regular content sections (ServiceGrid, ServiceArea, etc.)

#### **Small (`.section-padding-sm`)**
- Mobile: `py-8` = **32px top + 32px bottom** (64px total)
- Desktop (md:): `py-12` = **48px top + 48px bottom** (96px total)
- **Used for**: Compact sections needing less breathing room

#### **Large (`.section-padding-lg`)**
- Mobile: `py-16` = **64px top + 64px bottom** (128px total)
- Desktop (md:): `py-20` = **80px top + 80px bottom** (160px total)
- **Used for**: Hero, CTA, Lead Forms - prominent sections needing maximum visual separation

---

## Section Type Classification

### TYPE 1: CONTAINED SECTIONS (Has max-width container)
**Pattern**: `.section-inner-lg` or similar
- Max width: `max-w-6xl` (1152px)
- Horizontal: `px-4 md:px-6` (16px → 24px)
- Vertical: See size variants below

**Sections**:
- ✅ ServiceGridSection
- ✅ BlogListSection
- ✅ IconGridSection
- ✅ ServiceAreaSection
- ✅ HtmlSection

**Spacing Applied**:
```
.section-inner-lg {
  @apply section-container section-padding-lg;
  /* = max-w-6xl + px-4 md:px-6 + py-16 md:py-20 */
}
```

---

### TYPE 2: FULL-WIDTH SECTIONS (Extends edge-to-edge)
**Pattern**: `.section-full-width-lg` + nested `.section-container`
- Full width: `w-full`
- Horizontal: Padding applied to inner content div (`.section-container`)
- Vertical: Applied to section wrapper

**Sections**:
- ✅ HeroSection
- ✅ CtaSection
- ✅ LeadFormSection
- ✅ TwoColTextImageSection
- ✅ ImageCardSection
- ✅ ContactSection

**Spacing Applied**:
```html
<section class="section-full-width-lg">
  <!-- py-16 md:py-20 applied here -->
  <div class="section-container">
    <!-- px-4 md:px-6 + max-w-6xl applied here -->
    Content
  </div>
</section>
```

---

## Comprehensive Section Spacing Reference

### HERO SECTION
```
Section Wrapper (section-full-width-lg):
  - Width: w-full (100%)
  - Horizontal: None (full-width background)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)
  
Inner Content Div (section-container):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: None (inherited from section)

Summary: 16→24px left/right, 64→80px top/bottom
```

### SERVICE GRID SECTION
```
Section Wrapper (section-inner-lg):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)

Summary: 16→24px left/right, 64→80px top/bottom
```

### BLOG LIST SECTION
```
Section Wrapper (section-inner-lg):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)

Summary: 16→24px left/right, 64→80px top/bottom
```

### CTA SECTION
```
Section Wrapper (section-full-width-lg):
  - Width: w-full (100%)
  - Horizontal: None (full-width background with color)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)
  
Inner Content:
  - Max Width: max-w-5xl or max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: None (inherited)

Summary: 16→24px left/right, 64→80px top/bottom
```

### LEAD FORM SECTION (Contact Form)
```
Section Wrapper (section-full-width-lg):
  - Width: w-full (100%)
  - Horizontal: None (full-width background)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)
  
Inner Container (section-container):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: None (inherited)

Summary: 16→24px left/right, 64→80px top/bottom
```

### ICON GRID SECTION
```
Section Wrapper (section-inner-lg):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)

Summary: 16→24px left/right, 64→80px top/bottom
```

### TWO COLUMN TEXT IMAGE SECTION
```
Section Wrapper (section-full-width-lg):
  - Width: w-full (100%)
  - Horizontal: None (full-width)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)
  
Inner Container (section-container):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: None (inherited)

Summary: 16→24px left/right, 64→80px top/bottom
```

### SERVICE AREA SECTION
```
Section Wrapper (section-inner-lg):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)

Summary: 16→24px left/right, 64→80px top/bottom
```

### CONTACT SECTION
```
Section Wrapper (section-full-width-lg):
  - Width: w-full (100%)
  - Horizontal: None (full-width background)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)
  
Inner Container (section-container):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: None (inherited)

Summary: 16→24px left/right, 64→80px top/bottom
```

### IMAGE CARD SECTION (Process)
```
Section Wrapper (section-full-width-lg):
  - Width: w-full (100%)
  - Horizontal: None (full-width)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)
  
Inner Container (section-container):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: None (inherited)

Summary: 16→24px left/right, 64→80px top/bottom
```

### HTML SECTION (Custom Content)
```
Section Wrapper (section-inner-lg):
  - Max Width: max-w-6xl
  - Horizontal: px-4 md:px-6 (16px → 24px left/right)
  - Vertical: py-16 md:py-20 (64px → 80px top/bottom)

Summary: 16→24px left/right, 64→80px top/bottom
```

---

## Global Spacing Summary

| Dimension | Mobile | Desktop (md:) | Applied Via |
|---|---|---|---|
| **Left Padding** | 16px | 24px | `px-4 md:px-6` |
| **Right Padding** | 16px | 24px | `px-4 md:px-6` |
| **Top Padding** | 64px | 80px | `py-16 md:py-20` |
| **Bottom Padding** | 64px | 80px | `py-16 md:py-20` |
| **Max Width** | 100% (full width) | 1152px (max-w-6xl) | `.section-container` |

---

## Spacing Hierarchy

### By Visual Prominence (Vertical Spacing)

```
1. HERO SECTION
   ├─ Full-width banner
   ├─ 64px → 80px vertical padding
   └─ Top of page - maximum visual impact

2. PROMINENT SECTIONS (CTA, Lead Form, Contact)
   ├─ Full-width backgrounds (colored)
   ├─ 64px → 80px vertical padding
   └─ Call-to-action areas - strong visual separation

3. CONTENT SECTIONS (Service Grid, Blog List, Service Area)
   ├─ Contained with max-width
   ├─ 64px → 80px vertical padding
   └─ Main content areas

4. COMPACT SECTIONS (if needed)
   ├─ Use section-padding-sm if required
   ├─ 32px → 48px vertical padding
   └─ Transition sections or light content
```

### By Containment (Horizontal Padding)

```
Full-Width Type:
├─ Section wrapper: 100% width, no padding
└─ Content inside: max-w-6xl container with 16→24px padding

Contained Type:
├─ Section wrapper: max-w-6xl with 16→24px padding
└─ Content inside: inherits parent spacing
```

---

## Implementation Rules

### Rule 1: Consistency
- **All sections use ONE of two patterns**: `section-inner-lg` OR `section-full-width-lg` + `section-container`
- **No custom padding values** on section wrappers
- **All spacing derived from Tailwind utilities**

### Rule 2: Responsive Design
- Mobile-first: Define padding at mobile breakpoint
- Scale up at `md:` breakpoint (768px)
- Left/right: 16px → 24px
- Top/bottom: 64px → 80px

### Rule 3: Full-Width vs Contained
- **Full-width sections**: Extend to viewport edges with colored backgrounds
- **Contained sections**: Max-width container with consistent padding
- **Never mix**: Choose one pattern, apply consistently

### Rule 4: Background Colors
- Full-width sections (HeroSection, CtaSection) need background color on wrapper
- Contained sections use white or neutral backgrounds
- Background color should extend to viewport edges (full-width only)

### Rule 5: Nested Content
- Section wrapper handles OUTER spacing (margins from other sections)
- Inner `.section-container` handles INNER spacing (content positioning)
- Cards, grids, items inside: NOT affected by these rules

---

## CSS Utilities Currently Defined

```css
.section-container {
  @apply mx-auto w-full max-w-6xl px-4 md:px-6;
  /* 16→24px horizontal, 1152px max-width */
}

.section-padding {
  @apply py-12 md:py-16;
  /* 48→64px vertical */
}

.section-padding-sm {
  @apply py-8 md:py-12;
  /* 32→48px vertical (compact) */
}

.section-padding-lg {
  @apply py-16 md:py-20;
  /* 64→80px vertical (prominent) */
}

.section-full-width-lg {
  @apply w-full section-padding-lg;
  /* 100% width + 64→80px vertical */
}

.section-inner-lg {
  @apply section-container section-padding-lg;
  /* max-w-6xl + 16→24px horizontal + 64→80px vertical */
}
```

---

## Visual Gap Between Sections

**Vertical Gap Calculation:**
- Bottom padding of Section A: 64→80px
- Top padding of Section B: 64→80px
- **Total visual gap between sections**: 128→160px
- This is the breathing room between major content blocks

**Result**: Clear visual separation without excessive whitespace

---

## Future Adjustments

If more spacing variants are needed:

1. **Extra tight** (py-6): 24→32px (for transitions)
2. **Tight** (py-8): 32→48px (current: section-padding-sm)
3. **Standard** (py-12): 48→64px (alternative)
4. **Regular** (py-16): 64→80px (current: section-padding-lg)
5. **Extra spacious** (py-24): 96→128px (for dramatic sections)

Can be added without changing existing sections.

---

## Validation Checklist

- [ ] All sections use `.section-inner-lg` OR `.section-full-width-lg` + `.section-container`
- [ ] No custom `px-*` or `py-*` values on section wrappers
- [ ] Mobile padding: 16px left/right (px-4), 64px top/bottom (py-16)
- [ ] Desktop padding: 24px left/right (md:px-6), 80px top/bottom (md:py-20)
- [ ] Full-width sections have background color extending to edges
- [ ] Contained sections respect max-w-6xl boundary
- [ ] Visual gap between sections is consistent (~128→160px vertical)
- [ ] All breakpoints use `md:` prefix (768px)

