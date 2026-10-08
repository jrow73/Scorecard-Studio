/**
 * Scorecard Studio v0.3.0 normalized-model contract runtime.
 *
 * Build 004.1 intentionally has no fetch, storage, renderer, or application
 * bootstrap side effects. It is safe to import from tests and future adapters.
 */

export const NORMALIZED_SCHEMA_ID = "scorecard-studio.normalized-game";
export const NORMALIZED_SCHEMA_VERSION = 2;
export const NORMALIZED_CONTRACT_REVISION = "0.3.0-draft.2";

export const ADAPTER_IDS = Object.freeze([
  "schedule", "feed", "boxscore", "roster", "people",
  "coaches", "standings", "venue", "depthChart", "teamLogo"
]);

export const SOURCE_OUTCOMES = Object.freeze(["success", "partial", "failed", "notRequested"]);
export const AVAILABILITY_STATES = Object.freeze([
  "available", "unposted", "present-empty", "omitted", "not-requested",
  "unsupported", "not-applicable", "ambiguous", "partial", "failed", "stale"
]);
export const LINEAGE_COVERAGE = Object.freeze(["exact", "subtree"]);
export const EFFECTIVE_KINDS = Object.freeze([
  "instant", "date", "dateRange", "endOfDay", "gameState", "current", "unknown"
]);

const REQUIRED_ROOTS = Object.freeze([
  "schemaId", "schemaVersion", "contractRevision", "context", "game",
  "away", "home", "standings", "meta"
]);
const MUST_EXIST_STATES = new Set(["available", "partial", "present-empty"]);
const own = (value, key) => Object.prototype.hasOwnProperty.call(Object(value), key);

export class ContractRuntimeError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = "ContractRuntimeError";
    this.code = code;
    this.details = details;
  }
}

export class ContractValidationError extends ContractRuntimeError {
  constructor(errors) {
    super("SNAPSHOT_INVALID", `Normalized snapshot failed validation with ${errors.length} error(s).`, { errors });
    this.name = "ContractValidationError";
    this.errors = errors;
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} must be an object.`);
  }
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} must be a non-empty string.`);
  }
  return value;
}

