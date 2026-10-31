import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
export async function openGame({ headed = false, url = process.argv[2] } = {}) {
  if (!url || !/^http:\/\/127\.0\.0\.1:\d+\/GAME\/index\.html$/.test(url)) throw new Error('Pass the actual URL from serve.js');
  const executablePath = process.env.SILKFRONT_BROWSER || ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync);
  const browser = await chromium.launch({ headless: !headed, ...(executablePath ? { executablePath } : {}) });
  // Explicit context permits the camera regression to open a real second tab for blur/focus.
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text() + ' ' + JSON.stringify(m.location())); });
  page.on('requestfailed', r => errors.push(r.url() + ': ' + r.failure()?.errorText));
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
  await page.goto(url); await page.locator('[data-fac="HUMANS"]:enabled').waitFor();
  return { browser, page, errors, url };
}
export async function choose(page, label, value) { await page.getByRole('combobox', { name: label, exact: true }).selectOption(value); }
export async function pause(page) { const b=page.getByRole('button', { name: 'Пауза', exact: true }); if (await b.isVisible()) await b.click(); }
export async function resume(page) { const b=page.getByRole('button', { name: 'Продолжить', exact: true }); if (await b.isVisible()) await b.click(); }
export async function speed(page, n) { await choose(page, 'Скорость игры', String(n)); }
