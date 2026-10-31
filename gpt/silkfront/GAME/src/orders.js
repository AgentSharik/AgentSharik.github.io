// Accessible alternative to right-clicking a canvas. Same World API; no free units/resources.
import { BUILDINGS, TILE, MAP_W, MAP_H } from './data.js';
import { clamp } from './world.js';
const $ = (id) => document.getElementById(id);
export class OrdersPanel {
  constructor(g) {
    this.g = g; this.reset();
    const on = (id, f) => $(id).addEventListener('click', () => { if (g.running && !g.world.over) f(); });
    on('pick-workers', () => g.select(g.world.unitsOf(g.pid).filter((u) => u.def.worker).map((u) => u.id)));
    on('pick-idle', () => {
      const ws = g.world.unitsOf(g.pid).filter((u) => u.def.worker);
      const wk = ws.find((u) => u.order.t === 'idle') || ws.find((u) => u.order.t !== 'build');
      g.select(wk ? [wk.id] : []); if (wk) g.center(wk.x, wk.y);
    });
    on('pick-army', () => { const us = g.world.unitsOf(g.pid).filter((u) => !u.def.worker); g.select(us.map((u) => u.id)); if (us.length) g.center(us[0].x, us[0].y); });
    on('pick-main', () => { const b = g.world.mainOf(g.pid); g.select(b ? [b.id] : []); g.home(); });
    $('pick-building').onchange = () => { const b = g.world.alive(Number($('pick-building').value)); if (b) { g.select([b.id]); g.center(b.x, b.y); } };
    for (const k of ['e', 'w']) on('gather-' + k, () => this.gather(k));
    on('order-go', () => { const p = this.point(); if (p) g.command(p.x, p.y); });
    on('order-attack', () => { const p = this.point(); if (p) g.command(p.x, p.y, 0, true); });
    on('place-tile', () => { const p = this.point(); if (p) { if (!g.place) g.hud.say('Сначала выберите здание в панели команд', true); else g.placeAt(p.tx, p.ty); } });
    on('place-auto', () => {
      if (!g.place) return g.hud.say('Сначала выберите здание в панели команд', true);
      const p = g.world.findBuildSpot(g.pid, g.place.type);
      if (p) g.placeAt(p.tx, p.ty); else g.hud.say('Нет свободного места у базы', true);
    });
    on('resume-build', () => {
      const b = g.world.buildingsOf(g.pid).find((b) => !b.done);
      if (b && g.world.cmdResume(g.pid, g.selUnits().map((u) => u.id), b.id)) g.hud.say('Приказ: достроить ' + b.def.ru);
      else g.hud.say('Выберите рабочего; требуется недостроенное здание', true);
    });
    on('rally-e', () => { const b = g.selBuilding(), m = b && g.world.nearestRes('e', b.x, b.y); if (m) g.command(m.x, m.y, m.id); else g.hud.say('Выберите главное здание', true); });
    on('attack-base', () => {
      const b = g.world.mainOf(1 - g.pid); if (!b) return;
      g.command(b.x, b.y, 0, true); g.center(b.x, b.y);
    });
  }
  reset() { this.sig = ''; this.last = -1; this.lastText = ''; }
  point() {
    const tx = Number($('tile-x').value), ty = Number($('tile-y').value);
    if (!$('tile-x').value || !$('tile-y').value || !Number.isInteger(tx) || !Number.isInteger(ty) || tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) {
      this.g.hud.say(`Нужны целые клетки X: 0–${MAP_W - 1}, Y: 0–${MAP_H - 1}`, true); return null;
    }
    return { tx, ty, x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
  }
  gather(k) {
    const g = this.g, us = g.selUnits().filter((u) => u.def.worker), origin = us[0] || g.world.mainOf(g.pid);
    const r = origin && g.world.nearestRes(k, origin.x, origin.y, 3000);
    if (!us.length || !r) return g.hud.say('Выберите рабочих; рядом должен быть ресурс', true);
    g.command(r.x, r.y, r.id);
  }
  update(force = false) {
    const g = this.g, w = g.world; if (!w) return;
    // Commands also change state while paused. Throttle by real time, not the frozen game clock.
    const refresh = Math.floor(performance.now() / 250);
    if (!force && this.last === refresh && !g.paused) return;
    this.last = refresh;
    const bs = w.buildingsOf(g.pid), sig = bs.map((b) => b.id + ':' + b.done).join(',');
    if (sig !== this.sig) {
      const sel = $('pick-building'), prev = sel.value; this.sig = sig;
      sel.replaceChildren(new Option('— выбрать —', ''), ...bs.map((b) => new Option(b.def.ru + ' #' + b.id + (b.done ? '' : ' · строится'), b.id)));
      if (bs.some((b) => String(b.id) === prev)) sel.value = prev;
    }
    const workers = w.unitsOf(g.pid).filter((u) => u.def.worker), army = w.unitsOf(g.pid).length - workers.length;
    const building = bs.find((b) => !b.done), selected = g.selUnits();
    const text = `Рабочие: ${workers.length} · добывают: ${workers.filter((u) => u.order.t === 'gather').length} · армия: ${army}`
      + (building ? ` · ${building.def.ru}: ${Math.floor(clamp(building.progress, 0, 1) * 100)}%` : '')
      + (g.place ? ' · размещение: ' + BUILDINGS[g.place.type].ru : '')
      + (selected.length === 1 ? ` · клетка ${Math.floor(selected[0].x / TILE)},${Math.floor(selected[0].y / TILE)}` : '');
    if (text !== this.lastText) { $('tactical-status').textContent = text; this.lastText = text; }
  }
}
