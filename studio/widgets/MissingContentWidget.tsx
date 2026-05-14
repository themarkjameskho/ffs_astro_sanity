import { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, Card, Flex, Grid, Heading, Spinner, Stack, Text, TextInput } from '@sanity/ui';
import { useClient } from 'sanity';
import { useRouter } from 'sanity/router';
import { LuRefreshCw } from 'react-icons/lu';

const DASHBOARD_QUERY = `{
  "pageStats": {
    "total": count(*[_type == "page"]),
    "needsAttention": count(*[_type == "page" && (
      !defined(title) || title == "" ||
      !defined(slug.current) || slug.current == "" ||
      !defined(pageType) || pageType == "" ||
      !defined(seo.seoTitle) || seo.seoTitle == "" ||
      !defined(seo.seoDescription) || seo.seoDescription == ""
    )])
  },
  "postStats": {
    "total": count(*[_type == "blogPost"]),
    "needsAttention": count(*[_type == "blogPost" && (
      !defined(categories) || count(categories) == 0 ||
      !defined(tags) || count(tags) == 0 ||
      !defined(seo.seoTitle) || seo.seoTitle == "" ||
      (defined(featuredImage.asset) && (!defined(featuredImage.alt) || featuredImage.alt == ""))
    )])
  },
  "categoryStats": {
    "total": count(*[_type == "category"]),
    "unused": count(*[_type == "category" && count(*[_type == "blogPost" && references(^._id)]) == 0])
  },
  "tagStats": {
    "total": count(*[_type == "tag"]),
    "unused": count(*[_type == "tag" && count(*[_type == "blogPost" && references(^._id)]) == 0])
  },
  "missingCategories": {
    "count": count(*[_type == "blogPost" && (!defined(categories) || count(categories) == 0)]),
    "items": *[_type == "blogPost" && (!defined(categories) || count(categories) == 0)] | order(_updatedAt desc){
      _id,
      _type,
      title,
      "slug": slug.current
    }
  },
  "missingTags": {
    "count": count(*[_type == "blogPost" && (!defined(tags) || count(tags) == 0)]),
    "items": *[_type == "blogPost" && (!defined(tags) || count(tags) == 0)] | order(_updatedAt desc){
      _id,
      _type,
      title,
      "slug": slug.current
    }
  },
  "missingSeo": {
    "count": count(*[_type in ["page", "blogPost"] && (!defined(seo.seoTitle) || seo.seoTitle == "")]),
    "items": *[_type in ["page", "blogPost"] && (!defined(seo.seoTitle) || seo.seoTitle == "")] | order(_updatedAt desc){
      _id,
      _type,
      title,
      "slug": slug.current
    }
  },
  "missingFeaturedAlt": {
    "count": count(*[_type == "blogPost" && defined(featuredImage.asset) && (!defined(featuredImage.alt) || featuredImage.alt == "")]),
    "items": *[_type == "blogPost" && defined(featuredImage.asset) && (!defined(featuredImage.alt) || featuredImage.alt == "")] | order(_updatedAt desc){
      _id,
      _type,
      title,
      "slug": slug.current
    }
  },
  "missingImageAltText": {
    "count": count(*[_type in ["page", "blogPost"] && (
      (defined(featuredImage.asset) && (!defined(featuredImage.alt) || featuredImage.alt == "")) ||
      (defined(seo.ogImage.asset) && (!defined(seo.ogImage.alt) || seo.ogImage.alt == "")) ||
      (defined(content[]) && content[]._type == "image" && defined(content[].asset) && (!defined(content[].alt) || content[].alt == "")) ||
      (defined(sections[]) && sections[]._type == "twoColTextImageSection" && defined(sections[].images[]) && sections[].images[]._type == "image" && defined(sections[].images[].asset) && (!defined(sections[].images[].alt) || sections[].images[].alt == "")) ||
      (defined(sections[]) && sections[]._type == "heroSection" && defined(sections[].coupon.image.asset) && (!defined(sections[].coupon.image.alt) || sections[].coupon.image.alt == ""))
    )]),
    "items": *[_type in ["page", "blogPost"] && (
      (defined(featuredImage.asset) && (!defined(featuredImage.alt) || featuredImage.alt == "")) ||
      (defined(seo.ogImage.asset) && (!defined(seo.ogImage.alt) || seo.ogImage.alt == "")) ||
      (defined(content[]) && content[]._type == "image" && defined(content[].asset) && (!defined(content[].alt) || content[].alt == "")) ||
      (defined(sections[]) && sections[]._type == "twoColTextImageSection" && defined(sections[].images[]) && sections[].images[]._type == "image" && defined(sections[].images[].asset) && (!defined(sections[].images[].alt) || sections[].images[].alt == "")) ||
      (defined(sections[]) && sections[]._type == "heroSection" && defined(sections[].coupon.image.asset) && (!defined(sections[].coupon.image.alt) || sections[].coupon.image.alt == ""))
    )] | order(_updatedAt desc){
      _id,
      _type,
      title,
      "slug": slug.current
    }
  },
  "unusedCategories": {
    "count": count(*[_type == "category" && count(*[_type == "blogPost" && references(^._id)]) == 0]),
    "items": *[_type == "category" && count(*[_type == "blogPost" && references(^._id)]) == 0] | order(_updatedAt desc){
      _id,
      _type,
      "title": coalesce(title, name),
      "slug": slug.current
    }
  },
  "unusedTags": {
    "count": count(*[_type == "tag" && count(*[_type == "blogPost" && references(^._id)]) == 0]),
    "items": *[_type == "tag" && count(*[_type == "blogPost" && references(^._id)]) == 0] | order(_updatedAt desc){
      _id,
      _type,
      "title": coalesce(title, name),
      "slug": slug.current
    }
  },
  "documentsWithSlugs": *[_type in ["page","blogPost"] && defined(slug.current)]{
    _id,
    _type,
    title,
    "slug": slug.current
  }
}`;

