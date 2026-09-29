import groq from 'groq';
import { getSanityClient } from '../sanityClient';
import type { Sections } from '../../types/sections';
import {
  SERVICE_ITEM_FRAGMENT,
  PROCESS_STEP_FRAGMENT,
  IMAGE_FRAGMENT,
  COUPON_FRAGMENT,
  COMMUNITY_FRAGMENT,
  LINK_FRAGMENT,
  ICON_GRID_ITEM_FRAGMENT,
  FORM_FIELD_FRAGMENT,
  ICON_FRAGMENT
} from './fragments';

export type PagePayload = {
  title: string;
  description?: string;
  seo?: {
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
  };
  sections: Sections[];
};

const PAGE_BY_TYPE_QUERY = groq`
  *[_type == "page" && pageType == $pageType][0]{
    title,
    "seo": {
      "seoTitle": seo.seoTitle,
      "seoDescription": seo.seoDescription,
      "canonicalUrl": seo.canonicalUrl
    },
    sections[]{
      _type,
      _key,
      ...,
      _type == "heroSection" => {
        title,
        highlightText,
        subtitle,
        body,
        bulletsTitle,
        bullets,
        coupon ${COUPON_FRAGMENT},
        ctaText,
        ctaSubtitlePlacement,
        ctaSubtitleHeadingLevel,
        primaryCtaLabel,
        primaryCtaLink,
        secondaryCtaLabel,
        secondaryCtaLink,
        layoutStyle,
        backgroundImage ${IMAGE_FRAGMENT},
        sideImage ${IMAGE_FRAGMENT},
        sideImageSize,
        sideSubtitle,
        sideMapEmbed
      },
      _type == "serviceGridSection" => {
        title,
        highlightText,
        subtitle,
        description,
        alignment,
        secondaryTitle,
        secondaryDescription,
        secondaryCtaLabel,
        secondaryCtaLink,
        secondaryCtaSubtitle,
        secondaryCtaSubtitlePlacement,
        secondaryCtaSubtitleHeadingLevel,
        layoutStyle,
        items[] ${SERVICE_ITEM_FRAGMENT}
      },
      _type == "processSection" => {
        title,
        highlightText,
        subtitle,
        alignment,
        cardHeight,
        backgroundTheme,
        imagePlacement,
        columns,
        ctaSubtitle,
        ctaLabel,
        ctaLink,
        steps[] ${PROCESS_STEP_FRAGMENT}
      },
      _type == "ctaSection" => {
        eyebrow,
        heading,
        highlightText,
        body,
        primaryButton{
          label,
          link,
          style
        },
        secondaryButton{
          label,
          link,
          style
        },
        ctaLabel,
        ctaLink,
        ctaSubtitle,
        ctaSubtitlePlacement,
        ctaSubtitleHeadingLevel,
        layoutStyle,
        layout,
        colorTheme
      },
      _type == "contactSection" => {
        title,
        highlightText,
        subtitle,
        locationTitle,
        companyName,
        address,
        phone,
        phoneLink,
        email,
        linksSubtitle,
        linksColumns,
        linksSection[] ${LINK_FRAGMENT},
        mapEmbed
      },
      _type == "twoColTextImageSection" => {
        title,
        highlightText,
        subtitle,
        description,
        bullets,
        ctaLabel,
        ctaLink,
        secondaryCtaLabel,
        secondaryCtaLink,
        ctaSubtitle,
        ctaSubtitlePlacement,
        ctaSubtitleHeadingLevel,
        backgroundTheme,
        bulletTitle,
        images[] ${IMAGE_FRAGMENT},
        image ${IMAGE_FRAGMENT},
        imagePlacement
      },
      _type == "serviceAreaSection" => {
        title,
        highlightText,
        subtitle,
        description,
        communities[] ${COMMUNITY_FRAGMENT},
        ctaLabel,
        ctaLink,
        ctaSubtitle,
        ctaSubtitlePlacement,
        ctaSubtitleHeadingLevel,
        mapEmbed,
        image ${IMAGE_FRAGMENT}
      },
      _type == "blogListSection" => {
        title,
        highlightText,
        description,
        filterCategory,
        postsToShow
      },
      _type == "iconGridSection" => {
        title,
        highlightText,
        subtitle,
        description,
        colorTheme,
        size,
        layout,
        itemStyle,
        columns,
        ctaLabel,
        ctaLink,
        ctaSubtitle,
        ctaSubtitlePlacement,
        ctaSubtitleHeadingLevel,
        items[] ${ICON_GRID_ITEM_FRAGMENT}
      },
      _type == "leadFormSection" => {
        title,
        subtitle,
        body,
        logo ${IMAGE_FRAGMENT},
        backgroundTheme,
        alignment,
        formAction,
        successMessage,
        errorMessage,
        fields[] ${FORM_FIELD_FRAGMENT}
      },
      _type == "faqSection" => {
        title,
        layoutVariant,
        textAlignment,
        colorTheme,
        heading,
        description,
        faqs[]{
          _key,
          question,
          answer
        },
        bottomText,
        buttonLabel,
        buttonLink
      },
      _type == "areasSection" => {
        title,
        description,
        theme,
        stateGroups[]{
          _key,
          stateTitle,
          areas[]{
            _key,
            cityName,
            link
          }
        }
      },
      _type == "stepsSection" => {
        title,
        subtitle,
        theme,
        steps[]{
          _key,
          stepLabel,
          title,
          description,
          bullets,
          image ${IMAGE_FRAGMENT},
          imagePosition
        }
      }
    }
  }
`;

export async function fetchPageByType(pageType: string) {
  const client = getSanityClient();
  if (!client) {
    return null;
  }

  try {
    return await client.fetch<PagePayload | null>(PAGE_BY_TYPE_QUERY, { pageType });
  } catch (error) {
    console.warn('Failed to fetch page from Sanity', error);
    return null;
  }
}
