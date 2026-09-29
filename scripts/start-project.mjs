import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const appRoot = join(repoRoot, 'tools', 'project-starter');
const port = Number(process.env.PROJECT_STARTER_PORT || 4399);
const host = '127.0.0.1';
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

const send = (response, status, body, contentType = 'application/json; charset=utf-8') => {
  response.writeHead(status, { 'content-type': contentType, 'cache-control': 'no-store' });
  response.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

const readRequestJson = (request) =>
  new Promise((resolveRequest, rejectRequest) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) rejectRequest(new Error('Request body is too large.'));
    });
    request.on('end', () => {
      try {
        resolveRequest(JSON.parse(body || '{}'));
      } catch {
        rejectRequest(new Error('The submitted form could not be read.'));
      }
    });
  });

const sanitizeSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const trackFiles = {
  fresh: ['project-docs/tracks/FRESH-BUILD.md', 'project-docs/Astro-Sanity Process/astro-sanity-development-process.md'],
  migration: ['project-docs/tracks/WORDPRESS-MIGRATION.md', 'project-docs/Astro-Sanity Process/wordpress-to-astro-migration.md'],
  landing: ['project-docs/tracks/LANDING-PAGE.md'],
};

const createIntake = async (payload) => {
  const slug = sanitizeSlug(payload.projectSlug);
  const track = ['fresh', 'migration', 'landing'].includes(payload.track) ? payload.track : '';
  const projectName = String(payload.projectName || '').trim();
  if (!slug || !projectName || !track) throw new Error('Project name, project slug, and delivery track are required.');

  const intake = {
    schemaVersion: 1,
    projectName,
    projectSlug: slug,
    deliveryTrack: track,
    createdAt: new Date().toISOString(),
    inputs: payload.inputs || {},
    selectedVariants: payload.selectedVariants || {},
    requiredReading: [
      'AGENTS.md',
      'project-docs/START-HERE.md',
      'project-docs/LIFECYCLE-CHECKLIST.md',
      'project-docs/standards/COMPONENT-AND-CONTENT-STANDARD.md',
      ...trackFiles[track],
    ],
    nextGate: 'Complete the matching Pre-development section in project-docs/LIFECYCLE-CHECKLIST.md before implementation.',
    secretHandling: 'Do not record credentials, API tokens, or private keys in this intake file.',
  };
  const outputDir = join(repoRoot, 'project-docs', 'clients', slug);
  const outputPath = join(outputDir, 'STARTER-INTAKE.json');
  if (payload.dryRun) {
    return { outputPath: outputPath.replace(`${repoRoot}/`, ''), intake, dryRun: true };
  }
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(intake, null, 2)}\n`, 'utf8');
  return { outputPath: outputPath.replace(`${repoRoot}/`, ''), intake };
};

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${host}:${port}`);
  if (request.method === 'POST' && requestUrl.pathname === '/api/intake') {
    try {
      send(response, 201, await createIntake(await readRequestJson(request)));
    } catch (error) {
      send(response, 400, { error: error instanceof Error ? error.message : 'Unable to save the intake.' });
    }
    return;
  }

  const relativePath = requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname.slice(1);
  const candidate = resolve(appRoot, relativePath);
  if (!candidate.startsWith(`${appRoot}/`) || !existsSync(candidate)) {
    send(response, 404, 'Not found', 'text/plain; charset=utf-8');
    return;
  }
  try {
    send(response, 200, await readFile(candidate), mimeTypes[extname(candidate)] || 'application/octet-stream');
  } catch {
    send(response, 500, 'Unable to load the starter workspace.', 'text/plain; charset=utf-8');
  }
});

server.listen(port, host, () => {
  console.log(`Project starter is running at http://${host}:${port}`);
  console.log('This tool is local-only. Press Ctrl+C when the intake is saved.');
});
