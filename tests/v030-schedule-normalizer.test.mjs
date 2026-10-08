import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { ContractRuntimeError, findEffectiveLineage, validateNormalizedSnapshot } from "../js/v030-contract.js";
import { normalizeScheduleSnapshot, selectScheduleView } from "../js/v030-schedule-normalizer.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(here);

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(workspace, relativePath), "utf8"));
}

function execution(overrides = {}) {
  return {
    requestedAtUtc: "2026-10-07T19:00:00.000Z",
    retrievedAtUtc: "2026-10-07T19:00:00.100Z",
    createdAtUtc: "2026-10-07T19:00:00.200Z",
    responseStatus: 200,
    bodySha256: null,
    snapshotId: "schedule-contract-snapshot",
    applicationVersion: "0.3.0-design",
    build: "004.3",
    fixtureKind: "synthetic-contract",
    ...overrides
  };
}

function player(id, name, position = ["CF", "Center Fielder", "Outfielder", "8"]) {
  return {
    id,
    fullName: name,
    primaryNumber: String(id % 90),
    batSide: { code: id % 2 ? "R" : "L" },
    pitchHand: { code: "R" },
    primaryPosition: { abbreviation: position[0], name: position[1], type: position[2], code: position[3] }
  };
}

function team(id, name, abbreviation) {
  return {
    id,
    name,
    abbreviation,
    teamName: name.split(" ").at(-1),
    clubName: name.split(" ").at(-1),
    locationName: name.split(" ").slice(0, -1).join(" "),
    shortName: name,
    sport: { id: 1, name: "Major League Baseball" },
    league: { id: id === 145 ? 103 : 104, name: id === 145 ? "American League" : "National League" },
    division: { id: id === 145 ? 202 : 205, name: "Contract Division" }
  };
}

function rawGame(overrides = {}) {
  const awayPlayers = Array.from({ length: 9 }, (_, index) => player(610000 + index, `Away Player ${index + 1}`));
  const homePlayers = Array.from({ length: 9 }, (_, index) => player(620000 + index, `Home Player ${index + 1}`, ["SS", "Shortstop", "Infielder", "6"]));
  return {
    gamePk: 800101,
    gameType: "R",
    season: "2025",
    gameDate: "2025-07-03T23:10:00Z",
    officialDate: "2025-07-03",
    dayNight: "night",
    gameNumber: 1,
    status: {
      abstractGameState: "Preview",
      codedGameState: "P",
      detailedState: "Pre-Game",
      statusCode: "P",
      startTimeTBD: false,
      abstractGameCode: "P"
    },
    teams: {
      away: { team: team(145, "Chicago White Sox", "CWS"), leagueRecord: { wins: 42, losses: 43, ties: 0, pct: ".494" }, probablePitcher: player(630001, "Away Probable", ["P", "Pitcher", "Pitcher", "1"]) },
      home: { team: team(138, "St. Louis Cardinals", "STL"), leagueRecord: { wins: 45, losses: 40, ties: 0, pct: ".529" }, probablePitcher: player(630002, "Home Probable", ["P", "Pitcher", "Pitcher", "1"]) }
    },
    lineups: { awayPlayers, homePlayers },
    venue: { id: 4, name: "Contract Park", location: { city: "Ignored Extended City" } },
    weather: { temp: 78, condition: "Partly Cloudy", wind: "8 mph, Out To RF" },
    ...overrides
  };
}

function payloadFor(game, bucketDate = game.officialDate) {
  return { dates: [{ date: bucketDate, games: [game] }] };
}

function selection(gamePk = "800101", selectedDate = "2025-07-03", overrides = {}) {
  return { gamePk, sportId: 1, selectedDate, ...overrides };
}

function payloadFromFullGameEvidence(evidence) {
  const dates = [];
  for (const [pointer, record] of Object.entries(evidence.selection.values)) {
    const dateMatch = pointer.match(/^\/dates\/(\d+)\/date$/);
    if (dateMatch) {
      const index = Number(dateMatch[1]);
      dates[index] ??= { date: null, games: [] };
      dates[index].date = record.value;
    }
    const gameMatch = pointer.match(/^\/dates\/(\d+)\/games\/(\d+)$/);
    if (gameMatch) {
      const dateIndex = Number(gameMatch[1]);
      const gameIndex = Number(gameMatch[2]);
      dates[dateIndex] ??= { date: null, games: [] };
      dates[dateIndex].games[gameIndex] = record.value;
    }
  }
  return { dates };
}

