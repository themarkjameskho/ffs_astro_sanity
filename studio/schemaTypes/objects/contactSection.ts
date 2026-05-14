import { LuPhoneCall } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'object',
  description: 'Two-column contact block with business details, quick links, and map embed.',
  icon: LuPhoneCall,
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title (Optional)',
      type: 'string',
      description: 'Headline for the contact block.'
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Optional highlighted word or phrase.'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle (Optional)',
      type: 'string',
      description: 'Helper line under the headline.'
    }),
    
    // Left Column: Location Details
    defineField({
      name: 'locationTitle',
      title: 'Location Title',
      type: 'string',
      initialValue: 'Location Details',
      description: 'Label that appears above the left column contact info.'
    }),
    defineField({ name: 'companyName', title: 'Company Name', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({
      name: 'phoneLink',
      title: 'Phone Link (e.g., tel:+1234567890)',
      type: 'string',
      description: 'Leave blank to auto-generate from phone number'
    }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    
    // Right Column: Links/Information
    defineField({
      name: 'linksSubtitle',
      title: 'Links Subtitle (Optional)',
      type: 'string',
      description: 'Intro text for the list of quick links.'
    }),
    defineField({
      name: 'linksColumns',
      title: 'Links Columns',
      type: 'number',
      description: 'Number of columns for the right column links list.',
      initialValue: 3,
      options: {
        list: [
          { title: '1 Column', value: 1 },
          { title: '2 Columns', value: 2 },
          { title: '3 Columns', value: 3 }
        ]
      }
    }),
    defineField({
      name: 'linksSection',
      title: 'Links & Information',
      type: 'array',
      description: 'Right column list that can mix phone numbers, emails, and internal links.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'linkItem',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({ 
              name: 'url', 
              title: 'URL or Link', 
              type: 'string',
              description: 'Accepts URLs, tel:, or mailto: links'
            })
          ],
          preview: { select: { title: 'label', subtitle: 'url' } }
        })
      ]
    }),
    
    defineField({
      name: 'mapEmbed',
      title: 'Map Embed URL',
      type: 'url',
      description: 'Use the embed URL from Google Maps share dialog.'
    })
  ],
  preview: {
    select: { title: 'title', subtitle: 'companyName' },
    prepare: ({ title, subtitle }: { title?: string; subtitle?: string }) => ({
      title: title ?? 'Contact Section',
      subtitle: subtitle ? `Contact Section · ${subtitle}` : 'Contact Section',
      media: LuPhoneCall
    })
  }
});
