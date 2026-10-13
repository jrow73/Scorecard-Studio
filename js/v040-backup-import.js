/**
 * Scorecard Studio v0.4 backup import preflight.
 * Parsing, validation, compatibility analysis, and planning only: no writes.
 */

import { loadCompatibleLayout } from "./v030-layout-compatibility.js";
import { BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_SCOPES } from "./v040-backup-export.js";
import { SETTING_PORTABILITY, createBackupSettingRegistry } from "./v040-backup-settings.js";

export const BACKUP_IMPORT_LIMITS = Object.freeze({
  maxJsonBytes: 256 * 1024 * 1024,
  maxSettings: 1000,
  maxLayouts: 500,
  maxPdfTemplates: 500,
  maxPdfBytes: 50 * 1024 * 1024,
  maxTotalPdfBytes: 200 * 1024 * 1024
});

const TOP_LEVEL_KEYS = new Set(["format", "formatVersion", "backupId", "createdAtUtc", "source", "scope", "settings", "layouts", "pdfTemplates"]);
const SOURCE_KEYS = new Set(["applicationVersion", "build", "storageDatabaseVersion"]);
const SETTING_KEYS = new Set(["key", "value", "updatedAt"]);
const PDF_KEYS = new Set(["key", "name", "type", "size", "updatedAt", "data"]);
const PDF_DATA_KEYS = new Set(["encoding", "value", "sha256"]);

export async function preflightBackupImport(jsonText, currentStorage = {}, options = {}) {
  const diagnostics = [];
  const limits = Object.freeze({ ...BACKUP_IMPORT_LIMITS, ...(options.limits || {}) });
  let envelope = null;
  const text = typeof jsonText === "string" ? jsonText : "";
  if (!text) error(diagnostics, "BACKUP_EMPTY", "Choose a non-empty Scorecard Studio backup file.");
  if (text.length > limits.maxJsonBytes || (text && new TextEncoder().encode(text).byteLength > limits.maxJsonBytes)) {
    error(diagnostics, "BACKUP_TOO_LARGE", `Backup exceeds the ${limits.maxJsonBytes}-byte JSON limit.`);
  }
  if (!hasErrors(diagnostics)) {
    try { envelope = JSON.parse(text); }
    catch (cause) { error(diagnostics, "BACKUP_JSON_INVALID", `Backup is not valid JSON: ${cause.message}.`); }
  }
  if (envelope) validateEnvelope(envelope, limits, diagnostics);
  if (hasErrors(diagnostics)) return invalidResult(diagnostics);

  const preparedTemplates = await validateAndDecodeTemplates(envelope.pdfTemplates, limits, diagnostics);
  validateReferencesAndScope(envelope, preparedTemplates, diagnostics);
  const layoutAnalyses = analyzeLayouts(envelope.layouts, diagnostics);
  const settingAnalysis = analyzeSettings(envelope.settings, envelope.layouts, options.settingRegistry || createBackupSettingRegistry(), diagnostics);
  if (hasErrors(diagnostics)) return invalidResult(diagnostics);

  const plan = createRestorePlan(envelope, currentStorage, layoutAnalyses, settingAnalysis, preparedTemplates, diagnostics);
  return Object.freeze({
    valid: true,
    writesPerformed: 0,
    envelope,
    prepared: Object.freeze({
      settings: settingAnalysis.accepted,
      layouts: Object.freeze(envelope.layouts.map(jsonClone)),
      pdfTemplates: preparedTemplates
    }),
    plan,
    diagnostics: Object.freeze(diagnostics)
  });
}

