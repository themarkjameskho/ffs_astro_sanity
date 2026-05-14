import { LuUser } from 'react-icons/lu';
import { defineField, defineType } from 'sanity';
import { SLUG_FIELD_DESCRIPTION, slugValidation } from '../utils/slugValidation';

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  description: 'Authors for blog posts.',
  icon: LuUser,
  fields: [
    defineField({
      name: 'name',
      title: 'Author Name',
      type: 'string',
      description: 'Full name of the author.',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      description: SLUG_FIELD_DESCRIPTION,
      validation: slugValidation
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      description: 'Short biography of the author.',
      rows: 3
    }),
    defineField({
      name: 'image',
      title: 'Author Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Profile image for the author.'
    })
  ],
  preview: { select: { title: 'name', subtitle: 'bio', media: 'image' } }
});
