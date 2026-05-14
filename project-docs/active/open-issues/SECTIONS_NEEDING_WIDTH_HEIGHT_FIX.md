# Sections Needing Width/Height Fixes & Explanations

## 📋 Summary

Found **3 main areas** that need width/height attributes added to fix **CLS (Cumulative Layout Shift)**.

---

## 🎯 What is Preconnect? (SIMPLE EXPLANATION)

**Normal browser loading:**
```
1. Browser gets HTML
2. Sees "load this from Google Fonts"
3. Connects to Google Fonts server (SLOW - takes 200ms)
4. Downloads font (starts here)
```

**With preconnect (faster):**
```
1. Browser gets HTML
2. Browser immediately connects to Google Fonts (in parallel)
3. When it needs the font, connection already exists (SKIP step 3!)
4. Font downloads instantly
```

**It's like calling a taxi company while you're putting on your shoes, so the taxi arrives when you're ready!**

---

## 🔴 AREA 1: Coupon Card Image (HeroSection)

**File:** `src/components/sections/HeroSection.astro` (Lines 102-108)

**Current Code:**
```astro
<img
  src={optimizeImageUrl(couponData.image.url, { width: 220, height: 220, fit: 'scale' })}
  alt={couponData.image.alt ?? ''}
  class="coupon-card__image"
  loading="lazy"
/>
```

**Problem:** PageSpeed reported: `Image elements do not have explicit width and height`

**Fix Required:** Add `width` and `height` attributes
```astro
<img
  src={optimizeImageUrl(couponData.image.url, { width: 220, height: 220, fit: 'scale' })}
  alt={couponData.image.alt ?? ''}
  class="coupon-card__image"
  width={220}
  height={220}
  loading="lazy"
/>
```

**Why:** The browser reserves space for the image, preventing layout shift when image loads late.

---

## 🔴 AREA 2: Service Grid Icons (ServiceGridSection)

**File:** `src/components/sections/ServiceGridSection.astro` (Lines 68-77, 144-153, 228+)

**Current Code (appears 3 times):**
```astro
<img
  src={getIconUrl(iconUrl, 40)}
  alt={itemLabel}
  class="h-11 w-11 sm:h-14 sm:w-14 object-contain transition duration-200 ease-out group-hover:scale-[1.08]"
  loading="lazy"
  decoding="async"
/>
```

**Problem:** Missing width/height attributes

**Fix Required:** Add explicit dimensions (use smallest size from responsive classes)
```astro
<img
  src={getIconUrl(iconUrl, 40)}
  alt={itemLabel}
  width={40}
  height={40}
  class="h-11 w-11 sm:h-14 sm:w-14 object-contain transition duration-200 ease-out group-hover:scale-[1.08]"
  loading="lazy"
  decoding="async"
/>
```

**Why:** Icons scale with CSS (`h-11 w-11`, `sm:h-14 sm:w-14`) but browser needs base dimensions for layout calculation.

---

## 🟡 AREA 3: Two Column Text Image Section (TwoColTextImageSection)

**File:** `src/components/sections/TwoColTextImageSection.astro` (Lines 202-217)

**Current Code:**
```astro
<img
  src={optimizeImageUrl(image.url, {
    width: 800,
    quality: 85,
    format: "webp",
  })}
  srcset={...}
  sizes="(max-width: 768px) 100vw, 50vw"
  alt={image.alt ?? props.title}
  class="absolute inset-0 h-full w-full object-cover object-center"
  loading="lazy"
  decoding="async"
/>
```

**Problem:** 
- `w-full` and `h-full` make width dynamic
- Missing explicit width/height means browser can't calculate space early

**Fix Required:** Add aspect-ratio to parent container
```astro
<div class="absolute inset-0 aspect-square sm:aspect-video">
  <img
    src={optimizeImageUrl(image.url, {
      width: 800,
      quality: 85,
      format: "webp",
    })}
    srcset={...}
    sizes="(max-width: 768px) 100vw, 50vw"
    alt={image.alt ?? props.title}
    width={800}
    height={600}
    class="h-full w-full object-cover object-center"
    loading="lazy"
    decoding="async"
  />
</div>
```

OR simpler approach (CSS only):
```css
/* Add to your CSS for TwoColTextImageSection images */
.two-col-image-gallery img {
  aspect-ratio: 4 / 3;
  height: auto;
}
```

---

## 📸 Why These Fixes Matter

**Before fixes (Current):**
```
1. Page loads
2. Browser renders text/layout WITHOUT knowing image size
3. Image arrives → "Oh, image is 800px wide!" 
4. Layout shifts to make room → USER SEES JANK ❌
5. CLS Score = BAD
```

**After fixes:**
```
1. Page loads
2. Browser sees "Image is 800x600" in HTML
3. Browser reserves 800x600 space before image arrives
4. Image arrives → fits perfectly, no shift ✅
5. CLS Score = GOOD
```

---

## 🚀 Quick Reference

| Section | File | Line | Issue | Fix |
|---------|------|------|-------|-----|
| Coupon Card | HeroSection.astro | 102 | `<img>` missing width/height | Add `width={220} height={220}` |
| Service Icons | ServiceGridSection.astro | 71, 150, 231 | `<img>` missing width/height | Add `width={40} height={40}` |
| Two Col Images | TwoColTextImageSection.astro | 202 | Dynamic size | Add `width={800} height={600}` + aspect-ratio CSS |

---

## ✅ Implementation Order

1. **Coupon card** (5 min) - Easiest fix
2. **Service icons** (10 min) - Repeat fix in 3 places
3. **Two col images** (15 min) - Most complex, test on mobile

**Total time:** ~30 minutes for +5 PageSpeed points!

---

## 🧪 How to Test

After making changes:
```bash
npm run build
npm run preview
# Visit http://localhost:3000 on mobile
# Watch images load - should have NO JANK/SHIFT
```

Then re-run PageSpeed Insights to see score improve.
