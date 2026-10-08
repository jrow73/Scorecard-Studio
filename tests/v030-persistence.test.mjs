import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  V030_ADAPTER_REGISTRY,
  buildSemanticRequestKey,
  createAdapterExecutionEnvelope,
  createAdapterUnitResult
} from "../js/v030-adapters.js";
import {
  V030_PERSISTENCE_NAMESPACES,
  V030_PERSISTENCE_STORES,
  buildAdapterResultStorageKey,
  buildNormalizedSnapshotStorageKey,
  createNormalizedSnapshotRecord,
  createV030PersistenceController,
  inspectAdapterResultRecord,
  inspectNormalizedSnapshotRecord,
  mergeAdapterRetryResult,
  prepareAdapterResultCacheWrite
} from "../js/v030-persistence.js";
import { NORMALIZED_CONTRACT_REVISION } from "../js/v030-contract.js";

const fixtureDir = resolve(import.meta.dirname, "fixtures/model-contract");
const readJson = async (name) => JSON.parse(await readFile(resolve(fixtureDir, name), "utf8"));
const snapshot = { ...await readJson("v030-variable-officials-feed-venue-normalized.json"), contractRevision: NORMALIZED_CONTRACT_REVISION };
const cases = await readJson("v030-persistence-cases.json");
const NOW = "2026-10-08T15:00:00.000Z";

function peopleInput(personIds = [1, 2, 3, 5]) {
  return { personIds, sportId: 1, gameTypes: ["R"], statGroups: ["hitting", "pitching"], startDate: "2025-01-01", endDate: "2025-06-18", chunkSize: 2 };
}

function peoplePartialEnvelope() {
  const input = peopleInput();
  return createAdapterExecutionEnvelope({
    operationId: "people-initial",
    adapter: "people",
    input,
    completedAtUtc: NOW,
    units: [
      createAdapterUnitResult({ unitKey: "people:1/2:1-2", requestKey: buildSemanticRequestKey("people", peopleInput([1, 2])), outcome: "success", personIds: [1, 2], candidates: [{ personId: 1, state: "available" }] }),
      createAdapterUnitResult({ unitKey: "people:2/2:3-5", requestKey: buildSemanticRequestKey("people", peopleInput([3, 5])), outcome: "failed", personIds: [3, 5], error: { code: "REQUEST_FAILED", retryable: true } })
    ]
  });
}

test("generated persistence collision fixture is current and deterministic", () => {
  assert.deepEqual(cases.stores, V030_PERSISTENCE_STORES);
  assert.deepEqual(cases.namespaces, V030_PERSISTENCE_NAMESPACES);
  for (const entry of cases.snapshots) assert.equal(entry.key, buildNormalizedSnapshotStorageKey(entry));
  for (const entry of cases.adapterInputs) {
    assert.equal(entry.requestKey, buildSemanticRequestKey(entry.adapter, entry.input));
    assert.equal(entry.storageKey, buildAdapterResultStorageKey({ adapterContractRevision: V030_ADAPTER_REGISTRY.contractRevision, requestKey: entry.requestKey }));
  }
});

test("snapshot keys cannot collide across schema, contract, game, or selected view", () => {
  const base = { schemaVersion: 2, contractRevision: "0.3.0-draft.1", gamePk: "800047", selectedViewKey: "800047:2025-07-03:1" };
  const keys = [
    base,
    { ...base, schemaVersion: 1 },
    { ...base, contractRevision: "0.3.0-draft.2" },
    { ...base, gamePk: "800048" },
    { ...base, selectedViewKey: "800047:2025-07-04:1" }
  ].map(buildNormalizedSnapshotStorageKey);
  assert.equal(new Set(keys).size, keys.length);
});

test("adapter keys cannot collide across contract revision or semantic scope", () => {
  const requestKeys = cases.adapterInputs.map((entry) => entry.requestKey);
  assert.equal(new Set(requestKeys).size, requestKeys.length);
  const current = buildAdapterResultStorageKey({ adapterContractRevision: "0.3.0-draft.1", requestKey: requestKeys[0] });
  const future = buildAdapterResultStorageKey({ adapterContractRevision: "0.3.0-draft.2", requestKey: requestKeys[0] });
  assert.notEqual(current, future);
});

