import { LuListTodo } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const stepsSection = defineType({
  name: 'stepsSection',
  title: 'Steps Section',
  type: 'object',
  description: 'Alternating image + text step cards with bullets.',
  icon: LuListTodo,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Word or phrase within the title to render in red italic (sand-pale on dark sections).'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string'
    }),
    defineField({
      name: 'theme',
      title: 'Color Theme',
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
      initialValue: 'white'
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({
              name: 'stepLabel',
              title: 'Step Label',
              type: 'string',
              description: 'Optional label shown above the step title.'
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 4
            }),
            defineField({
              name: 'bulletsTitle',
              title: 'Bullets Title (Optional)',
              type: 'string',
              description: 'Optional heading shown above this step\'s bullet list.'
            }),
            defineField({
              name: 'bullets',
              title: 'Bullets',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })]
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  validation: (Rule) => Rule.required()
                })
              ]
            }),
            defineField({
              name: 'imagePosition',
              title: 'Image Position',
              type: 'string',
              options: {
                list: [
                  { title: 'Left', value: 'left' },
                  { title: 'Right', value: 'right' }
                ],
                layout: 'radio'
              },
              initialValue: 'left'
            })
          ],
          preview: {
            select: { title: 'title', stepLabel: 'stepLabel' },
            prepare: ({ title, stepLabel }: { title?: string; stepLabel?: string }) => ({
              title: title ?? stepLabel ?? 'Step',
              subtitle: title && stepLabel ? stepLabel : undefined
            })
          }
        })
      ],
      validation: (Rule) => Rule.min(1)
    })
  ],
  preview: {
    select: { title: 'title', firstStepTitle: 'steps.0.title', firstStepLabel: 'steps.0.stepLabel' },
    prepare: ({ title, firstStepTitle, firstStepLabel }: { title?: string; firstStepTitle?: string; firstStepLabel?: string }) => {
      const stepHint = firstStepTitle ?? firstStepLabel;
      return {
        title: title ?? 'Steps Section',
        subtitle: stepHint ? `Steps Section · ${stepHint}` : 'Steps Section',
        media: LuListTodo
      };
    }
  }
});
