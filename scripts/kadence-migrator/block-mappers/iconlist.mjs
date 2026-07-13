/**
 * kadence/iconlist — bulleted list with icons. Maps to an iconGridSection
 * with layout='horizontal' so it reads like a checklist.
 *
 * If this list appears inside a heroSection/twoCol/etc. parent, this
 * mapper still emits a section — the parent's mapper is responsible for
 * folding it back into a bullets[] field if context demands it. For v0.1
 * we emit standalone; editors can collapse manually if needed.
 */
export default async function iconlist(block, ctx) {
  const items = (block.innerBlocks ?? [])
    .filter((b) => b.name === 'kadence/listitem')
    .map((li) => ({
      _type: 'iconGridItem',
      _key: `li${Math.random().toString(36).slice(2, 8)}`,
      title: strip(li.attrs?.text ?? li.innerHTML ?? ''),
      description: '',
      icon: null,
    }));

  if (items.length === 0) return null;
  return {
    _type: 'iconGridSection',
    _key: `il${Math.random().toString(36).slice(2, 8)}`,
    size: 'small',
    layout: 'horizontal',
    cardStyle: 'flat',
    items,
  };
}

function strip(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
