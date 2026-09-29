import type { PortableTextBlock } from '@portabletext/types';

export type CtaSubtitlePlacement = 'above' | 'below';
export type CtaSubtitleHeadingLevel = 'h2' | 'h3';
export type SectionThemeValue =
  | 'white'
  | 'darkGreen'
  | 'cream'
  | 'oliveGreen'
  | 'blue'
  | 'darkBlue'
  | 'yellow';

type BaseSection = {
  _key?: string;
};

export type HeroSection = BaseSection & {
  _type: 'heroSection';
  title?: string;
  highlightText?: string;
  subtitle?: string;
  body?: PortableTextBlock[];
  bulletsTitle?: string;
  bullets?: string[];
  coupon?: {
    amount?: string;
    subheading?: string;
    description?: string;
    ctaTitle?: string;
    ctaLabel?: string;
    image?: {
      url?: string;
      alt?: string;
    };
  };
  ctaText?: string;
  ctaSubtitlePlacement?: CtaSubtitlePlacement;
  ctaSubtitleHeadingLevel?: CtaSubtitleHeadingLevel;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  layoutStyle?: 'oneColumn' | 'twoColumn';
  backgroundImage?: {
    url?: string;
    alt?: string;
    asset?: { _ref?: string; _id?: string; _type?: string; url?: string };
    crop?: { top: number; bottom: number; left: number; right: number };
    hotspot?: { x: number; y: number; height: number; width: number };
  };
  sideImage?: {
    url?: string;
    alt?: string;
    asset?: { _ref?: string; _id?: string; _type?: string; url?: string };
    crop?: { top: number; bottom: number; left: number; right: number };
    hotspot?: { x: number; y: number; height: number; width: number };
  };
  sideImageSize?: 'default' | 'large';
  sideSubtitle?: string;
  sideMapEmbed?: string;
};

export type ServiceGridSection = BaseSection & {
  _type: 'serviceGridSection';
  title: string;
  highlightText?: string;
  subtitle?: string;
  description?: string;
  alignment?: 'center' | 'left';
  secondaryTitle?: string;
  secondaryDescription?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  secondaryCtaSubtitle?: string;
  secondaryCtaSubtitlePlacement?: CtaSubtitlePlacement;
  secondaryCtaSubtitleHeadingLevel?: CtaSubtitleHeadingLevel;
  layoutStyle?: 'stacked' | 'twoColumn' | 'tLayout';
  items: Array<{
    label: string;
    name?: string;
    title?: string;
    description?: string;
    linkLabel?: string;
    linkUrl?: string;
    icon?: {
      url?: string;
      asset?: { url?: string };
    };
    iconUrl?: string;
  }>;
};

export type ProcessSection = BaseSection & {
  _type: 'processSection';
  title?: string;
  highlightText?: string;
  subtitle?: string;
  alignment?: 'center' | 'left';
  cardHeight?: 'default' | 'square' | 'taller';
  backgroundTheme?: SectionThemeValue;
  imagePlacement?: 'imageTop' | 'imageBottom';
  columns?: 2 | 3 | 4;
  ctaSubtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  steps: Array<{
    label: string;
    title?: string;
    titleHighlight?: string;
    subtitle?: string;
    description?: PortableTextBlock[];
    itemTitle?: string;
    itemDescription?: PortableTextBlock[];
    itemList?: string[];
    showDivider?: boolean;
    image?: {
      url?: string;
      alt?: string;
      asset?: { _ref?: string; _id?: string; _type?: string; url?: string };
      crop?: { top: number; bottom: number; left: number; right: number };
      hotspot?: { x: number; y: number; height: number; width: number };
    };
  }>;
};

export type CtaSection = BaseSection & {
  _type: 'ctaSection';
  eyebrow?: string;
  heading: string;
  highlightText?: string;
  body?: PortableTextBlock[];
  primaryButton?: {
    label?: string;
    link?: string;
    style?: 'primary' | 'secondary' | 'outline';
  };
  secondaryButton?: {
    label?: string;
    link?: string;
    style?: 'primary' | 'secondary' | 'outline';
  };
  ctaLabel?: string;
  ctaLink?: string;
  ctaSubtitle?: string;
  ctaSubtitlePlacement?: CtaSubtitlePlacement;
  ctaSubtitleHeadingLevel?: CtaSubtitleHeadingLevel;
  layoutStyle?: 'fullWidth' | 'boxed';
  layout?: 'stacked' | 'twoColumn';
  colorTheme?: SectionThemeValue;
};

export type ContactSection = BaseSection & {
  _type: 'contactSection';
  title?: string;
  highlightText?: string;
  subtitle?: string;
  locationTitle?: string;
  companyName?: string;
  address?: string;
  phone?: string;
  phoneLink?: string;
  email?: string;
  linksSubtitle?: string;
  linksColumns?: 1 | 2 | 3;
  linksSection?: Array<{
    label: string;
    url?: string;
  }>;
  mapEmbed?: string;
};