function validateEnvelope(envelope, limits, diagnostics) {
  if (!isObject(envelope)) return error(diagnostics, "BACKUP_ENVELOPE_INVALID", "Backup root must be an object.");
  rejectUnknownKeys(envelope, TOP_LEVEL_KEYS, "$", diagnostics);
  if (envelope.format !== BACKUP_FORMAT) error(diagnostics, "BACKUP_FORMAT_UNSUPPORTED", `Expected backup format '${BACKUP_FORMAT}'.`);
  if (envelope.formatVersion !== BACKUP_FORMAT_VERSION) {
    error(diagnostics, "BACKUP_VERSION_UNSUPPORTED", `Backup format version '${envelope.formatVersion}' is not supported by this application.`);
  }
  if (!nonempty(envelope.backupId)) error(diagnostics, "BACKUP_ID_INVALID", "Backup ID is required.");
  if (!validDateTime(envelope.createdAtUtc)) error(diagnostics, "BACKUP_DATE_INVALID", "Backup creation time must be an ISO date-time.");
  if (!Object.values(BACKUP_SCOPES).includes(envelope.scope)) error(diagnostics, "BACKUP_SCOPE_INVALID", "Backup scope must be complete or singleLayout.");
  validateSource(envelope.source, diagnostics);
  validateCollection(envelope.settings, "settings", limits.maxSettings, diagnostics);
  validateCollection(envelope.layouts, "layouts", limits.maxLayouts, diagnostics);
  validateCollection(envelope.pdfTemplates, "pdfTemplates", limits.maxPdfTemplates, diagnostics);
  if (hasErrors(diagnostics)) return;
  validateSettingsStructure(envelope.settings, diagnostics);
  validateLayoutsStructure(envelope.layouts, diagnostics);
  validatePdfStructure(envelope.pdfTemplates, diagnostics);
  duplicateKeys(envelope.settings, "key", "SETTING_DUPLICATE", diagnostics);
  duplicateKeys(envelope.layouts, "id", "LAYOUT_DUPLICATE", diagnostics);
  duplicateKeys(envelope.pdfTemplates, "key", "PDF_DUPLICATE", diagnostics);
}

function validateSource(source, diagnostics) {
  if (!isObject(source)) return error(diagnostics, "BACKUP_SOURCE_INVALID", "Backup source metadata is required.");
  rejectUnknownKeys(source, SOURCE_KEYS, "$.source", diagnostics);
  if (!nonempty(source.applicationVersion) || !nonempty(source.build) || !Number.isInteger(source.storageDatabaseVersion) || source.storageDatabaseVersion < 1) {
    error(diagnostics, "BACKUP_SOURCE_INVALID", "Backup source requires application version, build, and a positive storage database version.");
  }
}

function validateCollection(value, label, maximum, diagnostics) {
  if (!Array.isArray(value)) return error(diagnostics, "BACKUP_COLLECTION_INVALID", `${label} must be an array.`, `$.${label}`);
  if (value.length > maximum) error(diagnostics, "BACKUP_COLLECTION_LIMIT", `${label} exceeds the ${maximum}-record limit.`, `$.${label}`);
}

function validateSettingsStructure(records, diagnostics) {
  records.forEach((record, index) => {
    const path = `$.settings[${index}]`;
    if (!isObject(record)) return error(diagnostics, "SETTING_RECORD_INVALID", "Setting record must be an object.", path);
    rejectUnknownKeys(record, SETTING_KEYS, path, diagnostics);
    if (!nonempty(record.key) || !("value" in record)) error(diagnostics, "SETTING_RECORD_INVALID", "Setting record requires key and value.", path);
    if (record.updatedAt != null && !validDateTime(record.updatedAt)) error(diagnostics, "SETTING_DATE_INVALID", "Setting updatedAt must be an ISO date-time.", path);
  });
}

function validateLayoutsStructure(records, diagnostics) {
  records.forEach((layout, index) => {
    const path = `$.layouts[${index}]`;
    if (!isObject(layout)) return error(diagnostics, "LAYOUT_RECORD_INVALID", "Layout record must be an object.", path);
    if (!nonempty(layout.id) || !nonempty(layout.name) || !nonempty(layout.pdfTemplateId) || !Number.isInteger(layout.schemaVersion) || layout.schemaVersion < 1) {
      error(diagnostics, "LAYOUT_RECORD_INVALID", "Layout requires id, name, pdfTemplateId, and a positive schemaVersion.", path);
    }
  });
}

