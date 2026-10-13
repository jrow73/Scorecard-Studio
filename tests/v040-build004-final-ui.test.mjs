import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 004.8 bounds Home schedule controls without forcing narrow fields across the card", async () => {
  const css = await read("css/styles.css");
  const refinement = css.slice(css.lastIndexOf("v0.4 Build 004.8 —"));
  assert.match(refinement, /\.home-browser-controls\s*\{[^}]*grid-template-columns:\s*minmax\(220px, 300px\) minmax\(150px, 220px\) auto auto;[^}]*justify-content:\s*start/s);
  assert.match(refinement, /@media \(max-width: 940px\)[\s\S]*?grid-template-columns:\s*minmax\(220px, 300px\) minmax\(150px, 220px\)/);
  assert.match(refinement, /> label:first-child \{ width: min\(100%, 300px\); \}/);
  assert.match(refinement, /> label:nth-child\(2\) \{ width: min\(100%, 220px\); \}/);
  assert.match(refinement, /> button \{ justify-self: start; \}/);
  assert.match(refinement, /@media \(max-width: 620px\)[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
});

test("Build 004.8 gives Standard and Advanced distinct team facts", async () => {
  const app = await read("js/app.js");
  const renderer = app.slice(app.indexOf("function renderGameDayTeamCards"), app.indexOf("function gameDayFact"));
  for (const label of ["Record", "PCT", "Games Played", "Division Rank", "Games Back"]) {
    assert.match(renderer, new RegExp(`gameDayFact\\("${label}"`));
  }
  for (const label of ["League Rank", "Wild Card Rank", "Wild Card Games Back"]) {
    assert.match(renderer, new RegExp(`gameDayFact\\("${label}"`));
  }
  for (const removed of ["Team Game", "Division", "Streak", "Last 10"]) {
    assert.doesNotMatch(renderer, new RegExp(`gameDayFact\\("${removed}"`));
  }
  assert.match(renderer, /data-gameday-team-summary/);
  assert.match(renderer, /data-gameday-team-advanced/);
  assert.match(renderer, /exposedGamesBack\(standings\.wildCardGamesBack\)/);
});

test("Build 004.8 embeds division standings only in Advanced and centers a shared division", async () => {
  const [html, app, css] = await Promise.all([read("index.html"), read("js/app.js"), read("css/styles.css")]);
  const refinement = css.slice(css.lastIndexOf("v0.4 Build 004.8 —"));
  assert.doesNotMatch(html, /id="gameday-relevant-standings"/);
  assert.match(app, /gameday-team-embedded-standings/);
  assert.match(app, /gameday-team-shared-standings/);
  assert.match(app, /gameday-team-grid-shared-division/);
  assert.ok(app.indexOf('elements.gameDayTeamGrid.append(cards.get("away"))') < app.indexOf("elements.gameDayTeamGrid.append(sharedStandings)"));
  assert.ok(app.indexOf("elements.gameDayTeamGrid.append(sharedStandings)") < app.indexOf('elements.gameDayTeamGrid.append(cards.get("home"))'));
  assert.match(refinement, /\[data-detail-level="compact"\] \[data-gameday-team-advanced\]/);
  assert.match(refinement, /\[data-detail-level="standard"\] \[data-gameday-team-advanced\]/);
  assert.match(refinement, /\[data-detail-level="advanced"\] \.gameday-team-grid-shared-division\s*\{[^}]*grid-template-columns:\s*minmax\(210px, \.65fr\) minmax\(560px, 1\.7fr\) minmax\(210px, \.65fr\)/s);
});

test("Build 004.8a closes the unused Player gap without changing Standard table widths", async () => {
  const css = await read("css/styles.css");
  const correction = css.slice(css.lastIndexOf("v0.4 Build 004.8a"));
  assert.match(css, /\[data-detail-level="standard"\] \.gameday-batter-table \{ width: 471px; \}/);
  assert.match(css, /\[data-detail-level="standard"\] \.gameday-pitcher-table \{ width: 499px; \}/);
  assert.match(correction, /\.gameday-batter-table,[\s\S]*?\.gameday-pitcher-table \{ width: 640px; \}/);
  assert.match(correction, /\.gameday-batter-table th:nth-child\(2\),[\s\S]*?\.gameday-pitcher-table td:nth-child\(2\) \{ width: 150px; min-width: 150px; max-width: 150px; \}/);
});

test("Build 004.8b removes repetitive controls and compacts Home and Settings", async () => {
  const [html, app, css] = await Promise.all([read("index.html"), read("js/app.js"), read("css/styles.css")]);
  const refinement = css.slice(css.lastIndexOf("v0.4 Build 004.8b"));
  assert.doesNotMatch(html, /id="browse-level-games-btn"|id="load-favorite-game-btn"|>Show Games<|>Favorite Team Today</);
  assert.doesNotMatch(html, /class="card settings-header-card"/);
  assert.match(html, /class="settings-preference-grid"/);
  assert.match(html, /class="home-browser-controls"[\s\S]*?id="home-game-search"/);
  assert.match(html, /class="home-game-results"[\s\S]*?id="home-game-count"/);
  assert.match(app, /await loadLevelSchedule\(today, state\.favoriteCompetition\?\.levelKey \|\| elements\.homeLevelSelect\.value \|\| "mlb"\)/);
  assert.match(refinement, /\.settings-preference-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(refinement, /\.home-browser-controls\s*\{[^}]*grid-template-columns:\s*minmax\(220px, 300px\) 160px minmax\(280px, 480px\)/s);
  assert.match(refinement, /\.selected-game-empty\[hidden\] \{ display: none !important; \}/);
});
