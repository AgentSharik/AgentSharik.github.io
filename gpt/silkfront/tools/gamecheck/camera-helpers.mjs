// Test-only read probe. The production files on disk are never modified and all actions
// use real Playwright mouse/keyboard input. The exposed reference is READ ONLY in these tests.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { openGame, pause } from './browser.mjs';

export async function openCameraGame() {
  // Use a real browser window for native blur/capture checks.
  const c = await openGame({ headed: true });
  const source = await readFile(new URL('../../GAME/src/game.js', import.meta.url), 'utf8');
  const anchor = 'const game = new Game();';
  assert.equal(source.split(anchor).length, 2, 'unique read-probe anchor');
  await c.page.route('**/GAME/src/game.js', route => route.fulfill({ contentType: 'text/javascript',
    body: source.replace(anchor, anchor + '\nwindow.__cameraProbe = game;') }));
  await c.page.goto(c.url); await c.page.locator('[data-fac="HUMANS"]:enabled').waitFor();
  await nativeFocus(c.page); await c.page.bringToFront();
  await c.page.waitForFunction(() => document.hasFocus());
  return c;
}
async function nativeFocus(page) {
  // Playwright enables synthetic focus on EVERY tab by default, even in a headed window.
  // Turn off only that test-environment override, so actual tab activation emits blur/focus.
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  await session.detach();
}
export async function blurToTab(page) {
  // A new game navigation can create a renderer session with Playwright's override enabled again.
  await nativeFocus(page);
  const tab = await page.context().newPage(); await tab.goto('about:blank'); await nativeFocus(tab);
  await page.bringToFront(); await page.waitForFunction(() => document.hasFocus());
  await tab.bringToFront(); await page.waitForFunction(() => !document.hasFocus());
  return tab;
}
export const state = page => page.evaluate(() => {
  const g = window.__cameraProbe;
  return { x: g.cam.x, y: g.cam.y, at: performance.now(), cw: g.canvas.width, ch: g.canvas.height,
    pw: g.world.pw, ph: g.world.ph, focused: g.controls.focused, keys: [...g.keys],
    pointer: { ...g.pointer }, client: g.controls.client && { ...g.controls.client },
    screen: { width: screen.width, height: screen.height, availWidth: screen.availWidth, availHeight: screen.availHeight },
    visibility: document.visibilityState, documentFocus: document.hasFocus(),
    miniPointer: g.controls.miniPointer, drag: g.drag && { ...g.drag }, mode: g.mode, place: g.place && { ...g.place },
    selected: [...g.selSet], units: g.world.unitsOf(g.pid).map(u => ({ id: u.id, x: u.x, y: u.y, h: u.def.h,
      worker: !!u.def.worker, order: structuredClone(u.order) })),
    main: { x: g.world.mainOf(g.pid).x, y: g.world.mainOf(g.pid).y },
    paused: g.paused, speed: g.speed };
});
export async function geometry(page) {
  return page.evaluate(() => {
    const c = document.querySelector('#view').getBoundingClientRect(), m = document.querySelector('#mini'), r = m.getBoundingClientRect();
    return { canvas: { x: c.x, y: c.y, width: c.width, height: c.height }, mini: {
      x: r.x + m.clientLeft * r.width / m.offsetWidth, y: r.y + m.clientTop * r.height / m.offsetHeight,
      width: m.clientWidth * r.width / m.offsetWidth, height: m.clientHeight * r.height / m.offsetHeight } };
  });
}
export function near(actual, expected, label, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected}`);
}
export function equalCamera(a, b, label) { near(a.x, b.x, label + ' X'); near(a.y, b.y, label + ' Y'); }
export function bounds(s) {
  assert.ok(s.x >= 0 && s.x <= Math.max(0, s.pw - s.cw), 'horizontal camera bounds');
  assert.ok(s.y >= 0 && s.y <= Math.max(0, s.ph - s.ch), 'vertical camera bounds');
}
export async function miniPoint(page, u, v, action = 'click') {
  const { mini: m } = await geometry(page);
  const x = m.x + u * m.width, y = m.y + v * m.height;
  if (action === 'click') await page.mouse.click(x, y); else await page.mouse.move(x, y);
  const s = await state(page);
  near(s.x, Math.max(0, Math.min(Math.max(0, s.pw - s.cw), u * s.pw - s.cw / 2)), 'minimap X');
  near(s.y, Math.max(0, Math.min(Math.max(0, s.ph - s.ch), v * s.ph - s.ch / 2)), 'minimap Y');
  bounds(s); return s;
}
export async function neutral(page) {
  const { canvas: c } = await geometry(page);
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
  await page.locator('#view').focus();
}
export async function center(page) { await miniPoint(page, 0.5, 0.5); await neutral(page); }
export async function launch(page, mode) {
  if (mode === 'MISSION') {
    await page.locator('#btn-mission').click(); await page.locator('#btn-mission-start').click();
  } else await page.locator(`[data-fac="${mode}"]`).click();
  await pause(page); await neutral(page);
}
export async function keySample(page, keys, ms = 240) {
  for (const key of keys) await page.keyboard.down(key);
  try {
    // Sample only the interval when ALL requested keys are held. Separate protocol calls
    // for pressing/releasing a chord can cross a real animation frame on a busy desktop.
    const before = await state(page);
    await page.waitForTimeout(ms);
    const after = await state(page), dx = after.x - before.x, dy = after.y - before.y;
    return { dx, dy, rate: Math.hypot(dx, dy) / ((after.at - before.at) / 1000), before, after };
  } finally { for (const key of keys) await page.keyboard.up(key); }
}
export async function stationary(page, label) {
  await page.waitForTimeout(50); const stopped = await state(page);
  await page.waitForTimeout(180); equalCamera(await state(page), stopped, label);
}
