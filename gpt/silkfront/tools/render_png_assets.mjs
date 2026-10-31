import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Use the playwright from gamecheck
const playwrightPath = path.resolve('D:/JAM/SILKFRONT/tools/gamecheck/node_modules/playwright/index.mjs');
const { chromium } = await import(`file://${playwrightPath}`);

const UI_DIR = path.resolve('D:/JAM/SILKFRONT/GAME/assets/ui');

async function renderPngs() {
  const executablePath = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage();

  const files = fs.readdirSync(UI_DIR).filter(f => f.endsWith('.svg'));
  console.log(`Rendering ${files.length} SVGs to PNG...`);

  for (const file of files) {
    const svgPath = path.join(UI_DIR, file);
    const pngPath = path.join(UI_DIR, file.replace(/\.svg$/, '.png'));
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    const wMatch = svgContent.match(/width="(\d+)"/);
    const hMatch = svgContent.match(/height="(\d+)"/);
    const width = wMatch ? parseInt(wMatch[1], 10) : 64;
    const height = hMatch ? parseInt(hMatch[1], 10) : 64;

    await page.setViewportSize({ width: Math.max(width, 100), height: Math.max(height, 100) });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;"><div id="box" style="display:inline-block;width:${width}px;height:${height}px;">${svgContent}</div></body></html>`);

    const elem = await page.$('#box');
    if (elem) {
      await elem.screenshot({ path: pngPath, omitBackground: true });
    }
  }

  await browser.close();
  console.log('Finished rendering all PNG assets.');
}

renderPngs().catch(console.error);
