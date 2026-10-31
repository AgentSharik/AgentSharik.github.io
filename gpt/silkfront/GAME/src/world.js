// SILKFRONT prototype — simulation state, commands and economy (no DOM; runs in node tests).
import { TILE, MAP_W, MAP_H, DT, UNITS, BUILDINGS, RES, FACTIONS, SUPPLY_MAX, START } from './data.js';
import { PathFinder } from './path.js';
import { updateUnit, updateBuilding, updateProjectile, separate } from './units.js';

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

export class World {
  constructor({ seed = 1, factions = ['HUMANS', 'SPIDERS'] } = {}) {
    this.w = MAP_W; this.h = MAP_H; this.pw = MAP_W * TILE; this.ph = MAP_H * TILE;
    this.blocked = new Uint8Array(MAP_W * MAP_H);
    this.tileEnt = new Int32Array(MAP_W * MAP_H);
    this.pf = new PathFinder(MAP_W, MAP_H, this.blocked);
    this.ents = new Map(); this.units = new Set(); this.buildings = new Set(); this.res = new Set();
    this.nextId = 1; this.projectiles = []; this.effects = []; this.events = []; this.nextEventId = 1; this.lastEmit = new Map();
    this.time = 0; this.tick = 0; this.over = false; this.winner = null; this.pathBudget = 0;
    this.rand = rng(seed);
    this.players = factions.map((fac, id) => ({ id, fac, res: { e: START.e, w: START.w }, defeated: false,
      stats: { kills: 0, lost: 0, trained: 0, built: 0, gathered: { e: 0, w: 0 } } }));
  }

  // ---------- entities ----------
  addUnit(type, owner, x, y) {
    const def = UNITS[type];
    const u = { id: this.nextId++, kind: 'unit', type, def, owner, x, y, hp: def.hp, maxHp: def.hp, r: def.r,
      order: { t: 'idle' }, path: null, facing: owner === 0 ? 1 : -1, anim: 'idle', animT: 0, animLock: 0,
      cd: 0, swing: -1, carry: null, scanT: this.rand() * 0.5, stuckT: 0, flash: 0, dead: false, removeAt: 0, moving: false };
    this.ents.set(u.id, u); this.units.add(u); return u;
  }
  addBuilding(type, owner, tx, ty, done = true) {
    const def = BUILDINGS[type], s = def.size;
    const b = { id: this.nextId++, kind: 'building', type, def, owner, tx, ty, size: s, r: 0,
      x: (tx + s / 2) * TILE, y: (ty + s / 2) * TILE, hp: done ? def.hp : def.hp * 0.1, maxHp: def.hp, done, progress: done ? 1 : 0,
      queue: [], qT: 0, qStarted: false, rally: null, cd: 0, flash: 0, dead: false };
    this.ents.set(b.id, b); this.buildings.add(b); this.occupy(b, true); return b;
  }
  addRes(type, tx, ty) {
    const def = RES[type], s = def.size;
    for (let y = ty; y < ty + s; y++) for (let x = tx; x < tx + s; x++) if (!this.inMap(x, y) || this.blocked[y * MAP_W + x]) return null;
    const r = { id: this.nextId++, kind: 'res', type, def, tx, ty, size: s, r: 0, x: (tx + s / 2) * TILE, y: (ty + s / 2) * TILE,
      amount: def.amount, var: Math.floor(this.rand() * 4) };
    this.ents.set(r.id, r); this.res.add(r); this.occupy(r, true); return r;
  }
  occupy(e, on) {
    for (let y = e.ty; y < e.ty + e.size; y++) for (let x = e.tx; x < e.tx + e.size; x++) {
      const i = y * MAP_W + x; this.blocked[i] = on ? 1 : 0; this.tileEnt[i] = on ? e.id : 0;
    }
  }
  remove(e) { this.ents.delete(e.id); this.units.delete(e); this.buildings.delete(e); this.res.delete(e); }
  alive(id) { const e = this.ents.get(id); return e && !e.dead ? e : null; }
  depleteRes(r) { this.occupy(r, false); this.remove(r); }

