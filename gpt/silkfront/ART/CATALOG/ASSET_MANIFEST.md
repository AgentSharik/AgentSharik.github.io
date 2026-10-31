# SILKFRONT — ASSET_MANIFEST

Сгенерировано `tools/artgen/build.js`. Статус «ready (concept v1)» означает: файл создан генератором и прошёл автоматическую проверку кадра (нет обрезки по краю ячейки). Визуальное одобрение — за арт-директором.

## Контракт спрайтов
- Ячейка 288×288 px, опора (ноги/центр на земле) 144,228 px → Phaser `setOrigin(0.5, 0.7917)`.
- Направление взгляда +X (вправо); влево — `flipX`. Один ракурс (3/4 сверху), не 8 направлений.
- Все юниты в одном масштабе рига (без подгонки под кадр). Строки листа: idle / walk / attack / hit / death.
- Загрузка: `this.load.atlas(id, id + '_sheet.png', id + '_sheet.json')`; анимации — в `animations` внутри JSON.

## Проверка кадров (10 юнитов)
| Юнит | id | Кадров | Обрезано | Высота над опорой | bbox по всем кадрам |
|---|---|---|---|---|---|
| Мечник | `human_swordsman` | 29 | 0 | 116px | 51, 112, 234, 260 |
| Арбалетчик | `human_crossbowman` | 29 | 0 | 76px | 49, 152, 221, 259 |
| Жрец Ордена | `human_priest` | 29 | 0 | 154px | 18, 74, 267, 253 |
| Охотник на чудовищ | `human_monster_hunter` | 29 | 0 | 145px | 25, 83, 265, 262 |
| Рыцарь Последнего Света | `human_knight` | 29 | 0 | 151px | 20, 77, 266, 258 |
| Ткач | `spider_weaver` | 29 | 0 | 34px | 106, 194, 201, 243 |
| Разведчик | `spider_scout` | 29 | 0 | 57px | 89, 171, 197, 248 |
| Клык | `spider_fang` | 29 | 0 | 49px | 100, 179, 189, 245 |
| Плеватель | `spider_spitter` | 29 | 0 | 58px | 96, 170, 207, 244 |
| Панцирник | `spider_armored` | 29 | 0 | 74px | 83, 154, 202, 252 |

