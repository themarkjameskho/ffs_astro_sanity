import { LuSparkles } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  description: 'Above-the-fold hero that supports one- or two-column layouts, coupon callouts, and dual CTAs.',
  icon: LuSparkles,
  fieldsets: [
    {
      name: 'bullets',
      title: 'Bullets',
      options: { collapsible: true, collapsed: true }
    },
    {
      name: 'cta',
      title: 'CTA Settings',
      options: { collapsible: true, collapsed: true }
    },
    {
      name: 'secondaryCta',
      title: 'Secondary CTA Settings',
      options: { collapsible: true, collapsed: true }
    },
    {
      name: 'rightColumn',
      title: 'Right Column (Image / Map / Frame)',
      options: { collapsible: true, collapsed: true }
    },
    {
      name: 'layout',
      title: 'Layout & Background',
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title (Optional)',
      type: 'string',
      description: 'Main hero headline. Pair with Highlighted Text to emphasize key phrases.'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Portion of the title that inherits the section highlight color.'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 3,
      description: 'Short supporting copy shown under the title.'
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      description: 'Optional rich text that renders after the subtitle. Keep paragraphs short for scannability.'
    }),
    defineField({
      name: 'bulletsTitle',
      title: 'Bullets Title (Optional)',
      type: 'string',
      description: 'Optional heading shown above the bullet list (ex: "Why us:").',
      fieldset: 'bullets'
    }),
    defineField({
      name: 'bullets',
      title: 'Bullets',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Quick-hit value props displayed with check icons.',
      validation: (Rule) => Rule.max(8),
      fieldset: 'bullets'
    }),
    defineField({
      name: 'coupon',
      title: 'Coupon',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'ctaTitle',
          title: 'Coupon Title',
          type: 'string',
          description: 'Name of the coupon shown inside the redeem modal (ex: "Initial Service").'
        }),
        defineField({
          name: 'amount',
          title: 'Amount / Lead-in',
          type: 'string',
          description: 'Shown above the coupon image (ex: "$50 OFF"). Requires an image upload.',
          validation: (Rule) => Rule.custom((value, context) => {
            const parent = context.parent as { image?: unknown } | undefined;
            const hasImage = Boolean(parent?.image);
            if (value && !hasImage) {
              return 'Upload the coupon image when providing an amount.';
            }
            return true;
          })
        }),
        defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'string' }),
        defineField({ name: 'ctaLabel', title: 'Coupon CTA Label', type: 'string' }),
        defineField({
          name: 'image',
          title: 'Coupon Image',
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string' })]
        })
      ]
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Subtitle',
      type: 'string',
      description: 'Optional supporting line that sits above or below the CTA button.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaSubtitlePlacement',
      title: 'CTA Subtitle Placement',
      type: 'string',
      options: {
        list: [
          { title: 'Above Button', value: 'above' },
          { title: 'Below Button', value: 'below' }
        ],
        layout: 'radio'
      },
      initialValue: 'above',
      description: 'Controls whether the subtitle hugs the button or leads the CTA block.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaSubtitleHeadingLevel',
      title: 'CTA Subtitle Heading Level',
      type: 'string',
      options: {
        list: [
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' }
        ],
        layout: 'radio'
      },
      initialValue: 'h3',
      description: 'Pick the semantic heading for the CTA subtitle to maintain page hierarchy.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'Primary CTA Label',
      type: 'string',
      description: 'Visible button text (ex: “Schedule Service”).',
      fieldset: 'cta'
    }),
    defineField({
      name: 'primaryCtaLink',
      title: 'Primary CTA Link',
      description: 'Accepts absolute URLs, mailto:, or tel: links.',
      type: 'string',
      fieldset: 'cta'
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Secondary CTA Label',
      type: 'string',
      description: 'Optional second button for alternate contact methods.',
      fieldset: 'secondaryCta'
    }),
    defineField({
      name: 'secondaryCtaLink',
      title: 'Secondary CTA Link',
      description: 'Accepts absolute URLs, mailto:, or tel: links.',
      type: 'string',
      fieldset: 'secondaryCta'
    }),
    defineField({
      name: 'sideImage',
      title: 'Right Column Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Photo or accreditation graphic displayed when using the two column layout.',
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() })],
      fieldset: 'rightColumn'
    }),
    defineField({
      name: 'sideImageSize',
      title: 'Right Column Image Size',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Large (+200px)', value: 'large' }
        ],
        layout: 'radio'
      },
      initialValue: 'default',
      description: 'Choose the display size for the right column image.',
      fieldset: 'rightColumn'
    }),
    defineField({
      name: 'sideImageFrame',
      title: 'Right Column Frame Style',
      type: 'string',
      options: {
        list: [
          { title: 'Bento card (with "What we do" labels)', value: 'card' },
          { title: 'Bordered (thin red border, no labels, image fills frame)', value: 'bordered' },
          { title: 'Plain (clean rounded image, no border, no labels)', value: 'plain' }
        ],
        layout: 'radio'
      },
      initialValue: 'bordered',
      description: 'Pick how the right-column image is framed. Use Bordered for service-area pages (clean map/photo with a thin red brand border), Bento for marketing pages with the labeled card treatment, Plain for a quiet image with no chrome.',
      fieldset: 'rightColumn'
    }),
    defineField({
      name: 'sideSubtitle',
      title: 'Right Column Subtitle',
      type: 'string',
      description: 'Short blurb for the right column (ex: “EPA Registered Heat Treatments”).',
      fieldset: 'rightColumn'
    }),
    defineField({
      name: 'sideMapEmbed',
      title: 'Right Column Map Embed',
      description: 'Paste the complete iframe tag from Google Maps (starts with <iframe src=).',
      type: 'text',
      rows: 2,
      fieldset: 'rightColumn'
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-bleed background hero image. Always include descriptive alt text.',
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() })]
    }),
    defineField({
      name: 'layoutStyle',
      title: 'Layout Style',
      type: 'string',
      options: {
        list: [
          { title: 'One Column', value: 'oneColumn' },
          { title: 'Two Column', value: 'twoColumn' }
        ],
        layout: 'radio'
      },
      initialValue: 'twoColumn',
      description: 'One column centers everything, two column keeps text left with supporting media on the right.',
      fieldset: 'layout'
    })
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', layoutStyle: 'layoutStyle' },
    prepare: ({ title, subtitle, layoutStyle }: { title?: string; subtitle?: string; layoutStyle?: string }) => {
      const layout = layoutStyle ?? 'oneColumn';
      const subtitlePieces = [`Hero Section · ${layout}`];
      if (subtitle) subtitlePieces.push(subtitle);
      return {
        title: title ?? 'Hero Section',
        subtitle: subtitlePieces.join(' · '),
        media: LuSparkles
      };
    }
  }
});
