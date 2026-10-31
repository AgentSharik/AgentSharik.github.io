// Headless tests of the simulation: run with `npm test` in SILKFRONT/GAME.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/map.js';
import { AI } from '../src/ai.js';
import { RES, BUILDINGS } from '../src/data.js';
import { edgeDist } from '../src/units.js';

const run = (w, sec, ais = []) => { const n = Math.round(sec * 20); for (let i = 0; i < n && !w.over; i++) { ais.forEach((a) => a.update()); w.step(); } };
const workers = (w, pid) => w.unitsOf(pid).filter((u) => u.def.worker);
const rich = (w, pid) => { w.players[pid].res.e = 5000; w.players[pid].res.w = 5000; };
const open = (w) => w.freeNear(w.pw / 2, w.ph / 2); // centre of the main lane is kept free of trees

test('map: both bases, mines and 5 workers each; bases connected by a path', () => {
  const w = createGame({ seed: 3 });
  const m0 = w.mainOf(0), m1 = w.mainOf(1);
  assert.ok(m0 && m1);
  assert.equal(workers(w, 0).length, 5); assert.equal(workers(w, 1).length, 5);
  assert.equal([...w.res].filter((r) => r.type === 'mine').length, 4);
  assert.ok([...w.res].filter((r) => r.type === 'tree').length > 200);
  const s = workers(w, 0)[0];
  const p = w.pf.find(s.x, s.y, m1.x, m1.y, (cx, cy) => edgeDist(cx, cy, m1) < 40, 30000);
  const end = p[p.length - 1];
  assert.ok(end && edgeDist(end.x, end.y, m1) < 40, 'path reaches the enemy base');
});

test('economy: workers gather essence and wood and deliver to the main building', () => {
  const w = createGame({ seed: 1 }), m = w.mainOf(0), ws = workers(w, 0);
  const mine = w.nearestRes('e', m.x, m.y, 2000), tree = w.nearestRes('w', m.x, m.y, 2000);
  w.cmdGather(0, ws.slice(0, 3).map((u) => u.id), mine.id);
  w.cmdGather(0, ws.slice(3).map((u) => u.id), tree.id);
  const r0 = { ...w.players[0].res };
  run(w, 45);
  const r = w.players[0].res;
  assert.ok(r.e >= r0.e + 80, `essence ${r0.e} → ${r.e}`);
  assert.ok(r.w >= r0.w + 16, `wood ${r0.w} → ${r.w}`);
  assert.ok(mine.amount < RES.mine.amount);
});

test('production: training costs resources, takes time and respects supply', () => {
  const w = createGame({ seed: 1 }), m = w.mainOf(0);
  const e0 = w.players[0].res.e;
  assert.ok(w.cmdTrain(0, m.id, 'human_novice').ok);
  assert.equal(w.players[0].res.e, e0 - 75);
  run(w, 5); assert.equal(workers(w, 0).length, 5, 'not instant');
  run(w, 8); assert.equal(workers(w, 0).length, 6);
  rich(w, 0);
  for (let i = 0; i < 5; i++) assert.ok(w.cmdTrain(0, m.id, 'human_novice').ok);
  assert.equal(w.cmdTrain(0, m.id, 'human_novice').ok, false, 'queue limit 5');
  run(w, 80);
  assert.equal(workers(w, 0).length, 10, 'supply cap 10 stops the 11th');
  assert.equal(m.queue.length, 1);
  assert.ok(w.events.some((e) => e.pid === 0 && e.key === 'supply'));
  assert.ok(w.cmdCancel(0, m.id, 0)); assert.equal(m.queue.length, 0);
});

test('construction: valid placement, cost, build time, then the building trains units', () => {
  const w = createGame({ seed: 1 }); rich(w, 0);
  const wk = workers(w, 0)[0], mine = w.nearestRes('e', w.mainOf(0).x, w.mainOf(0).y, 2000);
  const r0 = { ...w.players[0].res };
  const bad = w.cmdBuild(0, wk.id, 'h_barracks', mine.tx, mine.ty);
  assert.equal(bad.ok, false); assert.deepEqual(w.players[0].res, r0, 'no charge for invalid spot');
  assert.equal(w.cmdBuild(0, wk.id, 's_incubator', 30, 30).ok, false, 'other faction building rejected');
  const spot = w.findBuildSpot(0, 'h_barracks');
  assert.ok(w.cmdBuild(0, wk.id, 'h_barracks', spot.tx, spot.ty).ok);
  assert.equal(w.players[0].res.e, r0.e - BUILDINGS.h_barracks.cost.e);
  run(w, 10);
  const b = [...w.buildings].find((x) => x.type === 'h_barracks');
  assert.ok(b && !b.done, 'site placed, under construction');
  assert.equal(w.cmdTrain(0, b.id, 'human_swordsman').ok, false);
  run(w, 45);
  assert.ok(b.done, 'finished'); assert.equal(b.hp, b.maxHp);
  assert.match(w.cmdTrain(0, b.id, 'human_knight').reason, /Часовня/);
  assert.ok(w.cmdTrain(0, b.id, 'human_swordsman').ok);
  run(w, 20);
  assert.equal(w.unitsOf(0).filter((u) => u.type === 'human_swordsman').length, 1);
});

