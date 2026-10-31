import { initUiSystem } from './ui-system.js';
// Browser lifecycle only. Rules and all orders live in World (also used by node tests).
import { DT, FACTIONS, BUILDINGS, TILE } from './data.js';
import { clamp } from './world.js';
import { createGame } from './map.js';
import { AI } from './ai.js';
import { Renderer, loadAtlases } from './render.js';
import { Hud } from './hud.js';
import { Controls } from './input.js';
import { OrdersPanel } from './orders.js';
import { Sounds } from './sound.js';
import { createMission, MISSIONS } from './missions/index.js';
import { MissionHud } from './mission-hud.js';

const $ = (id) => document.getElementById(id);
export class Game {
  constructor() {
    this.canvas = $('view'); this.pid = 0; this.world = null; this.atlases = {};
    this.selSet = new Set(); this.groups = new Map(); this.markers = [];
    this.cam = { x: 0, y: 0 }; this.pointer = { x: 0, y: 0, inside: false };
    this.keys = new Set(); this.mode = ''; this.place = null; this.drag = null;
    this.paused = false; this.running = false; this.speed = 1; this.acc = 0;
    this.sounds = new Sounds(); this.hud = new Hud(this); this.controls = new Controls(this);
    this.orders = new OrdersPanel(this); this.missionHud = new MissionHud(this); this.last = performance.now();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('blur', () => this.loseFocus());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.loseFocus(); });
    document.querySelectorAll('[data-fac]').forEach((b) => b.addEventListener('click', () => this.start(b.dataset.fac)));
    $('btn-pause').onclick = () => this.togglePause();
    $('help-copy').append($('help').cloneNode(true));
    $('btn-help').onclick = () => { if (this.running && !this.world.over) { this.dialogPause = this.paused; this.paused = true; this.acc = 0; $('help-dialog').showModal(); } };
    $('help-dialog').addEventListener('close', () => { this.paused = this.dialogPause; $('btn-pause').textContent = this.paused ? 'Продолжить' : 'Пауза'; });
    $('btn-again').onclick = () => this.start(this.fac, this.missionId);
    $('btn-menu').onclick = () => this.menu();
    $('speed').onchange = () => { const n = Number($('speed').value); this.speed = [1, 2, 4].includes(n) ? n : 1; this.acc = 0; };
    $('btn-surrender').onclick = () => { if (this.running && !this.world.over) $('surrender-dialog').showModal(); };
    $('surrender-dialog').addEventListener('close', () => {
      if ($('surrender-dialog').returnValue !== 'surrender' || !this.world || this.world.over) return;
      if (this.world.scenario) this.world.scenario.finish(this.world, 1, 'Орден отступил. Миссия прекращена по приказу игрока.');
      else { this.world.players[this.pid].defeated = true; this.world.over = true; this.world.winner = 1 - this.pid; }
      this.finish();
    });
    initUiSystem(this); this.resize(); requestAnimationFrame((now) => this.frame(now));
  }
  async load() {
    const { atlases, errors } = await loadAtlases(); this.atlases = atlases;
    if (errors.length) {
      $('status').textContent = 'Не удалось загрузить атласы: ' + errors.join('; ') + '. Проверьте запуск через npm start и обновите страницу.';
      return; // Never silently substitute accepted art with placeholder figures.
    }
    $('status').textContent = `Загружены все ${Object.keys(atlases).length} атласов. Доступны миссия и схватка.`;
    document.querySelectorAll('[data-fac]').forEach((b) => { b.disabled = false; });
    $('btn-mission').disabled = false;
    const requested = new URLSearchParams(location.search).get('mission');
    if (requested && MISSIONS[requested]) this.missionHud.brief(requested);
  }
  start(fac, missionId = null) {
    if (missionId && !MISSIONS[missionId]) return;
    if (missionId) fac = 'HUMANS';
    if (!FACTIONS[fac] || Object.keys(this.atlases).length !== 10) return;
    this.fac = fac; this.missionId = missionId; this.sounds.unlock();
    this.world = missionId ? createMission(missionId) : createGame({ seed: 7, factions: [fac, fac === 'HUMANS' ? 'SPIDERS' : 'HUMANS'] });
    this.ais = [new AI(this.world, 1)];
    this.observer = !missionId && $('observer').checked;
    if (this.observer) this.ais.unshift(new AI(this.world, 0));
    this.renderer = new Renderer(this.canvas, $('mini'), this.world, this.atlases, this.pid);
    this.selSet.clear(); this.groups.clear(); this.markers = []; this.mode = ''; this.place = null; this.drag = null;
    this.controls.reset(); this.paused = false; this.running = true; this.acc = 0; this.speed = 1;
    this.last = performance.now(); this.hud.sig = ''; this.hud.qsig = ''; this.hud.msgs = [];
    this.hud.lastEv = -1; this.hud.lastInfo = ''; this.hud.lastLog = ''; this.orders.reset();
    $('menu').hidden = true; $('end').hidden = true; $('top').hidden = false; $('panel').hidden = false;
    $('tactics').hidden = false; $('tactics').open = false; $('speed').value = '1'; this.resize(); this.canvas.classList.remove('target');
    $('fac-name').textContent = FACTIONS[fac].ru + (this.observer ? ' · наблюдение ИИ' : '');
    $('btn-pause').textContent = 'Пауза'; this.missionHud.reset(); this.home(); this.select([this.world.mainOf(this.pid).id]);
    $('btn-again').textContent = missionId ? 'Повторить миссию' : 'Сыграть ещё раз';
    $('btn-menu').textContent = missionId ? 'В главное меню' : 'Выбор фракции';
    this.hud.say(missionId ? 'Сохраните Цитадель. Первая задача — разведать Пепельный брод (38,40).' : 'Выберите рабочих и отправьте на жилу эссенции или деревья. Цель — все здания противника.');
  }
  menu() {
    this.running = false; this.controls.reset(); this.acc = 0; this.cancelMode(); this.missionHud.hide();
    $('end').hidden = true; $('menu').hidden = false; $('top').hidden = true; $('panel').hidden = true; $('tactics').hidden = true;
  }
  selected() { return [...this.selSet].map((id) => this.world.alive(id)).filter(Boolean); }
  selUnits() { return this.selected().filter((u) => u.kind === 'unit' && u.owner === this.pid); }
  selBuilding() { return this.selected().find((e) => e.kind === 'building' && e.owner === this.pid) || null; }
  select(ids, additive = false) {
    if (!additive) this.selSet.clear();
    for (const id of ids) if (this.world.alive(id)) this.selSet.add(id);
    this.hud.panel(); this.orders.update(true); this.sounds.play('select');
  }
  setMode(mode) { this.place = null; this.mode = mode; this.canvas.classList.add('target'); this.hud.panel(); }
  cancelMode() { this.mode = ''; this.place = null; this.canvas.classList.remove('target'); if (this.world) this.hud.panel(); }
  startPlace(type) {
    if (!this.selUnits().some((u) => u.def.worker)) return this.hud.say('Выберите своего рабочего', true);
    this.mode = ''; const def = BUILDINGS[type];
    this.place = { type, size: def.size, tx: 0, ty: 0, ok: false };
    this.canvas.classList.add('target'); this.updatePlace(); this.hud.panel();
  }
  updatePlace() {
    if (!this.place) return;
    const p = this.place;
    p.tx = Math.floor((this.pointer.x + this.cam.x) / TILE - p.size / 2);
    p.ty = Math.floor((this.pointer.y + this.cam.y) / TILE - p.size / 2);
    p.ok = this.world.canPlace(p.size, p.tx, p.ty) && this.world.canAfford(this.pid, BUILDINGS[p.type].cost);
  }
  placeAt(tx, ty, repeat = false) {
    if (!this.place) return;
    const wk = this.selUnits().filter((u) => u.def.worker).sort((a, b) => (a.order.t === 'build') - (b.order.t === 'build'))[0];
    if (!wk) { this.cancelMode(); return this.hud.say('Рабочий недоступен', true); }
    const r = this.world.cmdBuild(this.pid, wk.id, this.place.type, tx, ty);
    if (!r.ok) { this.hud.say(r.reason, true); this.sounds.play('error'); return; }
    this.hud.say('Приказ на строительство: ' + BUILDINGS[this.place.type].ru);
    this.mark((tx + this.place.size / 2) * TILE, (ty + this.place.size / 2) * TILE, '#7dff7d');
    if (!repeat) this.cancelMode();
  }
  command(x, y, tid = 0, attackMove = false) {
    const ids = [...this.selSet];
    const kind = attackMove ? (this.world.cmdMove(this.pid, ids, x, y, true) ? 'amove' : null) : this.world.cmdSmart(this.pid, ids, x, y, tid);
    if (!kind) return this.hud.say('Сначала выберите свой отряд или здание', true);
    const text = { move: 'Движение', amove: 'Атакующий марш', attack: 'Атака цели', gather: 'Добыча ресурсов', return: 'Сдать груз', build: 'Достроить', heal: 'Лечение', rally: 'Точка сбора' }[kind];
    this.hud.say('Приказ: ' + text); this.mark(x, y, kind === 'attack' ? '#ff6a5a' : '#7dff7d');
    this.sounds.play(kind === 'attack' || attackMove ? 'attack' : 'move'); this.hud.panel();
  }
  mark(x, y, c) { this.markers.push({ x, y, c, t: 0 }); }
  center(x, y) { this.cam.x = x - this.canvas.width / 2; this.cam.y = y - this.canvas.height / 2; this.clampCamera(); }
  home() { const b = this.world.mainOf(this.pid); if (b) this.center(b.x, b.y); }
  clampCamera() {
    if (!this.world) return;
    this.cam.x = clamp(this.cam.x, 0, Math.max(0, this.world.pw - this.canvas.width));
    this.cam.y = clamp(this.cam.y, 0, Math.max(0, this.world.ph - this.canvas.height));
  }
  resize() {
    this.controls.reset();
    const panel = $('panel').getBoundingClientRect().height || 176;
    this.canvas.width = window.innerWidth; this.canvas.height = Math.max(1, window.innerHeight - panel - 32);
    this.clampCamera();
  }
  loseFocus() { this.controls.reset(); if (this.running && !this.world.over) { this.paused = true; this.acc = 0; $('btn-pause').textContent = 'Продолжить'; } }
  togglePause() {
    if (!this.running || this.world.over) return;
    this.paused = !this.paused; this.acc = 0; $('btn-pause').textContent = this.paused ? 'Продолжить' : 'Пауза';
  }
  frame(now) {
    const elapsed = clamp((now - this.last) / 1000, 0, 0.15); this.last = now;
    if (this.running) {
      this.controls.pan(elapsed); this.updatePlace();
      if (!this.paused && !this.world.over && !document.querySelector('dialog[open]')) {
        this.acc += elapsed * this.speed;
        // Fixed dt even under acceleration; no huge frame catch-up after tab switching.
        for (let i = 0; this.acc >= DT && i < 24 && !this.world.over; i++) {
          this.ais.forEach((a) => a.update()); this.world.step(); this.acc -= DT;
        }
      }
      for (const id of this.selSet) if (!this.world.alive(id)) this.selSet.delete(id);
      this.markers.forEach((m) => { m.t += elapsed; }); this.markers = this.markers.filter((m) => m.t < 0.6);
      this.renderer.draw(this.cam, this); this.hud.update(); this.orders.update(); this.missionHud.update();
      if (this.world.over && $('end').hidden) this.finish();
    }
    requestAnimationFrame((t) => this.frame(t));
  }
  finish() {
    this.acc = 0; this.cancelMode(); this.controls.reset();
    const w = this.world, won = w.winner === this.pid;
    $('end-title').textContent = w.winner === -1 ? 'Ничья' : won ? 'Победа' : 'Поражение';
    const t = Math.floor(w.time), rows = w.players.map((p) => {
      const s = p.stats; return `<tr><td>${FACTIONS[p.fac].ru}</td><td>${s.gathered.e} / ${s.gathered.w}</td><td>${s.built}</td><td>${s.trained}</td><td>${s.kills} / ${s.lost}</td></tr>`;
    }).join('');
    const mode = w.scenario ? `Миссия 01 · ${w.scenario.definition.name}` : this.observer ? 'ИИ против ИИ' : 'Схватка против ИИ';
    $('end-reason').textContent = w.scenario?.reason || '';
    $('end-stats').innerHTML = `<p>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')} · ${mode}</p><table><thead><tr><th>Фракция</th><th>Добыто Э/Д</th><th>Построено</th><th>Обучено</th><th>Убито / потери</th></tr></thead><tbody>${rows}</tbody></table>`;
    $('end').hidden = false; this.sounds.play(won ? 'win' : 'error');
  }
}
const game = new Game();
game.load().catch((e) => { $('status').textContent = 'Ошибка запуска: ' + e.message; });
