// Spider 3/4 rig. Same contract as the human rig: ground pivot at (0,0), facing +x.
// Legs are solved with 2-bone IK (knee always bends up, like a real arachnid) onto
// foot targets laid out on a foreshortened ground ellipse (camera ~50°, y squash 0.45).
const { P } = require('./palette');
const { seg, ell, circ, line, g, shadow, f, OL, pathD } = require('./shapes');
const { dk, lt, sh, rng } = require('./core');

const SQ = 0.45; // ground-plane foreshortening for the RTS camera
const PAIR_ANG = [38, 78, 116, 152]; // foot directions (deg from +x) for leg pairs 1..4

function ik(r, ft, a, b) {
  const dx = ft[0] - r[0], dy = ft[1] - r[1];
  let d = Math.hypot(dx, dy); const dm = Math.min(d, (a + b) * 0.98); d = dm || 1;
  const base = Math.atan2(dy, dx), cosA = (a * a + d * d - b * b) / (2 * a * d);
  const off = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const k1 = [r[0] + Math.cos(base + off) * a, r[1] + Math.sin(base + off) * a];
  const k2 = [r[0] + Math.cos(base - off) * a, r[1] + Math.sin(base - off) * a];
  return k1[1] < k2[1] ? k1 : k2; // knee up
}

// Gait: alternating tetrapod (L1 R2 L3 R4 vs R1 L2 R3 L4).
function footTarget(k, side, i, p) {
  const ang = (PAIR_ANG[i] * Math.PI) / 180, R = k.reach * (i === 0 ? 1.05 : 1);
  let x = k.cx * 0.2 + Math.cos(ang) * R, y = side * Math.sin(ang) * R * SQ;
  const grp = (i + (side > 0 ? 1 : 0)) % 2;
  const ph = (p.legT || 0) * Math.PI * 2 + grp * Math.PI;
  x += Math.sin(ph) * (p.stride || 0);
  let lift = Math.max(0, Math.cos(ph)) * (p.lift || 0) * ((p.stride || 0) > 0 ? 1 : 0);
  if (i === 0 && p.rear) { x += p.rear * k.reach * 0.25; lift += p.rear * k.reach * 0.9; }
  if (i === 1 && p.rear) { lift += p.rear * k.reach * 0.25; }
  y -= lift;
  if (p.curl) { const c = p.curl; x = x + (k.cx * 0.3 - x) * c * 0.75; y = y + (-k.H * 0.9 - y) * c * 0.8; }
  return [x + (p.dx || 0), y];
}

function leg(k, root, foot, near, rnd) {
  const a = k.femur, b = k.tibia;
  const knee = ik(root, foot, a, b);
  const out = Math.sign(foot[0] - root[0]) || 1;
  const ank = [knee[0] + (foot[0] - knee[0]) * 0.62 + out * 1.5, knee[1] + (foot[1] - knee[1]) * 0.62 - 1];
  const c = near ? k.legCol : dk(k.legCol, 0.35), w = k.legW * (near ? 1 : 0.9);
  let s = seg(root[0], root[1], knee[0], knee[1], w * 1.15, w, sh(c), 1.2);
  s += seg(knee[0], knee[1], ank[0], ank[1], w * 0.9, w * 0.62, sh(c), 1.1);
  s += seg(ank[0], ank[1], foot[0], foot[1], w * 0.55, w * 0.18, sh(dk(c, 0.15)), 1);
  s += circ(knee[0], knee[1], w * 0.62, sh(k.jointCol || lt(c, 0.15)), 1);
  s += circ(ank[0], ank[1], w * 0.42, sh(k.jointCol || lt(c, 0.1)), 0.9);
  // Narrow reflected facets stay inside the existing limb and joint outlines.
  const facet = near ? P.moonHalo : P.fog;
  s += line(root[0] * 0.2 + knee[0] * 0.8, root[1] * 0.2 + knee[1] * 0.8,
    root[0] * 0.75 + knee[0] * 0.25, root[1] * 0.75 + knee[1] * 0.25, facet, w * 0.19, 'opacity="0.5"');
  s += line(knee[0] * 0.78 + ank[0] * 0.22, knee[1] * 0.78 + ank[1] * 0.22,
    knee[0] * 0.3 + ank[0] * 0.7, knee[1] * 0.3 + ank[1] * 0.7, facet, w * 0.15, near ? 'opacity="0.42"' : 'opacity="0.28"');
  s += circ(knee[0] - w * 0.12, knee[1] - w * 0.16, w * 0.22, P.moonHalo, 0, 'opacity="0.65"');
  s += circ(ank[0] - w * 0.08, ank[1] - w * 0.1, w * 0.14, P.moonHalo, 0, 'opacity="0.5"');
  if (k.bands) { // pale rings on the tibia: species marking, reads at small size
    const t = 0.45; s += line(knee[0] + (ank[0] - knee[0]) * t - 1.5, knee[1] + (ank[1] - knee[1]) * t, knee[0] + (ank[0] - knee[0]) * t + 1.5, knee[1] + (ank[1] - knee[1]) * t, k.bands, w * 0.35, 'opacity="0.8"');
  }
  if (k.hair && near) for (let j = 0; j < 3; j++) { const t = 0.25 + j * 0.25, x = root[0] + (knee[0] - root[0]) * t, y = root[1] + (knee[1] - root[1]) * t; s += line(x, y - w * 0.4, x + out * (1 + rnd() * 1.5), y - w * 0.4 - 2 - rnd() * 2, lt(c, 0.25), 0.7); }
  return s;
}

