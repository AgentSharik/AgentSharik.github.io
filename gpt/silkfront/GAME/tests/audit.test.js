import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/map.js';
import { OrdersPanel } from '../src/orders.js';
import { Hud } from '../src/hud.js';
const run = (w, sec) => { for (let i = 0; i < sec * 20 && !w.over; i++) w.step(); };

test('paused tactical summary reflects commands at the same simulation time', () => {
  const w = createGame(), workers = w.unitsOf(0), nodes = new Map();
  const old = globalThis.document, oldOption = globalThis.Option;
  globalThis.document = { getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, { value: '', textContent: '', replaceChildren() {} });
    return nodes.get(id);
  } };
  globalThis.Option = class { constructor(text, value) { this.text = text; this.value = value; } };
  try {
    const g = { world: w, pid: 0, selUnits: () => workers, place: null, paused: true };
    const panel = Object.create(OrdersPanel.prototype); panel.g = g; panel.reset();
    panel.update(); assert.match(nodes.get('tactical-status').textContent, /добывают: 0/);
    w.cmdGather(0, workers.map(u => u.id), w.nearestRes('e', workers[0].x, workers[0].y).id);
    panel.update();
    assert.match(nodes.get('tactical-status').textContent, /добывают: 5/, 'orders must be visible while paused');
    g.place = { type: 'h_barracks' }; panel.update();
    assert.match(nodes.get('tactical-status').textContent, /размещение: Казармы/);
  } finally { globalThis.document = old; globalThis.Option = oldOption; }
});

test('HUD processes same-tick events emitted after its previous refresh', () => {
  const w = createGame(), g = { world: w, pid: 0 }, nodes = new Map();
  const old = globalThis.document;
  globalThis.document = { getElementById(id) { if (!nodes.has(id)) nodes.set(id, { textContent: '', style: {}, innerHTML: '' }); return nodes.get(id); } };
  try {
    const hud = Object.create(Hud.prototype); hud.g = g; hud.msgs = []; hud.lastEv = -1; hud.panel = () => {};
    w.emit(0, 'one', 'Первое событие'); hud.update();
    w.emit(0, 'two', 'Второе событие'); hud.update();
    assert.equal(hud.msgs.filter(m => m.text === 'Первое событие').length, 1);
    assert.equal(hud.msgs.filter(m => m.text === 'Второе событие').length, 1, 'timestamp is not a unique event cursor');
    for (let i = 0; i < 250; i++) w.emit(1, 'other', 'Чужое событие');
    hud.update();
    w.emit(0, 'after-trim', 'Событие после обрезки'); hud.update(); hud.update();
    assert.equal(hud.msgs.filter(m => m.text === 'Событие после обрезки').length, 1, 'cursor survives truncation without duplicates');
  } finally { globalThis.document = old; }
});

for (const [fac, type, building] of [['HUMANS', 'human_novice', 'h_barracks'], ['SPIDERS', 'spider_weaver', 's_incubator']]) {
  test(`${fac}: queued worker and pending foundation are distinct from finished entities`, () => {
    const w = createGame({ seed: 7, factions: [fac, fac === 'HUMANS' ? 'SPIDERS' : 'HUMANS'] });
    const m = w.mainOf(0), u = w.unitsOf(0)[0], spot = w.findBuildSpot(0, building);
    assert.ok(w.cmdTrain(0, m.id, type).ok);
    assert.ok(w.cmdBuild(0, u.id, building, spot.tx, spot.ty).ok);
    assert.equal(w.unitsOf(0).length, 5); assert.equal(m.queue.length, 1);
    assert.equal(w.buildingsOf(0).length, 1, 'foundation does not exist before arrival');
    run(w, 5); assert.equal(w.unitsOf(0).length, 5);
    run(w, 8); assert.equal(w.unitsOf(0).length, 6);
    const b = w.buildingsOf(0).find(b => b.type === building);
    assert.ok(b && !b.done && b.progress > 0, 'real construction progress, not a transient log');
    run(w, 45); assert.ok(b.done);
  });
}
