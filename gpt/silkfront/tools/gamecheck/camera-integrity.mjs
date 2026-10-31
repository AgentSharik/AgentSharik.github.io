// Compare current game/art against the pre-camera manifest, never regenerate that baseline.
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = new URL('../../', import.meta.url), backup = new URL('REVIEW_BACKUP_CAMERA_03/', root);
const before = JSON.parse(await readFile(new URL('before-sha256.json', backup), 'utf8'));
const allowed = new Set(['GAME/src/game.js', 'GAME/src/input.js', 'GAME/src/hud.js', 'GAME/src/render.js']);
const unchanged = [], changed = [], missing = [], unexpected = [], additions = [];
const hash = content => createHash('sha256').update(content).digest('hex');
for (const [file, digest] of Object.entries(before)) {
  try {
    if (hash(await readFile(new URL(file, root))) === digest) unchanged.push(file);
    else { changed.push(file); if (!allowed.has(file)) unexpected.push(file); }
  } catch (e) { if (e.code !== 'ENOENT') throw e; missing.push(file); }
}
async function scan(dir) {
  for (const item of await readdir(new URL(dir, root), { withFileTypes: true })) {
    const file = dir + item.name;
    if (item.isDirectory()) await scan(file + '/'); else if (!Object.hasOwn(before, file)) additions.push(file);
  }
}
await scan('GAME/src/'); await scan('ART/');
const report = { baseline: 'REVIEW_BACKUP_CAMERA_03/before-sha256.json', total: Object.keys(before).length,
  unchanged, changed, missing, unexpected, additions };
await mkdir(new URL('GAME/reports/camera-03/', root), { recursive: true });
await writeFile(new URL('GAME/reports/camera-03/integrity.json', root), JSON.stringify(report, null, 2));
assert.deepEqual(missing, []); assert.deepEqual(unexpected, []); assert.deepEqual(additions, []);
console.log(JSON.stringify({ checked: report.total, unchanged: unchanged.length, cameraSourcesChanged: changed,
  artUnchanged: unchanged.filter(f => f.startsWith('ART/')).length, missing, unexpected, additions }, null, 2));
