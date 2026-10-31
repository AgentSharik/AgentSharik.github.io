// Review-only contact sheets for pass 02 (humans). Native PNG scale, no per-unit fit.
const fs = require('fs'), path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'ART/CATALOG/REVIEW_PASS02');
fs.mkdirSync(out, { recursive: true });
const units = JSON.parse(fs.readFileSync(path.join(root, 'ART/CATALOG/units_report.json'))).report.filter(u => u.fac === 'HUMANS');
const W = 808, H = 380, gap = 152, start = 24;
const text = (x,y,s,size=13,c='#cbd5e4') => `<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" fill="${c}">${s}</text>`;
for (const [label, z] of [['100',1], ['50',.5], ['33',.33]]) {
  let body = `<rect width="${W}" height="${H}" fill="#171b25"/>`;
  body += text(24,30,`SILKFRONT · Орден Последнего Света · проход 02 · ${label}%`,19);
  body += text(24,52,'Один кадр idle_00 · общий масштаб PNG · опора 144,228 · без подгонки моделей',12,'#97a5bb');
  units.forEach((u,i) => { body += text(start+i*gap+8,77,u.ru.replace(' Последнего Света',''),14,'#d9b96a'); });
  for (const [version, base, top] of [['ДО · исходная версия','REVIEW_BACKUP_02/',108], ['ПОСЛЕ · объём, накладки, материалы, контурный свет','',250]]) {
    body += text(24,top-9,version,12);
    units.forEach((u,i) => {
      const x = start + i*gap, px = x+74, py = top+100;
      const img = fs.readFileSync(path.join(root, base, `ART/HUMANS/UNITS/${u.id}.png`)).toString('base64');
      body += `<rect x="${x}" y="${top}" width="148" height="120" rx="4" fill="#2b303c"/>`;
      body += `<path d="M${x+6},${py}H${x+142}" stroke="#a0aabd" stroke-width=".5" opacity=".25"/>`;
      body += `<image x="${px-144*z}" y="${py-228*z}" width="${288*z}" height="${288*z}" href="data:image/png;base64,${img}"/>`;
    });
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
  fs.writeFileSync(path.join(out, `humans_${label}.svg`), svg);
  fs.writeFileSync(path.join(out, `humans_${label}.png`), new Resvg(svg).render().asPng());
}
console.log('Created 3 native-scale comparison PNG/SVG sheets (100%, 50%, 33%).');
