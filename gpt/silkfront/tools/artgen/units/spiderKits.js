// Five distinct colony castes. Each has its own body plan, leg proportions,
// armour language and silhouette cue (not one model recoloured).
const { P } = require('../lib/palette');
const { sh, dk, lt, glow } = require('../lib/core');
const { poly, pathD, circ, ell, line, g, light, f } = require('../lib/shapes');
const { abdomen, eyes } = require('../lib/spider');

const chel = (jaw, len, w, col, fang) => { // chelicerae pair, open by jaw 0..1
  const a = 10 + jaw * 28;
  const one = (s) => g(pathD(`M0,${-w / 2} Q${len * 0.7},${-w * 0.7} ${len},0 Q${len * 0.6},${w * 0.6} 0,${w / 2}Z`, sh(col), 1.1) +
    pathD(`M${f(len*.12)},${f(-w*.18)} Q${f(len*.5)},${f(-w*.4)} ${f(len*.76)},${f(-w*.16)} L${f(len*.58)},0 L${f(len*.15)},${f(-w*.03)}Z`, P.moonHalo, 0, 'opacity="0.4"') +
    pathD(`M${len - 1},-0.6 Q${len + 3},2 ${len + 1},${4 + len * 0.12} L${len - 1.2},1.2Z`, sh(fang), 0.8), `rotate(${f(s * a)})`);
  return one(-1) + one(1);
};
const palp = (x, y, ang, len, col) => g(pathD(`M0,-1 L${len},-0.6 L${len + 1.5},1 L${len},1.4 L0,1Z`, sh(col), 0.9) + circ(len + 0.8, 0.4, 1.4, sh(lt(col, 0.1)), 0.7), `translate(${x},${y}) rotate(${ang})`);
const hurtTint = (p, rx, ry) => (p.hurt ? ell(0, 0, rx, ry, '#fff', 0, 'opacity="0.18"') : '');
// Inset surface planes only: no new contour, anatomy or pose transforms.
const facet = (d, c = P.moonHalo, a = 0.32) => pathD(d, c, 0, `opacity="${a}"`);
const shellPlanes = (rx, ry, a = 0.32) =>
  facet(`M${f(-rx*.66)},${f(-ry*.3)} L${f(-rx*.25)},${f(-ry*.74)} L${f(rx*.27)},${f(-ry*.62)} L${f(rx*.48)},${f(-ry*.24)} L${f(-rx*.12)},${f(-ry*.18)}Z`, P.moonHalo, a) +
  facet(`M${f(-rx*.55)},${f(ry*.32)} Q0,${f(ry*.85)} ${f(rx*.65)},${f(ry*.2)} L${f(rx*.3)},${f(ry*.7)} Q${f(-rx*.25)},${f(ry*.8)} ${f(-rx*.55)},${f(ry*.32)}Z`, P.ink, 0.26);

// 1. WEAVER — small worker. Pale silk-dusted grey, round body, silk bale on its back,
//    long manipulator palps, glowing teal spinnerets. Reads as "builder", not soldier.
const weaver = {
  name: 'weaver', seed: 11, H: 8, cx: 3, ax: -8, ay: -2, hx: 9.5, hy: 1, reach: 15, femur: 8, tibia: 9, legW: 2.4, rootStep: -1.8,
  legCol: P.grey, bands: P.silk,
  abdomen: (p) => abdomen(9, 7, '#6d6878', P.silkDim, null) + ell(-2, -6, 7.5, 4.5, sh(P.silk), 1.2) +
    facet('M-7.6,-7 L-4,-9 L0.2,-9.3 L3,-7.4 L-2,-7.8Z', P.moon, 0.38) +
    facet('M-7.6,-5.4 Q-3,-3 3.5,-4.6 Q0,-1.6 -5,-3Z', P.chitin, 0.28) +
    [-6, -3, 0, 3].map((x) => line(x - 2, -9, x + 1.5, -2.5, P.silkDim, 0.7)).join('') + line(-8.5, -5.5, 4, -6.5, P.wood, 1.2) + hurtTint(p, 9, 7),
  thorax: (p) => ell(0, 0, 5.2, 4.2, sh('#77717f'), 1.3) + ell(-1, -1.5, 3, 1.6, lt('#77717f', 0.25), 0, 'opacity="0.6"') + shellPlanes(5.2, 4.2, 0.22),
  head: (p) => ell(0, 0, 3.4, 3, sh('#85808e'), 1.2) + shellPlanes(3.4, 3, 0.22) + eyes(1.2, -0.8, 0.55, P.tealGlow) + palp(2, 1.5, 28 - (p.thread || 0) * 30, 6, P.grey) + palp(1.5, 2.5, 50 - (p.thread || 0) * 40, 6, dk(P.grey, 0.2)),
  fx: (p, bx, by) => light(bx - 16, by - 1, 6, P.teal, 0.7) + (p.thread ? line(bx + 13, by + 2, bx + 13 + 22 * p.thread, by - 4 + 10 * p.thread, P.silk, 1.1, 'opacity="0.9"') + light(bx + 13 + 22 * p.thread, by - 4 + 10 * p.thread, 4, P.silk, 0.7) : ''),
};

