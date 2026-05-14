import type { Rule } from 'sanity';

type SlugValue = {
  current?: string;
};

export const SLUG_FIELD_DESCRIPTION =
  'URL path without a leading slash, trailing slash, or spaces (for example, bed-bug-treatment or service-area/tulsa/tulsa-bed-bug-heat-treatment).';

export const validateSlugValue = (value?: SlugValue) => {
  const current = value?.current;

  if (!current) return true;
  if (current.trim() !== current) return 'Slug cannot start or end with spaces.';
  if (current.startsWith('/')) return 'Slug cannot start with `/`.';
  if (current.endsWith('/')) return 'Slug cannot end with `/`.';
  if (/\s/.test(current)) return 'Slug cannot contain spaces. Use hyphens instead.';

  return true;
};

export const slugValidation = (rule: Rule) =>
  rule.required().custom(validateSlugValue);
