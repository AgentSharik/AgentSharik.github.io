// Five distinct human classes + hero Edric. Torso is drawn with the hip at the
// origin and "up" as -y; heads are drawn centred at the origin.
const { P } = require('../lib/palette');
const { sh, dk, lt } = require('../lib/core');
const { poly, pathD, circ, ell, line, g, light, rim, f } = require('../lib/shapes');
const W = require('../lib/weapons');
// Pass 02 surface helpers: inset moonlit facets / shade planes, never new contour.
const lit = (d, a = 0.2) => pathD(d, P.moon, 0, `opacity="${a}"`);
const shade = (d, a = 0.25) => pathD(d, P.ink, 0, `opacity="${a}"`);
const arc = (d, a = 0.55, w = 1) => pathD(d, 'none', 0, `stroke="${P.moon}" stroke-width="${w}" opacity="${a}" stroke-linecap="round"`);
const atW = (h, p, inner) => g(inner, `translate(${f(h.pos[0])},${f(h.pos[1])}) rotate(${f(-(p.wep ?? h.ang))})`);

const helmFace = (r, visor) => circ(0, 0, r, sh(P.steel), 1.3) + (visor ? line(-r * 0.2, -r * 0.05, r * 0.95, -r * 0.05, P.ink, 1.6) : '');
const tabard = (w, t, col, trim) => pathD(`M${-w * 0.42},${-t * 0.92} L${w * 0.5},${-t * 0.92} L${w * 0.45},4 L${w * 0.1},9 L${-w * 0.35},4 Z`, sh(col), 1.2) +
  line(-w * 0.35, 3.5, w * 0.45, 3.5, trim, 1);

// 1. SWORDSMAN — medium mail + bordeaux tabard, kettle helm, sword & kite shield
const swordsman = {
  name: 'swordsman', thigh: 10, shin: 10, torso: 17, headR: 5.4, sw: 12, aw: 4.6, lw: 5.4,
  upper: 9, fore: 9, limb: P.steel, leg: P.graphite, boot: P.leather, glove: P.steel,
  torsoD: () => pathD('M-6,-17 L7,-17 L8,-3 L6,2 L-6,2 L-7,-3Z', sh(P.steel), 1.3) + tabard(14, 17, P.bordeaux, P.gold) +
    lit('M-4.8,-14.8 L-1,-14.8 L-1.6,2 L-4.2,3.4Z', 0.16) + shade('M3,-14.8 L6.3,-14.8 L5.7,3.4 L3,5.8Z', 0.28) +
    line(0.6, -10, 0.2, 6, dk(P.bordeaux, 0.45), 0.9, 'opacity="0.8"') + line(-2.6, -6, -3, 3, dk(P.bordeaux, 0.45), 0.8, 'opacity="0.7"') +
    line(-6, -2, 7, -2, P.leather, 2.2) + line(-5, -2.6, 6, -2.6, P.moon, 0.5, 'opacity="0.35"') + circ(1, -2, 1.3, P.gold, 0.6) +
    rim('M-5,-16 L-6,-4', 0.5) + rim('M-5,-16.2 L6,-16.2', 0.4),
  headD: () => helmFace(5.4, true) + arc('M-3.8,-2.2 A4.4,4.4 0 0 1 0.6,-4.4', 0.6, 1.1) + ell(0, 3.4, 4, 1.2, P.ink, 0, 'opacity="0.3"') +
    pathD('M-8,1 Q0,-3 8,1 L7,2.5 Q0,-1 -7,2.5Z', sh(P.steelLit), 1.1),
  pauldron: (s) => ell(s[0], s[1] + 1, 4.6, 3.6, sh(P.steelLit), 1.2) + ell(s[0] - 1.2, s[1] - 0.4, 2.2, 1.2, P.moon, 0, 'opacity="0.4"') +
    ell(s[0] + 0.8, s[1] + 3, 3, 1, P.ink, 0, 'opacity="0.28"'),
  mail: true, kneePad: P.steelLit, elbowPad: P.steelLit,
  carry: { wep: 70 }, // idle/walk: blade angled forward, not into the ground
  nearItem: (h, p) => W.sword(h, p, 28, 4),
  farItem: (h) => W.kiteShield(h, {}, true) + g(shade('M1,-10.5 L7.5,-10.5 L7.5,2 Q7.5,10 0,15.5Z', 0.22) +
    rim('M-8,-11 L-8,2', 0.5) + rim('M-7.6,-11 L7.6,-11', 0.35) + circ(-0.8, -1.8, 1.1, P.moon, 0, 'opacity="0.6"'),
    `translate(${f(h.pos[0] + 2)},${f(h.pos[1] - 2)})`),
};

