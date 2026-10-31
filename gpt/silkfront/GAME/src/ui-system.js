// SILKFRONT — Unified Dual-Faction 3D Visual System & Interactive Screens Controller
// Preserves 100% of existing World/Game/Hud mechanics while providing:
// - Live theme switching (HUMANS: Order of the Last Light [Silver/Cold Steel/Stone/Ivory/Burgundy] / SPIDERS: Нерубы [Obsidian/Chitin/Web/Turquoise])
// - Custom 3D RTS floating tooltips for resources, commands, units, buildings, and demo abilities
// - Multi-screen Menu navigation with strict separation between playable game mechanics and UI demo placeholders
import { UNITS, BUILDINGS, FACTIONS, RES_NAMES } from './data.js';
import { UI_ICONS } from './hud.js';

export const HEROES = {
  edric: {
    id: 'edric',
    fac: 'HUMANS',
    name: 'Эдрик, Инквизитор',
    title: 'Командующий Ордена Последнего Света',
    role: '[Демо-макет UI · Герои пока не интегрированы в движок]',
    icon: 'assets/ui/hero_edric.svg',
    hp: 950, mana: 320, dmg: 38, armor: 6, speed: 88, range: 'Ближний бой (14)',
    lore: 'Демонстрационный макет карточки героя для проверки рамок, портретов и панели способностей в серебряно-стальной теме Ордена Последнего Света (финальный арт портрета — зона ответственности художника).',
    abilities: [
      { id: 'holy_smite', key: 'Q', name: 'Кара Света [Демо]', icon: 'assets/ui/abi_holy_smite.svg', cost: '65 Энергии [Демо]', cd: '10 с', req: 'Демо-способность UI', desc: '[Демонстрационный макет способности] Солнечный удар по выбранной цели. В текущей сборке движка способности героев не задействованы.' },
      { id: 'inquisitor_edict', key: 'E', name: 'Эдикт Инквизитора [Демо]', icon: 'assets/ui/abi_inquisitor_edict.svg', cost: '80 Энергии [Демо]', cd: '18 с', req: 'Демо-способность UI', desc: '[Демонстрационный макет способности] Боевое благословение брони и дисциплины соседних отрядов Ордена.' },
      { id: 'sanctuary_shield', key: 'R', name: 'Священный Бастион [Демо]', icon: 'assets/ui/abi_sanctuary_shield.svg', cost: '120 Энергии [Демо]', cd: '45 с', req: 'Демо-способность UI', desc: '[Демонстрационный макет способности] Защитный купол вокруг выбранного отряда.' }
    ]
  },
  arachna: {
    id: 'arachna',
    fac: 'SPIDERS',
    name: 'Арахна, Матриарх',
    title: 'Владычица Нерубов',
    role: '[Демо-макет UI · Герои пока не интегрированы в движок]',
    icon: 'assets/ui/hero_arachna.svg',
    hp: 890, mana: 380, dmg: 34, armor: 5, speed: 94, range: 'Дальний (180)',
    lore: 'Демонстрационный макет карточки героя для проверки органических хитиновых рамок, биолюминесцентных акцентов и слотов способностей фракции Нерубов.',
    abilities: [
      { id: 'brood_swarm', key: 'Q', name: 'Зов Выводка [Демо]', icon: 'assets/ui/abi_brood_swarm.svg', cost: '75 Энергии [Демо]', cd: '14 с', req: 'Демо-способность UI', desc: '[Демонстрационный макет способности] Призыв пауков-разведчиков из подземных коконов (механика в разработке).' },
      { id: 'venom_nova', key: 'E', name: 'Ядовитый Выброс [Демо]', icon: 'assets/ui/abi_venom_nova.svg', cost: '85 Энергии [Демо]', cd: '16 с', req: 'Демо-способность UI', desc: '[Демонстрационный макет способности] Облако биокислоты, ослабляющее броню противника (механика в разработке).' },
      { id: 'silk_cocoon', key: 'R', name: 'Кокон Паутины [Демо]', icon: 'assets/ui/abi_silk_cocoon.svg', cost: '110 Энергии [Демо]', cd: '35 с', req: 'Демо-способность UI', desc: '[Демонстрационный макет способности] Временное обездвиживание цели плотным коконом паутины (механика в разработке).' }
    ]
  }
};

