import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(here);
const normalizedFixturePaths = [
  "tests/fixtures/model-contract/v030-game2-mixed-cutoff.json",
  "tests/fixtures/model-contract/v030-ordinary-pregame.json",
  "tests/fixtures/model-contract/v030-missing-lineup.json",
  "tests/fixtures/model-contract/v030-two-way-roles.json",
  "tests/fixtures/model-contract/v030-manager-ambiguity.json",
  "tests/fixtures/model-contract/v030-variable-officials.json",
  "tests/fixtures/model-contract/v030-milb-capability-absence.json",
  "tests/fixtures/model-contract/v030-scoped-competition-stats.json",
  "tests/fixtures/model-contract/v030-schedule-ordinary-normalized.json",
  "tests/fixtures/model-contract/v030-schedule-missing-lineup-normalized.json",
  "tests/fixtures/model-contract/v030-mlb-two-way-manager-depth-partial-people-normalized.json",
  "tests/fixtures/model-contract/v030-milb-depth-absence-fallback-normalized.json",
  "tests/fixtures/model-contract/v030-variable-officials-feed-venue-normalized.json",
  "tests/fixtures/model-contract/v030-spring-scoped-standings-normalized.json",
  "tests/fixtures/model-contract/v030-game2-production-mixed-cutoff-normalized.json"
];

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(workspace, relativePath), "utf8"));
}

function getPointer(root, pointer) {
  if (pointer === "") return { found: true, value: root };
  if (!pointer.startsWith("/")) return { found: false, value: undefined };
  const tokens = pointer.slice(1).split("/").map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"));
  let value = root;
  for (const token of tokens) {
    if (value === null || value === undefined || !Object.prototype.hasOwnProperty.call(Object(value), token)) {
      return { found: false, value: undefined };
    }
    value = value[token];
  }
  return { found: true, value };
}

function effectiveLineage(lineage, target) {
  const exact = lineage.filter((entry) => entry.coverage === "exact" && entry.target === target);
  assert.ok(exact.length <= 1, `duplicate exact lineage for ${target}`);
  if (exact.length === 1) return exact[0];

  const ancestors = lineage
    .filter((entry) => entry.coverage === "subtree" && (target === entry.target || target.startsWith(`${entry.target}/`)))
    .sort((left, right) => right.target.length - left.target.length);
  if (!ancestors.length) return null;
  const mostSpecificLength = ancestors[0].target.length;
  assert.equal(ancestors.filter((entry) => entry.target.length === mostSpecificLength).length, 1, `ambiguous subtree lineage for ${target}`);
  return ancestors[0];
}

function collectStrings(value, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, output);
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) {
    output.push(key);
    collectStrings(item, output);
  }
  return output;
}

function valueMatchesType(value, type) {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return typeof value === "number" && Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === type;
}

