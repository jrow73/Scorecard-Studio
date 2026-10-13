import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getCollectionRows, resolveField } from "../js/field-registry.js";
import { loadCompatibleLayout, prepareCompatibleLayoutForExplicitSave } from "../js/v030-layout-compatibility.js";
import { DESIGNER_SAMPLE_MODEL } from "../js/sample-data.js";
import {
  PITCHER_GROUP_MODES,
  normalizePitcherGroup,
  pitcherGroupRows
} from "../js/v040-pitcher-groups.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("missing pitcher-group mode remains the historical combined projection", () => {
  assert.equal(normalizePitcherGroup(undefined), PITCHER_GROUP_MODES.COMBINED);
  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "away.bullpen").length, 14);
  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "away.bullpen", { pitcherGroup: "combined" }).length, 14);
  assert.equal(pitcherGroupRows(DESIGNER_SAMPLE_MODEL, "away.bullpen", "not-a-mode").length, 14);
});

test("core and additional modes select distinct schema-v2 pitcher groups", () => {
  const core = getCollectionRows(DESIGNER_SAMPLE_MODEL, "away.bullpen", { pitcherGroup: "core" });
  const additional = getCollectionRows(DESIGNER_SAMPLE_MODEL, "away.bullpen", { pitcherGroup: "additional" });
  assert.equal(core.length, 11);
  assert.equal(additional.length, 3);
  assert.equal(resolveField(DESIGNER_SAMPLE_MODEL, "away.bullpen[].player.name", { slot: 1, pitcherGroup: "core" }).value, core[0].player.name);
  assert.equal(resolveField(DESIGNER_SAMPLE_MODEL, "away.bullpen[].player.name", { slot: 1, pitcherGroup: "additional" }).value, additional[0].player.name);
  assert.notEqual(core[0].player.id, additional[0].player.id);
});

test("fallback teams keep core authoritative and additional starters honestly empty", () => {
  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "home.bullpen", { pitcherGroup: "core" }).length, 14);
  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "home.bullpen", { pitcherGroup: "combined" }).length, 14);
  assert.equal(getCollectionRows(DESIGNER_SAMPLE_MODEL, "home.bullpen", { pitcherGroup: "additional" }).length, 0);
  const resolution = resolveField(DESIGNER_SAMPLE_MODEL, "home.bullpen[].player.name", { slot: 1, pitcherGroup: "additional" });
  assert.equal(resolution.value, null);
  assert.equal(resolution.state, "omitted");
});

test("layout compatibility preserves both missing and explicit per-block choices without load writes", () => {
  const legacy = { id: "legacy", schemaVersion: 7, repeatedBlocks: [{ id: "b1", collection: "away.bullpen", capacity: 10, columns: [] }] };
  const loadedLegacy = loadCompatibleLayout(legacy);
  assert.equal(loadedLegacy.requiresPersistentWrite, false);
  assert.equal(Object.hasOwn(loadedLegacy.layout.repeatedBlocks[0], "pitcherGroup"), false);
  assert.equal(Object.hasOwn(legacy.repeatedBlocks[0], "pitcherGroup"), false);

  const current = { id: "current", schemaVersion: 8, repeatedBlocks: [{ id: "b2", collection: "home.bullpen", pitcherGroup: "additional", capacity: 4, columns: [] }] };
  assert.equal(loadCompatibleLayout(current).layout.repeatedBlocks[0].pitcherGroup, "additional");
  assert.equal(prepareCompatibleLayoutForExplicitSave(current).layout.repeatedBlocks[0].pitcherGroup, "additional");
});

test("Designer exposes and stores per-block choices across every repeated rendering path", async () => {
  const [html, app] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "js", "app.js"), "utf8")
  ]);
  assert.match(html, /id="designer-pitcher-group"/);
  for (const value of ["core", "combined", "additional"]) assert.match(html, new RegExp(`<option value="${value}">`));
  assert.match(app, /pitcherGroup:\s*normalizePitcherGroup/);
  assert.match(app, /layout\.schemaVersion\s*=\s*Math\.max\([^\n]+8/);
  assert.match(app, /getCollectionRows\(model, block\?\.collection, pitcherGroup \? \{ pitcherGroup \} : \{\}\)/);
  assert.match(app, /resolveField\(model, fieldId, \{ slot, \.\.\.\(pitcherGroup \? \{ pitcherGroup \} : \{\}\) \}\)/);
  assert.match(app, /collectionHasOverflow\(model, block\.collection, block\.capacity, pitcherGroupOptions\)/);
  assert.match(app, /conditionalFormattingGroup\(model, blockContext\(block\), selector\)/);
  assert.match(app, /resolveSlotContent\(content, model, blockContext\(block\), selector\)/);
});