  inMap(x, y) { return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H; }
  walkable(px, py) { const x = Math.floor(px / TILE), y = Math.floor(py / TILE); return this.inMap(x, y) && !this.blocked[y * MAP_W + x]; }
  canPlace(size, tx, ty) {
    if (![size, tx, ty].every(Number.isInteger) || size <= 0) return false;
    if (tx < 1 || ty < 1 || tx + size > MAP_W - 1 || ty + size > MAP_H - 1) return false;
    for (let y = ty; y < ty + size; y++) for (let x = tx; x < tx + size; x++) if (this.blocked[y * MAP_W + x]) return false;
    for (const r of this.res) if (r.type === 'mine' && tx < r.tx + r.size + 1 && tx + size > r.tx - 1 && ty < r.ty + r.size + 1 && ty + size > r.ty - 1) return false;
    return true;
  }
  // Nearest walkable tile centre around (px,py), spiral search.
  freeNear(px, py, maxR = 10) {
    const cx = Math.floor(px / TILE), cy = Math.floor(py / TILE);
    for (let r = 0; r <= maxR; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = cx + dx, y = cy + dy;
      if (this.inMap(x, y) && !this.blocked[y * MAP_W + x]) return { x: (x + 0.5) * TILE, y: (y + 0.5) * TILE };
    }
    return { x: px, y: py };
  }