export const CAMPAIGNS = [
  {
    id: 'camp_humans',
    fac: 'HUMANS',
    title: 'Орден Последнего Света',
    subtitle: 'Кампания «Последний Свет» · Серебро, холодная сталь и багрянец',
    crest: 'assets/ui/crest_humans.svg',
    hero: 'Эдрик, Инквизитор [Демо-макет]',
    status: 'Доступна Миссия 01 (Игровая)',
    available: true,
    desc: 'Сюжетная кампания людей. Первая миссия «Пепельная окраина» («Последнее поселение») полностью реализована и доступна для прохождения; последующие слоты являются рабочими заглушками интерфейса.',
    missions: [
      { id: 'ash-outskirts', num: '01', name: 'Пепельная окраина', sub: 'Последнее поселение (Утверждённая игровая миссия)', state: 'available', stateLabel: 'Доступна в игре', icon: 'assets/ui/bld_citadel.svg',
        desc: 'Сохраните Цитадель, разведайте Пепельный брод (38,40), доставьте 160 эссенции и 80 древесины, восстановите восточную башню и уничтожьте передовой Инкубатор Нерубов.',
        playable: true },
      { id: 'stub-h2', num: '02', name: 'Миссия 02 [Рабочая заглушка]', sub: 'Сюжетная миссия в разработке', state: 'completed', stateLabel: 'Макет состояния: Пройдена [Демо]', icon: 'assets/ui/bld_tower.svg',
        desc: 'Рабочий слот второй миссии кампании «Последний Свет». Служит для демонстрации визуального состояния завершённой карточки задания до утверждения сценария.',
        playable: false },
      { id: 'stub-h3', num: '03', name: 'Миссия 03 [Рабочая заглушка]', sub: 'Сюжетная миссия в разработке', state: 'available', stateLabel: 'Макет состояния: Доступна [Демо]', icon: 'assets/ui/bld_chapel.svg',
        desc: 'Рабочий слот третьей миссии кампании Ордена. Предназначен для проверки вёрстки карточек выбора миссии.',
        playable: false },
      { id: 'stub-h4', num: '04', name: 'Миссия 04 [Рабочая заглушка]', sub: 'Сюжетная миссия в разработке', state: 'locked', stateLabel: 'Макет состояния: Закрыта [Демо]', icon: 'assets/ui/bld_barracks.svg',
        desc: 'Рабочий слот четвёртой миссии кампании Ордена (визуальное состояние недоступного этапа).',
        playable: false }
    ]
  },
  {
    id: 'camp_spiders',
    fac: 'SPIDERS',
    title: 'Нерубы',
    subtitle: 'Кампания Нерубов [Рабочий макет UI] · Обсидиан, хитин и биолюминесценция',
    crest: 'assets/ui/crest_spiders.svg',
    hero: 'Арахна, Матриарх [Демо-макет]',
    status: 'Схватка активна · Кампания в разработке',
    available: true,
    desc: 'Фракция Нерубов полностью играбельна в режиме схватки на карте «Перевал». Карточки сюжетных миссий ниже представлены как рабочие заглушки интерфейса для проверки темы Нерубов.',
    missions: [
      { id: 'stub-s1', num: '01', name: 'Миссия 01 Нерубов [Рабочая заглушка]', sub: 'Сценарий в разработке · Доступен запуск схватки', state: 'available', stateLabel: 'Тест в режиме Схватки', icon: 'assets/ui/bld_nest.svg',
        desc: 'Рабочая заглушка первой миссии кампании Нерубов. Позволяет протестировать запуск боя за фракцию Нерубов на карте «Перевал».',
        playable: false, skirmishFac: 'SPIDERS' },
      { id: 'stub-s2', num: '02', name: 'Миссия 02 Нерубов [Рабочая заглушка]', sub: 'Сценарий в разработке', state: 'completed', stateLabel: 'Макет состояния: Пройдена [Демо]', icon: 'assets/ui/bld_incubator.svg',
        desc: 'Рабочая заглушка второй миссии для проверки отображения пройденного этапа в хитиново-бирюзовой теме Нерубов.',
        playable: false, skirmishFac: 'SPIDERS' },
      { id: 'stub-s3', num: '03', name: 'Миссия 03 Нерубов [Рабочая заглушка]', sub: 'Сценарий в разработке', state: 'available', stateLabel: 'Макет состояния: Доступна [Демо]', icon: 'assets/ui/bld_brood.svg',
        desc: 'Рабочая заглушка третьей миссии кампании Нерубов.',
        playable: false, skirmishFac: 'SPIDERS' },
      { id: 'stub-s4', num: '04', name: 'Миссия 04 Нерубов [Рабочая заглушка]', sub: 'Сценарий в разработке', state: 'locked', stateLabel: 'Макет состояния: Закрыта [Демо]', icon: 'assets/ui/bld_webtower.svg',
        desc: 'Рабочая заглушка четвёртой миссии кампании Нерубов (состояние заблокированного задания).',
        playable: false, skirmishFac: 'SPIDERS' }
    ]
  }
];