test("Build 004.3 selects one deterministic Schedule view from multi-view responses", async () => {
  const evidence = await readJson("tests/fixtures/api-discovery/disc-004-777458-schedule-dh-rescheduled-view.json");
  const payload = payloadFromFullGameEvidence(evidence);
  const original = selectScheduleView(payload, selection("777458", "2025-06-18"));
  const rescheduled = selectScheduleView(payload, selection("777458", "2025-06-19"));
  assert.equal(original.game.status.detailedState, "Postponed");
  assert.equal(original.selectedViewKey, "777458:2025-06-18:1");
  assert.equal(rescheduled.game.status.detailedState, "Final");
  assert.equal(rescheduled.selectedViewKey, "777458:2025-06-19:2");
  assert.notEqual(original.selectedViewKey, rescheduled.selectedViewKey);

  assert.throws(() => selectScheduleView(payload, selection("999999", "2025-06-19")), (error) => error.code === "MATCHING_VIEW_MISSING");
  assert.throws(() => selectScheduleView(payload, selection("777458", "2025-06-20")), (error) => error.code === "MATCHING_VIEW_MISSING");
  const ambiguous = { dates: [{ date: "2025-07-03", games: [rawGame(), rawGame()] }] };
  assert.throws(() => selectScheduleView(ambiguous, selection()), (error) => error?.code === "SELECTION_AMBIGUOUS");
});

test("stored ordinary and missing-lineup contract outputs are reproducible", async () => {
  const source = await readJson("tests/fixtures/model-contract/v030-schedule-source-cases.json");
  for (const item of source.cases) {
    const expected = await readJson(`tests/fixtures/model-contract/v030-schedule-${item.name}-normalized.json`);
    assert.deepEqual(normalizeScheduleSnapshot(item.payload, item.selection, item.execution), expected, item.name);
  }
});

