/**
 * kadence/rowlayout — the most versatile Kadence block. Used as:
 *   1. Hero row (bg image + h1 + buttons) → heroSection
 *   2. 2-column with image + text → twoColTextImageSection
 *   3. Grid of info-boxes (N columns of kadence/info-box) → iconGridSection
 *   4. Inline FAQ accordion (column of kadence/pane) → faqSection
 *   5. CTA-only row (one or two columns, just an advancedbtn) → ctaSection
 *   6. Single-image showcase (image col + empty col) → twoColTextImageSection
 *   7. Pure-spacer row (all columns empty) → null (silent skip)
 *   8. Nested rowlayout wrapper → recurse into inner
 *   9. Generic content row (mixed children) → htmlSection or composite
 *
 * Detection ladder runs cheapest/most-specific first. Patterns added in
 * v0.2 (FAQ, CTA-only, image-only, empty, nested-passthrough) came out of
 * inspecting 249 real-world rowlayouts from the BBBGN migration — see
 * scripts/kadence-migrator/unmapped-rowlayouts.json for the source data.
 *
 * v0.2.1 broadens button detection (kadence/singlebtn alias) and relaxes
 * nested-passthrough to allow empty companion columns. Both came out of
 * the HeatTech dry-run, which uses kadence/singlebtn instead of advancedbtn
 * and has frequent row[col(rowlayout) col(∅)] wrappers.
 */
import { mapBlockToSection } from './index.mjs';

// Kadence ships two near-identical button blocks. They differ in advanced
// options but the migrator only cares about label + href, so treat them
// as aliases everywhere.
const KADENCE_BUTTON_NAMES = new Set([
  'kadence/advancedbtn',
  'kadence/singlebtn',
]);
const isButton = (b) => !!b && KADENCE_BUTTON_NAMES.has(b.name);

// Label/href shapes differ between advancedbtn and singlebtn; tolerant
// extractors keep the mapper portable.
function buttonLabel(btn) {
  return (
    stripHtml(btn.innerHTML ?? '') ||
    stripHtml(btn.attrs?.text ?? '') ||
    stripHtml(btn.attrs?.label ?? '') ||
    ''
  );
}
function buttonHref(btn) {
  return (
    btn.attrs?.link?.url ??
    btn.attrs?.link ??
    btn.attrs?.url ??
    btn.attrs?.href ??
    '#'
  );
}

