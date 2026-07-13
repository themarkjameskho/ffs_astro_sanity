/**
 * kadence/form — Kadence's lead-form block → leadFormSection.
 *
 * Our Sanity schema has fixed fields (firstName, lastName, phone, email,
 * address, methodOfContact, bestTime, message). The Kadence form may have
 * different field names. v0.1: emit the section with default field set
 * and pull the form title from the heading sibling above it if present.
 * Editor finalizes field mapping in Studio.
 */
export default async function form(block, _ctx) {
  return {
    _type: 'leadFormSection',
    _key: `lf${Math.random().toString(36).slice(2, 8)}`,
    title: block.attrs?.title ?? 'Contact Us',
    subtitle: '',
    backgroundTheme: 'cream',
    _migrationNote:
      'Mapped from kadence/form. Verify form fields match Sanity schema — Kadence form attrs may have different field labels than our defaults.',
  };
}
