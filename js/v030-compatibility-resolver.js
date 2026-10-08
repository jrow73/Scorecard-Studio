/**
 * Scorecard Studio v0.3.0 schema-v2 -> v0.2.0 field compatibility resolver.
 *
 * Build 004.6 is side-effect free. It does not load/save layouts or connect to
 * app bootstrap; consumers explicitly pass a normalized snapshot and selector.
 */

import { findEffectiveLineage, resolveJsonPointer } from "./v030-contract.js?v=030b0054";
import { COMPATIBILITY_ALIASES, COMPATIBILITY_FIELDS, V030_COMPATIBILITY_DEFINITIONS } from "./v030-compatibility-definitions.js?v=030b0054";

export { COMPATIBILITY_ALIASES, COMPATIBILITY_FIELDS, V030_COMPATIBILITY_DEFINITIONS };

const byId = new Map(COMPATIBILITY_FIELDS.map((entry) => [entry.fieldId, entry]));
const aliases = new Map(COMPATIBILITY_ALIASES.map((entry) => [entry.alias, entry.canonical]));

export const ADDITIONAL_STARTER_DISPLAY_DEFAULT = false;

export function canonicalCompatibilityFieldId(fieldId) {
  return aliases.get(String(fieldId ?? "")) ?? String(fieldId ?? "");
}

export function getCompatibilityDefinition(fieldId) {
  return byId.get(canonicalCompatibilityFieldId(fieldId)) ?? null;
}

export function compatibilityCapabilities(fieldIds) {
  const capabilities = new Set();
  for (const fieldId of fieldIds ?? []) for (const value of getCompatibilityDefinition(fieldId)?.v2.capabilityRequirements ?? []) capabilities.add(value);
  return capabilities;
}

function pointer(path) {
  if (!path) return null;
  return `/${String(path).split(".").map((token) => token.replaceAll("~", "~0").replaceAll("/", "~1")).join("/")}`;
}

function readPath(root, path) {
  if (!path) return { found: false, value: undefined };
  return resolveJsonPointer(root, pointer(path));
}

function lineageAt(snapshot, target) {
  if (!target) return null;
  return findEffectiveLineage(snapshot?.meta?.lineage ?? [], target);
}

function contextualLineageAt(snapshot, target) {
  const effective = lineageAt(snapshot, target);
  const exactAncestor = (snapshot?.meta?.lineage ?? [])
    .filter((entry) => entry.coverage === "exact" && (target === entry.target || target.startsWith(`${entry.target}/`)))
    .sort((left, right) => right.target.length - left.target.length)[0] ?? null;
  if (!exactAncestor) return effective;
  if (!effective || exactAncestor.target.length >= effective.target.length) return exactAncestor;
  return effective;
}

function availableValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function stateFor(snapshot, target, found, value) {
  const lineage = contextualLineageAt(snapshot, target);
  if (found && availableValue(value)) return { state: "available", availability: lineage?.state ?? "available", lineage };
  return { state: lineage?.state ?? "omitted", availability: lineage?.state ?? "omitted", lineage };
}

function result(definition, requestedFieldId, value, state, extras = {}) {
  return {
    fieldId: definition?.fieldId ?? canonicalCompatibilityFieldId(requestedFieldId),
    requestedFieldId: String(requestedFieldId ?? ""),
    supported: Boolean(definition),
    disposition: definition?.v2.disposition ?? "unsupported",
    cardinality: definition?.v1.cardinality ?? "single",
    value: state === "available" || state === "partial" ? value : null,
    state,
    availability: extras.availability ?? state,
    reason: extras.reason ?? "",
    lineage: extras.lineage ?? null,
    capabilityRequirements: [...(definition?.v2.capabilityRequirements ?? [])],
    formatSource: extras.formatSource ?? null,
    row: extras.row ?? null,
    rowIndex: extras.rowIndex ?? null
  };
}

function unsupported(fieldId) {
  return result(null, fieldId, null, "unsupported", { reason: `Unsupported field: ${fieldId}` });
}