// 2. SCOUT — fastest. Tiny slim body high on very long banded legs, swept-back
//    crest of spines, cold-blue sheen. Silhouette = "long legs, little body".
const scout = {
  name: 'scout', seed: 22, H: 17, cx: 3, ax: -7, ay: -1, hx: 9, hy: 0.5, reach: 30, femur: 17, tibia: 18, legW: 2.2, rootStep: -1.5,
  legCol: P.coldBlue, bands: P.silk, hair: true,
  abdomen: (p) => g(abdomen(8, 4.5, '#24344e', P.tealGlow, null), 'rotate(-8)') + hurtTint(p, 8, 4.5),
  thorax: () => ell(0, 0, 4.6, 3.4, sh('#2a3d5c'), 1.2) + shellPlanes(4.6, 3.4) + [-3, -0.5, 2].map((x, i) => pathD(`M${x - 1},-2.5 L${x - 4 - i},${-8 + i} L${x + 1},-2.5Z`, sh(P.silkDim), 0.8)).join(''),
  head: (p) => pathD('M-2.5,-2.4 Q3,-3.4 5.5,0 Q3,2.6 -2.5,2.4Z', sh('#33496b'), 1.1) + facet('M-1.3,-1.5 L1.8,-1.9 L3.8,-0.7 L0.3,-0.5Z') + eyes(2, -0.6, 0.5, P.tealGlow) + chel(p.jaw || 0, 3, 1.6, '#1c2a40', P.bone),
};

// FANG: low wedge, enlarged ivory chelicerae, overlapping thoracic plates.
const fang = {
  name: 'fang', seed: 33, H: 12, cx: 4, ax: -10, hx: 13, reach: 25, femur: 15, tibia: 16, legW: 4, legCol: P.violet, hair: true,
  abdomen: p => abdomen(13, 8, P.violet, P.crimson, P.teal) + hurtTint(p, 13, 8),
  thorax: () => [-4, 0, 4].map(x => g(pathD('M-5,-6 L3,-7 L7,0 L2,6 L-5,4Z', sh(P.chitinLit), 1.1) +
    facet('M-3.8,-4.6 L2.4,-5.7 L4.3,-2.3 L0,-1 L-3.6,-1.8Z', P.moonHalo, 0.4) +
    facet('M-3,2 L2,3.8 L5.3,0.5 L1.5,4.5 L-3.6,3Z', P.ink, 0.3) + line(-3,-5,2,-6,P.silkDim,0.7), `translate(${x},0)`)).join(''),
  head: p => ell(0,0,6,4.5,sh(P.violetLit),1.2) + shellPlanes(6,4.5,0.28) + eyes(2,-1,0.8,P.eye) + chel(p.jaw || 0,10,4,P.chitinLit,P.bone),
};

