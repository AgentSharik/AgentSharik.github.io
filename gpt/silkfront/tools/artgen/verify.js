// Read-only validation of generated review-gate assets.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p));
const report = JSON.parse(read('ART/CATALOG/units_report.json'));
assert.equal(report.report.length, 10);
let pairs = 0, frames = 0;
for (const item of report.manifest) {
  const png = read(item.file);
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), item.w);
  assert.equal(png.readUInt32BE(20), item.h);
  const svg = read(item.file.replace(/^ART\//, 'ART_SRC/').replace(/\.png$/, '.svg')).toString();
  assert(svg.includes('<svg'));
  pairs++;
}
for (const u of report.report) {
  assert.equal(u.clipped, 0);
  const dir = `ART/${u.fac}/UNITS/${u.id}`;
  const atlas = JSON.parse(read(`${dir}/${u.id}_sheet.json`));
  assert.deepEqual(atlas.meta.pivotPx, [144, 228]);
  assert.equal(Object.keys(atlas.frames).length, 29);
  for (const [state, spec] of Object.entries(report.states)) {
    assert.equal(atlas.animations[state].frames.length, spec.frames);
    for (const name of atlas.animations[state].frames) {
      const f = atlas.frames[name].frame;
      assert.equal(f.w, 288); assert.equal(f.h, 288);
      assert(f.x + f.w <= atlas.meta.size.w && f.y + f.h <= atlas.meta.size.h);
      frames++;
    }
  }
}
const html = read('ART/CATALOG/gallery.html').toString();
assert(!/<script[^>]+src=|\bfetch\(|XMLHttpRequest|type="module"/.test(html));
assert(!html.includes('/*DATA*/null'));
console.log(`PASS: ${pairs} PNG/SVG pairs, 10 atlases, ${frames} frames, 50 states; inline gallery scripts/data (file:// runtime not tested).`);
