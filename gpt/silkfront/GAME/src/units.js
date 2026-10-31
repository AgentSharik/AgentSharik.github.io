// SILKFRONT prototype — per-tick behaviour of units, buildings and projectiles.
// Orders: idle | move | amove | attack | gather | build | heal | dead (see README «Модель приказов»).
import { TILE, DT, UNITS, BUILDINGS, FACTIONS } from './data.js';

// Animation table shared with the renderer; matches every *_sheet.json (6/8/6/3/6 frames).
export const ANIM = { idle: { n: 6, fps: 6, loop: true }, walk: { n: 8, fps: 12, loop: true }, attack: { n: 6, fps: 12 }, hit: { n: 3, fps: 12 }, death: { n: 6, fps: 10 } };

// Edge distance from a point to an entity: footprint rect for buildings/resources, circle for units.
export function edgeDist(x, y, e) {
  if (e.size) {
    const x0 = e.tx * TILE, y0 = e.ty * TILE, x1 = x0 + e.size * TILE, y1 = y0 + e.size * TILE;
    return Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1));
  }
  return Math.max(0, Math.hypot(e.x - x, e.y - y) - (e.r || 0));
}
function nearestPoint(e, x, y) {
  if (!e.size) return { x: e.x, y: e.y };
  const x0 = e.tx * TILE, y0 = e.ty * TILE, s = e.size * TILE;
  return { x: Math.max(x0, Math.min(x0 + s, x)), y: Math.max(y0, Math.min(y0 + s, y)) };
}
function playOnce(u, name) { u.anim = name; u.animT = 0; u.animLock = ANIM[name].n / ANIM[name].fps; }
function face(u, x) { if (x > u.x + 0.5) u.facing = 1; else if (x < u.x - 0.5) u.facing = -1; }

// ---------- movement ----------
function stepToward(w, u, tx, ty) {
  const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy);
  if (d < 0.01) return 0;
  const s = Math.min(d, u.def.speed * DT), nx = u.x + dx / d * s, ny = u.y + dy / d * s;
  face(u, tx); u.moving = true;
  if (w.walkable(nx, ny)) { u.x = nx; u.y = ny; return s; }
  if (Math.abs(dx) > 0.01 && w.walkable(nx, u.y)) { const o = u.x; u.x = nx; return Math.abs(nx - o); } // slide
  if (Math.abs(dy) > 0.01 && w.walkable(u.x, ny)) { const o = u.y; u.y = ny; return Math.abs(ny - o); }
  return 0;
}
// Move until edge distance to `ent` (or point distance to gx,gy) ≤ reach. → 'arrived' | 'moving' | 'stuck'
function approach(w, u, gx, gy, reach, ent) {
  const d = ent ? edgeDist(u.x, u.y, ent) - u.r : Math.hypot(gx - u.x, gy - u.y);
  if (d <= reach) { u.path = null; u.stuckT = 0; return 'arrived'; }
  const key = ent ? ent.id : 0;
  const need = !u.path || u.pkey !== key || (ent ? ent.kind === 'unit' && Math.hypot(ent.x - u.pgx, ent.y - u.pgy) > 64 : u.pgx !== gx || u.pgy !== gy);
  if (need && w.pathBudget > 0) {
    w.pathBudget--;
    const done = ent ? (cx, cy) => edgeDist(cx, cy, ent) - u.r <= reach + 4 : (cx, cy) => Math.hypot(cx - gx, cy - gy) <= Math.max(reach, 18);
    u.path = w.pf.find(u.x, u.y, gx, gy, done); u.pkey = key; u.pgx = gx; u.pgy = gy;
  }
  let tx = gx, ty = gy;
  if (u.path && u.path.length) {
    if (Math.hypot(u.path[0].x - u.x, u.path[0].y - u.y) < 6) u.path.shift();
    if (u.path.length) { tx = u.path[0].x; ty = u.path[0].y; }
  }
  if ((!u.path || !u.path.length) && ent) { const p = nearestPoint(ent, u.x, u.y); tx = p.x; ty = p.y; }
  const moved = stepToward(w, u, tx, ty);
  if (moved < u.def.speed * DT * 0.3) u.stuckT += DT; else u.stuckT = Math.max(0, u.stuckT - DT * 2);
  if (u.stuckT > 1.2 && u.stuckT - DT <= 1.2) u.path = null; // one repath attempt
  if (u.stuckT > 3) { u.stuckT = 0; u.path = null; return 'stuck'; }
  return 'moving';
}

