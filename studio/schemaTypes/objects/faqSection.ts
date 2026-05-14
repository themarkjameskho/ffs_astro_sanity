import { LuCircleHelp } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  description: 'Frequently asked questions shown as an accordion or list.',
  icon: LuCircleHelp,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      description: 'Legacy title field. Existing FAQ sections will continue using this if Heading is empty.',
      type: 'string'
    }),
    defineField({
      name: 'layoutVariant',
      title: 'Layout Variant',
      type: 'string',
      initialValue: 'single',
      options: {
        layout: 'radio',
        list: [
          { title: 'Single FAQ', value: 'single' },
          { title: 'Two Column FAQ', value: 'twoColumn' }
        ]
      }
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Word or phrase within the heading to render in red italic (sand-pale on dark sections).'
    }),
    defineField({
      name: 'textAlignment',
      title: 'Text Alignment',
      type: 'string',
      initialValue: 'left',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' }
        ],
        layout: 'radio'
      },
      description: 'Controls the alignment of the heading, intro text, and bottom text.'
    }),
    defineField({
      name: 'colorTheme',
      title: 'Color Theme',
      type: 'string',
      initialValue: 'white',
      options: {
        list: [
          { title: 'White', value: 'white' },
          { title: 'Soft Green (very pale)', value: 'soft-green' },
          { title: 'Sage Green (light)', value: 'sage' },
          { title: 'Cream', value: 'cream' },
          { title: 'Olive Green (medium)', value: 'oliveGreen' },
          { title: 'Dark Green', value: 'darkGreen' }
        ],
        layout: 'radio'
      },
      description: 'Uses the same brand theme options available in other sections.'
    }),
    defineField({
      name: 'description',
      title: 'Description / Intro Text',
      type: 'text',
      rows: 4
    }),
    defineField({
      name: 'faqs',
      title: 'FAQ Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string'
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'bottomText',
      title: 'Bottom Text',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button Label',
      type: 'string'
    }),
    defineField({
      name: 'buttonLink',
      title: 'Button Link',
      type: 'string'
    })
  ],
  preview: {
    select: { title: 'heading', legacyTitle: 'title', layoutVariant: 'layoutVariant' },
    prepare: ({ title, legacyTitle, layoutVariant }: { title?: string; legacyTitle?: string; layoutVariant?: string }) => ({
      title: title ?? legacyTitle ?? 'FAQ Section',
      subtitle: layoutVariant === 'twoColumn'
        ? 'FAQ Section · Two Column'
        : 'FAQ Section · Single Column',
      media: LuCircleHelp
    })
  }
});
