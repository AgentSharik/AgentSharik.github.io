// Mouse/keyboard adapter. Only translates input into existing World commands.
import { clamp } from './world.js';
import { edgeDist } from './units.js';

export const CAMERA_SPEED = 620; // World pixels per real second; independent of simulation speed.
export const CAMERA_EDGE_ZONE = 32; // CSS pixels: stable under canvas scaling/browser zoom.
const CAMERA_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
export function textInput(target) {
  return !!(target?.isContentEditable || target?.closest?.('input,select,textarea,[role="textbox"],[role="searchbox"],[role="combobox"]'));
}
export function edgeAxis(pos, size) {
  if (pos < 0 || pos > size || size <= 0) return 0;
  const zone = Math.min(CAMERA_EDGE_ZONE, size / 2);
  const ramp = (distance) => { const t = clamp(1 - distance / zone, 0, 1); return t * t * (3 - 2 * t); };
  return ramp(size - pos) - ramp(pos);
}
// The minimap bitmap fills its content box, not its CSS border (also works with CSS scaling).
export function minimapPoint(mini, world, clientX, clientY) {
  const r = mini.getBoundingClientRect(), sx = r.width / mini.offsetWidth, sy = r.height / mini.offsetHeight;
  return { x: clamp((clientX - r.left - mini.clientLeft * sx) / (mini.clientWidth * sx), 0, 1) * world.pw,
    y: clamp((clientY - r.top - mini.clientTop * sy) / (mini.clientHeight * sy), 0, 1) * world.ph };
}