  // ---------- queries ----------
  mainOf(pid) { let best = null; for (const b of this.buildings) if (b.owner === pid && !b.dead && (b.def.dropoff || !best)) if (!best || (b.def.dropoff && !best.def.dropoff)) best = b; return best; }
  has(pid, type) { for (const b of this.buildings) if (b.owner === pid && b.type === type && b.done && !b.dead) return true; return false; }
  unitsOf(pid) { return [...this.units].filter((u) => u.owner === pid && !u.dead); }
  buildingsOf(pid) { return [...this.buildings].filter((b) => b.owner === pid && !b.dead); }
  nearestDropoff(pid, x, y) { let best = null, bd = 1e18; for (const b of this.buildings) if (b.owner === pid && b.done && !b.dead && b.def.dropoff) { const d = (b.x - x) ** 2 + (b.y - y) ** 2; if (d < bd) { bd = d; best = b; } } return best; }
  reachable(r) { // a node with at least one free neighbouring tile
    for (let y = r.ty - 1; y <= r.ty + r.size; y++) for (let x = r.tx - 1; x <= r.tx + r.size; x++) if (this.inMap(x, y) && !this.blocked[y * MAP_W + x]) return true;
    return false;
  }
  nearestRes(kind, x, y, maxD = 1200, exclude = 0) {
    let best = null, bd = maxD * maxD;
    for (const r of this.res) { if (r.def.kind !== kind || r.id === exclude || r.amount <= 0) continue;
      const d = (r.x - x) ** 2 + (r.y - y) ** 2; if (d < bd && this.reachable(r)) { bd = d; best = r; } }
    return best;
  }
  supply(pid) {
    let used = 0, cap = 0;
    for (const u of this.units) if (u.owner === pid && !u.dead) used += u.def.supply;
    for (const b of this.buildings) if (b.owner === pid && !b.dead) { if (b.done) cap += b.def.supply; if (b.qStarted) used += UNITS[b.queue[0]].supply; }
    return { used, cap: Math.min(SUPPLY_MAX, cap) };
  }
  canAfford(pid, c) { const r = this.players[pid].res; return r.e >= c.e && r.w >= c.w; }
  pay(pid, c) { const r = this.players[pid].res; r.e -= c.e; r.w -= c.w; }
  refund(pid, c) { const r = this.players[pid].res; r.e += c.e; r.w += c.w; }
  missing(pid, c) { const r = this.players[pid].res; return r.e < c.e ? 'Недостаточно эссенции' : 'Недостаточно древесины'; }
  emit(pid, key, text, every = 0) {
    const k = pid + key, last = this.lastEmit.get(k);
    if (every && last !== undefined && this.time - last < every) return;
    this.lastEmit.set(k, this.time); this.events.push({ id: this.nextEventId++, pid, key, text, t: this.time });
    if (this.events.length > 200) this.events.splice(0, 100);
  }
  // AI/test helper: free spot for a building near the player's main, keeping a 1-tile walkway.
  findBuildSpot(pid, type) {
    const m = this.mainOf(pid); if (!m) return null;
    const s = BUILDINGS[type].size, cx = Math.floor(m.x / TILE), cy = Math.floor(m.y / TILE);
    const mine = this.nearestRes('e', m.x, m.y, 600);
    for (let rad = 4; rad < 20; rad++) for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== rad) continue;
      const tx = cx + dx - (s >> 1), ty = cy + dy - (s >> 1);
      if (!this.canPlace(s + 2, tx - 1, ty - 1)) continue;
      if (mine && segDist((tx + s / 2) * TILE, (ty + s / 2) * TILE, m.x, m.y, mine.x, mine.y) < 4.5 * TILE) continue;
      return { tx, ty };
    }
    return null;
  }

  // ---------- commands (all validated against the issuing player) ----------
  mine(pid, ids) { return this.over ? [] : ids.map((id) => this.ents.get(id)).filter((e) => e && !e.dead && e.owner === pid && e.kind === 'unit'); }
  setOrder(u, o) {
    // Before a foundation exists the cost is escrowed by the worker's order.
    // Every interruption (including death) releases it once, never a placed building.
    if (u.order.t === 'build' && !u.order.site) this.refund(u.owner, BUILDINGS[u.order.type].cost);
    u.order = o; u.path = null; u.swing = -1; u.stuckT = 0;
  }
  cmdMove(pid, ids, x, y, amove = false) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const us = this.mine(pid, ids), n = us.length; if (!n) return false;
    const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), sp = 30;
    us.forEach((u, i) => {
      const px = clamp(x + (i % cols - (cols - 1) / 2) * sp, 8, this.pw - 8), py = clamp(y + (Math.floor(i / cols) - (rows - 1) / 2) * sp, 8, this.ph - 8);
      this.setOrder(u, { t: amove ? 'amove' : 'move', x: px, y: py });
    });
    return true;
  }
  cmdAttack(pid, ids, tid) {
    const t = this.alive(tid); if (!t || t.kind === 'res' || t.owner === pid) return false;
    const us = this.mine(pid, ids); us.forEach((u) => this.setOrder(u, { t: 'attack', id: t.id })); return us.length > 0;
  }
  cmdGather(pid, ids, rid) {
    const r = this.alive(rid); if (!r || r.kind !== 'res') return false;
    const ws = this.mine(pid, ids).filter((u) => u.def.worker);
    ws.forEach((u) => this.setOrder(u, { t: 'gather', id: r.id, kind: r.def.kind, phase: u.carry ? 'return' : 'go', ht: 0 }));
    return ws.length > 0;
  }
  cmdReturn(pid, ids) {
    const ws = this.mine(pid, ids).filter((u) => u.def.worker && u.carry);
    ws.forEach((u) => this.setOrder(u, { t: 'gather', id: 0, kind: u.carry.k, phase: 'return', ht: 0 })); return ws.length > 0;
  }
  cmdStop(pid, ids) { this.mine(pid, ids).forEach((u) => this.setOrder(u, { t: 'idle' })); }
  cmdHeal(pid, ids, tid) {
    const t = this.alive(tid); if (!t || t.kind !== 'unit' || t.owner !== pid) return false;
    const hs = this.mine(pid, ids).filter((u) => u.def.heal && u.id !== t.id); hs.forEach((u) => this.setOrder(u, { t: 'heal', id: t.id })); return hs.length > 0;
  }
  cmdBuild(pid, wid, type, tx, ty) {
    const u = this.mine(pid, [wid])[0], def = BUILDINGS[type];
    if (!u || !u.def.worker || !def || def.fac !== this.players[pid].fac) return { ok: false, reason: 'Нельзя построить' };
    if (!this.canPlace(def.size, tx, ty)) return { ok: false, reason: 'Здесь строить нельзя' };
    if (!this.canAfford(pid, def.cost)) return { ok: false, reason: this.missing(pid, def.cost) };
    this.pay(pid, def.cost);
    this.setOrder(u, { t: 'build', type, tx, ty, site: 0 }); return { ok: true };
  }
  cmdResume(pid, ids, bid) {
    const b = this.alive(bid); if (!b || b.kind !== 'building' || b.owner !== pid || b.done) return false;
    const ws = this.mine(pid, ids).filter((u) => u.def.worker); ws.forEach((u) => this.setOrder(u, { t: 'build', type: b.type, tx: b.tx, ty: b.ty, site: b.id })); return ws.length > 0;
  }
  cmdTrain(pid, bid, type) {
    const b = this.alive(bid), def = UNITS[type];
    if (this.over || !b || b.owner !== pid || b.kind !== 'building' || !def || !b.def.trains.includes(type)) return { ok: false, reason: 'Нельзя обучить' };
    if (!b.done) return { ok: false, reason: 'Здание ещё строится' };
    if (def.requires && !this.has(pid, def.requires)) return { ok: false, reason: 'Требуется: ' + BUILDINGS[def.requires].ru };
    if (b.queue.length >= 5) return { ok: false, reason: 'Очередь заполнена' };
    if (!this.canAfford(pid, def.cost)) return { ok: false, reason: this.missing(pid, def.cost) };
    this.pay(pid, def.cost); b.queue.push(type); return { ok: true };
  }
  cmdCancel(pid, bid, idx) {
    const b = this.alive(bid); if (this.over || !b || b.owner !== pid || b.kind !== 'building' || !Number.isInteger(idx) || idx < 0 || idx >= b.queue.length) return false;
    const [type] = b.queue.splice(idx, 1); this.refund(pid, UNITS[type].cost);
    if (idx === 0) { b.qStarted = false; b.qT = 0; } return true;
  }
  cmdRally(pid, bid, x, y, tid = 0) { const b = this.alive(bid); if (this.over || !b || b.owner !== pid || b.kind !== 'building' || !Number.isFinite(x) || !Number.isFinite(y)) return false; b.rally = { x: clamp(x, 0, this.pw - 1), y: clamp(y, 0, this.ph - 1), id: tid || 0 }; return true; }
  // Right-click semantics (Warcraft-style "smart" order).
  cmdSmart(pid, ids, x, y, tid = 0) {
    const t = tid ? this.alive(tid) : null, us = this.mine(pid, ids);
    if (!us.length) { let any = false; for (const id of ids) any = this.cmdRally(pid, id, x, y, t ? t.id : 0) || any; return any ? 'rally' : null; }
    const ws = us.filter((u) => u.def.worker).map((u) => u.id), rest = us.filter((u) => !u.def.worker).map((u) => u.id);
    if (t) {
      if (t.kind === 'res') { if (ws.length) this.cmdGather(pid, ws, t.id); if (rest.length) this.cmdMove(pid, rest, x, y); return 'gather'; }
      if (t.owner !== pid) { this.cmdAttack(pid, ids, t.id); return 'attack'; }
      if (t.kind === 'building' && !t.done && ws.length) { this.cmdResume(pid, ws, t.id); if (rest.length) this.cmdMove(pid, rest, x, y); return 'build'; }
      if (t.kind === 'building' && t.def.dropoff && ws.length) { if (!this.cmdReturn(pid, ws)) this.cmdMove(pid, ws, x, y); if (rest.length) this.cmdMove(pid, rest, x, y); return 'return'; }
      if (t.kind === 'unit' && t.hp < t.maxHp && us.some((u) => u.def.heal)) { this.cmdHeal(pid, ids, t.id); const o = us.filter((u) => !u.def.heal).map((u) => u.id); if (o.length) this.cmdMove(pid, o, x, y); return 'heal'; }
    }
    this.cmdMove(pid, ids, x, y); return 'move';
  }

  // ---------- simulation ----------
  step() {
    if (this.over) return;
    this.time += DT; this.tick++; this.pathBudget = 40;
    for (const u of this.units) updateUnit(this, u);
    for (const b of this.buildings) updateBuilding(this, b);
    for (let i = this.projectiles.length - 1; i >= 0; i--) if (updateProjectile(this, this.projectiles[i])) this.projectiles.splice(i, 1);
    separate(this);
    for (const u of this.units) if (u.dead && this.time >= u.removeAt) this.remove(u);
    for (const b of this.buildings) if (b.dead) this.remove(b);
    for (const f of this.effects) f.t += DT;
    this.effects = this.effects.filter((f) => f.t < f.life);
    if (this.tick % 10 === 0) this.checkVictory();
  }
  kill(e, src) {
    if (e.dead) return;
    e.dead = true; e.hp = 0;
    const p = this.players[e.owner];
    if (src && src.owner !== undefined && src.owner !== e.owner && this.players[src.owner]) this.players[src.owner].stats.kills++;
    if (e.kind === 'unit') {
      p.stats.lost++; this.setOrder(e, { t: 'dead' }); e.anim = 'death'; e.animT = 0; e.removeAt = this.time + 5;
    } else {
      this.occupy(e, false); this.effects.push({ type: 'collapse', x: e.x, y: e.y, s: e.size, fac: e.def.fac, t: 0, life: 1.6 });
      this.emit(e.owner, 'lostb', 'Потеряно здание: ' + e.def.ru);
    }
  }
  checkVictory() {
    if (this.over) return;
    // Authored missions resolve their own objectives here, after combat and projectile damage.
    // Skirmish keeps its original all-buildings rule and simultaneous-destruction draw.
    if (this.scenario) { this.scenario.update(this); return; }
    for (const p of this.players) if (!p.defeated && !this.buildingsOf(p.id).length) { p.defeated = true; this.emit(p.id, 'defeat', 'Все здания разрушены'); }
    const left = this.players.filter((p) => !p.defeated);
    if (left.length <= 1) { this.over = true; this.winner = left.length ? left[0].id : -1; }
  }
}

export function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1);
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
export { FACTIONS };
