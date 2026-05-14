import { LuCode } from 'react-icons/lu';
import { defineField, defineType, type Rule } from 'sanity';

export const htmlSection = defineType({
  name: 'htmlSection',
  title: 'HTML Section',
  type: 'object',
  description: 'Section for embedding custom HTML content like privacy policy, terms and conditions, etc.',
  icon: LuCode,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title (Optional)',
      type: 'string',
      description: 'Headline for the section. Leave blank if your embed code creates its own heading (e.g., calendar widget, form title).'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Word or phrase within the title to render in red italic.'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle (Optional)',
      type: 'string',
      description: 'Helper text or description under the title. Leave blank if you do not need supporting text.'
    }),
    defineField({
      name: 'htmlContent',
      title: 'HTML Content',
      type: 'text',
      description: 'Paste your HTML content here (e.g., privacy policy, terms and conditions). Keep it clean and sanitized.',
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle'
    },
    prepare(selection: { title?: string; subtitle?: string }) {
      const { title, subtitle } = selection;
      return {
        title: title || 'HTML Section',
        subtitle: subtitle ? `HTML Section · ${subtitle}` : 'HTML Section · Custom HTML Content',
        media: LuCode
      };
    }
  }
});
