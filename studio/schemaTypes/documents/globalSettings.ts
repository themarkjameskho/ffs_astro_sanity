import { LuSlidersHorizontal } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const globalSettings = defineType({
  name: 'globalSettings',
  title: 'Global Settings',
  type: 'document',
  description: 'Single source for contact info, default SEO data, and reusable social links.',
  icon: LuSlidersHorizontal,
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Used only inside Studio.',
      initialValue: 'Site Settings'
    }),
    defineField({
      name: 'contact',
      title: 'Contact Info',
      type: 'contactInfo',
      description: 'Populates the footer and structured data.',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
      description: 'Fallback metadata when a page/blog post does not set custom SEO.',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      description: 'Rendered in the footer and contact cards.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Ex: “Facebook” or “BBB Profile”.',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Full https link.',
              validation: (Rule) => Rule.required()
            })
          ]
        })
      ]
    })
  ],
  preview: { select: { title: 'title', subtitle: 'contact.companyName' } }
});
