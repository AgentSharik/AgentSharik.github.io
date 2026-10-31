// Hand-held props for the human rig. Each receives hand = {pos, ang} and pose p.
// p.wep (if set) overrides the weapon angle so attack arcs read clearly.
const { P } = require('./palette');
const { sh } = require('./core');
const { poly, pathD, circ, ell, line, g, light, f, polar } = require('./shapes');

const at = (h, p, inner, off = 0) => g(inner, `translate(${f(h.pos[0])},${f(h.pos[1])}) rotate(${f(-(p.wep ?? h.ang) + off)})`);

// Blades are drawn pointing +y (down) in local space, then rotated.
function sword(h, p, len = 30, w = 4.2, col = P.steelLit) {
  return at(h, p, poly([[-w / 2, 3], [w / 2, 3], [w / 2, len - 5], [0, len], [-w / 2, len - 5]], sh(col), 1.2) +
    line(0, 5, 0, len - 6, P.silver, 0.8, 'opacity="0.7"') +
    poly([[-7, 1], [7, 1], [7, 3.5], [-7, 3.5]], sh(P.gold), 1) +
    poly([[-1.6, -8], [1.6, -8], [1.6, 1], [-1.6, 1]], P.leather, 1) + circ(0, -9, 2.2, sh(P.gold), 1));
}
function greatsword(h, p) { return sword(h, p, 44, 6, P.silver); }

function crossbow(h, p) {
  const fire = p.fire;
  const inner = poly([[-2.5, -10], [2.5, -10], [2.5, 22], [-2.5, 22]], sh(P.wood), 1.2) +
    pathD('M-15,14 Q0,6 15,14', 'none', 0, `stroke="${P.ink}" stroke-width="4.5"`) +
    pathD('M-15,14 Q0,6 15,14', 'none', 0, `stroke="${P.steel}" stroke-width="2.6"`) +
    line(-15, 14, fire ? 0 : 0, fire ? 9 : -2, P.silkDim, 0.8) + line(15, 14, 0, fire ? 9 : -2, P.silkDim, 0.8) +
    (fire ? '' : poly([[-1, -2], [1, -2], [1, 26], [0, 30], [-1, 26]], P.steelLit, 0.8)) +
    circ(0, 2, 2.2, sh(P.gold), 0.9);
  return at(h, p, inner);
}

function staff(h, p, glowOn = 0.4) {
  const inner = poly([[-1.6, -26], [1.6, -26], [1.4, 14], [-1.4, 14]], sh(P.woodLit), 1.1) +
    g(poly([[-1.5, -42], [1.5, -42], [1.5, -26], [-1.5, -26]], sh(P.gold), 1) +
      poly([[-8, -36], [8, -36], [8, -33], [-8, -33]], sh(P.gold), 1) +
      circ(0, -30, 3.4, sh(P.gold), 1) + light(0, -40, 10 + 14 * glowOn, P.holy, 0.5 + glowOn * 0.4) +
      circ(0, -41, 2.6, P.holy, 0.8));
  return at(h, p, inner, 180);
}

function harpoonAxe(h, p) {
  const inner = poly([[-2, -12], [2, -12], [2, 34], [-2, 34]], sh(P.woodLit), 1.2) +
    pathD('M2,22 Q18,20 20,32 Q16,42 2,38 Z', sh(P.steel), 1.3) +
    pathD('M-2,24 L-9,28 L-2,31 Z', sh(P.steel), 1) +
    poly([[-3, 34], [3, 34], [0, 44]], sh(P.steelLit), 1) + line(-2.2, 6, 2.2, 8, P.bordeaux, 2) + line(-2.2, 10, 2.2, 12, P.bordeaux, 2);
  return at(h, p, inner);
}

function kiteShield(h, p, crest = true) {
  const inner = pathD('M-9,-12 L9,-12 L9,2 Q9,12 0,18 Q-9,12 -9,2 Z', sh(P.bordeaux), 1.4) +
    pathD('M-7,-10 L7,-10 L7,2 Q7,10 0,15 Q-7,10 -7,2 Z', 'none', 0, `stroke="${P.gold}" stroke-width="1"`) +
    (crest ? sun(0, -1, 4.2) : '');
  return g(inner, `translate(${f(h.pos[0] + 2)},${f(h.pos[1] - 2)})`);
}

// Order of the Last Light emblem: a candle-sun (flame inside an eight-ray star).
function sun(x, y, r, col = P.goldLit) {
  let rays = '';
  for (let i = 0; i < 8; i++) { const a = polar(x, y, r * 1.5, i * 45), b = polar(x, y, r * 0.8, i * 45 + 22.5), c = polar(x, y, r * 0.8, i * 45 - 22.5); rays += poly([a, b, c], col, 0.6); }
  return rays + circ(x, y, r * 0.8, col, 0.7) + pathD(`M${x},${y - r * 0.6} Q${x + r * 0.4},${y} ${x},${y + r * 0.5} Q${x - r * 0.4},${y} ${x},${y - r * 0.6}Z`, P.bordeaux, 0);
}

module.exports = { sword, greatsword, crossbow, staff, harpoonAxe, kiteShield, sun };
