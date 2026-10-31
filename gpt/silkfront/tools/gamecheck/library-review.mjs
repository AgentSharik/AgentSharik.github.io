// Read-only source extraction plus review exports. Never runs the library's clipboard/download UI.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
const executablePath = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const pageForExport = await browser.newPage();
const root = new URL('../../', import.meta.url);
const html = await readFile(new URL('ASSET_LIBRARY/reference/asset-library.html', root), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const assets = vm.runInNewContext(source + '\nA.map(a => ({id:a.id,name:a.n,category:a.cat,faction:a.fa,use:a.use,locations:a.loc,seed:a.sd,tile:a.tile,svg:S(a)}))', {}, { timeout: 5000 });
const out = new URL('ASSET_LIBRARY/review/', root); await mkdir(out, { recursive: true });
const rows = [];
for (const a of assets) {
  await writeFile(new URL(a.id + '.svg', out), a.svg);
  const png = await pageForExport.evaluate(async svg => {
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; cv.getContext('2d').drawImage(img, 0, 0);
    return cv.toDataURL('image/png').split(',')[1];
  }, a.svg);
  await writeFile(new URL(a.id + '.png', out), Buffer.from(png, 'base64'));
  const { svg, ...meta } = a; rows.push({ ...meta, sourceSize: [256,256], pivotPx: a.tile || a.id.startsWith('edge_') ? null : [128,228], accepted: false });
}
await writeFile(new URL('manifest.json', out), JSON.stringify(rows, null, 2));
const panels = [assets.slice(0,12), assets.slice(12,27), assets.slice(27)];
const unit = '../ART/HUMANS/UNITS/human_swordsman/human_swordsman_idle.png';
const safe = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;');
let page = '<!doctype html><html lang="ru"><meta charset="utf-8"><title>SILKFRONT — совместимость библиотеки</title><style>body{background:#171b22;color:#ddd;font:14px system-ui;margin:20px}h1{font-size:22px}section{display:grid;grid-template-columns:repeat(auto-fit,240px);gap:10px;margin-bottom:30px}article{background:#30392f;padding:8px;min-height:175px}canvas{display:block}small{display:block;color:#ccc}</style><h1>ASSET LIBRARY — обзор совместимости, не художественное принятие</h1><p>Окружение ×0.5 и Мечник ×0.5, общая линия опоры. SVG оригиналы сохранены; PNG — проверочный экспорт Chromium.</p>';
for (const [i,panel] of panels.entries()) {
  page += '<h2 id="section-' + i + '">' + ['Ландшафт и переходы','Растительность','Камни и окружение'][i] + '</h2><section>';
  for (const a of panel) page += `<article><b>${safe(a.name)}</b><canvas width="224" height="145" data-id="${a.id}" data-ground="${a.tile || a.id.startsWith('edge_')}"></canvas><small>${a.id}</small></article>`;
  page += '</section>';
}
page += `<script>const unit=new Image();unit.src=${JSON.stringify(unit)};const ready=[unit.decode()];for(const c of document.querySelectorAll('canvas')){const im=new Image();im.src='review/'+c.dataset.id+'.png';ready.push(im.decode().then(()=>{const g=c.getContext('2d');if(c.dataset.ground==='true'){g.drawImage(im,0,0,128,128);g.drawImage(im,128,0,128,128)}else{g.drawImage(im,12,122-114,128,128);g.strokeStyle='#89a';g.beginPath();g.moveTo(0,122);g.lineTo(224,122);g.stroke()}return unit.decode().then(()=>g.drawImage(unit,0,0,288,288,156-72,122-114,144,144))}))}Promise.all(ready).then(()=>{document.body.dataset.ready='true'})</script></html>`;
await writeFile(new URL('review.html', new URL('ASSET_LIBRARY/', root)), page);
await browser.close();
console.log(`Exported ${assets.length} SVG/PNG pairs via Chromium for review only`);
