import { LuGrid2X2 } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const serviceGridSection = defineType({
  name: 'serviceGridSection',
  title: 'Service Grid Section',
  type: 'object',
  description: 'Multi-column list of core services with optional secondary CTA row.',
  icon: LuGrid2X2,
  fieldsets: [
    {
      name: 'secondaryCta',
      title: 'Secondary CTA Settings',
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Primary heading displayed above the grid.',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Optional word or phrase within the title that uses the highlight color.'
    }),
    defineField({
      name: 'subtitle',
      title: 'Section Subtitle',
      type: 'text',
      description: 'Short blurb supporting the section title.'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Longer copy that sits beneath the subtitle.'
    }),
    defineField({
      name: 'alignment',
      title: 'Content Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Centered', value: 'center' },
          { title: 'Left Aligned', value: 'left' }
        ],
        layout: 'radio'
      },
      initialValue: 'center',
      description: 'Controls headline, subtitle, and CTA alignment.'
    }),
    defineField({
      name: 'secondaryTitle',
      title: 'Secondary Title (T layout)',
      type: 'string',
      description: 'Shown only on the T layout when a column needs its own heading.'
    }),
    defineField({
      name: 'secondaryDescription',
      title: 'Secondary Description (T layout)',
      type: 'text',
      description: 'Optional copy block for the vertical leg of the T layout.'
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Secondary CTA Label',
      type: 'string',
      fieldset: 'secondaryCta'
    }),
    defineField({
      name: 'secondaryCtaLink',
      title: 'Secondary CTA Link',
      type: 'string',
      description: 'Accepts absolute URLs or tel: links',
      fieldset: 'secondaryCta'
    }),
    defineField({
      name: 'secondaryCtaSubtitle',
      title: 'Secondary CTA Subtitle',
      type: 'string',
      description: 'Helper line above or below the secondary CTA.',
      fieldset: 'secondaryCta'
    }),
    defineField({
      name: 'secondaryCtaSubtitlePlacement',
      title: 'Secondary CTA Subtitle Placement',
      type: 'string',
      options: {
        list: [
          { title: 'Above Button', value: 'above' },
          { title: 'Below Button', value: 'below' }
        ],
        layout: 'radio'
      },
      initialValue: 'below',
      fieldset: 'secondaryCta'
    }),
    defineField({
      name: 'secondaryCtaSubtitleHeadingLevel',
      title: 'Secondary CTA Subtitle Heading Level',
      type: 'string',
      options: {
        list: [
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' }
        ],
        layout: 'radio'
      },
      initialValue: 'h3',
      fieldset: 'secondaryCta'
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      description: 'Each card represents a service with optional icon and deep-link.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceItem',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Card title (ex: “Heat Treatment”).',
              validation: (Rule) => Rule.required()
            }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'image',
              description:
                '✂️ Icons render at 1:1 (square). If your source artwork is NOT square, click the image after upload → use the crop tool to draw a square crop and set the hotspot — Sanity will deliver it cropped to 1:1 to the site. Recommended source: 256×256+ px transparent PNG or SVG.',
              options: { hotspot: true }
            }),
            defineField({ name: 'linkLabel', title: 'Link Label', type: 'string' }),
            defineField({
              name: 'linkUrl',
              title: 'Link URL',
              description: 'Accepts relative paths like /pest-control/ant-control/.',
              type: 'string'
            })
          ],
          preview: { select: { title: 'label', media: 'icon' } }
        })
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'layoutStyle',
      title: 'Layout Style',
      type: 'string',
      options: {
        list: [
          { title: 'Stacked', value: 'stacked' },
          { title: 'Two Column', value: 'twoColumn' },
          { title: 'Three Column T Layout', value: 'tLayout' }
        ]
      },
      initialValue: 'stacked',
      description: 'Determines the desktop grid layout. T layout unlocks the secondary content fields.'
    })
  ],
  preview: {
    select: { title: 'title', layoutStyle: 'layoutStyle' },
    prepare: ({ title, layoutStyle }: { title?: string; layoutStyle?: string }) => ({
      title: title ?? 'Service Grid Section',
      subtitle: layoutStyle
        ? `Service Grid Section · ${layoutStyle}`
        : 'Service Grid Section',
      media: LuGrid2X2
    })
  }
});
