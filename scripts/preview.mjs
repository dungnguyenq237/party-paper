// Local-only preview of the exact public artifact, never the repository root.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { expectedPublicFiles, repositoryRoot, verifyPublicArtifact } from './public-artifact.mjs';

const port = Number(process.argv[2] ?? '8000');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid preview port');
verifyPublicArtifact();
const allowed = new Set(expectedPublicFiles());
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
};

const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const raw = req.url?.split('?')[0] ?? '';
  // Only literal allowlisted paths; no path decoding or directory traversal.
  if (!raw.startsWith('/') || raw.includes('%') || raw.includes('\\') || raw.split('/').some(segment => segment === '.' || segment === '..')) {
    res.writeHead(404).end();
    return;
  }
  let path = raw.startsWith('/party-paper/') ? raw.slice('/party-paper/'.length) : raw.slice(1);
  if (path === '') path = 'index.html';
  if (!allowed.has(path)) {
    res.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(join(repositoryRoot, 'dist', path));
    res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Content-Length': body.byteLength });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500).end();
  }
});

server.listen(port, '127.0.0.1', () => console.log('[preview] http://127.0.0.1:' + port + '/ (also /party-paper/)'));
