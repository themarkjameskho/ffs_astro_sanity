// @ts-check
// Build: 2025-11-21 deployment with yellow sticky header fixes
// ISR Configuration: Automatic revalidation on content updates via Sanity webhook
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';


const site = 'https://{{VERCEL_PREVIEW_DOMAIN}}';

export default defineConfig({
  site,
  trailingSlash: 'always',
  prefetch: false,
  integrations: [],
  adapter: vercel({
    webAnalytics: { enabled: true },
    isr: {
      expiration: 60,
      bypassToken: process.env.SANITY_WEBHOOK_SECRET
    }
  }),
  output: 'static',
  build: {
    inlineStylesheets: 'always'
  },
  image: {
    // Enable automatic image optimization for better LCP
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io'
      }
    ]
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: [
          '**/studio/.sanity/**',
          '**/studio/node_modules/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/.astro/**'
        ]
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
          passes: 2
        },
        mangle: true
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['@sanity/client', '@portabletext/to-html']
          }
        }
      },
      cssCodeSplit: true,
      cssMinify: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 500
    },
    ssr: {
      external: ['@sanity/client']
    }
  },
  compressHTML: true
});
