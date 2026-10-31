import { expect } from 'playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { openGame, pause, resume, speed, choose } from './browser.mjs';
const ctx = await openGame(); const { page, browser, errors } = ctx;
const results = [];
try {
  for (const [fac, worker, building, troop] of [['HUMANS','Послушник','Казармы','Мечник'],['SPIDERS','Ткач','Инкубатор','Клык']]) {
    await page.locator(`[data-fac="${fac}"]`).click(); await pause(page);
    await page.getByText('Приказы без ПКМ', { exact: true }).click();
    await expect(page.locator('#fac-name')).not.toContainText('наблюдение');
    await page.getByRole('button',{name:'Главное здание',exact:true}).click();
    await expect(page.getByRole('button', { name: worker+' (Q)', exact:true })).toBeVisible();
    await page.getByRole('button', { name: worker+' (Q)', exact:true }).click();
    await expect(page.locator('#queue')).toContainText(worker);
    await expect(page.locator('#r-e')).toHaveText(fac==='HUMANS'?'425':'430');
    await expect(page.locator('#tactical-status')).toContainText('Рабочие: 5');
    await page.getByRole('button',{name:'Рабочие',exact:true}).click();
    await page.getByRole('button',{name:'Добывать эссенцию',exact:true}).click();
    await expect(page.locator('#tactical-status')).toContainText('добывают: 5');
    await page.getByRole('button',{name:'Свободный рабочий',exact:true}).click();
    await page.getByRole('button',{name:building+' (Q)',exact:true}).click();
    await expect(page.locator('#tactical-status')).toContainText('размещение: '+building);
    await page.getByRole('button',{name:'Построить рядом с базой',exact:true}).click();
    await expect(page.locator('#log')).toContainText('Приказ на строительство: '+building);
    await expect(page.locator('#info-text')).toContainText('Строит');
    await expect(page.locator('#tactical-status')).toContainText('добывают: 4');
    await expect(page.locator('#pick-building option')).toHaveCount(2); // no foundation yet
    await speed(page, 4); await resume(page);
    const pending = page.locator('#pick-building option').filter({hasText:new RegExp('^'+building+' #\\d+ · строится$')});
    await expect(pending).toHaveCount(1,{timeout:12000});
    const bid = await pending.getAttribute('value');
    await choose(page,'Выбрать здание',bid);
    await expect(page.locator('#info-text')).toContainText('Строится:');
    await expect(page.locator('#cmds button[data-train]'), 'unfinished buildings cannot train any unit').toHaveCount(0);
    await expect(page.locator('#tactical-status')).toContainText('Рабочие: 6',{timeout:12000});
    await page.getByRole('button',{name:'Главное здание',exact:true}).click();
    await expect(page.locator('#queue button')).toHaveCount(0);
    const afterPayment = fac==='HUMANS' ? 265 : 270;
    await expect.poll(async () => Number(await page.locator('#r-e').innerText()), { timeout: 10000 }).toBeGreaterThan(afterPayment); // actual delivery, not just any change
    await expect(page.locator(`#pick-building option[value="${bid}"]`)).not.toContainText('строится',{timeout:20000});
    await choose(page,'Выбрать здание',bid); await pause(page);
    const button = page.locator('#cmds button').filter({hasText:troop});
    await expect(button).toHaveCount(1); await button.click();
    await expect(page.locator('#queue')).toContainText(troop);
    await resume(page);
    await expect(page.locator('#tactical-status')).toContainText('армия: 1',{timeout:15000});
    await pause(page);
    await page.screenshot({path:`../../GAME/reports/ui-${fac.toLowerCase()}.png`});
    results.push({fac, buildingId:bid, status:await page.locator('#tactical-status').innerText(), passed:true});
    // Restart through the existing end/menu controls (the regression checks above do not use surrender as match evidence).
    await page.getByRole('button',{name:'Сдаться',exact:true}).click();
    await page.getByRole('button',{name:'Подтвердить сдачу',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Поражение',exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Выбор фракции',exact:true}).click();
  }
  assert.deepEqual(errors,[], 'page/console/network errors');
  await mkdir('../../GAME/reports',{recursive:true});
  await writeFile('../../GAME/reports/ui-regressions.json',JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({results,errors},null,2));
} finally { await browser.close(); }
