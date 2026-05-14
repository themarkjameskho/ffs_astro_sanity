import { toHTML } from '@portabletext/to-html';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { PortableTextBlock } from '@portabletext/types';
import { normalizeInternalHref } from './links';

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET;
const builder = projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null;

function urlForImage(value: any) {
  if (!builder) return '';
  try {
    return builder.image(value).auto('format').fit('max').width(1200).url() || '';
  } catch {
    return '';
  }
}

function getImageDimensions(value: any) {
  const width = value?.asset?.metadata?.dimensions?.width;
  const height = value?.asset?.metadata?.dimensions?.height;
  if (width && height) {
    return { width: Number(width), height: Number(height) };
  }
  const ref = value?.asset?._ref;
  if (typeof ref === 'string') {
    const match = ref.match(/-(\d+)x(\d+)-/);
    if (match) {
      return { width: Number(match[1]), height: Number(match[2]) };
    }
  }
  return null;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function portableTextToHtml(blocks?: PortableTextBlock[] | null, isDarkTheme: boolean = false): string {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return '';
  }

  const textColor = isDarkTheme ? 'text-white' : 'text-[#0f172a]';
  const headingColor = isDarkTheme ? 'text-white' : 'text-[#0f172a]';
  const linkColor = isDarkTheme ? 'text-yellow-300' : 'text-[#0675c9]';

  return toHTML(blocks, {
    components: {
      block: ({ value, children }) => {
        const style = (value as any).style || 'normal';
        if (style === 'h1') return `<h1 class="text-2xl font-semibold ${headingColor}">${children}</h1>`;
        if (style === 'h2') return `<h2 class="text-xl font-semibold ${headingColor}">${children}</h2>`;
        if (style === 'h3') return `<h3 class="text-lg font-semibold ${headingColor}">${children}</h3>`;
        if (style === 'h4') return `<h4 class="text-base font-semibold ${headingColor}">${children}</h4>`;
        if (style === 'h5') return `<h5 class="text-sm font-semibold ${headingColor}">${children}</h5>`;
        if (style === 'h6') return `<h6 class="text-xs font-semibold ${headingColor}">${children}</h6>`;
        if (style === 'blockquote') return `<blockquote class="border-l-4 ${isDarkTheme ? 'border-yellow-300' : 'border-[#0675c9]'} pl-4 italic ${textColor}">${children}</blockquote>`;
        if (style?.startsWith('h')) return `<h${style[1]} class="font-semibold ${headingColor}">${children}</h${style[1]}>`;

        const listItem = (value as any).listItem;
        if (listItem === 'bullet') {
          return `<li class="list-disc ${textColor}">${children}</li>`;
        }
        if (listItem === 'number') {
          return `<li class="list-decimal ${textColor}">${children}</li>`;
        }

        return `<p class="${textColor}">${children}</p>`;
      },
      list: ({ children, value }) => {
        const isNumbered = (value as any)?.listItem === 'number';
        const tag = isNumbered ? 'ol' : 'ul';
        return `<${tag} class="space-y-2 pl-5 ${isNumbered ? 'list-decimal' : 'list-disc'} ${textColor}">${children}</${tag}>`;
      },
      types: {
        image: ({ value }) => {
          const url = urlForImage(value);
          if (!url) return '';
          const alt = escapeHtml(value?.alt || '');
          const caption = alt ? `<figcaption class="mt-2 text-center text-sm text-slate-500">${alt}</figcaption>` : '';
          const dimensions = getImageDimensions(value);
          const width = dimensions?.width ?? 1200;
          const height = dimensions?.height ?? 800;
          // Cap the figure at the smaller of (a) container width, (b) the
          // image's own intrinsic width — so small WP-imported images don't
          // get stretched up to the full article width and pixelated. Center
          // the figure so smaller-than-container images don't sit awkwardly
          // flush-left. Aspect ratio still set on the img to prevent CLS.
          const maxFigureWidth = Math.min(width, 720);
          const figureStyle = `style="max-width: ${maxFigureWidth}px; margin-left: auto; margin-right: auto;"`;
          const aspectStyle = dimensions ? `style="aspect-ratio: ${width} / ${height};"` : '';
          return `<figure class="my-6" ${figureStyle}><img src="${url}" alt="${alt}" width="${width}" height="${height}" ${aspectStyle} class="w-full h-auto rounded-lg" loading="lazy" decoding="async" />${caption}</figure>`;
        }
      },
      marks: {
        strong: ({ children }) => `<strong class="font-semibold ${textColor}">${children}</strong>`,
        em: ({ children }) => `<em class="italic ${textColor}">${children}</em>`,
        link: ({ value, children }) => {
          const rawHref = (value as any)?.href;
          const href = normalizeInternalHref(rawHref) ?? rawHref ?? '#';
          return `<a href="${href}" class="${linkColor} underline hover:opacity-80">${children}</a>`;
        }
      }
    }
  });
}
