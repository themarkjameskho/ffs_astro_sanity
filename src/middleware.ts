import type { MiddlewareHandler } from 'astro';

const hasFileExtension = (pathname: string) => {
  const lastSegment = pathname.split('/').pop() ?? '';
  return lastSegment.includes('.');
};

const shouldSkipRedirect = (pathname: string) =>
  pathname.startsWith('/_astro') ||
  pathname.startsWith('/@') ||
  pathname.startsWith('/__') ||
  pathname.startsWith('/api');

export const onRequest: MiddlewareHandler = ({ request }, next) => {
  const url = new URL(request.url);
  const { pathname } = url;

  if (
    pathname !== '/' &&
    !pathname.endsWith('/') &&
    !hasFileExtension(pathname) &&
    !shouldSkipRedirect(pathname)
  ) {
    url.pathname = `${pathname}/`;
    return Response.redirect(url.toString(), 301);
  }

  return next();
};
