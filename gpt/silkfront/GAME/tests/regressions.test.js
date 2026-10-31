import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/map.js';
import { BUILDINGS, TILE } from '../src/data.js';
import { hitTest } from '../src/input.js';
const run = (w, sec) => { for (let i = 0; i < sec * 20 && !w.over; i++) w.step(); };
const worker = (w) => w.unitsOf(0).find((u) => u.def.worker);

for (const action of ['stop', 'move', 'gather', 'death']) {
  test(`pending construction: ${action} refunds an unplaced foundation exactly once`, () => {
    const w = createGame(), u = worker(w), spot = w.findBuildSpot(0, 'h_barracks');
    const initial = { ...w.players[0].res };
    assert.ok(w.cmdBuild(0, u.id, 'h_barracks', spot.tx, spot.ty).ok);
    assert.equal(w.players[0].res.e, initial.e - BUILDINGS.h_barracks.cost.e);
    if (action === 'stop') w.cmdStop(0, [u.id]);
    if (action === 'move') w.cmdMove(0, [u.id], 640, 640);
    if (action === 'gather') w.cmdGather(0, [u.id], w.nearestRes('e', u.x, u.y).id);
    if (action === 'death') w.kill(u, { owner: 1 });
    assert.deepEqual(w.players[0].res, initial);
    w.cmdStop(0, [u.id]); assert.deepEqual(w.players[0].res, initial, 'no double refund');
  });
}
test('construction: replacing a paid pending order only charges the new order', () => {
  const w = createGame(), u = worker(w), a = w.findBuildSpot(0, 'h_barracks'), b = w.findBuildSpot(0, 'h_chapel');
  const initial = { ...w.players[0].res };
  w.cmdBuild(0, u.id, 'h_barracks', a.tx, a.ty);
  w.cmdBuild(0, u.id, 'h_chapel', b.tx, b.ty);
  assert.deepEqual(w.players[0].res, { e: initial.e - 90, w: initial.w - 40 });
  w.cmdStop(0, [u.id]); assert.deepEqual(w.players[0].res, initial);
});
test('gather retarget: carried wood is delivered, not deleted when switching to essence', () => {
  const w = createGame(), u = worker(w), initial = w.players[0].res.w;
  u.carry = { k: 'w', n: 8 };
  const mine = w.nearestRes('e', u.x, u.y);
  w.cmdGather(0, [u.id], mine.id);
  assert.deepEqual(u.carry, { k: 'w', n: 8 }, 'cargo survives the order');
  run(w, 30);
  assert.equal(w.players[0].res.w, initial + 8);
  assert.ok(w.players[0].stats.gathered.e > 0, 'new resource gathered after delivery');
});
test('production cancellation rejects units and malformed queue indexes without throwing', () => {
  const w = createGame(), main = w.mainOf(0), u = worker(w);
  assert.equal(w.cmdCancel(0, u.id, 0), false);
  w.cmdTrain(0, main.id, 'human_novice');
  const res = { ...w.players[0].res };
  for (const i of [NaN, 0.5, undefined, '0']) assert.equal(w.cmdCancel(0, main.id, i), false);
  assert.equal(main.queue.length, 1); assert.deepEqual(w.players[0].res, res);
  w.step(); assert.ok(main.qStarted);
  assert.ok(w.cmdCancel(0, main.id, 0));
  assert.equal(w.supply(0).used, 5);
});
test('orders reject non-finite coordinates without corrupting simulation state', () => {
  const w = createGame(), u = worker(w), res = { ...w.players[0].res };
  assert.equal(w.cmdMove(0, [u.id], NaN, 200), false);
  assert.equal(w.cmdRally(0, w.mainOf(0).id, Infinity, 0), false);
  assert.equal(w.cmdBuild(0, u.id, 'h_barracks', 20.5, 20).ok, false);
  assert.deepEqual(w.players[0].res, res);
  run(w, 1); assert.ok(Number.isFinite(u.x) && Number.isFinite(u.y));
});
test('finished games freeze their clock and reject new economic orders', () => {
  const w = createGame(), main = w.mainOf(0);
  for (const b of w.buildingsOf(1)) w.kill(b, { owner: 0 });
  run(w, 1); assert.ok(w.over);
  const time = w.time, res = { ...w.players[0].res };
  w.step(); assert.equal(w.time, time);
  assert.equal(w.cmdTrain(0, main.id, 'human_novice').ok, false);
  assert.deepEqual(w.players[0].res, res);
});
test('simultaneous base destruction is a draw', () => {
  const w = createGame();
  for (const b of w.buildings) w.kill(b, { owner: 1 - b.owner });
  run(w, 1); assert.ok(w.over); assert.equal(w.winner, -1);
});
test('selection hit test ignores corpses, detects both units and resource footprints', () => {
  const w = createGame(), p = w.freeNear(1500, 1100), u = w.addUnit('human_swordsman', 0, p.x, p.y);
  assert.equal(hitTest(w, u.x, u.y - 30), u);
  w.kill(u, { owner: 1 }); assert.notEqual(hitTest(w, u.x, u.y - 30), u);
  const mine = w.nearestRes('e', 100, 300); assert.equal(hitTest(w, mine.tx * TILE + 1, mine.ty * TILE + 1), mine);
});
