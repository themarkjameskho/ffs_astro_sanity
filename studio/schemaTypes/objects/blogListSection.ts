import { LuNewspaper } from 'react-icons/lu';
import { defineField, defineType, type Rule } from 'sanity';

export const blogListSection = defineType({
  name: 'blogListSection',
  title: 'Blog List Section',
  type: 'object',
  description: 'Pulls the latest blog posts with optional category filtering.',
  icon: LuNewspaper,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Headline shown above the blog preview cards.'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Optional highlight pulled from the title.'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Short intro paragraph.'
    }),
    defineField({
      name: 'filterCategory',
      title: 'Filter Category',
      type: 'string',
      description: 'Limits posts to a single Sanity category slug (leave blank to show all).'
    }),
    defineField({
      name: 'postsToShow',
      title: 'Posts to Show',
      type: 'number',
      description: 'Defaults to 6 cards.',
      initialValue: 6,
      validation: (Rule) => Rule.min(3).max(12)
    })
  ],
  preview: {
    select: { title: 'title', count: 'postsToShow' },
    prepare: ({ title, count }: { title?: string; count?: number }) => ({
      title: title ?? 'Blog List Section',
      subtitle: count ? `Blog List Section · showing ${count}` : 'Blog List Section',
      media: LuNewspaper
    })
  }
});
