// The 10 combat units of review gate 01 and their keyframe expansion.
// Shared by build.js (export) and diag.js (measurement).
const { STATES, expand, lerpPose } = require('../lib/anim');
const human = require('../lib/human');
const spider = require('../lib/spider');
const HP = require('../lib/poses');
const SP = require('../lib/spiderPoses');
const HK = require('./humanKits');
const SK = require('./spiderKits');

const UNITS = [
  { id: 'human_swordsman', ru: 'Мечник', role: 'Основная ближняя пехота', fac: 'HUMANS', rig: human, kit: HK.swordsman, poses: HP.set('melee') },
  { id: 'human_crossbowman', ru: 'Арбалетчик', role: 'Дальний бой', fac: 'HUMANS', rig: human, kit: HK.crossbowman, poses: HP.set('ranged') },
  { id: 'human_priest', ru: 'Жрец Ордена', role: 'Поддержка и лечение', fac: 'HUMANS', rig: human, kit: HK.priest, poses: HP.set('cast') },
  { id: 'human_monster_hunter', ru: 'Охотник на чудовищ', role: 'Против крупных существ', fac: 'HUMANS', rig: human, kit: HK.hunter, poses: HP.set('heavy') },
  { id: 'human_knight', ru: 'Рыцарь Последнего Света', role: 'Элитный тяжёлый боец', fac: 'HUMANS', rig: human, kit: HK.knight, poses: HP.set('heavy') },
  { id: 'spider_weaver', ru: 'Ткач', role: 'Рабочий: строит и собирает', fac: 'SPIDERS', rig: spider, kit: SK.weaver, poses: SP.set('weave', 4, 3) },
  { id: 'spider_scout', ru: 'Разведчик', role: 'Разведка и мобильность', fac: 'SPIDERS', rig: spider, kit: SK.scout, poses: SP.set('bite', 10, 7) },
  { id: 'spider_fang', ru: 'Клык', role: 'Основной ближний боец', fac: 'SPIDERS', rig: spider, kit: SK.fang, poses: SP.set('bite', 7, 5) },
  { id: 'spider_spitter', ru: 'Плеватель', role: 'Дальний бой', fac: 'SPIDERS', rig: spider, kit: SK.spitter, poses: SP.set('spit', 6, 4) },
  { id: 'spider_armored', ru: 'Панцирник', role: 'Тяжёлый бронированный боец', fac: 'SPIDERS', rig: spider, kit: SK.armored, poses: SP.set('slam', 6, 3) },
];

const CARRY_STATES = ['idle', 'walk', 'hit'];
function frames(u, state) {
  const st = STATES[state];
  let keys = u.poses[state];
  if (u.kit.carry && CARRY_STATES.includes(state)) keys = keys.map((k) => ({ ...k, ...u.kit.carry }));
  // death: weapon falls along the body (rot -88 turns it flat onto the ground), not into it
  if (u.rig === human && state === 'death') keys = keys.map((k, i) => ({ ...k, wep: i ? 178 : (u.kit.carry || {}).wep }));
  if (keys.length === 1) keys = [u.poses.idle[0], keys[0], lerpPose(u.poses.idle[0], keys[0], 0.4)];
  return expand(keys, st.frames, st.loop);
}

module.exports = { UNITS, frames };
