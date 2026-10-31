// SILKFRONT prototype — Canvas 2D renderer. Reads the existing unit atlases from ../ART (no art is replaced);
// only the worker "Послушник" (no atlas exists) and buildings/resources are drawn procedurally.
import { TILE, MAP_W, MAP_H, UNITS, FACTIONS, SPRITE_SCALE } from './data.js';
import { ANIM } from './units.js';

const S = SPRITE_SCALE;
const hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };

export async function loadAtlases(root = '../ART/') {
  const out = {}, errors = [];
  await Promise.all(Object.values(UNITS).filter((d) => d.art).map(async (d) => {
    const base = `${root}${d.fac}/UNITS/${d.art}/${d.art}_sheet`;
    try {
      const res = await fetch(base + '.json'); if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json(), img = new Image(); img.src = base + '.png'; await img.decode();
      out[d.art] = { json, img, pivot: json.meta.pivotPx || [144, 228] };
    } catch (e) { errors.push(d.art + ': ' + e.message); }
  }));
  return { atlases: out, errors };
}

export class Renderer {
  constructor(canvas, mini, world, atlases, pid) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.mini = mini; this.mctx = mini.getContext('2d');
    this.w = world; this.at = atlases; this.pid = pid; this.frame = 0;
    this.terrain = this.makeTerrain();
  }
  makeTerrain() { // half-resolution ground painted once
    const k = 0.5, cv = document.createElement('canvas'); cv.width = this.w.pw * k; cv.height = this.w.ph * k;
    const g = cv.getContext('2d'), t = TILE * k;
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      const h = hash(x, y), l = 15 + h * 5;
      g.fillStyle = `hsl(${95 + h * 25},${18 + h * 8}%,${l}%)`; g.fillRect(x * t, y * t, t + 1, t + 1);
    }
    for (let i = 0; i < 900; i++) { // soft moss / dirt blobs
      const x = hash(i, 1) * cv.width, y = hash(1, i) * cv.height, r = 10 + hash(i, i) * 40, dirt = hash(i, 7) < 0.35;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, dirt ? 'rgba(70,58,40,0.35)' : 'rgba(40,60,30,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const mains = [...this.w.buildings].map((b) => [b.x * k, b.y * k]);
    if (this.w.meta?.road) {
      // Reuse the existing road treatment; authored coordinates do not depend on future ground textures.
      for (const [wd, col] of [[46, 'rgba(60,50,36,0.45)'], [26, 'rgba(84,70,50,0.5)']]) {
        g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = wd; g.beginPath();
        this.w.meta.road.forEach(([x, y], i) => { if (i) g.lineTo(x * t, y * t); else g.moveTo(x * t, y * t); });
        g.stroke();
      }
    } else if (mains.length >= 2) { // worn road between the bases
      g.lineCap = 'round';
      for (const [wd, col] of [[46, 'rgba(60,50,36,0.45)'], [26, 'rgba(84,70,50,0.5)']]) {
        g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(...mains[0]);
        g.bezierCurveTo(cv.width * 0.3, cv.height * 0.75, cv.width * 0.7, cv.height * 0.25, ...mains[1]); g.stroke();
      }
    }
    for (let i = 0; i < 1400; i++) { const x = hash(i, 3) * cv.width, y = hash(3, i) * cv.height; g.fillStyle = hash(i, 5) < 0.5 ? 'rgba(120,140,90,0.25)' : 'rgba(20,24,18,0.35)'; g.fillRect(x, y, 1.5, 1.5); }
    return cv;
  }

  // ---------- main draw ----------
  draw(cam, ui) {
    const ctx = this.ctx, w = this.w, vw = this.c.width, vh = this.c.height; this.frame++;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.terrain, cam.x * 0.5, cam.y * 0.5, vw * 0.5, vh * 0.5, 0, 0, vw, vh);
    ctx.save(); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    const x0 = cam.x - 120, y0 = cam.y - 160, x1 = cam.x + vw + 120, y1 = cam.y + vh + 120;
    const vis = (e) => e.x > x0 && e.x < x1 && e.y > y0 && e.y < y1;
    const list = [];
    for (const r of w.res) if (vis(r)) list.push([r.y + (r.size * TILE) / 2, r]);
    for (const b of w.buildings) if (vis(b)) list.push([(b.ty + b.size) * TILE, b]);
    for (const u of w.units) if (vis(u)) list.push([u.y + (u.dead ? -1000 : 0), u]);
    list.sort((a, b) => a[0] - b[0]);
    const sel = ui.selSet;
    for (const [, e] of list) if (e.kind === 'unit' && !e.dead) this.ring(e, sel.has(e.id), e.id === ui.hoverId);
    for (const [, e] of list) {
      if (e.kind === 'res') e.type === 'mine' ? this.mine(e, sel.has(e.id)) : this.tree(e);
      else if (e.kind === 'building') this.building(e, sel.has(e.id));
      else this.unit(e);
    }
    for (const p of w.projectiles) this.projectile(p);
    for (const f of w.effects) this.effect(f);
    for (const m of ui.markers) { const a = 1 - m.t / 0.6; ctx.strokeStyle = m.c; ctx.globalAlpha = a; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(m.x, m.y, 14 * a + 4, 7 * a + 2, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    for (const [, e] of list) if (!e.dead && e.kind !== 'res' && (sel.has(e.id) || e.hp < e.maxHp || e.id === ui.hoverId)) this.bar(e);
    for (const [, e] of list) if (e.kind === 'building' && sel.has(e.id) && e.rally && e.owner === this.pid) {
      ctx.strokeStyle = 'rgba(255,240,180,0.6)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.rally.x, e.rally.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#f0d27a'; ctx.fillRect(e.rally.x - 1, e.rally.y - 18, 2, 18); ctx.fillRect(e.rally.x, e.rally.y - 18, 10, 6);
    }
    if (w.scenario) this.missionMarkers(ctx);
    if (ui.place) this.ghost(ui.place);
    ctx.restore();
    if (ui.drag) { const d = ui.drag; ctx.strokeStyle = '#8fe08f'; ctx.fillStyle = 'rgba(120,220,120,0.08)'; ctx.lineWidth = 1;
      ctx.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0); ctx.strokeRect(d.x0 + 0.5, d.y0 + 0.5, d.x1 - d.x0, d.y1 - d.y0); }
    if (this.frame % 6 === 0) this.minimap(cam);
  }

  ring(u, selected, hover) {
    const ctx = this.ctx, col = FACTIONS[this.w.players[u.owner].fac].color, rx = u.r + 4, ry = (u.r + 4) * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(u.x, u.y + 1, rx, ry, 0, 0, 7); ctx.fill();
    ctx.lineWidth = selected ? 2 : 1.2; ctx.strokeStyle = selected ? '#7dff7d' : hover ? '#ffffff' : col; ctx.globalAlpha = selected || hover ? 1 : 0.55;
    ctx.beginPath(); ctx.ellipse(u.x, u.y + 1, rx, ry, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  }
  unit(u) {
    const ctx = this.ctx, A = this.at[u.def.art];
    let alpha = 1; if (u.dead) alpha = Math.max(0, Math.min(1, (u.removeAt - this.w.time) / 1.5));
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    if (A) {
      const an = ANIM[u.anim] || ANIM.idle, n = Math.floor(u.animT * an.fps), i = an.loop ? n % an.n : Math.min(an.n - 1, n);
      const fr = A.json.frames[`${u.anim}_${String(i).padStart(2, '0')}`] || A.json.frames.idle_00, f = fr.frame;
      ctx.save(); ctx.translate(u.x, u.y); ctx.scale(u.facing * S, S);
      if (u.flash > 0) ctx.filter = 'brightness(1.9)';
      ctx.drawImage(A.img, f.x, f.y, f.w, f.h, -A.pivot[0], -A.pivot[1], f.w, f.h);
      ctx.restore();
    } else this.novice(u);
    ctx.globalAlpha = 1;
    if (u.carry && !u.dead) this.carry(u);
  }
  // Procedural stand-in for the worker that has no atlas yet (human_novice).
  novice(u) {
    const ctx = this.ctx, t = u.animT, walk = u.anim === 'walk', work = u.anim === 'attack';
    const bob = walk ? Math.abs(Math.sin(t * 10)) * 2 : Math.sin(t * 2) * 0.6, lean = work ? Math.sin(t * 12) * 0.25 : 0;
    ctx.save(); ctx.translate(u.x, u.y); ctx.scale(u.facing, 1);
    if (u.dead) { ctx.rotate(Math.min(1, (this.w.time - (u.removeAt - 5)) * 2) * 1.4); }
    ctx.translate(0, -bob);
    const leg = walk ? Math.sin(t * 10) * 3 : 0;
    ctx.fillStyle = '#2b2219'; ctx.fillRect(-4 + leg, -6, 3, 6); ctx.fillRect(1 - leg, -6, 3, 6);
    const g = ctx.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, '#6e5a40'); g.addColorStop(0.6, '#4d3e2c'); g.addColorStop(1, '#2e251a');
    ctx.fillStyle = u.flash > 0 ? '#d8c8a8' : g; ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(-6, -30); ctx.lineTo(6, -30); ctx.lineTo(9, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1a140d'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#b89c62'; ctx.fillRect(-7, -17, 14, 2); // rope belt
    ctx.save(); ctx.translate(5, -24); ctx.rotate(-0.6 + lean); ctx.fillStyle = '#5a4630'; ctx.fillRect(0, -1, 3, 14); // arm + tool
    ctx.fillStyle = '#7c7f86'; ctx.fillRect(-2, 11, 8, 3); ctx.restore();
    ctx.fillStyle = '#c9a882'; ctx.beginPath(); ctx.arc(1, -34, 5, 0, 7); ctx.fill(); // face
    ctx.fillStyle = '#3d3022'; ctx.beginPath(); ctx.arc(0, -35, 6.5, Math.PI * 0.95, Math.PI * 2.25); ctx.lineTo(-6, -30); ctx.fill(); // hood
    ctx.restore();
  }
  carry(u) {
    const ctx = this.ctx, y = u.y - u.def.h - 6;
    if (u.carry.k === 'e') { ctx.fillStyle = '#b48cff'; ctx.shadowColor = '#b48cff'; ctx.shadowBlur = 6; ctx.beginPath(); ctx.moveTo(u.x, y - 6); ctx.lineTo(u.x + 4, y); ctx.lineTo(u.x, y + 6); ctx.lineTo(u.x - 4, y); ctx.fill(); ctx.shadowBlur = 0; }
    else { ctx.fillStyle = '#7a5532'; ctx.fillRect(u.x - 7, y - 2, 14, 5); ctx.fillStyle = '#a77d4f'; ctx.beginPath(); ctx.arc(u.x + 7, y + 0.5, 2.5, 0, 7); ctx.fill(); }
  }
  bar(e) {
    const ctx = this.ctx, wd = e.kind === 'building' ? e.size * TILE * 0.8 : 30, f = Math.max(0, e.hp / e.maxHp);
    const x = e.x - wd / 2, y = e.kind === 'building' ? e.ty * TILE - this.bh(e) - 8 : e.y - e.def.h - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x - 1, y - 1, wd + 2, 5);
    ctx.fillStyle = f > 0.6 ? '#5fd35f' : f > 0.3 ? '#e0c040' : '#e05040'; ctx.fillRect(x, y, wd * f, 3);
    if (e.kind === 'building' && !e.done) { ctx.fillStyle = '#7fb8ff'; ctx.fillRect(x, y + 4, wd * e.progress, 2); }
    else if (e.kind === 'building' && e.qStarted) { ctx.fillStyle = '#f0d27a'; ctx.fillRect(x, y + 4, wd * (e.qT / UNITS[e.queue[0]].time), 2); }
  }
  bh(b) { return { h_citadel: 70, h_barracks: 40, h_chapel: 60, h_tower: 64, s_nest: 46, s_incubator: 30, s_brood: 22, s_webtower: 60 }[b.type] || 30; }

  // ---------- buildings (procedural: no building art exists yet, STYLE_GUIDE §5) ----------
  building(b, selected) {
    const ctx = this.ctx, x = b.tx * TILE, y = b.ty * TILE, s = b.size * TILE, cx = x + s / 2, H = this.bh(b);
    const col = FACTIONS[this.w.players[b.owner].fac].color;
    ctx.save();
    if (!b.done) ctx.globalAlpha = 0.45 + 0.55 * b.progress;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(cx + 6, y + s - 4, s * 0.55, s * 0.22, 0, 0, 7); ctx.fill();
    if (selected) { ctx.strokeStyle = '#7dff7d'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, s - 2, s - 2); }
    if (b.flash > 0) ctx.filter = 'brightness(1.6)';
    if (b.def.fac === 'HUMANS') this.humanB(b, x, y, s, cx, H); else this.spiderB(b, x, y, s, cx, H);
    ctx.filter = 'none';
    // owner banner / glow marker
    ctx.fillStyle = col; ctx.fillRect(x + 3, y + s - 7, 6, 4);
    if (!b.done) { // scaffolding
      ctx.globalAlpha = 0.9; ctx.strokeStyle = '#8a6a3e'; ctx.lineWidth = 2;
      for (let i = 0; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(x + 4 + i * (s - 8) / 3, y + s - 4); ctx.lineTo(x + 4 + i * (s - 8) / 3, y + s - 4 - H * (1 - b.progress * 0.6)); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(x + 4, y + s - H * 0.5); ctx.lineTo(x + s - 4, y + s - H * 0.5); ctx.stroke();
    }
    if (b.done && b.hp < b.maxHp * 0.5) { // smoke, no fire/blood
      const t = this.w.time;
      for (let i = 0; i < 3; i++) { const k = (t * 0.6 + i / 3) % 1; ctx.globalAlpha = 0.35 * (1 - k); ctx.fillStyle = '#555';
        ctx.beginPath(); ctx.arc(cx - 10 + i * 10, y + s - H - k * 30, 6 + k * 8, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }
  humanB(b, x, y, s, cx, H) {
    const ctx = this.ctx, base = y + s - 4, top = base - H;
    const g = ctx.createLinearGradient(x, 0, x + s, 0); g.addColorStop(0, '#8d8a84'); g.addColorStop(0.5, '#6c6963'); g.addColorStop(1, '#3f3d3a');
    const wall = (x0, w0, h0) => { ctx.fillStyle = g; ctx.fillRect(x0, base - h0, w0, h0); ctx.strokeStyle = '#2a2826'; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, base - h0 + 0.5, w0 - 1, h0 - 1);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; for (let yy = base - 8; yy > base - h0; yy -= 8) { ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + w0, yy); ctx.stroke(); } };
    const roof = (x0, w0, yb, hh, c = '#3a4150') => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x0 - 2, yb); ctx.lineTo(x0 + w0 / 2, yb - hh); ctx.lineTo(x0 + w0 + 2, yb); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1d2129'; ctx.stroke(); };
    const win = (wx, wy) => { ctx.fillStyle = '#f2cf73'; ctx.globalAlpha *= 0.9; ctx.beginPath(); ctx.moveTo(wx - 2, wy + 7); ctx.lineTo(wx - 2, wy); ctx.arc(wx, wy, 2, Math.PI, 0); ctx.lineTo(wx + 2, wy + 7); ctx.fill(); ctx.globalAlpha /= 0.9; };
    if (b.type === 'h_citadel') {
      wall(x + 8, s - 16, H * 0.55); wall(x + 2, 22, H * 0.85); wall(x + s - 24, 22, H * 0.85); wall(cx - 16, 32, H);
      roof(x + 2, 22, base - H * 0.85, 22); roof(x + s - 24, 22, base - H * 0.85, 22); roof(cx - 16, 32, top, 30);
      win(cx, top + 16); win(x + 13, base - H * 0.6); win(x + s - 13, base - H * 0.6);
      ctx.fillStyle = '#2a1f14'; ctx.beginPath(); ctx.moveTo(cx - 7, base); ctx.lineTo(cx - 7, base - 14); ctx.arc(cx, base - 14, 7, Math.PI, 0); ctx.lineTo(cx + 7, base); ctx.fill();
      ctx.fillStyle = '#c9a45a'; ctx.fillRect(cx - 1, top - 44, 2, 16); ctx.fillRect(cx + 1, top - 44, 10, 6);
    } else if (b.type === 'h_barracks') {
      wall(x + 4, s - 8, H); roof(x + 4, s - 8, top, 22, '#5a3a2a'); win(x + 18, top + 14); win(x + s - 18, top + 14);
      ctx.fillStyle = '#2a1f14'; ctx.fillRect(cx - 8, base - 18, 16, 18);
      ctx.strokeStyle = '#b8b8c0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - 10, top - 4); ctx.lineTo(cx + 10, top - 16); ctx.moveTo(cx + 10, top - 4); ctx.lineTo(cx - 10, top - 16); ctx.stroke();
    } else if (b.type === 'h_chapel') {
      wall(x + 10, s - 20, H * 0.55); roof(x + 10, s - 20, base - H * 0.55, 18); wall(cx - 9, 18, H); roof(cx - 9, 18, top, 26);
      win(cx, top + 14); win(x + 22, base - H * 0.42); win(x + s - 22, base - H * 0.42);
      ctx.fillStyle = '#e8d9a8'; ctx.fillRect(cx - 1, top - 38, 2, 12); ctx.fillRect(cx - 5, top - 34, 10, 2);
    } else { // h_tower
      wall(cx - 13, 26, H); ctx.fillStyle = '#6c6963'; for (let i = 0; i < 4; i++) ctx.fillRect(cx - 15 + i * 9, top - 6, 6, 6);
      win(cx, top + 14); win(cx, top + 34);
    }
  }
  spiderB(b, x, y, s, cx, H) {
    const ctx = this.ctx, base = y + s - 4, t = this.w.time, glow = 0.6 + Math.sin(t * 2 + b.id) * 0.25;
    const dome = (dx, w0, h0) => { const gg = ctx.createRadialGradient(dx - w0 * 0.2, base - h0 * 0.8, 2, dx, base - h0 * 0.4, w0);
      gg.addColorStop(0, '#5d4a6e'); gg.addColorStop(0.6, '#2f2438'); gg.addColorStop(1, '#141018');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(dx, base, w0 / 2, h0, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#0c0a0e'; ctx.lineWidth = 1; ctx.stroke(); };
    const sac = (sx, sy, r) => { ctx.fillStyle = `rgba(71,195,180,${glow})`; ctx.shadowColor = '#47c3b4'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.ellipse(sx, sy, r, r * 0.8, 0, 0, 7); ctx.fill(); ctx.shadowBlur = 0; };
    const webs = (n, len) => { ctx.strokeStyle = 'rgba(220,225,235,0.35)'; ctx.lineWidth = 1; for (let i = 0; i < n; i++) { const a = Math.PI + (i + 0.5) / n * Math.PI; ctx.beginPath(); ctx.moveTo(cx, base - H); ctx.lineTo(cx + Math.cos(a) * len, base + Math.sin(a) * len * 0.2 + 2); ctx.stroke(); } };
    if (b.type === 's_nest') { webs(7, s * 0.6); dome(x + 26, 40, H * 0.6); dome(x + s - 26, 40, H * 0.6); dome(cx, s * 0.7, H); sac(cx, base - H * 0.55, 8); sac(x + 24, base - 14, 5); sac(x + s - 24, base - 14, 5);
      ctx.fillStyle = '#0a080c'; ctx.beginPath(); ctx.ellipse(cx, base - 2, 10, 8, 0, Math.PI, 0); ctx.fill(); }
    else if (b.type === 's_incubator') { webs(5, s * 0.55); dome(cx, s * 0.85, H); for (let i = 0; i < 3; i++) sac(x + 18 + i * (s - 36) / 2, base - H * 0.5, 6); }
    else if (b.type === 's_brood') { dome(x + 22, 34, H); dome(x + s - 22, 34, H * 0.9); dome(cx, 30, H * 1.2); sac(cx, base - H * 0.6, 5); }
    else { webs(4, s * 0.5); ctx.fillStyle = '#2a2131'; ctx.beginPath(); ctx.moveTo(cx - 12, base); ctx.lineTo(cx - 4, base - H); ctx.lineTo(cx + 4, base - H); ctx.lineTo(cx + 12, base); ctx.fill(); ctx.strokeStyle = '#0c0a0e'; ctx.stroke(); sac(cx, base - H, 7); }
  }

  // ---------- resources ----------
  mine(r, selected) {
    const ctx = this.ctx, x = r.tx * TILE, y = r.ty * TILE, s = r.size * TILE, cx = x + s / 2, base = y + s - 6, f = Math.max(0.3, r.amount / r.def.amount);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(cx, base, s * 0.5, s * 0.2, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3b3640'; ctx.beginPath(); ctx.ellipse(cx, base - 6, s * 0.48, s * 0.28, 0, 0, 7); ctx.fill();
    const pts = [[-26, 0, 14, 34], [-8, -4, 18, 52], [12, -2, 14, 40], [26, 2, 10, 26], [0, 6, 10, 22]];
    for (const [dx, dy, w0, h0] of pts) { const h1 = h0 * f, g = ctx.createLinearGradient(cx + dx - w0 / 2, 0, cx + dx + w0 / 2, 0);
      g.addColorStop(0, '#d9c4ff'); g.addColorStop(0.5, '#8d62e0'); g.addColorStop(1, '#3d2470');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx + dx - w0 / 2, base + dy - 4); ctx.lineTo(cx + dx, base + dy - 4 - h1); ctx.lineTo(cx + dx + w0 / 2, base + dy - 4); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = `rgba(180,140,255,${0.15 + Math.sin(this.w.time * 1.5) * 0.06})`; ctx.beginPath(); ctx.ellipse(cx, base - 20, s * 0.45, s * 0.35, 0, 0, 7); ctx.fill();
    if (selected) { ctx.strokeStyle = '#ffe680'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, s - 2, s - 2); }
  }
  tree(r) {
    const ctx = this.ctx, cx = r.x + (hash(r.tx, r.ty) - 0.5) * 6, base = r.y + 12, k = 0.85 + hash(r.ty, r.tx) * 0.35;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx + 4, base, 14, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a2a1c'; ctx.fillRect(cx - 2, base - 10, 4, 10);
    const tones = ['#1d2e22', '#22382a', '#2a4231'];
    for (let i = 0; i < 3; i++) { const yy = base - 8 - i * 12 * k, wd = (16 - i * 4) * k; ctx.fillStyle = tones[i];
      ctx.beginPath(); ctx.moveTo(cx - wd, yy); ctx.lineTo(cx, yy - 20 * k); ctx.lineTo(cx + wd, yy); ctx.closePath(); ctx.fill(); }
  }

  // ---------- projectiles / effects / placement ----------
  projectile(p) {
    const ctx = this.ctx;
    if (p.type === 'bolt') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang); ctx.strokeStyle = '#d8d0b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(6, 0); ctx.stroke(); ctx.restore(); }
    else { const c = p.type === 'venom' ? '#9be35a' : p.type === 'web' ? '#e6ecf2' : '#fff1b0';
      ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(p.x, p.y, p.type === 'web' ? 4 : 3.5, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
  }
  effect(f) {
    const ctx = this.ctx, k = f.t / f.life;
    ctx.globalAlpha = Math.max(0, 1 - k);
    if (f.type === 'heal') { ctx.fillStyle = '#fff1b0'; for (let i = 0; i < 4; i++) { const a = i * 1.57 + k * 3; ctx.fillRect(f.x + Math.cos(a) * 10 - 1, f.y - k * 18 + Math.sin(a) * 4, 2, 6); } }
    else if (f.type === 'impact') { ctx.strokeStyle = f.kind === 'venom' ? '#9be35a' : f.kind === 'light' ? '#fff1b0' : '#dddddd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y, 3 + k * 10, 0, 7); ctx.stroke(); }
    else if (f.type === 'collapse') { ctx.fillStyle = '#5a5550'; for (let i = 0; i < 8; i++) { const a = i * 0.8; ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * k * f.s * 14, f.y + Math.sin(a) * k * f.s * 6, 8 + k * 14, 0, 7); ctx.fill(); } }
    ctx.globalAlpha = 1;
  }
  ghost(pl) {
    const ctx = this.ctx, s = pl.size * TILE;
    ctx.fillStyle = pl.ok ? 'rgba(90,220,90,0.28)' : 'rgba(230,70,60,0.32)'; ctx.fillRect(pl.tx * TILE, pl.ty * TILE, s, s);
    ctx.strokeStyle = pl.ok ? '#7dff7d' : '#ff6a5a'; ctx.lineWidth = 2; ctx.strokeRect(pl.tx * TILE + 1, pl.ty * TILE + 1, s - 2, s - 2);
  }
  // Navigation UI, not scene assets: can stay unchanged when temporary artwork is replaced.
  missionMarkers(ctx, kx = 1, ky = 1, mini = false) {
    const s = this.w.scenario; if (!s) return;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = mini ? 'bold 10px sans-serif' : 'bold 13px sans-serif';
    s.objectives.forEach((o, i) => {
      if (o.done || !o.at) return;
      const x = (o.at[0] + 0.5) * TILE * kx, y = (o.at[1] + 0.5) * TILE * ky, r = mini ? 6 : 13;
      ctx.fillStyle = '#201b15'; ctx.strokeStyle = '#f0d27a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f0d27a'; ctx.fillText(String(i + 1), x, y);
    });
    ctx.restore();
  }
  minimap(cam) {
    const g = this.mctx, W = this.mini.width, Hh = this.mini.height, kx = W / this.w.pw, ky = Hh / this.w.ph;
    g.drawImage(this.terrain, 0, 0, W, Hh);
    g.fillStyle = '#16301e'; for (const r of this.w.res) if (r.type === 'tree') g.fillRect(r.tx * TILE * kx, r.ty * TILE * ky, 2, 2);
    g.fillStyle = '#a77dff'; for (const r of this.w.res) if (r.type === 'mine') g.fillRect(r.tx * TILE * kx, r.ty * TILE * ky, 5, 5);
    for (const b of this.w.buildings) { g.fillStyle = b.owner === this.pid ? '#6fe06f' : '#e05a4a'; g.fillRect(b.tx * TILE * kx, b.ty * TILE * ky, Math.max(3, b.size * TILE * kx), Math.max(3, b.size * TILE * ky)); }
    for (const u of this.w.units) if (!u.dead) { g.fillStyle = u.owner === this.pid ? '#9cff9c' : '#ff8a7a'; g.fillRect(u.x * kx - 1, u.y * ky - 1, 2.5, 2.5); }
    if (this.w.scenario) this.missionMarkers(g, kx, ky, true);
    // Inset the stroke so all four sides stay visible at map limits and on oversized viewports.
    const x = Math.min(W - 0.5, cam.x * kx + 0.5), y = Math.min(Hh - 0.5, cam.y * ky + 0.5);
    const right = Math.min(W - 0.5, (cam.x + this.c.width) * kx - 0.5);
    const bottom = Math.min(Hh - 0.5, (cam.y + this.c.height) * ky - 0.5);
    g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.strokeRect(x, y, Math.max(0, right - x), Math.max(0, bottom - y));
  }
}
