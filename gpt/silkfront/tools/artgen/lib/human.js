// Human 3/4 rig. A class "kit" supplies proportions, colours and part drawers;
// pose() supplies joint angles per animation state. Angles: degrees from straight
// down, positive = toward the facing direction (+x). 180 = straight up.
const { P } = require('./palette');
const { seg, ell, circ, line, g, shadow, polar, f, OL } = require('./shapes');
const { dk, sh, addDef, id } = require('./core');

function rigJoints(k, p) {
  const leg = k.thigh + k.shin;
  const hip = [p.dx || 0, -leg * 0.97 + (p.bob || 0)];
  const L = (th, sh) => { const kn = polar(hip[0], hip[1], k.thigh, th); return [kn, polar(kn[0], kn[1], k.shin, sh)]; };
  const [nK, nF] = L(p.nLeg[0], p.nLeg[1]);
  const [fK, fF] = L(p.fLeg[0], p.fLeg[1]);
  const up = 180 - (p.lean || 0);
  const neck = polar(hip[0], hip[1], k.torso, up);
  const head = polar(neck[0], neck[1], k.headR * 0.9 + 1.5, up);
  const nS = [neck[0] + k.sw * 0.45, neck[1] + 3], fS = [neck[0] - k.sw * 0.3, neck[1] + 2];
  const A = (s, a) => { const e = polar(s[0], s[1], k.upper, a[0]); return [e, polar(e[0], e[1], k.fore, a[1])]; };
  const [nE, nH] = A(nS, p.nArm), [fE, fH] = A(fS, p.fArm);
  return { hip, nK, nF, fK, fF, neck, head, nS, fS, nE, nH, fE, fH };
}

const boot = (x, y, c, s = 1) => `<path d="M${f(x - 3.2 * s)},${f(y - 4 * s)} L${f(x + 2 * s)},${f(y - 4 * s)} L${f(x + 6 * s)},${f(y - 0.6 * s)} ` +
  `L${f(x + 6 * s)},${f(y + 1)} L${f(x - 3.5 * s)},${f(y + 1)}Z" fill="${c}" stroke="${OL}" stroke-width="1.2" stroke-linejoin="round"/>`;

function limb(a, b, c, w1, w2, col) { return seg(a[0], a[1], b[0], b[1], w1, w2, col) + seg(b[0], b[1], c[0], c[1], w2, w2 * 0.85, col); }

// Surface pass 02: cold moon edge (top-left), shade side, optional mail and a joint pad.
// Everything is inset inside the limb outline drawn by limb(), so silhouette and rig stay identical.
function limbLit(a, b, c, w1, w2, k, padCol) {
  const side = (p, q, half, sgn, col, op) => {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    let nx = -dy / L, ny = dx / L;
    if (nx > 0 || (nx === 0 && ny > 0)) { nx = -nx; ny = -ny; }
    const o = half * 0.55 * sgn, t = 0.16;
    return line(p[0] + dx * t + nx * o, p[1] + dy * t + ny * o, q[0] - dx * t + nx * o, q[1] - dy * t + ny * o, col, f(half * 0.35), `opacity="${op}"`);
  };
  const mail = (p, q) => line(p[0] + (q[0] - p[0]) * 0.18, p[1] + (q[1] - p[1]) * 0.18, q[0] - (q[0] - p[0]) * 0.18, q[1] - (q[1] - p[1]) * 0.18,
    P.ink, 0.7, 'opacity="0.4" stroke-dasharray="0.7 0.9"');
  let s = side(a, b, w2 / 2, 1, P.moon, 0.5) + side(b, c, w2 * 0.85 / 2, 1, P.moon, 0.45) +
    side(a, b, w2 / 2, -1, P.ink, 0.3) + side(b, c, w2 * 0.85 / 2, -1, P.ink, 0.3);
  if (k.mail) s += mail(a, b) + mail(b, c);
  if (padCol) { const r = w1 * 0.3;
    s += circ(b[0], b[1], r, sh(padCol), 0.6) + circ(b[0] - r * 0.3, b[1] - r * 0.3, r * 0.38, P.moon, 0, 'opacity="0.55"'); }
  // Hard guarantee: clip the overlay to the limb's own fill geometry (same path as limb()).
  const cid = id('lc');
  addDef(`<clipPath id="${cid}">${limb(a, b, c, w1, w2, '#000')}</clipPath>`);
  return g(s, '', `clip-path="url(#${cid})"`);
}
// Inset contact shade under the head and at the torso/thigh join (torso-local coordinates).
const torsoShade = (k) => ell(0.5, -k.torso + 2, k.sw * 0.28, 1.5, P.ink, 0, 'opacity="0.3"') +
  ell(0.5, -1, k.sw * 0.32, 1.1, P.ink, 0, 'opacity="0.25"');

/** Returns SVG markup of the figure with feet at (0,0). */
function figure(k, p) {
  const J = rigJoints(k, p);
  const hands = { n: { pos: J.nH, ang: p.nArm[1] }, f: { pos: J.fH, ang: p.fArm[1] } };
  const farCol = dk(k.limb, 0.25), farLeg = dk(k.leg, 0.25);
  // Same contact shadow as the spider rig (shared shadow(), same opacity) at the ground pivot.
  let s = p.rot ? '' : shadow((p.dx || 0) + 1, 0.5, k.sw * 0.95, 3.4);
  s += k.behind ? k.behind(J, p) : '';
  s += limb(J.fS, J.fE, J.fH, k.aw, k.aw * 0.8, farCol) + circ(J.fH[0], J.fH[1], k.aw * 0.55, dk(k.glove, 0.2), 1.1);
  s += k.farItem && k.farBehind ? k.farItem(hands.f, p) : '';
  s += limb(J.hip, J.fK, J.fF, k.lw, k.lw * 0.8, farLeg) + boot(J.fF[0], J.fF[1], dk(k.boot, 0.25), k.bootS || 1);
  s += k.back ? g(k.back(p), `translate(${f(J.hip[0])},${f(J.hip[1])}) rotate(${f(p.lean || 0)})`) : '';
  s += limb(J.hip, J.nK, J.nF, k.lw, k.lw * 0.8, k.leg) + boot(J.nF[0], J.nF[1], k.boot, k.bootS || 1);
  s += k.noLegLit ? '' : limbLit(J.hip, J.nK, J.nF, k.lw, k.lw * 0.8, {}, k.kneePad);
  s += g(k.torsoD(p) + torsoShade(k), `translate(${f(J.hip[0])},${f(J.hip[1])}) rotate(${f(p.lean || 0)})`);
  s += g(k.headD(p), `translate(${f(J.head[0])},${f(J.head[1])}) rotate(${f((p.lean || 0) * 0.6 + (p.headTilt || 0))})`);
  s += k.farItem && !k.farBehind ? k.farItem(hands.f, p) : '';
  s += k.nearItemBehind ? k.nearItem(hands.n, p) : '';
  s += limb(J.nS, J.nE, J.nH, k.aw, k.aw * 0.8, k.limb) + limbLit(J.nS, J.nE, J.nH, k.aw, k.aw * 0.8, k, k.elbowPad) +
    (k.pauldron ? k.pauldron(J.nS, p) : '');
  s += circ(J.nH[0], J.nH[1], k.aw * 0.55, k.glove, 1.1);
  s += k.nearItem && !k.nearItemBehind ? k.nearItem(hands.n, p) : '';
  s += k.fx ? k.fx(J, p) : '';
  return s;
}

module.exports = { figure, rigJoints, boot };
