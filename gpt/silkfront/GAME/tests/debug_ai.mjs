// Diagnostic: AI vs AI timeline (not part of npm test). node tests/debug_ai.mjs [HUMANS|SPIDERS first]
import { createGame } from '../src/map.js';
import { AI } from '../src/ai.js';
const first = process.argv[2] || 'HUMANS', factions = first === 'HUMANS' ? ['HUMANS', 'SPIDERS'] : ['SPIDERS', 'HUMANS'];
const w = createGame({ seed: 7, factions }), ais = [new AI(w, 0), new AI(w, 1)];
for (let i = 0; i < 20 * 60 * 25 && !w.over; i++) {
  ais.forEach((a) => a.update()); w.step();
  if (w.tick % (20 * 30) === 0) {
    const line = w.players.map((p) => {
      const us = w.unitsOf(p.id), army = us.filter((u) => !u.def.worker), ord = {};
      army.forEach((u) => (ord[u.order.t] = (ord[u.order.t] || 0) + 1));
      const s = w.supply(p.id), q = w.buildingsOf(p.id).filter((b) => b.queue.length).map((b) => `${b.type}[${b.queue.join('/')}${b.qStarted ? ' ' + b.qT.toFixed(0) : ' wait'}]`);
      return `${p.fac[0]} e=${p.res.e|0} w=${p.res.w|0} sup=${s.used}/${s.cap} wk=${us.length - army.length} army=${army.length} ${JSON.stringify(ord)} q=${q.join(',')} k=${p.stats.kills} atk=${ais[p.id].attacking}`;
    });
    console.log(w.time.toFixed(0).padStart(4), line.join(' || '));
  }
}
console.log('winner', w.winner, 't', w.time.toFixed(0));
