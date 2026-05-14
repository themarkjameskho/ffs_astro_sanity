import 'dotenv/config';
import { createClient } from '@sanity/client';

type TaxonomyType = 'category' | 'tag';
type Reference = { _type: 'reference'; _ref: string };

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
const apiVersion = process.env.SANITY_API_VERSION ?? '2024-05-12';

if (!projectId || !dataset || !token) {
  throw new Error('Missing SANITY project credentials. Ensure SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_TOKEN are set.');
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token
});

const normalize = (value: string) => value.trim().toLowerCase();

const slugify = (value: string) => {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'item';
};

const ensureTaxonomy = async (
  type: TaxonomyType,
  name: string,
  cache: {
    nameToId: Map<string, string>;
    usedSlugs: Set<string>;
  }
) => {
  const key = normalize(name);
  const cached = cache.nameToId.get(key);
  if (cached) {
    return cached;
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;
  while (cache.usedSlugs.has(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }
  cache.usedSlugs.add(slug);

  const _id = `${type}-${slug}`;

  await client.createIfNotExists({
    _id,
    _type: type,
    name: name.trim(),
    slug: { _type: 'slug', current: slug }
  });

  cache.nameToId.set(key, _id);
  return _id;
};

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const auditOnly = process.argv.includes('--list-missing');
  const [existingCategories, existingTags] = await Promise.all([
    client.fetch<Array<{ _id: string; name?: string; slug?: { current?: string } }>>(
      '*[_type == "category"]{ _id, name, slug }'
    ),
    client.fetch<Array<{ _id: string; name?: string; slug?: { current?: string } }>>('*[_type == "tag"]{ _id, name, slug }')
  ]);

  const categoryCache = {
    nameToId: new Map<string, string>(),
    usedSlugs: new Set<string>()
  };
  const tagCache = {
    nameToId: new Map<string, string>(),
    usedSlugs: new Set<string>()
  };

  existingCategories.forEach((cat) => {
    if (cat.name) {
      categoryCache.nameToId.set(normalize(cat.name), cat._id);
    }
    if (cat.slug?.current) {
      categoryCache.usedSlugs.add(cat.slug.current);
    }
  });
  existingTags.forEach((tag) => {
    if (tag.name) {
      tagCache.nameToId.set(normalize(tag.name), tag._id);
    }
    if (tag.slug?.current) {
      tagCache.usedSlugs.add(tag.slug.current);
    }
  });

  const posts = await client.fetch<
    Array<{
      _id: string;
      category?: string | Reference;
      categories?: Array<string | Reference>;
      tags?: Array<string | Reference>;
    }>
  >('*[_type == "blogPost"]{ _id, category, categories, tags }');

  const categoryNames = new Set<string>();
  const tagNames = new Set<string>();

  posts.forEach((post) => {
    if (typeof post.category === 'string') {
      categoryNames.add(post.category);
    }
    if (Array.isArray(post.categories)) {
      post.categories.forEach((category) => {
        if (typeof category === 'string') {
          categoryNames.add(category);
        }
      });
    }
    (post.tags ?? []).forEach((tag) => {
      if (typeof tag === 'string') {
        tagNames.add(tag);
      }
    });
  });

  await Promise.all([...categoryNames].map((name) => ensureTaxonomy('category', name, categoryCache)));
  await Promise.all([...tagNames].map((name) => ensureTaxonomy('tag', name, tagCache)));

  let patched = 0;
  for (const post of posts) {
    const setData: Record<string, any> = {};
    const unsetFields: string[] = [];

    const categoryRefs: Reference[] = [];
    const categoryRefSet = new Set<string>();
    const pushCategoryRef = (refId: string | undefined) => {
      if (!refId || categoryRefSet.has(refId)) {
        return;
      }
      categoryRefs.push({ _type: 'reference', _ref: refId });
      categoryRefSet.add(refId);
    };

    const handleCategoryValue = (value: string | Reference | undefined) => {
      if (!value) {
        return;
      }
      if (typeof value === 'string') {
        const refId = categoryCache.nameToId.get(normalize(value));
        pushCategoryRef(refId);
      } else if (value && typeof value === 'object' && '_ref' in value) {
        pushCategoryRef(value._ref);
      }
    };

    handleCategoryValue(post.category);
    if (post.category) {
      unsetFields.push('category');
    }
    if (Array.isArray(post.categories)) {
      post.categories.forEach((category) => handleCategoryValue(category));
    }

    if (categoryRefs.length > 0) {
      setData.categories = categoryRefs;
    }

    if (Array.isArray(post.tags)) {
      let touched = false;
      const tagRefs = post.tags
        .map((tag) => {
          if (typeof tag === 'string') {
            const refId = tagCache.nameToId.get(normalize(tag));
            if (refId) {
              touched = true;
              return { _type: 'reference', _ref: refId };
            }
            return null;
          }
          if (tag && typeof tag === 'object' && '_ref' in tag) {
            return tag;
          }
          return null;
        })
        .filter((tagRef): tagRef is Reference => Boolean(tagRef));

      if (touched) {
        setData.tags = tagRefs;
      }
    }

    const patch: { set?: Record<string, any>; unset?: string[] } = {};
    if (Object.keys(setData).length > 0) {
      patch.set = setData;
    }
    if (unsetFields.length > 0) {
      patch.unset = [...new Set(unsetFields)];
    }

    if (patch.set || patch.unset) {
      if (!dryRun) {
        let builder = client.patch(post._id);
        if (patch.set) {
          builder = builder.set(patch.set);
        }
        if (patch.unset) {
          builder = builder.unset(patch.unset);
        }
        await builder.commit();
      }
      patched += 1;
    }
  }

  console.log(`Ensured ${categoryCache.nameToId.size} categories and ${tagCache.nameToId.size} tags exist.`);
  if (auditOnly) {
    const missingCategories: Array<{ _id: string; title?: string; slug?: { current?: string } }> = await client.fetch(
      '*[_type == "blogPost" && (!defined(categories) || count(categories) == 0)]{ _id, title, slug }'
    );
    const missingTags: Array<{ _id: string; title?: string; slug?: { current?: string } }> = await client.fetch(
      '*[_type == "blogPost" && (!defined(tags) || count(tags) == 0)]{ _id, title, slug }'
    );
    console.log('Posts missing categories:');
    missingCategories.forEach((post) => {
      console.log(`- ${post._id} (${post.slug?.current ?? 'no-slug'}) – ${post.title ?? 'Untitled'}`);
    });
    console.log('Posts missing tags:');
    missingTags.forEach((post) => {
      console.log(`- ${post._id} (${post.slug?.current ?? 'no-slug'}) – ${post.title ?? 'Untitled'}`);
    });
  } else {
    console.log(
      dryRun ? `Would update ${patched} posts with references (dry run).` : `Updated ${patched} posts with references.`
    );
  }
}

main().catch((error) => {
  console.error('Failed to migrate categories/tags:', error);
  process.exit(1);
});
