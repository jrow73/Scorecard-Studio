import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(here);

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(workspace, relativePath), "utf8"));
}

function adapterById(registry, id) {
  const adapter = registry.adapters.find((entry) => entry.id === id);
  assert.ok(adapter, `missing adapter ${id}`);
  return adapter;
}

function canonicalScalar(value) {
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function materializeInput(adapter, supplied) {
  const output = {};
  for (const field of [...adapter.inputFields].sort((left, right) => left.keyOrder - right.keyOrder)) {
    let value = supplied[field.name];
    if (value === undefined && Object.prototype.hasOwnProperty.call(field, "default")) value = field.default;
    if (value === undefined) {
      if (field.required) throw new Error(`missing ${field.name}`);
      continue;
    }
    if (field.type === "stringSet" || field.type === "integerSet") {
      const unique = [...new Set(value)];
      unique.sort(field.type === "integerSet" ? ((a, b) => Number(a) - Number(b)) : ((a, b) => String(a).localeCompare(String(b))));
      value = unique;
    }
    output[field.name] = value;
  }
  return output;
}

function requestKey(adapter, supplied) {
  const input = materializeInput(adapter, supplied);
  const fields = [...adapter.inputFields].sort((left, right) => left.keyOrder - right.keyOrder);
  const parts = [adapter.id, "v1"];
  for (const field of fields) {
    if (!adapter.keyFields.includes(field.name) || input[field.name] === undefined) continue;
    const value = Array.isArray(input[field.name]) ? input[field.name].map(canonicalScalar).join(",") : canonicalScalar(input[field.name]);
    parts.push(`${field.name}=${encodeURIComponent(value)}`);
  }
  return parts.join("|");
}

function capabilitySpecificity(match) {
  if (match.default) return -1;
  return Object.entries(match).reduce((score, [key, value]) => score + (key === "default" ? 0 : (Array.isArray(value) ? 1 : 1)), 0);
}

function capability(adapter, context) {
  const matches = adapter.capabilityRules.filter((rule) => {
    if (rule.match.default) return true;
    if (rule.match.sportIds && !rule.match.sportIds.includes(context.sportId)) return false;
    if (rule.match.gameTypes && !rule.match.gameTypes.includes(context.gameType)) return false;
    if (rule.match.competitionSegments && !rule.match.competitionSegments.includes(context.competitionSegment)) return false;
    if (rule.match.concepts && !rule.match.concepts.includes(context.concept)) return false;
    return true;
  }).sort((left, right) => capabilitySpecificity(right.match) - capabilitySpecificity(left.match));
  assert.ok(matches.length, `${adapter.id}: a default capability rule is required`);
  const topScore = capabilitySpecificity(matches[0].match);
  assert.equal(matches.filter((rule) => capabilitySpecificity(rule.match) === topScore).length, 1, `${adapter.id}: equal-specificity capability conflict`);
  return matches[0];
}

function partitionPeople(ids, chunkSize) {
  const sorted = [...new Set(ids.map(Number))].sort((a, b) => a - b);
  const chunks = [];
  for (let index = 0; index < sorted.length; index += chunkSize) chunks.push(sorted.slice(index, index + chunkSize));
  return chunks;
}

function mergePeopleUnits(units) {
  const successes = units.filter((unit) => unit.outcome === "success");
  const failures = units.filter((unit) => unit.outcome === "failed");
  return {
    outcome: successes.length && failures.length ? "partial" : failures.length ? "failed" : "success",
    candidates: successes.flatMap((unit) => unit.candidates),
    failedPeople: failures.flatMap((unit) => unit.personIds).map((personId) => ({ personId, state: "failed" }))
  };
}

test("Build 003.2 registry declares the exact normalized-model adapter set", async () => {
  const [registry, registrySchema, modelSchema] = await Promise.all([
    readJson("tests/fixtures/model-contract/v030-adapter-registry.json"),
    readJson("schemas/v030-adapter-registry.schema.json"),
    readJson("schemas/v030-normalized-game.schema.json")
  ]);
  const expected = ["schedule", "feed", "boxscore", "roster", "people", "coaches", "standings", "venue", "depthChart", "teamLogo"];
  const ids = registry.adapters.map((entry) => entry.id);
  assert.equal(registry.schemaId, registrySchema.properties.schemaId.const);
  assert.equal(registry.schemaVersion, registrySchema.properties.schemaVersion.const);
  assert.equal(registry.contractRevision, registrySchema.properties.contractRevision.const);
  assert.equal(registry.adapters.length, registrySchema.properties.adapters.minItems);
  assert.equal(registry.adapters.length, registrySchema.properties.adapters.maxItems);
  assert.deepEqual(ids, expected);
  assert.equal(new Set(ids).size, 10);
  assert.deepEqual(ids, registrySchema.$defs.adapterId.enum);
  assert.deepEqual(ids, modelSchema.$defs.sourceResult.properties.adapter.enum);
  assert.equal(JSON.stringify(registry).includes("gamePack"), false);
  assert.deepEqual(registry.availabilityStates, registrySchema.$defs.availabilityState.enum);
  assert.deepEqual(registry.availabilityStates, modelSchema.$defs.lineage.properties.state.enum);
});

test("Build 003.2 every adapter has closed key, capability, freshness, and failure contracts", async () => {
  const registry = await readJson("tests/fixtures/model-contract/v030-adapter-registry.json");
  for (const adapter of registry.adapters) {
    const names = adapter.inputFields.map((field) => field.name);
    assert.equal(new Set(names).size, names.length, `${adapter.id}: input names must be unique`);
    assert.equal(new Set(adapter.inputFields.map((field) => field.keyOrder)).size, names.length, `${adapter.id}: key order must be unique`);
    assert.ok(adapter.inputFields.every((field) => adapter.keyFields.includes(field.name)), `${adapter.id}: every semantic input must participate in the request key`);
    assert.ok(adapter.keyFields.every((name) => names.includes(name)), `${adapter.id}: key field must name an input`);
    assert.equal(adapter.capabilityRules.at(-1).match.default, true, `${adapter.id}: final capability rule must be default`);
    assert.equal(adapter.capabilityRules.at(-1).state, "untested", `${adapter.id}: default must not claim support`);
    assert.equal(adapter.freshness.cacheFailureAsEmpty, false, `${adapter.id}: failures must not become successful empty cache entries`);
    assert.equal(adapter.partialPolicy.zeroFillFailedUnits, false, `${adapter.id}: failed units must never become zero values`);
    assert.ok(adapter.errorCodes.includes("INPUT_INVALID"));
    assert.ok(adapter.outputConcepts.length > 0);
  }
});

test("Build 003.2 semantic request keys are deterministic and scope-complete", async () => {
  const registry = await readJson("tests/fixtures/model-contract/v030-adapter-registry.json");
  const people = adapterById(registry, "people");
  const first = requestKey(people, {
    personIds: [4, 2, 2, 1], sportId: 1, gameTypes: ["R"], statGroups: ["pitching", "hitting"],
    startDate: "2025-01-01", endDate: "2025-06-18"
  });
  const second = requestKey(people, {
    personIds: [1, 4, 2], sportId: 1, gameTypes: ["R", "R"], statGroups: ["hitting", "pitching"],
    statType: "byDateRange", startDate: "2025-01-01", endDate: "2025-06-18", chunkSize: 100
  });
  assert.equal(first, second);
  assert.match(first, /^people\|v1\|personIds=1%2C2%2C4\|sportId=1\|gameTypes=R\|statGroups=hitting%2Cpitching\|statType=byDateRange\|startDate=2025-01-01\|endDate=2025-06-18\|chunkSize=100$/);

  const standings = adapterById(registry, "standings");
  assert.equal(
    requestKey(standings, { sportId: 1, leagueIds: [104, 103], standingsType: "regularSeason", season: 2025, cutoffDate: "2025-06-18" }),
    requestKey(standings, { sportId: 1, leagueIds: [103, 104, 104], standingsType: "regularSeason", season: 2025, cutoffDate: "2025-06-18" })
  );
});

test("Build 003.2 capability routing is explicit and conservative", async () => {
  const registry = await readJson("tests/fixtures/model-contract/v030-adapter-registry.json");
  assert.equal(capability(adapterById(registry, "schedule"), { sportId: 1, gameType: "R" }).state, "supported");
  assert.equal(capability(adapterById(registry, "schedule"), { sportId: 13, gameType: "R" }).state, "conditional");
  assert.equal(capability(adapterById(registry, "schedule"), { sportId: 99, gameType: "R" }).state, "untested");
  assert.equal(capability(adapterById(registry, "people"), { sportId: 14, gameType: "R" }).state, "conditional");
  assert.equal(capability(adapterById(registry, "standings"), { sportId: 1, gameType: "S" }).state, "conditional");
  assert.equal(capability(adapterById(registry, "depthChart"), { sportId: 11, gameType: "R" }).state, "absent");
  assert.equal(capability(adapterById(registry, "depthChart"), { sportId: 1, gameType: "R" }).state, "conditional");
});

test("Build 003.2 People chunks retain successes and expose failed persons", async () => {
  const registry = await readJson("tests/fixtures/model-contract/v030-adapter-registry.json");
  const people = adapterById(registry, "people");
  assert.equal(people.partialPolicy.unit, "person-id-chunk");
  assert.equal(people.partialPolicy.mergeSuccesses, true);
  assert.equal(people.partialPolicy.failedUnitAvailability, "failed");
  assert.equal(people.partialPolicy.retryFailedOnly, true);
  assert.equal(people.partialPolicy.emptyIsFailure, false);
  assert.equal(people.partialPolicy.chunkSizeInput, "chunkSize");
  assert.equal(people.inputFields.find((field) => field.name === "chunkSize").default, 100);

  assert.deepEqual(partitionPeople([5, 1, 3, 2, 2], 2), [[1, 2], [3, 5]]);
  const merged = mergePeopleUnits([
    { outcome: "success", personIds: [1, 2], candidates: [{ personId: 1, state: "available", gamesPlayed: 20 }, { personId: 2, state: "present-empty" }] },
    { outcome: "failed", personIds: [3, 5], candidates: [] }
  ]);
  assert.equal(merged.outcome, "partial");
  assert.deepEqual(merged.candidates.map((entry) => entry.personId), [1, 2]);
  assert.deepEqual(merged.failedPeople, [{ personId: 3, state: "failed" }, { personId: 5, state: "failed" }]);
  assert.equal(merged.candidates.some((entry) => [3, 5].includes(entry.personId)), false);
});

test("Build 003.2 numeric TTL is limited to the evidence-backed logo cache", async () => {
  const registry = await readJson("tests/fixtures/model-contract/v030-adapter-registry.json");
  const numeric = registry.adapters.filter((adapter) => adapter.freshness.ttlSeconds !== null);
  assert.deepEqual(numeric.map((adapter) => [adapter.id, adapter.freshness.ttlSeconds]), [["teamLogo", 1209600]]);
  assert.equal(adapterById(registry, "depthChart").freshness.basis, "current-only");
  assert.equal(adapterById(registry, "standings").freshness.basis, "end-of-day-cutoff");
  assert.equal(adapterById(registry, "boxscore").freshness.basis, "prior-game-finality");
});
