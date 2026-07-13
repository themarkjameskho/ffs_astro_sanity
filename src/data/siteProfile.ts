const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const readEnv = (key: string, fallback = '') => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
};

const siteUrl = trimTrailingSlash(
  readEnv('SITE_URL', readEnv('PUBLIC_SITE_URL', 'https://example.com'))
);

export const siteProfile = {
  brandName: readEnv('BRAND_NAME', readEnv('PUBLIC_BRAND_NAME', 'FFS Pest Control')),
  brandAbbrev: readEnv('BRAND_ABBREV', readEnv('PUBLIC_BRAND_ABBREV', 'FFS')),
  brandSlug: readEnv('BRAND_SLUG', readEnv('PUBLIC_BRAND_SLUG', 'ffs-pest-control')),
  siteUrl,
  logoPath: '/src/assets/logo-wordmark.svg',
  primaryPhoneFormatted: readEnv('PHONE_PRIMARY_FORMATTED', '(555) 555-0100'),
  primaryPhoneE164NoPlus: readEnv('PHONE_PRIMARY_E164_NOPLUS', '15555550100'),
  primaryPhoneDashed: readEnv('PHONE_PRIMARY_DASHED', '+1-555-555-0100'),
  secondaryPhoneFormatted: readEnv('PHONE_SECONDARY_FORMATTED', '(555) 555-0101'),
  secondaryPhoneE164NoPlus: readEnv('PHONE_SECONDARY_E164_NOPLUS', '15555550101'),
  secondaryPhoneDashed: readEnv('PHONE_SECONDARY_DASHED', '+1-555-555-0101'),
  streetAddress: readEnv('NAP_STREET_ADDRESS', 'Service Area Office'),
  city: readEnv('NAP_CITY', 'Local Market'),
  region: readEnv('NAP_REGION', 'IL'),
  zip: readEnv('NAP_ZIP', '00000'),
  latitude: Number(readEnv('NAP_LATITUDE', '41.8781')),
  longitude: Number(readEnv('NAP_LONGITUDE', '-87.6298')),
  ga4MeasurementId: readEnv('PUBLIC_GA4_MEASUREMENT_ID', readEnv('GA4_MEASUREMENT_ID')),
  callRailCompanyId: readEnv('PUBLIC_CALLRAIL_COMPANY_ID', readEnv('CALLRAIL_COMPANY_ID')),
  callRailSwapKey: readEnv('PUBLIC_CALLRAIL_SWAP_KEY', readEnv('CALLRAIL_SWAP_KEY'))
} as const;

export const getAbsoluteSiteUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteProfile.siteUrl}${normalizedPath}`;
};
