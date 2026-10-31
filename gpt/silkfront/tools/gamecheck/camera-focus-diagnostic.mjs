// Focus-environment diagnostic only; never changes game state or application files.
import { readFile } from 'node:fs/promises';
import { openGame } from './browser.mjs';
const implementation = await readFile(new URL('node_modules/playwright-core/lib/coreBundle.js', import.meta.url), 'utf8');
const needle = 'setFocusEmulationEnabled', at = implementation.indexOf(needle);
console.log('Playwright focus setup:', implementation.slice(Math.max(0, at - 350), at + 350));
const { browser, page } = await openGame({ headed: true });
const focus = p => p.evaluate(() => ({ focus: document.hasFocus(), visibility: document.visibilityState }));
try {
  const other = await page.context().newPage(); await other.goto('about:blank'); await other.bringToFront();
  await page.waitForTimeout(200); console.log('Default focus:', await focus(page), await focus(other));
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  const otherSession = await page.context().newCDPSession(other);
  await otherSession.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  await page.bringToFront(); await page.waitForTimeout(100);
  console.log('Native first:', await focus(page), await focus(other));
  await other.bringToFront(); await page.waitForTimeout(200);
  console.log('Native second:', await focus(page), await focus(other));
} finally { await browser.close(); }