// ---------- targeting ----------
export function nearestEnemy(w, u, range, unitsOnly = false) {
  let best = null, bs = 1e9;
  for (const v of w.units) if (v.owner !== u.owner && !v.dead) { const d = edgeDist(u.x, u.y, v); if (d <= range && d < bs) { bs = d; best = v; } }
  if (!unitsOnly) for (const b of w.buildings) if (b.owner !== u.owner && !b.dead) { const d = edgeDist(u.x, u.y, b); if (d <= range && d + 100 < bs) { bs = d + 100; best = b; } }
  return best;
}
function healTarget(w, u) {
  let best = null, bd = u.def.sight * u.def.sight;
  for (const a of w.units) if (a.owner === u.owner && !a.dead && a !== u && a.hp < a.maxHp * 0.95) {
    const d = (a.x - u.x) ** 2 + (a.y - u.y) ** 2; if (d < bd) { bd = d; best = a; }
  }
  return best;
}
function resume(w, u) { w.setOrder(u, u.order.prev || { t: 'idle' }); }

// ---------- damage ----------
export function damage(w, t, amt, src) {
  if (t.dead) return;
  const a = t.def.armor || 0, red = (a * 0.06) / (1 + a * 0.06);
  t.hp -= Math.max(1, amt * (1 - red)); t.flash = 0.12;
  const p = w.players[t.owner];
  if (p) { p.alert = { x: t.x, y: t.y, t: w.time }; w.emit(t.owner, 'attacked', t.kind === 'building' ? 'Наше здание атакуют!' : 'Наши войска атакуют!', 10); }
  if (t.kind === 'unit' && t.order.t === 'idle' && t.animLock <= 0) playOnce(t, 'hit');
  const s = src && src.id ? w.alive(src.id) : null;
  if (s && s.kind === 'unit' && s.owner !== t.owner) {
    for (const a2 of w.units) // the victim and idle allies nearby retaliate (workers keep working)
      if (a2.owner === t.owner && !a2.dead && !a2.def.worker && a2.order.t === 'idle' && Math.abs(a2.x - t.x) < 240 && Math.abs(a2.y - t.y) < 240)
        w.setOrder(a2, { t: 'attack', id: s.id, auto: true, hx: a2.x, hy: a2.y });
  }
  if (t.hp <= 0) w.kill(t, src);
}
function deliver(w, u, t) {
  const bonus = u.def.bonusLarge || 1;
  if (u.def.proj) {
    w.projectiles.push({ x: u.x + u.facing * 12, y: u.y - u.def.h * 0.6, tid: t.id, tx: t.x, ty: t.y, speed: 430, ang: 0,
      dmg: u.def.dmg, bonus, src: { id: u.id, owner: u.owner }, type: u.def.proj });
  } else damage(w, t, u.def.dmg * (t.def.large ? bonus : 1), { id: u.id, owner: u.owner });
}

