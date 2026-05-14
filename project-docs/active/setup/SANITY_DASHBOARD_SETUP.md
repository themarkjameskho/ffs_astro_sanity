# Sanity Dashboard Setup Guide

## Overview
Complete documentation for configuring and customizing a Sanity CMS dashboard for content management, including custom widgets, desk structure, and data monitoring. This guide provides step-by-step instructions, code examples, and best practices for implementing a Content Health monitoring system in Sanity Studio.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Prerequisites & Dependencies](#prerequisites--dependencies)
3. [Configuration Files](#configuration-files)
4. [Custom Widgets](#custom-widgets)
5. [Desk Structure](#desk-structure)
6. [Dashboard Features](#dashboard-features)
7. [GROQ Queries Reference](#groq-queries-reference)
8. [Component Architecture](#component-architecture)
9. [State Management](#state-management)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting-extended)
12. [Performance Optimization](#performance-optimization)
13. [Testing & Validation](#testing--validation)

---

## Project Structure

```
studio/
├── sanity.config.ts          # Main Sanity configuration
├── deskStructure.ts          # Custom sidebar navigation
├── loadEnv.cjs               # Environment loader
├── sanity.cli.js             # CLI configuration
├── schemaTypes/
│   ├── index.ts              # Schema exports (collects all types)
│   ├── documents/
│   │   ├── page.ts           # Page document type
│   │   ├── blogPost.ts       # Blog post document type
│   │   ├── blogTag.ts        # Tag document type
│   │   ├── blogCategory.ts   # Category document type
│   │   ├── blogAuthor.ts     # Author document type
│   │   └── globalSettings.ts # Global settings singleton
│   ├── objects/
│   │   ├── blogListSection.ts
│   │   ├── contactSection.ts
│   │   ├── heroSection.ts
│   │   └── ... (other section components)
│   └── settings/
│       ├── seo.ts            # SEO settings object
│       └── contactInfo.ts    # Contact info object
└── widgets/
    └── MissingContentWidget.tsx  # Custom dashboard widget (main focus)
```

**File Responsibilities:**
- `sanity.config.ts`: Connects project to Sanity cloud, registers plugins, configures schema
- `deskStructure.ts`: Organizes sidebar navigation, creates content hierarchies
- `schemaTypes/`: Defines document and field structures for all content types
- `widgets/MissingContentWidget.tsx`: Monitors content completeness and metadata

---

## Prerequisites & Dependencies

### Required Packages
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "sanity": "^3.0.0",
    "@sanity/ui": "^1.9.0",
    "react-icons": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^18.0.0"
  }
}
```

### Required Environment Variables
Create a `.env.local` file in the studio directory:

```bash
# Sanity Project Configuration
SANITY_STUDIO_PROJECT_ID=your_project_id_here
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_API_VERSION=2024-05-01

# Optional: For custom API calls
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_AUTH_TOKEN=your_auth_token_here  # Only for server-side operations
```

**How to Find These Values:**
1. Go to sanity.io dashboard
2. Select your project
3. Go to Settings → API
4. Copy Project ID
5. Copy Dataset name (usually "production")

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (14+)
- IE: ❌ Not supported

---

## Configuration Files

### `sanity.config.ts` - Complete Setup

```typescript
import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { dashboardTool } from '@sanity/dashboard';
import { visionTool } from '@sanity/vision';
import { MissingContentWidget } from './widgets/MissingContentWidget';
import { schemaTypes } from './schemaTypes';
import deskStructure from './deskStructure';

// Import all schema types
// These should be in schemaTypes/index.ts

export default defineConfig({
  // Project identification
  name: 'heat_tech_pest_control',
  title: 'Heat Tech Pest Control',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  basePath: '/studio', // Accessible at yoursite.com/studio

  // Plugin configuration
  plugins: [
    // Dashboard plugin with custom widget
    dashboardTool({
      widgets: [
        // Built-in widgets
        {
          name: 'sanity-tutorials',
          options: {
            templateRepoId: 'sanity-io/sanity-template-gatsby-blog'
          }
        },
        // Custom widget
        {
          name: 'missing-content-widget',
          component: MissingContentWidget,
          options: {
            // Widget-specific options can go here
          }
        },
      ],
    }),
    
    // Desk structure with custom navigation
    deskTool({
      structure: deskStructure,
      // Customize default ordering, preview settings, etc.
    }),
    
    // Vision tool for GROQ query testing
    visionTool({
      defaultApiVersion: process.env.SANITY_STUDIO_API_VERSION || '2024-05-01',
    }),
  ],

  // Schema configuration
  schema: {
    types: schemaTypes,
  },

  // Document actions customization
  document: {
    actions: (prev, context) => {
      // You can add custom actions here
      // For example: delete confirmation, publish workflows, etc.
      return prev;
    },

    // Customize document preview
    newDocumentOptions: (prev, { creationContext }) => {
      // Control which document types can be created
      return prev;
    },
  },

  // Global styles (optional)
  theme: {
    // Can customize theme colors, fonts, etc.
  },
});
```

**Key Configuration Points:**
- `basePath`: Where Studio is accessible (default: /studio)
- `projectId`: Required for Sanity API calls
- `dataset`: Which dataset to query (usually "production")
- `plugins`: Tools loaded in Studio
- `schema`: Document type definitions

### `deskStructure.ts` - Navigation Structure

```typescript
import { StructureBuilder, StructureResolver } from 'sanity/structure';
import {
  LuBookMarked,
  LuBug,
  LuFileStack,
  LuFolderOpen,
  LuHouse,
  LuImage,
  LuLayoutTemplate,
  LuMapPin,
  LuNotebookPen,
  LuPhoneCall,
  LuSettings2,
  LuShieldCheck,
  LuTag,
  LuUserRound
} from 'react-icons/lu';
import type { IconType } from 'react-icons';
import type { ListItemBuilder } from 'sanity/structure';

const API_VERSION = '2024-05-01';

// Page type groupings - organize pages by category
const PAGE_GROUPS = [
  { title: 'Pest Control', value: 'pest-control', icon: LuShieldCheck },
  { title: 'Bed Bug Treatment', value: 'bed-bug-treatment', icon: LuBug },
  { title: 'Service Area', value: 'service-area', icon: LuMapPin },
  { title: 'Contact', value: 'contact', icon: LuPhoneCall },
  { title: 'Blog', value: 'blog', icon: LuBookMarked },
  { title: 'Home', value: 'home', icon: LuHouse }
];

// Reusable function for creating taxonomy panes (Tags, Categories)
// This reduces code duplication and makes it easy to add new taxonomies
const buildTaxonomyPane = ({
  title,
  icon,
  schemaType,
  values,
  filter
}: {
  title: string;
  icon: IconType;
  schemaType: string;
  values: Promise<Array<{ _id: string; name?: string }>>;
  filter: string;
}): ListItemBuilder =>
  S.listItem()
    .title(title)
    .icon(icon)
    .id(`taxonomy-${schemaType}`)
    .child(async () => {
      // Fetch and process taxonomy items
      const items = (await values)
        .map(({ _id, name }) => ({ id: _id, name: name?.trim() ?? '' }))
        .filter(({ id, name }) => Boolean(id) && Boolean(name))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Build menu items
      const children: (ListItemBuilder | ReturnType<typeof S.divider>)[] = [
        // Manage section - allows creating/editing all items
        S.listItem()
          .title(`Manage ${title}`)
          .id(`manage-${schemaType}`)
          .icon(icon)
          .schemaType(schemaType)
          .child(
            S.documentTypeList(schemaType)
              .title(`All ${title}`)
              .filter('_type == $schemaType')
              .params({ schemaType })
              .defaultOrdering([{ field: 'name', direction: 'asc' }])
          )
      ];

      // Add divider and individual items if any exist
      if (items.length) {
        children.push(S.divider());
        children.push(
          ...items.map(({ id, name }, idx) =>
            S.listItem()
              .title(name)
              .id(`${schemaType}-item-${idx}`)
              .child(
                S.documentList()
                  .title(name)
                  .schemaType('blogPost')
                  .filter(filter)
                  .params({ refId: id })
              )
          )
        );
      }

      return S.list().title(title).items(children);
    });

// Main desk structure
const deskStructure: StructureResolver = (S, context) => {
  const client = context.getClient({ apiVersion: API_VERSION });

  return S.list()
    .title('Content')
    .items([
      // PAGES SECTION
      S.listItem()
        .title('Pages')
        .icon(LuLayoutTemplate)
        .child(
          S.list()
            .title('Pages')
            .items([
              // All pages view
              S.listItem()
                .title('All Pages')
                .icon(LuFileStack)
                .schemaType('page')
                .child(S.documentTypeList('page').title('All Pages')),
              S.divider(),
              // Grouped pages by type
              ...PAGE_GROUPS.map(({ title, value, icon }) =>
                S.listItem()
                  .title(title)
                  .icon(icon)
                  .schemaType('page')
                  .child(
                    S.documentTypeList('page')
                      .title(`${title} Pages`)
                      .filter('_type == "page" && pageType == $pageType')
                      .params({ pageType: value })
                  )
              )
            ])
        ),

      // POSTS SECTION
      S.listItem()
        .title('Posts')
        .icon(LuNotebookPen)
        .schemaType('blogPost')
        .child(S.documentTypeList('blogPost').title('Posts')),

      // MEDIA SECTION
      S.listItem()
        .title('Media')
        .icon(LuImage)
        .child(S.documentTypeList('sanity.imageAsset').title('All Media')),

      S.divider(),

      // SETTINGS
      S.listItem()
        .title('Global Settings')
        .icon(LuSettings2)
        .schemaType('globalSettings')
        .child(S.document().schemaType('globalSettings').documentId('global-settings')),

      S.divider(),

      // TAXONOMY SECTION
      S.listItem()
        .title('All Categories')
        .icon(LuFolderOpen)
        .schemaType('category')
        .child(S.documentTypeList('category').title('All Categories')),

      // Tags with custom taxonomy pane
      buildTaxonomyPane({
        title: 'Tags',
        icon: LuTag,
        schemaType: 'tag',
        values: client.fetch<Array<{ _id: string; name?: string }>>(
          '*[_type == "tag"] | order(name asc) { _id, name }'
        ),
        filter: '_type == "blogPost" && references($refId)'
      }),

      S.listItem()
        .title('Authors')
        .icon(LuUserRound)
        .schemaType('author')
        .child(S.documentTypeList('author').title('Authors')),

      S.divider(),

      // Auto-include any other document types not explicitly listed
      ...S.documentTypeListItems().filter((item) =>
        ![
          'page',
          'blogPost',
          'globalSettings',
          'sanity.imageAsset',
          'sanity.fileAsset',
          'category',
          'tag',
          'author'
        ].includes(item.getId() ?? '')
      )
    ]);
};

export default deskStructure;
```

**Desk Structure Concepts:**
- `S.list()`: Create a menu with multiple items
- `S.listItem()`: Single menu item
- `S.divider()`: Visual separator
- `S.documentTypeList()`: Display all documents of a type
- `.filter()`: GROQ query to filter documents
- `.params()`: Pass parameters to filter

---

## Custom Widgets

### MissingContentWidget.tsx - Complete Implementation

**Location:** `studio/widgets/MissingContentWidget.tsx`

#### Overview & Purpose
This widget monitors Content Health by:
1. Checking for missing required metadata
2. Identifying unused taxonomies
3. Detecting duplicate content
4. Calculating health scores
5. Enabling direct navigation to problem items

#### File Structure

```typescript
// 1. IMPORTS
import { useEffect, useMemo, useState } from 'react';
import { 
  Badge, Box, Button, Card, Flex, Grid, 
  Heading, Spinner, Stack, Text, TextInput 
} from '@sanity/ui';
import { useClient } from 'sanity';
import { useRouter } from 'sanity/router';
import { LuRefreshCw } from 'react-icons/lu';

// 2. CONSTANTS
const DASHBOARD_QUERY = `...`; // GROQ query string

// 3. TYPE DEFINITIONS
type SectionKey = '...';
type SectionConfig = {...};
type DashboardData = {...};

// 4. CONFIGURATION ARRAYS
const SECTIONS: SectionConfig[] = [...];

// 5. MAIN COMPONENT
export default function MissingContentWidget() {
  // State management
  // Memoized calculations
  // Effects
  // Render
}
```

#### GROQ Query Breakdown

The `DASHBOARD_QUERY` constant contains a complex GROQ query that fetches all data needed:

```javascript
{
  // 1. PAGE STATISTICS
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

  // 2. POST STATISTICS (blogs)
  "postStats": {
    "total": count(*[_type == "blogPost"]),
    "needsAttention": count(*[_type == "blogPost" && (
      !defined(categories) || count(categories) == 0 ||
      !defined(tags) || count(tags) == 0 ||
      !defined(seo.seoTitle) || seo.seoTitle == "" ||
      (defined(featuredImage.asset) && 
       (!defined(featuredImage.alt) || featuredImage.alt == ""))
    )])
  },

  // 3. CATEGORY STATISTICS
  "categoryStats": {
    "total": count(*[_type == "category"]),
    // Unused = categories with no posts referencing them
    "unused": count(*[_type == "category" && 
      count(*[_type == "blogPost" && references(^._id)]) == 0
    ])
  },

  // 4. TAG STATISTICS
  "tagStats": {
    "total": count(*[_type == "tag"]),
    "unused": count(*[_type == "tag" && 
      count(*[_type == "blogPost" && references(^._id)]) == 0
    ])
  },

  // 5. DETAILED LISTS
  "missingCategories": {
    "count": count(*[...]),
    "items": *[...] | order(_updatedAt desc) {
      _id, _type, title, "slug": slug.current
    }
  },
  // ... similar for missingTags, missingSeo, missingFeaturedAlt, 
  //     unusedCategories, unusedTags

  // 6. ALL DOCUMENTS WITH SLUGS (for duplicate detection)
  "documentsWithSlugs": *[_type in ["page","blogPost"] && 
    defined(slug.current)
  ]{
    _id, _type, title, "slug": slug.current
  }
}
```

**GROQ Explanation:**
- `count(*)`: Returns number of documents matching criteria
- `!defined(field)`: Check if field is missing
- `field == ""`: Check if field is empty string
- `references(^._id)`: Check if document is referenced by other documents
- `| order(_updatedAt desc)`: Sort by last update (newest first)
- `coalesce(a, b)`: Use b if a is undefined

#### Type Definitions

```typescript
// Which sections can have missing content
type SectionKey =
  | 'missingCategories'
  | 'missingTags'
  | 'missingSeo'
  | 'missingFeaturedAlt'
  | 'unusedCategories'
  | 'unusedTags';

// Configuration for each section
type SectionConfig = {
  key: SectionKey;                    // Unique identifier
  title: string;                      // Display title
  description: string;                // Explanation of what's checked
  emptyLabel: string;                 // Message when no issues found
  intentType: string;                 // Document type for navigation
};

// Response structure from GROQ query
type DashboardData = {
  pageStats: { total: number; needsAttention: number };
  postStats: { total: number; needsAttention: number };
  categoryStats: { total: number; unused: number };
  tagStats: { total: number; unused: number };
  missingCategories: { count: number; items: Array<...> };
  missingTags: { count: number; items: Array<...> };
  missingSeo: { count: number; items: Array<...> };
  missingFeaturedAlt: { count: number; items: Array<...> };
  unusedCategories: { count: number; items: Array<...> };
  unusedTags: { count: number; items: Array<...> };
  documentsWithSlugs: Array<...>;
};
```

#### State Management

```typescript
// API client for Sanity queries
const client = useClient({ apiVersion: '2024-05-01' });

// Router for navigation
const router = useRouter();

// Main data from GROQ query
const [data, setData] = useState<DashboardData | null>(null);

// Loading state during fetch
const [loading, setLoading] = useState(true);

// Error message if query fails
const [error, setError] = useState<string | null>(null);

// When data was last refreshed
const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

// Search query for filtering sections
const [searchQuery, setSearchQuery] = useState('');
```

#### Key Functions

```typescript
// Navigate to document editor
const handleItemClick = (itemId: string, itemType: string) => {
  router.navigateIntent('edit', { id: itemId, type: itemType });
};

// Fetch fresh data from Sanity
const fetchData = () => {
  setLoading(true);
  setError(null);

  // useCdn: false = fetch fresh data (slower but accurate)
  // perspective: 'published' = only published documents
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

// Calculate health percentage
const calcHealth = (total: number, issues: number) => {
  if (total === 0) return 100;  // No items = healthy
  return Math.max(0, Math.round(((total - issues) / total) * 100));
};
```

#### Memoized Calculations

```typescript
// Create summary cards with health scores
const summaryCards = useMemo(() => {
  if (!data) return [];

  return [
    {
      title: 'Pages',
      total: data.pageStats.total,
      issues: data.pageStats.needsAttention,
      health: calcHealth(
        data.pageStats.total, 
        data.pageStats.needsAttention
      ),
      description: 'Checks SEO titles on every page.'
    },
    // ... similar for Posts, Categories, Tags
  ];
}, [data]);

// Detect duplicate slugs
const { duplicatesByType, totalDuplicateCount } = useMemo(() => {
  if (!data?.documentsWithSlugs) 
    return { duplicatesByType: new Map(), totalDuplicateCount: 0 };

  // 1. Deduplicate by _id, skip drafts
  const uniqueDocsMap = new Map();
  data.documentsWithSlugs.forEach((doc) => {
    if (doc._id?.startsWith('draft.')) return;  // Skip drafts
    if (!doc._id || !doc.slug) return;           // Skip invalid
    if (!uniqueDocsMap.has(doc._id)) {
      uniqueDocsMap.set(doc._id, doc);
    }
  });

  // 2. Normalize and group by type
  const slugMapByType = new Map();
  uniqueDocsMap.forEach((doc) => {
    const normalizedSlug = doc.slug
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, '')    // Remove leading/trailing /
      .replace(/\/+/g, '/');         // Replace multiple / with single /

    if (!slugMapByType.has(doc._type)) {
      slugMapByType.set(doc._type, new Map());
    }
    const typeMap = slugMapByType.get(doc._type);

    const entries = typeMap.get(normalizedSlug) ?? [];
    entries.push({ _id: doc._id, _type: doc._type, title: doc.title });
    typeMap.set(normalizedSlug, entries);
  });

  // 3. Identify duplicates (slugs used by multiple docs)
  const duplicatesByType = new Map();
  let totalCount = 0;

  slugMapByType.forEach((typeMap, docType) => {
    const typeDuplicates = [];
    typeMap.forEach((documents, slug) => {
      if (documents.length > 1) {  // More than one document
        typeDuplicates.push({ slug, documents });
        totalCount++;
      }
    });
    if (typeDuplicates.length > 0) {
      typeDuplicates.sort((a, b) => 
        b.documents.length - a.documents.length
      );
      duplicatesByType.set(docType, typeDuplicates);
    }
  });

  return { duplicatesByType, totalDuplicateCount: totalCount };
}, [data]);

// Combine all summary cards including duplicates
const allSummaryCards = useMemo(() => {
  return [
    ...summaryCards,
    {
      title: 'Duplicates',
      total: totalDuplicateCount,
      issues: totalDuplicateCount,
      health: totalDuplicateCount === 0 ? 100 : 0,
      description: 'Identifies documents with duplicate slugs within their type.'
    }
  ];
}, [summaryCards, totalDuplicateCount]);

// Filter data based on search query
const filteredData = useMemo(() => {
  if (!data || !searchQuery.trim()) return data;

  const query = searchQuery.toLowerCase();

  return {
    ...data,
    missingCategories: {
      ...data.missingCategories,
      items: data.missingCategories.items.filter(
        (item) => item.title?.toLowerCase().includes(query) || 
                  item.slug?.toLowerCase().includes(query)
      )
    },
    // ... repeat for other sections
  };
}, [data, searchQuery]);
```

#### Effects

```typescript
// Fetch data when component mounts
useEffect(() => {
  fetchData();
}, [client]);  // Refetch if client changes
```

#### Rendering

The component renders:
1. **Header** - Title and refresh button
2. **Summary Cards** - 5 health metrics in grid (responsive columns)
3. **Search Input** - Filter across all sections
4. **Loading State** - Spinner while fetching
5. **Error State** - Red error card if query fails
6. **Content Sections** - Lists of items needing attention
7. **Duplicate Section** - Visual grouping of duplicates
8. **Empty State** - Success message when no duplicates

---

## GROQ Queries Reference

### Understanding GROQ Syntax

```groq
// Basic document fetch
*[_type == "page"]

// Count matching documents
count(*[_type == "page"])

// Filter by nested field
*[_type == "page" && defined(seo.seoTitle)]

// Check for empty strings
*[_type == "page" && (seo.seoTitle == "" || !defined(seo.seoTitle))]

// Array operations
*[_type == "blogPost" && count(categories) > 0]

// References - find items referencing this document
*[_type == "blogPost" && references($refId)]

// Count references
count(*[_type == "blogPost" && references(^._id)])

// Sorting
*[_type == "page"] | order(_updatedAt desc)

// Projection - select specific fields
*[_type == "page"] { _id, title, "slug": slug.current }

// Coalesce - use first non-null value
{ "name": coalesce(title, name) }

// Order by multiple fields
*[_type == "page"] | order(pageType asc, title asc)
```

### Common Queries for Dashboard

```groq
// Count pages with missing SEO title
count(*[_type == "page" && 
  (!defined(seo.seoTitle) || seo.seoTitle == "")
])

// Get posts with missing featured image alt text
*[_type == "blogPost" && 
  defined(featuredImage.asset) && 
  (!defined(featuredImage.alt) || featuredImage.alt == "")
] { _id, _type, title, "slug": slug.current }

// Find unused tags
*[_type == "tag" && 
  count(*[_type == "blogPost" && references(^._id)]) == 0
]

// Get all documents by slug (for duplicate detection)
*[_type in ["page","blogPost"] && defined(slug.current)] {
  _id, _type, title, "slug": slug.current
}

// Count all blog posts
count(*[_type == "blogPost"])

// Count posts by category
*[_type == "category"] {
  _id,
  title,
  "postCount": count(*[_type == "blogPost" && references(^._id)])
}
```

---

## Component Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────┐
│  MissingContentWidget Component      │
└──────────────┬──────────────────────┘
               │
               ├─ Fetch Data (useEffect)
               │   └─ GROQ Query via Sanity Client
               │       └─ Set Data State
               │
               ├─ Process Data (useMemo)
               │   ├─ calcHealth()
               │   ├─ summaryCards
               │   ├─ duplicatesByType
               │   └─ filteredData (search)
               │
               └─ Render JSX
                   ├─ Card (container)
                   ├─ Header (title + refresh button)
                   ├─ Summary Grid (5 cards)
                   ├─ TextInput (search)
                   ├─ Sections (content issues)
                   │   └─ Individual items with click handlers
                   └─ Duplicates Section
```

### Component Hierarchy

```
MissingContentWidget
├─ Card (wrapper)
│  └─ Stack (vertical layout)
│     ├─ Flex (header)
│     │  ├─ Heading
│     │  └─ Button (refresh)
│     ├─ Stack (subtitle)
│     │  ├─ Text
│     │  └─ Text (last refresh time)
│     ├─ Grid (summary cards)
│     │  └─ Card[] (Pages, Posts, Categories, Tags, Duplicates)
│     │     ├─ Stack
│     │     │  ├─ Flex
│     │     │  │  ├─ Heading
│     │     │  │  └─ Badge (%)
│     │     │  ├─ Text (X/Y healthy)
│     │     │  └─ Text (description)
│     ├─ TextInput (search)
│     ├─ Spinner (loading) | Error (error) | Sections (content)
│     └─ Duplicates Card (if duplicates exist)
```

### Props & Events

```typescript
// Component receives no props
// Uses Sanity hooks internally:
- useClient(): Sanity API client
- useRouter(): Navigation router

// Events handled:
- onClick() - item click → navigate to editor
- onChange() - search input → filter data
- onClick() - refresh button → refetch data
```

---

## State Management

### State Variables & Their Lifecycle

```typescript
// 1. API and Router (initialized once)
const client = useClient();
const router = useRouter();

// 2. Data State
const [data, setData] = useState(null);
// null → loading → DashboardData | null on error

// 3. Loading State
const [loading, setLoading] = useState(true);
// true → false when fetch completes

// 4. Error State
const [error, setError] = useState(null);
// null → error message on failure → null on retry

// 5. Refresh Time
const [lastRefresh, setLastRefresh] = useState(null);
// null → Date when data fetched → stays current

// 6. Search Query
const [searchQuery, setSearchQuery] = useState('');
// '' → search string typed by user
```

### State Update Flow

```
User clicks Refresh
    ↓
setLoading(true)
setError(null)
    ↓
fetchData() starts
    ↓
Sanity API query
    ↓
Success
├─ setData(result)
├─ setLastRefresh(new Date())
└─ setLoading(false)
    
OR

Failure
├─ setError(message)
└─ setLoading(false)
```

### Memoization Strategy

```typescript
// summaryCards - recalculate only when data changes
useMemo(() => { ... }, [data])

// duplicatesByType - recalculate only when documentsWithSlugs changes
useMemo(() => { ... }, [data])

// allSummaryCards - depends on other memos
useMemo(() => { ... }, [summaryCards, totalDuplicateCount])

// filteredData - recalculate when data or search changes
useMemo(() => { ... }, [data, searchQuery])
```

This ensures:
- ✅ No unnecessary re-renders
- ✅ Expensive calculations only run when dependencies change
- ✅ Smooth user interactions even with large datasets

---

## Common Tasks

### Add a New Summary Card

**Step 1:** Add metric to GROQ query
typescript
// In DASHBOARD_QUERY constant, add to the main object:
"yourMetric": {
  "total": count(*[_type == "yourType"]),
  "issues": count(*[_type == "yourType" && 
    (!defined(requiredField) || requiredField == "")
  ])
}
```

**Step 2:** Add to TypeScript types

```typescript
type DashboardData = {
  // ... existing types
  yourMetric: {
    total: number;
    issues: number;
  };
}
```

**Step 3:** Add to `summaryCards` useMemo

```typescript
{
  title: 'Your Metric',
  total: data.yourMetric.total,
  issues: data.yourMetric.issues,
  health: calcHealth(data.yourMetric.total, data.yourMetric.issues),
  description: 'Description explaining what this measures.'
}
```

**Step 4:** Add to `allSummaryCards` array

The new card will automatically appear in the grid

### Add a New Issue Section

**Step 1:** Update SectionKey type

```typescript
type SectionKey =
  | 'missingCategories'
  | 'missingTags'
  | 'missingSeo'
  | 'missingFeaturedAlt'
  | 'unusedCategories'
  | 'unusedTags'
  | 'yourNewSection';  // Add here
```

**Step 2:** Add to SECTIONS configuration array

```typescript
const SECTIONS: SectionConfig[] = [
  // ... existing sections
  {
    key: 'yourNewSection',
    title: 'Posts missing your field',
    description: 'Add yourField to improve content quality.',
    emptyLabel: 'All posts have yourField.',
    intentType: 'blogPost'
  }
];
```

**Step 3:** Add to GROQ query

```javascript
"yourNewSection": {
  "count": count(*[_type == "blogPost" && 
    (!defined(yourField) || yourField == "")
  ]),
  "items": *[_type == "blogPost" && 
    (!defined(yourField) || yourField == "")
  ] | order(_updatedAt desc) {
    _id, _type, title, "slug": slug.current
  }
}
```

**Step 4:** Add to DashboardData type

```typescript
yourNewSection: {
  count: number;
  items: Array<{ _id: string; title?: string; slug?: string; _type?: string }>;
};
```

**Step 5:** Add to filteredData useMemo

```typescript
yourNewSection: {
  ...data.yourNewSection,
  items: data.yourNewSection.items.filter(
    (item) => item.title?.toLowerCase().includes(query) || 
              item.slug?.toLowerCase().includes(query)
  )
}
```

### Customize Health Score Thresholds

```typescript
// In the tone calculation (line ~340):
const tone = card.health === 100 ? 'positive' 
  : card.health >= 80 ? 'caution'    // Change 80 to your threshold
  : 'critical';
```

**Recommended Thresholds:**
- 100% = Positive (green)
- 70-99% = Caution (yellow)
- 0-69% = Critical (red)

### Change Card Colors

Available tone values in Sanity UI:
- `positive` - Green
- `caution` - Yellow/Orange
- `critical` - Red
- `primary` - Blue
- `brand` - Your brand color
- `transparent` - No background

```typescript
<Card tone="positive" padding={3} radius={2}>
  {/* Content */}
</Card>
```

### Adjust Summary Grid Layout

Current: `[1, 2, 3, 5]` = 1 column mobile, 2 tablets, 3 medium, 5 desktop

```typescript
<Grid columns={[1, 1, 2, 5]} gap={3}>  // More narrow on tablets
  {allSummaryCards.map((card) => (...))}
</Grid>
```

### Modify Item Click Behavior

```typescript
const handleItemClick = (itemId: string, itemType: string) => {
  // Option 1: Current - navigate to editor
  router.navigateIntent('edit', { id: itemId, type: itemType });
  
  // Option 2: Open in new tab
  window.open(`/studio/desk/${itemType};${itemId}`, '_blank');
  
  // Option 3: Copy to clipboard
  navigator.clipboard.writeText(itemId);
};
```

### Add Export Functionality

```typescript
const exportData = () => {
  const csv = [
    ['Type', 'Title', 'Slug', 'Issue'].join(','),
    ...SECTIONS.map(section => 
      filteredData[section.key].items.map(item => 
        [section.key, item.title, item.slug, section.title].join(',')
      )
    ).flat()
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content-health-report.csv';
  a.click();
};

// Add button in render:
<Button 
  onClick={exportData} 
  text="Export CSV" 
  tone="primary"
/>
```

---

## Troubleshooting Extended

### Issue: "Cannot read property 'map' of undefined"

**Cause:** Data is null when component tries to render

**Solution:**
```typescript
// Always check for data existence
{data && filteredData && (
  // Render content here
)}
```

### Issue: Search doesn't work

**Debug Steps:**
1. Open browser console (F12)
2. Type: `document.querySelector('input[placeholder*="Search"]').value`
3. Verify it returns your search text
4. Check `filteredData` in React DevTools

**Common Causes:**
- Search input not bound to state
- Filter logic not checking correct fields
- Memoization dependency missing

### Issue: GROQ query returns empty results

**Test Query:**
1. Open Sanity Vision Tool (in sidebar)
2. Paste GROQ query
3. Run and check results
4. Verify document types exist with correct names

**Common Mistakes:**
- Wrong `_type` name (case-sensitive)
- Field doesn't exist on document
- Wrong filter syntax

### Issue: Refresh button doesn't update data

**Check:**
1. Is `useCdn: false` set? (required)
2. Is network request sending? (DevTools → Network tab)
3. Is data actually changing in your CMS?
4. Check console for errors

**Solution - Force hard refresh:**
```typescript
const fetchData = () => {
  setData(null);  // Clear existing data
  setLoading(true);
  setError(null);
  
  client.fetch(DASHBOARD_QUERY, {}, { 
    useCdn: false,
    perspective: 'published'
  })
  // ... rest of fetch
};
```

### Issue: Duplicates not showing

**Debug:**
1. Check if any documents have slugs
2. Verify slugs are identical (not just similar)
3. Check if same type - duplicates only show within same type

**Manual Test:**
```typescript
// Add to component for debugging
console.log('Documents with slugs:', data?.documentsWithSlugs);
console.log('Duplicates detected:', totalDuplicateCount);
console.log('Duplicates by type:', duplicatesByType);
```

### Issue: Performance is slow with many documents

**Optimizations:**
```typescript
// 1. Limit items shown
{info.items.slice(0, 50).map(...)}  // Show first 50 only

// 2. Add pagination
const [page, setPage] = useState(1);
const itemsPerPage = 20;
const paginatedItems = info.items.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
);

// 3. Debounce search
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
  return () => clearTimeout(timer);
}, [searchQuery]);

// Use debouncedQuery in filteredData memo instead
```

---

## Performance Optimization

### 1. Memoization Best Practices

```typescript
// ❌ Bad - recalculates every render
const filtered = data.items.filter(i => i.title.includes(search));

// ✅ Good - recalculates only when dependencies change
const filtered = useMemo(
  () => data.items.filter(i => i.title.includes(search)),
  [data, search]
);
```

### 2. Data Fetching Optimization

```typescript
// ❌ Bad - fetches on every render
useEffect(() => {
  fetchData();
});

// ✅ Good - fetches only on mount
useEffect(() => {
  fetchData();
}, []);

// ⚠️ Conditional - fetch on specific change
useEffect(() => {
  if (refreshKey) fetchData();
}, [refreshKey]);
```

### 3. Query Optimization

```groq
// ❌ Bad - fetches full documents
*[_type == "blogPost"] { _id, _type, title, slug, content, ... }

// ✅ Good - fetches only needed fields
*[_type == "blogPost"] { _id, _type, title, "slug": slug.current }
```

### 4. Rendering Optimization

```typescript
// ❌ Bad - re-renders entire list on any search
{items.map((item) => <ItemComponent key={item._id} item={item} />)}

// ✅ Good - memoize item components
const ItemComponent = React.memo(({ item }) => (
  <Text onClick={() => handleClick(item._id)}>{item.title}</Text>
));

{items.map((item) => <ItemComponent key={item._id} item={item} />)}
```

### 5. Conditional Rendering

```typescript
// ✅ Good - only render when needed
{loading && <Spinner />}
{error && !loading && <ErrorCard />}
{!loading && !error && data && <ContentSections />}

// ✅ Good - lazy load duplicates section
{totalDuplicateCount > 0 && (
  <DuplicatesSectionLazy />
)}
```

---

## Testing & Validation

### Unit Testing GROQ Queries

**Use Sanity Vision Tool:**
1. In Sanity Studio, click Vision icon in sidebar
2. Paste your GROQ query
3. Run with Cmd+Shift+Enter
4. Verify results

### Testing Widget Locally

```typescript
// Mock data for development
const mockData: DashboardData = {
  pageStats: { total: 10, needsAttention: 2 },
  postStats: { total: 20, needsAttention: 5 },
  // ... add other mock data
};

// In component for testing:
const data = process.env.NODE_ENV === 'development' ? mockData : realData;
```

### Validation Checklist

- [ ] Dashboard loads without errors
- [ ] Data refreshes on button click
- [ ] Search filters all sections
- [ ] Items are clickable and navigate to editor
- [ ] Health scores calculate correctly
- [ ] Duplicate detection works
- [ ] No console errors
- [ ] Mobile responsive (test at 320px, 768px, 1024px)
- [ ] Load time under 2 seconds
- [ ] Styling matches Sanity UI theme

### Testing Across Browsers

```
Chrome/Edge ✅
Safari ✅
Firefox ✅
Mobile Chrome ✅
Mobile Safari ✅
```

### Performance Benchmarks

Target metrics:
- Initial load: < 2 seconds
- Search response: < 100ms
- Data refresh: < 1 second
- No layout shifts

---

## Real-World Examples

### Example 1: Blog Platform Dashboard

```typescript
// Monitor blog health across multiple aspects
const DASHBOARD_QUERY = `{
  "publishedPosts": count(*[_type == "blogPost" && published == true]),
  "draftPosts": count(*[_type == "blogPost" && !published]),
  "postsWithImages": count(*[_type == "blogPost" && defined(featuredImage.asset)]),
  "recentPosts": *[_type == "blogPost"] | order(_createdAt desc)[0:5] { title, slug.current },
  "topAuthors": *[_type == "blogPost"] { "author": author->name, title } |
    group(.[].author) | map({ "author": .[0].author, "count": length(.) })
}`;
```

### Example 2: Multi-Language Content

```typescript
// Monitor content across languages
const DASHBOARD_QUERY = `{
  "englishPosts": count(*[_type == "blogPost" && language == "en"]),
  "spanishPosts": count(*[_type == "blogPost" && language == "es"]),
  "missingSpanish": *[_type == "blogPost" && language == "en" && 
    !defined(translations.es)
  ] { title, slug.current }
}`;
```

### Example 3: E-Commerce Product Dashboard

```typescript
// Monitor product inventory and metadata
const DASHBOARD_QUERY = `{
  "lowStockProducts": *[_type == "product" && inventory < 10],
  "missingDescriptions": count(*[_type == "product" && 
    (!defined(description) || description == "")
  ]),
  "priceOutOfRange": *[_type == "product" && 
    (price < 0.01 || price > 100000)
  ] { name, price }
}`;
```

---

## Migration Guide

### Migrating from Old Dashboard

1. **Backup existing widget**
   ```bash
   cp widgets/OldWidget.tsx widgets/OldWidget.tsx.backup
   ```

2. **Copy new widget**
   ```bash
   cp MissingContentWidget.tsx studio/widgets/
   ```

3. **Update sanity.config.ts**
   ```typescript
   // Import new widget
   import MissingContentWidget from './widgets/MissingContentWidget';
   
   // Update dashboard tool configuration
   dashboardTool({
     widgets: [
       {
         name: 'content-health',
         component: MissingContentWidget,
       },
     ],
   }),
   ```

4. **Test in development**
   ```bash
   npm run dev
   ```

5. **Deploy to production**
   ```bash
   npm run build
   npm run deploy
   ```

---

## Maintenance Checklist

**Monthly:**
- [ ] Review dashboard metrics
- [ ] Check for new missing content issues
- [ ] Validate duplicate detection
- [ ] Performance monitoring

**Quarterly:**
- [ ] Update GROQ queries if schema changes
- [ ] Review and update documentation
- [ ] Audit dependencies for security updates
- [ ] Optimize slow queries

**Annually:**
- [ ] Major version upgrades
- [ ] Redesign if needed
- [ ] Comprehensive audit
- [ ] User feedback review

---

## References & Resources

### Documentation
- [Sanity Docs](https://www.sanity.io/docs)
- [GROQ Documentation](https://www.sanity.io/docs/groq)
- [Sanity UI Components](https://www.sanity.io/ui)
- [React Hooks Documentation](https://react.dev/reference/react)

### Tools
- [Sanity Vision Tool](https://www.sanity.io/docs/vision) - GROQ query testing
- [Sanity CLI](https://www.sanity.io/docs/cli) - Command line operations
- [React DevTools](https://chrome.google.com/webstore) - Component debugging

### Community
- [Sanity Slack Community](https://slack.sanity.io/)
- [GitHub Discussions](https://github.com/sanity-io)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/sanity.io)

---

## Support & Contact

For questions or issues:
1. Check Troubleshooting section above
2. Review GROQ Queries Reference
3. Test queries in Vision Tool
4. Check browser console for errors
5. Contact Sanity support if persisting

---

**Last Updated:** November 2025
**Version:** 1.0
**Status:** Production Ready
