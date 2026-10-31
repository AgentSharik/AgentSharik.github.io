import { openGame } from './browser.mjs';
const { browser, page, errors } = await openGame();
try {
  const cdp = await page.context().newCDPSession(page); await cdp.send('Network.enable');
  cdp.on('Network.responseReceived', e => { if (e.response.status >= 400) console.log('CDP HTTP', e.response.status, e.response.url); });
  page.on('console', m => console.log('console', m.type(), m.text(), JSON.stringify(m.location())));
  await page.reload(); await page.locator('[data-fac="SPIDERS"]:enabled').waitFor();
  await page.waitForTimeout(500);
  console.log(JSON.stringify(errors));
} finally { await browser.close(); }
