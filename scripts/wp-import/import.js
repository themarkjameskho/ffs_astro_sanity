#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import process from 'process';
import { promisify } from 'util';
import { htmlToText } from 'html-to-text';
import { globby } from 'globby';
import { createClient } from '@sanity/client';
import { load as loadCheerio } from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

// Avoid connection reuse to sidestep flaky TLS middleboxes.
https.globalAgent.keepAlive = false;
https.globalAgent.maxSockets = 5;

const readFile = promisify(fs.readFile);

const DEFAULT_XML = path.resolve('import/{{fork_source_slug}}pestcontrol.WordPress.2025-11-17.xml');
const DEFAULT_MEDIA_ROOT = path.resolve('import/media_library_export-{{fork_source_slug}}_pest_control-2025_11_17_13_47_36');

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.split('=');
    return [key.replace(/^--/, ''), value ?? true];
  })
);

const xmlPath = path.resolve(args.get('xml') || DEFAULT_XML);
const mediaRoot = path.resolve(args.get('mediaDir') || DEFAULT_MEDIA_ROOT);
const skipImages = args.has('skipImages');
const limit = args.has('limit') ? Number(args.get('limit')) : null;
const seoOnly = args.has('seoOnly');

const requiredEnv = ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_TOKEN'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var ${key}. Add it to your .env file.`);
    process.exit(1);
  }
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-11-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  preserveOrder: false,
  processEntities: true
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const imageCache = new Map();

