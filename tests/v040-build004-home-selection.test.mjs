import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 004.8d shows the full level schedule and preselects the favorite team's game when applicable", async () => {
  const app = await read("js/app.js");
  const levelLoader = app.slice(app.indexOf("async function loadLevelSchedule"), app.indexOf("async function refreshHomeSchedule"));
  const bundleHandler = app.slice(app.indexOf("function applyScheduleBundle"), app.indexOf("function clearSelectedScheduleGame"));
  assert.match(levelLoader, /fetchSportScheduleBundle\(requestedDate, level\.sportId\)/);
  assert.match(levelLoader, /state\.favoriteCompetition\?\.levelKey === level\.levelKey/);
  assert.match(levelLoader, /preferredTeamId: state\.favoriteCompetition\.teamId|state\.favoriteCompetition\.teamId/);
  assert.match(bundleHandler, /state\.schedule\.find\(\(game\) => Number\(game\.awayTeamId\)/);
  assert.match(bundleHandler, /if \(preferredGame\) selectGame\(preferredGame\.gamePk\)/);
  assert.match(bundleHandler, /else renderUnselectedGame\(\)/);
  assert.doesNotMatch(app, /async function loadFavoriteTeamPregame/);
});

test("Home filter is immediate, local, and selection-neutral", async () => {
  const [html, app] = await Promise.all([read("index.html"), read("js/app.js")]);
  const handler = app.slice(app.indexOf("function handleHomeGameSearch"), app.indexOf("async function handleGameDateChange"));
  assert.match(html, /id="home-game-search"[^>]*type="search"/);
  assert.match(html, /id="home-game-count"[^>]*aria-live="polite"/);
  assert.match(html, /id="home-game-filter-empty"[^>]*role="status"/);
  assert.match(handler, /renderGameChoices\(state\.schedule\)/);
  assert.doesNotMatch(handler, /fetch|selectGame|loadLevelSchedule/);
});

test("Schedule and Selected Game are sibling cards in a responsive Home workspace", async () => {
  const [html, app, css, meta] = await Promise.all([read("index.html"), read("js/app.js"), read("css/styles.css"), read("app-meta.json").then(JSON.parse)]);
  assert.match(html, /class="home-workspace"[^>]*data-view="home"/);
  assert.match(html, /class="card home-schedule-card"/);
  assert.match(html, /class="card selected-game-card"/);
  assert.ok(html.indexOf('class="card home-schedule-card"') < html.indexOf('class="card selected-game-card"'));
  assert.match(html, /id="selected-game-empty"/);
  assert.match(html, /id="selected-game-details" hidden/);
  assert.match(css, /\.home-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(680px, 1\.05fr\) minmax\(520px, \.95fr\)/s);
  assert.match(css, /@media \(min-width: 1281px\)[\s\S]*?\.home-workspace \.home-schedule-card\s*\{[^}]*height:\s*auto[^}]*min-height:\s*0/s);
  assert.match(css, /\.home-workspace \.home-game-groups\s*\{[^}]*max-height:\s*calc\(100dvh - var\(--app-header-height\) - 330px\)[^}]*overflow-y:\s*auto/s);
  assert.match(css, /@media \(max-width: 1280px\)[\s\S]*?\.home-workspace \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  const choices = app.slice(app.indexOf("function renderGameChoices"), app.indexOf("function highlightSelectedGame"));
  assert.doesNotMatch(choices, /<small>\$\{escapeHtml\(game\.status/);
  assert.match(choices, /mini-readiness/);
  assert.deepEqual(meta, { version: "0.4.0", build: "004.9" });
});
