const INTERNAL_SCHEMES = /^(https?:|mailto:|tel:|sms:)/i;
const INTERNAL_HOSTNAMES = new Set(['{{SITE_DOMAIN}}', 'www.{{SITE_DOMAIN}}']);

const splitLink = (href: string) => {
  const [pathAndQuery, hash] = href.split('#');
  const [path, query] = pathAndQuery.split('?');
  return { path, query, hash };
};

export function normalizeInternalHref(href?: string): string | undefined {
  if (!href) return undefined;
  const trimmed = href.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('#')) return trimmed;
  if (INTERNAL_SCHEMES.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (INTERNAL_HOSTNAMES.has(url.hostname.toLowerCase())) {
        const normalizedPath = normalizeInternalHref(url.pathname + url.search + url.hash);
        return normalizedPath ?? '/';
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const { path, query, hash } = splitLink(trimmed);
  let normalizedPath = path?.trim() || '/';
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  normalizedPath = normalizedPath.replace(/\/{2,}/g, '/');

  const hasExtension = /\.[a-z0-9]+$/i.test(normalizedPath);
  if (normalizedPath !== '/' && !hasExtension && !normalizedPath.endsWith('/')) {
    normalizedPath += '/';
  }

  let result = normalizedPath;
  if (query) result += `?${query}`;
  if (hash) result += `#${hash}`;
  return result;
};
