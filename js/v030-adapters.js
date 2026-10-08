/**
 * Scorecard Studio v0.3.0 adapter contracts and request planning.
 *
 * Build 004.2 is declarative and side-effect free. It does not execute HTTP
 * requests or replace the v0.2.0 orchestration path.
 */

import {
  ADAPTER_IDS,
  NORMALIZED_CONTRACT_REVISION,
  ContractRuntimeError,
  createEffectiveDescriptor
} from "./v030-contract.js";
import { ADAPTER_DEFINITIONS, V030_ADAPTER_REGISTRY } from "./v030-adapter-definitions.js";

export { ADAPTER_DEFINITIONS, V030_ADAPTER_REGISTRY };

export const PLANNER_CAPABILITIES = Object.freeze([
  "corePregame", "officials", "extendedVenue", "staff", "pitcherRoles",
  "currentTeamLogos", "game2Overlay", "standingsGroups"
]);

export const PLAN_STATUSES = Object.freeze([
  "planned", "pending-input", "satisfied", "fallback", "suppressed", "blocked"
]);

const CAPABILITY_ROUTES = Object.freeze({
  corePregame: Object.freeze([
    Object.freeze({ adapter: "schedule", requirement: "required", stage: "selection" }),
    Object.freeze({ adapter: "roster", requirement: "required", stage: "membership" }),
    Object.freeze({ adapter: "people", requirement: "required", stage: "discovered-identities" }),
    Object.freeze({ adapter: "standings", requirement: "required", stage: "scoped-context" })
  ]),
  officials: Object.freeze([Object.freeze({ adapter: "feed", requirement: "lazy", stage: "consumer-demand" })]),
  extendedVenue: Object.freeze([Object.freeze({ adapter: "venue", requirement: "conditional", stage: "consumer-demand" })]),
  staff: Object.freeze([Object.freeze({ adapter: "coaches", requirement: "lazy", stage: "consumer-demand" })]),
  pitcherRoles: Object.freeze([Object.freeze({ adapter: "depthChart", requirement: "optional", stage: "annotation" })]),
  currentTeamLogos: Object.freeze([Object.freeze({ adapter: "teamLogo", requirement: "optional", stage: "asset" })]),
  game2Overlay: Object.freeze([Object.freeze({ adapter: "boxscore", requirement: "conditional", stage: "earlier-game-final" })]),
  standingsGroups: Object.freeze([Object.freeze({ adapter: "standings", requirement: "lazy", stage: "consumer-demand" })])
});

const own = (value, key) => Object.prototype.hasOwnProperty.call(Object(value), key);

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

function canonicalScalar(value) {
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function validateDate(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} must be a date-only YYYY-MM-DD string.`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} is not a valid calendar date.`);
  }
}

function validateUtcTimestamp(value, label) {
  if (typeof value !== "string" || !/Z$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new ContractRuntimeError("INPUT_INVALID", `${label} must be a valid UTC timestamp ending in Z.`);
  }
}

function validateScalar(field, value, label) {
  switch (field.type) {
    case "string":
      requireString(value, label);
      break;
    case "integer":
      if (!Number.isInteger(value)) throw new ContractRuntimeError("INPUT_INVALID", `${label} must be an integer.`);
      if (field.minimum != null && value < field.minimum) throw new ContractRuntimeError("INPUT_INVALID", `${label} must be at least ${field.minimum}.`);
      break;
    case "boolean":
      if (typeof value !== "boolean") throw new ContractRuntimeError("INPUT_INVALID", `${label} must be a boolean.`);
      break;
    case "date":
      validateDate(value, label);
      break;
    case "utcTimestamp":
      validateUtcTimestamp(value, label);
      break;
    case "enum":
      if (!field.allowed?.includes(value)) throw new ContractRuntimeError("INPUT_INVALID", `${label} must be one of: ${(field.allowed ?? []).join(", ")}.`);
      break;
    default:
      throw new ContractRuntimeError("INPUT_INVALID", `${label} has unsupported declared type ${field.type}.`);
  }
}

function canonicalSet(field, value, label) {
  if (!Array.isArray(value)) throw new ContractRuntimeError("INPUT_INVALID", `${label} must be an array.`);
  if (field.type === "integerSet") {
    for (const entry of value) if (!Number.isInteger(entry)) throw new ContractRuntimeError("INPUT_INVALID", `${label} entries must be integers.`);
    return [...new Set(value)].sort((left, right) => left - right);
  }
  for (const entry of value) requireString(entry, `${label} entry`);
  return [...new Set(value)].sort((left, right) => left.localeCompare(right));
}

