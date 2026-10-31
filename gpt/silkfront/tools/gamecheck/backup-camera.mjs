// Local, non-destructive snapshot before camera changes. No runtime imports.
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const dest = path.join(root, 'REVIEW_BACKUP_CAMERA_03');
await mkdir(dest, { recursive: true }); // Resume a partial snapshot without overwriting any existing copy.
const files = ['GAME/src/input.js', 'GAME/src/game.js', 'GAME/src/hud.js', 'GAME/index.html', 'GAME/style.css', 'GAME/README.md',
  'tools/gamecheck/package.json', 'tools/gamecheck/mission-01.mjs', 'tools/gamecheck/human-match.mjs'];
for (const file of files) await cp(path.join(root, file), path.join(dest, file), { recursive: true, force: false });
for (const file of ['GAME/reports/mission-01', 'GAME/reports/ui-regressions.json', 'GAME/reports/ui-humans.png', 'GAME/reports/ui-spiders.png']) {
  try { await cp(path.join(root, file), path.join(dest, file), { recursive: true, force: false }); }
  catch (e) { if (e.code !== 'ENOENT') throw e; console.log('No prior report on disk:', file); }
}
const hashes = {};
async function scan(dir) {
  for (const e of await readdir(path.join(root, dir), { withFileTypes: true })) {
    const file = dir + '/' + e.name;
    if (e.isDirectory()) await scan(file);
    else hashes[file] = createHash('sha256').update(await readFile(path.join(root, file))).digest('hex');
  }
}
await scan('GAME/src'); await scan('ART');
await writeFile(path.join(dest, 'before-sha256.json'), JSON.stringify(hashes, null, 2));
console.log('Snapshot created:', dest, '; hashed files:', Object.keys(hashes).length);
