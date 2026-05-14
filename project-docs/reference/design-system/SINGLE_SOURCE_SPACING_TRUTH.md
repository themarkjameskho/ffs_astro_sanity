# Single Source of Truth for Section Spacing

## Current Architecture

```
┌─────────────────────────────────────────────────┐
│          MainLayout.astro                       │
│  (Header + Navigation - LOCKED, don't modify)   │
├─────────────────────────────────────────────────┤
│  <main class="w-full">                          │
│    <slot />                                     │
│    ↓ (Renders SectionRenderer)                  │
│    ↓                                            │
│    Section 1                                    │
│    Section 2                                    │
│    Section 3                                    │
│    ...                                          │
│  </main>                                        │
├─────────────────────────────────────────────────┤
│          Footer (LOCKED)                        │
└─────────────────────────────────────────────────┘
```

---

## Where Spacing Lives TODAY

### 1. **Global CSS** (`src/styles/global.css`)
✅ **THIS SHOULD BE THE ONLY SOURCE OF TRUTH**

Contains all utility class definitions:
```css
.section-container { @apply mx-auto w-full max-w-6xl px-4 md:px-6; }
.section-padding { @apply py-12 md:py-16; }
.section-padding-lg { @apply py-16 md:py-20; }
.section-inner-lg { @apply section-container section-padding-lg; }
.section-full-width-lg { @apply w-full section-padding-lg; }
```

### 2. **Individual Section Components** (`src/components/sections/*.astro`)
✅ **THESE APPLY THE UTILITIES**

Each section uses the utilities defined in global.css:
```astro
<section class="section-inner-lg">
  <!-- content -->
</section>
```

### 3. **SectionRenderer.astro**
✅ **SIMPLIFIED - NO WRAPPER PADDING**

Currently just renders sections without adding any padding wrapper:
```astro
<Component {...section} pageSlug={pageSlug} />
```

### 4. **MainLayout.astro**
✅ **CORRECT - NO SECTION SPACING HERE**

The `<main class="w-full">` has NO padding - it correctly lets sections handle their own spacing:
```astro
<main class="w-full">
  <slot />
</main>
```

---

## The Answer: ✅ GLOBAL CSS IS THE SINGLE SOURCE OF TRUTH

### Where It SHOULD Be (Correct):
```
Global CSS (.section-inner-lg, .section-padding-lg, etc.)
    ↓
Individual Sections apply these utilities via class names
```

### Where It Should NOT Be:
- ❌ MainLayout: NO padding/margin around `<slot>` (CORRECT ✅)
- ❌ SectionRenderer: NO wrapper divs with padding (CORRECT ✅)
- ❌ Individual sections: They don't define custom `px-*` or `py-*` (CORRECT ✅)

---

## Current State: ALL CORRECT ✅

| Component | Current | Should Be | Status |
|---|---|---|---|
| **Global CSS** | Defines all spacing utilities | Single source of truth | ✅ CORRECT |
| **SectionRenderer** | Just renders components | No wrapper padding | ✅ CORRECT |
| **MainLayout** | `<main class="w-full">` | No padding | ✅ CORRECT |
| **Section Components** | Apply utility classes | Use global utilities | ✅ CORRECT |

---

## Data Flow

```
Sanity CMS
    ↓
Page Data (sections array)
    ↓
[...slug].astro
    ↓
MainLayout.astro
    ├─ Header (locked)
    ├─ <main class="w-full">
    │  └─ <SectionRenderer>
    │     └─ Each Section Component
    │        ├─ Applies: class="section-inner-lg"
    │        │           (from global.css)
    │        └─ Which means:
    │           - max-w-6xl
    │           - px-4 md:px-6 (16→24px left/right)
    │           - py-16 md:py-20 (64→80px top/bottom)
    │
    └─ Footer (locked)
```

---

## Summary

### Single Source of Truth: **Global CSS**

All section spacing is controlled from ONE place:
```
src/styles/global.css
  └─ .section-inner-lg
  └─ .section-full-width-lg
  └─ .section-container
  └─ .section-padding-lg
  └─ etc.
```

### Why This Works:
1. **One definition** = One place to change
2. **Applied via utilities** = Easy to see what each section uses
3. **Responsive scales** = Defined in global CSS (py-16 md:py-20)
4. **No conflicts** = MainLayout doesn't add padding, SectionRenderer doesn't wrap, sections just apply the class

### How to Maintain It:
- ✅ All spacing changes go to `src/styles/global.css`
- ✅ All sections use class names like `section-inner-lg`
- ✅ Never add custom `px-*` or `py-*` to section wrappers
- ✅ If spacing needs to change, update ONE utility class

---

## Answer to Your Question

> "Which one hold the overall margin and padding per section? main layout or section render or global? it needs to be just one right?"

**ANSWER: Global CSS**

It IS the only one. And the current implementation is already correct:
- Global CSS: Defines utilities ✅
- Sections: Apply utilities ✅
- SectionRenderer: No padding ✅
- MainLayout: No section padding ✅

No changes needed. The architecture is already following best practices.

