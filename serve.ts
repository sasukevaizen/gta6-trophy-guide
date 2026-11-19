// Local static HTTP server for app/ (Node 22, standard library only).
// Run `node serve.ts` (or `node serve.ts --port 8080`) and open http://127.0.0.1:8080 in Chrome.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function parsePort(argv: string[]): number {
  const idx = argv.indexOf('--port');
  const raw = idx === -1 ? 8080 : Number(argv[idx + 1]);
  return Number.isInteger(raw) && raw > 0 && raw < 65536 ? raw : 8080;
}

const port = parsePort(process.argv.slice(2));

createServer((req, res) => {
  const parsed = new URL(req.url ?? '/', 'http://127.0.0.1');
  let pathname: string;
  try {
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const target = resolve(join(APP_ROOT, normalize(pathname)));
  if (target !== APP_ROOT && !target.startsWith(APP_ROOT + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let size: number;
  try {
    const info = statSync(target);
    if (!info.isFile()) throw new Error('Not a file');
    size = info.size;
  } catch {
    res.writeHead(404).end('Not Found');
    return;
  }

  const contentType = MIME_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, {
    'content-type': contentType,
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(target).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`Leonida Trophy Ledger serving app/ on http://127.0.0.1:${port}`);
});
