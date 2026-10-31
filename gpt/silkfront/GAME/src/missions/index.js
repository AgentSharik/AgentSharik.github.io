// Isolated scenario layer: authored starts + objective milestones, no economy/combat overrides.
import { World, segDist } from '../world.js';
import { TILE, BUILDINGS } from '../data.js';
import { ASH_OUTSKIRTS } from './ash-outskirts.js';

// IDs come from a URL as well as buttons: inherited object names must never resolve as missions.
export const MISSIONS = Object.freeze({ __proto__: null, [ASH_OUTSKIRTS.id]: ASH_OUTSKIRTS });
const point = ([tx, ty]) => ({ x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE });

export function createMission(id = ASH_OUTSKIRTS.id) {
  const def = MISSIONS[id];
  if (!def) throw new Error('Неизвестная миссия: ' + id);
  const w = new World({ seed: def.seed, factions: def.factions });
  const refs = {};
  for (const entry of def.buildings) {
    const [tx, ty] = entry.at;
    if (!w.canPlace(BUILDINGS[entry.type].size, tx, ty)) throw new Error('Пересечение зданий миссии: ' + entry.key);
    refs[entry.key] = w.addBuilding(entry.type, entry.owner, tx, ty, entry.done !== false).id;
  }
  for (const at of def.mines) if (!w.addRes('mine', ...at)) throw new Error('Заблокирована жила миссии: ' + at);
  for (const [x0, y0, x1, y1] of def.woods) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const onRoad = def.road.slice(1).some((p, i) => segDist(x + 0.5, y + 0.5, ...def.road[i], ...p) < 3);
    if (!onRoad) w.addRes('tree', x, y);
  }
  for (const group of def.forces) for (const at of group.at) {
    const p = point(at);
    if (!w.walkable(p.x, p.y)) throw new Error('Заблокирован старт юнита: ' + at);
    w.addUnit(group.type, group.owner, p.x, p.y);
  }
  def.resources.forEach((res, pid) => { w.players[pid].res = { ...res }; });
  w.meta = { name: def.name, mission: def.id, road: def.road };
  w.scenario = new MissionScenario(w, def, refs);
  w.emit(0, 'mission', def.subtitle + ': сохраните Цитадель. Задачи доступны в журнале миссии.');
  return w;
}

export class MissionScenario {
  constructor(w, definition, refs) {
    if (!w.alive(refs[definition.protected]) || !w.alive(refs[definition.target])) throw new Error('Миссия без обязательной цели');
    this.id = definition.id; this.definition = definition; this.refs = refs;
    this.objectives = definition.objectives.map((o) => ({ ...o, done: false, completedAt: null }));
    this.initialUnits = new Set([...w.units].map((u) => u.id)); this.recruits = new Set();
    this.status = 'active'; this.reason = ''; this.activeId = this.objectives[0].id;
  }
  current() { return this.objectives.find((o) => !o.done) || null; }
  progress(w, o) {
    if (o.kind === 'gather') { const s = w.players[0].stats.gathered; return `${Math.min(s.e, o.amount.e)}/${o.amount.e} Э · ${Math.min(s.w, o.amount.w)}/${o.amount.w} Д`; }
    if (o.kind === 'train') return `${Math.min(this.recruits.size, o.count)}/${o.count} бойцов`;
    if (o.kind === 'destroy') { const b = w.alive(this.refs[o.target]); return b ? `Прочность цели: ${Math.ceil(b.hp)}/${b.maxHp}` : 'Инкубатор уничтожен'; }
    return o.done ? 'Выполнено' : `Клетка ${o.at.join(',')}`;
  }
  update(w) {
    if (w.over || this.status !== 'active') return;
    // Protecting the last settlement takes precedence if both key buildings fall in one check.
    if (!w.alive(this.refs[this.definition.protected])) return this.finish(w, 1, 'Цитадель последнего поселения разрушена. Поселение потеряно.');
    for (const u of w.units) if (u.owner === 0 && !u.def.worker && !this.initialUnits.has(u.id)) this.recruits.add(u.id);
    for (const o of this.objectives) {
      if (o.done) continue;
      const p = o.at && point(o.at);
      let done = false;
      if (o.kind === 'reach') done = w.unitsOf(0).some((u) => !u.def.worker && Math.hypot(u.x - p.x, u.y - p.y) <= o.radius * TILE);
      else if (o.kind === 'gather') { const s = w.players[0].stats.gathered; done = s.e >= o.amount.e && s.w >= o.amount.w; }
      else if (o.kind === 'building') done = w.buildingsOf(0).some((b) => b.done && b.type === o.type && Math.hypot(b.x - p.x, b.y - p.y) <= o.radius * TILE);
      else if (o.kind === 'train') done = this.recruits.size >= o.count;
      else if (o.kind === 'destroy') done = !w.alive(this.refs[o.target]);
      if (done) { o.done = true; o.completedAt = w.time; w.emit(0, 'objective-' + o.id, o.event); }
    }
    const current = this.current();
    if (!current) return this.finish(w, 0, 'Поселение удержано. Брод разведан, снабжение и оборона восстановлены. Передовой Инкубатор уничтожен — наступление на окраину сорвано.');
    if (current.id !== this.activeId) { this.activeId = current.id; w.emit(0, 'objective-next', 'Следующая задача: ' + current.title); }
  }
  finish(w, winner, reason) {
    this.status = winner === 0 ? 'victory' : 'defeat'; this.reason = reason;
    w.over = true; w.winner = winner; w.players[1 - winner].defeated = true;
    w.emit(0, 'mission-end', reason);
  }
}
