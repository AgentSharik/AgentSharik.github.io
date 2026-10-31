// Review-only: renders contact sheets of the current human units for assessment.
// Reads existing PNG exports; never writes into ART/HUMANS or ART/SPIDERS.
const fs = require('fs'), path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'ART/CATALOG/REVIEW_HUMANS00');
fs.mkdirSync(out, { recursive: true });
const report = JSON.parse(fs.readFileSync(path.join(root, 'ART/CATALOG/units_report.json'))).report;
const b64 = p => fs.readFileSync(path.join(root, p)).toString('base64');
const text = (x, y, s, size = 13, c = '#cbd5e4') => `<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" fill="${c}">${s}</text>`;
const save = (name, W, H, body) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#1c2029"/>${body}</svg>`;
  fs.writeFileSync(path.join(out, name + '.svg'), svg);
  fs.writeFileSync(path.join(out, name + '.png'), new Resvg(svg).render().asPng());
};

// 1. Human state sheet: one representative frame per state, native 100%.
const humans = report.filter(u => u.fac === 'HUMANS');
const states = ['idle_00', 'walk_02', 'attack_03', 'hit_01', 'death_05'];
const C = 240, ox = 22, oy = 24; // crop window around pivot (144,228)
let body = text(20, 28, 'SILKFRONT · Орден Последнего Света · текущее состояние · 100%', 18);
states.forEach((s, i) => { body += text(150 + i * C + 8, 54, s, 12, '#97a5bb'); });
humans.forEach((u, r) => {
  const dir = `ART/HUMANS/UNITS/${u.id}`;
  const atlas = JSON.parse(fs.readFileSync(path.join(root, dir, `${u.id}_sheet.json`)));
  const sheet = b64(`${dir}/${u.id}_sheet.png`);
  const { w: SW, h: SH } = atlas.meta.size;
  const y = 64 + r * C;
  body += text(20, y + C / 2, u.ru, 14, '#e0b070');
  states.forEach((s, i) => {
    const fr = (atlas.frames[s] || Object.values(atlas.frames).pop()).frame;
    const x = 150 + i * C;
    body += `<rect x="${x}" y="${y}" width="${C - 6}" height="${C - 6}" rx="4" fill="#2b303c"/>`;
    body += `<svg x="${x}" y="${y}" width="${C - 6}" height="${C - 6}" viewBox="${fr.x + ox} ${fr.y + oy} ${C - 6} ${C - 6}"><image width="${SW}" height="${SH}" href="data:image/png;base64,${sheet}"/></svg>`;
  });
});
save('humans_states_100', 150 + states.length * C, 64 + humans.length * C + 10, body);

// 2. Mixed lineup of all ten units at game scales (same pivot line, no fitting).
for (const [label, z] of [['100', 1], ['50', 0.5], ['33', 0.33]]) {
  const gap = Math.max(60, 150 * z), W = 40 + gap * 10, H = 90 + 200 * z + 40;
  let b = text(20, 28, `Линейка 10 юнитов · idle_00 · ${label}%`, 16);
  const py = 70 + 190 * z;
  b += `<rect x="10" y="${py - 160 * z - 10}" width="${W - 20}" height="${180 * z + 30}" fill="#3a3f37"/>`;
  report.forEach((u, i) => {
    const px = 20 + gap * i + gap / 2;
    const img = b64(`ART/${u.fac}/UNITS/${u.id}.png`);
    b += `<image x="${px - 144 * z}" y="${py - 228 * z}" width="${288 * z}" height="${288 * z}" href="data:image/png;base64,${img}"/>`;
    if (z === 1) b += text(px - 40, H - 12, u.ru, 11, u.fac === 'HUMANS' ? '#e0b070' : '#7ad0c5');
  });
  save(`lineup10_${label}`, W, H, b);
}
// 3. Detail zoom (300%, nearest-neighbour off) of idle_00 to judge materials and volume.
{
  let b = text(20, 28, 'Люди · idle_00 · увеличение 300% (только для оценки деталей)', 16);
  humans.forEach((u, i) => {
    const img = b64(`ART/HUMANS/UNITS/${u.id}.png`);
    const x = 20 + i * 366;
    b += `<rect x="${x}" y="44" width="360" height="360" rx="4" fill="#2b303c"/>`;
    b += `<svg x="${x}" y="44" width="360" height="360" viewBox="84 118 120 120"><image width="288" height="288" href="data:image/png;base64,${img}"/></svg>`;
    b += text(x + 8, 424, u.ru, 13, '#e0b070');
  });
  save('humans_zoom300', 20 + 5 * 366, 440, b);
}
console.log('Created review sheets in ART/CATALOG/REVIEW_HUMANS00 (no unit assets touched).');
