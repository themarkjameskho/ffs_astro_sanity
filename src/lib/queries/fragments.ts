import groq from 'groq';

/**
 * GROQ Fragments for Sanity queries
 * Reduces duplication and improves query performance
 */

// Image fragment
export const IMAGE_FRAGMENT = groq`
  {
    alt,
    crop,
    hotspot,
    asset,
    "url": asset->url
  }
`;

// Icon fragment
export const ICON_FRAGMENT = groq`
  {
    alt,
    "url": asset->url
  }
`;

// Coupon fragment (HeroSection)
export const COUPON_FRAGMENT = groq`
  {
    amount,
    subheading,
    description,
    ctaTitle,
    ctaLabel,
    image ${IMAGE_FRAGMENT}
  }
`;

// Service item fragment (ServiceGridSection)
export const SERVICE_ITEM_FRAGMENT = groq`
  {
    label,
    name,
    title,
    description,
    linkLabel,
    linkUrl,
    icon ${ICON_FRAGMENT}
  }
`;

// Process step fragment (ProcessSection)
export const PROCESS_STEP_FRAGMENT = groq`
  {
    label,
    title,
    titleHighlight,
    subtitle,
    description,
    showDivider,
    itemTitle,
    itemDescription,
    itemList,
    image{
      alt,
      crop,
      hotspot,
      asset,
      "url": asset->url
    }
  }
`;

// Form field fragment (LeadFormSection)
export const FORM_FIELD_FRAGMENT = groq`
  {
    _key,
    name,
    label,
    placeholder,
    type,
    required,
    width,
    rows,
    options[]{
      _key,
      label,
      value
    }
  }
`;

// Community fragment (ServiceAreaSection)
export const COMMUNITY_FRAGMENT = groq`
  {
    label,
    link
  }
`;

// Link fragment (ContactSection)
export const LINK_FRAGMENT = groq`
  {
    label,
    url
  }
`;

// Icon grid item fragment (IconGridSection)
export const ICON_GRID_ITEM_FRAGMENT = groq`
  {
    label,
    subtitle,
    description,
    benefits,
    ctaLabel,
    ctaLink,
    icon ${ICON_FRAGMENT}
  }
`;
