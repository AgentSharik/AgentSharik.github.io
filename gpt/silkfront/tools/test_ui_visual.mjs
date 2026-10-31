import fs from 'node:fs';
import path from 'node:path';

const playwrightPath = path.resolve('D:/JAM/SILKFRONT/tools/gamecheck/node_modules/playwright/index.mjs');
const { chromium } = await import(`file://${playwrightPath}`);

async function testVisual() {
  const executablePath = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const outDir = path.resolve('D:/JAM/SILKFRONT/GAME/reports/ui_redesign');

  await page.goto('http://127.0.0.1:51557/GAME/index.html');
  await page.waitForSelector('[data-fac="HUMANS"]:not([disabled])', { timeout: 10000 });
  await page.click('#btn-mission');
  await page.waitForSelector('#mission-briefing[open]');
  await page.click('#btn-mission-start');
  await page.waitForSelector('#panel:not([hidden])');
  await page.waitForTimeout(800);

  // Select single combat unit (e.g. Swordsman)
  await page.evaluate(() => {
    const u = window.game?.world?.unitsOf(0).find(u => u.def.ru === 'Мечник');
    if (u) window.game.select([u.id]);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '07_single_swordsman.png') });
  console.log('Saved 07_single_swordsman.png');

  // Select single worker
  await page.evaluate(() => {
    const u = window.game?.world?.unitsOf(0).find(u => u.def.worker);
    if (u) window.game.select([u.id]);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, '08_single_worker.png') });
  console.log('Saved 08_single_worker.png');

  await browser.close();
  console.log('Done single unit captures.');
}

testVisual().catch(console.error);
