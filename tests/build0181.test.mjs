import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCatalogFields, getFieldDescription, getFieldExampleValue, resolveField } from "../js/field-registry.js";
import { DESIGNER_SAMPLE_MODEL } from "../js/sample-data.js";
import { formatFieldValue } from "../js/formatter.js";

const catalog = getCatalogFields();
assert.ok(catalog.length > 0, "active field catalog is not empty");

for (const definition of catalog) {
  assert.ok(["standard", "custom"].includes(definition.visibilityTier), `${definition.id}: valid visibilityTier`);
  assert.ok(String(definition.description || "").trim(), `${definition.id}: description metadata`);
  assert.ok(!String(definition.description).startsWith("Scorecard field:"), `${definition.id}: description is field-specific`);
  assert.ok(String(definition.exampleValue ?? "").trim(), `${definition.id}: exampleValue metadata`);
  assert.equal(getFieldDescription(definition.id), definition.description, `${definition.id}: description helper`);
  assert.equal(getFieldExampleValue(definition.id), definition.exampleValue, `${definition.id}: example helper`);

  const selector = definition.cardinality === "repeated" ? { slot: 1 } : null;
  const resolution = resolveField(DESIGNER_SAMPLE_MODEL, definition.id, selector);
  assert.notEqual(resolution.state, "missing", `${definition.id}: representative sample data resolves`);
  assert.notEqual(resolution.state, "unsupported", `${definition.id}: representative sample data is supported`);
  const formatted = formatFieldValue(definition, resolution, DESIGNER_SAMPLE_MODEL, {});
  assert.ok(String(formatted ?? "").trim(), `${definition.id}: representative sample formats to visible text`);
}

// Representative values are intended to be recognizable examples, not blank placeholders.
assert.equal(resolveField(DESIGNER_SAMPLE_MODEL, "home.team.name").value, "Seattle Mariners");
assert.equal(resolveField(DESIGNER_SAMPLE_MODEL, "home.startingPitcher.stats.record").value, "14-7");
assert.equal(resolveField(DESIGNER_SAMPLE_MODEL, "home.lineup[].position.number", { slot: 1 }).value, 6);
assert.equal(resolveField(DESIGNER_SAMPLE_MODEL, "home.lineup[].stats.slashLine", { slot: 1 }).value, ".287/.352/.489");
assert.equal(resolveField(DESIGNER_SAMPLE_MODEL, "home.bullpen[].stats.record", { slot: 1 }).value, "4-2");
assert.equal(resolveField(DESIGNER_SAMPLE_MODEL, "game.umpires.crew[].role", { slot: 1 }).value, "Home Plate");

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
assert.match(html, /Build 018\.(?:1|2|3)/);
assert.match(app, /sample-data\.js\?v=018[123]/, "Designer imports the shared representative sample model");
assert.doesNotMatch(app, /const DESIGNER_SAMPLE_MODEL\s*=/, "sample model is no longer duplicated inline in app.js");

console.log(`Build 018.1 field-catalog metadata and representative-data tests passed for ${catalog.length} active fields.`);