test("only valid current schema-v2 snapshots are persisted and read", () => {
  const record = createNormalizedSnapshotRecord(snapshot, { storedAtUtc: NOW });
  const expected = { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey };
  const hit = inspectNormalizedSnapshotRecord(record, expected);
  assert.equal(hit.status, "hit");
  assert.notEqual(hit.snapshot, snapshot);
  assert.deepEqual(hit.snapshot, snapshot);
  assert.equal(inspectNormalizedSnapshotRecord({ ...record, schemaVersion: 1, snapshot: { ...record.snapshot, schemaVersion: 1 } }, expected).reason, "schema-version-mismatch");
  assert.equal(inspectNormalizedSnapshotRecord({ ...record, contractRevision: "old" }, expected).reason, "contract-revision-mismatch");
  assert.equal(inspectNormalizedSnapshotRecord({ ...record, contractRevision: "0.3.0-draft.1", snapshot: { ...record.snapshot, contractRevision: "0.3.0-draft.1" } }, expected).reason, "contract-revision-mismatch");
  assert.equal(inspectNormalizedSnapshotRecord(record, { ...expected, selectedViewKey: "other-view" }).reason, "semantic-scope-mismatch");
  assert.throws(() => createNormalizedSnapshotRecord({ ...snapshot, schemaVersion: 1 }, { storedAtUtc: NOW }), (error) => error.code === "SNAPSHOT_INVALID");
});

test("snapshot refresh events recompute while a same-view selection may reuse", () => {
  const record = createNormalizedSnapshotRecord(snapshot, { storedAtUtc: NOW });
  const expected = { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey };
  assert.equal(inspectNormalizedSnapshotRecord(record, expected, { trigger: "selection" }).status, "hit");
  assert.equal(inspectNormalizedSnapshotRecord(record, expected, { trigger: "status-transition" }).reason, "refresh-trigger:status-transition");
  assert.equal(inspectNormalizedSnapshotRecord(record, expected, { trigger: "manual" }).status, "recompute");
});

test("partial adapter writes retain successes and expose only failed units for retry", () => {
  const envelope = peoplePartialEnvelope();
  const prepared = prepareAdapterResultCacheWrite(envelope, { storedAtUtc: NOW });
  assert.equal(prepared.action, "put");
  assert.equal(prepared.record.outcome, "partial");
  assert.equal(prepared.record.successfulUnits.length, 1);
  assert.equal(prepared.record.retryUnits.length, 1);
  assert.equal(JSON.stringify(prepared.record).includes("gamesPlayed\":0"), false);
  const inspected = inspectAdapterResultRecord(prepared.record, { adapter: "people", requestKey: envelope.requestKey }, { trigger: "retry-failed-units", nowUtc: NOW });
  assert.equal(inspected.status, "partial-retry");
  assert.deepEqual(inspected.retryUnits.map((unit) => unit.personIds), [[3, 5]]);
  assert.deepEqual(inspected.successfulUnits.flatMap((unit) => unit.personIds), [1, 2]);
});

test("successful retries merge without refetching successful units", () => {
  const initial = prepareAdapterResultCacheWrite(peoplePartialEnvelope(), { storedAtUtc: NOW }).record;
  const failed = initial.retryUnits[0];
  const retry = createAdapterExecutionEnvelope({
    operationId: "people-retry",
    adapter: "people",
    input: peopleInput([3, 5]),
    requestKey: initial.requestKey,
    completedAtUtc: "2026-10-08T15:01:00.000Z",
    units: [createAdapterUnitResult({ unitKey: failed.unitKey, requestKey: failed.requestKey, outcome: "success", personIds: [3, 5], candidates: [{ personId: 3, state: "available" }] })]
  });
  const merged = mergeAdapterRetryResult(initial, retry);
  assert.equal(merged.outcome, "success");
  assert.equal(merged.successfulUnits.length, 2);
  assert.deepEqual(merged.successfulUnits.flatMap((unit) => unit.personIds), [1, 2, 3, 5]);
  assert.deepEqual(merged.retryUnits, []);
});

test("non-retryable failed units stay explicit and are never scheduled as retries", () => {
  const envelope = peoplePartialEnvelope();
  envelope.units[1].error.retryable = false;
  const record = prepareAdapterResultCacheWrite(envelope, { storedAtUtc: NOW }).record;
  const inspected = inspectAdapterResultRecord(record, { adapter: "people", requestKey: envelope.requestKey }, { nowUtc: NOW });
  assert.equal(inspected.status, "partial-terminal");
  assert.deepEqual(inspected.retryUnits, []);
  assert.equal(inspected.terminalFailures[0].retryable, false);
});

