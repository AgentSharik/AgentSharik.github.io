// Reuse only the previously reported local project server, after proving it serves current files.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const url = process.argv[2];
assert.match(url || '', /^http:\/\/127\.0\.0\.1:\d+\/GAME\/index\.html$/);
for (const file of ['index.html', 'src/input.js', 'src/game.js']) {
  const response = await fetch(new URL(file, url), { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200, file);
  assert.equal(await response.text(), await readFile(new URL('../../GAME/' + file, import.meta.url), 'utf8'), file + ': server must serve current workspace');
}
console.log('Verified current project server: ' + url);
