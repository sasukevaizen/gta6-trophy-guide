// Local offline static preview server for app/ (Node 22+ standard library only).
// Usage: node serve.ts [--port 8080]

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const STATIC_ROOT = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function readPortArg(args: string[]): number {
  const flagIndex = args.indexOf('--port');
  if (flagIndex === -1) return 8080;
  const candidate = Number(args[flagIndex + 1]);
  return Number.isInteger(candidate) && candidate > 0 && candidate < 65536 ? candidate : 8080;
}

const listenPort = readPortArg(process.argv.slice(2));

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  let reqPath: string;
  try {
    reqPath = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }

  if (reqPath.endsWith('/')) reqPath += 'index.html';
  const filePath = resolve(join(STATIC_ROOT, normalize(reqPath)));
  if (filePath !== STATIC_ROOT && !filePath.startsWith(STATIC_ROOT + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let fileSize = 0;
  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) throw new Error('Not a regular file');
    fileSize = stat.size;
  } catch {
    res.writeHead(404).end('Not Found');
    return;
  }

  const mime = CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, {
    'content-type': mime,
    'content-length': fileSize,
    'cache-control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(listenPort, '127.0.0.1', () => {
  console.log(`Leonida Trophy Ledger (Pixel Dusk) serving app/ at http://127.0.0.1:${listenPort}`);
});
