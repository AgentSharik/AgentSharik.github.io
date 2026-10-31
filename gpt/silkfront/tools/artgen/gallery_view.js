// Browser side of the unit gallery. Plays the real Phaser atlases (sheet PNG + JSON
// frames) on canvases, so what you see is exactly what the game will load.
const $ = (t, a = {}, ...k) => { const e = document.createElement(t); Object.assign(e, a); e.append(...k); return e; };
const imgs = {};
const sheetImg = (u) => imgs[u.id] || (imgs[u.id] = Object.assign(new Image(), { src: `${u.dir}/${u.id}_sheet.png` }));
const opts = { bg: 'ground', pivot: false, zoom: 1, speed: 1 };
const players = [];

// One looping/one-shot animation player bound to a canvas.
function player(u, state, size, zoom) {
  const c = $('canvas', { width: size, height: size });
  const st = DATA.states[state], names = u.atlas.animations[state].frames;
  const pl = { c, u, state, names, st, t: 0, zoom };
  players.push(pl);
  return pl;
}
function drawFrame(ctx, u, name, x, y, z) {
  const fr = u.atlas.frames[name].frame, im = sheetImg(u);
  if (!im.complete) return;
  ctx.drawImage(im, fr.x, fr.y, fr.w, fr.h, x - DATA.pivot[0] * z, y - DATA.pivot[1] * z, fr.w * z, fr.h * z);
}
function tickPlayer(pl, dt) {
  const ctx = pl.c.getContext('2d'), z = pl.zoom ?? opts.zoom;
  pl.t += dt * opts.speed;
  const n = pl.names.length, len = n / pl.st.fps, hold = pl.st.loop ? 0 : 0.8; // one-shots hold last frame
  const tt = pl.st.loop ? pl.t % len : pl.t % (len + hold);
  const i = Math.max(0, Math.min(n - 1, Math.floor(tt * pl.st.fps)));
  ctx.clearRect(0, 0, pl.c.width, pl.c.height);
  const px = pl.c.width / 2, py = pl.c.height * 0.79;
  drawFrame(ctx, pl.u, pl.names[i], px, py, z);
  if (opts.pivot) { ctx.strokeStyle = '#e04'; ctx.beginPath(); ctx.moveTo(px - 8, py); ctx.lineTo(px + 8, py); ctx.moveTo(px, py - 8); ctx.lineTo(px, py + 8); ctx.stroke(); }
  pl.c.title = `${pl.names[i]} · ${i + 1}/${n} · ${pl.st.fps} fps${pl.st.loop ? ' · loop' : ''}`;
}
let last = performance.now();
function loop(now) { const dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); /* rAF time can precede last */ last = now; players.forEach((p) => p.c.isConnected && tickPlayer(p, dt)); field.tick && field.tick(dt); requestAnimationFrame(loop); }

function toolsBar(onChange) {
  const sel = $('select', { onchange: (e) => { opts.bg = e.target.value; onChange(); } },
    ...[['ground', 'Земля (ночь)'], ['light', 'Трава (светлая)'], ['chk', 'Прозрачность']].map(([v, t]) => $('option', { value: v, textContent: t, selected: opts.bg === v })));
  const z = $('select', { onchange: (e) => { opts.zoom = +e.target.value; onChange(); } },
    ...[[1, '100% (PNG)'], [0.5, '50% (игровой зум)'], [0.33, '33% (дальний зум)']].map(([v, t]) => $('option', { value: v, textContent: t, selected: opts.zoom === v })));
  const sp = $('input', { type: 'range', min: 0.1, max: 2, step: 0.1, value: opts.speed, oninput: (e) => (opts.speed = +e.target.value) });
  const pv = $('input', { type: 'checkbox', checked: opts.pivot, onchange: (e) => (opts.pivot = e.target.checked) });
  return $('div', { className: 'tools' }, 'Фон ', sel, ' Масштаб ', z, ' Скорость ', sp, $('label', {}, pv, ' точка опоры'));
}

const LABEL = { idle: 'Ожидание', walk: 'Движение', attack: 'Атака', hit: 'Урон', death: 'Смерть' };
const FAC = { HUMANS: 'Орден Последнего Света', SPIDERS: 'Древняя Колония' };
const main = document.getElementById('main'), nav = document.getElementById('nav');
let current = 'overview';

