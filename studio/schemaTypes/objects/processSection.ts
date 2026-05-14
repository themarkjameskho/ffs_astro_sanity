import { LuImage } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const processSection = defineType({
  name: 'processSection',
  title: 'Image Card Section',
  type: 'object',
  description: 'Flexible image cards that support multiple column counts, alignment rules, and CTA follow-up.',
  icon: LuImage,
  fieldsets: [
    {
      name: 'cta',
      title: 'CTA Settings',
      options: { collapsible: true, collapsed: true }
    },
    {
      name: 'sectionSettings',
      title: 'Section Settings',
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Heading shown above the image cards.'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Word or phrase from the title that should inherit the highlight color.'
    }),
    defineField({
      name: 'subtitle',
      title: 'Section Subtitle',
      type: 'text',
      description: 'Optional intro copy. Keep it short for best balance with the cards.'
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
      description: 'Aligns the section heading, subtitle, and CTA.',
      fieldset: 'sectionSettings'
    }),
    defineField({
      name: 'cardHeight',
      title: 'Card Image Height',
      type: 'string',
      options: {
        list: [
          { title: 'Default (16:9)', value: 'default' },
          { title: 'Square (Medium)', value: 'square' },
          { title: 'Taller (3:4)', value: 'taller' }
        ],
        layout: 'radio'
      },
      initialValue: 'default',
      description: 'Controls the image crop ratio (16:9 default, square medium, 3:4 taller).',
      fieldset: 'sectionSettings'
    }),
    defineField({
      name: 'backgroundTheme',
      title: 'Section Background Theme',
      type: 'string',
      options: {
        list: [
          { title: 'White', value: 'white' },
          { title: 'Dark Green', value: 'darkGreen' },
          { title: 'Cream', value: 'cream' },
          { title: 'Olive Green', value: 'oliveGreen' }
        ],
        layout: 'radio'
      },
      initialValue: 'darkGreen',
      description: 'Controls automatic text/highlight colors based on the chosen brand palette.',
      fieldset: 'sectionSettings'
    }),
    defineField({
      name: 'imagePlacement',
      title: 'Image Placement',
      type: 'string',
      options: {
        list: [
          { title: 'Image Above Text', value: 'imageTop' },
          { title: 'Image Below Text', value: 'imageBottom' }
        ],
        layout: 'radio'
      },
      initialValue: 'imageTop',
      description: 'Switch to “Image Below” when you want the copy to lead on mobile.',
      fieldset: 'sectionSettings'
    }),
    defineField({
      name: 'columns',
      title: 'Number of Columns',
      type: 'number',
      options: {
        list: [
          { title: '2 Columns', value: 2 },
          { title: '3 Columns', value: 3 },
          { title: '4 Columns', value: 4 }
        ]
      },
      initialValue: 3,
      description: 'Desktop-only column count. Mobile automatically stacks cards.',
      fieldset: 'sectionSettings'
    }),
    defineField({
      name: 'steps',
      title: 'Cards',
      type: 'array',
      description: 'Each card can showcase a service, process step, or testimonial.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStep',
          fieldsets: [
            {
              name: 'bulletItems',
              title: 'Bullet Items',
              options: { collapsible: true, collapsed: true }
            }
          ],
          fields: [
            defineField({
              name: 'label',
              title: 'Card Title',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({ name: 'titleHighlight', title: 'Title Highlight', type: 'string' }),
            defineField({ name: 'subtitle', title: 'Card Subtitle', type: 'string' }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'array',
              of: [defineArrayMember({ type: 'block' })],
              description: 'Rich text content. Stick to one short paragraph.'
            }),
            defineField({
              name: 'showDivider',
              title: 'Divider',
              type: 'boolean',
              description: 'Adds a divider between the main description and the bullet items.',
              initialValue: true,
              fieldset: 'bulletItems'
            }),
            defineField({
              name: 'itemTitle',
              title: 'Item List Title',
              type: 'string',
              description: 'Short label shown above the list (ex: "Includes").',
              fieldset: 'bulletItems'
            }),
            defineField({
              name: 'itemDescription',
              title: 'Item Description',
              type: 'array',
              of: [defineArrayMember({ type: 'block' })],
              description: 'Rich text content for the item section. Stick to one short paragraph.',
              fieldset: 'bulletItems'
            }),
            defineField({
              name: 'itemList',
              title: 'Item List',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              description: 'Short list items shown beneath the card text.',
              fieldset: 'bulletItems'
            }),
            defineField({
              name: 'image',
              title: 'Card Image',
              type: 'image',
              options: { hotspot: true },
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
          preview: { select: { title: 'label', subtitle: 'subtitle' } }
        })
      ],
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const parent = context.parent as { columns?: number } | undefined;
          const columnCount = parent?.columns ?? 3;
          const minCards = [2, 3, 4].includes(columnCount) ? columnCount : 3;

          if (!value || value.length < minCards) {
            return `Add at least ${minCards} cards for a ${columnCount}-column layout.`;
          }

          return true;
        })
    }),
    defineField({
      name: 'ctaSubtitle',
      title: 'CTA Subtitle',
      type: 'string',
      description: 'Small helper line near the CTA button.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      description: 'Button label shown below the cards.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'string',
      description: 'Accepts absolute URLs or tel: links',
      fieldset: 'cta'
    })
  ],
  preview: {
    select: { title: 'title', firstCard: 'steps.0.label' },
    prepare: ({ title, firstCard }: { title?: string; firstCard?: string }) => ({
      title: title ?? 'Image Card Section',
      subtitle: firstCard ? `Image Card Section · ${firstCard}` : 'Image Card Section',
      media: LuImage
    })
  }
});
