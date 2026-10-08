/**
 * Scorecard Studio v0.3.0 version-aware persistence and refresh policy.
 *
 * Build 004.7 is disconnected from the v0.2.0 application bootstrap. Storage
 * access is injected so this module cannot open, migrate, or rewrite the
 * existing settings, layouts, or PDF stores.
 */

import {
  NORMALIZED_CONTRACT_REVISION,
  NORMALIZED_SCHEMA_ID,
  NORMALIZED_SCHEMA_VERSION,
  ContractRuntimeError,
  validateNormalizedSnapshot
} from "./v030-contract.js?v=030b0054";
import { V030_ADAPTER_REGISTRY, getAdapterDefinition } from "./v030-adapters.js?v=030b0054";

export const V030_PERSISTENCE_STORES = Object.freeze({
  normalizedSnapshots: "normalizedSnapshotsV2",
  adapterResults: "adapterResultsV1"
});

export const V030_PERSISTENCE_NAMESPACES = Object.freeze({
  normalizedSnapshots: "normalized-game",
  adapterResults: "adapter-result"
});

const LOOKUP_ONLY_TRIGGERS = new Set(["selection", "consumer-demand"]);
const RETRY_TRIGGER = "retry-failed-units";

function clone(value) {
  if (value === undefined) return undefined;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} must be an object.`);
  }
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string" || !value.length) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} must be a non-empty string.`);
  }
  return value;
}

