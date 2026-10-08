import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { ADAPTER_IDS, ContractRuntimeError } from "../js/v030-contract.js";
import {
  ADAPTER_DEFINITIONS,
  PLANNER_CAPABILITIES,
  V030_ADAPTER_REGISTRY,
  buildSemanticRequestKey,
  createAdapterExecutionEnvelope,
  createAdapterUnitResult,
  getAdapterDefinition,
  materializeAdapterInput,
  mergePeopleChunkUnits,
  partitionPeopleIds,
  planAdapterRequests,
  planPeopleChunks,
  resolveAdapterCapability
} from "../js/v030-adapters.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(here);

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(workspace, relativePath), "utf8"));
}

const regularMlb = { sportId: 1, gameType: "R", competitionSegment: "regular" };

test("Build 004.2 production declarations exactly reproduce the adapter registry", async () => {
  const fixture = await readJson("tests/fixtures/model-contract/v030-adapter-registry.json");
  assert.deepEqual(V030_ADAPTER_REGISTRY, fixture);
  assert.deepEqual(ADAPTER_DEFINITIONS.map((entry) => entry.id), ADAPTER_IDS);
  assert.equal(Object.isFrozen(V030_ADAPTER_REGISTRY), true);
  assert.equal(Object.isFrozen(ADAPTER_DEFINITIONS[0].inputFields), true);
  assert.equal(JSON.stringify(V030_ADAPTER_REGISTRY).includes("gamePack"), false);
  assert.equal(getAdapterDefinition("people").partialPolicy.unit, "person-id-chunk");
  assert.throws(() => getAdapterDefinition("unknown"), (error) => error.code === "ADAPTER_UNKNOWN");
});

test("semantic input materialization is closed, typed, defaulted, and deterministic", () => {
  const supplied = {
    personIds: [4, 2, 2, 1],
    sportId: 1,
    gameTypes: ["R"],
    statGroups: ["pitching", "hitting"],
    startDate: "2025-01-01",
    endDate: "2025-06-18"
  };
  const materialized = materializeAdapterInput("people", supplied);
  assert.deepEqual(materialized.personIds, [1, 2, 4]);
  assert.deepEqual(materialized.statGroups, ["hitting", "pitching"]);
  assert.equal(materialized.statType, "byDateRange");
  assert.equal(materialized.chunkSize, 100);
  assert.equal(supplied.personIds.length, 4, "caller input must not be mutated");

  const first = buildSemanticRequestKey("people", supplied);
  const second = buildSemanticRequestKey("people", {
    personIds: [1, 4, 2], sportId: 1, gameTypes: ["R", "R"], statGroups: ["hitting", "pitching"],
    statType: "byDateRange", startDate: "2025-01-01", endDate: "2025-06-18", chunkSize: 100
  });
  assert.equal(first, second);
  assert.equal(first, "people|v1|personIds=1%2C2%2C4|sportId=1|gameTypes=R|statGroups=hitting%2Cpitching|statType=byDateRange|startDate=2025-01-01|endDate=2025-06-18|chunkSize=100");

  assert.throws(() => materializeAdapterInput("people", { ...supplied, accidental: true }), (error) => error.code === "INPUT_UNKNOWN");
  assert.throws(() => materializeAdapterInput("people", { ...supplied, sportId: "1" }), (error) => error.code === "INPUT_INVALID");
  assert.throws(() => materializeAdapterInput("people", { ...supplied, endDate: "2025-02-30" }), (error) => error.code === "INPUT_INVALID");
  assert.throws(() => materializeAdapterInput("people", { ...supplied, chunkSize: 0 }), (error) => error.code === "INPUT_INVALID");
  assert.throws(() => materializeAdapterInput("schedule", {}), (error) => error.code === "INPUT_REQUIRED");
});

test("capability resolution is most-specific and conservative", () => {
  assert.equal(resolveAdapterCapability("schedule", regularMlb).state, "supported");
  assert.equal(resolveAdapterCapability("schedule", { sportId: 13, gameType: "R" }).state, "conditional");
  assert.equal(resolveAdapterCapability("schedule", { sportId: 99, gameType: "R" }).state, "untested");
  assert.equal(resolveAdapterCapability("people", { sportId: 14, gameType: "R" }).state, "conditional");
  assert.equal(resolveAdapterCapability("standings", { sportId: 1, gameType: "S" }).state, "conditional");
  assert.equal(resolveAdapterCapability("depthChart", { sportId: 11, gameType: "R" }).state, "absent");
  assert.equal(resolveAdapterCapability("depthChart", regularMlb).state, "conditional");
});

