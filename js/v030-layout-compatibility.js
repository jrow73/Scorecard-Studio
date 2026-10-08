/**
 * Non-destructive saved-layout compatibility helpers for schema-v2 snapshots.
 *
 * Loading canonicalizes recognized legacy aliases only in the in-memory copy.
 * Persistence remains an explicit caller decision; unknown field IDs survive
 * both load and save preparation unchanged.
 */

import {
  canonicalCompatibilityFieldId,
  getCompatibilityDefinition,
  resolveCompatibilityField
} from "./v030-compatibility-resolver.js";

const FIELD_KEYS = new Set(["field", "fieldId", "originField"]);
const FIELD_ARRAY_KEYS = new Set(["fieldIds", "visibleFieldIds"]);

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function visitFieldReferences(node, visitor, path = "$") {
  if (Array.isArray(node)) {
    node.forEach((value, index) => visitFieldReferences(value, visitor, `${path}[${index}]`));
    return;
  }
  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    const childPath = `${path}.${key}`;
    if (FIELD_KEYS.has(key) && typeof value === "string") {
      visitor(node, key, value, childPath);
      continue;
    }
    if (FIELD_ARRAY_KEYS.has(key) && Array.isArray(value)) {
      value.forEach((fieldId, index) => {
        if (typeof fieldId === "string") visitor(value, index, fieldId, `${childPath}[${index}]`);
      });
      continue;
    }
    visitFieldReferences(value, visitor, childPath);
  }
}

function normalizeSelector(container) {
  if (container?.selector && typeof container.selector === "object") return clone(container.selector);
  const selector = {};
  if (Number.isInteger(Number(container?.slot)) && Number(container.slot) > 0) selector.slot = Number(container.slot);
  if (container?.rowIndex != null) selector.rowIndex = container.rowIndex;
  if (container?.role != null) selector.role = container.role;
  return Object.keys(selector).length ? selector : null;
}

function analyzeAndCanonicalize(layout) {
  const value = clone(layout);
  const aliasesCanonicalized = [];
  const unknownByField = new Map();
  const references = [];

  visitFieldReferences(value, (container, key, requestedFieldId, path) => {
    const canonicalFieldId = canonicalCompatibilityFieldId(requestedFieldId);
    const definition = getCompatibilityDefinition(canonicalFieldId);
    if (canonicalFieldId !== requestedFieldId) {
      container[key] = canonicalFieldId;
      aliasesCanonicalized.push({ path, from: requestedFieldId, to: canonicalFieldId });
    }
    if (!definition && !unknownByField.has(requestedFieldId)) {
      unknownByField.set(requestedFieldId, {
        code: "UNKNOWN_FIELD_PRESERVED",
        severity: "warning",
        fieldId: requestedFieldId,
        message: `Unknown field ${requestedFieldId} was preserved and will render blank.`
      });
    }
    references.push({
      path,
      requestedFieldId,
      fieldId: canonicalFieldId,
      selector: normalizeSelector(Array.isArray(container) ? null : container),
      supported: Boolean(definition)
    });
  });

  const unknownFields = [...unknownByField.keys()];
  const diagnostics = unknownFields.length ? [{
    code: "UNKNOWN_FIELDS_PRESERVED",
    severity: "warning",
    fieldIds: unknownFields,
    message: `${unknownFields.length} unknown field ID${unknownFields.length === 1 ? " was" : "s were"} preserved and will render blank.`
  }] : [];
  return { value, aliasesCanonicalized, diagnostics, references };
}

export function loadCompatibleLayout(layout) {
  const analyzed = analyzeAndCanonicalize(layout);
  return {
    layout: analyzed.value,
    diagnostics: analyzed.diagnostics,
    references: analyzed.references,
    aliasesCanonicalized: analyzed.aliasesCanonicalized,
    requiresPersistentWrite: false
  };
}

export function prepareCompatibleLayoutForExplicitSave(layout) {
  const analyzed = analyzeAndCanonicalize(layout);
  return {
    layout: analyzed.value,
    diagnostics: analyzed.diagnostics,
    aliasesCanonicalized: analyzed.aliasesCanonicalized
  };
}

export function resolveLayoutBindings(snapshot, layout) {
  const loaded = loadCompatibleLayout(layout);
  return {
    ...loaded,
    bindings: loaded.references.map((reference) => {
      const resolution = resolveCompatibilityField(snapshot, reference.fieldId, reference.selector);
      return {
        ...reference,
        resolution,
        displayValue: resolution.state === "available" || resolution.state === "partial" ? resolution.value ?? "" : ""
      };
    })
  };
}
