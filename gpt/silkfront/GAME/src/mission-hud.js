// Mission presentation only. Does not grant resources, issue orders or own victory logic.
import { MISSIONS } from './missions/index.js';
import { TILE } from './data.js';
const $ = (id) => document.getElementById(id);

export class MissionHud {
  constructor(game) {
    this.g = game; this.pending = null; this.signature = '';
    $('btn-mission').onclick = () => this.brief('ash-outskirts');
    $('btn-mission-start').onclick = () => {
      const id = this.pending;
      $('mission-briefing').close();
      if (id) this.g.start('HUMANS', id);
    };
    $('btn-objective').onclick = () => {
      const o = game.world?.scenario?.current();
      if (o?.at) game.center((o.at[0] + 0.5) * TILE, (o.at[1] + 0.5) * TILE);
    };
    $('btn-settlement').onclick = () => game.home();
  }
  brief(id) {
    const def = MISSIONS[id]; if (!def) return;
    this.pending = id;
    $('brief-title').textContent = def.name;
    $('brief-campaign').textContent = `Кампания «${def.campaign}» · Миссия 01 · ${def.subtitle}`;
    $('brief-intro').textContent = def.intro;
    $('brief-victory').textContent = def.victory;
    $('brief-defeat').textContent = def.defeat;
    $('brief-hint').textContent = def.hint;
    $('mission-briefing').showModal();
  }
  reset() {
    this.signature = '';
    const s = this.g.world?.scenario;
    $('mission-objectives').hidden = !s;
    $('mission-objectives').open = true;
    document.body.classList.toggle('mission-play', Boolean(s));
    if (!s) return;
    $('mission-label').textContent = `Миссия 01 · ${s.definition.name}`;
    $('mission-tasks').replaceChildren(...s.objectives.map((o) => {
      const li = document.createElement('li'); li.id = 'objective-' + o.id;
      const title = document.createElement('strong'); title.textContent = o.title;
      const progress = document.createElement('span'); progress.className = 'objective-progress';
      li.append(title, progress); return li;
    }));
    this.update();
  }
  update() {
    const w = this.g.world, s = w?.scenario; if (!s) return;
    const citadel = w.alive(s.refs[s.definition.protected]);
    const guard = citadel ? `Цитадель: ${Math.ceil(citadel.hp)}/${citadel.maxHp} · потеря = поражение` : 'Цитадель разрушена';
    const sig = guard + '|' + s.status + '|' + s.objectives.map((o) => o.done + ':' + s.progress(w, o)).join('|');
    if (sig === this.signature) return; this.signature = sig;
    $('mission-guard').textContent = guard;
    const active = s.current();
    $('mission-current').textContent = s.status === 'active' ? active?.detail || '' : s.reason;
    for (const o of s.objectives) {
      const li = $('objective-' + o.id); li.classList.toggle('done', o.done);
      li.querySelector('.objective-progress').textContent = o.done ? '✓ Выполнено' : s.progress(w, o);
    }
  }
  hide() { $('mission-objectives').hidden = true; document.body.classList.remove('mission-play'); }
}
