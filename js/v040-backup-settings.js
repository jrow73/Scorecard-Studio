/**
 * Scorecard Studio v0.4 backup setting definitions.
 * New ordinary preferences extend this registry; the backup engine stays generic.
 */

import {
  APP_PREFERENCES_SETTING_KEY,
  DEFAULT_APP_PREFERENCES,
  FAVORITE_COMPETITION_SETTING_KEY,
  LEGACY_FAVORITE_TEAM_SETTING_KEY,
  migrateFavoriteCompetition,
  normalizeAppPreferences,
  normalizeFavoriteCompetition
} from "./v040-settings.js";

export const SETTING_PORTABILITY = Object.freeze({
  PORTABLE: "portable",
  PORTABLE_REFERENCE: "portableReference",
  MIGRATION_ONLY: "migrationOnly",
  EXCLUDED: "excluded"
});

const identity = (value) => value;

export const BUILTIN_BACKUP_SETTING_DEFINITIONS = Object.freeze([
  definition({
    key: FAVORITE_COMPETITION_SETTING_KEY,
    portability: SETTING_PORTABILITY.PORTABLE,
    defaultValue: null,
    normalize: normalizeFavoriteCompetition,
    migrate({ records }) {
      if (records.has(FAVORITE_COMPETITION_SETTING_KEY)) return null;
      const legacy = records.get(LEGACY_FAVORITE_TEAM_SETTING_KEY);
      if (!legacy) return null;
      const migrated = migrateFavoriteCompetition(null, legacy.value);
      return migrated.value ? { value: migrated.value, updatedAt: legacy.updatedAt } : null;
    }
  }),
  definition({
    key: APP_PREFERENCES_SETTING_KEY,
    portability: SETTING_PORTABILITY.PORTABLE,
    defaultValue: DEFAULT_APP_PREFERENCES,
    normalize: normalizeAppPreferences
  }),
  definition({
    key: "favoriteLayoutId",
    portability: SETTING_PORTABILITY.PORTABLE_REFERENCE,
    defaultValue: "",
    referencedEntity: "layout",
    normalize: normalizeReference
  }),
  definition({ key: "livePdfLayoutId", portability: SETTING_PORTABILITY.EXCLUDED, defaultValue: "", normalize: identity }),
  definition({ key: LEGACY_FAVORITE_TEAM_SETTING_KEY, portability: SETTING_PORTABILITY.MIGRATION_ONLY, defaultValue: null, normalize: identity }),
  definition({ key: "includeAdditionalStarters", portability: SETTING_PORTABILITY.EXCLUDED, defaultValue: false, normalize: identity })
]);

export function createBackupSettingRegistry(additionalDefinitions = []) {
  const entries = new Map();
  for (const candidate of [...BUILTIN_BACKUP_SETTING_DEFINITIONS, ...(additionalDefinitions || [])]) {
    const entry = definition(candidate);
    if (entries.has(entry.key)) throw new Error(`Duplicate backup setting definition: ${entry.key}.`);
    entries.set(entry.key, entry);
  }
  return Object.freeze({
    get: (key) => entries.get(String(key)) || null,
    definitions: () => Object.freeze([...entries.values()])
  });
}

export function collectPortableSettingRecords(settingRecords, options = {}) {
  if (options.scope === "singleLayout") return Object.freeze({ records: [], diagnostics: [] });
  const registry = options.registry || createBackupSettingRegistry();
  const includedLayoutIds = new Set(options.includedLayoutIds || []);
  const source = new Map();
  const diagnostics = [];
  for (const record of settingRecords || []) {
    const key = String(record?.key || "").trim();
    if (!key) {
      diagnostics.push(diagnostic("SETTING_KEY_INVALID", "A setting with no key was skipped."));
      continue;
    }
    if (source.has(key)) throw new Error(`Duplicate setting record: ${key}.`);
    source.set(key, record);
    if (!registry.get(key)) diagnostics.push(diagnostic("SETTING_UNREGISTERED", `Setting '${key}' is not registered and was skipped.`, key));
  }

  const exported = [];
  for (const entry of registry.definitions()) {
    if (![SETTING_PORTABILITY.PORTABLE, SETTING_PORTABILITY.PORTABLE_REFERENCE].includes(entry.portability)) continue;
    let sourceRecord = source.get(entry.key) || null;
    if (!sourceRecord && typeof entry.migrate === "function") {
      const migrated = entry.migrate({ records: source });
      if (migrated) sourceRecord = { key: entry.key, ...migrated };
    }
    if (!sourceRecord) continue;

    let value;
    try {
      value = entry.normalize(sourceRecord.value);
      if (value == null) throw new Error("normalized value is empty");
      value = jsonClone(value);
    } catch (error) {
      diagnostics.push(diagnostic("SETTING_VALUE_INVALID", `Setting '${entry.key}' was skipped: ${error.message}.`, entry.key));
      continue;
    }

    if (entry.portability === SETTING_PORTABILITY.PORTABLE_REFERENCE && entry.referencedEntity === "layout" && !includedLayoutIds.has(value)) {
      diagnostics.push(diagnostic("SETTING_REFERENCE_MISSING", `Setting '${entry.key}' references a layout not included in this backup and was skipped.`, entry.key));
      continue;
    }
    exported.push(Object.freeze({
      key: entry.key,
      value,
      ...(validDateTime(sourceRecord.updatedAt) ? { updatedAt: sourceRecord.updatedAt } : {})
    }));
  }
  exported.sort((left, right) => left.key.localeCompare(right.key));
  return Object.freeze({ records: Object.freeze(exported), diagnostics: Object.freeze(diagnostics) });
}

function definition(candidate) {
  const key = String(candidate?.key || "").trim();
  const portability = candidate?.portability;
  if (!key) throw new Error("Backup setting definitions require a key.");
  if (!Object.values(SETTING_PORTABILITY).includes(portability)) throw new Error(`Unsupported portability for setting '${key}'.`);
  if (typeof candidate.normalize !== "function") throw new Error(`Backup setting '${key}' requires a normalizer.`);
  return Object.freeze({ ...candidate, key, portability });
}

function normalizeReference(value) {
  const result = String(value ?? "").trim();
  return result || null;
}

function jsonClone(value) {
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("value is not JSON-serializable");
  return JSON.parse(encoded);
}

function validDateTime(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function diagnostic(code, message, key = null) {
  return Object.freeze({ code, severity: "warning", message, ...(key ? { key } : {}) });
}
