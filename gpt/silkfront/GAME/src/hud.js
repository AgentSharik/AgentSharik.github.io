// SILKFRONT — DOM HUD: resources, event log, selection info, command card, build queue, and dual-faction visual icons.
// The command card is rebuilt only when the selection "signature" changes, so clicks are never lost
// to a DOM replacement; button states are refreshed in place every frame.
import { UNITS, BUILDINGS, FACTIONS, RES_NAMES } from './data.js';

const ORDER_RU = { idle: 'Ожидает', move: 'Идёт', amove: 'Атакующий марш', attack: 'Атакует', build: 'Строит', heal: 'Лечит', dead: 'Погиб' };
const $ = (id) => document.getElementById(id);
const cost = (c) => `${c.e}<i class="ico e"></i>${c.w ? ` ${c.w}<i class="ico w"></i>` : ''}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const UI_ICONS = {
  // Commands
  amove: 'assets/ui/cmd_attack.svg',
  stop: 'assets/ui/cmd_stop.svg',
  return: 'assets/ui/cmd_return.svg',
  cancel: 'assets/ui/cmd_cancel.svg',
  rally: 'assets/ui/cmd_rally.svg',
  // Buildings
  h_citadel: 'assets/ui/bld_citadel.svg',
  h_barracks: 'assets/ui/bld_barracks.svg',
  h_chapel: 'assets/ui/bld_chapel.svg',
  h_tower: 'assets/ui/bld_tower.svg',
  s_nest: 'assets/ui/bld_nest.svg',
  s_incubator: 'assets/ui/bld_incubator.svg',
  s_brood: 'assets/ui/bld_brood.svg',
  s_webtower: 'assets/ui/bld_webtower.svg',
  // Units
  human_novice: 'assets/ui/unit_novice.svg',
  human_swordsman: 'assets/ui/unit_swordsman.svg',
  human_crossbowman: 'assets/ui/unit_crossbowman.svg',
  human_priest: 'assets/ui/unit_priest.svg',
  human_monster_hunter: 'assets/ui/unit_hunter.svg',
  human_knight: 'assets/ui/unit_knight.svg',
  spider_weaver: 'assets/ui/unit_spider_weaver.svg',
  spider_scout: 'assets/ui/unit_spider_scout.svg',
  spider_fang: 'assets/ui/unit_spider_fang.svg',
  spider_spitter: 'assets/ui/unit_spider_spitter.svg',
  spider_armored: 'assets/ui/unit_spider_armored.svg',
  // Resources
  mine: 'assets/ui/res_essence.svg',
  tree: 'assets/ui/res_wood.svg',
};

export function orderText(u) {
  const o = u.order;
  if (o.t === 'gather') return o.phase === 'return' ? 'Несёт ' + RES_NAMES[u.carry?.k || o.kind].toLowerCase() : 'Добывает: ' + RES_NAMES[o.kind].toLowerCase();
  return ORDER_RU[o.t] || o.t;
}

export class Hud {
  constructor(game) {
    this.g = game; this.sig = ''; this.msgs = []; this.lastEv = 0;
    this.cmds = $('cmds'); this.info = $('info-text'); this.queue = $('queue'); this.portrait = $('portrait').getContext('2d');
    this.iconCache = {};
    this.cmds.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) this.act(b.dataset); });
    this.queue.addEventListener('click', (e) => { const b = e.target.closest('button[data-q]'); if (b) this.g.world.cmdCancel(this.g.pid, this.g.selBuilding().id, +b.dataset.q); });
  }
  say(text, err = false) { this.msgs.push({ text, err, t: performance.now() }); if (this.msgs.length > 6) this.msgs.shift(); }

  // Button actions: shared by mouse clicks and hotkeys (game.hotkey → act()).
  act(d) {
    const g = this.g, w = g.world, pid = g.pid;
    if (d.build) g.startPlace(d.build);
    else if (d.train) { const r = w.cmdTrain(pid, g.selBuilding().id, d.train); if (!r.ok) this.say(r.reason, true); }
    else if (d.cmd === 'amove') g.setMode('amove');
    else if (d.cmd === 'stop') w.cmdStop(pid, g.selUnits().map((u) => u.id));
    else if (d.cmd === 'return') { if (!w.cmdReturn(pid, g.selUnits().map((u) => u.id))) this.say('Рабочим нечего сдавать', true); }
    else if (d.cmd === 'cancel') g.cancelMode();
  }
  hotkey(k) { const b = this.cmds.querySelector(`button[data-key="${k}"]`); if (b && !b.disabled) { this.act(b.dataset); return true; } return false; }

  update() {
    const g = this.g, w = g.world, p = w.players[g.pid], s = w.supply(g.pid);
    $('r-e').textContent = Math.floor(p.res.e); $('r-w').textContent = Math.floor(p.res.w); $('r-s').textContent = `${s.used}/${s.cap}`;
    $('r-s').style.color = s.used >= s.cap ? '#ff8a7a' : '';
    const t = Math.floor(w.time); $('clock').textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}${g.paused ? ' · пауза' : ''}`;
    // Time is shared by multiple events in one tick; IDs remain unique after log truncation.
    for (const ev of w.events) if (ev.id > this.lastEv && ev.pid === g.pid) this.say(ev.text, ev.key === 'attacked' || ev.key === 'lostb' || ev.key === 'supply' || ev.key === 'place');
    if (w.events.length) this.lastEv = Math.max(this.lastEv, w.events[w.events.length - 1].id);
    const now = performance.now(); this.msgs = this.msgs.filter((m) => now - m.t < 5000);
    const log = this.msgs.map((m) => `<div class="notif-banner ${m.err ? 'err' : 'info'}">${esc(m.text)}</div>`).join('');
    if (log !== this.lastLog) { $('log').innerHTML = log; this.lastLog = log; }
    this.panel();
  }

  panel() {
    const g = this.g, sel = g.selected(), mode = g.mode || (g.place ? 'place' : '');
    const sig = sel.map((e) => e.id).join(',') + '|' + mode + '|' + (sel[0] && sel[0].kind === 'building' ? sel[0].done : '');
    if (sig !== this.sig) { this.sig = sig; this.buildCard(sel, mode); this.drawPortrait(sel[0]); }
    this.infoText(sel); this.refresh(sel);
  }
  buildCard(sel, mode) {
    const g = this.g, w = g.world, F = FACTIONS[w.players[g.pid].fac]; let h = '';
    // Reserve WASD for camera navigation without changing unit/building balance data.
    const btn = (data, key, title, sub = '', iconKey = '') => {
      key = ({ a: 'f', s: 'x', d: 'c', w: 't' })[key] || key;
      const ico = UI_ICONS[iconKey] ? `<img class="cmd-ico" src="${UI_ICONS[iconKey]}" alt="" aria-hidden="true">` : '';
      return `<button type="button" ${data} data-key="${key}" data-icon="${iconKey}" aria-label="${esc(title)} (${key.toUpperCase()})">${ico}<span class="cmd-txt"><b>${title}</b>${sub}</span><span class="k">${key.toUpperCase()}</span></button>`;
    };
    if (mode) h = btn('data-cmd="cancel"', 'escape', 'Отмена', '', 'cancel') + `<p class="note">${mode === 'amove' ? 'ЛКМ — точка атакующего марша' : 'ЛКМ — место постройки (Shift — несколько), ПКМ/Esc — отмена'}</p>`;
    else if (sel.length && sel[0].kind === 'unit' && sel[0].owner === g.pid) {
      h += btn('data-cmd="amove"', 'a', 'Атака', '', 'amove') + btn('data-cmd="stop"', 's', 'Стоп', '', 'stop');
      if (sel.some((u) => u.def.worker)) {
        h += btn('data-cmd="return"', 'd', 'Сдать груз', '', 'return');
        F.build.forEach((t) => { const d = BUILDINGS[t]; h += btn(`data-build="${t}"`, d.key.toLowerCase(), d.ru, `<small class="cmd-cost">${cost(d.cost)}</small>`, t); });
      }
    } else if (sel.length === 1 && sel[0].kind === 'building' && sel[0].owner === g.pid && sel[0].done) {
      const keys = 'qwer';
      sel[0].def.trains.forEach((t, i) => { const d = UNITS[t]; h += btn(`data-train="${t}"`, keys[i], d.ru, `<small class="cmd-cost">${cost(d.cost)}</small>`, t); });
      if (sel[0].def.trains.length) h += '<p class="note">ПКМ по карте — точка сбора</p>';
    }
    const btnCount = (h.match(/<button /g) || []).length;
    const padCount = mode ? 0 : Math.max(0, 9 - btnCount);
    this.cmds.innerHTML = h + '<span class="cmd-empty-socket" aria-hidden="true"></span>'.repeat(padCount);
  }
  refresh(sel) { // affordability / requirements, without rebuilding
    const g = this.g, w = g.world, pid = g.pid;
    for (const b of this.cmds.querySelectorAll('button[data-build],button[data-train]')) {
      const d = b.dataset.build ? BUILDINGS[b.dataset.build] : UNITS[b.dataset.train];
      const req = d.requires && !w.has(pid, d.requires), ok = w.canAfford(pid, d.cost) && !req;
      b.classList.toggle('na', !ok); b.title = req ? 'Требуется: ' + BUILDINGS[d.requires].ru : !w.canAfford(pid, d.cost) ? w.missing(pid, d.cost) : d.role || '';
    }
    const b = sel.length === 1 && sel[0].kind === 'building' && sel[0].owner === pid ? sel[0] : null;
    let q = '';
    if (b && b.queue.length) {
      q = b.queue.map((t, i) => `<button type="button" data-q="${i}" title="Отменить (возврат ресурсов)"><img class="q-ico" src="${UI_ICONS[t] || ''}" alt="">${UNITS[t].ru} ✕</button>`).join('');
      q += `<span class="bar"><i style="width:${b.qStarted ? Math.round(b.qT / UNITS[b.queue[0]].time * 100) : 0}%"></i></span>`;
    }
    const qsig = b ? `${b.id}:${b.queue.join()}` : '';
    if (qsig !== this.qsig) { this.queue.innerHTML = q; this.qsig = qsig; }
    else if (q) { const i = this.queue.querySelector('.bar i'); if (i) i.style.width = (b.qStarted ? Math.round(b.qT / UNITS[b.queue[0]].time * 100) : 0) + '%'; }
  }
  infoText(sel) {
    const g = this.g, w = g.world; let h = '';
    if (!sel.length) h = `<h3>${esc(FACTIONS[w.players[g.pid].fac].ru)}</h3><div class="role">Ничего не выбрано · Выделите отряд или здание</div>`;
    else if (sel.length > 1) {
      const n = {}; for (const u of sel) n[u.def.ru] = (n[u.def.ru] || 0) + 1;
      h = `<h3>Отряд: ${sel.length}</h3><div class="multi">${Object.entries(n).map(([k, v]) => `<span class="unit-chip">${esc(k)} ×${v}</span>`).join('')}</div>`;
    } else {
      const e = sel[0], own = e.owner === g.pid ? '' : e.kind === 'res' ? '' : ' <small>(противник)</small>';
      if (e.kind === 'res') h = `<h3>${e.def.ru}</h3><div class="role">${RES_NAMES[e.def.kind]}: осталось ${Math.floor(e.amount)}</div>`;
      else if (e.kind === 'unit') {
        const d = e.def, pct = Math.max(0, Math.min(100, Math.round((e.hp / e.maxHp) * 100)));
        h = `<h3>${esc(d.ru)}${own}</h3><div class="role">${esc(d.role)}</div>`
          + `<div class="hp-strip"><div class="hp-fill" style="width:${pct}%"></div></div>`
          + `<div class="stats"><span class="st-pill hp">Здоровье ${Math.ceil(e.hp)}/${e.maxHp}</span><span class="st-pill dmg">Урон ${Math.round(d.dmg)}</span><span class="st-pill arm">Броня ${d.armor}</span>`
          + `<span class="st-pill rng">${d.range > 30 ? 'Дальность ' + d.range : 'Ближний бой'}</span>${d.heal ? `<span class="st-pill heal">Лечение ${d.heal}</span>` : ''}<span class="st-pill ord">${orderText(e)}</span>${e.carry ? `<span class="st-pill crg">Груз ${e.carry.n}</span>` : ''}</div>`;
      } else {
        const d = e.def, pct = Math.max(0, Math.min(100, Math.round((e.hp / e.maxHp) * 100)));
        h = `<h3>${esc(d.ru)}${own}</h3>`
          + `<div class="hp-strip"><div class="hp-fill" style="width:${pct}%"></div></div>`
          + `<div class="stats"><span class="st-pill hp">Прочность ${Math.ceil(e.hp)}/${e.maxHp}</span><span class="st-pill arm">Броня ${d.armor}</span>${d.supply ? `<span class="st-pill sup">Население +${d.supply}</span>` : ''}`
          + `${d.attack ? `<span class="st-pill dmg">Урон ${d.attack.dmg}, дальность ${d.attack.range}</span>` : ''}${d.dropoff ? '<span class="st-pill crg">Приём ресурсов</span>' : ''}</div>`
          + (e.done ? '' : `<div class="role build-prog">Строится: ${Math.floor(e.progress * 100)}%</div>`);
      }
    }
    if (h !== this.lastInfo) { this.info.innerHTML = h; this.lastInfo = h; }
  }
  drawPortrait(e) {
    const c = this.portrait; c.clearRect(0, 0, 96, 96);
    const fac = this.g.world ? this.g.world.players[this.g.pid].fac : 'HUMANS';
    if (!e) {
      this.drawIconPortrait(fac === 'SPIDERS' ? 'assets/ui/crest_spiders.svg' : 'assets/ui/crest_humans.svg');
      return;
    }
    if (e.kind === 'unit') {
      const A = this.g.atlases[e.def.art];
      if (A) { const f = A.json.frames.idle_00.frame, k = 96 / 200; c.drawImage(A.img, f.x + 44, f.y + 50, 200, 200, 0, 0, 200 * k, 200 * k); return; }
    }
    const key = e.type || (e.kind === 'res' ? e.def?.kind : '');
    const src = UI_ICONS[key] || (fac === 'SPIDERS' ? 'assets/ui/crest_spiders.svg' : 'assets/ui/crest_humans.svg');
    this.drawIconPortrait(src);
  }
  drawIconPortrait(src) {
    if (typeof Image === 'undefined') return;
    const c = this.portrait;
    if (this.iconCache[src]?.complete) {
      c.clearRect(0, 0, 96, 96);
      c.drawImage(this.iconCache[src], 4, 4, 88, 88);
      return;
    }
    const img = new Image();
    img.onload = () => { c.clearRect(0, 0, 96, 96); c.drawImage(img, 4, 4, 88, 88); };
    img.src = src;
    this.iconCache[src] = img;
  }
}
