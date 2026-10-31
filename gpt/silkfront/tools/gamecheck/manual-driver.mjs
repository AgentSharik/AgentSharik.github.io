import { expect } from 'playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
// All game interaction is ordinary DOM input. evaluate() below only reads the rendered HUD.
export async function command(page, actions) {
  const btn=name=>page.getByRole('button',{name,exact:true});
  for(const a of actions){
    if(a.kind==='click'){
      if(/Сдаться|Подтвердить сдачу|Наблюдать/.test(a.name))throw new Error('No surrender or observer in a manual match');
      await btn(a.name).click();
    }else if(a.kind==='select')await page.getByRole('combobox',{name:a.label,exact:true}).selectOption(a.value);
    else if(a.kind==='openOrders'){if(await page.locator('#tactics').getAttribute('open')===null)await page.getByText('Приказы без ПКМ',{exact:true}).click();}
    else if(a.kind==='resume'){if(await btn('Продолжить').isVisible())await btn('Продолжить').click();}
    else if(a.kind==='pause'){if(await btn('Пауза').isVisible())await btn('Пауза').click();}
    else if(a.kind==='time')await page.waitForFunction(n=>{if(!document.getElementById('end').hidden)return true;const m=document.getElementById('clock').textContent.match(/(\d+):(\d+)/);return m&&Number(m[1])*60+Number(m[2])>=n;},a.seconds,{timeout:120000});
    else if(a.kind==='assertText')await expect(page.locator(a.selector)).toContainText(a.text);
    else if(a.kind==='end'){
      await expect(page.locator('#end')).toBeVisible();
      const clock=await page.locator('#clock').innerText();await page.waitForTimeout(1000);await expect(page.locator('#clock')).toHaveText(clock);
    }else throw new Error('Unknown action');
  }
  if(await btn('Пауза').isVisible()&&!await page.locator('#end').isVisible())await btn('Пауза').click();
  await page.waitForTimeout(80); // allow the normal HUD frame to render after pause
  const state=await page.evaluate(()=>({faction:document.getElementById('fac-name').textContent,clock:document.getElementById('clock').textContent,e:document.getElementById('r-e').textContent,wood:document.getElementById('r-w').textContent,supply:document.getElementById('r-s').textContent,status:document.getElementById('tactical-status').textContent,info:document.getElementById('info-text').innerText,queue:document.getElementById('queue').innerText,buildings:[...document.querySelectorAll('#pick-building option')].map(o=>({id:o.value,text:o.textContent})),commands:[...document.querySelectorAll('#cmds button')].map(b=>({name:b.getAttribute('aria-label'),available:!b.classList.contains('na')})),log:document.getElementById('log').innerText,end:document.getElementById('end').hidden?null:{title:document.getElementById('end-title').textContent,stats:document.getElementById('end-stats').innerText}}));
  const fac=state.faction.startsWith('Орден')?'humans':'spiders';let history=[];
  try{history=JSON.parse(await readFile('../../GAME/reports/manual-'+fac+'.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  history.push({actions,state});await writeFile('../../GAME/reports/manual-'+fac+'.json',JSON.stringify(history,null,2));
  await page.screenshot({path:'../../GAME/reports/manual-'+fac+'.png'});
  await writeFile('../../GAME/reports/manual-'+fac+'.html','<!doctype html><html lang="ru"><meta charset="utf-8"><title>Матч '+fac+'</title><style>body{margin:0;background:#111;color:#ddd;font:16px system-ui}img{width:100%;height:auto}h1{font-size:18px;margin:8px}</style><h1>Управляемый матч: '+state.faction+' — '+state.clock+'</h1><img src="manual-'+fac+'.png" alt="Текущий снимок настоящего игрового интерфейса">');
  return state;
}