## Файлы
| PNG (игровой ресурс) | SVG (исходник) | Категория | Размер | Назначение | Статус |
|---|---|---|---|---|---|
| `ART/HUMANS/UNITS/human_swordsman.png` | `ART_SRC/HUMANS/UNITS/human_swordsman.svg` | unit | 288×288 | Мечник: превью, idle 0 | ready (concept v1) |
| `ART/HUMANS/UNITS/human_swordsman/human_swordsman_idle.png` | `ART_SRC/HUMANS/UNITS/human_swordsman/human_swordsman_idle.svg` | animation | 1728×288 | Мечник: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_swordsman/human_swordsman_walk.png` | `ART_SRC/HUMANS/UNITS/human_swordsman/human_swordsman_walk.svg` | animation | 2304×288 | Мечник: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_swordsman/human_swordsman_attack.png` | `ART_SRC/HUMANS/UNITS/human_swordsman/human_swordsman_attack.svg` | animation | 1728×288 | Мечник: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_swordsman/human_swordsman_hit.png` | `ART_SRC/HUMANS/UNITS/human_swordsman/human_swordsman_hit.svg` | animation | 864×288 | Мечник: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_swordsman/human_swordsman_death.png` | `ART_SRC/HUMANS/UNITS/human_swordsman/human_swordsman_death.svg` | animation | 1728×288 | Мечник: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_swordsman/human_swordsman_sheet.png` | `ART_SRC/HUMANS/UNITS/human_swordsman/human_swordsman_sheet.svg` | spritesheet | 2304×1440 | Мечник: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/HUMANS/UNITS/human_crossbowman.png` | `ART_SRC/HUMANS/UNITS/human_crossbowman.svg` | unit | 288×288 | Арбалетчик: превью, idle 0 | ready (concept v1) |
| `ART/HUMANS/UNITS/human_crossbowman/human_crossbowman_idle.png` | `ART_SRC/HUMANS/UNITS/human_crossbowman/human_crossbowman_idle.svg` | animation | 1728×288 | Арбалетчик: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_crossbowman/human_crossbowman_walk.png` | `ART_SRC/HUMANS/UNITS/human_crossbowman/human_crossbowman_walk.svg` | animation | 2304×288 | Арбалетчик: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_crossbowman/human_crossbowman_attack.png` | `ART_SRC/HUMANS/UNITS/human_crossbowman/human_crossbowman_attack.svg` | animation | 1728×288 | Арбалетчик: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_crossbowman/human_crossbowman_hit.png` | `ART_SRC/HUMANS/UNITS/human_crossbowman/human_crossbowman_hit.svg` | animation | 864×288 | Арбалетчик: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_crossbowman/human_crossbowman_death.png` | `ART_SRC/HUMANS/UNITS/human_crossbowman/human_crossbowman_death.svg` | animation | 1728×288 | Арбалетчик: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_crossbowman/human_crossbowman_sheet.png` | `ART_SRC/HUMANS/UNITS/human_crossbowman/human_crossbowman_sheet.svg` | spritesheet | 2304×1440 | Арбалетчик: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/HUMANS/UNITS/human_priest.png` | `ART_SRC/HUMANS/UNITS/human_priest.svg` | unit | 288×288 | Жрец Ордена: превью, idle 0 | ready (concept v1) |
| `ART/HUMANS/UNITS/human_priest/human_priest_idle.png` | `ART_SRC/HUMANS/UNITS/human_priest/human_priest_idle.svg` | animation | 1728×288 | Жрец Ордена: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_priest/human_priest_walk.png` | `ART_SRC/HUMANS/UNITS/human_priest/human_priest_walk.svg` | animation | 2304×288 | Жрец Ордена: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_priest/human_priest_attack.png` | `ART_SRC/HUMANS/UNITS/human_priest/human_priest_attack.svg` | animation | 1728×288 | Жрец Ордена: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_priest/human_priest_hit.png` | `ART_SRC/HUMANS/UNITS/human_priest/human_priest_hit.svg` | animation | 864×288 | Жрец Ордена: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_priest/human_priest_death.png` | `ART_SRC/HUMANS/UNITS/human_priest/human_priest_death.svg` | animation | 1728×288 | Жрец Ордена: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_priest/human_priest_sheet.png` | `ART_SRC/HUMANS/UNITS/human_priest/human_priest_sheet.svg` | spritesheet | 2304×1440 | Жрец Ордена: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/HUMANS/UNITS/human_monster_hunter.png` | `ART_SRC/HUMANS/UNITS/human_monster_hunter.svg` | unit | 288×288 | Охотник на чудовищ: превью, idle 0 | ready (concept v1) |
| `ART/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_idle.png` | `ART_SRC/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_idle.svg` | animation | 1728×288 | Охотник на чудовищ: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_walk.png` | `ART_SRC/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_walk.svg` | animation | 2304×288 | Охотник на чудовищ: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_attack.png` | `ART_SRC/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_attack.svg` | animation | 1728×288 | Охотник на чудовищ: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_hit.png` | `ART_SRC/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_hit.svg` | animation | 864×288 | Охотник на чудовищ: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_death.png` | `ART_SRC/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_death.svg` | animation | 1728×288 | Охотник на чудовищ: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_sheet.png` | `ART_SRC/HUMANS/UNITS/human_monster_hunter/human_monster_hunter_sheet.svg` | spritesheet | 2304×1440 | Охотник на чудовищ: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/HUMANS/UNITS/human_knight.png` | `ART_SRC/HUMANS/UNITS/human_knight.svg` | unit | 288×288 | Рыцарь Последнего Света: превью, idle 0 | ready (concept v1) |
| `ART/HUMANS/UNITS/human_knight/human_knight_idle.png` | `ART_SRC/HUMANS/UNITS/human_knight/human_knight_idle.svg` | animation | 1728×288 | Рыцарь Последнего Света: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_knight/human_knight_walk.png` | `ART_SRC/HUMANS/UNITS/human_knight/human_knight_walk.svg` | animation | 2304×288 | Рыцарь Последнего Света: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_knight/human_knight_attack.png` | `ART_SRC/HUMANS/UNITS/human_knight/human_knight_attack.svg` | animation | 1728×288 | Рыцарь Последнего Света: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_knight/human_knight_hit.png` | `ART_SRC/HUMANS/UNITS/human_knight/human_knight_hit.svg` | animation | 864×288 | Рыцарь Последнего Света: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_knight/human_knight_death.png` | `ART_SRC/HUMANS/UNITS/human_knight/human_knight_death.svg` | animation | 1728×288 | Рыцарь Последнего Света: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/HUMANS/UNITS/human_knight/human_knight_sheet.png` | `ART_SRC/HUMANS/UNITS/human_knight/human_knight_sheet.svg` | spritesheet | 2304×1440 | Рыцарь Последнего Света: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_weaver.png` | `ART_SRC/SPIDERS/UNITS/spider_weaver.svg` | unit | 288×288 | Ткач: превью, idle 0 | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_weaver/spider_weaver_idle.png` | `ART_SRC/SPIDERS/UNITS/spider_weaver/spider_weaver_idle.svg` | animation | 1728×288 | Ткач: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_weaver/spider_weaver_walk.png` | `ART_SRC/SPIDERS/UNITS/spider_weaver/spider_weaver_walk.svg` | animation | 2304×288 | Ткач: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_weaver/spider_weaver_attack.png` | `ART_SRC/SPIDERS/UNITS/spider_weaver/spider_weaver_attack.svg` | animation | 1728×288 | Ткач: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_weaver/spider_weaver_hit.png` | `ART_SRC/SPIDERS/UNITS/spider_weaver/spider_weaver_hit.svg` | animation | 864×288 | Ткач: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_weaver/spider_weaver_death.png` | `ART_SRC/SPIDERS/UNITS/spider_weaver/spider_weaver_death.svg` | animation | 1728×288 | Ткач: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_weaver/spider_weaver_sheet.png` | `ART_SRC/SPIDERS/UNITS/spider_weaver/spider_weaver_sheet.svg` | spritesheet | 2304×1440 | Ткач: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_scout.png` | `ART_SRC/SPIDERS/UNITS/spider_scout.svg` | unit | 288×288 | Разведчик: превью, idle 0 | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_scout/spider_scout_idle.png` | `ART_SRC/SPIDERS/UNITS/spider_scout/spider_scout_idle.svg` | animation | 1728×288 | Разведчик: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_scout/spider_scout_walk.png` | `ART_SRC/SPIDERS/UNITS/spider_scout/spider_scout_walk.svg` | animation | 2304×288 | Разведчик: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_scout/spider_scout_attack.png` | `ART_SRC/SPIDERS/UNITS/spider_scout/spider_scout_attack.svg` | animation | 1728×288 | Разведчик: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_scout/spider_scout_hit.png` | `ART_SRC/SPIDERS/UNITS/spider_scout/spider_scout_hit.svg` | animation | 864×288 | Разведчик: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_scout/spider_scout_death.png` | `ART_SRC/SPIDERS/UNITS/spider_scout/spider_scout_death.svg` | animation | 1728×288 | Разведчик: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_scout/spider_scout_sheet.png` | `ART_SRC/SPIDERS/UNITS/spider_scout/spider_scout_sheet.svg` | spritesheet | 2304×1440 | Разведчик: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_fang.png` | `ART_SRC/SPIDERS/UNITS/spider_fang.svg` | unit | 288×288 | Клык: превью, idle 0 | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_fang/spider_fang_idle.png` | `ART_SRC/SPIDERS/UNITS/spider_fang/spider_fang_idle.svg` | animation | 1728×288 | Клык: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_fang/spider_fang_walk.png` | `ART_SRC/SPIDERS/UNITS/spider_fang/spider_fang_walk.svg` | animation | 2304×288 | Клык: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_fang/spider_fang_attack.png` | `ART_SRC/SPIDERS/UNITS/spider_fang/spider_fang_attack.svg` | animation | 1728×288 | Клык: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_fang/spider_fang_hit.png` | `ART_SRC/SPIDERS/UNITS/spider_fang/spider_fang_hit.svg` | animation | 864×288 | Клык: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_fang/spider_fang_death.png` | `ART_SRC/SPIDERS/UNITS/spider_fang/spider_fang_death.svg` | animation | 1728×288 | Клык: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_fang/spider_fang_sheet.png` | `ART_SRC/SPIDERS/UNITS/spider_fang/spider_fang_sheet.svg` | spritesheet | 2304×1440 | Клык: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_spitter.png` | `ART_SRC/SPIDERS/UNITS/spider_spitter.svg` | unit | 288×288 | Плеватель: превью, idle 0 | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_spitter/spider_spitter_idle.png` | `ART_SRC/SPIDERS/UNITS/spider_spitter/spider_spitter_idle.svg` | animation | 1728×288 | Плеватель: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_spitter/spider_spitter_walk.png` | `ART_SRC/SPIDERS/UNITS/spider_spitter/spider_spitter_walk.svg` | animation | 2304×288 | Плеватель: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_spitter/spider_spitter_attack.png` | `ART_SRC/SPIDERS/UNITS/spider_spitter/spider_spitter_attack.svg` | animation | 1728×288 | Плеватель: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_spitter/spider_spitter_hit.png` | `ART_SRC/SPIDERS/UNITS/spider_spitter/spider_spitter_hit.svg` | animation | 864×288 | Плеватель: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_spitter/spider_spitter_death.png` | `ART_SRC/SPIDERS/UNITS/spider_spitter/spider_spitter_death.svg` | animation | 1728×288 | Плеватель: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_spitter/spider_spitter_sheet.png` | `ART_SRC/SPIDERS/UNITS/spider_spitter/spider_spitter_sheet.svg` | spritesheet | 2304×1440 | Плеватель: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_armored.png` | `ART_SRC/SPIDERS/UNITS/spider_armored.svg` | unit | 288×288 | Панцирник: превью, idle 0 | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_armored/spider_armored_idle.png` | `ART_SRC/SPIDERS/UNITS/spider_armored/spider_armored_idle.svg` | animation | 1728×288 | Панцирник: idle, 6 кадров @6 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_armored/spider_armored_walk.png` | `ART_SRC/SPIDERS/UNITS/spider_armored/spider_armored_walk.svg` | animation | 2304×288 | Панцирник: walk, 8 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_armored/spider_armored_attack.png` | `ART_SRC/SPIDERS/UNITS/spider_armored/spider_armored_attack.svg` | animation | 1728×288 | Панцирник: attack, 6 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_armored/spider_armored_hit.png` | `ART_SRC/SPIDERS/UNITS/spider_armored/spider_armored_hit.svg` | animation | 864×288 | Панцирник: hit, 3 кадров @12 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_armored/spider_armored_death.png` | `ART_SRC/SPIDERS/UNITS/spider_armored/spider_armored_death.svg` | animation | 1728×288 | Панцирник: death, 6 кадров @10 fps | ready (concept v1) |
| `ART/SPIDERS/UNITS/spider_armored/spider_armored_sheet.png` | `ART_SRC/SPIDERS/UNITS/spider_armored/spider_armored_sheet.svg` | spritesheet | 2304×1440 | Панцирник: spritesheet (строки idle/walk/attack/hit/death) | ready (concept v1) |
| `ART/STYLE_GUIDE/scale_lineup.png` | `ART_SRC/STYLE_GUIDE/scale_lineup.svg` | style_guide | 1760×520 | Линейка масштаба: 10 юнитов idle в одном масштабе + силуэты 50% | ready (concept v1) |

Плюс для каждого юнита `*_sheet.json` (Phaser atlas) рядом с листом. Герои, здания, иконки, карты, объекты, предметы: **не начаты** (ждут оценки юнитов).
