// Drawing primitives shared by every generator.
const { P } = require('./palette');
const { glow } = require('./core');

const OL = P.ink;       // universal dark outline: keeps sprites readable on any ground
const f = (n) => Math.round(n * 100) / 100;

// Tapered limb from (x1,y1) width w1 to (x2,y2) width w2 with rounded ends.
function seg(x1, y1, x2, y2, w1, w2, fill, ow = 1.4) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const a = [x1 + nx * w1 / 2, y1 + ny * w1 / 2], b = [x2 + nx * w2 / 2, y2 + ny * w2 / 2];
  const c = [x2 - nx * w2 / 2, y2 - ny * w2 / 2], d = [x1 - nx * w1 / 2, y1 - ny * w1 / 2];
  return `<path d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])} A${f(w2 / 2)},${f(w2 / 2)} 0 0 1 ${f(c[0])},${f(c[1])} ` +
    `L${f(d[0])},${f(d[1])} A${f(w1 / 2)},${f(w1 / 2)} 0 0 1 ${f(a[0])},${f(a[1])}Z" fill="${fill}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round"/>`;
}
const poly = (pts, fill, ow = 1.4, extra = '') =>
  `<path d="M${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' L')}Z" fill="${fill}" stroke="${OL}" stroke-width="${ow}" stroke-linejoin="round" ${extra}/>`;
const pathD = (d, fill, ow = 1.4, extra = '') =>
  `<path d="${d}" fill="${fill}" ${/\bstroke=/.test(extra) ? '' : `stroke="${ow ? OL : 'none'}"`} ${/\bstroke-width=/.test(extra) ? '' : `stroke-width="${ow}"`} stroke-linejoin="round" ${extra}/>`;
const ell = (cx, cy, rx, ry, fill, ow = 1.4, extra = '') =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" ${/\bstroke=/.test(extra) ? '' : `stroke="${ow ? OL : 'none'}"`} ${/\bstroke-width=/.test(extra) ? '' : `stroke-width="${ow}"`} ${extra}/>`;
const circ = (cx, cy, r, fill, ow = 1.4, extra = '') => ell(cx, cy, r, r, fill, ow, extra);
const line = (x1, y1, x2, y2, c, w = 1, extra = '') =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const g = (inner, tr = '', extra = '') => `<g${tr ? ` transform="${tr}"` : ''} ${extra}>${inner}</g>`;

// Soft contact shadow under every unit / building (same opacity everywhere = unified lighting).
const shadow = (cx, cy, rx, ry) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="#000" opacity="0.38"/>`;
// Coloured light pool (torch, bioluminescence)
const light = (cx, cy, r, c, a = 0.8) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${glow(c, a)}"/>`;
// Rim highlight stroke from moonlight (top-left)
const rim = (d, a = 0.35) => `<path d="${d}" fill="none" stroke="${P.moon}" stroke-width="1" opacity="${a}" stroke-linecap="round"/>`;

// Point along polar direction measured from straight down (+ = toward +x)
const polar = (x, y, len, deg) => { const r = (deg * Math.PI) / 180; return [x + Math.sin(r) * len, y + Math.cos(r) * len]; };

module.exports = { OL, f, seg, poly, pathD, ell, circ, line, g, shadow, light, rim, polar };
