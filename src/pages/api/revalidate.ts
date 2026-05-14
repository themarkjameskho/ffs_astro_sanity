import type { APIRoute } from 'astro';

export const prerender = false;

const SECRET = process.env.SANITY_WEBHOOK_SECRET;

const buildOrigin = (request: Request) => {
  try {
    const url = new URL(request.url);
    if (url.origin && url.origin !== 'null') {
      return url.origin;
    }
  } catch {
    // Fall through to header-based resolution.
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host');

  if (forwardedProto && host) {
    return `${forwardedProto}://${host}`;
  }

  if (host) {
    return `https://${host}`;
  }

  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  if (process.env.PUBLIC_SITE_URL) {
    return process.env.PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'https://{{fork_source_slug}}pestcontrol.com';
};

const normalizePath = (slug?: string) => {
  if (!slug) return null;
  const trimmed = slug.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed || trimmed === 'home') return '/';
  return `/${trimmed}/`;
};

const extractPaths = (payload: any) => {
  const paths = new Set<string>(['/']);

  const slugCandidates: Array<string | undefined> = [
    payload?.slug?.current,
    payload?.slug,
    payload?.document?.slug?.current,
    payload?.document?.slug,
    payload?.data?.slug?.current,
    payload?.data?.slug,
  ];

  const additionalPaths: Array<string | undefined> = Array.isArray(payload?.paths)
    ? payload.paths
    : [];

  for (const candidate of [...slugCandidates, ...additionalPaths]) {
    if (typeof candidate !== 'string') continue;
    const normalized = normalizePath(candidate);
    if (normalized) paths.add(normalized);
  }

  return Array.from(paths);
};

export const POST: APIRoute = async ({ request }) => {
  if (!SECRET) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'SANITY_WEBHOOK_SECRET is not configured.'
      }),
      { status: 500 }
    );
  }

  const incomingSecret = request.headers.get('x-vercel-webhook-secret');
  if (incomingSecret !== SECRET) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid webhook secret.' }), {
      status: 401
    });
  }

  let payload: any = null;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const origin = buildOrigin(request);
  const paths = extractPaths(payload);

  const revalidateHeader = {
    'x-prerender-revalidate': SECRET
  };

  const results = await Promise.all(
    paths.map(async (path) => {
      const url = `${origin}${path}`;
      try {
        const response = await fetch(url, { method: 'GET', headers: revalidateHeader });
        return { path, status: response.status };
      } catch (error) {
        return { path, status: 500, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    })
  );

  const failed = results.filter((result) => result.status >= 400);

  return new Response(
    JSON.stringify({
      success: failed.length === 0,
      origin,
      revalidated: results
    }),
    { status: failed.length === 0 ? 200 : 207 }
  );
};

export const ALL: APIRoute = () =>
  new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { Allow: 'POST' }
  });
