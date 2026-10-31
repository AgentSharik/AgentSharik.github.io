// Read-only verification of unchanged balance/core/atlases against the pre-mission backup.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = new URL('../../', import.meta.url);
const hash = (data) => createHash('sha256').update(data).digest('hex');
const atlasHashes = JSON.parse(await readFile(new URL('REVIEW_BACKUP_GAME_03/atlas-sha256.json', root), 'utf8'));
for (const [file, expected] of Object.entries(atlasHashes)) assert.equal(hash(await readFile(new URL(file, root))), expected, file);
const protectedFiles = ['src/data.js', 'src/map.js', 'src/ai.js', 'src/units.js', 'src/path.js', 'src/input.js', 'src/orders.js', 'src/hud.js', 'src/sound.js', 'serve.js', 'package.json', 'tests/sim.test.js', 'tests/regressions.test.js', 'tests/audit.test.js'];
for (const file of protectedFiles) assert.equal(hash(await readFile(new URL('GAME/' + file, root))), hash(await readFile(new URL('REVIEW_BACKUP_MISSION_01/' + file, root))), file);
console.log(JSON.stringify({ atlasFilesUnchanged: Object.keys(atlasHashes).length, protectedFilesUnchanged: protectedFiles }, null, 2));