// 2. CROSSBOWMAN — slim, gambeson + leather, wide-brim chapel hat, quiver, crossbow levelled
const crossbowman = {
  name: 'crossbowman', thigh: 10.5, shin: 10.5, torso: 15.5, headR: 4.8, sw: 10, aw: 3.8, lw: 4.4,
  upper: 9, fore: 8.5, limb: lt(P.cloth, 0.15), leg: P.leather, boot: dk(P.leather, 0.3), glove: P.leather,
  behind: (J) => g(poly([[-3, -4], [3, -4], [4, 14], [-4, 14]], sh(P.leather), 1.1) + rim('M-2.2,-2.5 L-2.9,12.5', 0.5) + line(-3, 3, 3.3, 3, P.gold, 0.8, 'opacity="0.8"') +
    line(-2, -6, -2, -2, P.silver, 1) + line(0, -7, 0, -2, P.silver, 1) + line(2, -6, 2, -2, P.silver, 1), `translate(${J.neck[0] - 5},${J.neck[1] + 2}) rotate(-12)`),
  torsoD: () => pathD('M-5,-15.5 L6,-15.5 L6.5,1 L-5.5,1Z', sh(lt(P.cloth, 0.15)), 1.2) + lit('M-4,-14.5 L-1,-14.5 L-1.2,0 L-4.4,0Z', 0.14) + shade('M3.2,-14.5 L5.2,-14.5 L5.5,0 L3.2,0Z', 0.25) +
    line(-5, -11, 6, -11, dk(P.cloth, 0.3), 0.8) + line(-5, -6, 6, -6, dk(P.cloth, 0.3), 0.8) + line(0.5, -14.5, 0.6, 0, dk(P.cloth, 0.3), 0.6, 'opacity="0.7"') +
    pathD('M-4.2,-15.4 L5.2,-15.4 L3.6,-13 L0.5,-12 L-2.6,-13Z', sh('#b8ab92'), 0.7) +
    line(-6, -15, 6, 0, P.leather, 2) + line(-5.4, -14.6, 5.4, -0.8, P.moon, 0.4, 'opacity="0.35"') + line(-5, -1, 6, -1, P.leather, 2) + circ(0.5, -1, 0.8, P.goldLit, 0.4) + rim('M-4.4,-14.6 L-4.8,0', 0.5),
  headD: () => circ(0, 0, 4.8, sh('#c9a58a'), 1.2) + ell(0.5, 0.2, 3.2, 1.2, P.ink, 0, 'opacity="0.32"') + ell(0, -1.5, 9.5, 2.6, sh(P.graphite), 1.2) + arc('M-7.5,-2.2 Q-3,-3.9 2,-3.6', 0.5, 0.9) +
    pathD('M-4.5,-2 Q0,-9 4.5,-2Z', sh(P.graphite), 1.1) + ell(-1.4, -3.9, 1.6, 0.8, P.moon, 0, 'opacity="0.35"') + line(-4, -2.4, 4, -2.4, P.bordeaux, 0.9) + line(1.5, 0.8, 4.5, 0.8, P.ink, 1.2),
  carry: { wep: 115 },
  nearItem: (h, p) => W.crossbow(h, p) + atW(h, p, pathD('M-13.5,12.6 Q0,4.9 13.5,12.6', 'none', 0, `stroke="${P.moon}" stroke-width="0.8" opacity="0.55"`) +
    line(-1.3, -8.5, -1.3, 20.5, P.moon, 0.7, 'opacity="0.3"')),
};

