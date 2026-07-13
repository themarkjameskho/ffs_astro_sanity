#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TARGETS = [
  'src',
  'studio',
  'public',
  'astro.config.mjs',
  'vercel.json',
  'package.json',
  'README.md'
];
const IGNORE_DIRS = new Set(['node_modules', '.git', '.astro', 'dist', '.sanity']);
const IGNORE_FILES = new Set(['package-lock.json']);
const TEXT_EXTENSIONS = new Set([
  '.astro',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.json',
  '.md',
  '.css',
  '.html',
  '.xml',
  '.txt',
  '.xsl',
  '.svg'
]);
const PLACEHOLDER_RE = /\{\{\{?[A-Za-z_0-9]+\}?\}\}/g;

async function walk(entry, files = []) {
  const fullPath = path.join(ROOT, entry);
  const info = await stat(fullPath).catch(() => null);
  if (!info) return files;

  if (info.isDirectory()) {
    if (IGNORE_DIRS.has(path.basename(entry))) return files;
    const children = await readdir(fullPath);
    for (const child of children) {
      await walk(path.join(entry, child), files);
    }
    return files;
  }

  if (IGNORE_FILES.has(path.basename(entry))) return files;
  if (!TEXT_EXTENSIONS.has(path.extname(entry))) return files;
  files.push(entry);
  return files;
}

const files = [];
for (const target of TARGETS) {
  await walk(target, files);
}

const failures = [];
for (const file of files) {
  const text = await readFile(path.join(ROOT, file), 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const matches = line.match(PLACEHOLDER_RE);
    if (matches) {
      failures.push({ file, line: index + 1, matches: Array.from(new Set(matches)) });
    }
  });
}

if (failures.length > 0) {
  console.error('Runtime placeholder check failed. Replace these tokens before handoff or launch:\n');
  for (const failure of failures) {
    console.error(`${failure.file}:${failure.line} ${failure.matches.join(', ')}`);
  }
  process.exit(1);
}

console.log('Runtime placeholder check passed.');
