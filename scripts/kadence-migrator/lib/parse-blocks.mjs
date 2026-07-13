/**
 * Minimal WordPress Gutenberg block parser.
 *
 * Walks the raw block content (with <!-- wp:* --> comment markers) and
 * returns a tree of block objects:
 *
 *   { name, attrs, innerHTML, innerBlocks: [...] }
 *
 * This is a *minimal* implementation tailored to what the Kadence
 * migrator needs. For a battle-tested parser, swap this out for
 * `@wordpress/block-serialization-default-parser` (npm). The minimal
 * version here avoids adding a dependency for the starter; the API
 * matches the official parser's output shape so the swap is trivial.
 */

const OPEN_RE = /<!--\s+wp:([a-zA-Z0-9_\-\/]+)\s*(\{[^}]*\})?\s*(\/)?-->/;
const CLOSE_RE = /<!--\s+\/wp:([a-zA-Z0-9_\-\/]+)\s+-->/;

export function parseBlocks(content) {
  if (!content || typeof content !== 'string') return [];
  // Strip leading/trailing whitespace; WP often has lots
  let cursor = 0;
  const root = [];
  const stack = [{ children: root, name: '_root_' }];

  while (cursor < content.length) {
    // Find the next open or close marker after cursor
    const remaining = content.slice(cursor);
    const openMatch = remaining.match(OPEN_RE);
    const closeMatch = remaining.match(CLOSE_RE);

    const openIdx = openMatch ? remaining.indexOf(openMatch[0]) : -1;
    const closeIdx = closeMatch ? remaining.indexOf(closeMatch[0]) : -1;

    // Whichever marker comes first wins
    let next;
    if (openIdx === -1 && closeIdx === -1) {
      // No more markers — done
      break;
    } else if (openIdx === -1) {
      next = { kind: 'close', match: closeMatch, idx: closeIdx };
    } else if (closeIdx === -1) {
      next = { kind: 'open', match: openMatch, idx: openIdx };
    } else if (openIdx < closeIdx) {
      next = { kind: 'open', match: openMatch, idx: openIdx };
    } else {
      next = { kind: 'close', match: closeMatch, idx: closeIdx };
    }

    if (next.kind === 'open') {
      const [fullMatch, name, attrsRaw, selfClose] = next.match;
      let attrs = {};
      if (attrsRaw) {
        try {
          attrs = JSON.parse(attrsRaw);
        } catch {
          attrs = {};
        }
      }
      const block = { name, attrs, innerHTML: '', innerBlocks: [] };
      // Push onto current parent
      stack[stack.length - 1].children.push(block);
      cursor += next.idx + fullMatch.length;

      if (selfClose) {
        // Self-closing block has no inner content
        continue;
      }
      // Enter this block — its inner content (until its close marker)
      // becomes its innerHTML, with nested blocks pulled into innerBlocks.
      stack.push({ children: block.innerBlocks, name, block });
    } else {
      // Close: pop the matching stack frame, capture innerHTML
      const [fullMatch, name] = next.match;
      // Everything between cursor and this close marker is innerHTML
      const innerHtmlChunk = content.slice(cursor, cursor + next.idx);
      // Find the parent and assign
      const frame = stack[stack.length - 1];
      if (frame.block && frame.name === name) {
        // Append to whatever innerHTML the block already had (from nested
        // close markers it might have already passed).
        frame.block.innerHTML = (frame.block.innerHTML + innerHtmlChunk).trim();
        stack.pop();
      } else {
        // Mismatched close — be lenient, skip it
      }
      cursor += next.idx + fullMatch.length;
    }
  }

  return root;
}
