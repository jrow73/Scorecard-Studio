/**
 * Scorecard Studio
 * Shared field/template resolution for repeated and single-record slots
 * Version: 0.2.0-dev
 * Build: 018
 */

import { canonicalFieldId, getFieldDefinition, getSupportedFields, resolveField } from "./field-registry.js";
import { formatFieldValue } from "./formatter.js";

export function fieldsForRecordContext(context, options = {}) {
  const value = String(context || "");
  return getSupportedFields().filter((definition) => (definition.collection === value || definition.record === value) && (!options.catalogOnly || definition.catalog !== false));
}

function contextualTokenLabel(definition) {
  if (!definition) return "";
  return String(definition.label || "")
    .replace(/^(Away|Home) (Lineup|Bench|Bullpen|Starting Pitcher) — /, "")
    .replace(/^Umpire Crew — /, "");
}

export function templateTokenForContextField(fieldId) {
  const definition = getFieldDefinition(fieldId);
  const label = contextualTokenLabel(definition);
  return label ? `[${label}]` : "";
}

export function contextTemplateFieldIdByToken(tokenText, context) {
  const token = String(tokenText || "").trim();
  const fields = fieldsForRecordContext(context);
  const direct = getFieldDefinition(token);
  if (direct && fields.some((definition) => definition.id === direct.id)) return direct.id;
  return fields.find((definition) => definition.label === token || contextualTokenLabel(definition) === token || definition.legacyLabels?.includes(token))?.id || null;
}

export function contextTemplateFieldIds(template, context) {
  const ids = [];
  const seen = new Set();
  const regex = /\[([^\[\]]+)\]/g;
  let match;
  while ((match = regex.exec(String(template || ""))) !== null) {
    const id = contextTemplateFieldIdByToken(match[1], context);
    if (id && !seen.has(id)) { seen.add(id); ids.push(id); }
  }
  return ids;
}

export function resolveSlotContent(content, model, context, selector = null) {
  if (content?.type === "template") {
    return String(content.template || "").replace(/\[([^\[\]]+)\]/g, (_whole, token) => {
      const fieldId = contextTemplateFieldIdByToken(token, context);
      if (!fieldId) return "";
      const definition = getFieldDefinition(fieldId);
      return formatFieldValue(definition, resolveField(model, fieldId, selector), model) || "";
    });
  }
  const fieldId = canonicalFieldId(content?.field || "");
  const definition = getFieldDefinition(fieldId);
  if (!definition || !fieldsForRecordContext(context).some((entry) => entry.id === definition.id)) return "";
  return formatFieldValue(definition, resolveField(model, fieldId, selector), model, content?.format || {});
}

export function slotContentFieldIds(content, context) {
  if (content?.type === "template") return contextTemplateFieldIds(content.template, context);
  return content?.field ? [canonicalFieldId(content.field)] : [];
}
