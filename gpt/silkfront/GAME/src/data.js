// SILKFRONT prototype — game data (balance tables). Pure data, no logic.
// Units: world px, seconds. Costs: e = Эссенция (essence), w = Древесина (wood).

export const TILE = 32;
export const MAP_W = 96; // tiles → 3072 px
export const MAP_H = 72; // tiles → 2304 px
export const DT = 1 / 20; // fixed simulation step (20 ticks/s)
export const SPRITE_SCALE = 0.5; // atlas cells are 288 px; in-game zoom 50% (see gallery "игровой масштаб")
export const PIVOT = [144, 228]; // atlas pivot in px (ASSET_MANIFEST контракт спрайтов)
export const SUPPLY_MAX = 60;
export const MELEE = 14; // edge-to-edge reach of melee attacks
export const START = { e: 500, w: 200, workers: 5 };

export const RES_NAMES = { e: 'Эссенция', w: 'Древесина' };

export const FACTIONS = {
  HUMANS: { ru: 'Орден Последнего Света', main: 'h_citadel', worker: 'human_novice', color: '#d6dce4',
    build: ['h_barracks', 'h_chapel', 'h_tower'], supplyHint: 'Часовню' },
  SPIDERS: { ru: 'Нерубы', main: 's_nest', worker: 'spider_weaver', color: '#47c3b4',
    build: ['s_incubator', 's_brood', 's_webtower'], supplyHint: 'Камеру выводка' },
};

// art: atlas id from ART/<fac>/UNITS/<art>/<art>_sheet.json (null = procedural placeholder).
// h: visual height above the pivot at SPRITE_SCALE (hitbox / health bar), r: collision radius.
// DMG_MUL: one global combat-pace knob (raw table values × 1.8 ≈ 15–20 s per 1v1 duel).
export const DMG_MUL = 1.8;
const U = (o) => ({ armor: 0, range: MELEE, windup: 0.3, sight: 300, supply: 2, large: false, ...o, dmg: o.dmg * DMG_MUL });
export const UNITS = {
  human_novice: U({ fac: 'HUMANS', ru: 'Послушник', role: 'Рабочий: строит и собирает (временная фигура — арта нет)', art: null,
    hp: 220, dmg: 5, cd: 2.0, speed: 78, cost: { e: 75, w: 0 }, supply: 1, time: 12, r: 10, h: 44, worker: true }),
  human_swordsman: U({ fac: 'HUMANS', ru: 'Мечник', role: 'Основная ближняя пехота', art: 'human_swordsman',
    hp: 420, armor: 2, dmg: 13, cd: 1.35, speed: 82, cost: { e: 135, w: 0 }, time: 18, r: 12, h: 58 }),
  human_crossbowman: U({ fac: 'HUMANS', ru: 'Арбалетчик', role: 'Дальний бой', art: 'human_crossbowman',
    hp: 300, dmg: 17, range: 190, cd: 1.5, windup: 0.35, proj: 'bolt', speed: 80, cost: { e: 130, w: 20 }, time: 20, r: 12, h: 46 }),
  human_priest: U({ fac: 'HUMANS', ru: 'Жрец Ордена', role: 'Поддержка и лечение', art: 'human_priest',
    hp: 260, dmg: 7, range: 160, cd: 1.8, proj: 'light', speed: 76, cost: { e: 110, w: 40 }, time: 22, r: 12, h: 66,
    heal: 24, healCd: 1.4, healRange: 170 }),
  human_monster_hunter: U({ fac: 'HUMANS', ru: 'Охотник на чудовищ', role: 'Против крупных существ (×1.8 по крупным)', art: 'human_monster_hunter',
    hp: 520, armor: 1, dmg: 16, bonusLarge: 1.8, cd: 1.5, speed: 86, cost: { e: 170, w: 40 }, supply: 3, time: 24, r: 13, h: 66 }),
  human_knight: U({ fac: 'HUMANS', ru: 'Рыцарь Последнего Света', role: 'Элитный тяжёлый боец', art: 'human_knight',
    hp: 820, armor: 4, dmg: 26, cd: 1.6, speed: 92, cost: { e: 245, w: 70 }, supply: 4, time: 30, r: 14, h: 70, large: true,
    requires: 'h_chapel' }),

  spider_weaver: U({ fac: 'SPIDERS', ru: 'Ткач', role: 'Рабочий: строит и собирает', art: 'spider_weaver',
    hp: 200, dmg: 5, cd: 2.0, speed: 80, cost: { e: 70, w: 0 }, supply: 1, time: 12, r: 10, h: 22, worker: true }),
  spider_scout: U({ fac: 'SPIDERS', ru: 'Разведчик', role: 'Разведка и мобильность', art: 'spider_scout',
    hp: 280, dmg: 9, cd: 1.0, speed: 130, sight: 380, cost: { e: 90, w: 0 }, supply: 1, time: 14, r: 12, h: 30 }),
  spider_fang: U({ fac: 'SPIDERS', ru: 'Клык', role: 'Основной ближний боец', art: 'spider_fang',
    hp: 440, armor: 1, dmg: 14, cd: 1.3, speed: 96, cost: { e: 130, w: 0 }, time: 18, r: 12, h: 28 }),
  spider_spitter: U({ fac: 'SPIDERS', ru: 'Плеватель', role: 'Дальний бой', art: 'spider_spitter',
    hp: 310, dmg: 16, range: 200, cd: 1.6, windup: 0.35, proj: 'venom', speed: 80, cost: { e: 130, w: 25 }, time: 20, r: 13, h: 32 }),
  spider_armored: U({ fac: 'SPIDERS', ru: 'Панцирник', role: 'Тяжёлый бронированный боец', art: 'spider_armored',
    hp: 880, armor: 5, dmg: 22, cd: 1.8, speed: 66, cost: { e: 240, w: 70 }, supply: 4, time: 30, r: 16, h: 40, large: true,
    requires: 's_brood' }),
};

