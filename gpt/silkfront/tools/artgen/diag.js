// Diagnostic only: per-unit, per-state extents relative to the pivot, measured on an
// oversized canvas so nothing is clipped. Writes nothing to ART / ART_SRC.
process.env.SILK_DIAG = '1';
const { Resvg } = require('@resvg/resvg-js');
const C = require('./lib/core');
const { STATES, expand, lerpPose } = require('./lib/anim');
const { g, f } = require('./lib/shapes');
const { UNITS, frames } = require('./units/registry');

const W = 400, PX = 200, PY = 260;
for (const u of UNITS) {
  const row = [];
  for (const s of Object.keys(STATES)) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of frames(u, s)) {
      C.begin();
      const body = g(u.rig.figure(u.kit, p), `translate(${PX},${f(PY + (p.ty || 0))}) rotate(${f(p.rot || 0)})`);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}"><defs>${C.getDefs()}</defs>${body}</svg>`;
      const img = new Resvg(svg).render(), px = img.pixels;
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (px[(y * W + x) * 4 + 3] > 24) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    row.push(`${s}:L${PX - x0} R${x1 - PX} U${PY - y0} D${y1 - PY}`);
  }
  console.log(u.id.padEnd(22), row.join('  '));
}