// ---------- orders ----------
function doIdle(w, u) {
  if ((u.scanT -= DT) > 0) return;
  u.scanT = 0.5;
  if (u.def.heal) { const h = healTarget(w, u); if (h) { w.setOrder(u, { t: 'heal', id: h.id }); return; } }
  if (u.def.worker) return;
  const e = nearestEnemy(w, u, u.def.sight);
  if (e) w.setOrder(u, { t: 'attack', id: e.id, auto: true, hx: u.x, hy: u.y });
}
function doMove(w, u) {
  const o = u.order;
  if (o.t === 'amove' && (u.scanT -= DT) <= 0) {
    u.scanT = 0.4;
    if (u.def.heal) { const h = healTarget(w, u); if (h) { w.setOrder(u, { t: 'heal', id: h.id, prev: o }); return; } }
    if (!u.def.worker) { const e = nearestEnemy(w, u, u.def.sight); if (e) { w.setOrder(u, { t: 'attack', id: e.id, prev: o }); return; } }
  }
  if (!o.fixed) { o.fixed = true; if (!w.walkable(o.x, o.y)) { const f = w.freeNear(o.x, o.y); o.x = f.x; o.y = f.y; } }
  const r = approach(w, u, o.x, o.y, 4, null);
  if (r !== 'moving' || (Math.hypot(o.x - u.x, o.y - u.y) < 48 && u.stuckT > 0.5)) w.setOrder(u, { t: 'idle' });
}
function doAttack(w, u) {
  const o = u.order, t = w.alive(o.id);
  if (!t || t.kind === 'res') { resume(w, u); return; }
  if (o.auto && Math.hypot(u.x - o.hx, u.y - o.hy) > 480) { w.setOrder(u, { t: 'move', x: o.hx, y: o.hy }); return; } // leash
  if (t.kind === 'building' && (u.scanT -= DT) <= 0) { // switch from buildings to nearby fighting units
    u.scanT = 0.7; const e = nearestEnemy(w, u, u.def.range + 140, true); if (e) { o.id = e.id; u.path = null; return; }
  }
  const d = edgeDist(u.x, u.y, t) - u.r;
  if (d > u.def.range) {
    u.swing = -1;
    if (approach(w, u, t.x, t.y, u.def.range, t) === 'stuck' && t.kind === 'building') resume(w, u);
    return;
  }
  face(u, t.x);
  if (u.swing < 0) { if (u.cd > 0) return; u.swing = 0; playOnce(u, 'attack'); }
  u.swing += DT;
  if (u.swing >= u.def.windup) { deliver(w, u, t); u.swing = -1; u.cd = u.def.cd - u.def.windup; }
}
function doHeal(w, u) {
  const o = u.order, t = w.alive(o.id);
  if (!t || t.hp >= t.maxHp) { resume(w, u); return; }
  if (edgeDist(u.x, u.y, t) - u.r > u.def.healRange) { if (approach(w, u, t.x, t.y, u.def.healRange, t) === 'stuck') resume(w, u); return; }
  face(u, t.x);
  if (u.cd <= 0) {
    t.hp = Math.min(t.maxHp, t.hp + u.def.heal); u.cd = u.def.healCd; playOnce(u, 'attack');
    w.effects.push({ type: 'heal', x: t.x, y: t.y - (t.def.h || 30) * 0.6, t: 0, life: 0.7 });
  }
}
function doGather(w, u) {
  const o = u.order, p = w.players[u.owner];
  if (o.phase === 'return') {
    const d = w.nearestDropoff(u.owner, u.x, u.y);
    if (!d) { w.setOrder(u, { t: 'idle' }); return; }
    if (approach(w, u, d.x, d.y, 8, d) !== 'arrived') return;
    if (u.carry) { p.res[u.carry.k] += u.carry.n; p.stats.gathered[u.carry.k] += u.carry.n; u.carry = null; }
    o.phase = 'go'; u.path = null;
  }
  let r = w.alive(o.id);
  if (!r || r.kind !== 'res') {
    r = w.nearestRes(o.kind, u.x, u.y, 900);
    if (!r) { if (u.carry) o.phase = 'return'; else w.setOrder(u, { t: 'idle' }); return; }
    o.id = r.id; u.path = null;
  }
  if (o.phase === 'go') {
    const res = approach(w, u, r.x, r.y, 8, r);
    if (res === 'arrived') { o.phase = 'harvest'; o.ht = 0; }
    else if (res === 'stuck') { const alt = w.nearestRes(o.kind, u.x, u.y, 900, r.id); if (alt) o.id = alt.id; }
    return;
  }
  if (edgeDist(u.x, u.y, r) - u.r > 14) { o.phase = 'go'; return; } // pushed away
  face(u, r.x); o.ht += DT;
  if (u.animLock <= 0) playOnce(u, 'attack');
  if (o.ht >= r.def.time) {
    const n = Math.min(r.def.carry, r.amount); r.amount -= n; u.carry = { k: r.def.kind, n };
    if (r.amount <= 0) w.depleteRes(r);
    o.phase = 'return'; o.ht = 0; u.path = null;
  }
}
function doBuild(w, u) {
  const o = u.order, def = BUILDINGS[o.type];
  let b = o.site ? w.alive(o.site) : null;
  if (o.site && (!b || b.done)) { w.setOrder(u, { t: 'idle' }); return; }
  if (!b) {
    const site = { id: -1, kind: 'site', size: def.size, tx: o.tx, ty: o.ty, x: (o.tx + def.size / 2) * TILE, y: (o.ty + def.size / 2) * TILE };
    const r = approach(w, u, site.x, site.y, 10, site);
    if (r === 'stuck') { w.emit(u.owner, 'place', 'Нет пути к месту постройки — стоимость возвращена'); w.setOrder(u, { t: 'idle' }); return; }
    if (r !== 'arrived') return;
    if (!w.canPlace(def.size, o.tx, o.ty)) { w.emit(u.owner, 'place', 'Место занято — стоимость возвращена'); w.setOrder(u, { t: 'idle' }); return; }
    b = w.addBuilding(o.type, u.owner, o.tx, o.ty, false); o.site = b.id; u.path = null;
  }
  if (edgeDist(u.x, u.y, b) - u.r > 14) { if (approach(w, u, b.x, b.y, 10, b) === 'stuck') w.setOrder(u, { t: 'idle' }); return; }
  face(u, b.x);
  if (u.animLock <= 0) playOnce(u, 'attack');
  const rate = DT / def.time;
  b.progress = Math.min(1, b.progress + rate); b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.9 * rate);
  if (b.progress >= 1) { b.done = true; w.players[u.owner].stats.built++; w.emit(u.owner, 'done', 'Построено: ' + def.ru); w.setOrder(u, { t: 'idle' }); }
}