export function getAdapterDefinition(adapterId) {
  if (!ADAPTER_IDS.includes(adapterId)) throw new ContractRuntimeError("ADAPTER_UNKNOWN", `Unknown adapter: ${adapterId}.`, { adapterId });
  const definition = ADAPTER_DEFINITIONS.find((entry) => entry.id === adapterId);
  if (!definition) throw new ContractRuntimeError("ADAPTER_UNKNOWN", `Missing adapter declaration: ${adapterId}.`, { adapterId });
  return definition;
}

export function materializeAdapterInput(adapterId, supplied = {}) {
  const adapter = getAdapterDefinition(adapterId);
  const input = requireObject(supplied, `${adapterId} input`);
  const known = new Set(adapter.inputFields.map((field) => field.name));
  for (const key of Object.keys(input)) {
    if (!known.has(key)) throw new ContractRuntimeError("INPUT_UNKNOWN", `${adapterId} input contains an unkeyed field: ${key}.`, { adapterId, field: key });
  }

  const output = {};
  const fields = [...adapter.inputFields].sort((left, right) => left.keyOrder - right.keyOrder);
  for (const field of fields) {
    let value = input[field.name];
    if (value === undefined && own(field, "default")) value = field.default;
    if (value === undefined) {
      if (field.required) throw new ContractRuntimeError("INPUT_REQUIRED", `${adapterId} input requires ${field.name}.`, { adapterId, field: field.name });
      continue;
    }
    if (field.type === "stringSet" || field.type === "integerSet") value = canonicalSet(field, value, `${adapterId}.${field.name}`);
    else validateScalar(field, value, `${adapterId}.${field.name}`);
    output[field.name] = value;
  }
  return output;
}

export function buildSemanticRequestKey(adapterId, supplied = {}) {
  const adapter = getAdapterDefinition(adapterId);
  const input = materializeAdapterInput(adapterId, supplied);
  const parts = [adapter.id, `v${V030_ADAPTER_REGISTRY.requestKeyFormat.version}`];
  const fields = [...adapter.inputFields].sort((left, right) => left.keyOrder - right.keyOrder);
  for (const field of fields) {
    if (!adapter.keyFields.includes(field.name) || input[field.name] === undefined) continue;
    const raw = Array.isArray(input[field.name])
      ? input[field.name].map(canonicalScalar).join(",")
      : canonicalScalar(input[field.name]);
    parts.push(`${field.name}=${encodeURIComponent(raw)}`);
  }
  return parts.join(V030_ADAPTER_REGISTRY.requestKeyFormat.separator);
}

function capabilitySpecificity(match) {
  if (match.default) return -1;
  return Object.keys(match).filter((key) => key !== "default").length;
}

function capabilityMatches(match, context) {
  if (match.default) return true;
  if (match.sportIds && !match.sportIds.includes(context.sportId)) return false;
  if (match.gameTypes && !match.gameTypes.includes(context.gameType)) return false;
  if (match.competitionSegments && !match.competitionSegments.includes(context.competitionSegment)) return false;
  if (match.concepts && !match.concepts.includes(context.concept)) return false;
  return true;
}

export function resolveAdapterCapability(adapterId, context = {}) {
  const adapter = getAdapterDefinition(adapterId);
  const matches = adapter.capabilityRules
    .filter((rule) => capabilityMatches(rule.match, context))
    .map((rule) => ({ rule, specificity: capabilitySpecificity(rule.match) }))
    .sort((left, right) => right.specificity - left.specificity);
  if (!matches.length) throw new ContractRuntimeError("CAPABILITY_DEFAULT_MISSING", `${adapterId} has no matching or default capability rule.`);
  const winners = matches.filter((entry) => entry.specificity === matches[0].specificity);
  if (winners.length !== 1) {
    throw new ContractRuntimeError("CAPABILITY_AMBIGUOUS", `${adapterId} has equal-specificity capability rules.`, { adapterId, rules: winners.map((entry) => entry.rule.id) });
  }
  return { adapterId, ...winners[0].rule, specificity: winners[0].specificity };
}

