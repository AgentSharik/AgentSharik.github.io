// Read-only pass-02 regression (humans surface polish): spiders, atlases, bounds, human silhouettes.
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const crypto = require('crypto');
const { Resvg } = require('@resvg/resvg-js');
const root = path.resolve(__dirname, '../..'), backup = path.join(root, 'REVIEW_BACKUP_02');
const read = (base, rel) => fs.readFileSync(path.join(base, rel));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const old = JSON.parse(read(backup, 'ART/CATALOG/units_report.json'));
const cur = JSON.parse(read(root, 'ART/CATALOG/units_report.json'));
// Pass-01 protected sources, except the two human modules this pass is allowed to change.
const prot = JSON.parse(read(root, 'REVIEW_BACKUP_01/protected_sources.json'));
let protN = 0;
for (const [rel, h] of Object.entries(prot)) {
  if (/lib\/human\.js$|units\/humanKits\.js$/.test(rel)) continue;
  assert.equal(hash(read(root, rel)), h, rel); protN++;
}
assert.deepEqual(cur.frame, old.frame); assert.deepEqual(cur.states, old.states);
for (const u of cur.report) {
  assert.deepEqual(u, old.report.find(o => o.id === u.id), `${u.id}: bounds/frame contract`);
  const rel = `ART/${u.fac}/UNITS/${u.id}/${u.id}_sheet.json`;
  assert.deepEqual(read(root, rel), read(backup, rel), `${u.id}: atlas/timing/pivot`);
}
let spiderPairs = 0;
for (const m of old.manifest.filter(m => m.file.startsWith('ART/SPIDERS/'))) {
  for (const rel of [m.file, m.file.replace(/^ART\//, 'ART_SRC/').replace(/\.png$/, '.svg')]) assert.equal(hash(read(root, rel)), hash(read(backup, rel)), rel);
  spiderPairs++;
}
const unitChecks = [];
for (const u of cur.report.filter(u => u.fac === 'HUMANS')) {
  const rel = `ART_SRC/HUMANS/UNITS/${u.id}/${u.id}_sheet.svg`;
  const a = new Resvg(read(backup, rel), { fitTo: { mode: 'width', value: u.cols * 288 } }).render().pixels;
  const b = new Resvg(read(root, rel), { fitTo: { mode: 'width', value: u.cols * 288 } }).render().pixels;
  let support = 0, alpha = 0, rgb = 0;
  for (let i = 0; i < a.length; i += 4) {
    if ((a[i+3] > 0) !== (b[i+3] > 0)) support++;
    if (a[i+3] !== b[i+3]) alpha++;
    if (a[i] !== b[i] || a[i+1] !== b[i+1] || a[i+2] !== b[i+2]) rgb++;
  }
  unitChecks.push({ id: u.id, silhouettePixelsChanged: support, alphaPixelsChanged: alpha, colorPixelsChanged: rgb });
  assert.equal(support, 0, `${u.id}: outer silhouette changed`);
  assert(rgb > 0, `${u.id}: no surface change`);
}
let humanPng = 0;
for (const m of cur.manifest.filter(m => m.file.startsWith('ART/HUMANS/'))) {
  const svg = m.file.replace(/^ART\//, 'ART_SRC/').replace(/\.png$/, '.svg');
  const rendered = new Resvg(read(root, svg), { fitTo: { mode: 'width', value: m.w }, font: { loadSystemFonts: false } }).render().asPng();
  assert.deepEqual(read(root, m.file), rendered, `${m.file}: PNG differs from saved SVG`);
  assert.equal(read(root, m.file).length, m.bytes, `${m.file}: report byte size`); humanPng++;
}
console.log(JSON.stringify(unitChecks));
console.log(`PASS: ${protN} protected sources unchanged; ${spiderPairs} spider PNG/SVG pairs byte-identical; 10 atlases unchanged; 290 frame bounds/clipping unchanged; 145 human frames keep pixel support; ${humanPng} human PNG exports match saved SVGs.`);
