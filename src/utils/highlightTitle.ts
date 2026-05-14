export type HighlightSegment = { text: string; highlight: boolean };

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function splitHighlight(text?: string, highlight?: string): HighlightSegment[] {
  if (!text) return [];
  if (!highlight) return [{ text, highlight: false }];

  const trimmed = highlight.trim();
  if (!trimmed) return [{ text, highlight: false }];

  const pattern = new RegExp(`(${escapeRegex(trimmed)})`, 'gi');
  const segments = text.split(pattern).filter(Boolean);

  return segments.map((segment) => ({
    text: segment,
    highlight: segment.toLowerCase() === trimmed.toLowerCase()
  }));
}
