/**
 * kadence/accordion — Q&A accordion → faqSection.
 *
 * Each accordion has innerBlocks of `kadence/pane`, each pane has
 * `attrs.title` (the question) and innerHTML (the answer markup).
 */
export default async function accordion(block, ctx) {
  const panes = (block.innerBlocks ?? []).filter((b) => b.name === 'kadence/pane');
  return {
    _type: 'faqSection',
    _key: `faq${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    items: panes.map((pane) => ({
      _type: 'faqItem',
      _key: `q${Math.random().toString(36).slice(2, 8)}`,
      question: pane.attrs?.title ?? strip(pane.attrs?.titleAttr ?? '') ?? 'Question',
      answer: ctx.toPortableText(pane.innerHTML ?? ''),
    })),
  };
}

function strip(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