export function hitTest(w, x, y) {
  let best = null, score = Infinity;
  for (const u of w.units) {
    if (u.dead) continue;
    const dx = Math.abs(u.x - x), dy = u.y - y;
    if (dx <= Math.max(u.r + 5, 19) && dy >= -u.r && dy <= u.def.h + 8) {
      const d = dx + Math.abs(dy - u.def.h * 0.35) * 0.4;
      if (d < score) { score = d; best = u; }
    }
  }
  if (best) return best;
  for (const b of w.buildings) if (!b.dead && edgeDist(x, y, b) === 0) return b;
  for (const r of w.res) if (edgeDist(x, y, r) === 0) return r;
  return null;
}
export class Controls {
  constructor(g) {
    this.g = g; const c = g.canvas;
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    c.addEventListener('pointermove', (e) => this.pointer(e));
    c.addEventListener('pointerleave', () => { g.pointer.inside = false; });
    c.addEventListener('pointerdown', (e) => this.down(e));
    c.addEventListener('pointerup', (e) => this.up(e));
    c.addEventListener('pointercancel', () => this.reset());
    c.addEventListener('lostpointercapture', () => { this.downAt = null; g.drag = null; });
    c.addEventListener('dblclick', (e) => this.double(e));
    document.addEventListener('keydown', (e) => this.key(e));
    document.addEventListener('keyup', (e) => g.keys.delete(e.code));
    const mini = this.mini = document.getElementById('mini');
    this.focused = document.hasFocus(); this.miniPointer = null; this.selectionPointer = null;
    this.client = null;
    document.addEventListener('pointermove', (e) => {
      this.client = { x: e.clientX, y: e.clientY };
      if (e.target !== c) g.pointer.inside = false;
    }, true);
    document.addEventListener('pointerleave', () => { this.client = null; g.pointer.inside = false; });
    document.addEventListener('focusin', (e) => { if (textInput(e.target)) g.keys.clear(); });
    window.addEventListener('blur', () => { this.focused = false; this.reset(); });
    window.addEventListener('focus', () => { this.focused = true; });
    document.addEventListener('visibilitychange', () => {
      this.focused = !document.hidden && document.hasFocus(); if (!this.focused) this.reset();
    });
    mini.addEventListener('contextmenu', (e) => e.preventDefault());
    mini.addEventListener('pointerdown', (e) => this.miniDown(e));
    mini.addEventListener('pointermove', (e) => this.miniMove(e));
    mini.addEventListener('pointerup', (e) => { if (e.pointerId === this.miniPointer && e.button === 0) this.endMini(); });
    mini.addEventListener('pointercancel', () => this.endMini());
    mini.addEventListener('lostpointercapture', () => { this.miniPointer = null; });
  }
  active() { return this.focused && !document.hidden && this.g.running && !this.g.world.over && !document.querySelector('dialog[open]'); }
  endMini() {
    const id = this.miniPointer; this.miniPointer = null;
    if (id !== null && this.mini.hasPointerCapture(id)) this.mini.releasePointerCapture(id);
  }
  reset() {
    this.g.keys.clear(); this.client = null; this.g.pointer.inside = false;
    this.downAt = null; this.g.drag = null; this.endMini();
    const id = this.selectionPointer; this.selectionPointer = null;
    if (id !== null && this.g.canvas.hasPointerCapture(id)) this.g.canvas.releasePointerCapture(id);
  }
  miniDown(e) {
    if (!this.active() || ![0, 2].includes(e.button)) return;
    const g = this.g, { x, y } = minimapPoint(this.mini, g.world, e.clientX, e.clientY);
    e.preventDefault(); g.canvas.focus({ preventScroll: true }); g.sounds.unlock(); g.pointer.inside = false;
    if (e.button === 2) { g.command(x, y, hitTest(g.world, x, y)?.id); return; }
    this.miniPointer = e.pointerId; this.mini.setPointerCapture(e.pointerId); g.center(x, y);
    // Keep the existing explicit attack-move click, but never issue repeated orders during navigation.
    if (g.mode === 'amove') { g.command(x, y, 0, true); g.cancelMode(); }
  }
  miniMove(e) {
    if (e.pointerId !== this.miniPointer) return;
    if (!this.active() || !(e.buttons & 1)) { this.endMini(); return; }
    const p = minimapPoint(this.mini, this.g.world, e.clientX, e.clientY);
    this.g.center(p.x, p.y); e.preventDefault();
  }
  pointer(e) {
    const g = this.g, r = g.canvas.getBoundingClientRect();
    this.client = { x: e.clientX, y: e.clientY };
    g.pointer = { x: (e.clientX - r.left) * g.canvas.width / r.width, y: (e.clientY - r.top) * g.canvas.height / r.height,
      inside: e.clientX >= r.left && e.clientX < r.right && e.clientY >= r.top && e.clientY < r.bottom && document.elementFromPoint(e.clientX, e.clientY) === g.canvas };
    if (!this.active()) return;
    const p = g.pointer; g.hoverId = hitTest(g.world, p.x + g.cam.x, p.y + g.cam.y)?.id || 0;
    if (this.downAt && e.buttons & 1) {
      if (g.drag || Math.hypot(p.x - this.downAt.x, p.y - this.downAt.y) > 5)
        g.drag = { x0: this.downAt.wx - g.cam.x, y0: this.downAt.wy - g.cam.y, x1: p.x, y1: p.y };
    }
  }
  down(e) {
    if (!this.active()) return;
    e.preventDefault(); this.g.canvas.focus({ preventScroll: true }); this.g.sounds.unlock(); this.pointer(e);
    const g = this.g, x = g.pointer.x + g.cam.x, y = g.pointer.y + g.cam.y;
    if (e.button === 2) {
      if (g.mode || g.place) g.cancelMode(); else g.command(x, y, g.hoverId);
    } else if (e.button === 0) {
      if (g.place) { g.updatePlace(); g.placeAt(g.place.tx, g.place.ty, e.shiftKey); return; }
      if (g.mode === 'amove') { const t = g.world.alive(g.hoverId); if (t && t.owner !== g.pid && t.kind !== 'res') g.command(x, y, t.id); else g.command(x, y, 0, true); g.cancelMode(); return; }
      this.downAt = { x: g.pointer.x, y: g.pointer.y, wx: x, wy: y };
      this.selectionPointer = e.pointerId; g.canvas.setPointerCapture(e.pointerId);
    }
  }
  up(e) {
    if (e.button !== 0 || !this.downAt) return;
    const g = this.g, down = this.downAt; this.downAt = null;
    if (!this.active()) { g.drag = null; return; }
    const drag = g.drag; g.drag = null;
    if (drag) {
      const x0 = Math.min(drag.x0, drag.x1) + g.cam.x, x1 = Math.max(drag.x0, drag.x1) + g.cam.x;
      const y0 = Math.min(drag.y0, drag.y1) + g.cam.y, y1 = Math.max(drag.y0, drag.y1) + g.cam.y;
      g.select(g.world.unitsOf(g.pid).filter((u) => u.x >= x0 && u.x <= x1 && u.y >= y0 && u.y <= y1).map((u) => u.id), e.shiftKey);
    } else {
      const t = hitTest(g.world, down.wx, down.wy);
      if (e.shiftKey && t && g.selSet.has(t.id)) { g.selSet.delete(t.id); g.hud.panel(); }
      else g.select(t ? [t.id] : [], e.shiftKey);
    }
  }
  double(e) {
    if (!this.active()) return;
    const g = this.g; this.pointer(e); const t = hitTest(g.world, g.pointer.x + g.cam.x, g.pointer.y + g.cam.y);
    if (t?.kind !== 'unit' || t.owner !== g.pid) return;
    g.select(g.world.unitsOf(g.pid).filter((u) => u.type === t.type && u.x >= g.cam.x && u.x <= g.cam.x + g.canvas.width && u.y >= g.cam.y && u.y <= g.cam.y + g.canvas.height).map((u) => u.id), e.shiftKey);
  }
  key(e) {
    const g = this.g;
    if (!this.active() || textInput(e.target) || textInput(document.activeElement) || e.isComposing) { g.keys.clear(); return; }
    if (e.code === 'Tab' || e.altKey || e.metaKey || e.ctrlKey) {
      g.keys.clear();
      if (!(e.ctrlKey && !e.altKey && !e.metaKey && /^Digit[1-9]$/.test(e.code))) return;
    }
    if (CAMERA_KEYS.has(e.code)) { e.preventDefault(); g.keys.add(e.code); return; }
    if (/^(Arrow|Space|F1)/.test(e.code)) e.preventDefault();
    g.keys.add(e.code); if (e.repeat) return;
    if (/^Digit[1-9]$/.test(e.code)) {
      e.preventDefault(); const n = e.code.slice(5);
      if (e.ctrlKey) g.groups.set(n, g.selUnits().map((u) => u.id)); else g.select(g.groups.get(n) || []);
      return;
    }
    if (e.ctrlKey) return;
    if (e.code === 'KeyP') return g.togglePause();
    if (e.code === 'F1') return document.getElementById('btn-help').click();
    if (e.code === 'Space') return g.home();
    if (e.code === 'Escape') return g.cancelMode();
    const k = e.code.startsWith('Key') ? e.code.slice(3).toLowerCase() : '';
    if (k) g.hud.hotkey(k); // physical keys work with a Russian keyboard layout too
  }
  pan(dt) {
    const g = this.g;
    if (!this.active()) { this.reset(); return; }
    if (textInput(document.activeElement)) g.keys.clear();
    // Absolute minimap navigation has priority. Resume held keys on release, with no stored velocity.
    if (this.miniPointer !== null) return;
    const held = (a, b) => Number(g.keys.has(a) || g.keys.has(b));
    let dx = held('KeyD', 'ArrowRight') - held('KeyA', 'ArrowLeft');
    let dy = held('KeyS', 'ArrowDown') - held('KeyW', 'ArrowUp');
    const p = this.client, r = g.canvas.getBoundingClientRect();
    // Re-hit-test every frame: overlays can open over a stationary or captured pointer.
    if (p && g.pointer.inside && !this.downAt && !g.drag && document.elementFromPoint(p.x, p.y) === g.canvas) {
      dx += edgeAxis(p.x - r.left, r.width); dy += edgeAxis(p.y - r.top, r.height);
    }
    dx = clamp(dx, -1, 1); dy = clamp(dy, -1, 1);
    const length = Math.max(1, Math.hypot(dx, dy));
    g.cam.x += dx / length * CAMERA_SPEED * dt; g.cam.y += dy / length * CAMERA_SPEED * dt; g.clampCamera();
    // Keep the selection's starting world point fixed when panning with keys during a box drag.
    if (g.drag && this.downAt) { g.drag.x0 = this.downAt.wx - g.cam.x; g.drag.y0 = this.downAt.wy - g.cam.y; }
    // A stationary cursor now points at a different world position after camera movement.
    g.hoverId = p && g.pointer.inside && document.elementFromPoint(p.x, p.y) === g.canvas
      ? hitTest(g.world, g.pointer.x + g.cam.x, g.pointer.y + g.cam.y)?.id || 0 : 0;
  }
}
