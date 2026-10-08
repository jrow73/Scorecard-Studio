import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(here);

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(workspace, relativePath), "utf8"));
}

async function loadRegistry() {
  const candidates = [
    path.join(workspace, "js", "field-registry.js"),
    path.join(workspace, "v030_build001_1_baseline", "js", "field-registry.js")
  ];
  for (const candidate of candidates) {
    try {
      return await import(pathToFileURL(candidate).href);
    } catch (error) {
      if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
    }
  }
  throw new Error("field-registry.js not found");
}

const map = await readJson("tests/fixtures/model-contract/v030-compatibility-map.json");
const schema = await readJson("schemas/v030-compatibility-map.schema.json");
const { FIELD_REGISTRY, canonicalFieldId } = await loadRegistry();
const mappings = new Map(map.fields.map((entry) => [entry.fieldId, entry]));

test("compatibility map identifies the v1-to-v2 boundary", () => {
  assert.equal(map.schemaId, "scorecard-studio.compatibility-map");
  assert.equal(map.sourceModel.schemaVersion, 1);
  assert.equal(map.targetModel.schemaVersion, 2);
  assert.equal(map.contractRevision, "0.3.0-draft.1");
  assert.equal(schema.properties.fields.minItems, 223);
  assert.equal(schema.properties.fields.maxItems, 223);
});

test("all 223 executable registry fields map exactly once with legacy metadata intact", () => {
  const registry = Object.values(FIELD_REGISTRY);
  assert.equal(registry.length, 223);
  assert.equal(map.fields.length, registry.length);
  assert.equal(new Set(map.fields.map((entry) => entry.fieldId)).size, registry.length);
  assert.deepEqual([...mappings.keys()], registry.map((entry) => entry.id));

  for (const field of registry) {
    const mapped = mappings.get(field.id);
    assert.ok(mapped, `missing mapping for ${field.id}`);
    assert.equal(mapped.v1.catalog, field.catalog === true);
    assert.equal(mapped.v1.kind, field.kind);
    assert.equal(mapped.v1.cardinality, field.cardinality);
    assert.equal(mapped.v1.path, field.path ?? null);
    assert.equal(mapped.v1.collection, field.collection ?? null);
    assert.equal(mapped.v1.rowPath, field.rowPath ?? null);
    assert.deepEqual(mapped.v1.sourceRequirements, field.sourceRequirements ?? []);
  }
  assert.equal(map.fields.filter((entry) => entry.v1.catalog).length, 171);
  assert.equal(map.fields.filter((entry) => !entry.v1.catalog).length, 52);
});

test("legacy source labels are replaced by normalized consumer capabilities", () => {
  const allowed = new Set(map.capabilityVocabulary);
  assert.deepEqual([...allowed], ["corePregame", "officials", "extendedVenue", "staff", "pitcherRoles", "game2Overlay"]);
  for (const field of map.fields) {
    assert.ok(field.v2.capabilityRequirements.length > 0, `${field.fieldId} needs a capability`);
    for (const capability of field.v2.capabilityRequirements) assert.ok(allowed.has(capability));
    assert.ok(!field.v2.capabilityRequirements.includes("gamePack"));
  }
  assert.ok(!JSON.stringify(map.fields.map((entry) => entry.v2)).includes("gamePack"));
});

test("known aliases canonicalize without rewriting layouts during load", () => {
  assert.equal(map.aliases.length, 4);
  for (const alias of map.aliases) {
    assert.equal(canonicalFieldId(alias.alias), alias.canonical);
    assert.ok(mappings.has(alias.canonical));
    assert.equal(alias.policy, "canonicalize-in-memory");
  }
  assert.equal(map.persistencePolicy.layouts.canonicalizeKnownAliases, "in-memory-on-load");
  assert.equal(map.persistencePolicy.layouts.persistCanonicalIds, "only-on-explicit-user-save");
  assert.equal(map.persistencePolicy.layouts.preserveUnknownFields, true);
});

test("renamed, typed, role-scoped, and derived projections are explicit", () => {
  const cases = {
    "game.date": ["projected", "game.dates.officialDate", "official-date"],
    "game.venue.capacity": ["projected", "game.venue.fieldInfo.capacity", "renamed-path"],
    "away.team.standings.divisionRank": ["projected", "away.team.standings.divisionRank.value", "rank-value"],
    "home.team.standings.divisionGamesBack": ["projected", "home.team.standings.divisionGamesBack.raw", "games-back-raw"],
    "away.startingPitcher.stats.era": ["projected", "away.startingPitcher.stats.pitching.totals.era", "pitching-stat-scope"],
    "home.lineup[].stats.avg": ["projected", null, "hitting-stat-scope"],
    "game.weather.summary": ["derived", null, "weather-summary-v1"],
    "away.manager.name": ["projected", "away.manager.selected.name", "selected-manager"]
  };
  for (const [fieldId, expected] of Object.entries(cases)) {
    const actual = mappings.get(fieldId).v2;
    assert.deepEqual([actual.disposition, actual.path, actual.projection], expected);
  }
  assert.equal(mappings.get("home.lineup[].stats.avg").v2.collection, "home.lineup.slots");
  assert.equal(mappings.get("home.lineup[].stats.avg").v2.rowPath, "stats.hitting.totals.avg");
});

test("fixed umpire roles and legacy bullpen semantics are compatibility projections", () => {
  assert.equal(mappings.get("game.umpires.home.name").v2.projection, "select-official-role:home-plate");
  assert.deepEqual(mappings.get("game.umpires.home.name").v2.dependencies, ["game.umpires.crew"]);
  assert.equal(mappings.get("game.umpires.crew[].role").v2.collection, "game.umpires.crew");

  for (const side of ["away", "home"]) {
    const bullpen = mappings.get(`${side}.bullpen[].player.name`).v2;
    assert.equal(bullpen.projection, "legacy-bullpen-union-v1");
    assert.deepEqual(bullpen.dependencies, [`${side}.bullpen`, `${side}.additionalStarters`]);
  }
});

test("unknown fields and persisted data fail safely across schema versions", () => {
  assert.deepEqual(map.unknownFieldPolicy, {
    resolution: "unsupported",
    render: "blank-placeholder",
    preserveOnLoadAndSave: true,
    diagnostics: "retain-original-id-and-report-once-per-layout"
  });
  const snapshots = map.persistencePolicy.normalizedSnapshots;
  assert.deepEqual(snapshots.acceptSchemaVersions, [2]);
  assert.equal(snapshots.v1ReadPolicy, "discard-and-recompute");
  assert.equal(snapshots.inPlaceUpgrade, false);
  assert.ok(snapshots.keyParts.includes("schemaVersion"));
  assert.ok(snapshots.keyParts.includes("selectedViewKey"));

  const cache = map.persistencePolicy.adapterCache;
  assert.ok(cache.keyParts.includes("adapterContractRevision"));
  assert.ok(cache.keyParts.includes("requestKey"));
  assert.equal(cache.cacheFailureAsEmpty, false);
});
