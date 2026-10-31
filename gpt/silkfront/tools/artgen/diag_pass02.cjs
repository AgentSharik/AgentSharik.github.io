// Read-only: where did human outer support change vs REVIEW_BACKUP_02 (cell, state, local xy).
const fs = require('fs'), path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const root = path.resolve(__dirname, '../..'), backup = path.join(root, 'REVIEW_BACKUP_02');
const states = ['idle', 'walk', 'attack', 'hit', 'death'];
const cur = JSON.parse(fs.readFileSync(path.join(root, 'ART/CATALOG/units_report.json')));
for (const u of cur.report.filter(u => u.fac === 'HUMANS')) {
  const rel = `ART_SRC/HUMANS/UNITS/${u.id}/${u.id}_sheet.svg`, W = u.cols * 288;
  const a = new Resvg(fs.readFileSync(path.join(backup, rel)), { fitTo: { mode: 'width', value: W } }).render().pixels;
  const b = new Resvg(fs.readFileSync(path.join(root, rel)), { fitTo: { mode: 'width', value: W } }).render().pixels;
  const hits = {};
  for (let i = 0; i < a.length; i += 4) {
    if ((a[i + 3] > 0) === (b[i + 3] > 0)) continue;
    const p = i / 4, x = p % W, y = (p - x) / W, c = Math.floor(x / 288), r = Math.floor(y / 288);
    const key = `${states[r]}_${c}`;
    (hits[key] = hits[key] || []).push(`${x % 288},${y % 288}${b[i + 3] > 0 ? '+' : '-'}`);
  }
  const keys = Object.keys(hits);
  console.log(u.id, 'cells:', keys.length, keys.slice(0, 8).map(k => `${k}[${hits[k].length}] ${hits[k].slice(0, 4).join(' ')}`).join(' | '));
}
