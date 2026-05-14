import { LuBuilding2 } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';

export const contactInfo = defineType({
  name: 'contactInfo',
  title: 'Contact Information',
  type: 'object',
  description: 'Centralized business contact details reused across layouts.',
  icon: LuBuilding2,
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'address',
      title: 'Street Address',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'state', title: 'State', type: 'string' }),
    defineField({ name: 'zip', title: 'ZIP Code', type: 'string' }),
    defineField({
      name: 'phone',
      title: 'Primary Phone',
      type: 'string',
      description: 'Used anywhere a default phone number is needed.',
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({
      name: 'serviceAreas',
      title: 'Service Areas',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Internal reference list (not shown publicly).'
    }),
    defineField({
      name: 'mapEmbed',
      title: 'Map Embed URL',
      type: 'url',
      description: 'Used as the default map when sections do not override it.'
    })
  ],
  preview: {
    select: { title: 'companyName', subtitle: 'phone' }
  }
});
