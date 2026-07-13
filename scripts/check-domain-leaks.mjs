#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TARGETS = ['src', 'public', 'astro.config.mjs', 'vercel.json'];
const IGNORE_DIRS = new Set(['node_modules', '.git', '.astro', 'dist']);
const TEXT_EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.css', '.html', '.xml', '.txt']);
const LEAK_PATTERNS = [
  { name: 'preview Vercel domain', re: /\b[a-z0-9-]+\.vercel\.app\b/i },
  { name: 'HeatTech inherited brand/domain', re: /heattech|heat-tech|heattechpest/i },
  { name: 'Top Bed Bug inherited brand/domain', re: /topbedbug|top-bed-bug/i },
  { name: 'Chapman inherited brand/domain', re: /chapmanplumbing|chapman-plumbing/i },
  { name: 'BBBGN inherited production domain', re: /bedbugsbegonenow\.com/i },
  { name: 'HBBN inherited production domain', re: /heatbedbugsbegonenow\.com/i },
  { name: 'PestBeGone inherited production domain', re: /pestbegonepc\.com/i }
];

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
    for (const pattern of LEAK_PATTERNS) {
      if (pattern.re.test(line)) {
        failures.push({ file, line: index + 1, kind: pattern.name, text: line.trim() });
      }
    }
  });
}

if (failures.length > 0) {
  console.error('Domain/brand leak check failed:\n');
  for (const failure of failures) {
    console.error(`${failure.file}:${failure.line} [${failure.kind}] ${failure.text}`);
  }
  process.exit(1);
}

console.log('Domain/brand leak check passed.');
