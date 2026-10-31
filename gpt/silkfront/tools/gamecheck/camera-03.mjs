// Camera acceptance: real browser events against the existing Canvas 2D game.
// Read-only inspection of game state, no simulation/AI/resource/order injection.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { openCameraGame, launch } from './camera-helpers.mjs';
import { navigation } from './camera-navigation.mjs';
import { checkInteractions } from './camera-interactions.mjs';
import { sizes } from './camera-sizes.mjs';
const { page, browser, errors, url } = await openCameraGame();
const results = [];
const record = (mode, name, data) => { results.push({ mode, name, passed: true, ...(data ? { data } : {}) }); console.log('PASS', mode, name); };
await mkdir('../../GAME/reports/camera-03', { recursive: true });
try {
  const modes = process.argv[3] ? [process.argv[3]] : ['HUMANS','SPIDERS','MISSION'];
  assert.ok(modes.every(mode => ['HUMANS','SPIDERS','MISSION'].includes(mode)), 'known camera test mode');
  for (const mode of modes) {
    if (results.length) { await page.goto(url); await page.locator('[data-fac="HUMANS"]:enabled').waitFor(); }
    await page.setViewportSize({ width: 1440, height: 960 });
    await launch(page, mode); await navigation(page, mode, record);
    await checkInteractions(page, mode, (name, data) => record(mode, name, data));
    await page.screenshot({ path: `../../GAME/reports/camera-03/${mode.toLowerCase()}.png` });
  }
  await sizes(page, record);
  assert.deepEqual(errors, [], 'JavaScript/console/network errors');
  const report = { scope: 'Automated camera and input regressions, not an independent human playtest. Read-only runtime probe; real mouse/keyboard events.', modes, results, errors };
  await writeFile('../../GAME/reports/camera-03/browser.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: results.length, errors }, null, 2));
} catch (e) {
  await page.screenshot({ path: '../../GAME/reports/camera-03/failure.png' });
  await writeFile('../../GAME/reports/camera-03/failure.json', JSON.stringify({ error: e.stack, results, errors, text: await page.locator('body').innerText() }, null, 2));
  throw e;
} finally { await browser.close(); }
