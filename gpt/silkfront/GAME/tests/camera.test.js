import test from 'node:test';
import assert from 'node:assert/strict';
import { Controls, CAMERA_SPEED, CAMERA_EDGE_ZONE, edgeAxis, minimapPoint, textInput } from '../src/input.js';
import { Renderer } from '../src/render.js';

function fixture() {
  const previous = globalThis.document;
  const canvas = { getBoundingClientRect: () => ({ left: 0, top: 32, width: 1000, height: 600 }) };
  const document = globalThis.document = { hidden: false, activeElement: null, querySelector: () => null, elementFromPoint: () => canvas };
  const g = { canvas, running: true, world: { over: false, units: [], buildings: [], res: [] }, cam: { x: 500, y: 500 }, pointer: { x: 0, y: 0, inside: false }, keys: new Set(),
    clampCamera() { this.cam.x = Math.max(0, Math.min(2000, this.cam.x)); this.cam.y = Math.max(0, Math.min(1500, this.cam.y)); } };
  const c = Object.assign(Object.create(Controls.prototype), { g, focused: true, client: null, miniPointer: null });
  return { g, c, document, close() { globalThis.document = previous; } };
}

test('edge ramp: smooth, monotonic, symmetric, bounded on all four edges', () => {
  assert.equal(edgeAxis(-1, 1000), 0); assert.equal(edgeAxis(1001, 1000), 0);
  assert.equal(edgeAxis(0, 0), 0); assert.equal(edgeAxis(500, 1000), 0);
  assert.equal(edgeAxis(0, 1000), -1); assert.equal(edgeAxis(1000, 1000), 1);
  let last = 1;
  for (let x = 0; x <= CAMERA_EDGE_ZONE; x++) {
    const speed = -edgeAxis(x, 1000);
    assert.ok(speed >= 0 && speed <= last);
    assert.ok(Math.abs(edgeAxis(1000 - x, 1000) - speed) < 1e-10);
    last = speed;
  }
  assert.equal(Math.abs(last), 0);
  assert.ok(Math.abs(edgeAxis(0.01, 1000) + 1) < 0.00001, 'no speed jump at the edge');
  assert.ok(Math.abs(edgeAxis(CAMERA_EDGE_ZONE - 0.01, 1000)) < 0.00001, 'no speed jump entering the zone');
});

test('minimap mapping: content, CSS borders/scaling and outside capture are clamped', () => {
  const mini = { offsetWidth: 208, offsetHeight: 156, clientWidth: 206, clientHeight: 154, clientLeft: 1, clientTop: 1,
    getBoundingClientRect: () => ({ left: 10, top: 20, width: 416, height: 312 }) };
  const world = { pw: 3072, ph: 2304 };
  assert.deepEqual(minimapPoint(mini, world, 218, 176), { x: 1536, y: 1152 });
  assert.deepEqual(minimapPoint(mini, world, 12, 22), { x: 0, y: 0 });
  assert.deepEqual(minimapPoint(mini, world, 424, 330), { x: 3072, y: 2304 });
  assert.deepEqual(minimapPoint(mini, world, -100, 1000), { x: 0, y: 2304 });
});

test('WASD and arrows: eight directions have equal total speed and stop without inertia', () => {
  const f = fixture();
  try {
    for (const [keys, dx, dy] of [
      [['KeyW'], 0, -1], [['KeyA'], -1, 0], [['KeyS'], 0, 1], [['KeyD'], 1, 0],
      [['KeyW','KeyD'], 1, -1], [['KeyW','KeyA'], -1, -1], [['KeyS','KeyD'], 1, 1], [['KeyS','KeyA'], -1, 1],
      [['ArrowUp'], 0, -1], [['ArrowLeft'], -1, 0], [['ArrowDown'], 0, 1], [['ArrowRight'], 1, 0]
    ]) {
      f.g.cam = { x: 500, y: 500 }; f.g.keys = new Set(keys); f.c.pan(0.2);
      assert.ok(Math.abs(Math.hypot(f.g.cam.x - 500, f.g.cam.y - 500) - CAMERA_SPEED * 0.2) < 1e-8, keys.join('+'));
      assert.equal(Math.sign(f.g.cam.x - 500), dx); assert.equal(Math.sign(f.g.cam.y - 500), dy);
      f.g.keys.clear(); const stopped = { ...f.g.cam }; f.c.pan(0.2); assert.deepEqual(f.g.cam, stopped);
    }
    f.g.keys = new Set(['KeyW','KeyS','KeyA','KeyD']); const stopped = { ...f.g.cam }; f.c.pan(0.2); assert.deepEqual(f.g.cam, stopped);
  } finally { f.close(); }
});