// Battlefield preview: every unit at in-game zoom on one ground plane, walking in place.
const field = {};
function fieldCard() {
  const W = 1200, H = 300, c = $('canvas', { width: W, height: H }), z = 0.5;
  const list = DATA.units, t0 = { v: 0 };
  field.tick = (dt) => {
    if (!c.isConnected) return;
    t0.v += dt * opts.speed;
    const ctx = c.getContext('2d');
    const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1b1e28'); gr.addColorStop(1, '#3a4150');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    list.forEach((u, i) => {
      const st = i % 2 ? 'walk' : 'idle', names = u.atlas.animations[st].frames, fps = DATA.states[st].fps;
      const x = 70 + i * ((W - 140) / (list.length - 1)), y = 170 + (i % 2) * 70;
      drawFrame(ctx, u, names[Math.max(0, Math.floor(t0.v * fps)) % names.length], x, y, z);
      ctx.fillStyle = u.fac === 'HUMANS' ? '#c9a45a' : '#47c3b4'; ctx.font = '11px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(u.ru, x, y + 22);
    });
  };
  return $('div', { className: 'card', id: 'field' }, $('h2', { textContent: 'Поле боя · игровой масштаб 50%' }),
    $('h3', { textContent: 'Все 10 юнитов на одной земле, одна камера, одинаковая опора. Нечётные — в ходьбе.' }), c);
}

function stateRow(u, size) {
  return $('div', { className: 'row' }, ...Object.keys(DATA.states).map((s) => {
    const pl = player(u, s, size, null);
    pl.c.className = 'ground ' + opts.bg;
    const n = pl.names.length, st = DATA.states[s];
    return $('div', { className: 'st' }, pl.c, $('span', { textContent: `${LABEL[s] || s} · ${n} кадр. · ${st.fps} fps${st.loop ? ' · цикл' : ''}` }));
  }));
}

function overview() {
  const cards = ['HUMANS', 'SPIDERS'].map((fac) => $('div', { className: 'card' },
    $('h2', { textContent: FAC[fac] }), $('h3', { textContent: 'Атака каждого юнита (наведите на кадр — номер кадра)' }),
    $('div', { className: 'row' }, ...DATA.units.filter((u) => u.fac === fac).map((u) => {
      const pl = player(u, 'attack', 200, 0.66); pl.c.className = 'ground ' + opts.bg;
      return $('div', { className: 'st' }, pl.c, $('span', { textContent: `${u.ru} — ${u.role}` }));
    }))));
  const lineup = $('div', { className: 'card' }, $('h2', { textContent: 'Линейка масштаба (STYLE GUIDE)' }),
    $('h3', { textContent: 'Верх — цвет, низ — силуэты 50%. Один риг-масштаб, одна линия земли.' }),
    $('div', { className: 'sheet' }, $('img', { src: '../STYLE_GUIDE/scale_lineup.png', style: 'width:100%' })));
  return [fieldCard(), ...cards, lineup];
}

function unitPage(u) {
  const files = $('table', {}, $('tr', {}, $('th', { textContent: 'Состояние' }), $('th', { textContent: 'PNG' }), $('th', { textContent: 'SVG' })),
    ...['sheet', ...Object.keys(DATA.states)].map((s) => $('tr', {}, $('td', { textContent: LABEL[s] || 'Spritesheet' }),
      $('td', {}, $('a', { href: `${u.dir}/${u.id}_${s}.png`, textContent: `${u.id}_${s}.png` })),
      $('td', {}, $('a', { href: `${u.svgDir}/${u.id}_${s}.svg`, textContent: `${u.id}_${s}.svg` })))));
  return [
    $('div', { className: 'card' }, $('h2', { textContent: `${u.ru} · ${u.id}` }),
      $('h3', { textContent: `${FAC[u.fac]} · ${u.role} · высота над опорой ${u.height}px · обрезанных кадров: ${u.clipped}` }),
      stateRow(u, 288)),
    $('div', { className: 'card' }, $('h2', { textContent: 'Spritesheet (Phaser atlas)' }),
      $('h3', { textContent: `Строки: ${Object.keys(DATA.states).join(' / ')} · ячейка ${DATA.cell}px · опора ${DATA.pivot.join(',')}` }),
      $('div', { className: 'sheet ground chk' }, $('img', { src: `${u.dir}/${u.id}_sheet.png` }))),
    $('div', { className: 'card' }, $('h2', { textContent: 'Файлы' }), files, $('p', {},
      $('a', { href: `${u.dir}/${u.id}_sheet.json`, textContent: `${u.id}_sheet.json` }), ' — атлас с кадрами и анимациями')),
  ];
}

function render() {
  players.length = 0;
  nav.replaceChildren($('button', { textContent: 'Обзор', className: current === 'overview' ? 'on' : '', onclick: () => { current = 'overview'; render(); } }),
    ...DATA.units.map((u) => $('button', { textContent: u.ru, className: (u.fac === 'HUMANS' ? 'h' : 's') + (current === u.id ? ' on' : ''),
      onclick: () => { current = u.id; render(); } })));
  const u = DATA.units.find((x) => x.id === current);
  main.replaceChildren(toolsBar(render), ...(u ? unitPage(u) : overview()));
}
render();
requestAnimationFrame(loop);
