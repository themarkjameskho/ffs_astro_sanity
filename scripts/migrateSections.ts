import 'dotenv/config';
import groq from 'groq';
import { createClient } from '@sanity/client';

type OldSection = {
  _type: string;
  _key?: string;
  [key: string]: any;
};

type PageWithSections = {
  _id: string;
  title?: string;
  sections?: OldSection[];
};

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error('SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_TOKEN are required.');
}

const apiVersion = process.env.SANITY_API_VERSION ?? '2024-05-12';

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false,
  ignoreBrowserTokenWarning: true
});

const query = groq`
  *[_type == "page" && count(sections[_type in ["treatmentSection","structuresSection","iconGridSection"]]) > 0] {
    _id,
    title,
    sections[]{
      ...,
      options[]{..., icon{alt, asset{_ref, _id}}},
      structures[]{..., icon{alt, asset{_ref, _id}}},
      items[]{..., icon{alt, asset{_ref, _id}}}
    }
  }
`;

const clampColumns = (value: number | undefined) => {
  if (!value) return 2;
  return Math.min(4, Math.max(2, value));
};

const buildItemKey = (sectionKey: string | undefined, index: number, suffix: string) =>
  sectionKey ? `${sectionKey}-${suffix}-${index}` : `${suffix}-${index}`;

const buildImageValue = (icon: any) => {
  const assetId = icon?.asset?._ref ?? icon?.asset?._id;
  if (!assetId) {
    return undefined;
  }

  const normalized: Record<string, any> = {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: assetId
    }
  };

  if (icon?.alt) {
    normalized.alt = icon.alt;
  }

  return normalized;
};

const normalizeIconItem = (item: any, sectionKey: string | undefined, index: number, suffix: string) => {
  const normalizedIcon = buildImageValue(item.icon);
  const newItem: Record<string, any> = { ...item, _type: 'iconItem' };

  if (!newItem._key) {
    newItem._key = buildItemKey(sectionKey, index, suffix);
  }

  if (normalizedIcon) {
    newItem.icon = normalizedIcon;
  }

  return newItem;
};

const sanitizeIconObject = (icon: any) => {
  if (!icon?.asset) {
    return icon;
  }

  const sanitizedAsset = { ...icon.asset };
  delete sanitizedAsset._id;

  if (sanitizedAsset === icon.asset) {
    return icon;
  }

  return { ...icon, asset: sanitizedAsset };
};

const sanitizeIconArray = (items: any[] | undefined) =>
  items?.map((item) => {
    if (!item || typeof item !== 'object') {
      return item;
    }

    const sanitizedItem: Record<string, any> = { ...item };
    const sanitizedIcon = sanitizeIconObject(item.icon);
    if (sanitizedIcon !== item.icon) {
      sanitizedItem.icon = sanitizedIcon;
    }
    return sanitizedItem;
  }) ?? items;

const sanitizeSectionForPatch = (section: OldSection) => {
  const sanitized: Record<string, any> = { ...section };
  sanitized.options = sanitizeIconArray(section.options);
  sanitized.structures = sanitizeIconArray(section.structures);
  sanitized.items = sanitizeIconArray(section.items);
  return sanitized;
};

const mapTreatmentSection = (section: OldSection, index: number) => {
  const items = (section.options ?? [])
    .filter((option: any) => option?.label)
    .map((option: any, optionIndex: number) =>
      normalizeIconItem(option, section._key, optionIndex, 'treatment')
    );

  if (!items.length) return null;

  return {
    _type: 'iconGridSection',
    _key: section._key ?? `icon-grid-${section._type ?? 'treatment'}-${index}`,
    title: section.title,
    highlightText: section.highlightText,
    description: section.subtitle,
    layout: 'vertical',
    size: 'small',
    columns: clampColumns(section.columns),
    ctaLabel: section.ctaLabel,
    ctaLink: section.ctaLink,
    items
  };
};

const mapStructuresSection = (section: OldSection, index: number) => {
  const items = (section.structures ?? [])
    .filter((structure: any) => structure?.label)
    .map((structure: any, structureIndex: number) =>
      normalizeIconItem(structure, section._key, structureIndex, 'structure')
    );

  if (!items.length) return null;

  return {
    _type: 'iconGridSection',
    _key: section._key ?? `icon-grid-${section._type ?? 'structures'}-${index}`,
    title: section.title,
    highlightText: section.highlightText,
    description: section.description,
    layout: section.layoutStyle === 'iconList' ? 'horizontal' : 'vertical',
    size: 'small',
    columns: clampColumns(section.columns),
    ctaLabel: section.ctaLabel,
    ctaLink: section.ctaLink,
    items
  };
};

const needsIconReferenceFix = (section: OldSection) => {
  if (section._type !== 'iconGridSection') {
    return false;
  }

  return (section.items ?? []).some((item: any) => {
    const asset = item?.icon?.asset;
    return asset && !asset._ref && !!asset._id;
  });
};

const mapIconGridSection = (section: OldSection, index: number) => ({
  ...section,
  items: (section.items ?? []).map((item: any, itemIndex: number) =>
    normalizeIconItem(item, section._key, itemIndex, 'icon')
  )
});

const convertSection = (section: OldSection, index: number) => {
  if (!section) {
    return section;
  }

  if (section._type === 'treatmentSection') {
    return mapTreatmentSection(section, index) ?? section;
  }

  if (section._type === 'structuresSection') {
    return mapStructuresSection(section, index) ?? section;
  }

  if (needsIconReferenceFix(section)) {
    return mapIconGridSection(section, index);
  }

  return section;
};

async function main() {
  const pages: PageWithSections[] = await client.fetch(query);

  if (!pages.length) {
    console.log('No pages found that still reference treatmentSection or structuresSection.');
    return;
  }

  const dryRun = process.argv.includes('--dry');
  for (const page of pages) {
  const originalSections = page.sections ?? [];
  let replacementCount = 0;
    const convertedSections = originalSections.map((section, index) => {
      const converted = convertSection(section, index);
      if (
        (section._type === 'treatmentSection' || section._type === 'structuresSection') &&
        converted._type === 'iconGridSection'
      ) {
        replacementCount += 1;
      }

      if (section._type === 'iconGridSection' && needsIconReferenceFix(section)) {
        replacementCount += 1;
      }
      return converted;
    });

    const sanitizedSections = convertedSections.map(sanitizeSectionForPatch);

    if (!replacementCount) {
      console.log(`Page "${page.title ?? page._id}" has no convertible sections.`);
      continue;
    }

    console.log(`Updating page "${page.title ?? page._id}" (${page._id}) with ${replacementCount} icon grid replacements.`);

    if (dryRun) {
      continue;
    }

    await client
      .patch(page._id)
      .set({ sections: sanitizedSections })
      .commit({ autoGenerateArrayKeys: true });
  }
}

main().catch((error) => {
  console.error('Migration failed', error);
  process.exit(1);
});