function requireUtc(value, label) {
  requireString(value, label);
  if (!value.endsWith("Z") || !Number.isFinite(Date.parse(value))) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} must be a UTC timestamp ending in Z.`);
  }
  return value;
}

function keyPart(name, value) {
  return `${name}=${encodeURIComponent(String(value))}`;
}

export function buildNormalizedSnapshotStorageKey(identity) {
  const input = requireObject(identity, "normalized snapshot storage identity");
  const schemaVersion = Number(input.schemaVersion);
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new ContractRuntimeError("INPUT_INVALID", "Normalized snapshot schemaVersion must be a positive integer.");
  }
  return [
    V030_PERSISTENCE_NAMESPACES.normalizedSnapshots,
    keyPart("schema", schemaVersion),
    keyPart("contract", requireString(input.contractRevision, "normalized snapshot contractRevision")),
    keyPart("gamePk", requireString(String(input.gamePk ?? ""), "normalized snapshot gamePk")),
    keyPart("view", requireString(input.selectedViewKey, "normalized snapshot selectedViewKey"))
  ].join("|");
}

export function buildAdapterResultStorageKey(identity) {
  const input = requireObject(identity, "adapter-result storage identity");
  return [
    V030_PERSISTENCE_NAMESPACES.adapterResults,
    keyPart("contract", requireString(input.adapterContractRevision, "adapter contract revision")),
    keyPart("request", requireString(input.requestKey, "adapter semantic request key"))
  ].join("|");
}

function snapshotIdentity(snapshot) {
  return {
    schemaVersion: snapshot.schemaVersion,
    contractRevision: snapshot.contractRevision,
    gamePk: String(snapshot.context?.gamePk ?? ""),
    selectedViewKey: snapshot.context?.selectedViewKey
  };
}

export function createNormalizedSnapshotRecord(snapshot, options = {}) {
  const validation = validateNormalizedSnapshot(snapshot);
  if (!validation.valid) {
    throw new ContractRuntimeError("SNAPSHOT_INVALID", "Only a valid schema-v2 normalized snapshot may be persisted.", { errors: validation.errors });
  }
  if (snapshot.schemaVersion !== NORMALIZED_SCHEMA_VERSION || snapshot.schemaId !== NORMALIZED_SCHEMA_ID) {
    throw new ContractRuntimeError("SCHEMA_VERSION_UNSUPPORTED", "Only the current normalized schema may be persisted.");
  }
  if (snapshot.contractRevision !== NORMALIZED_CONTRACT_REVISION) {
    throw new ContractRuntimeError("CONTRACT_REVISION_UNSUPPORTED", "Only the current normalized contract revision may be persisted.");
  }
  const identity = snapshotIdentity(snapshot);
  return {
    key: buildNormalizedSnapshotStorageKey(identity),
    namespace: V030_PERSISTENCE_NAMESPACES.normalizedSnapshots,
    schemaId: NORMALIZED_SCHEMA_ID,
    ...identity,
    storedAtUtc: requireUtc(options.storedAtUtc ?? new Date().toISOString(), "normalized snapshot storedAtUtc"),
    snapshot: clone(snapshot)
  };
}

function recompute(reason, details = {}) {
  return { status: "recompute", usable: false, reason, snapshot: null, ...details };
}

export function inspectNormalizedSnapshotRecord(record, expected, options = {}) {
  if (record == null) return recompute("cache-miss");
  if (!record || typeof record !== "object" || Array.isArray(record)) return recompute("record-invalid");
  if (record.namespace !== V030_PERSISTENCE_NAMESPACES.normalizedSnapshots) return recompute("namespace-mismatch");
  if (record.schemaVersion !== NORMALIZED_SCHEMA_VERSION || record.snapshot?.schemaVersion !== NORMALIZED_SCHEMA_VERSION) {
    return recompute("schema-version-mismatch", { discardedSchemaVersion: record.snapshot?.schemaVersion ?? record.schemaVersion ?? null });
  }
  if (record.contractRevision !== NORMALIZED_CONTRACT_REVISION || record.snapshot?.contractRevision !== NORMALIZED_CONTRACT_REVISION) {
    return recompute("contract-revision-mismatch");
  }

  const identity = {
    schemaVersion: NORMALIZED_SCHEMA_VERSION,
    contractRevision: NORMALIZED_CONTRACT_REVISION,
    gamePk: String(expected?.gamePk ?? ""),
    selectedViewKey: expected?.selectedViewKey
  };
  let expectedKey;
  try { expectedKey = buildNormalizedSnapshotStorageKey(identity); }
  catch { return recompute("expected-identity-invalid"); }
  if (record.key !== expectedKey) return recompute("semantic-scope-mismatch", { expectedKey });

  const actualIdentity = snapshotIdentity(record.snapshot ?? {});
  try {
    if (buildNormalizedSnapshotStorageKey(actualIdentity) !== record.key) return recompute("payload-identity-mismatch");
  } catch {
    return recompute("payload-identity-mismatch");
  }
  const validation = validateNormalizedSnapshot(record.snapshot);
  if (!validation.valid) return recompute("snapshot-invalid", { validationErrors: validation.errors });

  const trigger = options.trigger ?? null;
  if (trigger && trigger !== "selection") return recompute(`refresh-trigger:${trigger}`);
  return { status: "hit", usable: true, reason: null, snapshot: clone(record.snapshot), record: clone(record) };
}

function unitHasCacheableMaterial(unit, definition) {
  if (!definition.partialPolicy.emptyIsFailure) return true;
  return Array.isArray(unit.candidates) && unit.candidates.length > 0;
}

function sanitizedSuccessfulUnit(unit) {
  const output = {
    unitKey: requireString(unit.unitKey, "adapter unit key"),
    requestKey: requireString(unit.requestKey, "adapter unit request key"),
    outcome: "success",
    requestedAtUtc: unit.requestedAtUtc ?? null,
    retrievedAtUtc: unit.retrievedAtUtc ?? null,
    candidates: clone(Array.isArray(unit.candidates) ? unit.candidates : [])
  };
  if (Array.isArray(unit.personIds)) output.personIds = [...unit.personIds];
  return output;
}

function retryDescriptor(unit, reason = null) {
  const output = {
    unitKey: requireString(unit.unitKey, "retry unit key"),
    requestKey: requireString(unit.requestKey, "retry request key"),
    retryable: unit.error?.retryable !== false,
    reason: reason ?? unit.error?.code ?? "REQUEST_FAILED"
  };
  if (Array.isArray(unit.personIds)) output.personIds = [...unit.personIds];
  return output;
}

function expiresAt(storedAtUtc, ttlSeconds) {
  if (ttlSeconds == null) return null;
  return new Date(Date.parse(storedAtUtc) + ttlSeconds * 1000).toISOString();
}

function adapterRecord(adapter, requestKey, successfulUnits, retryUnits, storedAtUtc) {
  const definition = getAdapterDefinition(adapter);
  const key = buildAdapterResultStorageKey({ adapterContractRevision: V030_ADAPTER_REGISTRY.contractRevision, requestKey });
  return {
    key,
    namespace: V030_PERSISTENCE_NAMESPACES.adapterResults,
    adapterContractRevision: V030_ADAPTER_REGISTRY.contractRevision,
    adapter,
    requestKey,
    storedAtUtc,
    expiresAtUtc: expiresAt(storedAtUtc, definition.freshness.ttlSeconds),
    outcome: retryUnits.length ? "partial" : "success",
    successfulUnits: clone(successfulUnits),
    retryUnits: clone(retryUnits)
  };
}

export function prepareAdapterResultCacheWrite(envelope, options = {}) {
  const source = requireObject(envelope, "adapter execution envelope");
  if (source.contractRevision !== NORMALIZED_CONTRACT_REVISION) {
    throw new ContractRuntimeError("CONTRACT_REVISION_UNSUPPORTED", "Adapter result uses a different contract revision.");
  }
  const definition = getAdapterDefinition(source.adapter);
  const requestKey = requireString(source.requestKey, "adapter envelope requestKey");
  const storedAtUtc = requireUtc(options.storedAtUtc ?? source.completedAtUtc ?? new Date().toISOString(), "adapter-result storedAtUtc");
  const successfulUnits = [];
  const retryUnits = [];

  for (const unit of source.units ?? []) {
    if (unit.outcome === "success" && unitHasCacheableMaterial(unit, definition)) successfulUnits.push(sanitizedSuccessfulUnit(unit));
    else if (unit.outcome === "failed") retryUnits.push(retryDescriptor(unit));
    else if (unit.outcome === "success") retryUnits.push(retryDescriptor(unit, "EMPTY_SUCCESS"));
  }

  if (!successfulUnits.length) {
    return { action: "skip", reason: retryUnits.length ? "no-successful-units" : "no-executed-units", record: null, retryUnits };
  }
  return { action: "put", reason: retryUnits.length ? "partial-success" : "complete-success", record: adapterRecord(source.adapter, requestKey, successfulUnits, retryUnits, storedAtUtc), retryUnits };
}

function adapterMiss(reason, details = {}) {
  return { status: "miss", usable: false, reason, successfulUnits: [], retryUnits: [], ...details };
}

export function inspectAdapterResultRecord(record, expected, options = {}) {
  if (record == null) return adapterMiss("cache-miss");
  if (!record || typeof record !== "object" || Array.isArray(record)) return adapterMiss("record-invalid");
  const adapter = expected?.adapter;
  const requestKey = expected?.requestKey;
  let definition;
  try { definition = getAdapterDefinition(adapter); }
  catch { return adapterMiss("expected-adapter-invalid"); }
  const expectedKey = buildAdapterResultStorageKey({ adapterContractRevision: V030_ADAPTER_REGISTRY.contractRevision, requestKey });
  if (record.namespace !== V030_PERSISTENCE_NAMESPACES.adapterResults) return adapterMiss("namespace-mismatch");
  if (record.adapterContractRevision !== V030_ADAPTER_REGISTRY.contractRevision) return adapterMiss("contract-revision-mismatch");
  if (record.key !== expectedKey || record.requestKey !== requestKey || record.adapter !== adapter) return adapterMiss("semantic-scope-mismatch", { expectedKey });
  if (!Array.isArray(record.successfulUnits) || !Array.isArray(record.retryUnits)) return adapterMiss("record-invalid");

  const trigger = options.trigger ?? null;
  if (trigger && !definition.freshness.refreshTriggers.includes(trigger)) {
    throw new ContractRuntimeError("REFRESH_TRIGGER_UNKNOWN", `${trigger} is not declared for ${adapter}.`, { adapter, trigger });
  }

  const nowUtc = requireUtc(options.nowUtc ?? new Date().toISOString(), "adapter cache read time");
  if (record.expiresAtUtc && Date.parse(nowUtc) >= Date.parse(record.expiresAtUtc)) {
    return adapterMiss("ttl-expired", { staleRecord: clone(record) });
  }
  if (trigger && trigger !== RETRY_TRIGGER && !LOOKUP_ONLY_TRIGGERS.has(trigger)) {
    return adapterMiss(`refresh-trigger:${trigger}`, { staleRecord: clone(record) });
  }

  const retryUnits = clone(record.retryUnits.filter((unit) => unit.retryable !== false));
  const terminalFailures = clone(record.retryUnits.filter((unit) => unit.retryable === false));
  if (retryUnits.length) {
    return {
      status: "partial-retry",
      usable: true,
      reason: "failed-units-require-retry",
      successfulUnits: clone(record.successfulUnits),
      retryUnits,
      terminalFailures,
      record: clone(record)
    };
  }
  if (terminalFailures.length) {
    return { status: "partial-terminal", usable: true, reason: "non-retryable-units-remain-failed", successfulUnits: clone(record.successfulUnits), retryUnits: [], terminalFailures, record: clone(record) };
  }
  return { status: "hit", usable: true, reason: null, successfulUnits: clone(record.successfulUnits), retryUnits: [], terminalFailures: [], record: clone(record) };
}

export function mergeAdapterRetryResult(record, envelope, options = {}) {
  const source = requireObject(record, "existing adapter-result record");
  const execution = requireObject(envelope, "retry adapter envelope");
  if (source.adapter !== execution.adapter || source.requestKey !== execution.requestKey) {
    throw new ContractRuntimeError("RETRY_SCOPE_MISMATCH", "Retry results must retain the original adapter and parent semantic request key.");
  }
  const allowed = new Map((source.retryUnits ?? []).filter((unit) => unit.retryable !== false).map((unit) => [unit.requestKey, unit]));
  const successful = new Map((source.successfulUnits ?? []).map((unit) => [unit.requestKey, clone(unit)]));
  const remaining = new Map(allowed);
  const definition = getAdapterDefinition(source.adapter);

  for (const unit of execution.units ?? []) {
    if (!allowed.has(unit.requestKey)) {
      throw new ContractRuntimeError("RETRY_UNIT_UNEXPECTED", `Retry result is not part of the cached failed-unit set: ${unit.requestKey}.`);
    }
    if (unit.outcome === "success" && unitHasCacheableMaterial(unit, definition)) {
      successful.set(unit.requestKey, sanitizedSuccessfulUnit(unit));
      remaining.delete(unit.requestKey);
    } else if (unit.outcome === "failed") remaining.set(unit.requestKey, retryDescriptor(unit));
    else if (unit.outcome === "success") remaining.set(unit.requestKey, retryDescriptor(unit, "EMPTY_SUCCESS"));
  }

  const storedAtUtc = requireUtc(options.storedAtUtc ?? execution.completedAtUtc ?? new Date().toISOString(), "adapter-result storedAtUtc");
  return adapterRecord(source.adapter, source.requestKey, [...successful.values()], [...remaining.values()], storedAtUtc);
}

export function createV030PersistenceController(backend) {
  const storage = requireObject(backend, "persistence backend");
  for (const method of ["get", "put", "delete"]) {
    if (typeof storage[method] !== "function") throw new ContractRuntimeError("INPUT_INVALID", `Persistence backend requires ${method}(store, ...).`);
  }
  return Object.freeze({
    async saveNormalizedSnapshot(snapshot, options = {}) {
      const record = createNormalizedSnapshotRecord(snapshot, options);
      await storage.put(V030_PERSISTENCE_STORES.normalizedSnapshots, record);
      return clone(record);
    },
    async loadNormalizedSnapshot(expected, options = {}) {
      const key = buildNormalizedSnapshotStorageKey({ ...expected, schemaVersion: NORMALIZED_SCHEMA_VERSION, contractRevision: NORMALIZED_CONTRACT_REVISION });
      return inspectNormalizedSnapshotRecord(await storage.get(V030_PERSISTENCE_STORES.normalizedSnapshots, key), expected, options);
    },
    async saveAdapterResult(envelope, options = {}) {
      const prepared = prepareAdapterResultCacheWrite(envelope, options);
      if (prepared.action === "put") await storage.put(V030_PERSISTENCE_STORES.adapterResults, prepared.record);
      return clone(prepared);
    },
    async loadAdapterResult(expected, options = {}) {
      const key = buildAdapterResultStorageKey({ adapterContractRevision: V030_ADAPTER_REGISTRY.contractRevision, requestKey: expected?.requestKey });
      return inspectAdapterResultRecord(await storage.get(V030_PERSISTENCE_STORES.adapterResults, key), expected, options);
    },
    async deleteNormalizedSnapshot(expected) {
      const key = buildNormalizedSnapshotStorageKey({ ...expected, schemaVersion: NORMALIZED_SCHEMA_VERSION, contractRevision: NORMALIZED_CONTRACT_REVISION });
      await storage.delete(V030_PERSISTENCE_STORES.normalizedSnapshots, key);
    },
    async deleteAdapterResult(requestKey) {
      const key = buildAdapterResultStorageKey({ adapterContractRevision: V030_ADAPTER_REGISTRY.contractRevision, requestKey });
      await storage.delete(V030_PERSISTENCE_STORES.adapterResults, key);
    }
  });
}
