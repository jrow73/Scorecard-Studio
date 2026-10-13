/**
 * Scorecard Studio v0.4 deterministic backup exporter.
 * This module is deliberately UI-free and performs no storage writes.
 */

import { collectPortableSettingRecords, createBackupSettingRegistry } from "./v040-backup-settings.js";

export const BACKUP_FORMAT = "scorecard-studio-backup";
export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_SCOPES = Object.freeze({ COMPLETE: "complete", SINGLE_LAYOUT: "singleLayout" });

export async function createBackupExport(input, options = {}) {
  const scope = options.scope || BACKUP_SCOPES.COMPLETE;
  if (!Object.values(BACKUP_SCOPES).includes(scope)) throw new Error(`Unsupported backup scope: ${scope}.`);
  const source = normalizeSource(options.source);
  const createdAtUtc = options.createdAtUtc || new Date().toISOString();
  if (!validDateTime(createdAtUtc)) throw new Error("Backup creation time must be an ISO date-time.");
  const backupId = String(options.backupId || globalThis.crypto?.randomUUID?.() || `backup-${Date.now()}`).trim();
  if (!backupId) throw new Error("Backup ID is required.");

  const allLayouts = uniqueRecords(input?.layouts, "id", "layout");
  const selectedLayouts = scope === BACKUP_SCOPES.SINGLE_LAYOUT
    ? selectSingleLayout(allLayouts, options.layoutId)
    : allLayouts;
  const layouts = selectedLayouts.map(jsonSafeClone).sort(compareBy("id"));
  const includedLayoutIds = layouts.map((layout) => layout.id);

  const settingsResult = collectPortableSettingRecords(input?.settings, {
    scope,
    includedLayoutIds,
    registry: options.settingRegistry || createBackupSettingRegistry()
  });

  const templateSource = new Map(uniqueRecords(input?.pdfTemplates, "key", "PDF template").map((record) => [String(record.key), record]));
  const requiredTemplateIds = [...new Set(layouts.map((layout) => String(layout?.pdfTemplateId || "").trim()))].sort();
  if (requiredTemplateIds.some((key) => !key)) throw new Error("Every exported layout must reference a PDF template.");
  const pdfTemplates = [];
  for (const key of requiredTemplateIds) {
    const record = templateSource.get(key);
    if (!record) throw new Error(`Layout references missing PDF template '${key}'.`);
    pdfTemplates.push(await encodePdfTemplate(record));
  }

  const envelope = Object.freeze({
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    backupId,
    createdAtUtc,
    source,
    scope,
    settings: settingsResult.records,
    layouts: Object.freeze(layouts),
    pdfTemplates: Object.freeze(pdfTemplates.sort(compareBy("key")))
  });
  return Object.freeze({
    envelope,
    json: stableStringify(envelope),
    diagnostics: settingsResult.diagnostics
  });
}

export function stableStringify(value) {
  return `${JSON.stringify(stableValue(jsonSafeClone(value)), null, 2)}\n`;
}

async function encodePdfTemplate(record) {
  const key = String(record?.key || "").trim();
  const name = String(record?.name || "scorecard-template.pdf").trim() || "scorecard-template.pdf";
  const declaredType = String(record?.type || record?.blob?.type || "").toLowerCase();
  if (declaredType && declaredType !== "application/pdf") throw new Error(`Template '${key}' is not an application/pdf record.`);
  const bytes = await binaryBytes(record?.blob);
  if (!hasPdfSignature(bytes)) throw new Error(`Template '${key}' does not have a PDF signature.`);
  return Object.freeze({
    key,
    name,
    type: "application/pdf",
    size: bytes.byteLength,
    ...(validDateTime(record?.updatedAt) ? { updatedAt: record.updatedAt } : {}),
    data: Object.freeze({
      encoding: "base64",
      value: bytesToBase64(bytes),
      sha256: await sha256Hex(bytes)
    })
  });
}

async function binaryBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof Blob !== "undefined" && value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
  throw new Error("PDF template data must be a Blob, ArrayBuffer, or Uint8Array.");
}

function hasPdfSignature(bytes) {
  return bytes.byteLength >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

async function sha256Hex(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error("SHA-256 is unavailable in this browser.");
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function selectSingleLayout(layouts, layoutId) {
  const id = String(layoutId || "").trim();
  if (!id) throw new Error("Single-layout backup requires a layout ID.");
  const layout = layouts.find((candidate) => String(candidate.id) === id);
  if (!layout) throw new Error(`Layout '${id}' was not found.`);
  return [layout];
}

function uniqueRecords(records, keyName, label) {
  const found = new Set();
  return (records || []).map((record) => {
    const key = String(record?.[keyName] || "").trim();
    if (!key) throw new Error(`${label} ${keyName} is required.`);
    if (found.has(key)) throw new Error(`Duplicate ${label} ${keyName}: ${key}.`);
    found.add(key);
    return record;
  });
}

function normalizeSource(source) {
  const applicationVersion = String(source?.applicationVersion || "").trim();
  const build = String(source?.build || "").trim();
  const storageDatabaseVersion = Number(source?.storageDatabaseVersion);
  if (!applicationVersion || !build || !Number.isInteger(storageDatabaseVersion) || storageDatabaseVersion < 1) {
    throw new Error("Backup source requires applicationVersion, build, and a positive storageDatabaseVersion.");
  }
  return Object.freeze({ applicationVersion, build, storageDatabaseVersion });
}

function jsonSafeClone(value) {
  let encoded;
  try { encoded = JSON.stringify(value); }
  catch (error) { throw new Error(`Backup data is not JSON-serializable: ${error.message}`); }
  if (encoded === undefined) throw new Error("Backup data is not JSON-serializable.");
  return JSON.parse(encoded);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function compareBy(key) {
  return (left, right) => String(left?.[key] || "").localeCompare(String(right?.[key] || ""));
}

function validDateTime(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
