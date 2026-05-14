import { createClient } from '@sanity/client';

let client: ReturnType<typeof createClient> | null = null;

export function getSanityClient() {
  // Return cached client if available
  if (client) {
    return client;
  }

  const projectId = import.meta.env.SANITY_PROJECT_ID;
  const dataset = import.meta.env.SANITY_DATASET;

  // Validate environment variables
  if (!projectId || !dataset) {
    console.error('Sanity client configuration missing: SANITY_PROJECT_ID and SANITY_DATASET are required');
    return null;
  }

  const apiVersion = import.meta.env.SANITY_API_VERSION ?? '2024-05-12';
  const token = import.meta.env.SANITY_API_TOKEN;
  // Disable CDN if token is present to ensure absolute freshness for ISR/on-demand rendering
  const useCdn = token ? false : (import.meta.env.SANITY_USE_CDN ?? 'true') === 'true';

  client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    perspective: 'published',
    token
  });

  return client;
}