export function setFactionTheme(fac) {
  const theme = fac === 'SPIDERS' ? 'SPIDERS' : 'HUMANS';
  if (typeof document === 'undefined') return;
  document.body.dataset.theme = theme;
  const crest = document.getElementById('fac-crest');
  if (crest) crest.src = theme === 'SPIDERS' ? 'assets/ui/crest_spiders.svg' : 'assets/ui/crest_humans.svg';
  document.querySelectorAll('[data-theme-switch]').forEach((b) => {
    b.classList.toggle('active', b.dataset.themeSwitch === theme);
  });
}

export function initUiSystem(game) {
  if (typeof document === 'undefined' || !document.querySelector) return;
  setFactionTheme('HUMANS');

  const origStart = game.start.bind(game);
  game.start = function(fac, missionId = null) {
    const actualFac = missionId ? 'HUMANS' : fac;
    setFactionTheme(actualFac);
    return origStart(fac, missionId);
  };

  document.querySelectorAll('[data-theme-switch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setFactionTheme(btn.dataset.themeSwitch);
      if (game.hud) game.hud.drawPortrait(game.selected?.()[0]);
    });
  });

  const hudThemeBtn = document.getElementById('btn-theme-toggle');
  if (hudThemeBtn) {
    hudThemeBtn.addEventListener('click', () => {
      const next = document.body.dataset.theme === 'SPIDERS' ? 'HUMANS' : 'SPIDERS';
      setFactionTheme(next);
      if (game.hud) game.hud.drawPortrait(game.selected?.()[0]);
    });
  }

  document.querySelectorAll('[data-menu-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.menuTab;
      document.querySelectorAll('[data-menu-tab]').forEach((b) => b.classList.toggle('active', b.dataset.menuTab === tab));
      document.querySelectorAll('.menu-screen-pane').forEach((p) => {
        p.hidden = p.id !== 'pane-' + tab;
      });
    });
  });

  buildExtendedMenuPanes(game);
  initFloatingTooltips(game);
}

