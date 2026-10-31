// Verify saved player UI traces, not a replay or a replacement for runtime play.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const results=[];
for(const fac of ['humans','spiders']) {
  const history=JSON.parse(await readFile(`../../GAME/reports/manual-${fac}.json`,'utf8'));
  const start=history.findLastIndex(row=>row.actions.some(a=>a.kind==='click'&&a.name.includes(fac==='humans'?'Орден Последнего Света Люди:':'Древняя Колония Пауки:')));
  assert.ok(start>=0);const match=history.slice(start), last=match.at(-1);
  assert.ok(last.state.end);assert.ok(last.actions.some(a=>a.kind==='end'));
  assert.ok(!match.some(r=>r.actions.some(a=>a.kind==='click'&&/Сдаться|Подтвердить сдачу|Наблюдать/.test(a.name))));
  assert.ok(match.some(r=>r.actions.some(a=>a.kind==='click'&&a.name==='Атаковать базу врага')));
  assert.ok(match.some(r=>r.state.buildings.length>=5),'economy and production built');
  const endRows=match.filter(r=>r.state.end);assert.ok(endRows.length>=2);
  assert.equal(endRows[0].state.clock,last.state.clock,'clock frozen across separate observations');
  if(fac==='humans')assert.deepEqual(last.state.buildings,[{id:'',text:'— выбрать —'}],'natural building elimination');
  results.push({faction:last.state.faction,clock:last.state.clock,result:last.state.end.title,batches:match.length,commands:match.reduce((n,r)=>n+r.actions.filter(a=>a.kind==='click'||a.kind==='select').length,0),stats:last.state.end.stats});
}
try { const errors=await readFile('../../GAME/reports/manual-errors.log','utf8');assert.equal(errors.trim(),'','manual browser errors'); } catch(e) { if(e.code!=='ENOENT') throw e; }
await writeFile('../../GAME/reports/manual-verification.json',JSON.stringify({method:'agent-directed ordinary UI commands, not independent human playtest',results},null,2));
console.log(JSON.stringify(results,null,2));
