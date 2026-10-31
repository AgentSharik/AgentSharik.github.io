import { openGame } from './browser.mjs';
const { browser, page, url } = await openGame();
try {
  await page.goto(new URL('/ASSET_LIBRARY/review.html', url).href);
  await page.locator('body[data-ready="true"]').waitFor();
  await page.screenshot({path:'../../ASSET_LIBRARY/review-overview.png',fullPage:true});
  const images = await page.locator('canvas').count();
  console.log('Review canvases: ' + images);
} finally { await browser.close(); }
