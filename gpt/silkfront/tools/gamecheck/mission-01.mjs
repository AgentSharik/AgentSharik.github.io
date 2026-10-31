// Real-browser mission acceptance using only normal mouse/keyboard/DOM controls.
// No game object access, state injection, forced damage, AI(0), or direct simulation steps.
import { expect } from 'playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { openGame, pause, resume, speed, choose } from './browser.mjs';
const c = await openGame(), { page, browser, errors, url } = c;
const btn = (name) => page.getByRole('button', { name, exact: true });
const trace = [], results = [];
let actions = 0, recruits = 0;
async function click(name) { await btn(name).click(); actions++; }
async function time() { const s = await page.locator('#clock').innerText(), m = s.match(/(\d+):(\d+)/); return +m[1] * 60 + +m[2]; }
async function selectBuilding(prefix) {
  const options = await page.locator('#pick-building option').evaluateAll((os) => os.map((o) => ({ value: o.value, text: o.textContent })));
  const b = options.find((o) => o.text.startsWith(prefix + ' #') && !o.text.includes('строится'));
  assert.ok(b, 'completed ' + prefix); await choose(page, 'Выбрать здание', b.value);
}
async function moveAt(tx, ty, attack = false) {
  await page.getByLabel('Клетка X', { exact: true }).fill(String(tx));
  await page.getByLabel('Клетка Y', { exact: true }).fill(String(ty));
  await click(attack ? 'Атакующий марш в клетку' : 'Идти в клетку');
}
async function launch() {
  await click('Брифинг миссии'); await expect(page.locator('#brief-title')).toHaveText('Пепельная окраина');
  await expect(page.locator('#brief-campaign')).toContainText('Последний Свет');
  await click('Начать миссию'); await pause(page);
  await expect(page.locator('#fac-name')).toHaveText('Орден Последнего Света');
  await expect(page.locator('#mission-tasks li')).toHaveCount(5);
  await page.locator('#tactics > summary').click();
}
async function selectWorkerOnCanvas(tx, ty, base = [12,45,4]) {
  await click('К поселению');
  // Coordinates derive from viewport and authored mission coordinates, not a game-state read.
  const cv = await page.locator('#view').boundingBox();
  const baseX = (base[0] + base[2]/2)*32, baseY = (base[1] + base[2]/2)*32;
  const camX = Math.max(0, Math.min(3072-cv.width, baseX-cv.width/2));
  const camY = Math.max(0, Math.min(2304-cv.height, baseY-cv.height/2));
  await page.mouse.click(cv.x+(tx+0.5)*32-camX, cv.y+(ty+0.5)*32-camY-15);
  await expect(page.locator('#info-text h3')).toHaveText('Послушник'); actions++;
}
try {
  // Unknown and inherited object keys must not open a broken briefing or start a match.
  for (const id of ['unknown', 'constructor', '__proto__']) {
    await page.goto(url + '?mission=' + id);
    await expect(page.locator('#btn-mission')).toBeEnabled();
    await expect(page.locator('#mission-briefing')).not.toBeVisible();
    await expect(page.locator('#menu')).toBeVisible();
  }
  // Query URL opens briefing without auto-starting a battle or obeying the skirmish observer checkbox.
  await page.goto(url + '?mission=ash-outskirts');
  await expect(page.locator('#mission-briefing')).toBeVisible();
  await click('Назад в меню');
  await page.getByLabel('Наблюдать ИИ против ИИ (обычные ресурсы и правила)').check();
  await launch();
  await expect(page.locator('#r-e')).toHaveText('500');
  await expect(page.locator('#r-s')).toHaveText('18/20');
  await expect(page.locator('#tactical-status')).toContainText('Рабочие: 6');
  await expect(page.locator('#tactical-status')).toContainText('армия: 6');
  // Start with all miners; take one worker for the tower and one for wood with a real canvas click.
  await click('Рабочие'); await click('Добывать эссенцию');
  await click('Свободный рабочий'); await click('Достроить здание');
  await expect(page.locator('#info-text')).toContainText('Строит');
  await selectWorkerOnCanvas(10,50); await click('Добывать древесину');
  await expect(page.locator('#tactical-status')).toContainText('добывают: 5');
  await click('Армия'); await moveAt(38,40,true);
  // Mouse path, selection, orders, camera, pause and rally are all exercised here.
  await click('Главное здание'); await click('Точка сбора на эссенции');
  await selectBuilding('Казармы'); await click('Мечник (Q)'); recruits++;
  await expect(page.locator('#queue')).toContainText('Мечник');
  await speed(page,4); await resume(page);
  await expect(page.locator('#objective-scout')).toHaveClass('done', { timeout: 12000 });
  await pause(page); await click('Армия'); await moveAt(61,33,true); await resume(page);
  const deadline = Date.now()+4*60*1000;
  while (!(await page.locator('#end').isVisible()) && Date.now()<deadline) {
    await pause(page);
    const t = await time(), status = await page.locator('#tactical-status').innerText();
    const [used,cap] = (await page.locator('#r-s').innerText()).split('/').map(Number);
    const e = +(await page.locator('#r-e').innerText()), wood = +(await page.locator('#r-w').innerText());
    const pending = await page.locator('#pick-building option').evaluateAll((os) => os.some((o) => o.textContent.includes('строится')));
    if (!pending && cap-used<=5 && cap<60 && e>=90 && wood>=40) {
      await click('Свободный рабочий'); await click('Часовня (T)'); await click('Построить рядом с базой');
    }
    await click('Свободный рабочий');
    if ((await page.locator('#info-text').innerText()).includes('Ожидает')) await click('Добывать древесину');
    await selectBuilding('Казармы');
    if (await page.locator('#queue button').count()<2) {
      const name = ['Мечник (Q)','Арбалетчик (T)','Охотник на чудовищ (E)'][recruits%3];
      const troop = btn(name);
      if (!(await troop.evaluate((b)=>b.classList.contains('na')))) { await troop.click(); recruits++; actions++; }
    }
    const outpostDone = ((await page.locator('#objective-outpost').getAttribute('class')) || '').split(' ').includes('done');
    if (!outpostDone) {
      await click('Армия'); await moveAt(61,33,true);
    }
    trace.push({ time:t,status,supply:{used,cap},e,wood,recruits });
    await resume(page); await page.waitForTimeout(1500);
  }
  await expect(page.locator('#end-title')).toHaveText('Победа');
  await expect(page.locator('#end-reason')).toContainText('Передовой Инкубатор уничтожен');
  await expect(page.locator('#mission-tasks li.done')).toHaveCount(5);
  let clock = await page.locator('#clock').innerText(); await page.waitForTimeout(700);
  assert.equal(await page.locator('#clock').innerText(),clock);
  await mkdir('../../GAME/reports/mission-01',{recursive:true});
  await page.screenshot({path:'../../GAME/reports/mission-01/victory.png'});
  results.push({mode:'ordinary player UI vs AI',result:'victory',clock,actions,recruits,stats:await page.locator('#end-stats').innerText()});
  // Replay must reset all milestones, stock, guards and clock. Leave it unattended for natural defeat.
  await click('Повторить миссию'); await pause(page);
  await expect(page.locator('#mission-tasks li.done')).toHaveCount(0);
  await expect(page.locator('#r-e')).toHaveText('500'); await expect(page.locator('#r-w')).toHaveText('200');
  await expect(page.locator('#mission-guard')).toContainText('2400/2400');
  await speed(page,4); await resume(page);
  await expect(page.locator('#end-title')).toHaveText('Поражение',{timeout:100000});
  await expect(page.locator('#end-reason')).toContainText('Цитадель последнего поселения разрушена');
  clock = await page.locator('#clock').innerText(); await page.waitForTimeout(700); assert.equal(await page.locator('#clock').innerText(),clock);
  await page.screenshot({path:'../../GAME/reports/mission-01/defeat.png'});
  results.push({mode:'unattended settlement vs AI; no surrender',result:'defeat',clock,stats:await page.locator('#end-stats').innerText()});
  await click('В главное меню');
  await expect(page.locator('#mission-objectives')).toBeHidden();
  await page.getByLabel('Наблюдать ИИ против ИИ (обычные ресурсы и правила)').uncheck();
  await page.locator('[data-fac="SPIDERS"]').click(); await pause(page);
  await expect(page.locator('#fac-name')).toHaveText('Древняя Колония');
  await expect(page.locator('#mission-objectives')).toBeHidden();
  await expect(page.locator('#r-e')).toHaveText('500'); await expect(page.locator('#r-s')).toHaveText('5/10');
  assert.deepEqual(errors,[], 'console/network errors');
  await writeFile('../../GAME/reports/mission-01/browser.json',JSON.stringify({scope:'automated browser play, NOT independent human playtest',results,trace,errors},null,2));
  console.log(JSON.stringify({results,errors},null,2));
} catch(e) {
  await mkdir('../../GAME/reports/mission-01',{recursive:true});
  await page.screenshot({path:'../../GAME/reports/mission-01/failure.png'});
  await writeFile('../../GAME/reports/mission-01/failure.json',JSON.stringify({error:e.stack,results,trace,errors,text:await page.locator('body').innerText()},null,2));
  throw e;
} finally { await browser.close(); }
