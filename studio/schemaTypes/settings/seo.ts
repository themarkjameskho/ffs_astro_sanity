import { LuSearch } from 'react-icons/lu';
import { defineField, defineType, type Rule } from 'sanity';

export const seo = defineType({
  name: 'seo',
  title: 'SEO Metadata',
  type: 'object',
  description: 'Reusable SEO object shared by pages, blog posts, and global defaults.',
  icon: LuSearch,
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Max 60 characters to avoid truncation.',
      validation: (Rule) => Rule.required().max(60)
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Max 160 characters.',
      validation: (Rule) => Rule.required().max(160)
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'Leave blank to auto-generate from the site base URL.',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          if (/\s/.test(value)) return 'Canonical URL cannot contain spaces.';
          return true;
        })
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Recommended size 1200x630 JPG/PNG.',
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() })]
    })
  ],
  preview: {
    select: { title: 'seoTitle', subtitle: 'seoDescription' }
  }
});
