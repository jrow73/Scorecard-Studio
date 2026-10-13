import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { DESIGNER_SAMPLE_MODEL, LEGACY_DESIGNER_SAMPLE_MODEL } from "../js/sample-data.js";
import { validateNormalizedSnapshot } from "../js/v030-contract.js";
import {
  DESIGNER_HIDDEN_ACTIVE_FIELDS,
  FIELD_SURFACE_DISPOSITIONS,
  UNREGISTERED_VALUE_DISPOSITIONS,
  fieldSurfaceDisposition
} from "../js/v040-field-surfaces.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Build 001.6 uses a contract-valid schema-v2 representative and retains schema v1 explicitly", () => {
  assert.equal(DESIGNER_SAMPLE_MODEL.schemaVersion, 2);
  assert.equal(LEGACY_DESIGNER_SAMPLE_MODEL.schemaVersion, 1);
  assert.deepEqual(validateNormalizedSnapshot(DESIGNER_SAMPLE_MODEL), { valid: true, errors: [] });
  assert.equal(DESIGNER_SAMPLE_MODEL.meta.snapshot.producer.build, "001.6");
});

test("application bootstrap cache-busts the schema-v2 representative module", async () => {
  const app = await readFile(path.join(root, "js", "app.js"), "utf8");
  assert.match(app, /sample-data\.js\?v=040/);
});

test("representative collections exercise capacity, staff, officials, and source name variants", () => {
  assert.equal(DESIGNER_SAMPLE_MODEL.away.lineup.slots.length, 9);
  assert.equal(DESIGNER_SAMPLE_MODEL.home.lineup.slots.length, 9);
  assert.equal(DESIGNER_SAMPLE_MODEL.away.bench.length, 6);
  assert.equal(DESIGNER_SAMPLE_MODEL.home.bench.length, 6);
  assert.equal(DESIGNER_SAMPLE_MODEL.away.coaches.length, 4);
  assert.equal(DESIGNER_SAMPLE_MODEL.home.coaches.length, 4);
  assert.equal(DESIGNER_SAMPLE_MODEL.game.umpires.crew.length, 6);
  const person = DESIGNER_SAMPLE_MODEL.away.lineup.slots[0].player;
  for (const key of ["name", "firstName", "lastName", "useName", "useLastName", "boxscoreName"]) {
    assert.equal(typeof person[key], "string", `${key} should be source-representative text`);
    assert.notEqual(person[key], "");
  }
});

test("representative pitcher pools cover classified and authoritative fallback states", () => {
  assert.equal(DESIGNER_SAMPLE_MODEL.away.additionalStarters.length, 3);
  assert.equal(DESIGNER_SAMPLE_MODEL.away.bullpen.length, 11);
  assert.equal(DESIGNER_SAMPLE_MODEL.home.additionalStarters.length, 0);
  assert.equal(DESIGNER_SAMPLE_MODEL.home.bullpen.length, 14);
  const byId = new Map(DESIGNER_SAMPLE_MODEL.meta.lineage.map((entry) => [entry.id, entry]));
  assert.equal(byId.get("sample.away.additional").state, "available");
  assert.equal(byId.get("sample.home.additional").state, "omitted");
  assert.equal(byId.get("sample.home.bullpen").fallbackUsed, true);
  assert.equal(DESIGNER_SAMPLE_MODEL.meta.sourceResults.find((entry) => entry.id === "sample.depth.home").outcome, "failed");
});

test("typed standings exercise leader tokens and numeric ranks", () => {
  const standings = DESIGNER_SAMPLE_MODEL.home.team.standings;
  assert.equal(typeof standings.divisionRank.value, "number");
  assert.equal(standings.divisionGamesBack.raw, "-");
  assert.equal(standings.divisionGamesBack.state, "leader");
  assert.equal(standings.divisionGamesBack.games, null);
});

test("every registry field and meaningful unregistered family has an explicit disposition", () => {
  assert.equal(FIELD_SURFACE_DISPOSITIONS.length, 223);
  assert.equal(new Set(FIELD_SURFACE_DISPOSITIONS.map((entry) => entry.fieldId)).size, 223);
  assert.equal(UNREGISTERED_VALUE_DISPOSITIONS.length, 10);
  assert.equal(new Set(UNREGISTERED_VALUE_DISPOSITIONS.map((entry) => entry.family)).size, 10);
  for (const fieldId of DESIGNER_HIDDEN_ACTIVE_FIELDS) {
    const disposition = fieldSurfaceDisposition(fieldId);
    assert.equal(disposition.surfaces.gameDay, true);
    assert.equal(disposition.surfaces.designer, false);
    assert.equal(disposition.surfaces.legacyLayout, true);
  }
});
