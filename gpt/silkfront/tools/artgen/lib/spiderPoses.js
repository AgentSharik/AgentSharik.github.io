// Spider keyframes (visual references for sprite sheets, not runtime code).
const base = { bob: 0, legT: 0, stride: 0, lift: 0, lean: 0, rear: 0, curl: 0, jaw: 0, sac: 0 };
const P = (o) => ({ ...base, ...o });

// Walk is given as 8 explicit frames (phase wraps cleanly).
const walk = (stride, lift) => Array.from({ length: 8 }, (_, i) =>
  P({ legT: i / 8, stride, lift, bob: -Math.abs(Math.sin((i / 8) * Math.PI * 2)) * 1.2 }));

const attacks = {
  // bite lunge: rear up, jaws open, strike forward
  bite: [P({ rear: 0.3, lean: -10, jaw: 0.5, dx: -2 }), P({ rear: 0.8, lean: -18, jaw: 1, dx: -3, bob: -2 }),
    P({ rear: 0.1, lean: 12, jaw: 0.2, dx: 6, bob: 1 })],
  // spit: inflate sac, recoil, release
  spit: [P({ sac: 0.3, lean: -4 }), P({ sac: 1, lean: -12, rear: 0.3, dx: -2 }), P({ sac: 0.1, lean: 6, dx: 2, spit: 1 })],
  // weaver "attack" = silk thread lash (it also uses this for building)
  weave: [P({ rear: 0.5, lean: -8, jaw: 0.3 }), P({ rear: 0.9, lean: -14, jaw: 0.6, thread: 0.5 }), P({ rear: 0.2, lean: 4, thread: 1 })],
  // heavy: rise on rear legs and slam forelegs down
  slam: [P({ rear: 0.5, lean: -12, bob: -2 }), P({ rear: 1, lean: -20, bob: -4, dx: -2 }), P({ rear: 0, lean: 14, bob: 2, dx: 5, quake: 1 })],
};

const hit = [P({}), P({ dx: -4, lean: -10, bob: -1, hurt: true, curl: 0.15 }), P({ dx: -1, lean: -3, hurt: true })];
const death = [P({ hurt: true, lean: -10, dx: -2 }), P({ hurt: true, curl: 0.45, bob: 2, lean: 6 }),
  P({ dead: true, curl: 1, lean: 10, fade: 0.25 })];

function set(attack, stride = 6, lift = 5) {
  return {
    idle: [P({}), P({ bob: 0.9, jaw: 0.15 })],
    walk: walk(stride, lift), attack: attacks[attack], hit, death,
  };
}
module.exports = { set, base: P };
