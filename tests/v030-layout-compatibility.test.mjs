import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  loadCompatibleLayout,
  prepareCompatibleLayoutForExplicitSave,
  resolveLayoutBindings
} from "../js/v030-layout-compatibility.js";

let resolveV1Field;
for (const candidate of ["../js/field-registry.js", "../v030_build001_1_baseline/js/field-registry.js"]) {
  try {
    ({ resolveField: resolveV1Field } = await import(candidate));
    break;
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
  }
}
if (!resolveV1Field) throw new Error("legacy-compatible field registry not found");

const fixtureDir = resolve(import.meta.dirname, "fixtures/model-contract");
const readJson = async (name) => JSON.parse(await readFile(resolve(fixtureDir, name), "utf8"));
const snapshot = await readJson("v030-variable-officials-feed-venue-normalized.json");
const fixture = await readJson("v030-compatibility-layout-cases.json");

test("layout load is non-mutating, in-memory-only, and canonicalizes known aliases", () => {
  const original = structuredClone(fixture.layout);
  const loaded = loadCompatibleLayout(fixture.layout);
  assert.deepEqual(fixture.layout, original);
  assert.notEqual(loaded.layout, fixture.layout);
  assert.equal(loaded.requiresPersistentWrite, false);
  assert.equal(loaded.layout.mappings[0].field, "away.team.name");
  assert.equal(loaded.layout.individualMappings[0].field, "away.startingPitcher.player.name");
  assert.equal(loaded.aliasesCanonicalized.length, 2);
});

test("unknown IDs round-trip unchanged and produce one aggregate diagnostic per layout", () => {
  const loaded = loadCompatibleLayout(fixture.layout);
  assert.equal(loaded.layout.mappings[3].field, "extension.futureField");
  assert.equal(loaded.layout.mappings[4].field, "extension.futureField");
  assert.equal(loaded.layout.metadata.customPayload.field, "extension.preservedMetadataField");
  assert.equal(loaded.diagnostics.length, 1);
  assert.deepEqual(loaded.diagnostics[0].fieldIds, ["extension.futureField", "extension.preservedMetadataField"]);
  const saved = prepareCompatibleLayoutForExplicitSave(loaded.layout);
  assert.equal(saved.layout.mappings[3].field, "extension.futureField");
  assert.equal(saved.layout.metadata.customPayload.field, "extension.preservedMetadataField");
});

test("representative legacy layout bindings reproduce the committed fixture", () => {
  const resolved = resolveLayoutBindings(snapshot, fixture.layout);
  const actual = resolved.bindings.map(({ path, requestedFieldId, fieldId, supported, displayValue, resolution }) => ({
    path, requestedFieldId, fieldId, supported, displayValue, state: resolution.state, disposition: resolution.disposition
  }));
  assert.deepEqual(resolved.aliasesCanonicalized, fixture.expected.aliasesCanonicalized);
  assert.deepEqual(resolved.diagnostics, fixture.expected.diagnostics);
  assert.deepEqual(actual, fixture.expected.bindings);
});

test("representative saved-layout values match the v0.2.0 resolver", () => {
  const totals = snapshot.away.startingPitcher.stats.pitching.totals;
  const v1Model = {
    game: {
      date: snapshot.context.officialDate,
      umpires: { home: { name: "Home Plate Official" } }
    },
    away: {
      team: { name: snapshot.away.team.name },
      startingPitcher: {
        player: snapshot.away.startingPitcher.player,
        stats: { ...totals }
      },
      lineup: snapshot.away.lineup.slots,
      bullpen: [...snapshot.away.bullpen, ...snapshot.away.additionalStarters]
    }
  };
  const v2 = resolveLayoutBindings(snapshot, fixture.layout);
  for (const binding of v2.bindings) {
    const v1 = resolveV1Field(v1Model, binding.requestedFieldId, binding.selector);
    const v1Display = v1.state === "available" || v1.state === "partial" ? v1.value ?? "" : "";
    assert.equal(binding.displayValue, v1Display, binding.path);
  }
});

test("layout resolution renders unsupported and unavailable fields as blank", () => {
  const resolved = resolveLayoutBindings(snapshot, fixture.layout);
  const unknown = resolved.bindings.filter((entry) => !entry.supported);
  assert.ok(unknown.length >= 2);
  assert.ok(unknown.every((entry) => entry.displayValue === ""));
});
