import { LuPenLine } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';
import { SLUG_FIELD_DESCRIPTION, slugValidation } from '../utils/slugValidation';

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Post',
  type: 'document',
  description: 'Long-form content with portable text body and SEO controls.',
  icon: LuPenLine,
  fields: [
    // Post Information Group
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Public-facing blog headline.',
      validation: (Rule) => Rule.required(),
      group: 'postInfo'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: SLUG_FIELD_DESCRIPTION,
      validation: slugValidation,
      group: 'postInfo'
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      description: 'Used on listing cards and Open Graph.',
      group: 'postInfo'
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Hero image for the post listing and detail page.',
      fields: [
        defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() })
      ],
      group: 'postInfo'
    }),
    // SEO Group
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'seoTitle',
          title: 'SEO Title',
          type: 'string',
          description: 'Max 60 characters to avoid truncation.',
          validation: (Rule) => Rule.max(60)
        }),
        defineField({
          name: 'seoDescription',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          description: 'Max 160 characters.',
          validation: (Rule) => Rule.max(160)
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
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (Rule) => Rule.required()
            })
          ]
        })
      ],
      group: 'seo'
    }),
    // Taxonomies Group
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'Controls ordering in the blog list.',
      validation: (Rule) => Rule.required(),
      group: 'taxonomies'
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'Optional override for the byline.',
      group: 'taxonomies'
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'category' }]
        })
      ],
      options: { layout: 'tags' },
      description: 'One or more categories for this post.',
      group: 'taxonomies'
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'tag' }],
          options: { disableNew: false }
        })
      ],
      options: { layout: 'tags' },
      description: 'Tags for the blog post.',
      group: 'taxonomies'
    }),
    // Content Group
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Describe the image for accessibility.'
            })
          ]
        })
      ],
      description: 'Portable text body for the article.',
      group: 'content'
    })
  ],
  groups: [
    {
      name: 'postInfo',
      title: 'Post Information',
      default: true,
      icon: () => '📝'
    },
    {
      name: 'seo',
      title: 'SEO Settings',
      icon: () => '🔍'
    },
    {
      name: 'taxonomies',
      title: 'Taxonomies',
      icon: () => '🏷️'
    },
    {
      name: 'content',
      title: 'Content',
      icon: () => '✍️'
    }
  ],
  preview: { select: { title: 'title', subtitle: 'author', media: 'featuredImage' } }
});
