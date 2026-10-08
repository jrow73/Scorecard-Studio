import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ADAPTER_IDS,
  AVAILABILITY_STATES,
  ContractRuntimeError,
  ContractValidationError,
  NORMALIZED_CONTRACT_REVISION,
  NORMALIZED_SCHEMA_ID,
  NORMALIZED_SCHEMA_VERSION,
  assertValidNormalizedSnapshot,
  createEffectiveDescriptor,
  createLineageRecord,
  createNormalizedSnapshot,
  createSnapshotMetadata,
  createSourceResult,
  escapeJsonPointerToken,
  findEffectiveLineage,
  parseJsonPointer,
  resolveJsonPointer,
  unescapeJsonPointerToken,
  validateNormalizedSnapshot
} from "../js/v030-contract.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(here);
const fixtureNames = [
  "v030-game2-mixed-cutoff.json",
  "v030-ordinary-pregame.json",
  "v030-missing-lineup.json",
  "v030-two-way-roles.json",
  "v030-manager-ambiguity.json",
  "v030-variable-officials.json",
  "v030-milb-capability-absence.json",
  "v030-scoped-competition-stats.json"
];

async function readFixture(name) {
  return JSON.parse(await readFile(path.join(workspace, "tests", "fixtures", "model-contract", name), "utf8"));
}

test("Build 004.1 exports the closed schema-v2 runtime vocabulary", () => {
  assert.equal(NORMALIZED_SCHEMA_ID, "scorecard-studio.normalized-game");
  assert.equal(NORMALIZED_SCHEMA_VERSION, 2);
  assert.equal(NORMALIZED_CONTRACT_REVISION, "0.3.0-draft.2");
  assert.deepEqual(ADAPTER_IDS, ["schedule", "feed", "boxscore", "roster", "people", "coaches", "standings", "venue", "depthChart", "teamLogo"]);
  assert.deepEqual(AVAILABILITY_STATES, ["available", "unposted", "present-empty", "omitted", "not-requested", "unsupported", "not-applicable", "ambiguous", "partial", "failed", "stale"]);
  assert.equal(Object.isFrozen(ADAPTER_IDS), true);
  assert.equal(Object.isFrozen(AVAILABILITY_STATES), true);
});

test("JSON Pointer utilities distinguish missing, null, arrays, and escaped tokens", () => {
  const model = { present: null, list: [{ value: 7 }], "a/b": { "m~n": "escaped" } };
  assert.deepEqual(parseJsonPointer("/a~1b/m~0n"), ["a/b", "m~n"]);
  assert.equal(escapeJsonPointerToken("a/b~c"), "a~1b~0c");
  assert.equal(unescapeJsonPointerToken("a~1b~0c"), "a/b~c");
  assert.deepEqual(resolveJsonPointer(model, ""), { found: true, value: model, pointer: "", missingToken: null });
  assert.equal(resolveJsonPointer(model, "/present").found, true);
  assert.equal(resolveJsonPointer(model, "/present").value, null);
  assert.equal(resolveJsonPointer(model, "/missing").found, false);
  assert.equal(resolveJsonPointer(model, "/list/0/value").value, 7);
  assert.equal(resolveJsonPointer(model, "/a~1b/m~0n").value, "escaped");
  assert.throws(() => parseJsonPointer("not-a-pointer"), (error) => error instanceof ContractRuntimeError && error.code === "POINTER_INVALID");
  assert.throws(() => parseJsonPointer("/bad~2escape"), (error) => error.code === "POINTER_INVALID");
});

test("lineage lookup applies exact then longest-prefix precedence", () => {
  const records = [
    { id: "root", target: "/away", coverage: "subtree" },
    { id: "team", target: "/away/team", coverage: "subtree" },
    { id: "wins", target: "/away/team/record/wins", coverage: "exact" }
  ];
  assert.equal(findEffectiveLineage(records, "/away/team/name").id, "team");
  assert.equal(findEffectiveLineage(records, "/away/team/record/wins").id, "wins");
  assert.equal(findEffectiveLineage(records, "/home/team/name"), null);

  const duplicate = [...records, { id: "wins-duplicate", target: "/away/team/record/wins", coverage: "exact" }];
  assert.throws(() => findEffectiveLineage(duplicate, "/away/team/record/wins"), (error) => error.code === "LINEAGE_AMBIGUOUS");
});

