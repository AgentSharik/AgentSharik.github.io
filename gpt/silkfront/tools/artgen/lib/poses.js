// Animation keyframe poses for the human rig. These are visual references for
// the animator / future sprite sheets, not runtime animation code.
const base = { nLeg: [-6, -2], fLeg: [9, 5], nArm: [12, 30], fArm: [-6, 20], lean: 3, bob: 0 };
const P = (o) => ({ ...base, ...o });

const walk = [
  P({ nLeg: [-28, -18], fLeg: [24, 40], nArm: [22, 45], fArm: [-18, 5], bob: -1 }),
  P({ nLeg: [-4, 16], fLeg: [6, 2], nArm: [8, 30], fArm: [-4, 18], bob: -2.5 }),
  P({ nLeg: [24, 40], fLeg: [-28, -18], nArm: [-14, 8], fArm: [20, 40], bob: -1 }),
  P({ nLeg: [6, 2], fLeg: [-4, 16], nArm: [4, 26], fArm: [6, 28], bob: -2.5 }),
];

// Melee: wind-up, swing, follow-through
const melee = [
  P({ nArm: [165, 205], wep: 200, lean: -6, nLeg: [-18, -10], fLeg: [18, 10] }),
  P({ nArm: [95, 100], wep: 105, lean: 14, nLeg: [-26, -14], fLeg: [24, 16], dx: 4 }),
  P({ nArm: [40, 50], wep: 30, lean: 18, nLeg: [-26, -14], fLeg: [24, 16], dx: 5 }),
];
// Ranged: raise, aim, recoil
const ranged = [
  P({ nArm: [60, 95], fArm: [70, 100], wep: 90, lean: 0 }),
  P({ nArm: [80, 92], fArm: [88, 96], wep: 90, lean: -2, fire: false }),
  P({ nArm: [80, 80], fArm: [92, 84], wep: 84, lean: -8, dx: -2, fire: true }),
];
// Cast: gather, raise, release
const cast = [
  P({ nArm: [40, 120], fArm: [50, 120], lean: 0, cast: 0.3 }),
  P({ nArm: [150, 170], fArm: [130, 160], lean: -4, cast: 0.7 }),
  P({ nArm: [110, 110], fArm: [100, 100], lean: 8, cast: 1 }),
];
// Heavy two-hander: lift overhead, slam
const heavy = [
  P({ nArm: [150, 190], fArm: [140, 185], wep: 190, lean: -8 }),
  P({ nArm: [120, 140], fArm: [115, 135], wep: 140, lean: 4, nLeg: [-20, -12], fLeg: [20, 12] }),
  P({ nArm: [60, 70], fArm: [58, 66], wep: 60, lean: 22, nLeg: [-30, -16], fLeg: [26, 18], dx: 6, bob: 3 }),
];

const hit = P({ lean: -14, dx: -3, nArm: [-20, 10], fArm: [-30, -5], headTilt: -12, hurt: true });
const death = [
  P({ lean: -18, dx: -3, nArm: [-40, -10], fArm: [-50, -20], nLeg: [-4, 10], bob: 2, hurt: true, rot: -10 }),
  P({ lean: -10, nArm: [-60, -30], fArm: [-70, -40], nLeg: [10, 30], fLeg: [20, 40], bob: 6, rot: -48, hurt: true }),
  P({ lean: 0, nArm: [-80, -95], fArm: [-95, -100], nLeg: [0, 4], fLeg: [8, 12], rot: -88, ty: -6, dead: true }),
];

function set(attack) {
  const atk = { melee, ranged, cast, heavy }[attack];
  return {
    idle: [P({}), P({ bob: 0.8, nArm: [14, 32], fArm: [-4, 22] })],
    walk, attack: atk, hit: [hit], death,
  };
}

module.exports = { set, base: P };