function buildExtendedMenuPanes(game) {
  // 1. Campaigns Pane
  const campBox = document.getElementById('campaigns-grid');
  if (campBox) {
    campBox.innerHTML = CAMPAIGNS.map((c) => `
      <article class="sf-campaign-card theme-${c.fac.toLowerCase()}" data-camp="${c.id}">
        <div class="sf-card-arch">
          <div class="sf-crest-socket"><img src="${c.crest}" alt="${c.title}" class="sf-camp-crest"></div>
          <span class="sf-badge">${c.status}</span>
        </div>
        <h3>${c.title}</h3>
        <p class="sf-eyebrow">${c.subtitle}</p>
        <p class="sf-desc">${c.desc}</p>
        <div class="sf-meta-row">
          <span>Герой фракции: <b>${c.hero}</b></span>
          <span>Слотов миссий: <b>${c.missions.length}</b></span>
        </div>
        <div class="sf-card-actions">
          <button type="button" class="sf-btn-primary" data-open-missions="${c.fac}">Открыть карту миссий</button>
          <button type="button" class="sf-btn-secondary" data-start-skirmish="${c.fac}">Схватка за фракцию</button>
        </div>
      </article>
    `).join('');

    campBox.querySelectorAll('[data-open-missions]').forEach((b) => {
      b.addEventListener('click', () => {
        setFactionTheme(b.dataset.openMissions);
        const tabBtn = document.querySelector('[data-menu-tab="missions"]');
        if (tabBtn) tabBtn.click();
      });
    });
    campBox.querySelectorAll('[data-start-skirmish]').forEach((b) => {
      b.addEventListener('click', () => game.start(b.dataset.startSkirmish));
    });
  }

  // 2. Missions Pane
  const missBox = document.getElementById('missions-grid');
  if (missBox) {
    const allMissions = CAMPAIGNS.flatMap((c) => c.missions.map((m) => ({ ...m, fac: c.fac, campTitle: c.title })));
    missBox.innerHTML = allMissions.map((m) => `
      <article class="sf-mission-card state-${m.state} theme-${m.fac.toLowerCase()}">
        <div class="sf-mission-head">
          <div class="sf-ico-socket"><img src="${m.icon}" alt="${m.name}" class="sf-mission-ico"></div>
          <div>
            <span class="sf-eyebrow">${m.campTitle} · Миссия ${m.num}</span>
            <h4>${m.name}</h4>
            <span class="sf-state-pill ${m.state}">${m.stateLabel}</span>
          </div>
        </div>
        <p class="sf-desc">${m.desc}</p>
        <div class="sf-card-actions">
          ${m.playable
            ? `<button type="button" class="sf-btn-primary" data-play-mission="${m.id}">Брифинг и старт миссии</button>`
            : m.skirmishFac
              ? `<button type="button" class="sf-btn-secondary" data-start-skirmish="${m.skirmishFac}">Сыграть схватку за Нерубов</button>`
              : `<button type="button" class="sf-btn-secondary" disabled>Рабочая заглушка миссии</button>`}
        </div>
      </article>
    `).join('');

    missBox.querySelectorAll('[data-play-mission]').forEach((b) => {
      b.addEventListener('click', () => game.missionHud.brief(b.dataset.playMission));
    });
    missBox.querySelectorAll('[data-start-skirmish]').forEach((b) => {
      b.addEventListener('click', () => game.start(b.dataset.startSkirmish));
    });
  }

  // 3. Factions & Heroes Pane
  const heroBox = document.getElementById('heroes-grid');
  if (heroBox) {
    heroBox.innerHTML = Object.values(HEROES).map((h) => {
      const facObj = FACTIONS[h.fac];
      const facUnits = Object.entries(UNITS).filter(([, u]) => u.fac === h.fac);
      const facBlds = Object.entries(BUILDINGS).filter(([, b]) => b.fac === h.fac);
      return `
        <article class="sf-hero-panel theme-${h.fac.toLowerCase()}">
          <header class="sf-hero-head">
            <div class="sf-portrait-medallion">
              <img src="${h.icon}" alt="${h.name}">
            </div>
            <div class="sf-hero-titles">
              <span class="sf-eyebrow">${facObj.ru}</span>
              <h3>${h.name}</h3>
              <p class="sf-role">${h.title} · <strong class="demo-tag">${h.role}</strong></p>
              <div class="sf-stat-badges">
                <span><img src="assets/ui/stat_hp.svg" alt=""> ОЗ: <b>${h.hp}</b></span>
                <span><img src="assets/ui/stat_dmg.svg" alt=""> Урон: <b>${h.dmg}</b></span>
                <span><img src="assets/ui/stat_armor.svg" alt=""> Броня: <b>${h.armor}</b></span>
                <span><img src="assets/ui/stat_range.svg" alt=""> Бой: <b>${h.range}</b></span>
              </div>
            </div>
          </header>
          <p class="sf-lore">${h.lore}</p>
          <h4 class="sf-sec-title">Макеты способностей героя [Демо UI — не задействованы в симуляции]</h4>
          <div class="sf-ability-list">
            ${h.abilities.map((a) => `
              <div class="sf-ability-card" data-tip-title="${a.name} (${a.key})" data-tip-desc="${a.desc}" data-tip-meta="${a.cost} · КД: ${a.cd} · ${a.req}" data-tip-icon="${a.icon}">
                <div class="sf-ico-socket"><img src="${a.icon}" alt="${a.name}"></div>
                <div>
                  <b>${a.name} <kbd>${a.key}</kbd></b>
                  <small>${a.cost} · КД ${a.cd} · ${a.req}</small>
                  <p>${a.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
          <h4 class="sf-sec-title">Реальные боевые юниты и постройки фракции (из data.js)</h4>
          <div class="sf-roster-strip">
            ${facUnits.map(([id, u]) => `
              <div class="sf-mini-card" data-tip-title="${u.ru}" data-tip-desc="${u.role}" data-tip-meta="ОЗ: ${u.hp} · Урон: ${Math.round(u.dmg)} · Броня: ${u.armor} · Цена: ${u.cost.e} Э${u.cost.w ? ', ' + u.cost.w + ' Д' : ''}" data-tip-icon="${UI_ICONS[id] || ''}">
                <img src="${UI_ICONS[id] || ''}" alt="${u.ru}">
                <span>${u.ru}</span>
              </div>
            `).join('')}
            ${facBlds.map(([id, b]) => `
              <div class="sf-mini-card bld" data-tip-title="${b.ru}" data-tip-desc="Постройка фракции (${b.size}×${b.size})" data-tip-meta="Прочность: ${b.hp} · Броня: ${b.armor} · Цена: ${b.cost.e} Э, ${b.cost.w} Д" data-tip-icon="${UI_ICONS[id] || ''}">
                <img src="${UI_ICONS[id] || ''}" alt="${b.ru}">
                <span>${b.ru}</span>
              </div>
            `).join('')}
          </div>
          <div class="sf-card-actions">
            <button type="button" class="sf-btn-primary" data-apply-theme="${h.fac}">Включить оформление «${facObj.ru}»</button>
            <button type="button" class="sf-btn-secondary" data-start-skirmish="${h.fac}">Начать схватку за фракцию</button>
          </div>
        </article>
      `;
    }).join('');

    heroBox.querySelectorAll('[data-apply-theme]').forEach((b) => {
      b.addEventListener('click', () => setFactionTheme(b.dataset.applyTheme));
    });
    heroBox.querySelectorAll('[data-start-skirmish]').forEach((b) => {
      b.addEventListener('click', () => game.start(b.dataset.startSkirmish));
    });
  }

  // 4. Side-by-Side Dual HUD Comparison Pane
  const cmpBox = document.getElementById('hud-compare-container');
  if (cmpBox) {
    const renderMockHud = (fac, unitName, unitRole, unitIcon, hp, maxHp, dmg, armor, cmds) => `
      <div class="sf-hud-replica theme-${fac.toLowerCase()}">
        <div class="sf-replica-topbar">
          <span class="sf-rep-res"><img src="assets/ui/res_essence.svg" alt=""> Эссенция: <b>500</b></span>
          <span class="sf-rep-res"><img src="assets/ui/res_wood.svg" alt=""> Древесина: <b>200</b></span>
          <span class="sf-rep-res"><img src="assets/ui/res_supply.svg" alt=""> Лимит: <b>18/20</b></span>
          <span class="sf-rep-seal"><img src="assets/ui/${fac === 'HUMANS' ? 'crest_humans.svg' : 'crest_spiders.svg'}" alt=""> <b>${FACTIONS[fac].ru}</b></span>
        </div>
        <div class="sf-replica-mid">
          <div class="sf-replica-journal">
            <div class="sf-j-head">${fac === 'HUMANS' ? '📜 Военный пергамент задач' : '🕸 Хитиновая скрижаль задач'}</div>
            <div class="sf-j-item done">✓ Разведать Пепельный брод (38,40)</div>
            <div class="sf-j-item active">◆ Наладить снабжение (160 Э / 80 Д)</div>
          </div>
          <div class="sf-replica-notif">
            <div class="sf-n-item warn">⚠ Замечены силы противника у брода!</div>
            <div class="sf-n-item ok">✓ Постройка завершена: ${fac === 'HUMANS' ? 'Часовня' : 'Камера выводка'}</div>
          </div>
        </div>
        <div class="sf-replica-bottom">
          <div class="sf-rep-mini">
            <div class="sf-mini-map-sim">
              <i class="dot ally" style="left:24%;top:68%"></i>
              <i class="dot ally" style="left:30%;top:62%"></i>
              <i class="dot enemy" style="left:72%;top:28%"></i>
              <span class="cam-box"></span>
            </div>
            <small>Миникарта · 96×72</small>
          </div>
          <div class="sf-rep-center">
            <div class="sf-rep-portrait"><img src="${unitIcon}" alt="${unitName}"></div>
            <div class="sf-rep-stats">
              <h4>${unitName}</h4>
              <span class="sf-role">${unitRole}</span>
              <div class="hp-strip"><div class="hp-fill" style="width:${Math.round(hp/maxHp*100)}%"></div></div>
              <div class="sf-stat-badges">
                <span>ОЗ ${hp}/${maxHp}</span>
                <span>Урон ${dmg}</span>
                <span>Броня ${armor}</span>
              </div>
            </div>
          </div>
          <div class="sf-rep-cmds">
            ${cmds.map((c) => `
              <button type="button" class="sf-rep-cmd-btn" data-tip-title="${c.t}" data-tip-desc="${c.d}" data-tip-icon="${c.i}">
                <img src="${c.i}" alt="${c.t}">
                <span>${c.t}</span>
                <kbd>${c.k}</kbd>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    cmpBox.innerHTML = `
      <div class="sf-compare-grid">
        <div>
          <h3 class="sf-cmp-heading">Тема I: Орден Последнего Света (Серебристый металл, холодная сталь, светлый камень, слоновая кость и глубокий бордовый)</h3>
          ${renderMockHud('HUMANS', 'Рыцарь Последнего Света', 'Элитный тяжёлый боец Ордена', 'assets/ui/unit_knight.svg', 820, 820, 47, 4, [
            { t: 'Атака', k: 'F', i: 'assets/ui/cmd_attack.svg', d: 'Атакующий марш или удар по цели' },
            { t: 'Стоп', k: 'X', i: 'assets/ui/cmd_stop.svg', d: 'Немедленно остановить отряд' },
            { t: 'Послушник', k: 'Q', i: 'assets/ui/unit_novice.svg', d: 'Обучение рабочего в Цитадели (75 Э)' },
            { t: 'Казармы', k: 'Q', i: 'assets/ui/bld_barracks.svg', d: 'Постройка военного здания (160 Э, 60 Д)' },
            { t: 'Часовня', k: 'T', i: 'assets/ui/bld_chapel.svg', d: 'Лимит +10 и обучение Жрецов (90 Э, 40 Д)' },
            { t: 'Башня', k: 'E', i: 'assets/ui/bld_tower.svg', d: 'Сторожевая башня Ордена (110 Э, 60 Д)' }
          ])}
        </div>
        <div>
          <h3 class="sf-cmp-heading">Тема II: Нерубы (Обсидиан, тёмный хитин, паутинные переплетения, пурпур и биолюминесцентная бирюза)</h3>
          ${renderMockHud('SPIDERS', 'Панцирник', 'Тяжёлый бронированный боец Нерубов', 'assets/ui/unit_spider_armored.svg', 880, 880, 40, 5, [
            { t: 'Атака', k: 'F', i: 'assets/ui/cmd_attack.svg', d: 'Атакующий марш выводка' },
            { t: 'Стоп', k: 'X', i: 'assets/ui/cmd_stop.svg', d: 'Остановить движение отряда' },
            { t: 'Ткач', k: 'Q', i: 'assets/ui/unit_spider_weaver.svg', d: 'Вывод рабочего в Гнезде (70 Э)' },
            { t: 'Инкубатор', k: 'Q', i: 'assets/ui/bld_incubator.svg', d: 'Постройка боевого инкубатора (160 Э, 60 Д)' },
            { t: 'Выводок', k: 'T', i: 'assets/ui/bld_brood.svg', d: 'Камера выводка: +10 к лимиту (90 Э, 40 Д)' },
            { t: 'П-Башня', k: 'E', i: 'assets/ui/bld_webtower.svg', d: 'Паутинная башня (110 Э, 60 Д)' }
          ])}
        </div>
      </div>
    `;
  }
}

function initFloatingTooltips(game) {
  let tip = document.getElementById('sf-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'sf-tooltip';
    tip.hidden = true;
    document.body.appendChild(tip);
  }

  document.addEventListener('pointermove', (e) => {
    const el = e.target?.closest?.('[data-tip-title], #cmds button, #top .res');
    if (!el) {
      tip.hidden = true;
      return;
    }
    let title = el.dataset?.tipTitle || '';
    let desc = el.dataset?.tipDesc || '';
    let meta = el.dataset?.tipMeta || '';
    let icon = el.dataset?.tipIcon || '';

    if (el.matches('#cmds button')) {
      const bKey = el.dataset.build;
      const tKey = el.dataset.train;
      const cKey = el.dataset.cmd;
      icon = UI_ICONS[el.dataset.icon] || '';
      if (bKey && BUILDINGS[bKey]) {
        const d = BUILDINGS[bKey];
        title = `${d.ru} (${el.dataset.key?.toUpperCase() || ''})`;
        desc = d.attack ? `Оборонительное сооружение · Урон ${d.attack.dmg}, дальность ${d.attack.range}` : d.supply ? `Увеличивает лимит населения на +${d.supply}` : 'Военное производственное здание фракции';
        meta = `Цена: ${d.cost.e} Эссенции${d.cost.w ? ', ' + d.cost.w + ' Древесины' : ''} · Прочность: ${d.hp} · Время: ${d.time} с`;
      } else if (tKey && UNITS[tKey]) {
        const d = UNITS[tKey];
        title = `${d.ru} (${el.dataset.key?.toUpperCase() || ''})`;
        desc = d.role;
        meta = `Цена: ${d.cost.e} Э${d.cost.w ? ', ' + d.cost.w + ' Д' : ''} · Лимит: ${d.supply} · ОЗ: ${d.hp} · Урон: ${Math.round(d.dmg)} · Броня: ${d.armor}`;
      } else if (cKey) {
        title = el.querySelector('b')?.textContent || 'Команда';
        desc = el.title || 'Тактический приказ выбранному отряду';
        meta = `Горячая клавиша: ${(el.dataset.key || '').toUpperCase()}`;
      }
    } else if (el.matches('#top .res')) {
      title = el.getAttribute('title') || 'Ресурс';
      if (title.includes('Эссенция')) {
        icon = 'assets/ui/res_essence.svg';
        desc = 'Кристаллизованная энергия разломов. Основной ресурс для найма всех войск и возведения построек.';
        meta = 'Добывается рабочими в жилах эссенции (по 10 ед. за рейс)';
      } else if (title.includes('Древесина')) {
        icon = 'assets/ui/res_wood.svg';
        desc = 'Крепкий строевой лес для укреплений, башен, стрелкового оружия и сложных зданий.';
        meta = 'Добывается рабочими в лесных массивах (по 8 ед. за рейс)';
      } else {
        icon = 'assets/ui/res_supply.svg';
        desc = 'Текущая численность армии и рабочих относительно максимального лимита снабжения (макс. 60).';
        meta = 'Увеличивается Цитаделью / Гнездом и Часовнями / Камерами выводка (+10)';
      }
    }

    if (!title) {
      tip.hidden = true;
      return;
    }

    tip.innerHTML = `
      <div class="sf-tip-head">
        ${icon ? `<img src="${icon}" alt="">` : ''}
        <div>
          <strong>${title}</strong>
          ${meta ? `<small>${meta}</small>` : ''}
        </div>
      </div>
      ${desc ? `<p>${desc}</p>` : ''}
    `;
    tip.hidden = false;
    const x = Math.min(window.innerWidth - 310, Math.max(10, e.clientX + 16));
    const y = Math.max(10, e.clientY - tip.offsetHeight - 14 < 10 ? e.clientY + 18 : e.clientY - tip.offsetHeight - 14);
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  });
}