type SectionKey =
  | 'missingCategories'
  | 'missingTags'
  | 'missingSeo'
  | 'missingFeaturedAlt'
  | 'missingImageAltText'
  | 'unusedCategories'
  | 'unusedTags';

type SectionConfig = {
  key: SectionKey;
  title: string;
  description: string;
  emptyLabel: string;
  intentType: string;
};

const SECTIONS: SectionConfig[] = [
  {
    key: 'missingSeo',
    title: 'Pages/posts missing SEO titles',
    description: 'Add SEO titles to improve search and sharing.',
    emptyLabel: 'Every page and post has an SEO title.',
    intentType: 'page'
  },
  {
    key: 'missingCategories',
    title: 'Posts missing categories',
    description: 'Assign one or more categories so filters stay accurate.',
    emptyLabel: 'All posts have at least one category.',
    intentType: 'blogPost'
  },
  {
    key: 'missingTags',
    title: 'Posts missing tags',
    description: 'Add tags to help with topical filtering.',
    emptyLabel: 'All posts have tags.',
    intentType: 'blogPost'
  },
  {
    key: 'missingFeaturedAlt',
    title: 'Posts missing featured image alt text',
    description: 'Alt text is required for accessibility and search.',
    emptyLabel: 'All featured images include alt text.',
    intentType: 'blogPost'
  },
  {
    key: 'missingImageAltText',
    title: 'Pages/posts missing image alt text',
    description: 'All images (featured, OG, content, section images) need alt text for SEO and accessibility.',
    emptyLabel: 'All images include required alt text.',
    intentType: 'page'
  },
  {
    key: 'unusedCategories',
    title: 'Unused categories',
    description: "These categories aren't referenced by any post.",
    emptyLabel: 'All categories are being used.',
    intentType: 'category'
  },
  {
    key: 'unusedTags',
    title: 'Unused tags',
    description: "These tags aren't referenced by any post.",
    emptyLabel: 'All tags are being used.',
    intentType: 'tag'
  }
];

type DashboardData = {
  pageStats: { total: number; needsAttention: number };
  postStats: { total: number; needsAttention: number };
  categoryStats: { total: number; unused: number };
  tagStats: { total: number; unused: number };
  missingCategories: {
    count: number;
    items: Array<{ _id: string; title?: string; slug?: string; _type?: string }>;
  };
  missingTags: {
    count: number;
    items: Array<{ _id: string; title?: string; slug?: string; _type?: string }>;
  };
  missingSeo: {
    count: number;
    items: Array<{ _id: string; title?: string; slug?: string; _type?: string }>;
  };
  missingFeaturedAlt: {
    count: number;
    items: Array<{ _id: string; title?: string; slug?: string; _type?: string }>;
  };
  missingImageAltText: {
    count: number;
    items: Array<{ _id: string; title?: string; slug?: string; _type?: string }>;
  };
  unusedCategories: {
    count: number;
    items: Array<{ _id: string; title?: string; slug?: string; _type?: string }>;
  };
  unusedTags: {
    count: number;
    items: Array<{ _id: string; title?: string; slug?: string; _type?: string }>;
  };
  documentsWithSlugs: Array<{ _id: string; _type: string; title?: string; slug?: string }>;
};