export type TwoColTextImageSection = BaseSection & {
  _type: 'twoColTextImageSection';
  title?: string;
  highlightText?: string;
  subtitle?: string;
  description?: PortableTextBlock[];
  bullets?: string[];
  ctaLabel?: string;
  ctaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  ctaSubtitle?: string;
  ctaSubtitlePlacement?: CtaSubtitlePlacement;
  ctaSubtitleHeadingLevel?: CtaSubtitleHeadingLevel;
  backgroundTheme?: SectionThemeValue;
  bulletTitle?: string;
  images?: Array<{
    url?: string;
    alt?: string;
  }>;
  image?: {
    url?: string;
    alt?: string;
  };
  imagePlacement?: 'imageLeft' | 'imageRight';
};

export type ServiceAreaSection = BaseSection & {
  _type: 'serviceAreaSection';
  title?: string;
  highlightText?: string;
  subtitle?: string;
  description?: string;
  communities: Array<{
    label: string;
    link?: string;
  }>;
  ctaLabel?: string;
  ctaLink?: string;
  ctaSubtitle?: string;
  ctaSubtitlePlacement?: CtaSubtitlePlacement;
  ctaSubtitleHeadingLevel?: CtaSubtitleHeadingLevel;
  mapEmbed?: string;
  image?: {
    url?: string;
    alt?: string;
    crop?: { top: number; bottom: number; left: number; right: number };
    hotspot?: { x: number; y: number; height: number; width: number };
    asset?: { url?: string };
  };
};

export type BlogListSection = BaseSection & {
  _type: 'blogListSection';
  title?: string;
  highlightText?: string;
  description?: string;
  filterCategory?: string;
  postsToShow?: number;
};

export type IconGridSection = BaseSection & {
  _type: 'iconGridSection';
  title?: string;
  highlightText?: string;
  subtitle?: string;
  description?: PortableTextBlock[];
  colorTheme?: SectionThemeValue;
  size?: 'small' | 'medium' | 'large';
  layout?: 'vertical' | 'horizontal';
  itemStyle?: 'flat' | 'card';
  columns?: number;
  ctaLabel?: string;
  ctaLink?: string;
  ctaSubtitle?: string;
  ctaSubtitlePlacement?: CtaSubtitlePlacement;
  ctaSubtitleHeadingLevel?: CtaSubtitleHeadingLevel;
  items: Array<{
    label: string;
    subtitle?: string;
    description?: string;
    benefits?: string[];
    ctaLabel?: string;
    ctaLink?: string;
    icon?: {
      url?: string;
      alt?: string;
      asset?: { url?: string };
    };
  }>;
};

export type LeadFormField = {
  _key?: string;
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkboxGroup';
  required?: boolean;
  width?: 'full' | 'half';
  rows?: number;
  options?: Array<{
    _key?: string;
    label: string;
    value: string;
  }>;
};

export type LeadFormSection = BaseSection & {
  _type: 'leadFormSection';
  title?: string;
  subtitle?: string;
  body?: PortableTextBlock[];
  logo?: {
    url?: string;
    alt?: string;
  };
  backgroundTheme?: SectionThemeValue;
  alignment?: 'center' | 'left';
  formAction?: string;
  successMessage?: string;
  errorMessage?: string;
  fields: LeadFormField[];
};

export type HtmlSection = BaseSection & {
  _type: 'htmlSection';
  title?: string;
  subtitle?: string;
  htmlContent?: string;
};

export type FaqSection = BaseSection & {
  _type: 'faqSection';
  title?: string;
  layoutVariant?: 'single' | 'twoColumn';
  textAlignment?: 'center' | 'left';
  colorTheme?: SectionThemeValue;
  heading?: string;
  description?: string;
  faqs?: Array<{
    _key?: string;
    question?: string;
    answer?: string;
  }>;
  bottomText?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

export type AreasSection = BaseSection & {
  _type: 'areasSection';
  title?: string;
  description?: string;
  theme?: SectionThemeValue;
  stateGroups?: Array<{
    _key?: string;
    stateTitle?: string;
    areas?: Array<{
      _key?: string;
      cityName: string;
      link?: string;
    }>;
  }>;
};

export type StepsSection = BaseSection & {
  _type: 'stepsSection';
  title?: string;
  subtitle?: string;
  theme?: SectionThemeValue;
  steps?: Array<{
    _key?: string;
    stepLabel?: string;
    title: string;
    description?: string;
    bullets?: string[];
    image?: {
      url?: string;
      alt?: string;
      asset?: { _ref?: string; _id?: string; _type?: string; url?: string };
      crop?: { top: number; bottom: number; left: number; right: number };
      hotspot?: { x: number; y: number; height: number; width: number };
    };
    imagePosition?: 'left' | 'right';
  }>;
};

export type Sections =
  | HeroSection
  | ServiceGridSection
  | ProcessSection
  | CtaSection
  | ContactSection
  | ServiceAreaSection
  | BlogListSection
  | IconGridSection
  | TwoColTextImageSection
  | LeadFormSection
  | HtmlSection
  | FaqSection
  | AreasSection
  | StepsSection;