test('combat: melee fight between factions ends with deaths, kills counted, corpses removed', () => {
  const w = createGame({ seed: 1 }), c = open(w);
  const a = [0, 1, 2].map((i) => w.addUnit('human_swordsman', 0, c.x - 40, c.y + i * 26 - 26));
  const b = [0, 1, 2].map((i) => w.addUnit('spider_fang', 1, c.x + 40, c.y + i * 26 - 26));
  run(w, 40);
  const dead = [...a, ...b].filter((u) => u.dead || !w.ents.has(u.id)).length;
  assert.ok(dead >= 3, `dead ${dead}`);
  assert.equal(w.players[0].stats.kills, w.players[1].stats.lost);
  assert.equal(w.players[1].stats.kills, w.players[0].stats.lost);
  run(w, 6);
  assert.ok([...w.units].every((u) => !u.dead || w.time < u.removeAt), 'corpses cleaned up');
});

test('combat: ranged unit damages a building with projectiles; hunter bonus vs large', () => {
  const w = createGame({ seed: 1 }), m1 = w.mainOf(1);
  const p = w.freeNear(m1.x - 190, m1.y - 120), xb = w.addUnit('human_crossbowman', 0, p.x, p.y);
  assert.ok(w.cmdAttack(0, [xb.id], m1.id));
  let shots = 0; for (let i = 0; i < 200; i++) { w.step(); shots = Math.max(shots, w.projectiles.length); }
  assert.ok(shots > 0); assert.ok(m1.hp < m1.maxHp);
  const c = open(w), h = w.addUnit('human_monster_hunter', 0, c.x, c.y), s = w.addUnit('human_swordsman', 0, c.x, c.y + 60);
  const big = w.addUnit('spider_armored', 1, c.x + 30, c.y), small = w.addUnit('spider_fang', 1, c.x + 30, c.y + 60);
  big.order = small.order = { t: 'move', x: c.x + 30, y: c.y, fixed: true }; // passive targets
  w.cmdAttack(0, [h.id], big.id); w.cmdAttack(0, [s.id], small.id);
  const hp = big.hp; run(w, 3.2); assert.ok(hp - big.hp > 16 * 1.5 * 0.8, 'bonus damage applied');
});

test('support: priest heals wounded allies automatically', () => {
  const w = createGame({ seed: 1 }), c = open(w);
  w.addUnit('human_priest', 0, c.x, c.y); const s = w.addUnit('human_swordsman', 0, c.x + 60, c.y); s.hp = 100;
  run(w, 8); assert.ok(s.hp > 160, `hp ${s.hp}`);
});

test('defence: a tower shoots enemy units in range', () => {
  const w = createGame({ seed: 1 }), spot = w.findBuildSpot(0, 'h_tower');
  const t = w.addBuilding('h_tower', 0, spot.tx, spot.ty, true);
  const p = w.freeNear(t.x + 150, t.y), f = w.addUnit('spider_fang', 1, p.x, p.y); f.order = { t: 'move', x: p.x, y: p.y, fixed: true };
  run(w, 4); assert.ok(f.hp < f.maxHp);
});

test('ownership: a player cannot command enemy units or buildings', () => {
  const w = createGame({ seed: 1 });
  assert.equal(w.cmdMove(1, [workers(w, 0)[0].id], 100, 100), false);
  assert.equal(w.cmdTrain(1, w.mainOf(0).id, 'human_novice').ok, false);
  assert.equal(w.cmdBuild(1, workers(w, 0)[0].id, 's_brood', 30, 30).ok, false);
});

test('victory: a player without buildings is defeated', () => {
  const w = createGame({ seed: 1 });
  for (const b of w.buildingsOf(1)) w.kill(b, { owner: 0 });
  run(w, 1);
  assert.ok(w.over); assert.equal(w.winner, 0); assert.ok(w.players[1].defeated);
});

for (const factions of [['HUMANS', 'SPIDERS'], ['SPIDERS', 'HUMANS']]) {
  test(`AI vs AI full match (${factions.join(' vs ')}): economy, buildings, army, fights, performance`, () => {
    const w = createGame({ seed: 7, factions }), ais = [new AI(w, 0), new AI(w, 1)];
    const t0 = performance.now(); run(w, 25 * 60, ais); const ms = (performance.now() - t0) / w.tick;
    const st = w.players.map((p) => p.stats);
    console.log(`  ${factions.join(' vs ')}: t=${w.time.toFixed(0)}s winner=${w.winner} ${ms.toFixed(2)}ms/tick`, JSON.stringify(st));
    for (const s of st) { assert.ok(s.built >= 2, 'built ≥2'); assert.ok(s.trained >= 8, 'trained ≥8'); }
    assert.ok(st[0].kills + st[1].kills > 5, 'armies fought');
    assert.ok(w.over && [0, 1].includes(w.winner), `match must end with one victor, got ${w.winner}`);
    assert.ok(w.players[1 - w.winner].defeated, 'loser has no surviving buildings');
    assert.ok(ms < 8, 'tick cost');
  });
}
