// Grid A* (8-neighbour, no corner cutting) + line-of-sight smoothing.
// The grid is `blocked: Uint8Array(w*h)` (1 = building/tree/mine).
import { TILE } from './data.js';

export class PathFinder {
  constructor(w, h, blocked) {
    this.w = w; this.h = h; this.blocked = blocked;
    const n = w * h;
    this.g = new Float32Array(n); this.par = new Int32Array(n);
    this.stamp = new Uint32Array(n); this.closed = new Uint32Array(n); this.gen = 0;
    this.heap = []; // [f, idx]
  }
  free(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h && !this.blocked[y * this.w + x]; }

  // sx,sy,gx,gy: world px. done(cx,cy) → true when a tile centre (world px) counts as arrived.
  // Returns array of world points (tile centres), possibly ending at the closest reachable tile.
  find(sx, sy, gx, gy, done, maxNodes = 6000) {
    const W = this.w, st = Math.floor(sx / TILE), sr = Math.floor(sy / TILE);
    const tgx = gx / TILE - 0.5, tgy = gy / TILE - 0.5;
    const hfun = (x, y) => { const dx = Math.abs(x - tgx), dy = Math.abs(y - tgy); return Math.max(dx, dy) + 0.4142 * Math.min(dx, dy); };
    if (++this.gen > 4e9) { this.gen = 1; this.stamp.fill(0); this.closed.fill(0); }
    const gen = this.gen, heap = this.heap; heap.length = 0;
    const start = sr * W + st;
    if (st < 0 || sr < 0 || st >= W || sr >= this.h) return [];
    this.g[start] = 0; this.par[start] = -1; this.stamp[start] = gen;
    push(heap, hfun(st, sr), start);
    let best = start, bestH = hfun(st, sr), expanded = 0, goal = -1;
    while (heap.length) {
      const cur = pop(heap)[1];
      if (this.closed[cur] === gen) continue;
      this.closed[cur] = gen;
      const cx = cur % W, cy = (cur / W) | 0;
      if (done((cx + 0.5) * TILE, (cy + 0.5) * TILE)) { goal = cur; break; }
      const hh = hfun(cx, cy); if (hh < bestH) { bestH = hh; best = cur; }
      if (++expanded > maxNodes) break;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy;
        if (!this.free(nx, ny)) continue;
        if (dx && dy && (!this.free(cx + dx, cy) || !this.free(cx, cy + dy))) continue; // no corner cutting
        const ni = ny * W + nx, ng = this.g[cur] + (dx && dy ? 1.4142 : 1);
        if (this.closed[ni] === gen) continue;
        if (this.stamp[ni] !== gen || ng < this.g[ni]) {
          this.stamp[ni] = gen; this.g[ni] = ng; this.par[ni] = cur;
          push(heap, ng + hfun(nx, ny), ni);
        }
      }
    }
    let end = goal >= 0 ? goal : best;
    const out = [];
    while (end >= 0 && end !== start) { out.push({ x: (end % W + 0.5) * TILE, y: (((end / W) | 0) + 0.5) * TILE }); end = this.par[end]; }
    out.reverse();
    return this.smooth(sx, sy, out);
  }

  // Line of sight in world px, sampled every 8 px with unit-radius margin checks.
  los(ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 8);
    for (let i = 1; i <= n; i++) {
      const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
      for (const [ox, oy] of [[0, 0], [9, 0], [-9, 0], [0, 9], [0, -9]])
        if (!this.free(Math.floor((x + ox) / TILE), Math.floor((y + oy) / TILE))) return false;
    }
    return true;
  }
  smooth(sx, sy, pts) {
    if (pts.length < 2) return pts;
    const out = []; let ax = sx, ay = sy, i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !this.los(ax, ay, pts[j].x, pts[j].y)) j--;
      out.push(pts[j]); ax = pts[j].x; ay = pts[j].y; i = j + 1;
    }
    return out;
  }
}

function push(h, f, v) { h.push([f, v]); let i = h.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } }
function pop(h) {
  const top = h[0], last = h.pop();
  if (h.length) { h[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i;
    if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r;
    if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } }
  return top;
}
