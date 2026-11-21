// Tiny static server for playing Twin Worlds locally.
// Serves game/ at the root so game/index.html opens at
// http://localhost:8080/ with no network requests.
// Usage: node serve.ts [--port 8080]

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(new URL('.', import.meta.url).pathname, 'game');
const argv = process.argv.slice(2);
const portArg = argv.find((a) => a.startsWith('--port='))?.split('=')[1]
  || (argv.includes('--port') ? argv[argv.indexOf('--port') + 1] : undefined);
const port = Number(portArg || 8080);

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = normalize(urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, ''));
  const file = join(root, rel);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

server.listen(port, () => console.log(`Twin Worlds at http://localhost:${port}/`));