function validatePdfStructure(records, diagnostics) {
  records.forEach((record, index) => {
    const path = `$.pdfTemplates[${index}]`;
    if (!isObject(record)) return error(diagnostics, "PDF_RECORD_INVALID", "PDF template record must be an object.", path);
    rejectUnknownKeys(record, PDF_KEYS, path, diagnostics);
    if (!nonempty(record.key) || !nonempty(record.name) || record.type !== "application/pdf" || !Number.isInteger(record.size) || record.size < 0) {
      error(diagnostics, "PDF_RECORD_INVALID", "PDF template requires key, name, application/pdf type, and nonnegative size.", path);
    }
    if (record.updatedAt != null && !validDateTime(record.updatedAt)) error(diagnostics, "PDF_DATE_INVALID", "PDF updatedAt must be an ISO date-time.", path);
    if (!isObject(record.data)) return error(diagnostics, "PDF_DATA_INVALID", "PDF data object is required.", `${path}.data`);
    rejectUnknownKeys(record.data, PDF_DATA_KEYS, `${path}.data`, diagnostics);
    if (record.data.encoding !== "base64" || typeof record.data.value !== "string" || !/^[A-Fa-f0-9]{64}$/.test(record.data.sha256 || "")) {
      error(diagnostics, "PDF_DATA_INVALID", "PDF data requires Base64 encoding, a string value, and SHA-256.", `${path}.data`);
    }
  });
}

async function validateAndDecodeTemplates(records, limits, diagnostics) {
  const prepared = [];
  let totalBytes = 0;
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const path = `$.pdfTemplates[${index}]`;
    if (record.data.value.length > Math.ceil(limits.maxPdfBytes / 3) * 4 + 4) {
      error(diagnostics, "PDF_SIZE_LIMIT", `PDF '${record.key}' exceeds the per-template size limit.`, path);
      continue;
    }
    let bytes;
    try { bytes = strictBase64Bytes(record.data.value); }
    catch (cause) { error(diagnostics, "PDF_BASE64_INVALID", `PDF '${record.key}' cannot be decoded: ${cause.message}.`, path); continue; }
    totalBytes += bytes.byteLength;
    if (bytes.byteLength > limits.maxPdfBytes) error(diagnostics, "PDF_SIZE_LIMIT", `PDF '${record.key}' exceeds the per-template size limit.`, path);
    if (totalBytes > limits.maxTotalPdfBytes) error(diagnostics, "PDF_TOTAL_SIZE_LIMIT", "Decoded PDFs exceed the total backup size limit.", path);
    if (bytes.byteLength !== record.size) error(diagnostics, "PDF_SIZE_MISMATCH", `PDF '${record.key}' decoded size does not match its manifest.`, path);
    if (!hasPdfSignature(bytes)) error(diagnostics, "PDF_SIGNATURE_INVALID", `PDF '${record.key}' does not have a PDF signature.`, path);
    const actualHash = await sha256Hex(bytes);
    if (actualHash !== String(record.data.sha256).toUpperCase()) error(diagnostics, "PDF_HASH_MISMATCH", `PDF '${record.key}' failed SHA-256 verification.`, path);
    prepared.push(Object.freeze({ record: jsonClone(record), bytes }));
  }
  return Object.freeze(prepared);
}

function validateReferencesAndScope(envelope, preparedTemplates, diagnostics) {
  const templateIds = new Set(preparedTemplates.map((entry) => entry.record.key));
  const referenced = new Set();
  for (const layout of envelope.layouts) {
    referenced.add(layout.pdfTemplateId);
    if (!templateIds.has(layout.pdfTemplateId)) error(diagnostics, "LAYOUT_PDF_MISSING", `Layout '${layout.id}' references missing PDF '${layout.pdfTemplateId}'.`);
  }
  for (const templateId of templateIds) {
    if (!referenced.has(templateId)) warning(diagnostics, "PDF_ORPHAN_SKIPPED", `PDF '${templateId}' is not referenced by a layout and will be skipped.`);
  }
  if (envelope.scope === BACKUP_SCOPES.SINGLE_LAYOUT) {
    if (envelope.layouts.length !== 1) error(diagnostics, "SINGLE_LAYOUT_COUNT", "Single-layout backup must contain exactly one layout.");
    if (envelope.settings.length !== 0) error(diagnostics, "SINGLE_LAYOUT_SETTINGS", "Single-layout backup must not contain global settings.");
    if (referenced.size !== 1 || preparedTemplates.filter((entry) => referenced.has(entry.record.key)).length !== 1) {
      error(diagnostics, "SINGLE_LAYOUT_PDF_COUNT", "Single-layout backup must contain exactly one referenced PDF.");
    }
  }
}

