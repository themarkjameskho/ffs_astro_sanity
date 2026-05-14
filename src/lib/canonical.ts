const PREFERRED_SITE_URL = '{{SITE_URL}}';
const PREFERRED_SITE_ORIGIN = new URL(PREFERRED_SITE_URL).origin;
const PREFERRED_HOSTNAME = new URL(PREFERRED_SITE_URL).hostname.toLowerCase();
const INTERNAL_HOSTNAMES = new Set([PREFERRED_HOSTNAME, `www.${PREFERRED_HOSTNAME}`]);

type NormalizeOptions = {
  trailingSlash?: 'always' | 'never';
  lowercase?: boolean;
};

const normalizePathname = (
  pathname: string,
  { trailingSlash = 'always', lowercase = true }: NormalizeOptions = {}
) => {
  let path = pathname?.trim() || '/';

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  if (lowercase) {
    path = path.toLowerCase();
  }

  path = path.replace(/\/index\.html$/i, '/').replace(/\/{2,}/g, '/');

  if (path === '') {
    path = '/';
  }

  const hasExtension = /\.[a-z0-9]+$/i.test(path);
  if (trailingSlash === 'always' && path !== '/' && !hasExtension && !path.endsWith('/')) {
    path += '/';
  }

  if (trailingSlash === 'never' && path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path;
};

const buildInternalUrl = (pathname: string, options?: NormalizeOptions) =>
  `${PREFERRED_SITE_ORIGIN}${normalizePathname(pathname, options)}`;

const normalizeOverride = (
  override: string,
  currentPathname?: string,
  options?: NormalizeOptions
) => {
  const raw = override?.trim();
  if (!raw) return null;
  if (/\s/.test(raw)) return null;

  let url;
  try {
    if (/^https?:\/\//i.test(raw)) {
      url = new URL(raw);
    } else if (raw.startsWith('/')) {
      url = new URL(raw, PREFERRED_SITE_ORIGIN);
    } else {
      return null;
    }
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  const isInternal = INTERNAL_HOSTNAMES.has(hostname);

  if (isInternal) {
    const normalizedCurrent = currentPathname ? normalizePathname(currentPathname, options) : null;
    const normalizedOverride = normalizePathname(url.pathname, options);
    if (normalizedCurrent && normalizedOverride !== normalizedCurrent) {
      return null;
    }
    return `${PREFERRED_SITE_ORIGIN}${normalizedOverride}`;
  }

  url.hash = '';
  return url.toString();
};

export const buildCanonicalUrl = ({
  pathname,
  override,
  trailingSlash = 'always',
  lowercase = true
}: {
  pathname: string;
  override?: string | null;
  trailingSlash?: 'always' | 'never';
  lowercase?: boolean;
}) =>
  normalizeOverride(override ?? '', pathname, { trailingSlash, lowercase }) ??
  buildInternalUrl(pathname, { trailingSlash, lowercase });

export { PREFERRED_SITE_ORIGIN, PREFERRED_SITE_URL };
