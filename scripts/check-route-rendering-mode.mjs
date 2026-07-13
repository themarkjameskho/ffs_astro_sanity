#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const ROUTES = ['src/pages/[...slug].astro', 'src/pages/blog/[slug].astro'];
const failures = [];

for (const route of ROUTES) {
  const source = await readFile(route, 'utf8');
  const hasPrerenderFalse = /export\s+const\s+prerender\s*=\s*false/.test(source);
  const hasPrerenderTrue = /export\s+const\s+prerender\s*=\s*true/.test(source);
  const hasGetStaticPaths = /export\s+async\s+function\s+getStaticPaths|export\s+function\s+getStaticPaths/.test(source);

  if (!hasPrerenderFalse) {
    failures.push(`${route}: dynamic CMS routes must use export const prerender = false`);
  }
  if (hasPrerenderTrue) {
    failures.push(`${route}: found prerender = true, which conflicts with the chosen on-demand ISR model`);
  }
  if (hasGetStaticPaths) {
    failures.push(`${route}: getStaticPaths() is ignored when prerender = false; remove it or switch the route model intentionally`);
  }
}

if (failures.length > 0) {
  console.error('Route rendering mode check failed:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Route rendering mode check passed.');
