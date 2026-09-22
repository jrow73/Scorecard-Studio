/**
 * Scorecard Studio
 * Live field-catalog diagnostic helpers
 * Version: 0.2.0-dev
 * Build: 018.3
 */

import { getCatalogFields, getCollectionRows, resolveField } from "./field-registry.js?v=023";
import { formatFieldValue } from "./formatter.js?v=018";

export const DIAGNOSTIC_STATUSES = Object.freeze({
  available: "Available",
  partial: "Partial",
  missing: "Missing",
  sourceUnavailable: "Source unavailable",
  error: "Error"
});

export function buildFieldDiagnosticRows(model) {
  return getCatalogFields().map((definition) => diagnoseDefinition(model, definition));
}

export function summarizeDiagnosticRows(rows) {
  const summary = { total: rows.length, available: 0, partial: 0, missing: 0, sourceUnavailable: 0, error: 0 };
  for (const row of rows) {
    if (Object.hasOwn(summary, row.status)) summary[row.status] += 1;
  }
  return summary;
}

export function diagnoseDefinition(model, definition) {
  const unavailableSources = (definition.sourceRequirements || []).filter((source) => !sourceLoaded(model, source));
  if (unavailableSources.length) {
    return diagnosticRow(definition, {
      liveValue: "",
      coverage: definition.cardinality === "repeated" ? "0/0" : "—",
      status: "sourceUnavailable",
      reason: `Required source not loaded: ${unavailableSources.join(", ")}`
    });
  }

  if (definition.cardinality === "repeated") return diagnoseRepeated(model, definition);

  const resolution = resolveField(model, definition.id);
  const liveValue = formatFieldValue(definition, resolution, model, definition.defaultFormat || {});
  let status = "available";
  if (["unsupported", "error"].includes(resolution.state)) status = "error";
  else if (!liveValue) status = "missing";
  else if (resolution.state === "partial") status = "partial";
  return diagnosticRow(definition, { liveValue, coverage: "—", status, reason: resolution.reason || "" });
}

function diagnoseRepeated(model, definition) {
  const rows = getCollectionRows(model, definition.collection);
  const members = rows.map((row, index) => ({ row, slot: index + 1 })).filter(({ row }) => rowHasMember(definition.collection, row));
  if (!members.length) {
    return diagnosticRow(definition, {
      liveValue: "",
      coverage: "0/0",
      status: "missing",
      reason: "No applicable live rows are available for this collection."
    });
  }

  let available = 0;
  let errors = 0;
  let partial = 0;
  let liveValue = "";
  const reasons = [];
  for (const member of members) {
    const resolution = resolveField(model, definition.id, { slot: member.slot });
    const formatted = formatFieldValue(definition, resolution, model, definition.defaultFormat || {});
    if (["unsupported", "error"].includes(resolution.state)) errors += 1;
    else if (formatted) {
      available += 1;
      if (!liveValue) liveValue = formatted;
      if (resolution.state === "partial") partial += 1;
    }
    if (resolution.reason && !reasons.includes(resolution.reason)) reasons.push(resolution.reason);
  }

  let status = "available";
  if (errors) status = "error";
  else if (!available) status = "missing";
  else if (available < members.length || partial) status = "partial";

  return diagnosticRow(definition, {
    liveValue,
    coverage: `${available}/${members.length}`,
    status,
    reason: reasons.join(" ")
  });
}

function diagnosticRow(definition, values) {
  return {
    id: definition.id,
    label: definition.label,
    category: definition.category,
    description: definition.description || "",
    exampleValue: String(definition.exampleValue ?? ""),
    visibilityTier: definition.visibilityTier,
    sourceRequirements: [...(definition.sourceRequirements || [])],
    cardinality: definition.cardinality,
    ...values,
    statusLabel: DIAGNOSTIC_STATUSES[values.status] || values.status
  };
}

function sourceLoaded(model, source) {
  if (source === "gamePack") return Boolean(model?.meta?.sources?.gamePack);
  return Boolean(model?.meta?.sources?.[source]);
}

function rowHasMember(collection, row) {
  if (!row) return false;
  if (collection === "game.umpires.crew") return Boolean(row.id || row.name || row.role);
  return Boolean(row?.player?.id || row?.player?.name);
}
