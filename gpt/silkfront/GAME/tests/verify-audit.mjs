import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const backup = new URL('../../REVIEW_BACKUP_GAME_03/', import.meta.url);
const root = new URL('../../', import.meta.url);
const hashes = JSON.parse(await readFile(new URL('atlas-sha256.json', backup), 'utf8'));
for(const [file,hash] of Object.entries(hashes)) assert.equal(createHash('sha256').update(await readFile(new URL(file,root))).digest('hex'),hash,file+' changed');
const before=JSON.parse(await readFile('reports/balance-before.json','utf8'));
const after=JSON.parse(await readFile('reports/balance-after.json','utf8'));
const comparable = r => ({ seed:r.seed,factions:r.factions,time:r.time,winner:r.winner,stats:r.stats,checkpoints:r.checkpoints });
assert.deepEqual(after.results.map(comparable),before.results.map(comparable),'UI fixes must not change simulation results');
for(const row of after.results) assert.ok(row.msPerTick<8,'tick performance');
const ui=JSON.parse(await readFile('reports/ui-regressions.json','utf8'));assert.deepEqual(ui.errors,[]);assert.equal(ui.results.length,2);assert.ok(ui.results.every(r=>r.passed));
const matches=[];
for(const f of ['humans','spiders']){
  const r=JSON.parse(await readFile('reports/match-'+f+'.json','utf8'));
  assert.deepEqual(r.errors,[]);assert.ok(['Победа','Поражение','Ничья'].includes(r.title));assert.ok(r.actionCount>35&&r.recruits>=8);matches.push({faction:r.fac,result:r.title,clock:r.clock});
}
const result={protectedAtlasFiles:Object.keys(hashes).length,pairedSeeds:after.seeds,matches:after.summary,unchangedSimulation:true,ui:ui.results,automatedPlayerMatches:matches};
await writeFile('reports/audit-verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
