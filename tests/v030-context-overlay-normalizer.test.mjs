import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { normalizeContextOverlaySnapshot } from "../js/v030-context-overlay-normalizer.js";

const fixtureDir = resolve(import.meta.dirname, "fixtures/model-contract");
const cases = JSON.parse(await readFile(resolve(fixtureDir, "v030-context-overlay-source-cases.json"), "utf8"));
const byId = new Map(cases.map((entry) => [entry.id, entry]));

function normalize(testCase) {
  return normalizeContextOverlaySnapshot(testCase.baseSnapshot, testCase.sources, { createdAtUtc: "2026-10-07T21:01:00.000Z", snapshotId: `build-004.5-${testCase.id}`, fixtureKind: "synthetic-contract" });
}

for (const testCase of cases) test(`reproduces ${testCase.id}`, async () => {
  const expected = JSON.parse(await readFile(resolve(fixtureDir, `v030-${testCase.id}-normalized.json`), "utf8"));
  assert.deepEqual(normalize(testCase), expected);
});

test("Feed preserves a variable six-person crew in source order", () => {
  const snapshot = normalize(byId.get("variable-officials-feed-venue"));
  assert.equal(snapshot.game.umpires.crew.length, 6);
  assert.deepEqual(snapshot.game.umpires.crew.map((entry) => entry.role), ["Home Plate", "First Base", "Second Base", "Third Base", "Left Field", "Replay Official"]);
});

test("already-loaded Feed venue detail wins and records the equivalent narrow candidate", () => {
  const snapshot = normalize(byId.get("variable-officials-feed-venue"));
  assert.equal(snapshot.game.venue.location.city, "Feed City");
  assert.equal(snapshot.game.venue.fieldInfo.capacity, 42000);
  const lineage = snapshot.meta.lineage.find((entry) => entry.target === "/game/venue/location" && entry.coverage === "subtree");
  assert.equal(lineage.selectedSourceResultRef, "feed.officials-venue");
  assert.deepEqual(lineage.rejectedCandidates.map((entry) => entry.sourceResultRef), ["venue.narrow"]);
});

test("narrow Venue detail supplies fields when Feed has no usable venue object", () => {
  const snapshot = normalize(byId.get("game2-production-mixed-cutoff"));
  assert.equal(snapshot.game.venue.location.city, "Narrow City");
  assert.equal(snapshot.meta.lineage.find((entry) => entry.target === "/game/venue/timeZone" && entry.coverage === "subtree").selectedSourceResultRef, "venue.game2");
});

test("present-empty officials remain distinct from omitted or failed", () => {
  const snapshot = normalize(byId.get("game2-production-mixed-cutoff"));
  assert.deepEqual(snapshot.game.umpires.crew, []);
  assert.equal(snapshot.meta.lineage.find((entry) => entry.target === "/game/umpires/crew" && entry.coverage === "exact").state, "present-empty");
});

test("Feed weather fills a sparse Schedule weather projection", () => {
  const testCase = structuredClone(byId.get("variable-officials-feed-venue"));
  testCase.baseSnapshot.game.weather = { temperature: null, condition: null, wind: null };
  testCase.sources.feed.payload.gameData.weather = { temp: "72", condition: "Dome", wind: "0 mph, None" };
  const snapshot = normalize(testCase);
  assert.deepEqual(snapshot.game.weather, { temperature: 72, condition: "Dome", wind: "0 mph, None" });
  const weather = snapshot.meta.lineage.find((entry) => entry.target === "/game/weather" && entry.coverage === "subtree");
  assert.equal(weather.selectedSourceResultRef, "feed.officials-venue");
  assert.equal(weather.sourcePath, "/gameData/weather");
});

test("spring standings retain explicit competition scope and source groups", () => {
  const snapshot = normalize(byId.get("spring-scoped-standings"));
  assert.equal(snapshot.context.gameType, "S");
  assert.equal(snapshot.context.competitionSegment, "spring");
  assert.deepEqual(snapshot.meta.sourceResults.find((entry) => entry.id === "standings.spring").request.parameters.standingsType, "springTraining");
  assert.equal(snapshot.standings.groups[0].standingsType, "springTraining");
  assert.equal(snapshot.away.lineup.slots[0].stats.hitting.scope.gameTypes[0], "S");
});

test("standings tokens preserve raw values and do not coerce a leader dash to zero", () => {
  const snapshot = normalize(byId.get("variable-officials-feed-venue"));
  assert.deepEqual(snapshot.away.team.standings.wildCardGamesBack, { raw: "-", state: "leader", games: null });
  assert.equal(snapshot.standings.groups[0].rows[0].sourceOrder, 0);
  assert.equal(snapshot.standings.groups[0].rows[1].sourceOrder, 1);
});

