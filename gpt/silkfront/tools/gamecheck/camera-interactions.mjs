// Integration regressions: inspect existing state only; mutate it exclusively via actual UI input.
import assert from 'node:assert/strict';
import { expect } from 'playwright/test';
import { state, geometry, neutral, stationary, keySample, miniPoint, bounds, near } from './camera-helpers.mjs';

export async function checkInteractions(page, mode, record) {
  const H = mode !== 'SPIDERS', building = H ? 'Казармы' : 'Инкубатор';
  // Navigation already verified overlay occlusion; selection starts on the actual field, not the journal.
  if (mode === 'MISSION' && await page.locator('#mission-objectives').getAttribute('open') !== null)
    await page.locator('#mission-objectives > summary').click();
  await neutral(page); await page.keyboard.press('Space');
  let s = await state(page);
  const { canvas: c } = await geometry(page);
  const screen = (x, y, camera = s) => ({ x: c.x + (x - camera.x) * c.width / camera.cw,
    y: c.y + (y - camera.y) * c.height / camera.ch });
  const workers = s.units.filter(u => u.worker && u.x > s.x + 30 && u.x < s.x + s.cw - 30 && u.y > s.y + 70 && u.y < s.y + s.ch - 30);
  assert.ok(workers.length >= 2, 'visible starter workers');
  const unitPoint = u => screen(u.x, u.y - u.h * 0.35);
  let p = unitPoint(workers[0]); await page.mouse.click(p.x, p.y);
  assert.deepEqual((await state(page)).selected, [workers[0].id], 'single canvas selection');
  p = unitPoint(workers[1]); await page.keyboard.down('Shift'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Shift');
  assert.deepEqual(new Set((await state(page)).selected), new Set([workers[0].id, workers[1].id]), 'Shift adds selection');
  await page.keyboard.down('Shift'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Shift');
  assert.deepEqual((await state(page)).selected, [workers[0].id], 'Shift removes selected unit');
  await page.mouse.dblclick(p.x, p.y);
  s = await state(page);
  const expectedType = s.units.filter(u => u.worker && u.x >= s.x && u.x <= s.x+s.cw && u.y >= s.y && u.y <= s.y+s.ch).map(u => u.id);
  assert.deepEqual(new Set(s.selected), new Set(expectedType), 'double-click selects exactly the visible workers');
  // Box anchor remains a world point even if WASD is held while dragging.
  const lo = screen(Math.min(...workers.map(u => u.x)) - 28, Math.min(...workers.map(u => u.y)) - 60);
  const hi = screen(Math.max(...workers.map(u => u.x)) + 28, Math.max(...workers.map(u => u.y)) + 28);
  await page.mouse.move(lo.x, lo.y); await page.mouse.down();
  await page.mouse.move(hi.x, hi.y, { steps: 8 });
  s = await state(page); assert.ok(s.drag, 'visible box exists');
  const anchor = { x: s.drag.x0 + s.x, y: s.drag.y0 + s.y };
  await page.keyboard.down('KeyD'); await page.waitForTimeout(100); await page.keyboard.up('KeyD');
  s = await state(page); near(s.drag.x0 + s.x, anchor.x, 'box world anchor X'); near(s.drag.y0 + s.y, anchor.y, 'box world anchor Y');
  const rectangle = { x0: Math.min(s.drag.x0,s.drag.x1)+s.x, x1: Math.max(s.drag.x0,s.drag.x1)+s.x,
    y0: Math.min(s.drag.y0,s.drag.y1)+s.y, y1: Math.max(s.drag.y0,s.drag.y1)+s.y };
  const expectedBox = s.units.filter(u => u.x >= rectangle.x0 && u.x <= rectangle.x1 && u.y >= rectangle.y0 && u.y <= rectangle.y1).map(u => u.id);
  assert.ok(expectedBox.length >= 2, 'rectangle encloses starter group');
  await page.mouse.up(); s = await state(page);
  assert.deepEqual(new Set(s.selected), new Set(expectedBox), 'box selects exactly units inside world rectangle after camera pan');
  await page.keyboard.press('Control+Digit1'); const saved = s.selected;
  await page.keyboard.press('Space'); s = await state(page); p = unitPoint(workers[0]); await page.mouse.click(p.x, p.y);
  await page.keyboard.press('Digit1'); assert.deepEqual((await state(page)).selected, saved, 'control-group recall');
  record('single/Shift/double/box selection and Ctrl+1/1; world-anchored box during WASD');

  // Use an empty point on the field, not a DOM order, for the real RMB path.
  const target = await page.evaluate(() => {
    const g = window.__cameraProbe;
    for (let ty = Math.floor(g.cam.y / 32) + 4; ty < Math.floor((g.cam.y + g.canvas.height) / 32) - 3; ty++) {
      for (let tx = Math.floor(g.cam.x / 32) + 8; tx < Math.floor((g.cam.x + g.canvas.width) / 32) - 4; tx++) {
        const x = (tx + 0.5) * 32, y = (ty + 0.5) * 32;
        if (g.world.canPlace(1, tx, ty) && ![...g.world.units].some(u => !u.dead && Math.hypot(u.x - x, u.y - y) < 80)) return { x, y };
      }
    }
    return null;
  });
  assert.ok(target, 'empty on-screen order target');
  s = await state(page); p = screen(target.x, target.y, s); await page.mouse.click(p.x, p.y, { button: 'right' });
  await expect(page.locator('#log')).toContainText('Приказ: Движение');
  let selected = (await state(page));
  assert.ok(selected.units.filter(u => selected.selected.includes(u.id)).every(u => u.order.t === 'move'), 'RMB move orders accepted');
  await page.keyboard.press('KeyX');
  selected = await state(page); assert.ok(selected.units.filter(u => selected.selected.includes(u.id)).every(u => u.order.t === 'idle'), 'X stops units');
  await page.keyboard.press('KeyF'); assert.equal((await state(page)).mode, 'amove');
  await page.mouse.click(p.x, p.y); await expect(page.locator('#log')).toContainText('Атакующий марш');
  assert.equal((await state(page)).mode, '');
  await page.keyboard.press('KeyX');
  // Camera keys cannot accidentally invoke the former A/S/D/W command-card actions.
  const ids = (await state(page)).selected;
  for (const key of ['KeyA','KeyS','KeyD','KeyW']) {
    await neutral(page); await keySample(page, [key], 80);
    selected = await state(page); assert.equal(selected.mode, ''); assert.equal(selected.place, null);
    assert.deepEqual(selected.selected, ids);
    assert.ok(selected.units.filter(u => ids.includes(u.id)).every(u => u.order.t === 'idle'));
  }
  record('RMB move; F+LMB attack-move; X stop; WASD never invokes unit commands');

  // T replaces the old W command; Q starts the existing building placement path.
  await page.locator('#tactics > summary').click();
  await page.locator('#pick-idle').click(); await neutral(page);
  await page.keyboard.press('KeyT'); assert.equal((await state(page)).place?.type, H ? 'h_chapel' : 's_brood');
  await page.keyboard.press('Escape');
  await page.keyboard.press('KeyQ'); assert.equal((await state(page)).place?.type, H ? 'h_barracks' : 's_incubator');
  const spot = await page.evaluate(() => {
    const g = window.__cameraProbe, size = g.place.size;
    for (let ty = Math.ceil(g.cam.y / 32) + 3; ty < Math.floor((g.cam.y + g.canvas.height) / 32) - size - 2; ty++) {
      for (let tx = Math.ceil(g.cam.x / 32) + 3; tx < Math.floor((g.cam.x + g.canvas.width) / 32) - size - 3; tx++) {
        if (!g.world.canPlace(size, tx, ty)) continue;
        const x = (tx + size / 2) * 32, y = (ty + size / 2) * 32;
        if (document.elementFromPoint(x - g.cam.x, y - g.cam.y + 32) === g.canvas) return { x, y };
      }
    }
    return null;
  });
  assert.ok(spot, 'valid visible building position');
  s = await state(page); p = screen(spot.x, spot.y, s);
  await page.mouse.click(p.x, p.y);
  await expect(page.locator('#log')).toContainText('Приказ на строительство: ' + building);
  s = await state(page); assert.equal(s.place, null); assert.ok(s.units.some(u => s.selected.includes(u.id) && u.order.t === 'build'));
  await miniPoint(page, 0.6, 0.5); await neutral(page); bounds(await state(page));
  assert.ok((await state(page)).units.some(u => s.selected.includes(u.id) && u.order.t === 'build'), 'camera navigation preserves building order');
  await stationary(page, 'no camera inertia after placing');
  record('Q/T placement; real canvas building order survives minimap navigation');
}
