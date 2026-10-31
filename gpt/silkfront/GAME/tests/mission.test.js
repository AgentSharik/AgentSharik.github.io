import test from 'node:test';
import assert from 'node:assert/strict';
import { createMission, MissionScenario, MISSIONS } from '../src/missions/index.js';
import { createGame } from '../src/map.js';
import { AI } from '../src/ai.js';
import { TILE, BUILDINGS } from '../src/data.js';
import { edgeDist } from '../src/units.js';
import { playMission } from './mission-play.mjs';
const run = (w, sec, ais = []) => { for (let i = 0; i < sec * 20 && !w.over; i++) { ais.forEach((a) => a.update()); w.step(); } };
const workers = (w) => w.unitsOf(0).filter((u) => u.def.worker);

test('mission 01: authored start, valid footprints, connected goals and unchanged skirmish', () => {
  const w = createMission();
  assert.equal(w.meta.name, 'Пепельная окраина');
  assert.deepEqual(w.players.map((p) => p.fac), ['HUMANS', 'SPIDERS']);
  assert.deepEqual(w.players[0].res, { e: 500, w: 200 });
  assert.equal(workers(w).length, 6); assert.equal(w.unitsOf(0).length, 12);
  assert.ok(w.supply(0).used < w.supply(0).cap);
  const occupied = new Set();
  for (const b of [...w.buildings, ...w.res]) for (let y = b.ty; y < b.ty + b.size; y++) for (let x = b.tx; x < b.tx + b.size; x++) {
    const key = y * w.w + x; assert.ok(!occupied.has(key), 'no overlapping footprints'); occupied.add(key);
  }
  for (const u of w.units) assert.ok(w.walkable(u.x, u.y));
  const scout = w.unitsOf(0).find((u) => !u.def.worker);
  const goals = [w.alive(w.scenario.refs.outpost), w.mainOf(1)];
  for (const goal of goals) {
    const p = w.pf.find(scout.x, scout.y, goal.x, goal.y, (x, y) => edgeDist(x, y, goal) < 45, 30000);
    assert.ok(p.length && edgeDist(p.at(-1).x, p.at(-1).y, goal) < 45, 'path reaches enemy perimeter');
  }
  const skirmish = createGame({ seed: 7 });
  assert.equal(skirmish.meta.name, 'Перевал'); assert.equal(skirmish.scenario, undefined);
  assert.equal(skirmish.unitsOf(0).length, 5); assert.equal(skirmish.buildingsOf(0).length, 1);
  const fresh = createMission();
  assert.notEqual(w.scenario.objectives, fresh.scenario.objectives);
  for (const id of ['not-a-mission', 'constructor', '__proto__', 'toString', 'hasOwnProperty']) {
    assert.equal(MISSIONS[id], undefined);
    assert.throws(() => createMission(id), /Неизвестная/);
  }
  assert.throws(() => new MissionScenario(w, MISSIONS['ash-outskirts'], {}), /обязательной цели/);
});

test('mission 01: supply counts deliveries, not initial stock; scout requires a combat unit', () => {
  const w = createMission(), m = w.mainOf(0), ws = workers(w);
  run(w, 1); assert.ok(w.scenario.objectives.every((o) => !o.done), 'no free completion at start');
  w.cmdGather(0, ws.slice(0, 4).map((u) => u.id), w.nearestRes('e', m.x, m.y).id);
  w.cmdGather(0, ws.slice(4).map((u) => u.id), w.nearestRes('w', m.x, m.y).id);
  run(w, 100);
  assert.ok(w.players[0].stats.gathered.e >= 160); assert.ok(w.players[0].stats.gathered.w >= 80);
  assert.ok(w.scenario.objectives.find((o) => o.id === 'supply').done);
  w.cmdMove(0, [ws[0].id], 38.5 * TILE, 40.5 * TILE); run(w, 30);
  assert.equal(w.scenario.objectives[0].done, false, 'worker cannot scout for army');
  const army = w.unitsOf(0).filter((u) => !u.def.worker);
  w.cmdMove(0, army.map((u) => u.id), 38.5 * TILE, 40.5 * TILE); run(w, 25);
  assert.ok(w.scenario.objectives[0].done);
});

test('mission 01: paid construction and training progress goals; workers do not count as reinforcement', () => {
  const w = createMission(), s = w.scenario, tower = w.alive(s.refs['east-tower']), b = w.alive(s.refs.barracks);
  assert.ok(w.cmdResume(0, [workers(w)[0].id], tower.id));
  const e = w.players[0].res.e;
  assert.ok(w.cmdTrain(0, w.mainOf(0).id, 'human_novice').ok);
  run(w, 14); assert.equal(s.recruits.size, 0);
  assert.equal(w.players[0].res.e, e - 75);
  const ws = workers(w), m = w.mainOf(0);
  w.cmdGather(0, ws.slice(1, 5).map((u) => u.id), w.nearestRes('e', m.x, m.y).id);
  w.cmdGather(0, ws.slice(5).map((u) => u.id), w.nearestRes('w', m.x, m.y).id);
  const spot = w.findBuildSpot(0, 'h_chapel');
  assert.ok(w.cmdBuild(0, ws[1].id, 'h_chapel', spot.tx, spot.ty).ok);
  run(w, 70);
  assert.ok(w.supply(0).cap >= 30, 'normal chapel supplies the recruits');
  for (let i = 0; i < 3; i++) assert.ok(w.cmdTrain(0, b.id, 'human_swordsman').ok);
  run(w, 65);
  assert.ok(tower.done); assert.ok(s.objectives.find((o) => o.id === 'fortify').done);
  assert.equal(s.recruits.size, 3); assert.ok(s.objectives.find((o) => o.id === 'muster').done);
  assert.equal(w.players[0].stats.built, 2);
});

