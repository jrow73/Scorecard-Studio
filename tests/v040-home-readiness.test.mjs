import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { fetchSportScheduleBundle } from "../js/api.js";
import { gameMatchesSearch, groupScheduleGames, probablePitcherMatchup, scheduleReadiness } from "../js/v040-home.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Schedule readiness keeps ready, partial, waiting, and terminal states distinct", () => {
  assert.deepEqual(scheduleReadiness({ awayLineup: Array(9), homeLineup: Array(9), status: "Scheduled" }), { key: "ready", label: "Ready", tone: "ready", lineupsComplete: true });
  assert.deepEqual(scheduleReadiness({ awayLineup: Array(9), homeLineup: [], status: "Scheduled" }), { key: "partial", label: "Partial", tone: "warning", lineupsComplete: false });
  assert.deepEqual(scheduleReadiness({ awayLineup: [], homeLineup: [], status: "Scheduled" }), { key: "waiting", label: "Waiting for lineups", tone: "neutral", lineupsComplete: false });
  assert.deepEqual(scheduleReadiness({ abstractGameState: "Final", status: "Final" }), { key: "terminal", label: "Final", tone: "neutral", lineupsComplete: true });
  assert.deepEqual(scheduleReadiness({ status: "Postponed" }), { key: "terminal", label: "Postponed", tone: "warning", lineupsComplete: false });
});

test("level schedules group only unambiguous same-league games and keep neutral games separate", () => {
  const games = [
    { gamePk: "3", sportId: 12, gameDate: "2026-06-01T20:00:00Z", awayLeagueId: 111, homeLeagueId: 222 },
    { gamePk: "2", sportId: 12, gameDate: "2026-06-01T19:00:00Z", awayLeagueId: 111, homeLeagueId: 111, awayLeagueName: "Eastern League" },
    { gamePk: "1", sportId: 12, gameDate: "2026-06-01T18:00:00Z", awayLeagueId: 111, homeLeagueId: 111, homeLeagueName: "Eastern League" }
  ];
  assert.deepEqual(groupScheduleGames(games).map((group) => ({ label: group.label, games: group.games.map((game) => game.gamePk) })), [
    { label: "Eastern League", games: ["1", "2"] },
    { label: "Other / Cross-league", games: ["3"] }
  ]);
});

test("probable starters remain independent and never infer a roster pitcher", () => {
  assert.deepEqual(probablePitcherMatchup({ awayProbablePitcher: { fullName: "Away Ace" } }), { away: "Away Ace", home: "TBD" });
});

test("Home schedule search matches teams, abbreviations, and league labels without changing data", () => {
  const game = { awayTeam: "Québec Capitales", homeTeam: "Somerset Patriots", awayTeamAbbreviation: "QUE", homeTeamAbbreviation: "SOM" };
  assert.equal(gameMatchesSearch(game, "quebec", "Eastern League"), true);
  assert.equal(gameMatchesSearch(game, "SOM", "Eastern League"), true);
  assert.equal(gameMatchesSearch(game, "eastern", "Eastern League"), true);
  assert.equal(gameMatchesSearch(game, "mariners", "Eastern League"), false);
  assert.equal(gameMatchesSearch(game, "", "Eastern League"), true);
});

test("date-and-level Schedule discovery is sport-scoped", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return { ok: true, json: async () => ({ dates: [] }) };
  };
  try {
    assert.deepEqual(await fetchSportScheduleBundle("2026-06-01", 13), { games: [], payload: { dates: [] } });
    const url = new URL(requestedUrl);
    assert.equal(url.pathname, "/api/v1/schedule");
    assert.equal(url.searchParams.get("date"), "2026-06-01");
    assert.equal(url.searchParams.get("sportId"), "13");
    assert.equal(url.searchParams.get("teamId"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Home is Schedule-only while Game Day and scorecard actions retain hydration", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  const app = await readFile(path.join(root, "js", "app.js"), "utf8");
  const meta = JSON.parse(await readFile(path.join(root, "app-meta.json"), "utf8"));
  const scheduleLoader = app.slice(app.indexOf("async function loadLevelSchedule"), app.indexOf("async function refreshHomeSchedule"));
  const settingsInitializer = app.slice(app.indexOf("async function initializeFavoriteTeamSetting"), app.indexOf("async function loadSettingsTeams"));
  const selector = app.slice(app.indexOf("function selectGame"), app.indexOf("async function refreshDoubleheaderSelectionContext"));
  assert.match(scheduleLoader, /fetchSportScheduleBundle/);
  assert.doesNotMatch(scheduleLoader, /loadPregameCore|fetchTeamRoster|fetchPeoplePregameStats/);
  assert.doesNotMatch(settingsInitializer, /loadSettingsTeams|fetchTeamsForSport/);
  assert.doesNotMatch(selector, /loadPregameCore|hydrateSelectedGameModel/);
  assert.match(app, /async function loadGameDay[\s\S]*hydrateSelectedGameModel/);
  assert.match(app, /async function generateLivePdf[\s\S]*buildModelForMappings/);
  assert.match(html, /id="home-level-select"/);
  assert.match(html, /id="open-selected-gameday-btn"/);
  assert.match(html, /id="probable-pitchers"/);
  assert.doesNotMatch(html, /class="hero-card card" data-view="home"/);
  assert.doesNotMatch(html, /id="include-additional-starters"/);
  assert.doesNotMatch(html, /<details class="detail-panel">/);
  assert.deepEqual(meta, { version: "0.4.0", build: "004.9" });
});
