import assert from 'node:assert/strict';
import { state, geometry, neutral, miniPoint, bounds, keySample, stationary } from './camera-helpers.mjs';

export async function sizes(page, record) {
  if (await page.locator('#tactics').getAttribute('open') !== null) await page.locator('#tactics > summary').click();
  for (const [width, height] of [[1024,768],[720,640],[1440,300],[3600,2700],[1440,960]]) {
    await page.setViewportSize({ width, height }); await page.waitForTimeout(100);
    let s = await state(page); bounds(s);
    const { canvas: c } = await geometry(page), panel = await page.locator('#panel').boundingBox();
    assert.equal(c.y, 32, 'top edge below HUD'); assert.equal(c.y+c.height, panel.y, 'bottom edge above HUD');
    await miniPoint(page,0.5,0.5); await miniPoint(page,0.0001,0.0001); await miniPoint(page,0.9999,0.9999);
    await miniPoint(page,0.5,0.5); await neutral(page);
    if(width < s.pw) { const sample=await keySample(page,['d']); assert.ok(sample.dx>40); await stationary(page,'resize release'); }
    else { await keySample(page,['s','d']); s=await state(page); assert.equal(s.x,0); assert.equal(s.y,0); }
    await page.screenshot({path:`../../GAME/reports/camera-03/size-${width}x${height}.png`});
    record('RESIZE',`${width}x${height}: canvas bounds, minimap mapping, WASD/clamp`);
  }
  // CSS scaling changes displayed content/borders without changing the bitmap.
  await page.locator('#mini').evaluate(el=>{el.style.transform='scale(0.8)';el.style.transformOrigin='left top';});
  await miniPoint(page,0.35,0.4); await miniPoint(page,0.7,0.65);
  await page.locator('#mini').evaluate(el=>{el.style.transform='';el.style.transformOrigin='';});
  await page.locator('#view').evaluate(el=>{el.style.transform='scale(0.8)';el.style.transformOrigin='left top';});
  await miniPoint(page,0.5,0.5); await neutral(page);
  let {canvas:c}=await geometry(page), before=await state(page);
  await page.mouse.move(c.x+c.width-1,c.y+c.height/2); await page.waitForTimeout(180);
  assert.ok((await state(page)).x>before.x,'edge pan uses displayed canvas rect');
  await page.locator('#view').evaluate(el=>{el.style.transform='';el.style.transformOrigin='';}); await neutral(page);
  bounds(await state(page)); record('SCALE','Scaled minimap borders/content and canvas edge navigation');
}
