import { LuMapPin } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const serviceAreaSection = defineType({
  name: 'serviceAreaSection',
  title: 'Service Area Section',
  type: 'object',
  description: 'Lists coverage areas, links to dedicated service pages, and includes a CTA/map embed.',
  icon: LuMapPin,
  fieldsets: [
    {
      name: 'cta',
      title: 'CTA Settings',
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Heading shown above the coverage list.'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Optional highlighted word or phrase.'
    }),
    defineField({
      name: 'subtitle',
      title: 'Section Subtitle',
      type: 'string',
      description: 'Helper line explaining the coverage promise.'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Longer description for SEO/context.'
    }),
    defineField({
      name: 'communities',
      title: 'Communities',
      type: 'array',
      description: 'Each entry renders as a linked badge or list item.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'community',
          fields: [
            defineField({ name: 'label', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'link',
              title: 'Internal Link / URL',
              type: 'string',
              description: 'Optional slug or full URL for the service area detail page.'
            })
          ]
        })
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      description: 'Button label displayed below the service area list.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      description: 'Accepts absolute URLs or tel: links.',
      type: 'string',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaSubtitle',
      title: 'CTA Subtitle',
      type: 'string',
      description: 'Helper line that follows the banner alignment rules.',
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
      initialValue: 'below',
      description: 'Matches button alignment settings set elsewhere.',
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
      description: 'Only switch to H2 when the surrounding sections use higher headings.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'mapEmbed',
      title: 'Map Embed URL',
      type: 'url',
      description: 'Optional Google Maps embed URL (use the share > embed link).'
    }),
    defineField({
      name: 'image',
      title: 'Side Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Fallback visual shown when no map is provided.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for accessibility'
        })
      ]
    })
  ],
  preview: {
    select: { title: 'title', firstCommunity: 'communities.0' },
    prepare: ({ title, firstCommunity }: { title?: string; firstCommunity?: string }) => ({
      title: title ?? 'Service Area Section',
      subtitle: firstCommunity ? `Service Area Section · ${firstCommunity}` : 'Service Area Section',
      media: LuMapPin
    })
  }
});