// 3. PRIEST — long robe (no visible legs), hood, stole, staff with holy light
const robeHem = (sway) => `M-8,1 L9,1 L${11 + sway},20 L${-10 + sway},20 Z`;
const priest = {
  name: 'priest', thigh: 10, shin: 10, torso: 16, headR: 5, sw: 11, aw: 4.4, lw: 4.6,
  upper: 9, fore: 9, limb: P.silver, leg: P.cloth, boot: P.cloth, glove: lt(P.silver, 0.2),
  torsoD: (p) => { const sw = p.bob ? 0.8 : 0;
    return pathD(robeHem(sw), sh('#c8c2b4'), 1.3) + pathD('M-6,-16 L7,-16 L9,2 L-8,2Z', sh('#c8c2b4'), 1.3) +
      lit('M-6,3 L-3,3 L-4,19 L-8.2,19Z', 0.16) + shade(`M5,3 L8.6,3 L${f(10.6 + sw)},19 L5.5,19Z`, 0.28) +
      line(-3.5, 5, -5.2, 18.5, '#8f887a', 0.9, 'opacity="0.8"') + line(5.4, 5, 6.6, 18.5, '#8f887a', 0.9, 'opacity="0.8"') + line(-4.5, -13, -5.4, -1, '#8f887a', 0.7, 'opacity="0.6"') +
      pathD('M-1.5,-16 L2.5,-16 L3,19 L-1,19Z', sh(P.bordeaux), 1) + [-2, 4, 9, 14].map((y) => circ(0.9 + y * 0.012, y, 0.6, P.goldLit, 0)).join('') +
      line(-1, 17.6, 2.8, 17.6, P.gold, 0.8) + W.sun(0.8, -8, 2.4) + line(-8, 1, 9, 1, P.gold, 1.4) + rim('M-5,-15 L-7,1 L-9,19', 0.5); },
  headD: () => circ(0, 0.5, 4.4, sh('#c9a58a'), 1.1) + ell(1.4, -1.6, 2.4, 1.2, P.ink, 0, 'opacity="0.38"') +
    pathD('M-6,4 Q-7,-7 0,-7.5 Q7,-7 6.5,1 L4.5,3 Q3,-3 -2,-3 L-3,5Z', sh('#bcb5a5'), 1.2) + arc('M-5.2,2.5 Q-5.8,-5.6 0,-6.4', 0.55, 1) +
    shade('M-1.6,-2.4 Q3,-2.6 4.2,2.2 L4.5,3 Q3,-3 -2,-3Z', 0.35),
  noLegLit: true, mail: false,
  carry: { wep: 172 }, // staff upright, light on top
  nearItem: (h, p) => W.staff(h, p, p.cast ?? 0.3),
  fx: (J, p) => (p.cast ? light(J.fH[0], J.fH[1], 8 + 14 * p.cast, P.holy, 0.6 * p.cast) : ''),
};