test("planner routes normalized capabilities, stages missing inputs, and deduplicates request units", () => {
  assert.deepEqual(PLANNER_CAPABILITIES, ["corePregame", "officials", "extendedVenue", "staff", "pitcherRoles", "currentTeamLogos", "game2Overlay", "standingsGroups"]);
  const scheduleInput = { gamePk: "800001", sportId: 1, selectedDate: "2025-07-03" };
  const feedInput = { gamePk: "800001" };
  const standingsInput = { sportId: 1, leagueIds: [103, 104], standingsType: "regularSeason", season: 2025, cutoffDate: "2025-07-02" };
  const plan = planAdapterRequests({
    capabilities: ["corePregame", "officials", "standingsGroups"],
    context: { ...regularMlb, hasCoreStandingsGroups: false },
    requests: { schedule: scheduleInput, feed: feedInput, standings: standingsInput }
  });
  assert.ok(plan.entries.some((entry) => entry.capability === "corePregame" && entry.adapter === "people" && entry.status === "pending-input"));
  assert.ok(plan.entries.some((entry) => entry.capability === "officials" && entry.adapter === "feed" && entry.status === "planned"));
  assert.equal(plan.requestUnits.filter((unit) => unit.adapter === "standings").length, 1, "same semantic request must be deduplicated");
  assert.deepEqual(plan.requestUnits.find((unit) => unit.adapter === "standings").capabilities, ["corePregame", "standingsGroups"]);

  const reused = planAdapterRequests({ capabilities: ["extendedVenue", "standingsGroups"], context: { ...regularMlb, hasUsableFeedVenue: true, hasCoreStandingsGroups: true } });
  assert.deepEqual(reused.entries.map((entry) => entry.status), ["satisfied", "satisfied"]);
  assert.deepEqual(reused.requestUnits, []);

  const suppressed = planAdapterRequests({ capabilities: ["game2Overlay"], context: { ...regularMlb, earlierSameDayGameFinal: false } });
  assert.equal(suppressed.entries[0].status, "suppressed");

  const milbFallback = planAdapterRequests({ capabilities: ["pitcherRoles"], context: { sportId: 14, gameType: "R", competitionSegment: "regular" } });
  assert.equal(milbFallback.entries[0].status, "fallback");
  assert.match(milbFallback.entries[0].reason, /roster pitchers minus selected starter/i);

  const unknownContext = planAdapterRequests({ capabilities: ["officials"], context: { sportId: 99, gameType: "R" }, requests: { feed: feedInput } });
  assert.equal(unknownContext.entries[0].status, "blocked");
  assert.throws(() => planAdapterRequests({ capabilities: ["gamePack"], context: regularMlb }), (error) => error.code === "CAPABILITY_UNKNOWN");
});

test("People chunk planning is stable and each unit has a complete semantic key", () => {
  assert.deepEqual(partitionPeopleIds([5, 1, 3, 2, 2], 2), [[1, 2], [3, 5]]);
  const plan = planPeopleChunks({
    personIds: [5, 1, 3, 2, 2], sportId: 1, gameTypes: ["R"], statGroups: ["pitching", "hitting"],
    startDate: "2025-01-01", endDate: "2025-06-18", chunkSize: 2
  });
  assert.deepEqual(plan.input.personIds, [1, 2, 3, 5]);
  assert.deepEqual(plan.chunks.map((chunk) => chunk.personIds), [[1, 2], [3, 5]]);
  assert.deepEqual(plan.chunks.map((chunk) => chunk.unitKey), ["people:1/2:1-2", "people:2/2:3-5"]);
  assert.ok(plan.chunks.every((chunk) => chunk.requestKey.includes("chunkSize=2")));
  assert.notEqual(plan.chunks[0].requestKey, plan.chunks[1].requestKey);
  assert.throws(() => partitionPeopleIds([1, "2"], 100), (error) => error.code === "INPUT_INVALID");
});

test("adapter envelopes retain successful units and expose failures without zero filling", () => {
  const success = createAdapterUnitResult({
    unitKey: "people:1/2:1-2", requestKey: "people|one", outcome: "success", personIds: [1, 2],
    candidates: [{ personId: 1, state: "available", gamesPlayed: 20 }, { personId: 2, state: "present-empty" }]
  });
  const failure = createAdapterUnitResult({
    unitKey: "people:2/2:3-5", requestKey: "people|two", outcome: "failed", personIds: [3, 5],
    error: { code: "REQUEST_FAILED", summary: "Synthetic failure", retryable: true }
  });
  const envelope = createAdapterExecutionEnvelope({
    operationId: "people-operation-1", adapter: "people", input: {
      personIds: [1, 2, 3, 5], sportId: 1, gameTypes: ["R"], statGroups: ["hitting", "pitching"],
      startDate: "2025-01-01", endDate: "2025-06-18", chunkSize: 2
    },
    effective: { kind: "dateRange", startDate: "2025-01-01", endDate: "2025-06-18" }, units: [success, failure]
  });
  assert.equal(envelope.outcome, "partial");
  assert.equal(envelope.requestKey, "people|v1|personIds=1%2C2%2C3%2C5|sportId=1|gameTypes=R|statGroups=hitting%2Cpitching|statType=byDateRange|startDate=2025-01-01|endDate=2025-06-18|chunkSize=2");
  assert.deepEqual(envelope.candidates.map((entry) => entry.personId), [1, 2]);
  assert.deepEqual(envelope.failures.map((entry) => entry.unitKey), ["people:2/2:3-5"]);
  assert.equal(envelope.candidates.some((entry) => [3, 5].includes(entry.personId)), false);

  const merged = mergePeopleChunkUnits([success, failure]);
  assert.equal(merged.outcome, "partial");
  assert.deepEqual(merged.failedPeople, [
    { personId: 3, state: "failed", unitKey: "people:2/2:3-5" },
    { personId: 5, state: "failed", unitKey: "people:2/2:3-5" }
  ]);
  assert.ok(merged.failedPeople.every((entry) => !ownGamesPlayed(entry)));

  assert.throws(
    () => createAdapterExecutionEnvelope({
      operationId: "mixed", adapter: "people", input: {
        personIds: [1, 2, 3, 5], sportId: 1, gameTypes: ["R"], statGroups: ["hitting"],
        startDate: "2025-01-01", endDate: "2025-06-18", chunkSize: 2
      }, units: [success, { ...failure, outcome: "notRequested" }]
    }),
    (error) => error instanceof ContractRuntimeError && error.code === "INPUT_INVALID"
  );
});

function ownGamesPlayed(value) {
  return Object.prototype.hasOwnProperty.call(value, "gamesPlayed");
}