test("typed constructors apply explicit defaults without mutating input", () => {
  const effectiveInput = { kind: "date", date: "2025-07-03" };
  const sourceInput = {
    id: "schedule.example",
    adapter: "schedule",
    request: { key: "schedule|v1|gamePk=1", endpointFamily: "schedule", method: "GET", parameters: { gamePk: 1 } },
    scope: { gamePk: "1" },
    effective: effectiveInput,
    outcome: "success"
  };
  const result = createSourceResult(sourceInput);
  assert.notEqual(result, sourceInput);
  assert.notEqual(result.effective, effectiveInput);
  assert.equal(result.requestedAtUtc, null);
  assert.equal(result.retrievedAtUtc, null);
  assert.deepEqual(createEffectiveDescriptor(), { kind: "unknown" });

  const lineage = createLineageRecord({
    id: "lineage.example",
    target: "/game/status",
    coverage: "subtree",
    state: "available",
    sourceResultRefs: [result.id]
  });
  assert.equal(lineage.selectedSourceResultRef, null);
  assert.equal(lineage.fallbackUsed, false);
  assert.deepEqual(lineage.transformations, []);

  const metadata = createSnapshotMetadata({ id: "snapshot-1", createdAtUtc: "2026-10-07T18:00:00.000Z", producer: { applicationVersion: "0.3.0" } });
  assert.equal(metadata.fixtureKind, null);
  assert.throws(() => createSourceResult({ ...sourceInput, adapter: "gamePack" }), (error) => error.code === "INPUT_INVALID");
  assert.throws(() => createLineageRecord({ id: "bad", target: "/meta/sourceResults", coverage: "exact", state: "available" }), (error) => error.code === "LINEAGE_TARGET_INVALID");
});

test("all Build 003 snapshots validate through the production runtime", async () => {
  for (const name of fixtureNames) {
    const snapshot = await readFixture(name);
    const requiredTargets = ["/game/status", "/away/team/name", "/home/team/name", "/standings/groups"];
    const result = validateNormalizedSnapshot(snapshot, { requiredTargets });
    assert.deepEqual(result.errors, [], name);
    assert.equal(result.valid, true, name);
    assert.equal(assertValidNormalizedSnapshot(snapshot, { requiredTargets }), snapshot);
  }
});

test("normalized snapshot constructor reproduces a validated contract boundary", async () => {
  const fixture = await readFixture("v030-ordinary-pregame.json");
  const constructed = createNormalizedSnapshot({ ...fixture, contractRevision: NORMALIZED_CONTRACT_REVISION }, { requiredTargets: ["/game", "/away", "/home", "/standings"] });
  assert.notEqual(constructed, fixture);
  assert.equal(constructed.schemaId, NORMALIZED_SCHEMA_ID);
  assert.equal(constructed.schemaVersion, NORMALIZED_SCHEMA_VERSION);
  assert.equal(constructed.contractRevision, NORMALIZED_CONTRACT_REVISION);
  assert.equal(validateNormalizedSnapshot(constructed).valid, true);
});

test("development validation reports deterministic structural failures", async () => {
  const valid = await readFixture("v030-ordinary-pregame.json");
  const duplicateSource = structuredClone(valid);
  duplicateSource.meta.sourceResults.push(structuredClone(duplicateSource.meta.sourceResults[0]));
  assert.ok(validateNormalizedSnapshot(duplicateSource).errors.some((error) => error.code === "SOURCE_ID_DUPLICATE"));

  const dangling = structuredClone(valid);
  dangling.meta.lineage[0].sourceResultRefs = ["missing.source"];
  assert.ok(validateNormalizedSnapshot(dangling).errors.some((error) => error.code === "SOURCE_REF_DANGLING"));

  const duplicateLineage = structuredClone(valid);
  duplicateLineage.meta.lineage.push({ ...structuredClone(duplicateLineage.meta.lineage[0]), id: "lineage.duplicate" });
  const duplicateErrors = validateNormalizedSnapshot(duplicateLineage).errors;
  assert.ok(duplicateErrors.some((error) => error.code === "LINEAGE_TARGET_DUPLICATE"));
  assert.throws(
    () => assertValidNormalizedSnapshot(duplicateLineage),
    (error) => error instanceof ContractValidationError && error.code === "SNAPSHOT_INVALID" && error.errors.length > 0
  );

  const missingTarget = structuredClone(valid);
  missingTarget.meta.lineage.push({
    ...structuredClone(missingTarget.meta.lineage[0]),
    id: "lineage.missing-target",
    target: "/game/does-not-exist",
    coverage: "exact"
  });
  assert.ok(validateNormalizedSnapshot(missingTarget).errors.some((error) => error.code === "LINEAGE_TARGET_MISSING"));

  const noCoverage = validateNormalizedSnapshot(valid, { requiredTargets: ["/not-covered"] });
  assert.ok(noCoverage.errors.some((error) => error.code === "LINEAGE_REQUIRED"));
});
