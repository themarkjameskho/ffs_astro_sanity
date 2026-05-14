import { LuFolderOpen } from 'react-icons/lu';
import { defineField, defineType } from 'sanity';
import { SLUG_FIELD_DESCRIPTION, slugValidation } from '../utils/slugValidation';

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  description: 'Categories for organizing blog posts.',
  icon: LuFolderOpen,
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      description: 'The name of the category.',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Short description of the category.',
      rows: 3
    })
  ],
  preview: { select: { title: 'name', subtitle: 'description' } }
});
