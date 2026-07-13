/**
 * kadence/advancedheading — a styled heading. At the page top-level it
 * usually means a section title. Wrap it in an htmlSection with just
 * the heading so it renders, and the editor can promote it to a proper
 * section type if needed. (Most often, advancedheading appears INSIDE
 * a rowlayout — in that case the rowlayout mapper handles it.)
 */
export default function advancedHeading(block, _ctx) {
  return {
    _type: 'htmlSection',
    _key: `ah${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    htmlContent: block.innerHTML ?? '',
  };
}