export function updateUnit(w, u) {
  u.animT += DT; if (u.flash > 0) u.flash -= DT; if (u.animLock > 0) u.animLock -= DT;
  if (u.dead) return;
  u.moving = false; if (u.cd > 0) u.cd -= DT;
  if (!w.walkable(u.x, u.y)) { const f = w.freeNear(u.x, u.y); u.x = f.x; u.y = f.y; u.path = null; } // e.g. a building was placed on top
  switch (u.order.t) {
    case 'idle': doIdle(w, u); break;
    case 'move': case 'amove': doMove(w, u); break;
    case 'attack': doAttack(w, u); break;
    case 'gather': doGather(w, u); break;
    case 'build': doBuild(w, u); break;
    case 'heal': doHeal(w, u); break;
  }
  const want = u.moving ? 'walk' : u.animLock > 0 && (u.anim === 'attack' || u.anim === 'hit') ? u.anim : 'idle';
  if (want !== u.anim) { u.anim = want; u.animT = 0; u.animLock = 0; }
}

// ---------- buildings ----------
function spawnFrom(w, b, type) {
  const tgt = b.rally || { x: w.pw / 2, y: w.ph / 2 };
  const dx = tgt.x - b.x, dy = tgt.y - b.y, d = Math.hypot(dx, dy) || 1, off = b.size * TILE / 2 + 18;
  const p = w.freeNear(b.x + dx / d * off, b.y + dy / d * off);
  const u = w.addUnit(type, b.owner, p.x, p.y); w.players[b.owner].stats.trained++;
  if (b.rally) {
    const r = b.rally.id ? w.alive(b.rally.id) : null;
    if (r && r.kind === 'res' && u.def.worker) w.cmdGather(b.owner, [u.id], r.id);
    else w.cmdMove(b.owner, [u.id], b.rally.x, b.rally.y);
  }
  return u;
}
export function updateBuilding(w, b) {
  if (b.flash > 0) b.flash -= DT;
  if (b.dead || !b.done) return;
  const at = b.def.attack;
  if (at) {
    if (b.cd > 0) b.cd -= DT;
    else {
      const t = nearestEnemy(w, b, at.range, true);
      if (t) { w.projectiles.push({ x: b.x, y: b.y - 50, tid: t.id, tx: t.x, ty: t.y, speed: 460, ang: 0, dmg: at.dmg, bonus: 1, src: { id: b.id, owner: b.owner }, type: at.proj }); b.cd = at.cd; }
      else b.cd = 0.25;
    }
  }
  if (!b.queue.length) return;
  const def = UNITS[b.queue[0]];
  if (!b.qStarted) {
    const s = w.supply(b.owner);
    if (s.used + def.supply > s.cap) { w.emit(b.owner, 'supply', 'Не хватает места: постройте ' + FACTIONS[w.players[b.owner].fac].supplyHint, 8); return; }
    b.qStarted = true; b.qT = 0;
  }
  b.qT += DT;
  if (b.qT >= def.time) { const type = b.queue.shift(); b.qStarted = false; b.qT = 0; spawnFrom(w, b, type); }
}

