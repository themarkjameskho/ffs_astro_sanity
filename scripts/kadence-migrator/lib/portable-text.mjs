/**
 * Minimal HTML → Portable Text converter for Kadence/Gutenberg content.
 *
 * Handles the common cases that appear inside block innerHTML:
 *   - <p>...</p> → block with style="normal"
 *   - <h1>..<h6> → block with style="h1".."h6"
 *   - <ul>/<ol>/<li> → block with listItem + level
 *   - <strong>/<b>, <em>/<i>, <a> → marks within a block
 *   - <br> → soft break (becomes a newline span)
 *
 * For richer fidelity later, swap this for `@portabletext/block-tools` or
 * a custom serializer. For Kadence migration, the v0.1 fidelity is enough:
 * editors will polish in Studio after the import lands.
 */
import { load } from 'cheerio';

let _markKeyCounter = 0;
const nextKey = () => `m${(_markKeyCounter++).toString(36)}`;

function textWithMarks($, $node) {
  // Walk children, emitting spans with marks for <strong>/<em>/<a>
  const spans = [];
  const markDefs = [];

  function walk(el, activeMarks) {
    el.contents().each((_, child) => {
      if (child.type === 'text') {
        spans.push({
          _type: 'span',
          _key: nextKey(),
          text: child.data,
          marks: [...activeMarks],
        });
      } else if (child.type === 'tag') {
        const $child = $(child);
        let newMarks = [...activeMarks];
        if (child.name === 'strong' || child.name === 'b') newMarks.push('strong');
        if (child.name === 'em' || child.name === 'i') newMarks.push('em');
        if (child.name === 'a') {
          const href = $child.attr('href');
          if (href) {
            const key = nextKey();
            markDefs.push({ _type: 'link', _key: key, href });
            newMarks.push(key);
          }
        }
        if (child.name === 'br') {
          spans.push({ _type: 'span', _key: nextKey(), text: '\n', marks: [...activeMarks] });
        } else {
          walk($child, newMarks);
        }
      }
    });
  }

  walk($node, []);
  return { spans, markDefs };
}

export function htmlToPortableText(html) {
  if (!html || typeof html !== 'string') return [];
  const $ = load(`<div id="__root">${html}</div>`);
  const root = $('#__root');
  const blocks = [];

  root.children().each((_, el) => {
    const $el = $(el);
    const tag = el.name;
    if (['p'].includes(tag)) {
      const { spans, markDefs } = textWithMarks($, $el);
      if (spans.length > 0) {
        blocks.push({
          _type: 'block',
          _key: `b${blocks.length.toString(36)}`,
          style: 'normal',
          markDefs,
          children: spans,
        });
      }
    } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      const { spans, markDefs } = textWithMarks($, $el);
      blocks.push({
        _type: 'block',
        _key: `b${blocks.length.toString(36)}`,
        style: tag,
        markDefs,
        children: spans,
      });
    } else if (['ul', 'ol'].includes(tag)) {
      const listType = tag === 'ul' ? 'bullet' : 'number';
      $el.children('li').each((_, liEl) => {
        const { spans, markDefs } = textWithMarks($, $(liEl));
        blocks.push({
          _type: 'block',
          _key: `b${blocks.length.toString(36)}`,
          style: 'normal',
          listItem: listType,
          level: 1,
          markDefs,
          children: spans,
        });
      });
    }
    // div / other wrappers: recursively flatten their children
    else if (['div', 'section', 'article'].includes(tag)) {
      const innerBlocks = htmlToPortableText($el.html() ?? '');
      blocks.push(...innerBlocks);
    }
    // Unrecognized: emit as plain text in a normal block
    else {
      const text = $el.text().trim();
      if (text) {
        blocks.push({
          _type: 'block',
          _key: `b${blocks.length.toString(36)}`,
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: nextKey(), text, marks: [] }],
        });
      }
    }
  });

  return blocks;
}
