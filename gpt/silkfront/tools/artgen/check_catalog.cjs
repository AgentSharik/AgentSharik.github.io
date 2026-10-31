// Read-only consistency check; does not rebuild assets.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const r = JSON.parse(read('ART/CATALOG/units_report.json'));
const md = read('ART/CATALOG/ASSET_MANIFEST.md');
const html = read('ART/CATALOG/gallery.html');
const tpl = fs.readFileSync(path.join(__dirname, 'gallery.template.html'), 'utf8');
const view = fs.readFileSync(path.join(__dirname, 'gallery_view.js'), 'utf8');
const marker = 'const DATA = ';
const start = html.indexOf(marker) + marker.length;
assert(start >= marker.length);
const end = html.indexOf(';', start);
const dataText = html.slice(start, end);
const data = JSON.parse(dataText);
assert.equal(html, tpl.replace('/*DATA*/null', () => dataText).replace('<script src="gallery_view.js"></script>', () => `<script>\n${view}\n</script>`));
assert.deepEqual(data.states, r.states);
assert.equal(data.units.length, r.report.length);
for (const u of r.report) {
  const g = data.units.find(g => g.id === u.id);
  assert(g);
  for (const k of ['ru', 'fac', 'role', 'height', 'clipped']) assert.deepEqual(g[k], u[k]);
  const atlas = JSON.parse(read(`ART/${u.fac}/UNITS/${u.id}/${u.id}_sheet.json`));
  assert.deepEqual(g.atlas, atlas);
  assert.equal(g.preview, `../${u.fac}/UNITS/${u.id}.png`);
  assert.equal(g.dir, `../${u.fac}/UNITS/${u.id}`);
  assert(md.includes(`| ${u.ru} | \`${u.id}\` | ${u.frames} | ${u.clipped} | ${u.height}px | ${u.bbox.join(', ')} |`));
}
for (const m of r.manifest) {
  const svg = m.file.replace(/^ART\//, 'ART_SRC/').replace(/\.png$/, '.svg');
  assert(md.includes(`| \`${m.file}\` | \`${svg}\` | ${m.category} | ${m.w}×${m.h} | ${m.purpose} | ${m.status} |`));
}
assert.equal(md.split('\n').filter(l => l.startsWith('| `ART/')).length, r.manifest.length);
console.log(`PASS: ${r.manifest.length} manifest rows match report; all 10 gallery atlases match disk; generated HTML matches current template/viewer.`);
