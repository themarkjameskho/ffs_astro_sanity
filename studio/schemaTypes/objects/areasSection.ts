import { LuMapPin } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const areasSection = defineType({
  name: 'areasSection',
  title: 'Areas Section',
  type: 'object',
  description: 'State and city grid for locations/service areas.',
  icon: LuMapPin,
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
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
      initialValue: 'darkGreen'
    }),
    defineField({
      name: 'stateGroups',
      title: 'State Groups',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stateGroup',
          fields: [
            defineField({
              name: 'stateTitle',
              title: 'State Title',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'areas',
              title: 'Areas',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'area',
                  fields: [
                    defineField({
                      name: 'cityName',
                      title: 'City Name',
                      type: 'string',
                      validation: (Rule) => Rule.required()
                    }),
                    defineField({
                      name: 'link',
                      title: 'Link',
                      type: 'string'
                    })
                  ]
                })
              ],
              validation: (Rule) => Rule.min(1)
            })
          ]
        })
      ],
      validation: (Rule) => Rule.min(1)
    })
  ],
  preview: {
    select: { title: 'title', stateHint: 'stateGroups.0.stateTitle' },
    prepare: ({ title, stateHint }: { title?: string; stateHint?: string }) => ({
      title: title ?? 'Areas Section',
      subtitle: stateHint ? `Areas Section · ${stateHint}` : 'Areas Section',
      media: LuMapPin
    })
  }
});

