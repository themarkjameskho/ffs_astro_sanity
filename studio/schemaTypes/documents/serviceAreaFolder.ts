import { LuFolderOpen } from 'react-icons/lu';
import { defineField, defineType } from 'sanity';

export const serviceAreaFolder = defineType({
  name: 'serviceAreaFolder',
  title: 'Service Area Folder',
  type: 'document',
  icon: LuFolderOpen,
  description: 'Creates a folder container for organizing service area pages',
  fields: [
    defineField({
      name: 'name',
      title: 'Folder Name',
      type: 'string',
      description: 'Name of the folder (e.g., "Alabama", "Oklahoma", "New Mexico")',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional description of this service area region'
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Determines the order in which folders appear (lower numbers first)',
      initialValue: 0
    })
  ],
  preview: {
    select: {
      title: 'name',
      order: 'order'
    },
    prepare({ title, order }) {
      return {
        title,
        subtitle: `Order: ${order}`,
        media: LuFolderOpen
      };
    }
  }
});

