import { LuTag } from 'react-icons/lu';
import { defineField, defineType } from 'sanity';
import { SLUG_FIELD_DESCRIPTION, slugValidation } from '../utils/slugValidation';

export const tag = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  description: 'Tags for organizing blog posts.',
  icon: LuTag,
  fields: [
    defineField({
      name: 'name',
      title: 'Tag Name',
      type: 'string',
      description: 'The name of the tag.',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      description: SLUG_FIELD_DESCRIPTION,
      validation: slugValidation
    })
  ],
  preview: { select: { title: 'name' } }
});
