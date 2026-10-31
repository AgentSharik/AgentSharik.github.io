// SILKFRONT prototype — computer opponent. Uses only the public command API of World,
// i.e. exactly the same orders a human player can give (no cheating, no extra resources).
import { UNITS, BUILDINGS, FACTIONS } from './data.js';

const MIX = {
  HUMANS: ['human_swordsman', 'human_crossbowman', 'human_swordsman', 'human_monster_hunter', 'human_crossbowman', 'human_knight'],
  SPIDERS: ['spider_fang', 'spider_spitter', 'spider_fang', 'spider_scout', 'spider_spitter', 'spider_armored'],
};
const SUP = { HUMANS: 'h_chapel', SPIDERS: 's_brood' }, BAR = { HUMANS: 'h_barracks', SPIDERS: 's_incubator' }, TOW = { HUMANS: 'h_tower', SPIDERS: 's_webtower' };

export class AI {
  constructor(w, pid, { maxWorkers = 10 } = {}) { this.w = w; this.pid = pid; this.maxWorkers = maxWorkers; this.mix = 0; this.wave = 0; this.attacking = false; }

  update() { // called every tick; thinks once per second
    const w = this.w, pid = this.pid, p = w.players[pid];
    if (w.over || p.defeated || (w.tick + pid * 9) % 20) return;
    const F = FACTIONS[p.fac], main = w.mainOf(pid);
    const units = w.unitsOf(pid), workers = units.filter((u) => u.def.worker), army = units.filter((u) => !u.def.worker);
    const bs = w.buildingsOf(pid);
    this.economy(main, workers);
    if (main && main.done && main.def.dropoff && !main.queue.length && workers.length < this.maxWorkers) w.cmdTrain(pid, main.id, F.worker);
    const saving = this.construct(p.fac, bs, workers);
    if (!saving) this.produce(p.fac, bs, army);
    this.fight(army, main);
  }

  economy(main, workers) {
    if (!main) return;
    const w = this.w;
    let nE = workers.filter((u) => u.order.t === 'gather' && u.order.kind === 'e').length;
    for (const u of workers) {
      if (u.order.t !== 'idle') continue;
      if (nE < 5) { const m = w.nearestRes('e', main.x, main.y, 1800); if (m) { w.cmdGather(this.pid, [u.id], m.id); nE++; continue; } }
      const t = w.nearestRes('w', main.x, main.y, 1800); if (t) w.cmdGather(this.pid, [u.id], t.id);
    }
  }
  builder(workers) {
    return workers.find((u) => u.order.t === 'gather' && u.order.kind === 'w' && !u.carry)
      || workers.find((u) => u.order.t === 'gather' && u.order.kind === 'w') || workers.find((u) => u.order.t !== 'build');
  }
  // Returns true when saving resources for a wanted building.
  construct(fac, bs, workers) {
    const w = this.w, pid = this.pid, s = w.supply(pid);
    for (const b of bs) if (!b.done && !workers.some((u) => u.order.t === 'build' && u.order.site === b.id)) { // lost its builder
      const wk = this.builder(workers); if (wk) w.cmdResume(pid, [wk.id], b.id);
    }
    if (workers.some((u) => u.order.t === 'build' && !u.order.site)) return false; // one placement at a time
    const cnt = (t) => bs.filter((b) => b.type === t).length;
    let want = null;
    if (s.cap < 60 && s.cap - s.used <= 5 && !bs.some((b) => b.type === SUP[fac] && !b.done)) want = SUP[fac];
    else if (cnt(BAR[fac]) < 1 && workers.length >= 6) want = BAR[fac];
    else if (cnt(SUP[fac]) < 1 && w.time > 120) want = SUP[fac];
    else if (cnt(TOW[fac]) < 1 && w.time > 240 && cnt(BAR[fac])) want = TOW[fac];
    else if (cnt(BAR[fac]) < 2 && cnt(BAR[fac]) && w.players[pid].res.e > 380) want = BAR[fac]; // floating essence → 2nd producer
    else if (cnt(BAR[fac]) < 3 && w.time > 420 && w.players[pid].res.e > 500) want = BAR[fac];
    if (!want) return false;
    if (!w.canAfford(pid, BUILDINGS[want].cost)) return true;
    const spot = w.findBuildSpot(pid, want), wk = spot && this.builder(workers);
    if (wk) w.cmdBuild(pid, wk.id, want, spot.tx, spot.ty);
    return false;
  }
  produce(fac, bs, army) {
    const w = this.w, pid = this.pid, mix = MIX[fac];
    for (const b of bs) {
      if (!b.done || b.queue.length >= 2) continue;
      if (b.type === 'h_chapel') {
        if (army.length >= 4 && army.filter((u) => u.type === 'human_priest').length + b.queue.length < 2) w.cmdTrain(pid, b.id, 'human_priest');
        continue;
      }
      if (b.type !== BAR[fac]) continue;
      for (let k = 0; k < mix.length; k++) {
        const t = mix[(this.mix + k) % mix.length], d = UNITS[t];
        if (d.requires && !w.has(pid, d.requires)) continue;
        if (w.cmdTrain(pid, b.id, t).ok) this.mix = (this.mix + k + 1) % mix.length;
        break; // wait for money for this unit rather than skipping to cheaper ones
      }
    }
  }
  enemyTarget() {
    const m = this.w.mainOf(this.pid), ox = m ? m.x : this.w.pw / 2, oy = m ? m.y : this.w.ph / 2;
    let best = null, bd = 1e18;
    for (const b of this.w.buildings) if (b.owner !== this.pid && !b.dead) { const d = (b.x - ox) ** 2 + (b.y - oy) ** 2; if (d < bd) { bd = d; best = b; } }
    return best;
  }
  fight(army, main) {
    const w = this.w, pid = this.pid, al = w.players[pid].alert;
    if (al && w.time - al.t < 2 && main && Math.hypot(al.x - main.x, al.y - main.y) < 700) { // defend the base
      const free = army.filter((u) => u.order.t === 'idle' || (!this.attacking && u.order.t === 'move'));
      if (free.length) w.cmdMove(pid, free.map((u) => u.id), al.x, al.y, true);
    }
    const need = Math.min(16, 6 + this.wave * 2);
    if (!this.attacking && army.length >= need) { this.attacking = true; this.wave++; }
    if (!this.attacking) return;
    if (army.length < 3) { this.attacking = false; return; }
    const t = this.enemyTarget(); if (!t) return;
    const idle = army.filter((u) => u.order.t === 'idle' || u.order.t === 'move');
    if (idle.length) w.cmdMove(pid, idle.map((u) => u.id), t.x, t.y, true);
  }
}