// ---------- projectiles & separation ----------
export function updateProjectile(w, p) {
  const t = w.alive(p.tid);
  if (t) { p.tx = t.x; p.ty = t.y - (t.kind === 'unit' ? t.def.h * 0.45 : 24); }
  const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy), s = p.speed * DT;
  p.ang = Math.atan2(dy, dx);
  if (d <= s) {
    if (t) damage(w, t, p.dmg * (t.def.large ? p.bonus : 1), p.src);
    w.effects.push({ type: 'impact', kind: p.type, x: p.tx, y: p.ty, t: 0, life: 0.35 });
    return true;
  }
  p.x += dx / d * s; p.y += dy / d * s; return false;
}
export function separate(w) {
  const C = 48, grid = new Map();
  for (const u of w.units) if (!u.dead) { const k = ((u.x / C) | 0) + ((u.y / C) | 0) * 1024; let a = grid.get(k); if (!a) grid.set(k, (a = [])); a.push(u); }
  for (const u of w.units) {
    if (u.dead) continue;
    const cx = (u.x / C) | 0, cy = (u.y / C) | 0;
    for (let gy = cy - 1; gy <= cy + 1; gy++) for (let gx = cx - 1; gx <= cx + 1; gx++) {
      const a = grid.get(gx + gy * 1024); if (!a) continue;
      for (const v of a) {
        if (v.id <= u.id || v.dead) continue;
        if (u.order.t === 'gather' && v.order.t === 'gather') continue; // workers share mining spots
        const dx = v.x - u.x, dy = v.y - u.y, min = (u.r + v.r) * 0.8, d2 = dx * dx + dy * dy;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2), nx = d > 0.01 ? dx / d : 1, ny = d > 0.01 ? dy / d : 0, push = Math.min(2, (min - d) * 0.5);
        nudge(w, u, -nx * push, -ny * push); nudge(w, v, nx * push, ny * push);
      }
    }
  }
}
function nudge(w, u, dx, dy) { const x = u.x + dx, y = u.y + dy; if (w.walkable(x, y)) { u.x = x; u.y = y; } }
export { UNITS };