// SPITTER: tall translucent reservoir, ribbed neck and forward nozzle.
const spitter = {
  name: 'spitter', seed: 44, H: 15, cx: 3, ax: -13, ay: -6, hx: 12, reach: 24, femur: 16, tibia: 16, legW: 3, legCol: P.coldBlue, bands: P.teal,
  abdomen: p => {
    const s = 1 + (p.sac || 0) * 0.12;
    return g(abdomen(13,15,P.violet,P.tealGlow,P.tealGlow) +
      facet('M-9,-5 L-6,-11 L-2,-12 L-3,-5 L-5,0 L-8,2Z', P.tealGlow, 0.22) +
      facet('M3,-8 L7,-9 L9,-3 L8,6 L5,10 L6,0Z', P.ink, 0.3) +
      [-7,0,7].map(x => pathD(`M${x},-12 Q${x-5},0 ${x},12`,'none',0,`stroke="${P.teal}" stroke-width="0.8"`)).join('') + ell(-3,-4,5,7,P.teal,0,'opacity="0.3"'), `scale(${s})`) + hurtTint(p,13,15);
  },
  thorax: () => ell(0,0,8,5,sh(P.coldBlue),1.3) + shellPlanes(8,5) + [-2,2,6].map(x=>line(x,-3,x+1,4,P.silkDim,1)).join(''),
  head: p => pathD('M-4,-4 L7,-3 L12,0 L7,4 L-4,4Z',sh(P.chitinLit),1.2) + facet('M-2.8,-2.7 L6,-2 L9,-0.5 L2,-0.8 L-2.5,-0.6Z', P.moonHalo, 0.42) + facet('M-2,1 L5,1.5 L7.3,2.6 L3,2.9 L-2,2.8Z', P.ink, 0.25) + ell(10,0,2,3,P.ink,1) + eyes(1,-3,0.65,P.tealGlow),
  fx: (p,x,y) => p.spit ? [0,1,2].map(i=>ell(x+27+i*6*p.spit,y-i*2,2.4-i*0.5,1.6,P.tealGlow,0)).join('') : '',
};

// ARMORED: broad low bastion; layered shell, bone buttresses, heavy forelegs.
const armored = {
  name: 'armored', seed: 55, H: 18, cx: 7, ax: -12, ay: -2, hx: 20, reach: 36, femur: 23, tibia: 22, legW: 6, legCol: P.chitinLit, jointCol: P.silkDim,
  abdomen: p => abdomen(21,14,P.chitinLit,null,null) + [-14,-6,2,10].map((x,i)=>g(pathD('M-7,-10 L3,-13 L9,-4 L6,10 L-5,12 L-9,0Z',sh(i%2 ? P.violet : P.grey),1.4) +
    facet('M-5.5,-8.4 L2,-10.6 L6,-4.6 L0,-3 L-6,-1Z', P.moonHalo, 0.42) +
    facet('M0,-2 L6,-3 L4.4,8 L0,9Z', P.ink, 0.3) +
    pathD('M-6,-9 L2,-11 L7,-4','none',0,`stroke="${P.silkDim}" stroke-width="1"`) + poly([[-4,-10],[-7,-18],[1,-12]],sh(P.bone),1),`translate(${x},0)`)).join('') + hurtTint(p,21,14),
  thorax: () => pathD('M-8,-9 L5,-11 L12,-4 L10,7 L-5,10 L-11,3Z',sh(P.grey),1.5) +
    facet('M-7,-7.4 L4.5,-9.4 L8.8,-5 L1,-3 L-8,-0.5Z', P.moonHalo, 0.32) +
    facet('M-8,3 L-4,7.8 L8.4,5.8 L8.8,1 L1,5Z', P.ink, 0.3) +
    poly([[-5,-6],[3,-8],[7,-1],[2,6],[-4,4]],sh(P.chitin),1) + facet('M-3.5,-4.5 L2.6,-6.5 L5,-2 L1,-1.4Z', P.moonHalo, 0.36) + line(-4,-5,3,-7,P.teal,1.5),
  head: p => pathD('M-5,-6 L6,-5 L9,0 L5,5 L-6,5Z',sh(P.boneDark),1.4) + facet('M-3.5,-4.4 L5,-3.8 L6.4,-1 L0,-1.8 L-4,-1Z', P.moonHalo, 0.35) + eyes(3,-2,0.7,P.tealGlow) + chel(p.jaw||0,6,3.2,P.chitin,P.bone),
  fx: (p,x,y) => p.quake ? ell(x,y+16,25*p.quake,5,'none',0,`stroke="${P.silkDim}" stroke-width="1" opacity="0.5"`) : '',
};

module.exports = { weaver, scout, fang, spitter, armored };
