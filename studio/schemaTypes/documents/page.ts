import { LuFiles } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType, type Rule } from 'sanity';
import { SLUG_FIELD_DESCRIPTION, slugValidation } from '../utils/slugValidation';

const PAGE_TYPES = [
  { title: 'Home', value: 'home' },
  { title: 'Pest Control', value: 'pest-control' },
  { title: 'Bed Bug Treatment', value: 'bed-bug-treatment' },
  { title: 'Service Area', value: 'service-area' },
  { title: 'Contact', value: 'contact' },
  { title: 'Blog', value: 'blog' },
  { title: 'Service Detail', value: 'service-detail' }
];

const SECTION_TYPES = [
  'heroSection',
  'serviceGridSection',
  'processSection',
  'serviceAreaSection',
  'ctaSection',
  'contactSection',
  'blogListSection',
  'iconGridSection',
  'twoColTextImageSection',
  'leadFormSection',
  'htmlSection',
  'faqSection',
  'areasSection',
  'stepsSection'
];

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  description: 'Modular marketing page composed of reusable sections.',
  icon: LuFiles,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'Internal + SEO-friendly page name.',
      validation: (Rule) => Rule.required(),
      group: 'pageInfo'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      description: SLUG_FIELD_DESCRIPTION,
      validation: slugValidation,
      group: 'pageInfo'
    }),
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      options: { list: PAGE_TYPES },
      description: 'Drives navigation groupings and section defaults.',
      validation: (Rule) => Rule.required(),
      group: 'pageInfo'
    }),
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
        }),
        defineField({
          name: 'schemaCode',
          title: 'Schema Code',
          type: 'text',
          rows: 10,
          description: 'Paste structured data schema code here (e.g., JSON-LD for rich snippets).'
        })
      ],
      group: 'seo'
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: SECTION_TYPES.map((section) => defineArrayMember({ type: section })),
      description: 'Stack sections in the exact order they should appear on the site.',
      validation: (Rule) => Rule.required().min(1),
      group: 'sections'
    })
  ],
  groups: [
    {
      name: 'pageInfo',
      title: 'Page Information',
      default: true,
      icon: () => '📄'
    },
    {
      name: 'seo',
      title: 'SEO Settings',
      icon: () => '🔍'
    },
    {
      name: 'sections',
      title: 'Page Sections',
      icon: () => '🧩'
    }
  ],
  preview: { select: { title: 'title', subtitle: 'pageType' } }
});