export default async function rowlayout(block, ctx) {
  const inner = block.innerBlocks ?? [];
  const childTypes = inner.flatMap((b) => collectChildTypes(b));
  const bgImage = block.attrs?.bgImg ?? block.attrs?.overlayImage?.url ?? null;
  const columns = inner.filter((b) => b.name === 'kadence/column');

  // --- 1. Pure-spacer row: every column is empty and there are no
  //        non-column inner blocks. Treat like kadence/spacer and skip
  //        silently so the page doesn't accumulate stub sections.
  const allColumnsEmpty =
    columns.length > 0 &&
    columns.length === inner.length &&
    columns.every((c) => (c.innerBlocks ?? []).length === 0);
  if (allColumnsEmpty) return null;

  // --- 2. Nested rowlayout passthrough: at least one column wraps exactly
  //        one rowlayout, and any other columns are empty. Recurse into
  //        the inner row(s) so they get classified properly instead of
  //        being flattened into mixed children. Empty companions are
  //        common in HeatTech (`row[col(rowlayout) col(∅)]`).
  if (
    columns.length >= 1 &&
    columns.length === inner.length &&
    columns.some((c) => {
      const ib = c.innerBlocks ?? [];
      return ib.length === 1 && ib[0].name === 'kadence/rowlayout';
    }) &&
    columns.every((c) => {
      const ib = c.innerBlocks ?? [];
      return (
        ib.length === 0 ||
        (ib.length === 1 && ib[0].name === 'kadence/rowlayout')
      );
    })
  ) {
    const sections = [];
    for (const c of columns) {
      const ib = c.innerBlocks ?? [];
      if (ib.length === 0) continue;
      const result = await rowlayout(ib[0], ctx);
      if (result == null) continue;
      if (Array.isArray(result)) sections.push(...result);
      else sections.push(result);
    }
    return sections.length > 0 ? sections : null;
  }

  // --- 3. Hero pattern: bg image + at least one heading + at least one button
  const hasHeading =
    childTypes.includes('kadence/advancedheading') || childTypes.includes('core/heading');
  const hasButton = childTypes.some((t) => KADENCE_BUTTON_NAMES.has(t));
  if (bgImage && hasHeading && hasButton) {
    return await asHero(block, ctx, bgImage);
  }

  // --- 4. Inline FAQ: single column containing kadence/pane children
  //        (sometimes with a trailing CTA button). Kadence panes are
  //        accordion items; treat the row as an inline accordion.
  if (columns.length === 1) {
    const kids = columns[0].innerBlocks ?? [];
    const panes = kids.filter((k) => k.name === 'kadence/pane');
    const buttons = kids.filter((k) => isButton(k));
    const nonPaneNonButton = kids.filter(
      (k) => k.name !== 'kadence/pane' && !isButton(k),
    );
    if (panes.length >= 2 && nonPaneNonButton.length === 0) {
      const out = [
        {
          _type: 'faqSection',
          _key: `faq${Math.random().toString(36).slice(2, 8)}`,
          title: '',
          items: panes.map((pane) => ({
            _type: 'faqItem',
            _key: `q${Math.random().toString(36).slice(2, 8)}`,
            question:
              pane.attrs?.title ??
              stripHtml(pane.attrs?.titleAttr ?? '') ??
              'Question',
            answer: ctx.toPortableText(pane.innerHTML ?? ''),
          })),
        },
      ];
      if (buttons.length > 0) {
        out.push(ctaSectionFromButtons(buttons));
      }
      return out;
    }
  }

  // --- 5. Info-box grid: 2+ columns each containing a kadence/info-box
  const infoBoxes = columns
    .map((c) => c.innerBlocks?.find((b) => b.name === 'kadence/info-box'))
    .filter(Boolean);
  if (infoBoxes.length >= 2 && infoBoxes.length === columns.length) {
    return await asIconGrid(infoBoxes, ctx);
  }

  // --- 6. 2-col text+image: exactly 2 columns, one image, one text
  if (columns.length === 2) {
    const imageColIdx = columns.findIndex((c) =>
      (c.innerBlocks ?? []).some(
        (b) => b.name === 'core/image' || b.name === 'kadence/image',
      ),
    );
    const textColIdx = columns.findIndex((c) =>
      (c.innerBlocks ?? []).some((b) => b.name !== 'core/image' && b.name !== 'kadence/image'),
    );
    if (imageColIdx >= 0 && textColIdx >= 0 && imageColIdx !== textColIdx) {
      return await asTwoColTextImage(columns, imageColIdx, textColIdx, ctx);
    }
  }

  // --- 7. Image-only row: 2 columns, one has an image, the other is empty.
  //        Emit a twoColTextImageSection with empty body so the image still
  //        renders at section width. Editor fills the text side in Studio.
  if (columns.length === 2) {
    const imageColIdx = columns.findIndex((c) =>
      (c.innerBlocks ?? []).some(
        (b) => b.name === 'core/image' || b.name === 'kadence/image',
      ),
    );
    const emptyColIdx = columns.findIndex(
      (c) => (c.innerBlocks ?? []).length === 0,
    );
    if (imageColIdx >= 0 && emptyColIdx >= 0 && imageColIdx !== emptyColIdx) {
      const imgBlock = (columns[imageColIdx].innerBlocks ?? []).find(
        (b) => b.name === 'core/image' || b.name === 'kadence/image',
      );
      const imgUrl = extractImageUrl(imgBlock);
      return {
        _type: 'twoColTextImageSection',
        _key: `tc${Math.random().toString(36).slice(2, 8)}`,
        title: '',
        body: ctx.toPortableText(''),
        image: imgUrl ? await ctx.uploadImage(imgUrl, '') : null,
        imagePosition: imageColIdx < emptyColIdx ? 'left' : 'right',
        _migrationNote:
          'Single-image row migrated from kadence/rowlayout. Companion column was empty in WP — add body copy in Studio if desired.',
      };
    }
  }

  // --- 8. Button-only row: meaningful content is just one or more
  //        kadence button blocks (advancedbtn or singlebtn) with optionally
  //        empty companion columns. Covers row[advancedbtn],
  //        row[col(advancedbtn) col(∅)], row[col(∅) col(singlebtn)], etc.
  const isButtonOnly = inner.every((b) => {
    if (isButton(b)) return true;
    if (b.name === 'kadence/column') {
      const kids = b.innerBlocks ?? [];
      return kids.length === 0 || kids.every((k) => isButton(k));
    }
    return false;
  });
  const buttonChildren = inner.flatMap((b) => {
    if (isButton(b)) return [b];
    if (b.name === 'kadence/column') {
      return (b.innerBlocks ?? []).filter((k) => isButton(k));
    }
    return [];
  });
  if (isButtonOnly && buttonChildren.length >= 1) {
    return ctaSectionFromButtons(buttonChildren);
  }

  // --- 9. Single-list row: one column with one or more list blocks. Map
  //        to htmlSection to preserve markup; not common enough to justify
  //        a dedicated bulletListSection.
  if (columns.length === 1) {
    const kids = columns[0].innerBlocks ?? [];
    if (
      kids.length >= 1 &&
      kids.every((k) => k.name === 'core/list' || k.name === 'kadence/iconlist')
    ) {
      return {
        _type: 'htmlSection',
        _key: `lh${Math.random().toString(36).slice(2, 8)}`,
        title: '',
        htmlContent: kids.map((k) => k.innerHTML ?? '').join('\n'),
      };
    }
  }

  // --- 10. Default: render the rowlayout's inner blocks as a series of
  //         independent sections (recurse), so nested rowlayouts and
  //         standalone blocks inside this row each get their own mapper.
  const sections = [];
  for (const child of inner.flatMap((c) =>
    c.name === 'kadence/column' ? c.innerBlocks ?? [] : [c],
  )) {
    const result = await mapBlockToSection(child, ctx);
    if (result == null) continue;
    if (Array.isArray(result)) sections.push(...result);
    else sections.push(result);
  }
  return sections.length > 0 ? sections : null;
}

