import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  advancedTeamPresentation,
  classifyCompetitionPhase,
  competitionContextForModel,
  postseasonSeriesPresentation,
  standardTeamPresentation,
  selectActiveSplitStandingsConfig
} from "../js/v050-competition-context.js";
import { standingsPresentation } from "../js/v040-gameday.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const team = {
  record: { wins: 70, losses: 61, gamesPlayed: 131, pct: 0.534 },
  standings: {
    divisionRank: { raw: "2", value: 2 },
    leagueRank: { raw: "4", value: 4 },
    wildCardRank: { raw: "1", value: 1 },
    divisionGamesBack: { raw: "3.0", state: "behind", games: 3 },
    leagueGamesBack: { raw: "5.0", state: "behind", games: 5 },
    wildCardGamesBack: { raw: "-", state: "leader", games: 0 },
    streak: "W3",
    lastTen: { wins: 7, losses: 3 },
    runsScored: 612,
    runsAllowed: 578,
    runDifferential: 34,
    homeRecord: { wins: 39, losses: 27, display: "39-27" },
    awayRecord: { wins: 31, losses: 34, display: "31-34" }
  }
};

test("Build 002.2 derives model context from explicit standings scope", () => {
  const context = competitionContextForModel({
    context: { sport: { id: 12 }, gameType: "R", officialDate: "2025-08-15" },
    standings: { groups: [{ standingsType: "secondHalf" }] }
  });
  assert.equal(context.key, "milb-second-half");
  assert.equal(context.label, "Second Half");
});

test("Build 002.2 selects a started second half, otherwise a started first half", () => {
  const config = (standingsType, gamesPlayed) => ({
    outcome: "success",
    input: { standingsType },
    payload: { records: [{ teamRecords: [{ gamesPlayed }] }] }
  });
  assert.equal(selectActiveSplitStandingsConfig([config("firstHalf", 62), config("secondHalf", 4)]).input.standingsType, "secondHalf");
  assert.equal(selectActiveSplitStandingsConfig([config("firstHalf", 20), config("secondHalf", 0)]).input.standingsType, "firstHalf");
  assert.equal(selectActiveSplitStandingsConfig([config("firstHalf", 0), config("secondHalf", 0)]), null);
});

test("Build 002.2 changes Advanced facts without changing the shared team model", () => {
  const early = advancedTeamPresentation(team, classifyCompetitionPhase({ sportId: 1, gameType: "R", officialDate: "2025-08-31" }), "away");
  assert.deepEqual(early.facts.map((fact) => fact.label), ["Runs Scored", "Runs Allowed", "Run Differential", "Home Record", "Away Record"]);
  assert.equal(early.facts.find((fact) => fact.label === "Away Record").emphasized, true);

  const race = advancedTeamPresentation(team, classifyCompetitionPhase({ sportId: 1, gameType: "R", officialDate: "2025-09-01" }));
  assert.deepEqual(race.facts.map((fact) => fact.label), ["Runs Scored", "Runs Allowed", "Run Differential", "Home Record", "Away Record", "League Rank", "Wild Card Rank", "Wild Card Games Back"]);

  const postseason = advancedTeamPresentation(team, classifyCompetitionPhase({ sportId: 1, gameType: "W", officialDate: "2025-10-20" }));
  assert.deepEqual(postseason.facts.map((fact) => fact.label), ["Series Record"]);

  const half = advancedTeamPresentation(team, classifyCompetitionPhase({ sportId: 12, gameType: "R", officialDate: "2025-08-15", splitSeasonType: "secondHalf" }), "home", "secondHalf");
  assert.deepEqual(half.facts.map((fact) => fact.label), ["Runs Scored", "Runs Allowed", "Run Differential", "Home Record", "Away Record"]);
  assert.equal(half.facts.find((fact) => fact.label === "Home Record").emphasized, true);
});

test("Build 002.2b labels Schedule team records as current-series records in postseason", () => {
  const context = classifyCompetitionPhase({ sportId: 1, gameType: "L", officialDate: "2026-10-13" });
  assert.deepEqual(standardTeamPresentation(team, context).facts.map((fact) => fact.label), ["Series Record"]);
  assert.deepEqual(advancedTeamPresentation(team, context).facts.map((fact) => fact.label), ["Series Record"]);
});

test("Build 002 wrap-up switches postseason and MiLB team-card context with player scope", () => {
  const postseason = classifyCompetitionPhase({ sportId: 1, gameType: "L", officialDate: "2026-10-13" });
  assert.deepEqual(standardTeamPresentation(team, postseason, "regularSeason").facts.map((fact) => fact.label), ["Final Record", "PCT", "Division Finish"]);
  assert.equal(advancedTeamPresentation(team, postseason, "away", "regularSeason").standingsType, "regularSeason");

  const secondHalf = classifyCompetitionPhase({ sportId: 12, gameType: "R", officialDate: "2026-08-15", splitSeasonType: "secondHalf" });
  assert.deepEqual(standardTeamPresentation(team, secondHalf, "firstHalf").facts.map((fact) => fact.label), ["First Half Record", "PCT", "Division Rank", "Games Back"]);
});