test('edge/keys combined cannot exceed speed; UI hit-testing suppresses captured/stationary pointer', () => {
  const f = fixture();
  try {
    f.g.pointer.inside = true; f.c.client = { x: 1000, y: 632 }; f.g.keys.add('KeyD');
    f.c.pan(0.2); assert.ok(Math.abs(Math.hypot(f.g.cam.x - 500, f.g.cam.y - 500) - CAMERA_SPEED * 0.2) < 1e-8);
    f.g.keys.clear(); f.document.elementFromPoint = () => ({ id: 'panel' });
    const stopped = { ...f.g.cam }; f.c.pan(0.2); assert.deepEqual(f.g.cam, stopped);
    f.document.elementFromPoint = () => f.g.canvas; f.g.pointer.inside = false;
    f.c.pan(0.2); assert.deepEqual(f.g.cam, stopped);
    f.g.pointer.inside = true; f.c.downAt = { wx: 600, wy: 700 }; f.g.drag = { x0: 0, y0: 0 };
    f.c.pan(0.2); assert.deepEqual(f.g.cam, stopped, 'box selection does not edge-scroll');
    f.g.keys.add('KeyD'); f.c.pan(0.2);
    assert.equal(f.g.drag.x0, 600 - f.g.cam.x, 'selection keeps its original world anchor during keyboard pan');
  } finally { f.close(); }
});

test('text focus clears keyboard but preserves independent mouse-edge navigation', () => {
  const f = fixture();
  try {
    f.document.activeElement = { isContentEditable: true }; f.g.keys.add('KeyD');
    f.c.pan(0.2); assert.deepEqual(f.g.cam, { x: 500, y: 500 }); assert.equal(f.g.keys.size, 0);
    f.g.pointer.inside = true; f.c.client = { x: 0, y: 300 }; f.c.pan(0.2);
    assert.equal(f.g.cam.x, 500 - CAMERA_SPEED * 0.2);
    assert.equal(textInput({ isContentEditable: true }), true);
    assert.equal(textInput({ closest: (selector) => selector.includes('[role="textbox"]') ? {} : null }), true);
    assert.equal(textInput({ closest: () => null }), false);
  } finally { f.close(); }
});

test('absolute minimap navigation overrides held keys and bounds are enforced', () => {
  const f = fixture();
  try {
    f.g.keys.add('KeyD'); f.c.miniPointer = 1; f.c.pan(0.2); assert.equal(f.g.cam.x, 500);
    f.c.miniPointer = null; f.c.pan(0.2); assert.equal(f.g.cam.x, 500 + CAMERA_SPEED * 0.2);
    f.c.pan(100); assert.equal(f.g.cam.x, 2000);
    f.g.keys = new Set(['KeyA','KeyW']); f.c.pan(100); assert.deepEqual(f.g.cam, { x: 0, y: 0 });
  } finally { f.close(); }
});

test('hover follows world point under a stationary cursor while panning and clears over UI', () => {
  const f = fixture();
  try {
    f.g.world.units = [
      { id: 1, x: 500, y: 500, r: 8, def: { h: 32 } },
      { id: 2, x: 500 + CAMERA_SPEED * 0.2, y: 500, r: 8, def: { h: 32 } }
    ];
    f.g.hoverId = 1; f.g.pointer.inside = true; f.c.client = { x: 500, y: 300 };
    f.g.keys.add('KeyD'); f.c.pan(0.2); assert.equal(f.g.hoverId, 2);
    f.document.elementFromPoint = () => ({ id: 'panel' }); f.c.pan(0); assert.equal(f.g.hoverId, 0);
  } finally { f.close(); }
});

test('minimap viewport outline stays fully inside its bitmap at map limits and oversized windows', () => {
  const rectangles = [], ctx = { drawImage() {}, fillRect() {}, strokeRect(...args) { rectangles.push(args); } };
  const renderer = Object.assign(Object.create(Renderer.prototype), {
    mctx: ctx, mini: { width: 208, height: 156 }, terrain: {}, pid: 0,
    w: { pw: 3072, ph: 2304, res: [], buildings: [], units: [] }, c: { width: 1440, height: 752 }
  });
  renderer.minimap({ x: 1632, y: 1552 }); renderer.c = { width: 4000, height: 3000 }; renderer.minimap({ x: 0, y: 0 });
  for (const [x, y, w, h] of rectangles) {
    assert.ok(x >= 0.5 && y >= 0.5); assert.ok(x + w <= 207.5 && y + h <= 155.5);
    assert.ok(w > 0 && h > 0);
  }
});