// size: footprint in tiles. Buildings are procedural (no building art yet — STYLE_GUIDE §5).
const B = (o) => ({ armor: 3, trains: [], supply: 0, dropoff: false, ...o });
export const BUILDINGS = {
  h_citadel: B({ fac: 'HUMANS', ru: 'Цитадель', size: 4, hp: 2400, armor: 5, trains: ['human_novice'], dropoff: true, supply: 10, time: 90, cost: { e: 400, w: 200 }, key: 'T' }),
  h_barracks: B({ fac: 'HUMANS', ru: 'Казармы', size: 3, hp: 1300, trains: ['human_swordsman', 'human_crossbowman', 'human_monster_hunter', 'human_knight'], time: 35, cost: { e: 160, w: 60 }, key: 'Q' }),
  h_chapel: B({ fac: 'HUMANS', ru: 'Часовня', size: 3, hp: 900, armor: 2, trains: ['human_priest'], supply: 10, time: 28, cost: { e: 90, w: 40 }, key: 'W' }),
  h_tower: B({ fac: 'HUMANS', ru: 'Сторожевая башня', size: 2, hp: 700, time: 30, cost: { e: 110, w: 60 }, key: 'E',
    attack: { dmg: 18, range: 260, cd: 1.4, proj: 'bolt' } }),

  s_nest: B({ fac: 'SPIDERS', ru: 'Материнское гнездо', size: 4, hp: 2300, armor: 4, trains: ['spider_weaver'], dropoff: true, supply: 10, time: 90, cost: { e: 400, w: 200 }, key: 'T' }),
  s_incubator: B({ fac: 'SPIDERS', ru: 'Инкубатор', size: 3, hp: 1250, trains: ['spider_scout', 'spider_fang', 'spider_spitter', 'spider_armored'], time: 35, cost: { e: 160, w: 60 }, key: 'Q' }),
  s_brood: B({ fac: 'SPIDERS', ru: 'Камера выводка', size: 3, hp: 950, armor: 2, supply: 10, time: 28, cost: { e: 90, w: 40 }, key: 'W' }),
  s_webtower: B({ fac: 'SPIDERS', ru: 'Паутинная башня', size: 2, hp: 700, time: 30, cost: { e: 110, w: 60 }, key: 'E',
    attack: { dmg: 18, range: 260, cd: 1.4, proj: 'web' } }),
};

// Resource nodes. kind = player resource key. time = seconds per trip of harvesting.
export const RES = {
  mine: { ru: 'Жила эссенции', kind: 'e', size: 3, amount: 6000, carry: 10, time: 1.6 },
  tree: { ru: 'Дерево', kind: 'w', size: 1, amount: 48, carry: 8, time: 3.5 },
};
