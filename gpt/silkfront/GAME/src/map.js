// SILKFRONT prototype — the single skirmish map "Перевал" (point-symmetric, 2 players).
import { MAP_W, MAP_H, FACTIONS, START } from './data.js';
import { World, segDist } from './world.js';

const mir = (x, y, s = 1) => [MAP_W - x - s, MAP_H - y - s]; // 180° point symmetry for a footprint of size s

export function createGame({ seed = 1, factions = ['HUMANS', 'SPIDERS'] } = {}) {
  const w = new World({ seed, factions });
  const R = w.rand;
  const mains = [[10, 10], mir(10, 10, 4)], mines = [[3, 11], mir(3, 11, 3)], exps = [[27, 52], mir(27, 52, 3)];
  const mainB = factions.map((f, pid) => w.addBuilding(FACTIONS[f].main, pid, ...mains[pid]));
  [...mines, ...exps].forEach((m) => w.addRes('mine', ...m));

  // Trees are generated for one half and mirrored, so both starts are equivalent.
  const trees = new Set();
  const put = (x, y) => { if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return; trees.add(y * MAP_W + x); const [mx, my] = mir(x, y); trees.add(my * MAP_W + mx); };
  const c0 = [12, 12], c1 = [MAP_W - 12, MAP_H - 12];
  const open = (x, y) => { // keep bases, mines and the main lane free of random clumps
    const px = x + 0.5, py = y + 0.5;
    if (Math.hypot(px - c0[0], py - c0[1]) < 11 || Math.hypot(px - c1[0], py - c1[1]) < 11) return false;
    if (segDist(px, py, c0[0], c0[1], c1[0], c1[1]) < 4) return false;
    for (const [mx, my] of [...mines, ...exps]) if (Math.hypot(px - mx - 1.5, py - my - 1.5) < 5) return false;
    return true;
  };
  for (let x = 0; x < MAP_W; x++) for (let y = 0; y < 2; y++) if (R() < 0.8) put(x, y); // map border woods
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < 2; x++) if (R() < 0.8) put(x, y);
  for (let y = 2; y < 7; y++) for (let x = 16; x < 25; x++) if (R() < 0.85) put(x, y);   // home wood line
  for (let y = 18; y < 25; y++) for (let x = 2; x < 6; x++) if (R() < 0.85) put(x, y);
  for (let i = 0; i < 26; i++) {
    const cx = 4 + R() * (MAP_W - 8), cy = 4 + R() * (MAP_H - 8), rad = 1.3 + R() * 2.4;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = Math.floor(cx + dx), y = Math.floor(cy + dy);
      if (dx * dx + dy * dy <= rad * rad && R() < 0.9 && open(x, y)) put(x, y);
    }
  }
  for (const i of trees) w.addRes('tree', i % MAP_W, Math.floor(i / MAP_W));

  mainB.forEach((m, pid) => {
    const mx = (mines[pid][0] + 1.5) * 32, my = (mines[pid][1] + 1.5) * 32;
    for (let i = 0; i < START.workers; i++) {
      const p = w.freeNear((m.x + mx) / 2 + (i - 2) * 6, (m.y + my) / 2 + (i - 2) * 26);
      w.addUnit(FACTIONS[factions[pid]].worker, pid, p.x, p.y);
    }
  });
  w.meta = { name: 'Перевал', mains, mines, exps };
  return w;
}
