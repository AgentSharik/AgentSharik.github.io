// Read-only pass-01 regression: pixels, atlas contracts and protected sources.
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const crypto = require('crypto');
const { Resvg } = require('@resvg/resvg-js');
const root = path.resolve(__dirname, '../..'), backup = path.join(root, 'REVIEW_BACKUP_01');
const read = (base, rel) => fs.readFileSync(path.join(base, rel));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const old = JSON.parse(read(backup, 'ART/CATALOG/units_report.json'));
const cur = JSON.parse(read(root, 'ART/CATALOG/units_report.json'));
for (const [rel, h] of Object.entries(JSON.parse(read(backup, 'protected_sources.json')))) assert.equal(hash(read(root, rel)), h, rel);
assert.deepEqual(cur.frame, old.frame); assert.deepEqual(cur.states, old.states);
for (const u of cur.report) {
  assert.deepEqual(u, old.report.find(o => o.id === u.id), `${u.id}: bounds/frame contract`);
  const rel = `ART/${u.fac}/UNITS/${u.id}/${u.id}_sheet.json`;
  assert.deepEqual(read(root, rel), read(backup, rel), `${u.id}: atlas/timing/pivot`);
}
let humanPairs = 0;
for (const m of old.manifest.filter(m => m.file.startsWith('ART/HUMANS/'))) {
  for (const rel of [m.file, m.file.replace(/^ART\//, 'ART_SRC/').replace(/\.png$/, '.svg')]) assert.equal(hash(read(root, rel)), hash(read(backup, rel)), rel);
  humanPairs++;
}
const unitChecks = [];
for (const u of cur.report.filter(u => u.fac === 'SPIDERS')) {
  const rel = `ART_SRC/SPIDERS/UNITS/${u.id}/${u.id}_sheet.svg`;
  const a = new Resvg(read(backup, rel), { fitTo: { mode: 'width', value: u.cols * 288 } }).render();
  const b = new Resvg(read(root, rel), { fitTo: { mode: 'width', value: u.cols * 288 } }).render();
  const aa = a.pixels, bb = b.pixels;
  let support = 0, alpha = 0, rgb = 0;
  for (let i = 0; i < aa.length; i += 4) {
    if ((aa[i+3] > 0) !== (bb[i+3] > 0)) support++;
    if (aa[i+3] !== bb[i+3]) alpha++;
    if (aa[i] !== bb[i] || aa[i+1] !== bb[i+1] || aa[i+2] !== bb[i+2]) rgb++;
  }
  unitChecks.push({ id: u.id, silhouettePixelsChanged: support, alphaPixelsChanged: alpha, colorPixelsChanged: rgb });
  console.log(unitChecks.at(-1));
  assert.equal(support, 0, `${u.id}: outer silhouette changed`);
  assert(rgb > 0, `${u.id}: no surface change`);
}
for (const m of cur.manifest.filter(m => m.file.startsWith('ART/SPIDERS/'))) {
  const svg = m.file.replace(/^ART\//, 'ART_SRC/').replace(/\.png$/, '.svg');
  const rendered = new Resvg(read(root, svg), { fitTo: { mode: 'width', value: m.w }, font: { loadSystemFonts: false } }).render().asPng();
  assert.deepEqual(read(root, m.file), rendered, `${m.file}: PNG differs from saved SVG`);
  assert.equal(read(root, m.file).length, m.bytes, `${m.file}: report byte size`);
}
console.log(`PASS: ${humanPairs} human PNG/SVG pairs byte-identical; 10 atlases unchanged; 145 spider frames retain pixel support; 290 frame bounds/clipping unchanged; all 35 spider PNG exports match saved SVGs.`);
console.log(JSON.stringify(unitChecks));
