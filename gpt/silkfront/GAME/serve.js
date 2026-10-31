// SILKFRONT prototype — tiny static server (no dependencies).
// Root is the SILKFRONT folder so the game at /GAME/ can read the existing atlases at /ART/.
// Binds to 0.0.0.0 so the game also works behind a preview proxy / on a LAN (still no authentication).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || process.argv[2] || 5180);
const HOST = process.env.HOST || '0.0.0.0';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css; charset=utf-8', '.md': 'text/plain; charset=utf-8' };

const server = http.createServer(async (req, res) => {
  try {
    let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (url === '/GAME' || url === '/GAME/') { res.writeHead(302, { Location: '/GAME/index.html' }); res.end(); return; }
    if (url === '/') url = '/GAME/index.html';
    const file = path.resolve(ROOT, '.' + url);
    if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; } // no path traversal
    const st = await stat(file);
    if (!st.isFile()) throw new Error('not a file');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found');
  }
});
server.listen(PORT, HOST, () => console.log(`SILKFRONT: http://${HOST}:${server.address().port}/GAME/index.html`));
