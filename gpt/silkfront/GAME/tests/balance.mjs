// Reproducible paired-seed diagnostic, not a win-rate assertion or a replacement for human play.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createGame } from '../src/map.js';
import { AI } from '../src/ai.js';
import { DT } from '../src/data.js';
const seeds = [1, 3, 7, 19, 42, 101];
const results = [];
for (const seed of seeds) for (const factions of [['HUMANS', 'SPIDERS'], ['SPIDERS', 'HUMANS']]) {
  const w = createGame({ seed, factions }), ais = [new AI(w, 0), new AI(w, 1)];
  const checkpoints = []; const start = performance.now();
  for (let i = 0; i < 25 * 60 / DT && !w.over; i++) {
    ais.forEach(a => a.update()); w.step();
    if (w.tick % 1200 === 0) checkpoints.push({ time: Math.round(w.time), players: w.players.map(p => ({ fac: p.fac, res: { ...p.res }, supply: w.supply(p.id), workers: w.unitsOf(p.id).filter(u => u.def.worker).length, army: w.unitsOf(p.id).filter(u => !u.def.worker).length, built: p.stats.built, trained: p.stats.trained, kills: p.stats.kills })) });
  }
  const msPerTick = (performance.now() - start) / w.tick;
  assert.ok(w.over && [0, 1].includes(w.winner), `seed ${seed}, ${factions}: no natural winner at ${w.time}`);
  assert.equal(w.buildingsOf(1 - w.winner).length, 0, 'natural building elimination');
  for (const u of w.units) assert.ok(Number.isFinite(u.x) && Number.isFinite(u.y) && Number.isFinite(u.hp));
  const row = { seed, factions, time: Math.round(w.time), winner: w.winner, winnerFaction: factions[w.winner], msPerTick, stats: w.players.map(p => p.stats), checkpoints };
  results.push(row);
  console.log(`seed=${seed} ${factions.join('/')} winner=${row.winnerFaction} side=${w.winner} time=${row.time}s tick=${msPerTick.toFixed(3)}ms`);
}
const summary = { matches: results.length, factionWins: { HUMANS: results.filter(r => r.winnerFaction === 'HUMANS').length, SPIDERS: results.filter(r => r.winnerFaction === 'SPIDERS').length }, sideWins: [0, 1].map(i => results.filter(r => r.winner === i).length) };
await mkdir('reports', { recursive: true });
const name = process.argv[2] || 'balance';
if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Invalid report name');
await writeFile(`reports/${name}.json`, JSON.stringify({ generatedAt: new Date().toISOString(), seeds, summary, results }, null, 2));
console.log(JSON.stringify(summary));
