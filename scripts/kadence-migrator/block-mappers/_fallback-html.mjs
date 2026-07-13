/**
 * Fallback: preserve the raw block HTML as an `htmlSection` so the page
 * still renders even if we haven't written a proper mapper for this
 * block type yet. The migration report flags this — write a real mapper
 * the next time you see the same block.
 */
export default function fallbackHtml(block, _ctx) {
  return {
    _type: 'htmlSection',
    _key: `f${Math.random().toString(36).slice(2, 8)}`,
    title: `(unmapped: ${block.name})`,
    htmlContent: block.innerHTML ?? '',
    _migrationNote: `Auto-fallback. Block type ${block.name} has no dedicated mapper yet — add one in scripts/kadence-migrator/block-mappers/.`,
  };
}
