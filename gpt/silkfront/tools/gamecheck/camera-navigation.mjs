import assert from 'node:assert/strict';
import { state, geometry, center, neutral, keySample, stationary, equalCamera, miniPoint, bounds, near, blurToTab } from './camera-helpers.mjs';

export async function navigation(page, mode, record) {
  const rates = [];
  for (const [keys, x, y] of [[['w'],0,-1],[['a'],-1,0],[['s'],0,1],[['d'],1,0],
    [['w','a'],-1,-1],[['w','d'],1,-1],[['s','a'],-1,1],[['s','d'],1,1]]) {
    await center(page); const sample = await keySample(page, keys);
    assert.equal(Math.sign(sample.dx), x, JSON.stringify(sample)); assert.equal(Math.sign(sample.dy), y, JSON.stringify(sample));
    assert.ok(sample.rate > 350 && sample.rate < 800, 'responsive normalized movement');
    assert.equal(sample.after.mode, ''); assert.equal(sample.after.place, null, 'WASD must not trigger HUD commands');
    rates.push({ keys: keys.join('+'), rate: sample.rate });
    await stationary(page, 'key release has no inertia');
  }
  const straight = rates.slice(0,4).reduce((a,b) => a + b.rate, 0) / 4;
  for (const r of rates.slice(4)) assert.ok(r.rate / straight > 0.7 && r.rate / straight < 1.25, 'no diagonal speed boost');
  await center(page); const opposing = await keySample(page, ['w','a','s','d']);
  equalCamera(opposing.after, opposing.before, 'opposing keys cancel while held');
  await stationary(page, 'opposing keys release');
  record(mode, 'WASD: 4 directions, 4 diagonals, opposite keys, release/no inertia', rates);

  const edges = [];
  for (const [edge, x, y] of [['left',-1,0],['right',1,0],['top',0,-1],['bottom',0,1]]) {
    await center(page); const { canvas: c } = await geometry(page), before = await state(page);
    await page.mouse.move(c.x + (x === -1 ? 1 : x === 1 ? c.width-1 : c.width/2), c.y + (y === -1 ? 1 : y === 1 ? c.height-1 : c.height/2));
    await page.waitForTimeout(280); const after = await state(page);
    assert.equal(Math.sign(after.x-before.x),x, edge); assert.equal(Math.sign(after.y-before.y),y, edge);
    assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>80, edge+' moves');
    edges.push({edge, dx:after.x-before.x,dy:after.y-before.y});
    await neutral(page); await stationary(page, 'leaving '+edge+' stops mouse movement');
  }
  const ramp = [];
  for (const distance of [28,16,1]) {
    await center(page); const { canvas:c }=await geometry(page), before=await state(page);
    await page.mouse.move(c.x+c.width-distance,c.y+c.height/2); await page.waitForTimeout(280);
    const after=await state(page); ramp.push((after.x-before.x)/((after.at-before.at)/1000));
    await neutral(page);
  }
  assert.ok(ramp[0]>0 && ramp[0]<ramp[1] && ramp[1]<ramp[2], 'edge speed increases near boundary');
  record(mode,'All four edges; increasing speed near edge; mouse leave stops', {edges,ramp});

  await center(page);
  for (const selector of ['#top','#panel','#mini','#tactics > summary',...(mode==='MISSION'?['#mission-objectives > summary']:[])]) {
    const r=await page.locator(selector).boundingBox(); assert.ok(r,selector);
    await page.mouse.move(r.x+Math.min(r.width/2,15),r.y+Math.min(r.height/2,15));
    await stationary(page,'UI does not edge-scroll: '+selector);
  }
  // A stationary pointer must stop when a panel appears above it, even without pointermove.
  await center(page); const {canvas:c}=await geometry(page);
  await page.mouse.move(c.x+c.width-12,c.y+150); await page.waitForTimeout(100);
  await page.locator('#tactics').evaluate(el => { el.open=true; });
  await stationary(page,'new overlay above stationary edge pointer');
  await page.locator('#tile-x').focus(); await neutral(page); await page.locator('#tile-x').focus();
  let before=await state(page); await keySample(page,['w','a','s','d']); equalCamera(await state(page),before,'number input ignores camera keys');
  assert.deepEqual((await state(page)).keys,[]);
  await page.locator('#speed').focus(); before=await state(page); await keySample(page,['w','d']);
  equalCamera(await state(page),before,'select ignores camera keys');
  // Editable UI fixture: no world/state injection, exercises the native contenteditable focus path.
  await page.evaluate(() => { const el=document.createElement('div'); el.id='camera-editable-test'; el.contentEditable='true'; el.setAttribute('role','textbox');
    Object.assign(el.style,{position:'fixed',left:'400px',top:'100px',zIndex:20,background:'#222'}); document.body.append(el); el.focus(); });
  before=await state(page); await page.keyboard.type('wasd'); await page.waitForTimeout(160);
  equalCamera(await state(page),before,'contenteditable ignores camera keys');
  assert.equal(await page.locator('#camera-editable-test').innerText(),'wasd');
  await page.locator('#camera-editable-test').evaluate(el=>el.remove());
  await neutral(page); await page.keyboard.down('d'); await page.waitForTimeout(90); await page.locator('#tile-x').focus();
  await stationary(page,'focusin clears already held keys'); await page.keyboard.up('d');
  // Text focus only disables keyboard; edge mouse is independent.
  await page.locator('#tactics').evaluate(el=>{el.open=false;});
  await page.locator('#speed').focus(); before=await state(page);
  await page.mouse.move(c.x+1,c.y+c.height/2); await page.waitForTimeout(160);
  assert.ok((await state(page)).x<before.x,'edge navigation remains available with input focus');
  await neutral(page); record(mode,'UI overlays, native inputs/select, contenteditable and focus clearing');

  await center(page); await page.keyboard.down('d');
  await page.locator('#btn-help').click(); await stationary(page,'modal disables movement');
  assert.deepEqual((await state(page)).keys,[]); await page.keyboard.up('d');
  await page.getByRole('button',{name:'Вернуться в игру',exact:true}).click(); await neutral(page);
  record(mode,'Help modal resets held camera input');

  await center(page); await page.keyboard.down('d'); await page.waitForTimeout(100);
  const other=await blurToTab(page);
  await page.waitForTimeout(200); const blurred=await state(page);
  assert.equal(blurred.focused,false,'real browser tab focus lost'); assert.deepEqual(blurred.keys,[]); assert.equal(blurred.miniPointer,null);
  await page.keyboard.up('d'); await page.bringToFront(); await other.close(); await neutral(page);
  await stationary(page,'focus return must not restore released keys'); assert.equal((await state(page)).paused,true);
  record(mode,'Real tab focus loss/reset and return; no stuck keys');

  await center(page); const selection=(await state(page)).selected;
  const points=[[0.35,0.35],[0.65,0.45],[0.65,0.68],[0.42,0.68],[0.0001,0.0001],[0.9999,0.9999]];
  const {mini:m}=await geometry(page); await page.mouse.move(m.x+m.width/2,m.y+m.height/2); await page.mouse.down();
  for(const [u,v] of points) { await miniPoint(page,u,v,'move'); await page.waitForTimeout(20); assert.notEqual((await state(page)).miniPointer,null); }
  await page.mouse.move(m.x+m.width+150,m.y-100); let s=await state(page); bounds(s);
  near(s.x,s.pw-s.cw,'drag outside mini clamps X'); near(s.y,0,'drag outside mini clamps Y');
  await page.mouse.up(); assert.equal((await state(page)).miniPointer,null);
  await neutral(page); await stationary(page,'mini release has no inertia');
  assert.deepEqual((await state(page)).selected,selection,'mini drag does not change selection');
  await center(page); await page.keyboard.down('d'); await page.mouse.move(m.x+m.width*0.45,m.y+m.height*0.5); await page.mouse.down();
  s=await state(page); await page.waitForTimeout(200); equalCamera(await state(page),s,'mini priority over held key');
  await page.mouse.up(); await page.waitForTimeout(160); assert.ok((await state(page)).x>s.x,'held keys resume after mini release');
  await page.keyboard.up('d'); await neutral(page);
  record(mode,'Continuous single-press minimap drag, outside capture/clamp, release, selection, key arbitration');

  // Lose real window focus with an active captured gesture, not merely with an idle mouse.
  for (const gesture of ['minimap', 'selection']) {
    await center(page);
    if (gesture === 'minimap') await page.mouse.move(m.x+m.width/2,m.y+m.height/2);
    else await page.mouse.move(c.x+c.width/2,c.y+c.height/2);
    await page.mouse.down();
    if (gesture === 'selection') {
      await page.mouse.move(c.x+c.width/2+70,c.y+c.height/2+50);
      assert.ok((await state(page)).drag, 'selection gesture started');
    } else assert.notEqual((await state(page)).miniPointer,null,'minimap gesture started');
    const tab=await blurToTab(page);
    await page.waitForTimeout(150); s=await state(page);
    assert.equal(s.focused,false); assert.equal(s.miniPointer,null); assert.equal(s.drag,null); assert.deepEqual(s.keys,[]);
    await page.mouse.up(); await page.bringToFront(); await tab.close();
    const stopped=await state(page);
    await page.mouse.move(c.x+c.width/2+140,c.y+c.height/2+100);
    equalCamera(await state(page),stopped,'blur cancels captured '+gesture); await stationary(page,'gesture not restored on focus');
  }
  record(mode,'Focus loss cancels captured minimap and selection gestures');

  for (const [u,v,keys] of [[0.0001,0.0001,['w','a']],[0.9999,0.9999,['s','d']]]) {
    await miniPoint(page,u,v); await neutral(page); before=await state(page); await keySample(page,keys,250); s=await state(page);
    bounds(s); equalCamera(s,before,'keys cannot leave world');
  }
  await center(page); record(mode,'World limits: top-left and bottom-right with continued input');
}
