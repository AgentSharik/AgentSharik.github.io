// Shared sprite-frame contract for EVERY unit (humans, spiders, later heroes):
//  - one frame size, one pivot (feet / body centre on the ground), facing +x (right, toward
//    the camera's 3/4 right), one camera (Warcraft III-like ~50° elevated 3/4 view).
// Keyframe poses are expanded into in-between frames by linear interpolation.
// v02: canvas enlarged from 128 to 192 (pivot 64,108 -> 96,152) because long weapon swings
// reached 82 units past the pivot. Rig units and the 1.5 export scale are unchanged.
const FRAME = { w: 192, h: 192, px: 96, py: 152, scale: 1.5 }; // PNG cell = 288 x 288

// How many frames each state gets in the final sheet, and its playback rate.
const STATES = {
  idle: { frames: 6, fps: 6, loop: true },
  walk: { frames: 8, fps: 12, loop: true },
  attack: { frames: 6, fps: 12, loop: false },
  hit: { frames: 3, fps: 12, loop: false },
  death: { frames: 6, fps: 10, loop: false },
};

const lerpV = (a, b, t) => {
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => lerpV(v, b[i], t));
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
  if (a === undefined) return b;
  return t < 0.5 ? a : b;
};
function lerpPose(a, b, t) {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = lerpV(a[k], b[k], t);
  return o;
}

/** Resample keyframes to n frames. Looping states wrap last->first. */
function expand(keys, n, loop) {
  if (keys.length === 1) {
    // single key (e.g. hit): ease in from neutral handled by caller passing [neutral, key]
    return Array.from({ length: n }, () => keys[0]);
  }
  const seg = loop ? keys.length : keys.length - 1;
  const out = [];
  for (let i = 0; i < n; i++) {
    const u = loop ? (i / n) * seg : (i / (n - 1)) * seg;
    const k = Math.min(Math.floor(u), seg - 1), t = u - k;
    out.push(lerpPose(keys[k], keys[(k + 1) % keys.length], t));
  }
  return out;
}

module.exports = { FRAME, STATES, expand, lerpPose };