function requireEnum(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} must be one of: ${allowed.join(", ")}.`);
  }
  return value;
}

function cloneArray(value, label) {
  if (!Array.isArray(value)) throw new ContractRuntimeError("INPUT_INVALID", `${label} must be an array.`);
  return value.map((entry) => entry && typeof entry === "object" ? { ...entry } : entry);
}

export function createEffectiveDescriptor(input = { kind: "unknown" }) {
  const source = requireObject(input, "effective");
  const result = { kind: requireEnum(source.kind, EFFECTIVE_KINDS, "effective.kind") };
  for (const key of ["instantUtc", "date", "startDate", "endDate", "cutoffDate", "gamePk", "canonicalGameState", "rawGameState"]) {
    if (own(source, key)) result[key] = source[key];
  }
  return result;
}

export function createSourceResult(input) {
  const source = requireObject(input, "source result");
  const result = {
    id: requireString(source.id, "source result id"),
    adapter: requireEnum(source.adapter, ADAPTER_IDS, "source result adapter"),
    request: { ...requireObject(source.request, "source result request") },
    scope: { ...requireObject(source.scope ?? {}, "source result scope") },
    requestedAtUtc: source.requestedAtUtc ?? null,
    retrievedAtUtc: source.retrievedAtUtc ?? null,
    effective: createEffectiveDescriptor(source.effective ?? { kind: "unknown" }),
    outcome: requireEnum(source.outcome, SOURCE_OUTCOMES, "source result outcome")
  };
  if (own(source, "response")) result.response = source.response == null ? source.response : { ...source.response };
  if (own(source, "error")) result.error = source.error == null ? null : { ...source.error };
  return result;
}

export function createLineageRecord(input) {
  const source = requireObject(input, "lineage record");
  const target = requireString(source.target, "lineage target");
  parseJsonPointer(target);
  if (target === "/meta" || target.startsWith("/meta/")) {
    throw new ContractRuntimeError("LINEAGE_TARGET_INVALID", "Lineage cannot target snapshot metadata.", { target });
  }

  return {
    id: requireString(source.id, "lineage id"),
    target,
    coverage: requireEnum(source.coverage, LINEAGE_COVERAGE, "lineage coverage"),
    state: requireEnum(source.state, AVAILABILITY_STATES, "lineage state"),
    sourceResultRefs: cloneArray(source.sourceResultRefs ?? [], "lineage sourceResultRefs"),
    selectedSourceResultRef: source.selectedSourceResultRef ?? null,
    sourcePath: source.sourcePath ?? null,
    effective: source.effective == null ? null : createEffectiveDescriptor(source.effective),
    selectionReason: source.selectionReason ?? null,
    fallbackUsed: source.fallbackUsed === true,
    rejectedCandidates: cloneArray(source.rejectedCandidates ?? [], "lineage rejectedCandidates"),
    transformations: cloneArray(source.transformations ?? [], "lineage transformations"),
    derivationInputs: cloneArray(source.derivationInputs ?? [], "lineage derivationInputs")
  };
}

export function createSnapshotMetadata(input) {
  const source = requireObject(input, "snapshot metadata");
  return {
    id: requireString(source.id, "snapshot id"),
    createdAtUtc: requireString(source.createdAtUtc, "snapshot createdAtUtc"),
    producer: { ...requireObject(source.producer, "snapshot producer") },
    fixtureKind: source.fixtureKind ?? null
  };
}

export function createNormalizedSnapshot(input, options = {}) {
  const source = requireObject(input, "normalized snapshot");
  const snapshot = {
    schemaId: NORMALIZED_SCHEMA_ID,
    schemaVersion: NORMALIZED_SCHEMA_VERSION,
    contractRevision: source.contractRevision ?? NORMALIZED_CONTRACT_REVISION,
    context: { ...requireObject(source.context, "snapshot context") },
    game: { ...requireObject(source.game, "snapshot game") },
    away: { ...requireObject(source.away, "snapshot away") },
    home: { ...requireObject(source.home, "snapshot home") },
    standings: { ...requireObject(source.standings, "snapshot standings") },
    meta: {
      snapshot: createSnapshotMetadata(source.meta?.snapshot),
      sourceResults: cloneArray(source.meta?.sourceResults ?? [], "snapshot sourceResults").map(createSourceResult),
      lineage: cloneArray(source.meta?.lineage ?? [], "snapshot lineage").map(createLineageRecord)
    }
  };
  if (options.validate !== false) assertValidNormalizedSnapshot(snapshot, options);
  return snapshot;
}

export function escapeJsonPointerToken(token) {
  return String(token).replaceAll("~", "~0").replaceAll("/", "~1");
}

export function unescapeJsonPointerToken(token) {
  if (/~(?:[^01]|$)/.test(token)) {
    throw new ContractRuntimeError("POINTER_INVALID", `Invalid JSON Pointer escape in token: ${token}`);
  }
  return token.replaceAll("~1", "/").replaceAll("~0", "~");
}

export function parseJsonPointer(pointer) {
  if (typeof pointer !== "string" || (pointer !== "" && !pointer.startsWith("/"))) {
    throw new ContractRuntimeError("POINTER_INVALID", "JSON Pointer must be empty or begin with '/'.", { pointer });
  }
  if (pointer === "") return [];
  return pointer.slice(1).split("/").map(unescapeJsonPointerToken);
}

export function resolveJsonPointer(root, pointer) {
  const tokens = parseJsonPointer(pointer);
  let value = root;
  for (const token of tokens) {
    if (value === null || value === undefined || !own(value, token)) {
      return { found: false, value: undefined, pointer, missingToken: token };
    }
    value = value[token];
  }
  return { found: true, value, pointer, missingToken: null };
}

function pointerIsWithin(target, ancestor) {
  return target === ancestor || target.startsWith(`${ancestor}/`);
}

export function findEffectiveLineage(records, target) {
  parseJsonPointer(target);
  if (!Array.isArray(records)) throw new ContractRuntimeError("INPUT_INVALID", "Lineage records must be an array.");

  const exact = records.filter((entry) => entry.coverage === "exact" && entry.target === target);
  if (exact.length > 1) {
    throw new ContractRuntimeError("LINEAGE_AMBIGUOUS", `Multiple exact lineage records target ${target}.`, { target, ids: exact.map((entry) => entry.id) });
  }
  if (exact.length === 1) return exact[0];

  const ancestors = records
    .filter((entry) => entry.coverage === "subtree" && pointerIsWithin(target, entry.target))
    .sort((left, right) => right.target.length - left.target.length);
  if (!ancestors.length) return null;
  const mostSpecific = ancestors[0].target.length;
  const winners = ancestors.filter((entry) => entry.target.length === mostSpecific);
  if (winners.length > 1) {
    throw new ContractRuntimeError("LINEAGE_AMBIGUOUS", `Multiple equally specific lineage records cover ${target}.`, { target, ids: winners.map((entry) => entry.id) });
  }
  return winners[0];
}

function containsProhibitedGamePack(value) {
  if (typeof value === "string") return /gamePack/i.test(value);
  if (Array.isArray(value)) return value.some(containsProhibitedGamePack);
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, child]) => /gamePack/i.test(key) || containsProhibitedGamePack(child));
  }
  return false;
}

export function validateNormalizedSnapshot(snapshot, options = {}) {
  const errors = [];
  const add = (code, path, message, details = null) => errors.push({ code, path, message, details });

  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    add("ROOT_INVALID", "", "Snapshot must be an object.");
    return { valid: false, errors };
  }
  for (const key of REQUIRED_ROOTS) if (!own(snapshot, key)) add("ROOT_REQUIRED", `/${key}`, `Missing required root ${key}.`);
  if (snapshot.schemaId !== NORMALIZED_SCHEMA_ID) add("SCHEMA_ID", "/schemaId", `Expected ${NORMALIZED_SCHEMA_ID}.`);
  if (snapshot.schemaVersion !== NORMALIZED_SCHEMA_VERSION) add("SCHEMA_VERSION", "/schemaVersion", `Expected schema version ${NORMALIZED_SCHEMA_VERSION}.`);
  if (typeof snapshot.contractRevision !== "string" || !snapshot.contractRevision) add("CONTRACT_REVISION", "/contractRevision", "Contract revision is required.");
  if (containsProhibitedGamePack(snapshot)) add("PROHIBITED_SOURCE_LABEL", "", "Schema version 2 must not contain the gamePack label.");

  const sourceResults = Array.isArray(snapshot.meta?.sourceResults) ? snapshot.meta.sourceResults : [];
  const lineage = Array.isArray(snapshot.meta?.lineage) ? snapshot.meta.lineage : [];
  if (!Array.isArray(snapshot.meta?.sourceResults)) add("SOURCE_RESULTS_TYPE", "/meta/sourceResults", "sourceResults must be an array.");
  if (!Array.isArray(snapshot.meta?.lineage)) add("LINEAGE_TYPE", "/meta/lineage", "lineage must be an array.");

  const sourceIds = new Set();
  for (let index = 0; index < sourceResults.length; index += 1) {
    const entry = sourceResults[index];
    const entryPath = `/meta/sourceResults/${index}`;
    if (!entry || typeof entry !== "object") {
      add("SOURCE_RESULT_INVALID", entryPath, "Source result must be an object.");
      continue;
    }
    if (sourceIds.has(entry.id)) add("SOURCE_ID_DUPLICATE", `${entryPath}/id`, `Duplicate source-result ID ${entry.id}.`);
    else sourceIds.add(entry.id);
    if (!ADAPTER_IDS.includes(entry.adapter)) add("ADAPTER_UNKNOWN", `${entryPath}/adapter`, `Unknown adapter ${entry.adapter}.`);
    if (!SOURCE_OUTCOMES.includes(entry.outcome)) add("SOURCE_OUTCOME_UNKNOWN", `${entryPath}/outcome`, `Unknown source outcome ${entry.outcome}.`);
    if (!EFFECTIVE_KINDS.includes(entry.effective?.kind)) add("EFFECTIVE_KIND_UNKNOWN", `${entryPath}/effective/kind`, "Unknown effective descriptor kind.");
  }

  const lineageIds = new Set();
  const lineageTargets = new Set();
  for (let index = 0; index < lineage.length; index += 1) {
    const entry = lineage[index];
    const entryPath = `/meta/lineage/${index}`;
    if (!entry || typeof entry !== "object") {
      add("LINEAGE_INVALID", entryPath, "Lineage record must be an object.");
      continue;
    }
    if (lineageIds.has(entry.id)) add("LINEAGE_ID_DUPLICATE", `${entryPath}/id`, `Duplicate lineage ID ${entry.id}.`);
    else lineageIds.add(entry.id);
    const targetKey = `${entry.coverage}:${entry.target}`;
    if (lineageTargets.has(targetKey)) add("LINEAGE_TARGET_DUPLICATE", `${entryPath}/target`, `Duplicate lineage target/coverage ${targetKey}.`);
    else lineageTargets.add(targetKey);
    if (!LINEAGE_COVERAGE.includes(entry.coverage)) add("LINEAGE_COVERAGE_UNKNOWN", `${entryPath}/coverage`, `Unknown lineage coverage ${entry.coverage}.`);
    if (!AVAILABILITY_STATES.includes(entry.state)) add("AVAILABILITY_UNKNOWN", `${entryPath}/state`, `Unknown availability state ${entry.state}.`);

    try {
      parseJsonPointer(entry.target);
      if (entry.target === "/meta" || entry.target.startsWith("/meta/")) add("LINEAGE_TARGET_INVALID", `${entryPath}/target`, "Lineage cannot target metadata.");
      if (MUST_EXIST_STATES.has(entry.state) && !resolveJsonPointer(snapshot, entry.target).found) {
        add("LINEAGE_TARGET_MISSING", `${entryPath}/target`, `${entry.state} target does not exist: ${entry.target}.`);
      }
    } catch (error) {
      add("POINTER_INVALID", `${entryPath}/target`, error.message);
    }

    for (const ref of entry.sourceResultRefs ?? []) {
      if (!sourceIds.has(ref)) add("SOURCE_REF_DANGLING", `${entryPath}/sourceResultRefs`, `Unknown source-result reference ${ref}.`);
    }
    if (entry.selectedSourceResultRef != null) {
      if (!sourceIds.has(entry.selectedSourceResultRef)) add("SELECTED_SOURCE_DANGLING", `${entryPath}/selectedSourceResultRef`, `Unknown selected source ${entry.selectedSourceResultRef}.`);
      if (!(entry.sourceResultRefs ?? []).includes(entry.selectedSourceResultRef)) add("SELECTED_SOURCE_NOT_CANDIDATE", `${entryPath}/selectedSourceResultRef`, "Selected source must also appear in sourceResultRefs.");
    }
    for (const rejected of entry.rejectedCandidates ?? []) {
      if (!sourceIds.has(rejected.sourceResultRef)) add("REJECTED_SOURCE_DANGLING", `${entryPath}/rejectedCandidates`, `Unknown rejected source ${rejected.sourceResultRef}.`);
    }
  }

  for (const target of options.requiredTargets ?? []) {
    try {
      if (!findEffectiveLineage(lineage, target)) add("LINEAGE_REQUIRED", target, `No lineage resolves required target ${target}.`);
    } catch (error) {
      add(error.code ?? "LINEAGE_AMBIGUOUS", target, error.message, error.details ?? null);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidNormalizedSnapshot(snapshot, options = {}) {
  const result = validateNormalizedSnapshot(snapshot, options);
  if (!result.valid) throw new ContractValidationError(result.errors);
  return snapshot;
}
