import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { fetchFavoriteTeamScheduleBundle, fetchSportScheduleBundle } from "../js/api.js";
import { getCollectionRows } from "../js/field-registry.js";
import { loadCompatibleLayout } from "../js/v030-layout-compatibility.js";
import { pitcherGroupPresentation } from "../js/v040-gameday.js";
import { groupScheduleGames, probablePitcherMatchup, scheduleReadiness } from "../js/v040-home.js";
import { SUPPORTED_COMPETITION_LEVELS, normalizeFavoriteCompetition } from "../js/v040-settings.js";
import { DESIGNER_SAMPLE_MODEL } from "../js/sample-data.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("all supported favorite-team levels retain their competition context", () => {
  assert.deepEqual(SUPPORTED_COMPETITION_LEVELS.map((level) => level.sportId), [1, 11, 12, 13, 14]);
  for (const level of SUPPORTED_COMPETITION_LEVELS) {
    const favorite = normalizeFavoriteCompetition({ ...level, teamId: 1000 + level.sportId, teamName: `${level.label} Club` });
    assert.equal(favorite.levelKey, level.levelKey);
    assert.equal(favorite.sportId, level.sportId);
  }
});

test("favorite and level schedule requests remain date- and sport-scoped", async () => {
  const priorFetch = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(new URL(url));
    return { ok: true, json: async () => ({ dates: [] }) };
  };
  try {
    for (const level of SUPPORTED_COMPETITION_LEVELS) {
      assert.deepEqual(await fetchFavoriteTeamScheduleBundle("2026-06-01", 777, level.sportId), { games: [], payload: { dates: [] } });
    }
    assert.deepEqual(await fetchSportScheduleBundle("2026-06-02", 12), { games: [], payload: { dates: [] } });
  } finally {
    globalThis.fetch = priorFetch;
  }
  assert.equal(urls.length, 6);
  for (const [index, level] of SUPPORTED_COMPETITION_LEVELS.entries()) {
    assert.equal(urls[index].searchParams.get("sportId"), String(level.sportId));
    assert.equal(urls[index].searchParams.get("teamId"), "777");
    assert.equal(urls[index].searchParams.get("date"), "2026-06-01");
  }
  assert.equal(urls[5].searchParams.get("sportId"), "12");
  assert.equal(urls[5].searchParams.get("teamId"), null);
  assert.equal(urls[5].searchParams.get("date"), "2026-06-02");
});

test("same-date doubleheaders retain both game identities and stable order", async () => {
  const priorFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ dates: [{ games: [
    scheduleGame(9002, "2026-06-01T23:10:00Z", 2),
    scheduleGame(9001, "2026-06-01T18:10:00Z", 1)
  ] }] }) });
  try {
    const { games } = await fetchSportScheduleBundle("2026-06-01", 11);
    assert.deepEqual(games.map(({ gamePk, gameNumber, doubleHeader, sportId }) => ({ gamePk, gameNumber, doubleHeader, sportId })), [
      { gamePk: "9002", gameNumber: 2, doubleHeader: "Y", sportId: 11 },
      { gamePk: "9001", gameNumber: 1, doubleHeader: "Y", sportId: 11 }
    ]);
    assert.deepEqual(groupScheduleGames(games).flatMap((group) => group.games.map((game) => game.gamePk)), ["9001", "9002"]);
  } finally {
    globalThis.fetch = priorFetch;
  }
});

test("Home readiness and probable starters remain independent and truthful", () => {
  const cases = [
    [{ awayLineup: Array(9), homeLineup: Array(9), status: "Scheduled" }, "ready", true],
    [{ awayLineup: Array(9), homeLineup: [], status: "Scheduled" }, "partial", false],
    [{ awayLineup: [], homeLineup: [], status: "Scheduled" }, "waiting", false],
    [{ abstractGameState: "Final", status: "Final" }, "terminal", true],
    [{ status: "Postponed" }, "terminal", false],
    [{ status: "Cancelled" }, "terminal", false],
    [{ status: "Suspended" }, "terminal", false]
  ];
  for (const [game, key, complete] of cases) {
    const result = scheduleReadiness(game);
    assert.equal(result.key, key);
    assert.equal(result.lineupsComplete, complete);
  }
  assert.deepEqual(probablePitcherMatchup({ awayProbablePitcher: { fullName: "Known Starter" } }), { away: "Known Starter", home: "TBD" });
});

test("Game Day and Designer preserve classified and fallback pitcher truth", () => {
  const away = pitcherGroupPresentation(DESIGNER_SAMPLE_MODEL, "away");
  const home = pitcherGroupPresentation(DESIGNER_SAMPLE_MODEL, "home");
  assert.equal(away.classified, true);
  assert.equal(away.additionalStarters.length, 3);
  assert.equal(away.bullpen.length, 11);
  assert.equal(home.classified, false);
  assert.equal(home.additionalStarters.length, 0);
  assert.equal(home.bullpen.length, 14);
  assert.match(home.bullpenLabel, /roles not classified/i);

  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "away.bullpen", { pitcherGroup: "core" }).length, 11);
  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "away.bullpen", { pitcherGroup: "additional" }).length, 3);
  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "away.bullpen", { pitcherGroup: "combined" }).length, 14);
});

test("old layouts remain byte-semantically combined after Build 001 closure", async () => {
  const legacy = { id: "old-layout", schemaVersion: 7, repeatedBlocks: [{ id: "pen", collection: "away.bullpen", capacity: 12, columns: [] }] };
  const before = JSON.stringify(legacy);
  const loaded = loadCompatibleLayout(legacy);
  assert.equal(loaded.requiresPersistentWrite, false);
  assert.equal(Object.hasOwn(loaded.layout.repeatedBlocks[0], "pitcherGroup"), false);
  assert.equal(JSON.stringify(legacy), before);
  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "away.bullpen").length, 14);

  const [meta, html, app] = await Promise.all([
    readFile(path.join(root, "app-meta.json"), "utf8").then(JSON.parse),
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "js", "app.js"), "utf8")
  ]);
  assert.deepEqual(meta, { version: "0.4.0", build: "004.9" });
  assert.match(html, /v=040/);
  assert.match(app, /build:\s*"004\.9"/);
});

function scheduleGame(gamePk, gameDate, gameNumber) {
  return {
    gamePk,
    gameDate,
    officialDate: "2026-06-01",
    sport: { id: 11 },
    gameNumber,
    doubleHeader: "Y",
    status: { detailedState: "Scheduled", abstractGameState: "Preview", statusCode: "S" },
    teams: {
      away: { team: { id: 101, name: "Away Club", league: { id: 201, name: "International League" } } },
      home: { team: { id: 102, name: "Home Club", league: { id: 201, name: "International League" } } }
    },
    venue: { id: 301, name: "Test Park" },
    lineups: { awayPlayers: [], homePlayers: [] }
  };
}