function analyzeLayouts(layouts, diagnostics) {
  return Object.freeze(layouts.map((layout) => {
    const analysis = loadCompatibleLayout(layout);
    for (const item of analysis.diagnostics || []) warning(diagnostics, item.code || "LAYOUT_COMPATIBILITY_WARNING", item.message, `layout:${layout.id}`);
    return Object.freeze({
      id: layout.id,
      name: layout.name,
      pdfTemplateId: layout.pdfTemplateId,
      schemaVersion: layout.schemaVersion,
      requiresPersistentWrite: analysis.requiresPersistentWrite,
      aliasesCanonicalized: Object.freeze(analysis.aliasesCanonicalized || []),
      diagnostics: Object.freeze(analysis.diagnostics || [])
    });
  }));
}

function analyzeSettings(records, layouts, registry, diagnostics) {
  const layoutIds = new Set(layouts.map((layout) => layout.id));
  const accepted = [];
  const unsupported = [];
  for (const record of records) {
    const entry = registry.get(record.key);
    if (!entry || ![SETTING_PORTABILITY.PORTABLE, SETTING_PORTABILITY.PORTABLE_REFERENCE].includes(entry.portability)) {
      const reason = !entry ? "unregistered" : entry.portability;
      unsupported.push(Object.freeze({ key: record.key, reason }));
      warning(diagnostics, "SETTING_UNSUPPORTED", `Setting '${record.key}' is ${reason} and will be skipped.`, `setting:${record.key}`);
      continue;
    }
    try {
      const value = jsonClone(entry.normalize(record.value));
      if (value == null) throw new Error("normalized value is empty");
      if (entry.portability === SETTING_PORTABILITY.PORTABLE_REFERENCE && entry.referencedEntity === "layout" && !layoutIds.has(value)) {
        throw new Error(`referenced layout '${value}' is not included`);
      }
      accepted.push(Object.freeze({ key: entry.key, value, ...(validDateTime(record.updatedAt) ? { updatedAt: record.updatedAt } : {}) }));
    } catch (cause) {
      error(diagnostics, "SETTING_VALUE_INVALID", `Setting '${record.key}' is invalid: ${cause.message}.`, `setting:${record.key}`);
    }
  }
  accepted.sort((left, right) => left.key.localeCompare(right.key));
  unsupported.sort((left, right) => left.key.localeCompare(right.key));
  return Object.freeze({ accepted: Object.freeze(accepted), unsupported: Object.freeze(unsupported) });
}

