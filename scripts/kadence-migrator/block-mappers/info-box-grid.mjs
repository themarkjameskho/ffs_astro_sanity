/**
 * Standalone kadence/info-box at the top level (not inside a rowlayout
 * column grid). Rare but happens — emit a single-item iconGridSection
 * so the page still renders cleanly. Multiple consecutive info-boxes
 * should ideally be coalesced — that's a future iteration.
 */
export default async function infoBoxGrid(block, ctx) {
  const flat = flatten(block.innerBlocks);
  const heading = flat.find((b) => b.name === 'kadence/advancedheading');
  const paragraph = flat.find((b) => b.name === 'core/paragraph');
  const iconUrl = block.attrs?.icon?.url ?? block.attrs?.mediaImage?.[0]?.url ?? null;

  return {
    _type: 'iconGridSection',
    _key: `ig${Math.random().toString(36).slice(2, 8)}`,
    size: 'medium',
    layout: 'vertical',
    cardStyle: 'card',
    items: [
      {
        _type: 'iconGridItem',
        _key: `ib${Math.random().toString(36).slice(2, 8)}`,
        title: heading ? strip(heading.innerHTML) : '',
        description: paragraph ? strip(paragraph.innerHTML) : '',
        icon: iconUrl ? await ctx.uploadImage(iconUrl, '') : null,
      },
    ],
  };
}

function flatten(blocks) {
  const out = [];
  for (const b of blocks ?? []) {
    out.push(b);
    if (b.innerBlocks?.length) out.push(...flatten(b.innerBlocks));
  }
  return out;
}

function strip(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