/**
 * Kit fields: H (body height), cx (cephalothorax x), reach, femur, tibia, legW, legCol,
 * abdomen(p), thorax(p), head(p) drawers (local origin = their own centre), optional
 * back/front/fx. Pose: bob, legT, stride, lift, lean (deg, + = nose down), rear, curl,
 * rot (death roll), hurt, dead, jaw (0..1), sac (0..1 spitter swell).
 */
function figure(k, p) {
  const rnd = rng(k.seed || 7);
  const by = -k.H + (p.bob || 0) + (p.dead ? k.H * 0.55 : 0);
  const bx = p.dx || 0;
  const tr = `translate(${f(bx)},${f(by)}) rotate(${f(p.lean || 0)})`;
  const roots = [];
  for (let i = 0; i < 4; i++) roots.push([bx + k.cx - 2 + i * (k.rootStep || -2.4), by + 1.5]);
  const rootsFar = roots.map((r) => [r[0] - 1, r[1] - 2.5]);
  let s = shadow(bx + k.cx * 0.2 - 2, 0, k.reach * 0.95, k.reach * 0.42 * SQ + 2.5);
  s += ell(bx + k.cx * 0.2 - 2, 0, k.reach * 0.48, k.reach * 0.11 + 1, P.ink, 0, 'opacity="0.22"');
  // far legs (screen-up = away from camera)
  for (let i = 3; i >= 0; i--) s += leg(k, rootsFar[i], footTarget(k, -1, i, p), false, rnd);
  s += k.back ? g(k.back(p), tr) : '';
  s += g(g(k.abdomen(p), `translate(${f(k.ax)},${f(k.ay || -2)})`) + g(k.thorax(p), `translate(${f(k.cx)},0)`) +
    g(k.head(p), `translate(${f(k.hx)},${f(k.hy || 1)})`), tr);
  for (let i = 3; i >= 0; i--) s += leg(k, roots[i], footTarget(k, 1, i, p), true, rnd);
  s += k.front ? g(k.front(p), tr) : '';
  s += k.fx ? k.fx(p, bx, by) : '';
  return s;
}

// --- shared anatomy helpers -----------------------------------------------------
// Segmented abdomen with silk-rune marking (colony glyph, not a hourglass copy)
function abdomen(rx, ry, col, mark, glowC) {
  let s = ell(0, 0, rx, ry, sh(col), 1.5);
  for (let i = 1; i <= 3; i++) s += pathD(`M${f(-rx * 0.15 - i * rx * 0.2)},${f(-ry * 0.92)} Q${f(-rx * 0.3 - i * rx * 0.22)},0 ${f(-rx * 0.15 - i * rx * 0.2)},${f(ry * 0.9)}`, 'none', 0, `stroke="${dk(col, 0.45)}" stroke-width="1"`);
  s += ell(-rx * 0.15, -ry * 0.45, rx * 0.55, ry * 0.28, lt(col, 0.3), 0, 'opacity="0.65"');
  s += pathD(`M${f(-rx * 0.75)},${f(-ry * 0.38)} Q${f(-rx * 0.4)},${f(-ry * 0.82)} ${f(rx * 0.2)},${f(-ry * 0.68)} L${f(rx * 0.48)},${f(-ry * 0.38)} Q0,${f(-ry * 0.54)} ${f(-rx * 0.75)},${f(-ry * 0.38)}Z`, P.moonHalo, 0, 'opacity="0.22"');
  s += pathD(`M${f(-rx * 0.7)},${f(ry * 0.42)} Q0,${f(ry * 0.83)} ${f(rx * 0.7)},${f(ry * 0.34)} Q${f(rx * 0.4)},${f(ry * 0.75)} 0,${f(ry * 0.8)}Z`, P.ink, 0, 'opacity="0.24"');
  if (mark) s += pathD(`M${f(-rx * 0.1)},${f(-ry * 0.55)} L${f(rx * 0.15)},${f(-ry * 0.1)} L${f(-rx * 0.1)},${f(ry * 0.35)} L${f(-rx * 0.35)},${f(-ry * 0.1)}Z`, mark, 0.8);
  if (glowC) s += ell(-rx * 0.1, -ry * 0.1, rx * 0.12, ry * 0.12, glowC, 0) ;
  s += ell(-rx * 0.85, ry * 0.15, rx * 0.12, ry * 0.18, dk(col, 0.4), 0.8); // spinnerets
  return s;
}
// Eye cluster: 2 large + 4 small, team-readable glow
function eyes(x, y, s, c) {
  return [[0, 0, 1], [-2.2, -0.6, 1], [1.6, -1.8, 0.6], [-1, -2.2, 0.6], [2.6, 0.6, 0.5], [-3.4, -1.6, 0.5]]
    .map(([dx, dy, r]) => circ(x + dx * s, y + dy * s, r * s * 0.95, c, 0.5) + circ(x + dx * s - r * s * 0.3, y + dy * s - r * s * 0.3, r * s * 0.3, '#fff', 0, 'opacity="0.8"')).join('');
}

module.exports = { figure, abdomen, eyes, SQ, ik };
