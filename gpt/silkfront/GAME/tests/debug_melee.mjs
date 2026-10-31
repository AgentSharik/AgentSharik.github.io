import { createGame } from '../src/map.js';
const w = createGame({ seed: 1 }), c = w.freeNear(w.pw / 2, w.ph / 2);
const a = w.addUnit('human_swordsman', 0, c.x - 40, c.y), b = w.addUnit('spider_fang', 1, c.x + 40, c.y);
for (let i = 0; i < 200; i++) {
  w.step();
  if (i % 20 === 0) console.log(i, [a, b].map((u) => `${u.type} ${u.order.t} hp=${u.hp.toFixed(0)} x=${u.x.toFixed(0)} y=${u.y.toFixed(0)} sw=${u.swing.toFixed(2)} cd=${u.cd.toFixed(2)} path=${u.path ? u.path.length : '-'}`).join(' | '));
}
