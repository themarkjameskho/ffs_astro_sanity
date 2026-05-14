import { LuColumns3 } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const twoColTextImageSection = defineType({
  name: 'twoColTextImageSection',
  title: 'Two Column Text + Image Section',
  type: 'object',
  description: 'Balanced text and gallery block used for storytelling or feature highlights.',
  icon: LuColumns3,
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
      title: 'Title',
      type: 'string',
      description: 'Main headline for the section.'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Word or phrase within the title that inherits the highlight color.'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional supporting sentence.'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      description: 'Rich text body. Keep paragraphs short for readability.'
    }),
    defineField({
      name: 'backgroundTheme',
      title: 'Background Theme',
      type: 'string',
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
      initialValue: 'white',
      description: 'Uniform background set used across all sections — white, soft green, sage green, cream, olive, and dark green.'
    }),
    defineField({
      name: 'bulletTitle',
      title: 'Item Title',
      type: 'string',
      description: 'Heading shown above the bullet list.'
    }),
    defineField({
      name: 'bullets',
      title: 'Items',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Short list of supporting statements.'
    }),
    defineField({
      name: 'bulletIcon',
      title: 'Bullet Icon Style',
      type: 'string',
      options: {
        list: [
          { title: 'Check mark (✓)', value: 'check' },
          { title: 'Solid circle (•)', value: 'circle' }
        ],
        layout: 'radio'
      },
      initialValue: 'check',
      description: 'Choose the marker shown next to each bullet. Color adapts to the section background automatically.'
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      description: 'Button label positioned with the text column.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      description: 'Accepts absolute URLs or tel: links',
      type: 'string',
      fieldset: 'cta'
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Secondary CTA Label',
      type: 'string',
      description: 'Optional second button label displayed alongside the primary CTA.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'secondaryCtaLink',
      title: 'Secondary CTA Link',
      description: 'Accepts absolute URLs or tel: links',
      type: 'string',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaSubtitle',
      title: 'CTA Subtitle',
      type: 'string',
      description: 'Helper line above/below the CTA.',
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
      description: 'Match this to the alignment you want visually.',
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
      description: 'Use H2 sparingly so the page outline stays consistent.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string' })]
        })
      ],
      description: 'Supports up to 4 lifestyle or service images.',
      validation: (Rule) => Rule.required().min(1).max(4)
    }),
    defineField({
      name: 'imagePlacement',
      title: 'Image Placement',
      type: 'string',
      options: {
        list: [
          { title: 'Image Left', value: 'imageLeft' },
          { title: 'Image Right', value: 'imageRight' }
        ],
        layout: 'radio'
      },
      initialValue: 'imageRight',
      description: '“Image Left” works well when pairing with video or gallery stacks.'
    })
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', media: 'image' },
    prepare: ({ title, subtitle, media }: { title?: string; subtitle?: string; media?: unknown }) => ({
      title: title ?? 'Two Column Text + Image Section',
      subtitle: subtitle ? `Two Column Text + Image · ${subtitle}` : 'Two Column Text + Image Section',
      media: media ?? LuColumns3
    })
  }
});