test("standings preserve team performance and home-away records for Advanced cards", () => {
  const testCase = structuredClone(byId.get("variable-officials-feed-venue"));
  const row = testCase.sources.standings.payload.records[0].teamRecords[0];
  row.runsScored = 177;
  row.runsAllowed = 151;
  row.runDifferential = 26;
  row.records.splitRecords.push(
    { type: "home", wins: 12, losses: 6 },
    { type: "away", wins: 7, losses: 10 }
  );
  const snapshot = normalize(testCase);
  assert.equal(snapshot.away.team.standings.runsScored, 177);
  assert.equal(snapshot.away.team.standings.runsAllowed, 151);
  assert.equal(snapshot.away.team.standings.runDifferential, 26);
  assert.deepEqual(snapshot.away.team.standings.homeRecord, { wins: 12, losses: 6, display: "12-6" });
  assert.deepEqual(snapshot.away.team.standings.awayRecord, { wins: 7, losses: 10, display: "7-10" });
});

test("Wild Card groups use the API's Wild Card elimination number", () => {
  const testCase = structuredClone(byId.get("variable-officials-feed-venue"));
  const wildCardSource = structuredClone(testCase.sources.standings);
  wildCardSource.input.standingsType = "wildCard";
  wildCardSource.execution.sourceResultId = "standings.wild-card";
  wildCardSource.payload.records[0].standingsType = "wildCard";
  wildCardSource.payload.records[0].division = { id: null, name: null };
  wildCardSource.payload.records[0].teamRecords[0].eliminationNumber = "E";
  wildCardSource.payload.records[0].teamRecords[0].wildCardEliminationNumber = "-";
  wildCardSource.payload.records[0].teamRecords[1].eliminationNumber = "E";
  wildCardSource.payload.records[0].teamRecords[1].wildCardEliminationNumber = "2";
  testCase.sources.standings = [testCase.sources.standings, wildCardSource];

  const snapshot = normalize(testCase);
  const wildCardRows = snapshot.standings.groups.find((group) => group.standingsType === "wildCard").rows;
  assert.deepEqual(wildCardRows[0].elimination, { raw: "-", state: "notEliminated", value: null });
  assert.deepEqual(wildCardRows[1].elimination, { raw: "2", state: "remaining", value: 2 });
});

test("MiLB standings recover a missing group name from authoritative division records", () => {
  const testCase = structuredClone(byId.get("variable-officials-feed-venue"));
  const record = testCase.sources.standings.payload.records[0];
  record.division = { id: 209 };
  for (const row of record.teamRecords) row.records = { ...(row.records || {}), divisionRecords: [{ division: { id: 209, name: "Texas League" } }] };
  const snapshot = normalize(testCase);
  assert.deepEqual(snapshot.standings.groups[0].division, { id: 209, name: "Texas League" });
});

test("Game 2 keeps prior-day standings while selecting Game 1 records and player totals", () => {
  const snapshot = normalize(byId.get("game2-production-mixed-cutoff"));
  assert.deepEqual(snapshot.away.team.record, { gamesPlayed: 36, wins: 20, losses: 16, pct: 0.556 });
  assert.equal(snapshot.away.team.standings.divisionRank.value, 2);
  assert.equal(snapshot.away.team.standings.streak, "W3");
  assert.equal(snapshot.away.lineup.slots[0].stats.hitting.scope.statType, "seasonStats");
  assert.equal(snapshot.away.lineup.slots[0].stats.hitting.totals.homeRuns, 12);
  const record = snapshot.meta.lineage.find((entry) => entry.target === "/away/team/record" && entry.coverage === "exact");
  const standings = snapshot.meta.lineage.find((entry) => entry.target === "/away/team/standings" && entry.coverage === "exact");
  assert.equal(record.effective.gamePk, "800045");
  assert.equal(standings.effective.cutoffDate, "2025-07-02");
});

test("Game 2 overlay is rejected unless the related game is verified Final and same-day", () => {
  const testCase = structuredClone(byId.get("game2-production-mixed-cutoff"));
  testCase.sources.boxscore.earlierGame.canonicalStatus = "live";
  assert.throws(() => normalize(testCase), (error) => error.code === "IDENTITY_JOIN_FAILED");
});

test("standings scope mismatch fails before values are joined", () => {
  const testCase = structuredClone(byId.get("variable-officials-feed-venue"));
  testCase.sources.standings.input.sportId = 14;
  assert.throws(() => normalize(testCase), (error) => error.code === "IDENTITY_JOIN_FAILED");
});