test("failed-only and declared-empty-is-failure executions never become empty cache hits", () => {
  const failedEnvelope = createAdapterExecutionEnvelope({
    operationId: "people-failed",
    adapter: "people",
    input: peopleInput([3, 5]),
    units: [createAdapterUnitResult({ unitKey: "people:1/1:3-5", requestKey: buildSemanticRequestKey("people", peopleInput([3, 5])), outcome: "failed", personIds: [3, 5], error: { code: "REQUEST_FAILED", retryable: true } })]
  });
  assert.equal(prepareAdapterResultCacheWrite(failedEnvelope, { storedAtUtc: NOW }).action, "skip");

  const scheduleInput = { gamePk: "800047", sportId: 1, selectedDate: "2025-07-03" };
  const emptySchedule = createAdapterExecutionEnvelope({
    operationId: "schedule-empty", adapter: "schedule", input: scheduleInput,
    units: [createAdapterUnitResult({ unitKey: "schedule:800047", requestKey: buildSemanticRequestKey("schedule", scheduleInput), outcome: "success", candidates: [] })]
  });
  const prepared = prepareAdapterResultCacheWrite(emptySchedule, { storedAtUtc: NOW });
  assert.equal(prepared.action, "skip");
  assert.equal(prepared.retryUnits[0].reason, "EMPTY_SUCCESS");
});

test("adapter freshness honors lookup, event, scope, and TTL boundaries", () => {
  const envelope = peoplePartialEnvelope();
  const record = prepareAdapterResultCacheWrite(envelope, { storedAtUtc: NOW }).record;
  assert.equal(inspectAdapterResultRecord(record, { adapter: "people", requestKey: envelope.requestKey }, { nowUtc: NOW }).status, "partial-retry");
  assert.equal(inspectAdapterResultRecord(record, { adapter: "people", requestKey: "different" }, { nowUtc: NOW }).reason, "semantic-scope-mismatch");
  assert.equal(inspectAdapterResultRecord(record, { adapter: "people", requestKey: envelope.requestKey }, { trigger: "scope-change", nowUtc: NOW }).reason, "refresh-trigger:scope-change");

  const logoRequest = buildSemanticRequestKey("teamLogo", { teamId: 147 });
  const logoEnvelope = createAdapterExecutionEnvelope({
    operationId: "logo", adapter: "teamLogo", input: { teamId: 147 }, requestKey: logoRequest,
    units: [createAdapterUnitResult({ unitKey: "logo:147", requestKey: logoRequest, outcome: "success", candidates: [{ teamId: 147, mediaType: "image/svg+xml", state: "available" }] })]
  });
  const logoRecord = prepareAdapterResultCacheWrite(logoEnvelope, { storedAtUtc: "2026-10-01T00:00:00.000Z" }).record;
  assert.equal(inspectAdapterResultRecord(logoRecord, { adapter: "teamLogo", requestKey: logoRequest }, { trigger: "consumer-demand", nowUtc: "2026-10-14T23:59:59.000Z" }).status, "hit");
  assert.equal(inspectAdapterResultRecord(logoRecord, { adapter: "teamLogo", requestKey: logoRequest }, { nowUtc: "2026-10-15T00:00:00.000Z" }).reason, "ttl-expired");
});

test("controller is confined to the two new stores", async () => {
  const records = new Map();
  const calls = [];
  const backend = {
    async get(store, key) { calls.push(["get", store, key]); return records.get(`${store}:${key}`); },
    async put(store, record) { calls.push(["put", store, record.key]); records.set(`${store}:${record.key}`, structuredClone(record)); },
    async delete(store, key) { calls.push(["delete", store, key]); records.delete(`${store}:${key}`); }
  };
  const controller = createV030PersistenceController(backend);
  await controller.saveNormalizedSnapshot(snapshot, { storedAtUtc: NOW });
  const result = await controller.loadNormalizedSnapshot({ gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey });
  assert.equal(result.status, "hit");
  assert.deepEqual(new Set(calls.map((entry) => entry[1])), new Set([V030_PERSISTENCE_STORES.normalizedSnapshots]));
  assert.equal(calls.some((entry) => ["layouts", "pdfTemplates", "settings"].includes(entry[1])), false);
});