// 4. MONSTER HUNTER — bulky, fur mantle, leather + rivets, beak-mask, harpoon-axe, trophies
const hunter = {
  name: 'monster_hunter', thigh: 11, shin: 10, torso: 18, headR: 5.4, sw: 16, aw: 5.6, lw: 6.4,
  upper: 9.5, fore: 9.5, limb: P.leather, leg: dk(P.leather, 0.2), boot: P.graphite, glove: P.graphite, bootS: 1.2,
  behind: (J) => g(pathD('M-10,-4 Q-14,10 -8,22 L4,22 Q6,8 2,-4Z', sh(P.wood), 1.2) + line(-9, 12, 3, 12, P.steel, 1.4) + circ(-3, 6, 2.4, sh(P.bone), 0.9), `translate(${J.neck[0]},${J.neck[1]})`),
  torsoD: () => pathD('M-8,-18 L9,-18 L10,1 L-8,1Z', sh(P.leather), 1.4) + lit('M-6.6,-16.5 L-2,-16.5 L-2.5,0 L-6.8,0Z', 0.14) + shade('M5,-16.5 L8.4,-16.5 L9,0 L5.2,0Z', 0.28) +
    line(-8, -6, 10, -6, P.graphite, 2.4) + line(-8, -1, 10, -1, P.graphite, 2.4) + line(-7.4, -6.8, 9.4, -6.8, P.moon, 0.5, 'opacity="0.3"') +
    [-5, 0, 5].map((x) => circ(x, -6, 0.9, P.goldLit, 0.4) + circ(x - 0.3, -6.3, 0.3, P.holy, 0)).join('') + [-4, 3].map((x) => circ(x, -1, 0.7, P.goldLit, 0.3)).join('') +
    pathD('M-11,-17 Q0,-24 12,-17 Q9,-11 0,-12 Q-8,-11 -11,-17Z', sh(lt('#6b5b4b', 0.18)), 1.2) +
    [-8, -5, -2, 1, 4, 7, 9.5].map((x, i) => line(x, -17.6 + Math.abs(x) * 0.06, x + 0.8, -14.6 + (i % 2) * 0.5, i % 2 ? dk('#6b5b4b', 0.35) : lt('#6b5b4b', 0.45), 0.7, 'opacity="0.85"')).join('') +
    arc('M-8.6,-17.4 Q0,-22.2 9.5,-17.6', 0.45, 0.9) +
    line(-8, -16, 9, -2, P.graphite, 2) + [0, 4].map((i) => poly([[-4 + i, -11 + i], [-2 + i, -10 + i], [-3 + i, -6 + i]], lt(P.bone, 0.25), 0.6)).join('') + rim('M-6.8,-11 L-6.8,0', 0.45),
  headD: () => circ(0, 0, 5.4, sh(P.graphite), 1.3) + ell(0.5, -1.6, 3.6, 1.1, P.ink, 0, 'opacity="0.3"') + pathD('M2,-2 L10,1.5 L2,3Z', sh(P.leather), 1.1) + line(3, -1.2, 7.8, 1, P.moon, 0.5, 'opacity="0.45"') +
    circ(2.4, -1, 1.6, P.amber, 0.7) + circ(2, -1.4, 0.5, P.holy, 0) + ell(0, -4.5, 7.5, 2.2, sh(P.graphite), 1.1) + arc('M-5.6,-5.4 Q-1,-6.4 3,-6', 0.5, 0.8),
  pauldron: (s) => ell(s[0], s[1] + 1, 5.2, 4, sh(lt('#6b5b4b', 0.18)), 1.2) + ell(s[0] - 1.2, s[1] - 0.4, 2.6, 1.4, P.moon, 0, 'opacity="0.3"') +
    [-2.5, 0, 2.5].map((x) => line(s[0] + x, s[1] + 1.2, s[0] + x + 0.6, s[1] + 3.4, dk('#6b5b4b', 0.35), 0.6)).join(''),
  kneePad: P.steel, elbowPad: P.leather,
  carry: { wep: 165 }, // polearm upright, axe head up
  nearItem: (h, p) => W.harpoonAxe(h, p),
};

