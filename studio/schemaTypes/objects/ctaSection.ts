import { LuMegaphone } from 'react-icons/lu';
import { defineField, defineType, type Rule } from 'sanity';

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'CTA Section',
  type: 'object',
  description: 'Full-width or boxed call-to-action band that mirrors {{BRAND_NAME}} branding presets.',
  icon: LuMegaphone,
  fieldsets: [
    {
      name: 'primaryButton',
      title: 'Primary Button',
      options: { collapsible: true, collapsed: false }
    },
    {
      name: 'secondaryButton',
      title: 'Secondary Button',
      options: { collapsible: true, collapsed: true }
    },
    {
      name: 'legacyCta',
      title: 'Legacy CTA (Backward Compatibility)',
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional kicker text (ex: “Limited Time”).'
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Main CTA headline.',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'highlightText',
      title: 'Highlighted Title Text',
      type: 'string',
      description: 'Word or phrase from the heading that should use the highlight color.'
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Optional supporting copy.'
    }),
    defineField({
      name: 'primaryButton',
      title: 'Primary Button',
      type: 'object',
      fieldset: 'primaryButton',
      fields: [
        defineField({
          name: 'label',
          title: 'Primary CTA Label',
          type: 'string',
          description: 'Main button text (ex: "Illinois — {{PHONE_PRIMARY_FORMATTED}}").'
        }),
        defineField({
          name: 'link',
          title: 'Primary CTA Link',
          type: 'string',
          description: 'Accepts absolute URLs, internal paths, or tel: links.'
        }),
        defineField({
          name: 'style',
          title: 'Primary CTA Style',
          type: 'string',
          options: {
            list: [
              { title: 'Primary', value: 'primary' },
              { title: 'Secondary', value: 'secondary' },
              { title: 'Outline', value: 'outline' }
            ],
            layout: 'radio'
          },
          initialValue: 'primary',
          description: 'Optional override for button appearance.'
        })
      ]
    }),
    defineField({
      name: 'secondaryButton',
      title: 'Secondary Button',
      type: 'object',
      fieldset: 'secondaryButton',
      description: 'Optional second button.',
      fields: [
        defineField({
          name: 'label',
          title: 'Secondary CTA Label',
          type: 'string',
          description: 'Optional second button text (ex: "Request Inspection").'
        }),
        defineField({
          name: 'link',
          title: 'Secondary CTA Link',
          type: 'string',
          description: 'Accepts absolute URLs, internal paths, or tel: links.'
        }),
        defineField({
          name: 'style',
          title: 'Secondary CTA Style',
          type: 'string',
          options: {
            list: [
              { title: 'Secondary', value: 'secondary' },
              { title: 'Primary', value: 'primary' },
              { title: 'Outline', value: 'outline' }
            ],
            layout: 'radio'
          },
          initialValue: 'secondary',
          description: 'Optional override for the secondary button appearance.'
        })
      ]
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label (Legacy)',
      type: 'string',
      description: 'Legacy fallback. New content should use Primary Button.',
      fieldset: 'legacyCta'
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link (Legacy)',
      description: 'Legacy fallback. New content should use Primary Button.',
      type: 'string',
      fieldset: 'legacyCta'
    }),
    defineField({
      name: 'ctaSubtitle',
      title: 'CTA Subtitle',
      type: 'string',
      description: 'Helper line that follows the alignment rules for this section.',
      fieldset: 'primaryButton'
    }),
    defineField({
      name: 'ctaSubtitlePlacement',
      title: 'CTA Subtitle Placement',
      type: 'string',
      options: {
        list: [
          { title: 'Above Button', value: 'above' },
          { title: 'Below Button', value: 'below' }
        ],
        layout: 'radio'
      },
      initialValue: 'below',
      description: 'Keep consistent with other sections for visual rhythm.',
      fieldset: 'primaryButton'
    }),
    defineField({
      name: 'ctaSubtitleHeadingLevel',
      title: 'CTA Subtitle Heading Level',
      type: 'string',
      options: {
        list: [
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' }
        ],
        layout: 'radio'
      },
      initialValue: 'h3',
      description: 'Set to H2 only when the CTA is the major focal point of the page.',
      fieldset: 'primaryButton'
    }),
    defineField({
      name: 'layoutStyle',
      title: 'Layout Style',
      type: 'string',
      options: { list: [
        { title: 'Full Width', value: 'fullWidth' },
        { title: 'Boxed', value: 'boxed' }
      ] },
      initialValue: 'fullWidth',
      description: 'Full Width uses the site background, boxed adds rounded corners.',
    }),
    defineField({
      name: 'layout',
      title: 'Content Layout',
      type: 'string',
      options: { list: [
        { title: 'Stacked (All centered, vertically stacked)', value: 'stacked' },
        { title: 'Two Column (Text left, button right)', value: 'twoColumn' }
      ] },
      initialValue: 'stacked',
      description: 'Two Column keeps text left and CTA right on desktop.',
    }),
    defineField({
      name: 'colorTheme',
      title: 'Color Theme (Full Width)',
      type: 'string',
      options: {
        list: [
          { title: 'White', value: 'white' },
          { title: 'Soft Green (very pale)', value: 'soft-green' },
          { title: 'Sage Green (light)', value: 'sage' },
          { title: 'Cream', value: 'cream' },
          { title: 'Olive Green (medium)', value: 'oliveGreen' },
          { title: 'Dark Green', value: 'darkGreen' }
        ],
        layout: 'radio'
      },
      initialValue: 'oliveGreen',
      description: 'Uniform background set used across all sections — white, soft green, sage green, cream, olive, and dark green.',
    }),
    defineField({
      name: 'sectionBackground',
      title: 'Section Background (Around the Panel)',
      type: 'string',
      options: {
        list: [
          { title: 'Inherit (transparent — blends with adjacent section)', value: 'inherit' },
          { title: 'White', value: 'white' },
          { title: 'Soft green', value: 'soft-green' },
          { title: 'Sage green', value: 'sage' },
          { title: 'Warm neutral', value: 'warm' },
          { title: 'Dark green', value: 'dark' }
        ],
        layout: 'radio'
      },
      initialValue: 'inherit',
      description: 'Choose the background color OUTSIDE the CTA panel. Use Inherit when you want the section to blend into the surrounding page (e.g., directly under the hero).',
    }),
    defineField({
      name: 'sectionHeight',
      title: 'Section Padding',
      type: 'string',
      options: {
        list: [
          { title: 'Compact (blends tightly into adjacent sections)', value: 'compact' },
          { title: 'Default', value: 'default' },
          { title: 'Spacious', value: 'spacious' }
        ],
        layout: 'radio'
      },
      initialValue: 'compact',
      description: 'Controls vertical padding around the CTA panel. Compact is recommended when the section needs to flow into surrounding content without a tall gap.'
    })
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'layoutStyle',
      primaryLabel: 'primaryButton.label',
      legacyLabel: 'ctaLabel',
      secondaryLabel: 'secondaryButton.label'
    },
    prepare: ({
      title,
      subtitle,
      primaryLabel,
      legacyLabel,
      secondaryLabel
    }: {
      title?: string;
      subtitle?: string;
      primaryLabel?: string;
      legacyLabel?: string;
      secondaryLabel?: string;
    }) => {
      const activePrimary = primaryLabel ?? legacyLabel;
      const buttonSummary = [activePrimary, secondaryLabel].filter(Boolean).join(' + ');
      const layout = subtitle ?? 'fullWidth';
      return {
        title: title ?? 'CTA Section',
        subtitle: buttonSummary
          ? `CTA Section · ${layout} · ${buttonSummary}`
          : `CTA Section · ${layout}`,
        media: LuMegaphone
      };
    }
  }
});
