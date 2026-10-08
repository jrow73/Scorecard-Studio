import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  ADDITIONAL_STARTER_DISPLAY_DEFAULT,
  COMPATIBILITY_ALIASES,
  COMPATIBILITY_FIELDS,
  V030_COMPATIBILITY_DEFINITIONS,
  canonicalCompatibilityFieldId,
  compatibilityCapabilities,
  getLegacyBullpenRows,
  getPitcherDisplayRows,
  resolveCompatibilityField
} from "../js/v030-compatibility-resolver.js";

const fixtureDir = resolve(import.meta.dirname, "fixtures/model-contract");
const readJson = async (name) => JSON.parse(await readFile(resolve(fixtureDir, name), "utf8"));
const map = await readJson("v030-compatibility-map.json");
const snapshot = await readJson("v030-variable-officials-feed-venue-normalized.json");
const managerSnapshot = await readJson("v030-mlb-two-way-manager-depth-partial-people-normalized.json");

test("production compatibility declarations exactly reproduce the Build 003.3 machine map", () => {
  assert.equal(COMPATIBILITY_FIELDS.length, 223);
  assert.deepEqual(COMPATIBILITY_FIELDS, map.fields);
  assert.deepEqual(COMPATIBILITY_ALIASES, map.aliases);
  assert.ok(Object.isFrozen(V030_COMPATIBILITY_DEFINITIONS));
  assert.ok(Object.isFrozen(COMPATIBILITY_FIELDS[0].v2));
});

test("all 223 declared fields register and resolve as supported", () => {
  for (const definition of COMPATIBILITY_FIELDS) {
    const selector = definition.v1.cardinality === "repeated" ? { slot: 1 } : null;
    const resolved = resolveCompatibilityField(snapshot, definition.fieldId, selector);
    assert.equal(resolved.supported, true, definition.fieldId);
    assert.notEqual(resolved.state, "unsupported", definition.fieldId);
  }
});

test("capabilities replace legacy source names", () => {
  const capabilities = compatibilityCapabilities(COMPATIBILITY_FIELDS.map((entry) => entry.fieldId));
  assert.ok(capabilities.has("corePregame"));
  assert.equal([...capabilities].some((value) => /gamepack/i.test(value)), false);
});

test("direct, renamed, role-selected, repeated, and derived fields resolve", () => {
  assert.equal(resolveCompatibilityField(snapshot, "game.date").value, "2025-07-03");
  assert.equal(resolveCompatibilityField(snapshot, "away.teamName").value, "Away Club");
  assert.equal(resolveCompatibilityField(snapshot, "game.umpires.home.name").value, "Home Plate Official");
  assert.equal(resolveCompatibilityField(snapshot, "game.umpires.crew[].name", { role: "Left Field" }).value, "Left Field Official");
  assert.equal(resolveCompatibilityField(snapshot, "away.lineup[].player.name", { slot: 1 }).value, "Two-Way Contract Player");
  assert.equal(resolveCompatibilityField(snapshot, "away.startingPitcher.stats.record").value, "8-4");
});

test("aliases canonicalize without losing the requested identifier", () => {
  assert.equal(canonicalCompatibilityFieldId("away.startingPitcher.name"), "away.startingPitcher.player.name");
  const resolved = resolveCompatibilityField(snapshot, "away.startingPitcher.name");
  assert.equal(resolved.fieldId, "away.startingPitcher.player.name");
  assert.equal(resolved.requestedFieldId, "away.startingPitcher.name");
});

test("manager ambiguity remains blank and carries the most specific availability", () => {
  const resolved = resolveCompatibilityField(managerSnapshot, "away.manager.name");
  assert.equal(resolved.value, null);
  assert.equal(resolved.state, "ambiguous");
  assert.equal(resolved.lineage.id, "lineage.away.staff-manager");
});

test("legacy bullpen always unions core relievers and additional starters", () => {
  const before = structuredClone(snapshot.away);
  assert.deepEqual(getLegacyBullpenRows(snapshot, "away").map((row) => row.player.name), ["Away Reliever", "Away Additional Starter"]);
  const projected = resolveCompatibilityField(snapshot, "away.bullpen[].player.name", { slot: 2 });
  assert.equal(projected.value, "Away Additional Starter");
  assert.equal(projected.lineage.target, "/away/additionalStarters");
  assert.deepEqual(snapshot.away, before);
});

test("the new pitcher display preference is off by default and never changes legacy projection", () => {
  assert.equal(ADDITIONAL_STARTER_DISPLAY_DEFAULT, false);
  assert.deepEqual(getPitcherDisplayRows(snapshot, "away").map((row) => row.player.name), ["Away Reliever"]);
  assert.deepEqual(getPitcherDisplayRows(snapshot, "away", { includeAdditionalStarters: true }).map((row) => row.player.name), ["Away Reliever", "Away Additional Starter"]);
  assert.equal(resolveCompatibilityField(snapshot, "away.bullpen[].player.name", { slot: 2 }).value, "Away Additional Starter");
});

test("unknown fields remain unsupported and blank", () => {
  const resolved = resolveCompatibilityField(snapshot, "extension.futureField");
  assert.equal(resolved.supported, false);
  assert.equal(resolved.state, "unsupported");
  assert.equal(resolved.value, null);
});

