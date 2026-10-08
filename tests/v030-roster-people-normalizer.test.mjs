import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { normalizeScheduleSnapshot } from "../js/v030-schedule-normalizer.js";
import { normalizeRosterPeopleStaffSnapshot } from "../js/v030-roster-people-normalizer.js";

const root = resolve(import.meta.dirname, "..");
const fixtures = resolve(root, "tests/fixtures/model-contract");
const cases = JSON.parse(await readFile(resolve(fixtures, "v030-roster-people-source-cases.json"), "utf8"));
const timestamps = { requestedAtUtc: "2026-10-07T20:00:00.000Z", retrievedAtUtc: "2026-10-07T20:00:00.100Z" };

function normalize(testCase) {
  const schedule = normalizeScheduleSnapshot(testCase.schedule.payload, testCase.schedule.selection, { ...timestamps, createdAtUtc: timestamps.retrievedAtUtc, snapshotId: `schedule-${testCase.id}`, fixtureKind: "synthetic-contract" });
  return normalizeRosterPeopleStaffSnapshot(schedule, testCase.sources, { createdAtUtc: "2026-10-07T20:01:00.000Z", snapshotId: `build-004.4-${testCase.id}`, fixtureKind: "synthetic-contract" });
}

for (const testCase of cases) test(`reproduces ${testCase.id}`, async () => {
  const expected = JSON.parse(await readFile(resolve(fixtures, `v030-${testCase.id}-normalized.json`), "utf8"));
  assert.deepEqual(normalize(testCase), expected);
});

test("two-way role survives simultaneously in the lineup and selected starter", () => {
  const snapshot = normalize(cases[0]);
  assert.equal(snapshot.away.lineup.slots[0].player.id, 660271);
  assert.equal(snapshot.away.startingPitcher.player.id, 660271);
  assert.ok(snapshot.away.lineup.slots[0].stats.hitting);
  assert.ok(snapshot.away.startingPitcher.stats.pitching);
});

test("SP annotations split additional starters without admitting inactive depth-chart players", () => {
  const snapshot = normalize(cases[0]);
  assert.deepEqual(snapshot.away.additionalStarters.map((entry) => entry.player.id), [610031]);
  assert.deepEqual(snapshot.away.bullpen.map((entry) => entry.player.id), [610021]);
  assert.ok(!JSON.stringify(snapshot.away).includes("999999"));
});

test("absent MiLB annotations retain roster-minus-starter bullpen fallback", () => {
  const snapshot = normalize(cases[1]);
  assert.deepEqual(snapshot.away.additionalStarters, []);
  assert.deepEqual(snapshot.away.bullpen.map((entry) => entry.player.id), [700021, 700022]);
  const lineage = snapshot.meta.lineage.find((entry) => entry.target === "/away/bullpen" && entry.coverage === "exact");
  assert.equal(lineage.fallbackUsed, true);
});

test("ambiguous managers remain candidates and are never silently reduced to the first", () => {
  const snapshot = normalize(cases[0]);
  assert.equal(snapshot.away.manager.state, "ambiguous");
  assert.equal(snapshot.away.manager.selected, null);
  assert.equal(snapshot.away.manager.candidates.length, 2);
  assert.equal(snapshot.home.manager.state, "available");
});

test("partial People execution keeps successes and does not zero-fill failed players", () => {
  const snapshot = normalize(cases[0]);
  const people = snapshot.meta.sourceResults.find((entry) => entry.id === "people.partial");
  assert.equal(people.outcome, "partial");
  assert.ok(snapshot.away.bullpen[0].stats.pitching);
  assert.deepEqual(snapshot.away.additionalStarters[0].stats, {});
  const failed = snapshot.meta.lineage.find((entry) => entry.target === "/away/additionalStarters/0/stats");
  assert.equal(failed.state, "failed");
});

test("mismatched roster team/date scope fails before joining identities", () => {
  const testCase = structuredClone(cases[0]);
  testCase.sources.roster.away.input.teamId = 999;
  assert.throws(() => normalize(testCase), (error) => error.code === "IDENTITY_JOIN_FAILED");
});