function uniquePeople(rows) {
  const output = [];
  const seen = new Set();
  for (const row of rows) {
    const id = row?.player?.id;
    const key = id == null ? `missing:${output.length}` : `id:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(row);
  }
  return output;
}

function legacyBullpenEntries(snapshot, side) {
  if (!["away", "home"].includes(side)) return [];
  const output = [];
  const seen = new Set();
  for (const sourceCollection of ["bullpen", "additionalStarters"]) {
    const rows = Array.isArray(snapshot?.[side]?.[sourceCollection]) ? snapshot[side][sourceCollection] : [];
    rows.forEach((row, sourceIndex) => {
      const id = row?.player?.id;
      const key = id == null ? `${sourceCollection}:${sourceIndex}` : `id:${id}`;
      if (seen.has(key)) return;
      seen.add(key);
      output.push({ row, sourceCollection, sourceIndex });
    });
  }
  return output;
}

export function getLegacyBullpenRows(snapshot, side) {
  return legacyBullpenEntries(snapshot, side).map((entry) => entry.row);
}

export function getPitcherDisplayRows(snapshot, side, options = {}) {
  if (!['away', 'home'].includes(side)) return [];
  const bullpen = Array.isArray(snapshot?.[side]?.bullpen) ? snapshot[side].bullpen : [];
  if (options.includeAdditionalStarters !== true) return [...bullpen];
  return uniquePeople([...bullpen, ...(Array.isArray(snapshot?.[side]?.additionalStarters) ? snapshot[side].additionalStarters : [])]);
}

function rowsForDefinition(snapshot, definition) {
  const projection = definition.v2.projection;
  if (projection?.startsWith("legacy-bullpen")) return getLegacyBullpenRows(snapshot, definition.fieldId.startsWith("away.") ? "away" : "home");
  const collection = definition.v2.collection;
  const value = collection ? readPath(snapshot, collection) : { found: false, value: null };
  return Array.isArray(value.value) ? value.value : [];
}

export function getCompatibilityCollectionRows(snapshot, fieldOrCollection) {
  const definition = getCompatibilityDefinition(fieldOrCollection)
    ?? COMPATIBILITY_FIELDS.find((entry) => entry.v1.collection === fieldOrCollection && entry.v1.cardinality === "repeated");
  return definition ? rowsForDefinition(snapshot, definition) : [];
}

function canonicalRoleKey(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return "";
  if (text.includes("home") && text.includes("plate")) return "HP";
  if (text.includes("first")) return "1B";
  if (text.includes("second")) return "2B";
  if (text.includes("third")) return "3B";
  if (text.includes("left") && text.includes("field")) return "LF";
  if (text.includes("right") && text.includes("field")) return "RF";
  if (text.includes("replay")) return "REPLAY";
  return text.toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function rowRole(definition, row) {
  if (definition.v2.collection === "game.umpires.crew") return row?.role;
  if (definition.v2.collection?.endsWith("lineup.slots")) return row?.position?.abbreviation;
  return row?.position?.roleLabel ?? row?.position?.abbreviation;
}

function selectRow(rows, definition, selector) {
  if (selector?.role) {
    const wanted = canonicalRoleKey(selector.role);
    const index = rows.findIndex((row) => canonicalRoleKey(rowRole(definition, row)) === wanted);
    return index < 0 ? { row: null, index: null, reason: `Collection role ${selector.role} is not available.` } : { row: rows[index], index, reason: "" };
  }
  const slotValue = selector?.slot ?? (selector?.rowIndex != null ? Number(selector.rowIndex) + 1 : undefined);
  const slot = Number(slotValue);
  if (!Number.isInteger(slot) || slot < 1) return { row: null, index: null, reason: "Repeated field requires a positive slot selector or role selector." };
  return rows[slot - 1] ? { row: rows[slot - 1], index: slot - 1, reason: "" } : { row: null, index: slot - 1, reason: `Collection slot ${slot} is not available.` };
}

function collectionTarget(definition, rowIndex, rowPath = null, legacyEntry = null) {
  let collection = definition.v2.collection;
  if (!collection && definition.v2.projection?.startsWith("legacy-bullpen")) {
    const side = definition.fieldId.startsWith("away.") ? "away" : "home";
    collection = `${side}.${legacyEntry?.sourceCollection ?? "bullpen"}`;
    rowIndex = legacyEntry?.sourceIndex ?? rowIndex;
  }
  return pointer(`${collection}.${rowIndex}${rowPath ? `.${rowPath}` : ""}`);
}

function resolveAtomicPath(snapshot, definition, requestedFieldId) {
  const target = pointer(definition.v2.path);
  const resolved = resolveJsonPointer(snapshot, target);
  const state = stateFor(snapshot, target, resolved.found, resolved.value);
  const formatSourcePath = definition.v2.path?.endsWith(".player.name") ? definition.v2.path.slice(0, -5) : null;
  return result(definition, requestedFieldId, resolved.value, availableValue(resolved.value) ? "available" : state.state, {
    availability: state.availability,
    lineage: state.lineage,
    reason: availableValue(resolved.value) ? "" : "Value is not available.",
    formatSource: formatSourcePath ? readPath(snapshot, formatSourcePath).value ?? null : null
  });
}

function resolveRepeated(snapshot, definition, requestedFieldId, selector) {
  const isLegacyBullpen = definition.v2.projection?.startsWith("legacy-bullpen");
  const side = definition.fieldId.startsWith("away.") ? "away" : "home";
  const legacyEntries = isLegacyBullpen ? legacyBullpenEntries(snapshot, side) : null;
  const rows = legacyEntries ? legacyEntries.map((entry) => entry.row) : rowsForDefinition(snapshot, definition);
  const selected = selectRow(rows, definition, selector);
  if (!selected.row) {
    const collectionPath = definition.v2.collection ?? `${definition.fieldId.startsWith("away.") ? "away" : "home"}.bullpen`;
    const lineage = lineageAt(snapshot, pointer(collectionPath));
    return result(definition, requestedFieldId, null, selected.reason.startsWith("Repeated field requires") ? "unsupported" : (lineage?.state ?? "omitted"), {
      availability: lineage?.state ?? "omitted", lineage, reason: selected.reason, rowIndex: selected.index
    });
  }

  const projection = definition.v2.projection;
  let value;
  if (projection === "hitting-slash-line-v1") value = slashLine(selected.row?.stats?.hitting?.totals);
  else if (projection === "legacy-bullpen-record-v1" || projection === "wins-losses-record-v1") value = winLoss(selected.row?.stats?.[projection === "legacy-bullpen-record-v1" ? "pitching" : "hitting"]?.totals);
  else value = readPath(selected.row, definition.v2.rowPath).value;

  const legacyEntry = legacyEntries?.[selected.index] ?? null;
  const target = collectionTarget(definition, selected.index, definition.v2.rowPath, legacyEntry);
  const state = stateFor(snapshot, target, true, value);
  return result(definition, requestedFieldId, value, availableValue(value) ? "available" : state.state, {
    availability: state.availability,
    lineage: state.lineage,
    reason: availableValue(value) ? "" : "Value is not available.",
    formatSource: definition.v2.rowPath === "player.name" ? selected.row.player : null,
    row: selected.row,
    rowIndex: selected.index
  });
}

function dependency(snapshot, path, row = null) {
  const clean = path.replace("[]", "");
  if (row && path.includes("[]")) {
    const suffix = path.split("[]").slice(1).join("[]").replace(/^\./, "");
    return readPath(row, suffix).value;
  }
  return readPath(snapshot, clean).value;
}

function aggregateState(snapshot, definition, values, targets) {
  const lineages = targets.map((target) => contextualLineageAt(snapshot, pointer(target))).filter(Boolean);
  const present = values.filter(availableValue).length;
  if (present === values.length) return { state: "available", availability: lineages.every((entry) => entry.state === "available") ? "available" : "partial", lineage: lineages[0] ?? null };
  if (present) return { state: "partial", availability: "partial", lineage: lineages[0] ?? null };
  return { state: lineages[0]?.state ?? "omitted", availability: lineages[0]?.state ?? "omitted", lineage: lineages[0] ?? null };
}

function winLoss(totals) {
  return availableValue(totals?.wins) && availableValue(totals?.losses) ? `${totals.wins}-${totals.losses}` : null;
}

function slashPart(value) {
  return String(value).replace(/^0(?=\.)/, "");
}

function slashLine(totals) {
  const values = [totals?.avg, totals?.obp, totals?.slg];
  return values.every(availableValue) ? values.map(slashPart).join("/") : null;
}

function fixedTwo(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : String(value);
}

function resolveDerived(snapshot, definition, requestedFieldId, selector) {
  if (definition.v1.cardinality === "repeated") return resolveRepeated(snapshot, definition, requestedFieldId, selector);
  const values = definition.v2.dependencies.map((path) => dependency(snapshot, path));
  const aggregate = aggregateState(snapshot, definition, values, definition.v2.dependencies);
  let value = null;
  switch (definition.v2.projection) {
    case "weather-summary-v1": {
      const [temperature, condition, wind] = values;
      const parts = [];
      if (availableValue(condition)) parts.push(String(condition));
      if (availableValue(temperature)) parts.push(`${temperature}°`);
      if (availableValue(wind)) parts.push(String(wind));
      value = parts.length ? parts.join(" • ") : null;
      break;
    }
    case "wins-losses-record-v1":
    case "wins-losses-last-ten-v1":
      value = values.every(availableValue) ? `${values[0]}-${values[1]}` : null;
      break;
    case "pitching-compact-v1": {
      const parts = [];
      if (availableValue(values[0]) && availableValue(values[1])) parts.push(`${values[0]}-${values[1]}`);
      if (availableValue(values[2])) parts.push(`${fixedTwo(values[2])} ERA`);
      value = parts.length ? parts.join(" • ") : null;
      break;
    }
  }
  const state = availableValue(value) ? (aggregate.state === "available" ? "available" : "partial") : aggregate.state;
  return result(definition, requestedFieldId, value, state, { availability: aggregate.availability, lineage: aggregate.lineage, reason: value == null ? "Required source values are not available." : state === "partial" ? "Composite value is partial." : "" });
}

function resolveOfficialRole(snapshot, definition, requestedFieldId) {
  const role = definition.v2.projection.split(":")[1];
  const wanted = canonicalRoleKey(role);
  const crew = Array.isArray(snapshot?.game?.umpires?.crew) ? snapshot.game.umpires.crew : [];
  const official = crew.find((entry) => canonicalRoleKey(entry?.role) === wanted);
  const target = "/game/umpires/crew";
  const lineage = lineageAt(snapshot, target);
  return result(definition, requestedFieldId, official?.name ?? null, official?.name ? "available" : (lineage?.state ?? "omitted"), {
    availability: lineage?.state ?? "omitted", lineage, reason: official?.name ? "" : `Official role ${role} is not available.`, formatSource: official ?? null
  });
}

export function resolveCompatibilityField(snapshot, fieldId, selector = null) {
  const definition = getCompatibilityDefinition(fieldId);
  if (!definition) return unsupported(fieldId);
  if (definition.v1.cardinality === "repeated") return definition.v2.disposition === "derived"
    ? resolveDerived(snapshot, definition, fieldId, selector)
    : resolveRepeated(snapshot, definition, fieldId, selector);
  if (definition.v2.projection?.startsWith("select-official-role:")) return resolveOfficialRole(snapshot, definition, fieldId);
  if (definition.v2.disposition === "derived") return resolveDerived(snapshot, definition, fieldId, selector);
  return resolveAtomicPath(snapshot, definition, fieldId);
}

export function compatibilityResolverApi(snapshot) {
  return Object.freeze({
    canonicalFieldId: canonicalCompatibilityFieldId,
    getFieldDefinition: getCompatibilityDefinition,
    resolveField: (fieldId, selector = null) => resolveCompatibilityField(snapshot, fieldId, selector),
    getCollectionRows: (fieldOrCollection) => getCompatibilityCollectionRows(snapshot, fieldOrCollection),
    capabilitiesForFields: compatibilityCapabilities
  });
}