function suppliedInputs(requests, adapterId) {
  const value = requests?.[adapterId];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function specialCapabilityResult(capability, context) {
  if (capability === "extendedVenue" && context.hasUsableFeedVenue === true) {
    return { capability, adapter: "feed", requirement: "conditional", stage: "already-loaded", status: "satisfied", reason: "Usable Feed venue detail is already loaded." };
  }
  if (capability === "game2Overlay" && context.earlierSameDayGameFinal !== true) {
    return { capability, adapter: "boxscore", requirement: "conditional", stage: "earlier-game-final", status: "suppressed", reason: "Earlier same-day game is not confirmed Final." };
  }
  if (capability === "standingsGroups" && context.hasCoreStandingsGroups === true) {
    return { capability, adapter: "standings", requirement: "lazy", stage: "already-loaded", status: "satisfied", reason: "Core scoped Standings response already contains the requested groups." };
  }
  return null;
}

export function planAdapterRequests({ capabilities, context = {}, requests = {} }) {
  if (!Array.isArray(capabilities) || capabilities.length === 0) {
    throw new ContractRuntimeError("INPUT_INVALID", "Planner capabilities must be a non-empty array.");
  }
  const uniqueCapabilities = [...new Set(capabilities)];
  for (const capability of uniqueCapabilities) {
    if (!PLANNER_CAPABILITIES.includes(capability)) throw new ContractRuntimeError("CAPABILITY_UNKNOWN", `Unknown planner capability: ${capability}.`, { capability });
  }

  const entries = [];
  const requestUnits = new Map();
  for (const capability of uniqueCapabilities) {
    const special = specialCapabilityResult(capability, context);
    if (special) {
      entries.push(special);
      continue;
    }
    for (const route of CAPABILITY_ROUTES[capability]) {
      const resolved = resolveAdapterCapability(route.adapter, context);
      if (resolved.state === "absent") {
        entries.push({ capability, ...route, status: "fallback", capabilityState: resolved.state, capabilityRule: resolved.id, reason: resolved.fallback });
        continue;
      }
      if (resolved.state === "untested") {
        entries.push({ capability, ...route, status: "blocked", capabilityState: resolved.state, capabilityRule: resolved.id, reason: resolved.fallback ?? "Context is untested; automatic request is blocked." });
        continue;
      }
      const inputs = suppliedInputs(requests, route.adapter);
      if (!inputs.length) {
        entries.push({ capability, ...route, status: "pending-input", capabilityState: resolved.state, capabilityRule: resolved.id, reason: "Required semantic input is not available at this planning stage." });
        continue;
      }
      for (const supplied of inputs) {
        const input = materializeAdapterInput(route.adapter, supplied);
        const requestKey = buildSemanticRequestKey(route.adapter, input);
        const entry = { capability, ...route, status: "planned", capabilityState: resolved.state, capabilityRule: resolved.id, input, requestKey, reason: null };
        entries.push(entry);
        if (!requestUnits.has(requestKey)) requestUnits.set(requestKey, { adapter: route.adapter, input, requestKey, capabilities: [] });
        const unit = requestUnits.get(requestKey);
        if (!unit.capabilities.includes(capability)) unit.capabilities.push(capability);
      }
    }
  }
  return { capabilities: uniqueCapabilities, entries, requestUnits: [...requestUnits.values()] };
}

export function partitionPeopleIds(personIds, chunkSize = 100) {
  if (!Array.isArray(personIds)) throw new ContractRuntimeError("INPUT_INVALID", "personIds must be an array.");
  if (!Number.isInteger(chunkSize) || chunkSize < 1) throw new ContractRuntimeError("INPUT_INVALID", "chunkSize must be a positive integer.");
  for (const id of personIds) if (!Number.isInteger(id)) throw new ContractRuntimeError("INPUT_INVALID", "Every person ID must be an integer.");
  const canonical = [...new Set(personIds)].sort((left, right) => left - right);
  const chunks = [];
  for (let index = 0; index < canonical.length; index += chunkSize) chunks.push(canonical.slice(index, index + chunkSize));
  return chunks;
}

export function planPeopleChunks(supplied) {
  const input = materializeAdapterInput("people", supplied);
  const parentRequestKey = buildSemanticRequestKey("people", input);
  const groups = partitionPeopleIds(input.personIds, input.chunkSize);
  const chunks = groups.map((personIds, index) => {
    const chunkInput = { ...input, personIds };
    return {
      index,
      unitKey: `people:${index + 1}/${groups.length}:${personIds[0]}-${personIds.at(-1)}`,
      personIds,
      input: chunkInput,
      requestKey: buildSemanticRequestKey("people", chunkInput)
    };
  });
  return { input, parentRequestKey, chunks };
}

export function createAdapterUnitResult(input) {
  const source = requireObject(input, "adapter unit result");
  const outcome = source.outcome;
  if (!["success", "failed", "notRequested"].includes(outcome)) {
    throw new ContractRuntimeError("INPUT_INVALID", "Adapter unit outcome must be success, failed, or notRequested.");
  }
  const result = {
    unitKey: requireString(source.unitKey, "adapter unit key"),
    requestKey: requireString(source.requestKey, "adapter unit request key"),
    outcome,
    requestedAtUtc: source.requestedAtUtc ?? null,
    retrievedAtUtc: source.retrievedAtUtc ?? null,
    candidates: Array.isArray(source.candidates) ? source.candidates.map((candidate) => ({ ...candidate })) : []
  };
  if (Array.isArray(source.personIds)) result.personIds = [...source.personIds];
  if (own(source, "response")) result.response = source.response == null ? null : { ...source.response };
  if (own(source, "error")) result.error = source.error == null ? null : { ...source.error };
  return result;
}

function envelopeOutcome(units) {
  if (!units.length || units.every((unit) => unit.outcome === "notRequested")) return "notRequested";
  if (units.some((unit) => unit.outcome === "notRequested")) {
    throw new ContractRuntimeError("INPUT_INVALID", "Executed and notRequested units cannot share one adapter envelope.");
  }
  const successes = units.filter((unit) => unit.outcome === "success").length;
  const failures = units.filter((unit) => unit.outcome === "failed").length;
  if (successes && failures) return "partial";
  return failures ? "failed" : "success";
}

export function createAdapterExecutionEnvelope(input) {
  const source = requireObject(input, "adapter execution envelope");
  const adapter = requireString(source.adapter, "adapter envelope adapter");
  const definition = getAdapterDefinition(adapter);
  const materializedInput = materializeAdapterInput(adapter, source.input ?? {});
  const units = (source.units ?? []).map(createAdapterUnitResult);
  for (const unit of units) {
    if (unit.outcome === "failed") {
      if (!unit.error?.code) throw new ContractRuntimeError("INPUT_INVALID", `${unit.unitKey} failed without an error code.`);
      if (!definition.errorCodes.includes(unit.error.code)) {
        throw new ContractRuntimeError("INPUT_INVALID", `${unit.unitKey} uses undeclared ${adapter} error code ${unit.error.code}.`);
      }
    }
    if (unit.outcome === "success" && unit.error != null) {
      throw new ContractRuntimeError("INPUT_INVALID", `${unit.unitKey} cannot be successful and contain an error.`);
    }
  }
  const outcome = envelopeOutcome(units);
  return {
    contractRevision: NORMALIZED_CONTRACT_REVISION,
    operationId: requireString(source.operationId, "adapter operation ID"),
    adapter,
    input: materializedInput,
    requestKey: source.requestKey ?? buildSemanticRequestKey(adapter, materializedInput),
    startedAtUtc: source.startedAtUtc ?? null,
    completedAtUtc: source.completedAtUtc ?? null,
    outcome,
    effective: createEffectiveDescriptor(source.effective ?? { kind: "unknown" }),
    units,
    candidates: units.filter((unit) => unit.outcome === "success").flatMap((unit) => unit.candidates),
    failures: units.filter((unit) => unit.outcome === "failed").map((unit) => ({ unitKey: unit.unitKey, requestKey: unit.requestKey, error: unit.error ?? null }))
  };
}

export function mergePeopleChunkUnits(units) {
  const normalized = units.map(createAdapterUnitResult);
  const outcome = envelopeOutcome(normalized);
  return {
    outcome,
    candidates: normalized.filter((unit) => unit.outcome === "success").flatMap((unit) => unit.candidates),
    failedPeople: normalized
      .filter((unit) => unit.outcome === "failed")
      .flatMap((unit) => unit.personIds ?? [])
      .map((personId) => ({ personId, state: "failed", unitKey: normalized.find((unit) => unit.personIds?.includes(personId))?.unitKey ?? null }))
  };
}
