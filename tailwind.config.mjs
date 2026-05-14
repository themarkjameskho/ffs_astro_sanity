/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '!./studio/.sanity/**',
    '!./studio/node_modules/**',
    '!./node_modules/**',
    '!./dist/**',
    '!./.astro/**'
  ],
  theme: {
    extend: {
      colors: {
        'color-primary': 'var(--color-primary)',
        'color-secondary': 'var(--color-secondary)',
        'color-surface': 'var(--color-surface)',
        'color-panel': 'var(--color-panel)',
        'color-text-muted': 'var(--color-text-muted)',
        'color-dark': 'var(--color-dark)',
      }
    }
  },
  // Optimize for production
  safelist: [
    'text-primary',
    'bg-white',
    'text-slate-900',
    'text-color-primary'
  ]
};
