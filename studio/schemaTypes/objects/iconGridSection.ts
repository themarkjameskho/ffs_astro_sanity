import { LuShapes } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const iconGridSection = defineType({
  name: 'iconGridSection',
  title: 'Icon Grid Section',
  type: 'object',
  description: 'Feature grid that pairs illustrations with short descriptions and an optional CTA.',
  icon: LuShapes,
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
      description: 'Heading shown above the grid.'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Optional highlight pulled from the main title.'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Supporting sentence displayed under the headline.'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      description: 'Rich text area for additional details.'
    }),
    defineField({
      name: 'colorTheme',
      title: 'Color Theme',
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
      description: 'Automatically switches heading/body/highlight colors for contrast.'
    }),
    defineField({
      name: 'layout',
      title: 'Layout Variant',
      type: 'string',
      options: { list: [
        { title: 'Vertical (Icon Top, Text Below)', value: 'vertical' },
        { title: 'Horizontal (Icon Left, Text Right)', value: 'horizontal' }
      ] },
      initialValue: 'vertical',
      description: 'Choose the best layout for the icon style you upload.'
    }),
    defineField({
      name: 'itemStyle',
      title: 'Item Style',
      type: 'string',
      options: { list: [
        { title: 'Flat (default)', value: 'flat' },
        { title: 'Card (border + shadow)', value: 'card' }
      ] },
      initialValue: 'flat',
      description: 'Card style adds a border + shadow to each item.'
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      description: 'Individual tiles that appear inside the grid.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'iconItem',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'subtitle', title: 'Subtitle (Optional)', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
            defineField({
              name: 'benefitsTitle',
              title: 'Benefits Title (Optional)',
              type: 'string',
              description: 'Optional heading shown above this item\'s benefits list.'
            }),
            defineField({
              name: 'benefits',
              title: 'Benefits (Optional)',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })]
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'image',
              description:
                '✂️ Icons render at 1:1 (square). If your source artwork is NOT square, click the image after upload → use the crop tool to draw a square crop and set the hotspot — Sanity will deliver it cropped to 1:1 to the site. Recommended source: 256×256+ px transparent PNG or SVG.',
              options: { hotspot: true }
            }),
            defineField({ name: 'ctaLabel', title: 'CTA Label (Optional)', type: 'string' }),
            defineField({
              name: 'ctaLink',
              title: 'CTA Link (Optional)',
              description: 'Accepts absolute URLs or tel: links.',
              type: 'string'
            })
          ]
        })
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Section CTA Label (Optional)',
      type: 'string',
      description: 'Button label rendered beneath the grid.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'ctaLink',
      title: 'Section CTA Link (Optional)',
      description: 'Accepts absolute URLs or tel: links',
      type: 'string',
      fieldset: 'cta'
    }),
    defineField({ name: 'ctaSubtitle', title: 'CTA Subtitle', type: 'string', fieldset: 'cta' }),
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
      description: 'Apply the same pattern you use on other sections for consistency.',
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
      description: 'Use H2 sparingly so the document outline stays clean.',
      fieldset: 'cta'
    }),
    defineField({
      name: 'columns',
      title: 'Number of Columns',
      type: 'number',
      options: { list: [
        { title: '2 Columns', value: 2 },
        { title: '3 Columns', value: 3 },
        { title: '4 Columns', value: 4 }
      ] },
      initialValue: 2,
      description: 'Desktop-only column count. Mobile stacks items automatically.'
    }),
    defineField({
      name: 'size',
      title: 'Icon Size',
      type: 'string',
      options: { list: [
        { title: 'Small', value: 'small' },
        { title: 'Large', value: 'large' }
      ] },
      initialValue: 'small',
      description: 'Large icons work well when using the horizontal layout.'
    })
  ],
  preview: {
    select: { title: 'title', count: 'items.length', layoutStyle: 'layoutStyle' },
    prepare: ({ title, count, layoutStyle }: { title?: string; count?: number; layoutStyle?: string }) => {
      const pieces = ['Icon Grid Section'];
      if (layoutStyle) pieces.push(layoutStyle);
      if (count) pieces.push(`${count} items`);
      return {
        title: title ?? 'Icon Grid Section',
        subtitle: pieces.join(' · '),
        media: LuShapes
      };
    }
  }
});
