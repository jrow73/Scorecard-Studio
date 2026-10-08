import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { getPitcherDisplayRows, resolveCompatibilityField } from "../js/v030-compatibility-resolver.js";
import { normalizeV030Pregame, summarizeV030Availability, V030_RUNTIME_MODE } from "../js/v030-cutover.js";

const cases = JSON.parse(fs.readFileSync(new URL("./fixtures/model-contract/v030-roster-people-source-cases.json", import.meta.url), "utf8"));
const execution = { applicationVersion: "0.3.0", build: "004.8", createdAtUtc: "2025-07-03T20:00:00.000Z" };

test("Build 004.8 composes the three production normalizers into one validated schema-v2 snapshot", () => {
  const fixture = cases.find((entry) => entry.id === "mlb-two-way-manager-depth-partial-people");
  const snapshot = normalizeV030Pregame({
    schedulePayload: fixture.schedule.payload,
    scheduleSelection: fixture.schedule.selection,
    ...fixture.sources
  }, execution);

  assert.equal(V030_RUNTIME_MODE, "schema-v2");
  assert.equal(snapshot.schemaVersion, 2);
  assert.equal(snapshot.context.selectedViewKey, "800044:2025-07-03:1");
  assert.equal(snapshot.away.additionalStarters.length, 1);
  assert.equal(snapshot.away.bullpen.length, 1);
  assert.equal(resolveCompatibilityField(snapshot, "away.lineup[].player.name", { slot: 1 }).value, "Two-Way Contract Player");
});

test("additional starters are opt-in for the new display and remain in the legacy bullpen projection", () => {
  const fixture = cases[0];
  const snapshot = normalizeV030Pregame({ schedulePayload: fixture.schedule.payload, scheduleSelection: fixture.schedule.selection, ...fixture.sources }, execution);
  assert.equal(getPitcherDisplayRows(snapshot, "away").length, snapshot.away.bullpen.length);
  assert.equal(getPitcherDisplayRows(snapshot, "away", { includeAdditionalStarters: true }).length, snapshot.away.bullpen.length + snapshot.away.additionalStarters.length);
  assert.equal(resolveCompatibilityField(snapshot, "away.bullpen[].player.name", { slot: 2 }).state, "available");
});

test("availability summary exposes partial and failed source outcomes without zero filling", () => {
  const fixture = cases[0];
  const snapshot = normalizeV030Pregame({ schedulePayload: fixture.schedule.payload, scheduleSelection: fixture.schedule.selection, ...fixture.sources }, execution);
  const summary = summarizeV030Availability(snapshot);
  assert.equal(summary.schemaVersion, 2);
  assert.ok(summary.sourceOutcomes.partial >= 1);
  assert.ok(Object.keys(summary.lineageStates).length > 0);
});