test("Build 002.2b produces a shared postseason series presentation", () => {
  const presentation = postseasonSeriesPresentation({
    context: { sport: { id: 1 }, gameType: "L", officialDate: "2026-10-13" },
    game: { series: { description: "American League Championship Series", gameNumber: 2, gamesInSeries: 7 } },
    away: { team: { name: "Cleveland Guardians", record: { wins: 1, losses: 0 } } },
    home: { team: { name: "Tampa Bay Rays", record: { wins: 0, losses: 1 } } }
  });
  assert.deepEqual(presentation, {
    title: "American League Championship Series",
    gameLabel: "Game 2",
    formatLabel: "Best of 7",
    status: "Cleveland Guardians lead series, 1–0"
  });
});

test("Build 002.2b exposes only source Wild Card groups as Other Standings", () => {
  const group = (standingsType, leagueName, teamIds) => ({
    key: `${standingsType}:1:${leagueName === "American League" ? 103 : 104}:none`,
    standingsType,
    league: { id: leagueName === "American League" ? 103 : 104, name: leagueName },
    division: { id: null, name: null },
    rows: teamIds.map((id) => ({ team: { id, name: `Team ${id}` } }))
  });
  const presentation = standingsPresentation({
    away: { team: { id: 1 } },
    home: { team: { id: 2 } },
    standings: { groups: [
      group("regularSeason", "American League", [1, 3, 4, 5, 6]),
      group("wildCard", "American League", [1, 3, 4]),
      group("wildCard", "National League", [7, 8, 9]),
      group("divisionLeaders", "American League", [2])
    ] }
  });
  assert.equal(presentation.relevant.length, 1);
  assert.deepEqual(presentation.other.map((item) => item.title), ["American League Wild Card", "National League Wild Card"]);
  assert.equal(presentation.other.some((item) => item.group.standingsType === "divisionLeaders"), false);
});

test("opposite-league Other Standings stay in their team's column", () => {
  const group = (leagueId, divisionId, titleTeamId) => ({
    key: `regularSeason:1:${leagueId}:${divisionId}`,
    standingsType: "regularSeason",
    league: { id: leagueId, name: leagueId === 103 ? "American League" : "National League" },
    division: { id: divisionId, name: `Division ${divisionId}` },
    rows: [{ team: { id: titleTeamId, name: `Team ${titleTeamId}` } }]
  });
  const presentation = standingsPresentation({
    away: { team: { id: 1, league: { id: 104, name: "National League" } } },
    home: { team: { id: 2, league: { id: 103, name: "American League" } } },
    standings: { groups: [
      group(103, 201, 3),
      group(104, 204, 4),
      group(103, 202, 5),
      group(104, 205, 6)
    ] }
  });

  assert.deepEqual(presentation.other.map((item) => item.leagueSideKey), ["away", "away", "home", "home"]);
  assert.deepEqual(presentation.other.map((item) => item.group.league.id), [104, 104, 103, 103]);
});

test("Build 002.2 omits unavailable optional Wild Card games back", () => {
  const unavailable = structuredClone(team);
  unavailable.standings.wildCardGamesBack = { raw: null, state: "notApplicable", games: null };
  const context = classifyCompetitionPhase({ sportId: 1, gameType: "R", officialDate: "2025-09-15" });
  assert.deepEqual(advancedTeamPresentation(unavailable, context).facts.map((fact) => fact.label), ["Runs Scored", "Runs Allowed", "Run Differential", "Home Record", "Away Record", "League Rank", "Wild Card Rank"]);
});

test("Build 002.2 runtime wiring uses contextual fetch and render policies", async () => {
  const [app, api, html, css, meta] = await Promise.all([
    read("js/app.js"), read("js/api.js"), read("index.html"), read("css/styles.css"), read("app-meta.json").then(JSON.parse)
  ]);
  assert.deepEqual(meta, { version: "0.5.0", build: "005.2" });
  assert.match(html, /styles\.css\?v=050b0052/);
  assert.match(html, /app\.js\?v=050b0052/);
  assert.match(app, /gameday-standings-columns/);
  assert.match(app, /gameday-standings-columns-balanced/);
  assert.match(app, /elimination\?\.state === "notEliminated"\) return "—"/);
  assert.match(api, /hydrate:\s*"lineups,weather,venue,team,probablePitcher"/);
  assert.match(app, /fetchTypes\(\["regularSeason", "wildCardWithLeaders"\]\)/);
  assert.match(app, /findRegularSeasonEndDate\(game, season, cutoffDate\)/);
  assert.match(api, /fetchTeamSeasonSchedule/);
  assert.match(app, /fetchTypes\(\["firstHalf", "secondHalf"\]\)/);
  assert.match(app, /competitionContextForModel\(model\)/);
  assert.match(app, /advancedTeamPresentation\(presentationTeam, presentationContext, side, selectedScope\)/);
  assert.match(app, /postseasonSeriesPresentation\(context\.family === "postseason" \? \(state\.normalizedPregame \|\| model\) : model\)/);
  assert.match(app, /class="gameday-series-meta">\$\{\[series\.gameLabel, series\.formatLabel\][\s\S]*join\(", "\)/);
  assert.doesNotMatch(app, /seriesCard\.dataset\.gamedayMinLevel/);
  assert.match(app, /scope\?\.standingsType === "wildCardWithLeaders"/);
  assert.match(css, /v0\.5 Build 002\.2/);
});