function createRestorePlan(envelope, current, layoutAnalyses, settingAnalysis, preparedTemplates, diagnostics) {
  const currentLayouts = new Map((current?.layouts || []).map((record) => [String(record?.id), record]));
  const currentLayoutNames = new Map((current?.layouts || []).map((record) => [String(record?.name || "").trim().toLowerCase(), String(record?.id)]));
  const currentPdfOwners = new Map();
  for (const record of current?.layouts || []) {
    const key = String(record?.pdfTemplateId || "");
    if (!currentPdfOwners.has(key)) currentPdfOwners.set(key, []);
    currentPdfOwners.get(key).push(String(record?.id));
  }
  const currentPdfs = new Set((current?.pdfTemplates || []).map((record) => String(record?.key)));
  const currentSettings = new Set((current?.settings || []).map((record) => String(record?.key)));
  const referencedPdfs = new Set(envelope.layouts.map((layout) => layout.pdfTemplateId));

  const layouts = layoutAnalyses.map((analysis) => {
    const conflicts = [];
    if (currentLayouts.has(analysis.id)) conflicts.push("layoutId");
    if (currentPdfs.has(analysis.pdfTemplateId)) conflicts.push("pdfTemplateId");
    const foreignPdfOwners = Object.freeze((currentPdfOwners.get(analysis.pdfTemplateId) || []).filter((id) => id !== analysis.id));
    if (foreignPdfOwners.length) conflicts.push("pdfInUseByOtherLayout");
    const nameOwner = currentLayoutNames.get(String(analysis.name).trim().toLowerCase());
    if (nameOwner && nameOwner !== analysis.id) conflicts.push("layoutName");
    const requiresChoice = conflicts.includes("layoutId") || conflicts.includes("pdfTemplateId");
    return Object.freeze({ ...analysis, action: requiresChoice ? "conflict" : "add", requiresChoice, conflicts: Object.freeze(conflicts), foreignPdfOwners });
  });
  const pdfTemplates = preparedTemplates.filter((entry) => referencedPdfs.has(entry.record.key)).map((entry) => Object.freeze({
    key: entry.record.key,
    name: entry.record.name,
    size: entry.record.size,
    action: currentPdfs.has(entry.record.key) ? "conflict" : "add"
  }));
  const settings = settingAnalysis.accepted.map((record) => Object.freeze({
    key: record.key,
    action: currentSettings.has(record.key) ? "replace" : "add",
    ...(record.key === "favoriteLayoutId" ? { referencedLayoutId: record.value } : {})
  }));
  const requiresConflictResolution = layouts.some((layout) => layout.requiresChoice);
  if (requiresConflictResolution) warning(diagnostics, "RESTORE_CONFLICTS_REQUIRE_CHOICE", "One or more layout/PDF units require Replace, Keep Both, or Skip decisions.");
  return Object.freeze({
    backup: Object.freeze({ id: envelope.backupId, createdAtUtc: envelope.createdAtUtc, source: envelope.source, scope: envelope.scope }),
    summary: Object.freeze({
      layoutsToAdd: layouts.filter((row) => row.action === "add").length,
      layoutConflicts: layouts.filter((row) => row.requiresChoice).length,
      pdfTemplatesToAdd: pdfTemplates.filter((row) => row.action === "add").length,
      pdfTemplateConflicts: pdfTemplates.filter((row) => row.action === "conflict").length,
      settingsToAdd: settings.filter((row) => row.action === "add").length,
      settingsToReplace: settings.filter((row) => row.action === "replace").length,
      unsupportedSettings: settingAnalysis.unsupported.length
    }),
    requiresConflictResolution,
    layouts: Object.freeze(layouts),
    pdfTemplates: Object.freeze(pdfTemplates),
    settings: Object.freeze(settings),
    unsupportedSettings: settingAnalysis.unsupported
  });
}

function strictBase64Bytes(value) {
  if (value.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new Error("malformed Base64");
  const decoded = atob(value);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function hasPdfSignature(bytes) {
  return bytes.byteLength >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
}

async function sha256Hex(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error("SHA-256 is unavailable in this browser.");
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function duplicateKeys(records, keyName, code, diagnostics) {
  const seen = new Set();
  for (const record of records) {
    const key = String(record?.[keyName] || "");
    if (key && seen.has(key)) error(diagnostics, code, `Duplicate ${keyName} '${key}'.`);
    seen.add(key);
  }
}

function rejectUnknownKeys(value, allowed, path, diagnostics) {
  for (const key of Object.keys(value)) if (!allowed.has(key)) error(diagnostics, "BACKUP_PROPERTY_UNKNOWN", `Unknown property '${key}'.`, `${path}.${key}`);
}

function invalidResult(diagnostics) {
  return Object.freeze({ valid: false, writesPerformed: 0, envelope: null, prepared: null, plan: null, diagnostics: Object.freeze(diagnostics) });
}

function error(diagnostics, code, message, path = null) {
  diagnostics.push(Object.freeze({ code, severity: "error", message, ...(path ? { path } : {}) }));
}

function warning(diagnostics, code, message, path = null) {
  diagnostics.push(Object.freeze({ code, severity: "warning", message, ...(path ? { path } : {}) }));
}

function hasErrors(diagnostics) {
  return diagnostics.some((item) => item.severity === "error");
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonempty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validDateTime(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}
