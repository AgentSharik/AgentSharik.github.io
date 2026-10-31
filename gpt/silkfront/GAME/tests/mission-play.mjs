// Deterministic player command policy for acceptance, NOT a replacement for human playtesting.
// Starts from the actual mission. Never writes resources/HP/outcome or spawns extra entities.
import { createMission } from '../src/missions/index.js';
import { AI } from '../src/ai.js';
import { TILE } from '../src/data.js';
export function playMission() {
  const w = createMission(), ai = new AI(w, 1), s = w.scenario;
  let nextTroop = 0, attack = false;
  const trace = [];
  const initial = w.unitsOf(0).filter((u) => u.def.worker), main = w.mainOf(0);
  w.cmdGather(0, initial.slice(0, 4).map((u) => u.id), w.nearestRes('e', main.x, main.y).id);
  w.cmdGather(0, [initial[4].id], w.nearestRes('w', main.x, main.y).id);
  w.cmdResume(0, [initial[5].id], s.refs['east-tower']);
  const army = () => w.unitsOf(0).filter((u) => !u.def.worker);
  w.cmdMove(0, army().map((u) => u.id), 38.5 * TILE, 40.5 * TILE, true);
  for (let i = 0; i < 1200 * 20 && !w.over; i++) {
    if (w.tick % 20 === 0) {
      const ws = w.unitsOf(0).filter((u) => u.def.worker), bs = w.buildingsOf(0), p = w.players[0];
      const cap = w.supply(0);
      for (const wk of ws.filter((u) => u.order.t === 'idle')) {
        const kind = ws.filter((u) => u.order.t === 'gather' && u.order.kind === 'e').length < 5 ? 'e' : 'w';
        const r = w.nearestRes(kind, wk.x, wk.y); if (r) w.cmdGather(0, [wk.id], r.id);
      }
      if (cap.cap - cap.used <= 5 && cap.cap < 60 && !ws.some((u) => u.order.t === 'build') && !bs.some((b) => !b.done)) {
        const spot = w.findBuildSpot(0, 'h_chapel'), wk = ws.find((u) => u.order.kind === 'w');
        if (wk && spot) w.cmdBuild(0, wk.id, 'h_chapel', spot.tx, spot.ty);
      }
      const m = w.mainOf(0);
      if (m?.def.dropoff && ws.length < 8 && !m.queue.length && cap.cap - cap.used > 3) w.cmdTrain(0, m.id, 'human_novice');
      const b = w.alive(s.refs.barracks), mix = ['human_swordsman', 'human_crossbowman', 'human_monster_hunter'];
      if (b && b.queue.length < 2 && w.cmdTrain(0, b.id, mix[nextTroop % mix.length]).ok) nextTroop++;
      if (s.objectives[0].done && !attack) attack = true;
      if (attack) {
        const target = w.alive(s.refs.outpost);
        const idle = army().filter((u) => ['idle','move'].includes(u.order.t));
        if (target && idle.length) w.cmdMove(0, idle.map((u) => u.id), target.x, target.y, true);
      }
      if (w.tick % 600 === 0) trace.push({ time: +w.time.toFixed(1), res: { ...p.res }, army: army().length, supply: cap, goals: s.objectives.filter((o) => o.done).map((o) => o.id) });
    }
    ai.update(); w.step();
  }
  return { w, trace };
}
if (process.argv[1]?.endsWith('mission-play.mjs')) {
  const { w, trace } = playMission();
  console.log(JSON.stringify({ time: w.time, winner: w.winner, over: w.over, reason: w.scenario.reason, goals: w.scenario.objectives, stats: w.players.map((p) => p.stats), trace }, null, 2));
  if (!w.over || w.winner !== 0) process.exitCode = 1;
}
