# SILKFRONT — загружено из Ui.zip (Google Drive)

Источник: https://drive.google.com/file/d/1smkvpFeHgK5WflafPZ7517VsGVg3lOtq/view

## Что внутри
- `SILKFRONT_UI_Prototype.html` — автономный интерактивный прототип интерфейса (7 экранов, темы Ордена и Нерубов) — открывается как статический файл.
- `GAME/` — браузерная RTS (Canvas 2D, без зависимостей): `node serve.js` → `/GAME/index.html`.
- `ART/`, `ART_SRC/`, `ASSET_LIBRARY/` — спрайтовые атласы, исходники и библиотека ассетов.
- `tools/` — генераторы арта и Playwright-проверки (запускать с `npm i` в `tools/artgen` и `tools/gamecheck`).
- `SILKFRONT_UI_Assets_Pack.zip` — пакет иконок интерфейса (42 SVG + 42 PNG).

## Отличия от исходного архива
- Удалены `node_modules/` (≈24 МБ) и каталоги `REVIEW_BACKUP_*` (≈41 МБ) — это дубли промежуточных проверок арта/камеры/миссии.
- `GAME/serve.js`: сервер слушает `0.0.0.0` (было `127.0.0.1`) и `/` отдаёт сразу `/GAME/index.html`, чтобы сборка открывалась через прокси/на LAN.

Общий объём: ≈39 МБ, 512 файлов.