function validateSchemaSubset(value, node, rootSchema, instancePath = "", errors = []) {
  if (node.$ref) {
    assert.ok(node.$ref.startsWith("#/"), `only local schema refs are supported: ${node.$ref}`);
    const resolved = getPointer(rootSchema, node.$ref.slice(1));
    assert.equal(resolved.found, true, `schema ref must resolve: ${node.$ref}`);
    return validateSchemaSubset(value, resolved.value, rootSchema, instancePath, errors);
  }
  if (node.anyOf) {
    const alternatives = node.anyOf.map((candidate) => validateSchemaSubset(value, candidate, rootSchema, instancePath, []));
    if (!alternatives.some((candidateErrors) => candidateErrors.length === 0)) errors.push(`${instancePath}: no anyOf branch matched`);
    return errors;
  }
  if (Object.prototype.hasOwnProperty.call(node, "const") && JSON.stringify(value) !== JSON.stringify(node.const)) errors.push(`${instancePath}: const mismatch`);
  if (node.enum && !node.enum.some((candidate) => JSON.stringify(candidate) === JSON.stringify(value))) errors.push(`${instancePath}: enum mismatch`);

  if (node.type) {
    const types = Array.isArray(node.type) ? node.type : [node.type];
    if (!types.some((type) => valueMatchesType(value, type))) {
      errors.push(`${instancePath}: expected ${types.join("|")}`);
      return errors;
    }
  }

  if (typeof value === "string") {
    if (node.minLength != null && value.length < node.minLength) errors.push(`${instancePath}: shorter than minLength`);
    if (node.pattern && !new RegExp(node.pattern).test(value)) errors.push(`${instancePath}: pattern mismatch`);
    if (node.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) errors.push(`${instancePath}: invalid date format`);
    if (node.format === "date-time" && Number.isNaN(Date.parse(value))) errors.push(`${instancePath}: invalid date-time format`);
    if (node.format === "uri") {
      try { new URL(value); } catch { errors.push(`${instancePath}: invalid URI format`); }
    }
  }
  if (typeof value === "number") {
    if (node.minimum != null && value < node.minimum) errors.push(`${instancePath}: below minimum`);
    if (node.maximum != null && value > node.maximum) errors.push(`${instancePath}: above maximum`);
  }
  if (Array.isArray(value)) {
    if (node.minItems != null && value.length < node.minItems) errors.push(`${instancePath}: fewer than minItems`);
    if (node.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${instancePath}: duplicate array values`);
    if (node.items) value.forEach((item, index) => validateSchemaSubset(item, node.items, rootSchema, `${instancePath}/${index}`, errors));
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const required of node.required || []) if (!Object.prototype.hasOwnProperty.call(value, required)) errors.push(`${instancePath}: missing ${required}`);
    const known = new Set(Object.keys(node.properties || {}));
    for (const [key, child] of Object.entries(value)) {
      if (node.properties?.[key]) validateSchemaSubset(child, node.properties[key], rootSchema, `${instancePath}/${key}`, errors);
      else if (node.additionalProperties === false) errors.push(`${instancePath}: unexpected ${key}`);
      else if (node.additionalProperties && typeof node.additionalProperties === "object") validateSchemaSubset(child, node.additionalProperties, rootSchema, `${instancePath}/${key}`, errors);
      else if (!known.has(key) && node.additionalProperties === undefined) continue;
    }
  }
  return errors;
}

test("Build 003.1 schema establishes the version-2 identifiers and vocabularies", async () => {
  const schema = await readJson("schemas/v030-normalized-game.schema.json");
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.properties.schemaId.const, "scorecard-studio.normalized-game");
  assert.equal(schema.properties.schemaVersion.const, 2);
  assert.match(schema.properties.contractRevision.pattern, /draft/);

  const adapters = schema.$defs.sourceResult.properties.adapter.enum;
  assert.deepEqual(adapters, ["schedule", "feed", "boxscore", "roster", "people", "coaches", "standings", "venue", "depthChart", "teamLogo"]);
  assert.equal(adapters.includes("gamePack"), false);

  const states = schema.$defs.lineage.properties.state.enum;
  assert.deepEqual(states, ["available", "unposted", "present-empty", "omitted", "not-requested", "unsupported", "not-applicable", "ambiguous", "partial", "failed", "stale"]);
  assert.ok(schema.$defs.side.required.includes("additionalStarters"));
  assert.ok(schema.$defs.side.required.includes("bullpen"));
  assert.equal(schema.$defs.lineage.properties.target.pattern.includes("meta"), true);
});

test("normalized schema-v2 snapshots conform to the machine-readable schema subset", async () => {
  const schema = await readJson("schemas/v030-normalized-game.schema.json");
  for (const fixturePath of normalizedFixturePaths) {
    const fixture = await readJson(fixturePath);
    const errors = validateSchemaSubset(fixture, schema, schema);
    assert.deepEqual(errors, [], fixturePath);
  }
});

test("Build 003.1 mixed-cutoff fixture has valid identity, scope, and unique registries", async () => {
  const fixture = await readJson("tests/fixtures/model-contract/v030-game2-mixed-cutoff.json");
  assert.equal(fixture.schemaId, "scorecard-studio.normalized-game");
  assert.equal(fixture.schemaVersion, 2);
  assert.equal(fixture.contractRevision, "0.3.0-draft.1");
  assert.equal(fixture.context.gamePk, "777458");
  assert.equal(fixture.context.sport.id, 1);
  assert.equal(fixture.context.gameType, "R");
  assert.equal(fixture.context.competitionSegment, "regular");
  assert.equal(fixture.context.selectedViewKey, "777458:2025-06-19:2");
  assert.equal(fixture.meta.snapshot.fixtureKind, "synthetic-contract");
  assert.match(fixture.meta.snapshot.createdAtUtc, /Z$/);

  const sourceIds = fixture.meta.sourceResults.map((entry) => entry.id);
  const lineageIds = fixture.meta.lineage.map((entry) => entry.id);
  assert.equal(new Set(sourceIds).size, sourceIds.length, "source result IDs must be unique");
  assert.equal(new Set(lineageIds).size, lineageIds.length, "lineage IDs must be unique");
  assert.equal(new Set(fixture.meta.lineage.map((entry) => `${entry.coverage}:${entry.target}`)).size, fixture.meta.lineage.length, "target/coverage pairs must be unique");
  assert.equal(collectStrings(fixture).some((value) => /gamePack/i.test(value)), false, "schema version 2 must not retain the overloaded gamePack label");
});

test("Build 003.1 lineage references are closed and available targets resolve", async () => {
  const fixture = await readJson("tests/fixtures/model-contract/v030-game2-mixed-cutoff.json");
  const sourceIds = new Set(fixture.meta.sourceResults.map((entry) => entry.id));
  const mustExistStates = new Set(["available", "partial", "present-empty"]);

  for (const entry of fixture.meta.lineage) {
    assert.match(entry.target, /^\/(?!meta(?:\/|$))/, entry.id);
    for (const ref of entry.sourceResultRefs) assert.ok(sourceIds.has(ref), `${entry.id}: unknown source ref ${ref}`);
    if (entry.selectedSourceResultRef !== null) {
      assert.ok(sourceIds.has(entry.selectedSourceResultRef), `${entry.id}: selected source ref must exist`);
      assert.ok(entry.sourceResultRefs.includes(entry.selectedSourceResultRef), `${entry.id}: selected source must be listed among candidates`);
    }
    for (const rejected of entry.rejectedCandidates) assert.ok(sourceIds.has(rejected.sourceResultRef), `${entry.id}: rejected source ref must exist`);
    if (mustExistStates.has(entry.state)) assert.equal(getPointer(fixture, entry.target).found, true, `${entry.id}: ${entry.state} target must exist`);
  }
});

test("Build 003.1 longest-prefix lineage resolves exact mixed-source overrides", async () => {
  const fixture = await readJson("tests/fixtures/model-contract/v030-game2-mixed-cutoff.json");
  const lineage = fixture.meta.lineage;

  assert.equal(effectiveLineage(lineage, "/game/status/canonical").selectedSourceResultRef, "schedule.game2");
  assert.equal(effectiveLineage(lineage, "/game/umpires/crew").state, "not-requested");
  assert.equal(effectiveLineage(lineage, "/away/team/name").selectedSourceResultRef, "schedule.game2");
  assert.equal(effectiveLineage(lineage, "/away/team/record/wins").selectedSourceResultRef, "boxscore.game1");
  assert.equal(effectiveLineage(lineage, "/away/team/standings/divisionRank/value").selectedSourceResultRef, "standings.prior-day");
  assert.equal(effectiveLineage(lineage, "/away/team/standings/streak").id, "lineage.away.streak");
  assert.equal(effectiveLineage(lineage, "/away/lineup/slots/0/stats/hitting/totals/avg").selectedSourceResultRef, "boxscore.game1");
  assert.equal(effectiveLineage(lineage, "/home/lineup/slots").state, "unposted");
});

test("Build 003.1 fixture demonstrates coexisting Game 2 effective cutoffs", async () => {
  const fixture = await readJson("tests/fixtures/model-contract/v030-game2-mixed-cutoff.json");
  const byId = new Map(fixture.meta.lineage.map((entry) => [entry.id, entry]));

  assert.equal(byId.get("lineage.away.record").effective.gamePk, "777447");
  assert.equal(byId.get("lineage.away.record").effective.canonicalGameState, "final");
  assert.equal(byId.get("lineage.away.standings").effective.cutoffDate, "2025-06-18");
  assert.equal(byId.get("lineage.away.player-stats").effective.gamePk, "777447");
  assert.deepEqual(byId.get("lineage.away.streak").sourceResultRefs.sort(), ["boxscore.game1", "schedule.game2", "standings.prior-day"]);
  assert.ok(byId.get("lineage.away.streak").derivationInputs.length >= 2);
  assert.notDeepEqual(byId.get("lineage.away.record").effective, byId.get("lineage.away.standings").effective);
});

test("Build 003.1 player statistics carry explicit competition scope", async () => {
  const fixture = await readJson("tests/fixtures/model-contract/v030-game2-mixed-cutoff.json");
  const hitting = fixture.away.lineup.slots[0].stats.hitting;
  assert.equal(hitting.scope.sportId, 1);
  assert.deepEqual(hitting.scope.gameTypes, ["R"]);
  assert.equal(hitting.scope.statType, "seasonStats");
  assert.equal(hitting.scope.aggregate.selection, "single-unambiguous");
  assert.equal(hitting.scope.endDate, "2025-06-19");
  assert.equal(fixture.home.lineup.state, "notPosted");
  assert.deepEqual(fixture.home.lineup.slots, []);
});
