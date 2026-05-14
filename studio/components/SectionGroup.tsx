/**
 * SectionGroup — custom Sanity input component for optional object fields.
 *
 * Default state (empty + closed): renders as a large "+ Add [Title]" button
 *   so editors aren't scrolling past empty accordion shells for sections they
 *   never use (Coupon, Background Image, etc.).
 *
 * Once content is added OR the editor clicks the button:
 *   renders the standard Sanity collapsible object UI via props.renderDefault.
 *
 * Apply via:
 *   defineField({
 *     name: 'coupon',
 *     type: 'object',
 *     components: { input: SectionGroup },
 *     fields: [...]
 *   })
 */
import { useState } from 'react';
import type { ObjectInputProps } from 'sanity';
import { Button, Card, Box, Text, Flex } from '@sanity/ui';
import { AddIcon } from '@sanity/icons';

/**
 * Returns true when the object has at least one meaningful value
 * (skipping Sanity metadata keys like _type / _key).
 */
function hasMeaningfulValue(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return Object.keys(record).some((key) => {
    if (key === '_type' || key === '_key') return false;
    const v = record[key];
    if (v === undefined || v === null) return false;
    if (typeof v === 'string' && v.trim() === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    if (typeof v === 'object' && !Array.isArray(v)) {
      return hasMeaningfulValue(v);
    }
    return true;
  });
}

export function SectionGroup(props: ObjectInputProps) {
  const [forceOpen, setForceOpen] = useState(false);
  const filled = hasMeaningfulValue(props.value);

  // When the section has content OR the editor has clicked "Add" in this
  // session, fall through to Sanity's default object UI (which includes
  // the collapsible accordion if the schema sets collapsible: true).
  if (filled || forceOpen) {
    return props.renderDefault(props);
  }

  const sectionTitle =
    (props.schemaType as { title?: string }).title ||
    props.schemaType.name ||
    'Section';

  return (
    <Card padding={1} radius={3}>
      <Button
        mode="ghost"
        tone="primary"
        onClick={() => setForceOpen(true)}
        padding={4}
        style={{
          width: '100%',
          minHeight: '64px',
          cursor: 'pointer',
          borderStyle: 'dashed',
          borderWidth: '2px',
        }}
      >
        <Flex align="center" justify="center" gap={3}>
          <Box>
            <AddIcon style={{ fontSize: '24px' }} />
          </Box>
          <Text size={3} weight="semibold">
            Add {sectionTitle}
          </Text>
        </Flex>
      </Button>
    </Card>
  );
}
