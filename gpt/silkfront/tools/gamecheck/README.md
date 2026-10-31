# SILKFRONT browser diagnostics

Game runtime remains dependency-free. This separate package pins Playwright for reproducible diagnostics.

1. `npm ci --ignore-scripts` here (Node >=20).
2. Start `npm start` from `../../GAME`; use the actual URL it prints, never assume a port.
3. `npm test -- http://127.0.0.1:<port>/GAME/index.html` checks both factions: worker purchase/queue/time, paused status, build order/foundation/progress/completion, producer selection, troop training, no console or network errors. It uses installed Edge/Chrome on Windows; set `SILKFRONT_BROWSER` for another executable.
4. `npm run match -- <URL> HUMANS` and `... SPIDERS` run full real-time 4x games in the player slot, against the opponent AI only. Actions are ordinary UI controls, never cheats or simulation state injection. These are automated acceptance runs, not human-playtest evidence. Reports/screenshots: `../../GAME/reports/match-*`.
5. `node library-review.mjs` exports the inspected library snapshot's generator output to review SVG/PNG via Chromium. This does not change accepted art. `node library-metrics.mjs <URL>` checks alpha/bounds; `node capture-library.mjs <URL>` saves the review overview.

`manual-session.mjs`, `manual-driver.mjs`, `manual-command.mjs`, `manual-actions.json` support turn-by-turn agent-issued DOM commands. Start the session with the actual game URL; it prints a loopback controller URL. Put a bounded action batch into manual-actions.json and run `node manual-command.mjs <controllerURL>`; inspect the returned HUD before choosing the next batch. The browser is isolated/headless: an earlier headed session closed at 1:25. The repeated sessions completed naturally: HUMANS defeat 5:18, SPIDERS victory 12:01. Both final screens and frozen clocks were asserted. Histories/screenshots are in reports/manual-*. These are agent-controlled games, not independent human playtests. The first partial session remains in the human history and must not be counted separately. The controller is local-only, denies cross-origin commands and accepts bounded action batches; do not expose it externally. The scripts are not required by the game or standard tests. `diagnose-browser.mjs` identified an actual favicon 404; errors were not ignored.

## First story mission

`npm run test:mission -- <actual base URL /GAME/index.html>` runs `mission-01.mjs`. It uses ordinary UI and real 4× game time: mission briefing/deep link, unknown IDs, observer isolation, canvas worker selection, economy, resume tower, build supply, training, scouting, target attack, natural victory, replay/reset, natural defeat without surrender, frozen clocks and return to SPIDERS skirmish. There is no game-object access or HP/resource/outcome injection. Reports/screenshots: `../../GAME/reports/mission-01/`. This is automated acceptance, not independent human playtesting. The game still has no runtime dependencies.

Checks must wait on domain state, not stale resource IDs or expired toast text. The library remains unaccepted until the separate art/integration review is approved.