// ===== Helpers =====

function collectChildTypes(block) {
  const types = [block.name];
  for (const child of block.innerBlocks ?? []) {
    types.push(...collectChildTypes(child));
  }
  return types;
}

function ctaSectionFromButtons(buttons) {
  return {
    _type: 'ctaSection',
    _key: `cta${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    primaryCta: {
      label: buttonLabel(buttons[0]),
      href: buttonHref(buttons[0]),
    },
    secondaryCta: buttons[1]
      ? {
          label: buttonLabel(buttons[1]),
          href: buttonHref(buttons[1]),
        }
      : null,
    layoutStyle: 'compact',
    sectionBackground: 'inherit',
  };
}

async function asHero(block, ctx, bgImageUrl) {
  // Walk inner blocks; pluck the first heading as title, body paragraphs as subtitle,
  // and any kadence button (advancedbtn or singlebtn) instances as CTAs
  const flat = flattenBlocks(block.innerBlocks);
  const headings = flat.filter(
    (b) => b.name === 'kadence/advancedheading' || b.name === 'core/heading',
  );
  const buttons = flat.filter((b) => isButton(b));
  const paragraphs = flat.filter((b) => b.name === 'core/paragraph');

  const title = headings[0] ? stripHtml(headings[0].innerHTML) : '';
  const subtitle = paragraphs.length > 0 ? stripHtml(paragraphs[0].innerHTML) : '';
  const sideImage = await ctx.uploadImage(bgImageUrl, title);

  return {
    _type: 'heroSection',
    _key: `h${Math.random().toString(36).slice(2, 8)}`,
    title,
    subtitle,
    sideImage,
    primaryCta: buttons[0]
      ? { label: buttonLabel(buttons[0]), href: buttonHref(buttons[0]) }
      : null,
    secondaryCta: buttons[1]
      ? { label: buttonLabel(buttons[1]), href: buttonHref(buttons[1]) }
      : null,
    layoutStyle: '1-col',
  };
}

async function asIconGrid(infoBoxes, ctx) {
  const items = await Promise.all(
    infoBoxes.map(async (box) => {
      const flat = flattenBlocks(box.innerBlocks);
      const headings = flat.filter((b) => b.name === 'kadence/advancedheading');
      const paragraphs = flat.filter((b) => b.name === 'core/paragraph');
      const iconUrl = box.attrs?.icon?.url ?? box.attrs?.mediaImage?.[0]?.url ?? null;
      return {
        _type: 'iconGridItem',
        _key: `ib${Math.random().toString(36).slice(2, 8)}`,
        title: headings[0] ? stripHtml(headings[0].innerHTML) : '',
        description: paragraphs[0] ? stripHtml(paragraphs[0].innerHTML) : '',
        icon: iconUrl ? await ctx.uploadImage(iconUrl, '') : null,
      };
    }),
  );

  return {
    _type: 'iconGridSection',
    _key: `ig${Math.random().toString(36).slice(2, 8)}`,
    size: 'medium',
    layout: 'vertical',
    cardStyle: 'card',
    items,
  };
}

async function asTwoColTextImage(columns, imageColIdx, textColIdx, ctx) {
  const imageCol = columns[imageColIdx];
  const textCol = columns[textColIdx];
  const imgBlock = (imageCol.innerBlocks ?? []).find(
    (b) => b.name === 'core/image' || b.name === 'kadence/image',
  );
  const imgUrl = extractImageUrl(imgBlock);
  const flat = flattenBlocks(textCol.innerBlocks);
  const headings = flat.filter(
    (b) => b.name === 'kadence/advancedheading' || b.name === 'core/heading',
  );
  const title = headings[0] ? stripHtml(headings[0].innerHTML) : '';
  const bodyHtml = (textCol.innerBlocks ?? [])
    .filter(
      (b) => b.name !== 'kadence/advancedheading' && b.name !== 'core/heading',
    )
    .map((b) => b.innerHTML ?? '')
    .join('\n');

  return {
    _type: 'twoColTextImageSection',
    _key: `tc${Math.random().toString(36).slice(2, 8)}`,
    title,
    body: ctx.toPortableText(bodyHtml),
    image: imgUrl ? await ctx.uploadImage(imgUrl, title) : null,
    imagePosition: imageColIdx < textColIdx ? 'left' : 'right',
  };
}

function flattenBlocks(blocks) {
  const out = [];
  for (const b of blocks ?? []) {
    out.push(b);
    if (b.innerBlocks?.length) out.push(...flattenBlocks(b.innerBlocks));
  }
  return out;
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function extractImageUrl(block) {
  if (!block) return null;
  // core/image stores HTML <img src="..." />
  const match = (block.innerHTML ?? '').match(/<img[^>]+src=["']([^"']+)["']/);
  if (match) return match[1];
  // kadence/image stores attrs.mediaImage[0].url
  return block.attrs?.mediaImage?.[0]?.url ?? null;
}