async function withRetry(label, fn, { attempts = 3, delay = 750 } = {}) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️  Attempt ${i}/${attempts} failed: ${label} (${err.message || err})`);
      if (i < attempts) {
        await sleep(delay * i);
      }
    }
  }
  return null;
}

async function findMediaFile(attachmentUrl) {
  if (!attachmentUrl) return null;
  const basename = path.basename(attachmentUrl);
  const candidates = [basename];

  // try stripping WordPress size suffixes, e.g., image-1024x576.jpg -> image.jpg
  const sizeStripped = basename.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
  if (sizeStripped !== basename) candidates.push(sizeStripped);

  for (const name of candidates) {
    const matches = await globby(`**/${name}`, { cwd: mediaRoot, absolute: true, dot: true });
    if (matches[0]) return matches[0];
  }
  return null;
}

function normalizeItems(itemsMaybeArray) {
  if (!itemsMaybeArray) return [];
  return Array.isArray(itemsMaybeArray) ? itemsMaybeArray : [itemsMaybeArray];
}

function collectMeta(metaField) {
  const meta = {};
  const entries = normalizeItems(metaField);
  for (const entry of entries) {
    const key = entry?.['wp:meta_key'];
    const value = entry?.['wp:meta_value'];
    if (key) meta[key] = value;
  }
  return meta;
}

function collectCategories(categoryField) {
  const categories = {
    mainCategory: null,
    tags: []
  };
  const entries = normalizeItems(categoryField);
  for (const entry of entries) {
    const domain = entry?.['domain'] || '';
    const nicename = entry?.['nicename'] || '';
    const name = entry?.['#text'] || '';
    
    if (domain === 'category') {
      // Main category - store as string
      categories.mainCategory = name;
    } else if (domain === 'post_tag' && name.trim()) {
      // Tags - store as strings
      if (!categories.tags.includes(name)) {
        categories.tags.push(name);
      }
    }
  }
  return categories;
}

async function uploadImageFromFilePath(filePath, titleOrAlt) {
  if (!filePath) return null;
  if (imageCache.has(filePath)) {
    const cachedId = imageCache.get(filePath);
    return { _type: 'image', asset: { _type: 'reference', _ref: cachedId }, alt: titleOrAlt || '' };
  }

  const asset = await withRetry(
    `upload ${path.basename(filePath)}`,
    async () => {
      const fileBuffer = await fs.promises.readFile(filePath);
      return client.assets.upload('image', fileBuffer, { filename: path.basename(filePath) });
    },
    { attempts: 3, delay: 1500 }
  );

  if (!asset) {
    console.warn(`⚠️  Giving up on ${filePath}`);
    return null;
  }

  imageCache.set(filePath, asset._id);
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: titleOrAlt || ''
  };
}

async function uploadFeaturedImage(thumbId, attachmentMap) {
  if (!thumbId) return null;
  const attachment = attachmentMap.get(thumbId);
  if (!attachment) return null;

  const filePath = await findMediaFile(attachment.url);
  if (!filePath) {
    console.warn(`⚠️  Could not find media file for thumbnail ${thumbId} (${attachment.url})`);
    return null;
  }

  return uploadImageFromFilePath(filePath, attachment.title || attachment.url);
}

async function uploadInlineImageByUrl(src, altText) {
  const filePath = await findMediaFile(src);
  if (!filePath) {
    console.warn(`⚠️  Could not find media file for inline image ${src}`);
    return null;
  }
  return uploadImageFromFilePath(filePath, altText || path.basename(src));
}

function makeTextBlock(text, style = 'normal') {
  return {
    _type: 'block',
    style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        text,
        marks: []
      }
    ]
  };
}

async function htmlToBlocks(html) {
  if (!html) return [];
  const $ = loadCheerio(html);
  const nodes = $('body').length ? $('body').contents().toArray() : $.root().contents().toArray();
  const blocks = [];

  for (const node of nodes) {
    const el = $(node);
    if (node.type === 'text') {
      const text = el.text().trim();
      if (text) {
        blocks.push(makeTextBlock(text));
      }
      continue;
    }

    if (node.type === 'tag') {
      const tag = node.name.toLowerCase();

      if (tag === 'img') {
        if (skipImages) continue;
        const src = el.attr('src');
        const alt = el.attr('alt') || '';
        const image = await uploadInlineImageByUrl(src, alt);
        if (image) blocks.push(image);
        continue;
      }

      // inline images inside this element
      if (!skipImages) {
        const inlineImgs = el.find('img').toArray();
        for (const img of inlineImgs) {
          const imgEl = $(img);
          const src = imgEl.attr('src');
          const alt = imgEl.attr('alt') || '';
          const image = await uploadInlineImageByUrl(src, alt);
          if (image) blocks.push(image);
        }
      }

      const text = el.text().trim();
      if (!text) continue;

      const headingMatch = tag.match(/^h([1-6])$/);
      if (headingMatch) {
        blocks.push(makeTextBlock(text, `h${headingMatch[1]}`));
        continue;
      }
      if (tag === 'blockquote') {
        blocks.push(makeTextBlock(text, 'blockquote'));
        continue;
      }
      if (tag === 'li') {
        const style = el.parents('ol').length ? 'number' : el.parents('ul').length ? 'bullet' : null;
        blocks.push({
          _type: 'block',
          style: 'normal',
          listItem: style || undefined,
          markDefs: [],
          children: [{ _type: 'span', text, marks: [] }]
        });
        continue;
      }

      blocks.push(makeTextBlock(text, 'normal'));
    }
  }

  // Fallback to text-only if nothing parsed
  if (!blocks.length) {
    const text = htmlToText(html || '', { wordwrap: false, selectors: [{ selector: 'img', format: 'skip' }] });
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    return paragraphs.map((p) => makeTextBlock(p));
  }

  return blocks;
}

async function main() {
  console.log(`Reading WordPress export from ${xmlPath}`);
  console.log(`Using media directory ${mediaRoot}`);

  const xmlContent = await readFile(xmlPath, 'utf8');
  const parsed = parser.parse(xmlContent);

  const items = normalizeItems(parsed?.rss?.channel?.item);
  const attachments = items.filter((item) => item?.['wp:post_type'] === 'attachment');
  const posts = items.filter((item) => item?.['wp:post_type'] === 'post');

  const attachmentMap = new Map(
    attachments.map((item) => [
      item['wp:post_id'],
      {
        id: item['wp:post_id'],
        title: item.title,
        url: item['wp:attachment_url']
      }
    ])
  );

  console.log(`Found ${posts.length} posts and ${attachments.length} attachments`);

  const toProcess = limit ? posts.slice(0, limit) : posts;

  for (const post of toProcess) {
    const meta = collectMeta(post['wp:postmeta']);
    const slug = post['wp:post_name'] || post.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const docId = `imported-post-${post['wp:post_id']}`;

    // SEO-only mode: only update SEO fields, leave everything else untouched
    if (seoOnly) {
      // Check multiple SEO plugins: Yoast, SEO Press Pro, and others
      const seoTitle = 
        meta['_yoast_wpseo_title'] ||  // Yoast SEO
        meta['_seopress_titles_title'] ||  // SEO Press Pro
        meta['_seopress_titles_desc'] ||  // SEO Press (older)
        '';
      
      const seoDescription = 
        meta['_yoast_wpseo_metadesc'] ||  // Yoast SEO
        meta['_seopress_titles_desc'] ||  // SEO Press Pro
        meta['_seopress_titles_description'] ||  // SEO Press (older)
        '';

      // Skip posts without SEO title or description
      if (!seoTitle.trim() && !seoDescription.trim()) {
        console.log(`Skipping post ${post['wp:post_id']} – ${post.title} (no SEO data)`);
        continue;
      }

      const seoUpdate = {
        _id: docId,
        _type: 'blogPost',
        seo: {
          _type: 'seo',
          title: seoTitle || undefined,
          description: seoDescription || undefined
        }
      };

      console.log(`Updating SEO for post ${post['wp:post_id']} – ${post.title}`);
      const saved = await withRetry(`update SEO ${docId}`, () => client.createOrReplace(seoUpdate), { attempts: 3, delay: 1500 });
      if (!saved) {
        console.warn(`⚠️  Skipping post ${post['wp:post_id']} after repeated failures`);
      }
      continue;
    }

    // Full import mode: create/replace entire document
    const contentBlocks = await htmlToBlocks(post['content:encoded']);
    const excerpt = (post['excerpt:encoded'] || '').trim() || undefined;
    const publishedAt = post['wp:post_date_gmt'] || post['wp:post_date'];
    const categories = collectCategories(post['category']);

    let featuredImage = null;
    if (!skipImages) {
      featuredImage = await uploadFeaturedImage(meta['_thumbnail_id'], attachmentMap);
    }

    const doc = {
      _id: docId,
      _type: 'blogPost',
      title: post.title,
      slug: { _type: 'slug', current: slug },
      excerpt,
      featuredImage,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      author: post['dc:creator'] || undefined,
      content: contentBlocks,
      category: categories.mainCategory || undefined,
      tags: categories.tags.length > 0 ? categories.tags : undefined,
      seo: {
        _type: 'seo',
        // Use Yoast SEO fields if available, otherwise fall back to title/excerpt
        title: meta['_yoast_wpseo_title'] || post.title,
        description: meta['_yoast_wpseo_metadesc'] || excerpt
      }
    };

    console.log(`Importing post ${post['wp:post_id']} – ${post.title}`);
    const saved = await withRetry(`create doc ${doc._id}`, () => client.createOrReplace(doc), { attempts: 3, delay: 1500 });
    if (!saved) {
      console.warn(`⚠️  Skipping post ${post['wp:post_id']} after repeated failures`);
    }
  }

  console.log('Import complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
