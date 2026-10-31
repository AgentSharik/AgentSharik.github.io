// SILKFRONT art build, review gate 01: style guide sheets + 10 combat units.
// Heroes / buildings / icons are intentionally NOT built until the units are approved.
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');
const { P, SWATCHES } = require('./lib/palette');
const { FRAME, STATES, expand, lerpPose } = require('./lib/anim');
const { g, f, line, ell } = require('./lib/shapes');
const { UNITS, frames } = require('./units/registry');

const ORDER = Object.keys(STATES);
// One frame in local cell coordinates (0..FRAME.w). rot/ty/fade are handled here so
// both rigs share the same pivot contract.
function cell(u, p, ox = 0, oy = 0) {
  const tr = `translate(${f(ox + FRAME.px)},${f(oy + FRAME.py + (p.ty || 0))}) rotate(${f(p.rot || 0)})`;
  return g(u.rig.figure(u.kit, p), tr, p.fade ? `opacity="${f(1 - p.fade)}"` : '');
}

// Re-rasterise the saved SVG master and measure opaque pixels per cell.
const { Resvg } = require('@resvg/resvg-js');
function measure(rel, cols, rows) {
  const svg = fs.readFileSync(path.join(C.SRC, rel.replace(/\.png$/, '.svg')), 'utf8');
  const img = new Resvg(svg, { fitTo: { mode: 'width', value: cols * FRAME.w * FRAME.scale } }).render();
  const W = img.width, px = img.pixels, cw = FRAME.w * FRAME.scale, out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = r * cw; y < (r + 1) * cw; y++) for (let x = c * cw; x < (c + 1) * cw; x++) {
      if (px[(y * W + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    out.push(x1 < 0 ? null : { x0: x0 - c * cw, y0: y0 - r * cw, x1: x1 - c * cw, y1: y1 - r * cw });
  }
  return out;
}

const report = [];
for (const u of UNITS) {
  const dir = `${u.fac}/UNITS/${u.id}`;
  const all = ORDER.map((s) => frames(u, s));
  const cols = Math.max(...all.map((a) => a.length));
  // preview (idle frame 0)
  C.render(`${u.fac}/UNITS/${u.id}.png`, FRAME.w, FRAME.h, cell(u, all[0][0]),
    { scale: FRAME.scale, purpose: `${u.ru}: превью, idle 0`, category: 'unit' });
  // per-state strips
  ORDER.forEach((s, i) => {
    const body = all[i].map((p, j) => cell(u, p, j * FRAME.w, 0)).join('');
    C.render(`${dir}/${u.id}_${s}.png`, all[i].length * FRAME.w, FRAME.h, body,
      { scale: FRAME.scale, purpose: `${u.ru}: ${s}, ${all[i].length} кадров @${STATES[s].fps} fps`, category: 'animation' });
  });
  // full sheet: one row per state
  const sheetRel = `${dir}/${u.id}_sheet.png`;
  const body = all.map((row, r) => row.map((p, c) => cell(u, p, c * FRAME.w, r * FRAME.h)).join('')).join('');
  C.render(sheetRel, cols * FRAME.w, ORDER.length * FRAME.h, body,
    { scale: FRAME.scale, purpose: `${u.ru}: spritesheet (строки ${ORDER.join('/')})`, category: 'spritesheet' });
  const boxes = measure(sheetRel, cols, ORDER.length);
  const cw = FRAME.w * FRAME.scale, frameMap = {}, anims = {};
  let clipped = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
  all.forEach((row, r) => {
    anims[ORDER[r]] = { ...STATES[ORDER[r]], frames: [] };
    row.forEach((_, c) => {
      const b = boxes[r * cols + c], name = `${ORDER[r]}_${String(c).padStart(2, '0')}`;
      if (b) { if (b.x0 <= 0 || b.y0 <= 0 || b.x1 >= cw - 1 || b.y1 >= cw - 1) clipped++;
        minX = Math.min(minX, b.x0); minY = Math.min(minY, b.y0); maxX = Math.max(maxX, b.x1); maxY = Math.max(maxY, b.y1); }
      frameMap[name] = { frame: { x: c * cw, y: r * cw, w: cw, h: cw }, rotated: false, trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: cw, h: cw }, sourceSize: { w: cw, h: cw },
        pivot: { x: FRAME.px / FRAME.w, y: FRAME.py / FRAME.h } };
      anims[ORDER[r]].frames.push(name);
    });
  });
  const atlas = { frames: frameMap, animations: anims, meta: { app: 'silkfront-artgen', image: `${u.id}_sheet.png`,
    size: { w: cols * cw, h: ORDER.length * cw }, scale: '1', facing: '+x (right)', pivotPx: [FRAME.px * FRAME.scale, FRAME.py * FRAME.scale] } };
  fs.writeFileSync(path.join(C.ART, `${dir}/${u.id}_sheet.json`), JSON.stringify(atlas, null, 1));
  report.push({ id: u.id, ru: u.ru, role: u.role, fac: u.fac, cols, clipped, frames: all.flat().length,
    bbox: [minX, minY, maxX, maxY], height: maxY >= 0 ? FRAME.py * FRAME.scale - minY : 0 });
}
// --- Scale lineup: all 10 idle frames side by side on one ground line, same rig scale. ---
// Row 1: full colour on moonlit ground. Row 2: pure silhouettes at 50% (≈ in-game zoom-out).
{
  const gap = 84, W = gap * UNITS.length + 40, H = 260, ground = 150;
  C.addDef('<filter id="sil"><feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.88  0 0 0 0 0.92  0 0 0 1 0"/></filter>');
  let body = `<rect width="${W}" height="${H}" fill="${P.night}"/>` +
    `<rect y="${ground - 18}" width="${W}" height="40" fill="#252833"/>` + line(0, ground, W, ground, P.fog, 0.5, 'opacity="0.4"');
  for (let y = ground; y > 40; y -= 20) body += line(8, y, 16, y, P.fog, 0.6, 'opacity="0.5"');
  UNITS.forEach((u, i) => {
    const p = frames(u, 'idle')[0], x = 40 + i * gap + gap / 2;
    body += g(u.rig.figure(u.kit, p), `translate(${x},${ground})`);
    body += g(g(u.rig.figure(u.kit, p), `translate(${x * 2},${(H - 14) * 2}) `), 'scale(0.5)',
      `filter="url(#sil)"`);
  });
  C.render('STYLE_GUIDE/scale_lineup.png', W, H, body, { scale: 2, bg: P.night,
    purpose: 'Линейка масштаба: 10 юнитов idle в одном масштабе + силуэты 50%', category: 'style_guide' });
}
fs.mkdirSync(path.join(C.ART, 'CATALOG'), { recursive: true });
fs.writeFileSync(path.join(C.ART, 'CATALOG/units_report.json'), JSON.stringify({ frame: FRAME, states: STATES, report,
  manifest: C.manifest }, null, 1));
const { writeGallery, writeManifest } = require('./gallery');
writeGallery(UNITS, report);
writeManifest(report);
for (const r of report) console.log(`${r.id.padEnd(22)} frames=${r.frames} clipped=${r.clipped} bbox=${r.bbox.join(',')} h=${r.height}`);
module.exports = { UNITS, report };
