/**
 * Block-mapper registry.
 *
 * Each entry maps a Kadence block name to a function that converts the
 * parsed block into one or more Sanity section objects. Unknown blocks
 * fall through to the htmlSection fallback so the migration never breaks
 * on an unhandled pattern.
 *
 * To add a new mapper:
 *   1. Create `<block-name>.mjs` in this directory
 *   2. Default-export `(block, ctx) => sanitySection | sanitySection[] | null`
 *   3. Register it in the MAPPERS table below
 */
import rowlayout from './rowlayout.mjs';
import infoBoxGrid from './info-box-grid.mjs';
import accordion from './accordion.mjs';
import iconList from './iconlist.mjs';
import form from './form.mjs';
import advancedHeading from './advanced-heading.mjs';
import advancedBtn from './advanced-btn.mjs';
import fallbackHtml from './_fallback-html.mjs';

const MAPPERS = {
  'kadence/rowlayout': rowlayout,
  'kadence/info-box': infoBoxGrid,
  'kadence/accordion': accordion,
  'kadence/iconlist': iconList,
  'kadence/form': form,
  'kadence/advancedheading': advancedHeading,
  'kadence/advancedbtn': advancedBtn,
  // Explicit no-ops (handled by their parent or intentionally skipped):
  'kadence/spacer': () => null,
  'kadence/divider': () => null,
  'core/spacer': () => null,
};

export async function mapBlockToSection(block, ctx) {
  const handler = MAPPERS[block.name];
  if (handler) {
    return await handler(block, ctx);
  }
  // Unknown — fall through to raw-HTML preservation
  return await fallbackHtml(block, ctx);
}

export { MAPPERS };
