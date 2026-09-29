import { createClient } from '@sanity/client';

let client: ReturnType<typeof createClient> | null = null;

function normalizeConfiguredValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const wrapped = trimmed.match(/^\{\{([\s\S]+)\}\}$/);
  return wrapped ? wrapped[1].trim() : trimmed;
}

function isConfiguredValue(value: string | undefined) {
  return Boolean(normalizeConfiguredValue(value));
}

function isValidProjectId(value: string | undefined) {
  return isConfiguredValue(value) && /^[a-z0-9-]+$/i.test(value!);
}

function isValidDataset(value: string | undefined) {
  return isConfiguredValue(value) && /^(~?[a-z0-9][a-z0-9_-]{0,63})$/i.test(value!);
}

export function getSanityClient() {
  // Return cached client if available
  if (client) {
    return client;
  }

  const projectId = normalizeConfiguredValue(import.meta.env.SANITY_PROJECT_ID);
  const dataset = normalizeConfiguredValue(import.meta.env.SANITY_DATASET);

  // Validate environment variables
  if (!isValidProjectId(projectId) || !isValidDataset(dataset)) {
    console.warn(
      'Sanity client is unavailable: configure valid SANITY_PROJECT_ID and SANITY_DATASET values before previewing CMS content.'
    );
    return null;
  }

  const apiVersion = import.meta.env.SANITY_API_VERSION ?? '2024-05-12';
  const configuredToken = import.meta.env.SANITY_API_TOKEN;
  const token = isConfiguredValue(configuredToken)
    ? normalizeConfiguredValue(configuredToken)
    : undefined;
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
