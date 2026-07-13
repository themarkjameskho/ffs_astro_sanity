/**
 * kadence/advancedbtn at top-level — unusual but happens. Wrap in
 * a ctaSection so it renders. Inside rowlayouts these are absorbed
 * by the hero / twocol mappers.
 */
export default function advancedBtn(block, _ctx) {
  const label = (block.innerHTML ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const href = block.attrs?.link?.url ?? '#';
  return {
    _type: 'ctaSection',
    _key: `cta${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    primaryCta: { label, href },
    layoutStyle: 'compact',
    sectionBackground: 'inherit',
  };
}
