// Player-slot acceptance run through normal DOM controls only. No AI(0), state injection,
// free resources, world.step(), scripted kills or surrender. This is automated UI play, not a human playtest.
import { expect } from 'playwright/test';
import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { openGame, pause, resume, speed, choose } from './browser.mjs';
const fac = process.argv[3];
if (!['HUMANS','SPIDERS'].includes(fac)) throw new Error('Pass HUMANS or SPIDERS after the URL');
const c = await openGame({ headed: true }); const { page, browser, errors } = c;
const H = fac === 'HUMANS', prod = H ? 'Казармы' : 'Инкубатор', supply = H ? 'Часовня' : 'Камера выводка';
const worker = H ? 'Послушник' : 'Ткач', trace = [];
const btn = name => page.getByRole('button', { name, exact: true });
let recruits = 0, lastWave = 0, actionCount = 0;
async function click(name) { await btn(name).click(); actionCount++; }
async function status() { return page.locator('#tactical-status').innerText(); }
async function gameTime() { const t = await page.locator('#clock').innerText(); const m = t.match(/(\d+):(\d+)/); return m ? Number(m[1])*60+Number(m[2]) : 0; }
async function build(name) {
  await click('Свободный рабочий'); await click(name+' ('+(name===supply?'T':'Q')+')'); await click('Построить рядом с базой');
}
try {
  await page.locator(`[data-fac="${fac}"]`).click(); await pause(page); await page.getByText('Приказы без ПКМ',{exact:true}).click();
  await expect(page.locator('#fac-name')).not.toContainText('наблюдение');
  await click('Рабочие'); await click('Добывать эссенцию');
  await build(prod);
  await click('Свободный рабочий'); await click('Добывать древесину');
  await click('Главное здание'); await click('Точка сбора на эссенции');
  await click(worker+' (Q)'); await click(worker+' (Q)');
  await speed(page,4); await resume(page);
  await expect(page.locator('#tactical-status')).toContainText('Рабочие: 7',{timeout:15000});
  await pause(page); await click('Свободный рабочий'); await click('Добывать древесину');
  await click('Главное здание'); await click(worker+' (Q)'); await click(worker+' (Q)'); await resume(page);
  // Each loop inspects the DOM, issues a bounded batch, then lets the real 4x clock run.
  const deadline = Date.now() + 10*60*1000;
  let seenCombat = false, lastCapture = -100;
  while (!(await page.locator('#end').isVisible()) && Date.now() < deadline) {
    await pause(page);
    const t = await gameTime(), s = await status();
    const e = Number(await page.locator('#r-e').innerText()), wood = Number(await page.locator('#r-w').innerText());
    const [used,cap] = (await page.locator('#r-s').innerText()).split('/').map(Number);
    const opts = await page.locator('#pick-building option').evaluateAll(os => os.map(o => ({id:o.value,text:o.textContent})));
    const pending = opts.some(o => o.text.includes('строится'));
    const bases = opts.filter(o => o.text.startsWith(prod+' #'));
    const supplies = opts.filter(o => o.text.startsWith(supply+' #'));
    const totalArmy = Number(s.match(/армия: (\d+)/)?.[1] || 0);
    if (!pending && cap-used<=5 && cap<60 && e>=90 && wood>=40) await build(supply);
    else if (!pending && bases.length<2 && t>70 && e>=340 && wood>=100) await build(prod);
    // Completed builders return to wood; miners and existing builders are not interrupted.
    if (!pending) {
      await click('Свободный рабочий');
      const info = await page.locator('#info-text').innerText();
      if (info.includes('Ожидает')) await click('Добывать древесину');
    }
    for (const b of bases.filter(b => !b.text.includes('строится'))) {
      await choose(page,'Выбрать здание',b.id);
      const q = await page.locator('#queue button').count();
      if (q<2) {
        const name = H ? (recruits%3===1?'Арбалетчик (T)':'Мечник (Q)') : (recruits%4===2?'Плеватель (E)':'Клык (T)');
        const command = btn(name);
        if (await command.count() && !await command.evaluate(b=>b.classList.contains('na'))) { await command.click(); recruits++; actionCount++; }
      }
    }
    if (H && totalArmy>=4 && supplies.length) {
      const b=supplies.find(b=>!b.text.includes('строится'));
      if(b) { await choose(page,'Выбрать здание',b.id); if(await page.locator('#queue button').count()<1 && recruits%7===0) { const priest=btn('Жрец Ордена (Q)'); if(!await priest.evaluate(b=>b.classList.contains('na'))) { await priest.click(); recruits++; } } }
    }
    if (totalArmy>=6 && t-lastWave>=18) { await click('Армия'); await click('Атаковать базу врага'); lastWave=t; seenCombat=true; }
    if(t-lastCapture>=45) {
      lastCapture=t; trace.push({time:t,e,wood,used,cap,status:s,buildings:opts.filter(o=>o.id),recruits});
      console.log(fac,JSON.stringify(trace.at(-1)));
      await page.screenshot({path:`../../GAME/reports/match-${fac.toLowerCase()}-latest.png`});
    }
    await resume(page); await page.waitForTimeout(1800);
  }
  await expect(page.locator('#end')).toBeVisible({timeout:1000});
  const title = await page.locator('#end-title').innerText(), stats = await page.locator('#end-stats').innerText();
  assert.ok(['Победа','Поражение','Ничья'].includes(title)); assert.ok(seenCombat && recruits>=8 && actionCount>35,'complete played economy and combat');
  assert.deepEqual(errors,[],'console/network errors');
  const clock = await page.locator('#clock').innerText(); await page.waitForTimeout(1000); assert.equal(await page.locator('#clock').innerText(),clock,'finished clock frozen');
  await mkdir('../../GAME/reports',{recursive:true});
  const report={fac,mode:'player-slot through UI; opponent AI only; automated play, not independent human playtest',speed:4,seed:7,title,stats,clock,recruits,actionCount,trace,errors};
  await writeFile(`../../GAME/reports/match-${fac.toLowerCase()}.json`,JSON.stringify(report,null,2));
  await page.screenshot({path:`../../GAME/reports/match-${fac.toLowerCase()}-end.png`});
  console.log('NATURAL END',JSON.stringify({fac,title,stats,recruits,actionCount,errors}));
} finally { await browser.close(); }