test('mission 01: fixed target cannot be bypassed by destroying other colony buildings', () => {
  const w = createMission(), s = w.scenario;
  w.kill(w.mainOf(1), { owner: 0 }); run(w, 1);
  assert.equal(w.over, false); assert.equal(s.objectives.find((o) => o.id === 'outpost').done, false);
  w.kill(w.alive(s.refs.outpost), { owner: 0 }); run(w, 1);
  assert.ok(s.objectives.find((o) => o.id === 'outpost').done);
  assert.equal(w.over, false, 'other mission objectives still required');
});

test('mission 01: loss of original citadel defeats player with surviving barracks; tie prioritizes settlement', () => {
  const w = createMission(), s = w.scenario;
  w.kill(w.alive(s.refs.outpost), { owner: 0 });
  w.kill(w.alive(s.refs.settlement), { owner: 1 });
  run(w, 1);
  assert.ok(w.buildingsOf(0).length > 0); assert.equal(w.winner, 1); assert.equal(s.status, 'defeat');
  assert.match(s.reason, /Цитадель/);
  const t = w.time; run(w, 10); assert.equal(w.time, t);
  assert.equal(w.cmdTrain(0, s.refs.barracks, 'human_swordsman').ok, false);
});

test('mission 01: loss wins a genuine simultaneous final-objective conflict at the resolution boundary', () => {
  const w = createMission(), s = w.scenario;
  // Rule-level fixture only, not playthrough evidence: arrange four completed milestones.
  for (const o of s.objectives.filter((o) => o.id !== 'outpost')) o.done = true;
  run(w, 0.45); assert.equal(w.tick, 9);
  w.kill(w.alive(s.refs.outpost), { owner: 0 });
  w.kill(w.alive(s.refs.settlement), { owner: 1 });
  w.step();
  assert.equal(w.tick, 10); assert.equal(w.winner, 1); assert.equal(s.status, 'defeat');
  assert.equal(s.current().id, 'outpost', 'loss is resolved before the final victory milestone');
});

test('mission 01: destroyed eastern tower can be replaced through normal building commands', () => {
  const w = createMission(), s = w.scenario;
  w.kill(w.alive(s.refs['east-tower']), { owner: 1 }); run(w, 1);
  assert.ok(w.cmdBuild(0, workers(w)[0].id, 'h_tower', 25, 40).ok); run(w, 60);
  assert.ok(s.objectives.find((o) => o.id === 'fortify').done);
});

test('mission 01: full command-only play reaches victory with the colony main still alive', () => {
  const { w } = playMission(), s = w.scenario;
  assert.ok(w.over, 'bounded natural ending'); assert.equal(w.winner, 0);
  assert.equal(s.status, 'victory'); assert.ok(s.objectives.every((o) => o.done));
  assert.ok(w.alive(s.refs.settlement)); assert.ok(w.alive(s.refs.colony));
  assert.ok(!w.alive(s.refs.outpost));
  assert.ok(w.players[0].stats.built >= 2); assert.ok(w.players[0].stats.trained >= 3);
  assert.ok(w.players[0].stats.gathered.e >= 160 && w.players[0].stats.gathered.w >= 80);
  assert.ok(w.players[0].stats.kills > 0 && w.players[1].stats.trained > 0);
  const time = w.time, resources = { ...w.players[0].res };
  w.step(); assert.equal(w.time, time);
  assert.equal(w.cmdTrain(0, s.refs.barracks, 'human_swordsman').ok, false);
  assert.deepEqual(w.players[0].res, resources);
  console.log('Mission command-only victory', w.time.toFixed(1));
});

test('mission 01: unattended settlement reaches natural defeat against unchanged AI', () => {
  const w = createMission(); run(w, 20 * 60, [new AI(w, 1)]);
  assert.ok(w.over, 'bounded natural ending'); assert.equal(w.winner, 1);
  assert.ok(!w.alive(w.scenario.refs.settlement));
  assert.ok(w.players[1].stats.trained >= 6); assert.ok(w.players[1].stats.gathered.e > 0);
  assert.ok(w.players[1].stats.kills > 0);
  console.log('Mission unattended defeat', w.time.toFixed(1), JSON.stringify(w.players.map((p) => p.stats)));
});