// 5. KNIGHT OF THE LAST LIGHT — tallest regular, full plate, great helm with crest plume, sun on chest, greatsword, cape
const knight = {
  name: 'knight', thigh: 11.5, shin: 11.5, torso: 19, headR: 5.8, sw: 15, aw: 5.4, lw: 6,
  upper: 10, fore: 10, limb: P.steelLit, leg: P.steel, boot: P.steel, glove: P.steel, bootS: 1.15,
  behind: (J) => g(pathD('M-7,-2 L7,-2 Q12,18 10,32 Q0,28 -10,33 Q-12,16 -7,-2Z', sh(P.bordeaux), 1.3) +
    line(-3, 2, -5, 28, dk(P.bordeaux, 0.45), 1, 'opacity="0.8"') + line(3, 2, 4.5, 27, dk(P.bordeaux, 0.45), 1, 'opacity="0.8"') + line(-1, 4, -1.6, 27, lt(P.bordeaux, 0.25), 0.8, 'opacity="0.6"') +
    rim('M-7.5,1 Q-10.5,16 -9,30', 0.4), `translate(${J.neck[0] - 3},${J.neck[1]})`),
  torsoD: () => pathD('M-7.5,-19 L8.5,-19 L9,-4 L6,2 L-6,2 L-7.5,-4Z', sh(P.silver), 1.4) + lit('M-6.4,-17.8 L0.6,-17.8 L0.6,-4 L-6.2,-4Z', 0.22) +
    shade('M1.4,-17.8 L7.6,-17.8 L8,-4.4 L1.4,-4.4Z', 0.22) + line(1, -18, 1, -15.4, P.moon, 0.9, 'opacity="0.7"') + line(1, -6.6, 1, -4, P.moon, 0.9, 'opacity="0.7"') + W.sun(1, -11, 3.4) +
    pathD('M-7,-3 L9,-3 L10,6 L-8,6Z', sh(P.steel), 1.2) + line(-7, 1.5, 9, 1.5, P.ink, 0.8) +
    line(-6.6, -2.3, 8.6, -2.3, P.moon, 0.6, 'opacity="0.5"') + line(-7.2, 2.2, 9.2, 2.2, P.moon, 0.6, 'opacity="0.45"') + shade('M-7.4,4 L9.6,4 L9.8,5.4 L-7.6,5.4Z', 0.3) +
    rim('M-6,-18 L-7,-5', 0.6) + rim('M-6.4,-18.2 L7.6,-18.2', 0.45),
  headD: () => pathD('M-5.5,-6 L5.8,-6 L6.5,5.5 L-5.5,5.5Z', sh(P.silver), 1.3) + lit('M-4.6,-4.8 L-1,-4.8 L-1,4.4 L-4.6,4.4Z', 0.2) + shade('M3.4,1 L5.8,1 L6.1,4.6 L3.4,4.6Z', 0.25) +
    line(-1, -0.5, 6.5, -0.5, P.ink, 1.8) + line(2.5, 1.5, 2.5, 5, P.ink, 0.9) + rim('M-4.7,-4.6 L-4.7,4.4', 0.6) +
    pathD('M-3,-6 Q-6,-17 4,-15 Q-1,-12 1,-6Z', sh(P.bordeauxLit), 1.1) + poly([[-6, -6.5], [6.5, -6.5], [6, -5], [-6, -5]], sh(P.gold), 0.8),
  pauldron: (s) => pathD(`M${s[0] - 6},${s[1] - 1} Q${s[0]},${s[1] - 8} ${s[0] + 6.5},${s[1] - 1} L${s[0] + 5},${s[1] + 4} L${s[0] - 5},${s[1] + 4}Z`, sh(P.silver), 1.2) +
    arc(`M${s[0] - 4.6},${s[1] - 1.2} Q${s[0] - 0.4},${s[1] - 5.2} ${s[0] + 3.2},${s[1] - 2.8}`, 0.6, 1) + shade(`M${s[0] + 1.5},${s[1] + 2.6} L${s[0] + 4.6},${s[1] + 2.6} L${s[0] + 4.3},${s[1] + 3.4} L${s[0] + 1.5},${s[1] + 3.4}Z`, 0.3) +
    line(s[0] - 5, s[1] + 2, s[0] + 5, s[1] + 2, P.gold, 1),
  kneePad: P.silver, elbowPad: P.silver,
  carry: { wep: 170 }, // greatsword held upright in guard
  nearItem: (h, p) => W.greatsword(h, p),
  fArmHidden: true,
};

module.exports = { swordsman, crossbowman, priest, hunter, knight };