test("ordinary Schedule data produces a complete schema-v2 skeleton with provenance", () => {
  const snapshot = normalizeScheduleSnapshot(payloadFor(rawGame()), selection(), execution());
  assert.equal(snapshot.schemaVersion, 2);
  assert.equal(snapshot.context.selectedViewKey, "800101:2025-07-03:1");
  assert.equal(snapshot.context.competitionSegment, "regular");
  assert.equal(snapshot.game.status.canonical, "pregame");
  assert.equal(snapshot.game.dates.scheduledStart, "2025-07-03T23:10:00Z");
  assert.equal(snapshot.away.lineup.state, "posted");
  assert.equal(snapshot.away.lineup.slots.length, 9);
  assert.deepEqual(snapshot.away.lineup.slots.map((slot) => slot.battingOrder), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(snapshot.away.startingPitcher.player.name, "Away Probable");
  assert.deepEqual(snapshot.away.startingPitcher.stats, {});
  assert.deepEqual(snapshot.away.bench, []);
  assert.deepEqual(snapshot.away.bullpen, []);
  assert.equal(snapshot.away.team.record.gamesPlayed, 85);
  assert.equal(snapshot.game.weather.temperature, 78);
  assert.deepEqual(snapshot.game.venue.location, { city: null, state: null, country: null }, "Schedule owns venue identity, not extended venue detail");

  const source = snapshot.meta.sourceResults[0];
  assert.equal(source.adapter, "schedule");
  assert.match(source.request.key, /^schedule\|v1\|gamePk=800101/);
  assert.equal(source.scope.selectedViewKey, snapshot.context.selectedViewKey);
  assert.equal(findEffectiveLineage(snapshot.meta.lineage, "/away/lineup/slots/0/player/name").selectedSourceResultRef, source.id);
  assert.equal(findEffectiveLineage(snapshot.meta.lineage, "/away/lineup/slots/0/stats").state, "not-requested");
  assert.equal(findEffectiveLineage(snapshot.meta.lineage, "/away/bullpen").state, "not-requested");
  assert.equal(findEffectiveLineage(snapshot.meta.lineage, "/game/venue/location/city").state, "not-requested");
  assert.equal(validateNormalizedSnapshot(snapshot).valid, true);
});

test("missing and explicitly empty lineups remain distinct and are never roster-derived", () => {
  const absentGame = rawGame();
  delete absentGame.lineups;
  const absent = normalizeScheduleSnapshot(payloadFor(absentGame), selection(), execution({ snapshotId: "missing-lineup" }));
  assert.equal(absent.away.lineup.state, "notPosted");
  assert.deepEqual(absent.away.lineup.slots, []);
  assert.equal(findEffectiveLineage(absent.meta.lineage, "/away/lineup").state, "unposted");

  const empty = normalizeScheduleSnapshot(
    payloadFor(rawGame({ lineups: { awayPlayers: [], homePlayers: [] } })),
    selection(),
    execution({ snapshotId: "empty-lineup" })
  );
  assert.equal(empty.away.lineup.state, "notPosted");
  assert.equal(findEffectiveLineage(empty.meta.lineage, "/away/lineup").state, "present-empty");
  assert.deepEqual(empty.away.bench, []);
  assert.deepEqual(empty.away.defense, {});
});

test("active TBD placeholders suppress display time and preserve unsettled teams", () => {
  const away = team(5525, "NL Lower Seed", "NL Low");
  const home = team(5517, "NL Higher Seed", "NL High");
  away.placeholder = true;
  home.placeholder = true;
  const game = rawGame({
    gamePk: 849809,
    gameType: "W",
    gameDate: "2026-10-11T07:33:00Z",
    officialDate: "2026-10-11",
    season: "2026",
    status: { abstractGameState: "Preview", codedGameState: "S", detailedState: "Scheduled", statusCode: "S", startTimeTBD: true, abstractGameCode: "P" },
    teams: { away: { team: away, probablePitcher: null }, home: { team: home, probablePitcher: null } }
  });
  delete game.lineups;
  const snapshot = normalizeScheduleSnapshot(payloadFor(game), selection("849809", "2026-10-11"), execution({ snapshotId: "tbd" }));
  assert.equal(snapshot.context.competitionSegment, "worldSeries");
  assert.equal(snapshot.game.status.canonical, "scheduled");
  assert.equal(snapshot.game.status.startTimeTBD, true);
  assert.equal(snapshot.game.status.teamsTBD, true);
  assert.equal(snapshot.game.dates.scheduledStart, null);
  assert.equal(snapshot.game.dates.originalScheduledStart, "2026-10-11T07:33:00Z", "raw placeholder remains auditable but is not displayable scheduledStart");
  assert.equal(findEffectiveLineage(snapshot.meta.lineage, "/away/startingPitcher").state, "omitted");
});

test("postponed, rescheduled, and historical-final views retain separate date semantics", async () => {
  const evidence = await readJson("tests/fixtures/api-discovery/disc-004-777458-schedule-dh-rescheduled-view.json");
  const payload = payloadFromFullGameEvidence(evidence);
  const postponed = normalizeScheduleSnapshot(payload, selection("777458", "2025-06-18"), execution({ snapshotId: "postponed" }));
  assert.equal(postponed.game.status.canonical, "postponed");
  assert.equal(postponed.game.status.reason, "Rain");
  assert.equal(postponed.game.dates.originalScheduledStart, "2025-06-18T23:40:00Z");
  assert.equal(postponed.game.dates.rescheduledStart, "2025-06-19T18:15:00Z");
  assert.equal(postponed.game.dates.rescheduledDate, "2025-06-19");
  assert.equal(postponed.game.dates.scheduledStart, "2025-06-19T18:15:00Z");

  const completed = normalizeScheduleSnapshot(payload, selection("777458", "2025-06-19"), execution({ snapshotId: "completed" }));
  assert.equal(completed.game.status.canonical, "final");
  assert.equal(completed.game.status.startTimeTBD, true);
  assert.equal(completed.game.dates.scheduledStart, "2025-06-19T18:15:00Z", "historical Final timestamp is retained despite stale TBD flag");
});

test("unknown and terminal status tuples are not collapsed by abstract state", () => {
  const cancelled = normalizeScheduleSnapshot(
    payloadFor(rawGame({ status: { abstractGameState: "Final", codedGameState: "C", detailedState: "Cancelled", statusCode: "CR", reason: "Rain", startTimeTBD: false, abstractGameCode: "F" } })),
    selection(), execution({ snapshotId: "cancelled" })
  );
  assert.equal(cancelled.game.status.canonical, "cancelled");
  assert.equal(cancelled.game.status.raw.abstractGameState, "Final");

  const unknown = normalizeScheduleSnapshot(
    payloadFor(rawGame({ status: { abstractGameState: "Mystery", codedGameState: "?", detailedState: "Administrative Review", statusCode: "ZZ", startTimeTBD: false, abstractGameCode: "?" } })),
    selection(), execution({ snapshotId: "unknown" })
  );
  assert.equal(unknown.game.status.canonical, "unknown");
  assert.equal(unknown.game.status.raw.detailedState, "Administrative Review");
});
