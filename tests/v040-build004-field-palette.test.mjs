import assert from "node:assert/strict";
import test from "node:test";

import { getCatalogFields } from "../js/field-registry.js";
import {
  buildHomeAwayFieldPairs,
  fieldPairCoverage,
  restoreStandardFieldSelection,
  updateMirroredFieldSelection
} from "../js/v040-field-palette.js";

const legacyUmpirePrefixes = [
  "game.umpires.home.",
  "game.umpires.first.",
  "game.umpires.second.",
  "game.umpires.third."
];

const designerDefinitions = getCatalogFields().filter((definition) =>
  !legacyUmpirePrefixes.some((prefix) => definition.id.startsWith(prefix))
);

test("Build 004.5 verifies every active Away/Home field counterpart from the registry", () => {
  const pairs = buildHomeAwayFieldPairs(designerDefinitions);
  const coverage = fieldPairCoverage(designerDefinitions, pairs);

  assert.deepEqual(coverage, {
    total: 167,
    away: 75,
    home: 75,
    pairedAway: 75,
    pairedHome: 75,
    unpaired: []
  });
  assert.equal(Object.keys(pairs).length, 150);
  for (const [fieldId, counterpartId] of Object.entries(pairs)) {
    assert.equal(pairs[counterpartId], fieldId, `${fieldId} must have a reciprocal counterpart`);
  }
});

test("mirrored selection is symmetric and remains optional", () => {
  const pairs = buildHomeAwayFieldPairs(designerDefinitions);
  const away = "away.team.name";
  const home = "home.team.name";

  const mirroredOn = updateMirroredFieldSelection(new Set(), away, true, pairs, true);
  assert.deepEqual([...mirroredOn].sort(), [away, home]);

  const mirroredOff = updateMirroredFieldSelection(mirroredOn, away, false, pairs, true);
  assert.deepEqual([...mirroredOff], []);

  const independent = updateMirroredFieldSelection(new Set(), away, true, pairs, false);
  assert.deepEqual([...independent], [away]);
});

test("category standard restore changes only fields owned by that category", () => {
  const selected = new Set(["game.date", "game.dayNight", "away.team.name"]);
  const restored = restoreStandardFieldSelection(
    selected,
    ["game.date", "game.dayNight", "game.startTime"],
    ["game.date", "game.startTime"]
  );

  assert.deepEqual([...restored].sort(), ["away.team.name", "game.date", "game.startTime"]);
  assert.deepEqual([...selected].sort(), ["away.team.name", "game.date", "game.dayNight"]);
});

