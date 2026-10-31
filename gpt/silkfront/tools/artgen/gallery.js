// Writes ART/CATALOG/gallery.html (self-contained data, plays atlases on <canvas>)
// and ART/CATALOG/ASSET_MANIFEST.md from the build report + recorded manifest.
const fs = require('fs');
const path = require('path');
const C = require('./lib/core');
const { FRAME, STATES } = require('./lib/anim');

function writeGallery(UNITS, report) {
  const cat = path.join(C.ART, 'CATALOG');
  fs.mkdirSync(cat, { recursive: true });
  const units = UNITS.map((u) => {
    const dir = `${u.fac}/UNITS/${u.id}`;
    const atlas = JSON.parse(fs.readFileSync(path.join(C.ART, `${dir}/${u.id}_sheet.json`), 'utf8'));
    const r = report.find((x) => x.id === u.id);
    return { id: u.id, ru: u.ru, role: u.role, fac: u.fac, dir: `../${dir}`, svgDir: `../../ART_SRC/${dir}`,
      preview: `../${u.fac}/UNITS/${u.id}.png`, clipped: r.clipped, height: r.height, atlas };
  });
  const data = { cell: FRAME.w * FRAME.scale, pivot: [FRAME.px * FRAME.scale, FRAME.py * FRAME.scale], states: STATES, units };
  const tpl = fs.readFileSync(path.join(__dirname, 'gallery.template.html'), 'utf8');
  // Inline the viewer script so gallery.html opens straight from disk (file://), no server.
  const view = fs.readFileSync(path.join(__dirname, 'gallery_view.js'), 'utf8');
  const html = tpl.replace('/*DATA*/null', () => JSON.stringify(data))
    .replace('<script src="gallery_view.js"></script>', () => `<script>\n${view}\n</script>`);
  fs.writeFileSync(path.join(cat, 'gallery.html'), html);
}

function writeManifest(report) {
  const rows = C.manifest.map((m) => {
    const svg = m.file.replace(/^ART\//, 'ART_SRC/').replace(/\.png$/, '.svg');
    return `| \`${m.file}\` | \`${svg}\` | ${m.category} | ${m.w}×${m.h} | ${m.purpose} | ${m.status} |`;
  });
  const qa = report.map((r) => `| ${r.ru} | \`${r.id}\` | ${r.frames} | ${r.clipped} | ${r.height}px | ${r.bbox.join(', ')} |`);
  const md = `# SILKFRONT — ASSET_MANIFEST\n\nСгенерировано \`tools/artgen/build.js\`. Статус «ready (concept v1)» означает: файл создан ` +
    `генератором и прошёл автоматическую проверку кадра (нет обрезки по краю ячейки). Визуальное одобрение — за арт-директором.\n\n` +
    `## Контракт спрайтов\n- Ячейка ${FRAME.w * FRAME.scale}×${FRAME.h * FRAME.scale} px, опора (ноги/центр на земле) ` +
    `${FRAME.px * FRAME.scale},${FRAME.py * FRAME.scale} px → Phaser \`setOrigin(${FRAME.px / FRAME.w}, ${(FRAME.py / FRAME.h).toFixed(4)})\`.\n` +
    `- Направление взгляда +X (вправо); влево — \`flipX\`. Один ракурс (3/4 сверху), не 8 направлений.\n` +
    `- Все юниты в одном масштабе рига (без подгонки под кадр). Строки листа: ${Object.keys(STATES).join(' / ')}.\n` +
    `- Загрузка: \`this.load.atlas(id, id + '_sheet.png', id + '_sheet.json')\`; анимации — в \`animations\` внутри JSON.\n\n` +
    `## Проверка кадров (10 юнитов)\n| Юнит | id | Кадров | Обрезано | Высота над опорой | bbox по всем кадрам |\n|---|---|---|---|---|---|\n${qa.join('\n')}\n\n` +
    `## Файлы\n| PNG (игровой ресурс) | SVG (исходник) | Категория | Размер | Назначение | Статус |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n\n` +
    `Плюс для каждого юнита \`*_sheet.json\` (Phaser atlas) рядом с листом. Герои, здания, иконки, карты, объекты, предметы: **не начаты** (ждут оценки юнитов).\n`;
  fs.writeFileSync(path.join(C.ART, 'CATALOG/ASSET_MANIFEST.md'), md);
}

module.exports = { writeGallery, writeManifest };
