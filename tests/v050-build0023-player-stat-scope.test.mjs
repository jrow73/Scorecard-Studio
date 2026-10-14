import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { classifyCompetitionPhase } from "../js/v050-competition-context.js";
import {
  normalizePlayerStatScopeSelection,
  playerStatScopeAvailability,
  playerStatScopeMessage,
  playerStatScopeToggleVisible
} from "../js/v050-player-stat-scope.js";
import { selectScopedStats } from "../js/v030-roster-people-normalizer.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 002.3 exposes two scopes only for postseason games and defaults to Postseason", () => {
  const postseason = classifyCompetitionPhase({ sportId: 1, gameType: "W", officialDate: "2026-10-12" });
  const regular = classifyCompetitionPhase({ sportId: 1, gameType: "R", officialDate: "2026-09-12" });
  assert.equal(playerStatScopeToggleVisible(postseason), true);
  assert.equal(normalizePlayerStatScopeSelection(postseason), "postseason");
  assert.equal(normalizePlayerStatScopeSelection(postseason, "regularSeason"), "regularSeason");
  assert.equal(playerStatScopeToggleVisible(regular), false);
  assert.equal(normalizePlayerStatScopeSelection(regular), "regularSeason");
});

test("Build 002 wrap-up exposes First Half and Second Half scopes only after a verified MiLB second-half start", () => {
  const first = classifyCompetitionPhase({ sportId: 12, gameType: "R", officialDate: "2026-05-20", splitSeasonType: "firstHalf" });
  const second = classifyCompetitionPhase({ sportId: 12, gameType: "R", officialDate: "2026-08-20", splitSeasonType: "secondHalf" });
  assert.equal(playerStatScopeToggleVisible(first), false);
  assert.deepEqual(first.playerStatScopes.map((scope) => scope.key), ["firstHalf"]);
  assert.equal(playerStatScopeToggleVisible(second), true);
  assert.deepEqual(second.playerStatScopes.map((scope) => scope.key), ["firstHalf", "secondHalf"]);
  assert.equal(normalizePlayerStatScopeSelection(second), "secondHalf");
  assert.match(playerStatScopeMessage("firstHalf", { state: "available" }), /first-half team context and player statistics/i);
});

test("Build 002.3 distinguishes unavailable statistics, real zeroes, and recorded appearances", () => {
  const unavailable = { away: { lineup: [{ player: { id: 1 }, stats: {} }] }, home: {} };
  const zero = { away: { lineup: [{ player: { id: 1 }, stats: { hitting: { totals: { gamesPlayed: 0, plateAppearances: 0 } } } }] }, home: {} };
  const available = { away: { startingPitcher: { player: { id: 2 }, stats: { pitching: { totals: { gamesPitched: 2 } } } } }, home: {} };
  assert.equal(playerStatScopeAvailability(unavailable).state, "unavailable");
  assert.equal(playerStatScopeAvailability(zero).state, "zero");
  assert.equal(playerStatScopeAvailability(available).state, "available");
  assert.match(playerStatScopeMessage("postseason", playerStatScopeAvailability(unavailable)), /no prior player statistics are available/i);
  assert.match(playerStatScopeMessage("postseason", playerStatScopeAvailability(zero)), /no prior player appearances are recorded/i);
});

test("Build 002.3 preloads independent scopes and switches cached models without refetching", async () => {
  const [app, html, css, meta] = await Promise.all([
    read("js/app.js"), read("index.html"), read("css/styles.css"), read("app-meta.json").then(JSON.parse)
  ]);
  assert.deepEqual(meta, { version: "0.5.0", build: "005.2" });
  assert.match(html, /id="gameday-player-stat-scope" hidden/);
  assert.match(html, /name="gameday-player-stat-scope" value="regularSeason"/);
  assert.match(html, /name="gameday-player-stat-scope" value="postseason"/);
  assert.match(css, /\.gameday-section-nav\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.gameday-player-stat-scope-switch/);
  assert.match(app, /context\.playerStatScopes\.map/);
  assert.match(app, /fetchGameDayPlayerStatScopes\(competitionContext, personIds, game, seasonStart, cutoffDate, standingsBundle\.scopeRanges\)/);
  assert.match(app, /gameDayPeopleScopes\?\.\[selectedScope\]/);
  const handler = app.slice(app.indexOf("function handleGameDayPlayerStatScopeChange"), app.indexOf("function updateGameDaySourceMessage"));
  assert.doesNotMatch(handler, /fetch/);
  assert.match(handler, /renderGameDay\(model\)/);
  assert.match(app, /buildV030Model\(game, supplemental, \{ updateAvailability = true \} = \{\}\)/);
});

test("Build 002.3a selects the explicit all-scope aggregate when postseason rounds return separate MLB splits", () => {
  const rawPerson = {
    stats: [{
      group: { displayName: "hitting" },
      type: { displayName: "byDateRange" },
      splits: [
        { sport: { id: 1 }, stat: { gamesPlayed: 5, plateAppearances: 23, avg: ".211" } },
        { sport: { id: 1 }, stat: { gamesPlayed: 1, plateAppearances: 5, avg: ".200" } },
        { sport: { id: 0, code: "All" }, stat: { gamesPlayed: 6, plateAppearances: 28, avg: ".208" } }
      ]
    }]
  };
  const selected = selectScopedStats(rawPerson, "hitting", {
    sportId: 1,
    gameTypes: ["F", "D", "L", "W"],
    statGroups: ["hitting"],
    statType: "byDateRange",
    startDate: "2026-01-01",
    endDate: "2026-10-12"
  });
  assert.equal(selected.state, "available");
  assert.equal(selected.value.scope.aggregate.selection, "all");
  assert.deepEqual(selected.value.totals, { gamesPlayed: 6, avg: 0.208, plateAppearances: 28 });
});
