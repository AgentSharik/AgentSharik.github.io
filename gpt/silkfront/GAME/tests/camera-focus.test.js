import test from 'node:test';
import assert from 'node:assert/strict';
import { Controls } from '../src/input.js';

function controlsFixture() {
  const oldDocument = globalThis.document, oldWindow = globalThis.window;
  const events = {}, releases = [];
  const element = name => ({ addEventListener(type, handler) { events[name + ':' + type] = handler; },
    hasPointerCapture() { return true; }, releasePointerCapture(id) { releases.push([name, id]); } });
  const canvas = element('canvas'), mini = element('mini');
  globalThis.document = { hidden: false, hasFocus: () => true, getElementById: () => mini,
    addEventListener(type, handler) { events['document:' + type] = handler; } };
  globalThis.window = { addEventListener(type, handler) { events['window:' + type] = handler; } };
  const g = { canvas, keys: new Set(['KeyW','KeyD']), pointer: { inside: true }, drag: { x0: 10 } };
  const c = new Controls(g); c.miniPointer = 17; c.selectionPointer = 18; c.downAt = { wx: 100 }; c.client = { x: 1, y: 1 };
  return { c, g, events, releases, close() { globalThis.document = oldDocument; globalThis.window = oldWindow; } };
}

test('window blur clears held keys and releases minimap/selection capture without restoring on focus', () => {
  const f = controlsFixture();
  try {
    f.events['window:blur']();
    assert.equal(f.c.focused, false); assert.equal(f.g.keys.size, 0); assert.equal(f.g.pointer.inside, false);
    assert.equal(f.g.drag, null); assert.equal(f.c.downAt, null); assert.equal(f.c.client, null);
    assert.equal(f.c.miniPointer, null); assert.equal(f.c.selectionPointer, null);
    assert.deepEqual(f.releases, [['mini',17],['canvas',18]]);
    f.events['window:focus'](); assert.equal(f.c.focused, true); assert.equal(f.g.keys.size, 0); assert.equal(f.c.miniPointer, null);
  } finally { f.close(); }
});

test('hidden page cancels captured gestures and keyboard input', () => {
  const f = controlsFixture();
  try {
    document.hidden = true; f.events['document:visibilitychange']();
    assert.equal(f.c.focused, false); assert.equal(f.g.keys.size, 0); assert.equal(f.g.drag, null); assert.equal(f.c.miniPointer, null);
  } finally { f.close(); }
});

test('pointercancel and unexpected lost capture finish navigation/selection', () => {
  const f = controlsFixture();
  try {
    f.events['mini:lostpointercapture'](); assert.equal(f.c.miniPointer, null);
    f.c.miniPointer = 19; f.events['mini:pointercancel'](); assert.equal(f.c.miniPointer, null);
    f.events['canvas:lostpointercapture'](); assert.equal(f.c.downAt, null); assert.equal(f.g.drag, null);
    f.g.keys.add('KeyA'); f.events['canvas:pointercancel'](); assert.equal(f.g.keys.size, 0);
  } finally { f.close(); }
});