export default function MissingContentWidget() {
  const client = useClient({ apiVersion: '2024-05-01' });
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleItemClick = (itemId: string, itemType: string) => {
    router.navigateIntent('edit', { id: itemId, type: itemType });
  };

  const fetchData = () => {
    setLoading(true);
    setError(null);

    client
      .fetch<DashboardData>(DASHBOARD_QUERY, {}, { 
        useCdn: false,
        perspective: 'published'
      })
      .then((result) => {
        setData(result);
        setLastRefresh(new Date());
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const summaryCards = useMemo(() => {
    if (!data) return [];
    const calcHealth = (total: number, issues: number) => {
      if (total === 0) return 100;
      return Math.max(0, Math.round(((total - issues) / total) * 100));
    };

    return [
      {
        title: 'Pages',
        total: data.pageStats.total,
        issues: data.pageStats.needsAttention,
        health: calcHealth(data.pageStats.total, data.pageStats.needsAttention),
        description: 'Requires title, slug, page type, SEO title, and SEO description on every page.'
      },
      {
        title: 'Posts',
        total: data.postStats.total,
        issues: data.postStats.needsAttention,
        health: calcHealth(data.postStats.total, data.postStats.needsAttention),
        description: 'Includes categories, tags, SEO titles, and featured image alt text.'
      },
      {
        title: 'Categories',
        total: data.categoryStats.total,
        issues: data.categoryStats.unused,
        health: calcHealth(data.categoryStats.total, data.categoryStats.unused),
        description: 'Highlights unused categories that could be reassigned or archived.'
      },
      {
        title: 'Tags',
        total: data.tagStats.total,
        issues: data.tagStats.unused,
        health: calcHealth(data.tagStats.total, data.tagStats.unused),
        description: 'Ensures every tag is represented on at least one post.'
      }
    ];
  }, [data]);

  const { duplicatesByType, totalDuplicateCount } = useMemo(() => {
    if (!data || !data.documentsWithSlugs) return { duplicatesByType: new Map(), totalDuplicateCount: 0 };
    
    // First, deduplicate by _id and exclude drafts
    const uniqueDocsMap = new Map<string, { _id: string; _type: string; title?: string; slug?: string }>();
    data.documentsWithSlugs.forEach((doc) => {
      // Skip drafts
      if (doc._id?.startsWith('draft.')) return;
      if (!doc._id || !doc.slug) return;
      if (!uniqueDocsMap.has(doc._id)) {
        uniqueDocsMap.set(doc._id, doc);
      }
    });
    
    // Now check for duplicate slugs WITHIN THE SAME TYPE
    // (pages can share slugs with blog posts, but two pages shouldn't have the same slug)
    const slugMapByType = new Map<string, Map<string, Array<{ _id: string; _type: string; title?: string }>>>();
    
    uniqueDocsMap.forEach((doc) => {
      if (!doc.slug) return;
      
      // Normalize slug
      const normalizedSlug = doc.slug
        .toLowerCase()
        .trim()
        .replace(/^\/+|\/+$/g, '')  // Remove leading/trailing slashes
        .replace(/\/+/g, '/');      // Replace multiple slashes with single slash
      
      // Get or create the map for this type
      if (!slugMapByType.has(doc._type)) {
        slugMapByType.set(doc._type, new Map());
      }
      const typeMap = slugMapByType.get(doc._type)!;
      
      const entries = typeMap.get(normalizedSlug) ?? [];
      entries.push({ _id: doc._id, _type: doc._type, title: doc.title });
      typeMap.set(normalizedSlug, entries);
    });

    // Organize duplicates by type
    const duplicatesByType = new Map<string, Array<{ slug: string; documents: Array<{ _id: string; _type: string; title?: string }> }>>();
    let totalCount = 0;
    
    slugMapByType.forEach((typeMap, docType) => {
      const typeDuplicates: Array<{ slug: string; documents: Array<{ _id: string; _type: string; title?: string }> }> = [];
      typeMap.forEach((documents, slug) => {
        if (documents.length > 1) {
          typeDuplicates.push({ slug, documents });
          totalCount++;
        }
      });
      if (typeDuplicates.length > 0) {
        typeDuplicates.sort((a, b) => b.documents.length - a.documents.length);
        duplicatesByType.set(docType, typeDuplicates);
      }
    });

    return { duplicatesByType, totalDuplicateCount: totalCount };
  }, [data]);

  const allSummaryCards = useMemo(() => {
    const baseCards = summaryCards;
    return [
      ...baseCards,
      {
        title: 'Duplicates',
        total: totalDuplicateCount,
        issues: totalDuplicateCount,
        health: totalDuplicateCount === 0 ? 100 : 0,
        description: 'Identifies documents with duplicate slugs within their type.'
      }
    ];
  }, [summaryCards, totalDuplicateCount]);

  const filteredData = useMemo(() => {
    if (!data || !searchQuery.trim()) return data;
    
    const query = searchQuery.toLowerCase();
    
    return {
      ...data,
      missingCategories: {
        ...data.missingCategories,
        items: data.missingCategories.items.filter(
          (item) => item.title?.toLowerCase().includes(query) || item.slug?.toLowerCase().includes(query)
        )
      },
      missingTags: {
        ...data.missingTags,
        items: data.missingTags.items.filter(
          (item) => item.title?.toLowerCase().includes(query) || item.slug?.toLowerCase().includes(query)
        )
      },
      missingSeo: {
        ...data.missingSeo,
        items: data.missingSeo.items.filter(
          (item) => item.title?.toLowerCase().includes(query) || item.slug?.toLowerCase().includes(query)
        )
      },
      missingFeaturedAlt: {
        ...data.missingFeaturedAlt,
        items: data.missingFeaturedAlt.items.filter(
          (item) => item.title?.toLowerCase().includes(query) || item.slug?.toLowerCase().includes(query)
        )
      },
      missingImageAltText: {
        ...data.missingImageAltText,
        items: data.missingImageAltText.items.filter(
          (item) => item.title?.toLowerCase().includes(query) || item.slug?.toLowerCase().includes(query)
        )
      },
      unusedCategories: {
        ...data.unusedCategories,
        items: data.unusedCategories.items.filter(
          (item) => item.title?.toLowerCase().includes(query) || item.slug?.toLowerCase().includes(query)
        )
      },
      unusedTags: {
        ...data.unusedTags,
        items: data.unusedTags.items.filter(
          (item) => item.title?.toLowerCase().includes(query) || item.slug?.toLowerCase().includes(query)
        )
      }
    };
  }, [data, searchQuery]);

  useEffect(() => {
    // Fetch data on mount only
    fetchData();
  }, [client]);

  return (
    <Card padding={4} radius={3} shadow={1}>
      <Stack space={5}>
        <Flex align="center" justify="space-between">
          <Heading size={3}>Content Health</Heading>
          <Button icon={LuRefreshCw} onClick={fetchData} disabled={loading} text="Refresh" />
        </Flex>
        <Stack space={2}>
          <Text muted>
            Quick view of documents that still need required metadata. Click an entry to jump straight to the editor.
          </Text>
          {lastRefresh && (
            <Text size={0} muted>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Text>
          )}
        </Stack>

        {data && !loading && !error && (
          <Grid columns={[1, 2, 3, 5]} gap={3}>
            {allSummaryCards.map((card) => {
              const tone = card.health === 100 ? 'positive' : card.health >= 80 ? 'caution' : 'critical';
              return (
                <Card key={card.title} padding={4} radius={2} tone={tone}>
                  <Stack space={3}>
                    <Flex align="center" justify="space-between">
                      <Heading size={1}>{card.title}</Heading>
                      <Badge mode="outline" padding={2} tone={tone === 'positive' ? 'positive' : tone}>
                        {card.health}%
                      </Badge>
                    </Flex>
                    <Text size={4} weight="semibold">
                      {card.total - card.issues}/{card.total || 0} healthy
                    </Text>
                    <Text size={1} muted>
                      {card.issues} need attention · {card.description}
                    </Text>
                  </Stack>
                </Card>
              );
            })}
          </Grid>
        )}

        <Heading size={2}>Content issues</Heading>

        <TextInput
          placeholder="Search tags, categories, pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />

        {loading && (
          <Box paddingY={5}>
            <Spinner muted />
          </Box>
        )}

        {error && (
          <Card tone="critical" padding={3} radius={2}>
            <Text>Error loading dashboard data: {error}</Text>
          </Card>
        )}

        {!loading &&
          !error &&
          filteredData &&
          SECTIONS.map((section) => {
            const info = filteredData[section.key as keyof DashboardData] as { count: number; items: Array<{ _id: string; title?: string; slug?: string; _type?: string }> };

            return (
              <Card key={section.key} padding={3} radius={2} tone={info.count > 0 ? 'caution' : 'positive'}>
                <Stack space={3}>
                  <Heading size={1}>{section.title}</Heading>
                  <Text size={1} muted>
                    {section.description}
                  </Text>
                  {info.count === 0 ? (
                    <Text size={1}>{section.emptyLabel}</Text>
                  ) : (
                    <Stack as="ol" space={3} paddingX={2}>
                      {info.items.map((item: { _id?: string; title?: string; slug?: string; _type?: string }, index: number) => {
                        const itemId = item._id ?? '';
                        const itemType = item._type ?? section.intentType;
                        const isValid = Boolean(itemId && itemType);
                        
                        return (
                          <Flex as="li" key={itemId || index} gap={3}>
                            <Box>
                              <Badge padding={2} tone="primary" fontSize={1}>
                                #{index + 1}
                              </Badge>
                            </Box>
                            <Stack space={1} style={{ flex: 1, cursor: isValid ? 'pointer' : 'default' }}>
                              <Text 
                                size={2} 
                                weight="semibold"
                                onClick={() => isValid && handleItemClick(itemId, itemType)}
                                style={{
                                  color: isValid ? '#2563eb' : 'inherit',
                                  textDecoration: isValid ? 'underline' : 'none',
                                  cursor: isValid ? 'pointer' : 'default'
                                }}
                              >
                                {item.title || 'Untitled'}
                                {!isValid && ' (invalid link)'}
                              </Text>
                              {item.slug ? (
                                <Text size={1} muted>
                                  {item.slug}
                                </Text>
                              ) : null}
                            </Stack>
                          </Flex>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              </Card>
            );
          })}

        {!loading && !error && totalDuplicateCount > 0 && (
          <Card padding={3} radius={2} tone="caution">
            <Stack space={3}>
              <Heading size={1}>Duplicate documents</Heading>
              <Text size={1} muted>
                Documents with duplicate slugs within their type. Update or archive duplicates to avoid routing conflicts.
              </Text>
              <Stack space={4}>
                {Array.from(duplicatesByType.entries()).map(([docType, groups]) => (
                  <Card key={docType} padding={3} radius={2} tone="caution" shadow={1}>
                    <Stack space={3}>
                      <Heading size={2}>{docType === 'page' ? '📄 Pages' : docType === 'blogPost' ? '📝 Posts' : `📦 ${docType}`}</Heading>
                      <Stack space={2}>
                        {groups.map((group: { slug: string; documents: Array<{ _id: string; _type: string; title?: string }> }) => (
                          <Card key={`${docType}-${group.slug}`} padding={2} radius={1} tone="primary">
                            <Stack space={1}>
                              <Text size={1} weight="semibold">
                                /{group.slug}
                              </Text>
                              <Stack as="ul" space={1} paddingX={2}>
                                {group.documents.map((doc: { _id: string; _type?: string; title?: string }) => (
                                  <Box as="li" key={doc._id}>
                                    <Text 
                                      size={0}
                                      onClick={() => doc._type && handleItemClick(doc._id, doc._type)}
                                      style={{
                                        color: doc._type ? '#2563eb' : 'inherit',
                                        textDecoration: doc._type ? 'underline' : 'none',
                                        cursor: doc._type ? 'pointer' : 'default'
                                      }}
                                    >
                                      {doc.title || 'Untitled'}
                                    </Text>
                                  </Box>
                                ))}
                              </Stack>
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Card>
        )}
        {!loading && !error && totalDuplicateCount === 0 && (
          <Card padding={3} radius={2} tone="positive">
            <Stack space={2}>
              <Heading size={2}>✅ No duplicate documents</Heading>
              <Text size={1} muted>
                All documents have unique slugs within their type.
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </Card>
  );
}
