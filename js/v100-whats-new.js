/**
 * Scorecard Studio
 * v1 version-aware changelog contract
 */

import { WHATS_NEW_STORAGE_KEY } from "./v040-settings.js?v=110r004";

export const WHATS_NEW_RECORD_VERSION = 1;
export const WHATS_NEW_BASELINE_VERSION = "1.0.0";

export const CHANGELOG_ENTRIES = Object.freeze([
  Object.freeze({
    version: "1.1.0",
    label: "v1.1",
    title: "Searchable help and community",
    summary: "Search all Help topics with matching excerpts and highlighted words. Open relevant Designer guidance from object-level help buttons, and join Discord for additional help and layout sharing."
  }),
  Object.freeze({
    version: "1.0.0",
    label: "v1",
    title: "Initial release",
    summary: "The first public release of Scorecard Studio."
  })
]);

export function publicVersion(value) {
  const match = String(value || "").trim().match(/^(\d+)\.(\d+)\.(\d+)/);
  return match ? `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}` : null;
}

export function compareVersions(left, right) {
  const a = versionParts(left);
  const b = versionParts(right);
  if (!a || !b) return 0;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1;
  }
  return 0;
}

export function normalizeWhatsNewRecord(value) {
  let candidate = value;
  if (typeof candidate === "string") {
    try { candidate = JSON.parse(candidate); }
    catch { return null; }
  }
  if (!candidate || typeof candidate !== "object") return null;
  if (Number(candidate.recordVersion) !== WHATS_NEW_RECORD_VERSION) return null;
  const lastSeenVersion = publicVersion(candidate.lastSeenVersion);
  if (!lastSeenVersion) return null;
  return Object.freeze({
    recordVersion: WHATS_NEW_RECORD_VERSION,
    lastSeenVersion,
    recordedAt: typeof candidate.recordedAt === "string" ? candidate.recordedAt : null
  });
}

export function readWhatsNewRecord(storage = globalThis.localStorage) {
  try {
    if (!storage?.getItem) return Object.freeze({ available: false, record: null });
    return Object.freeze({ available: true, record: normalizeWhatsNewRecord(storage.getItem(WHATS_NEW_STORAGE_KEY)) });
  } catch {
    return Object.freeze({ available: false, record: null });
  }
}

export function writeWhatsNewRecord(version, storage = globalThis.localStorage, recordedAt = new Date().toISOString()) {
  const lastSeenVersion = publicVersion(version);
  if (!lastSeenVersion) return false;
  try {
    if (!storage?.setItem) return false;
    storage.setItem(WHATS_NEW_STORAGE_KEY, JSON.stringify({
      recordVersion: WHATS_NEW_RECORD_VERSION,
      lastSeenVersion,
      recordedAt
    }));
    return true;
  } catch {
    return false;
  }
}

export function changelogEntriesThrough(currentVersion, entries = CHANGELOG_ENTRIES) {
  const current = publicVersion(currentVersion);
  if (!current) return Object.freeze([]);
  return Object.freeze(entries
    .filter((entry) => publicVersion(entry?.version) && compareVersions(entry.version, current) <= 0)
    .slice()
    .sort((left, right) => compareVersions(right.version, left.version)));
}

export function whatsNewStartupDecision({ currentVersion, onboardingRecord = null, hasUserData = false, storage = globalThis.localStorage, entries = CHANGELOG_ENTRIES } = {}) {
  const current = publicVersion(currentVersion);
  const stored = readWhatsNewRecord(storage);
  if (!current || !stored.available) return Object.freeze({ show: false, seedVersion: null, entries: Object.freeze([]), reason: "unavailable" });

  const firstVisit = !onboardingRecord && hasUserData !== true;
  if (firstVisit) return Object.freeze({ show: false, seedVersion: current, entries: Object.freeze([]), reason: "first-visit" });

  const lastSeen = stored.record?.lastSeenVersion || WHATS_NEW_BASELINE_VERSION;
  const unseenEntries = Object.freeze(changelogEntriesThrough(current, entries)
    .filter((entry) => compareVersions(entry.version, lastSeen) > 0));
  const show = compareVersions(current, WHATS_NEW_BASELINE_VERSION) > 0
    && compareVersions(current, lastSeen) > 0
    && unseenEntries.length > 0;
  return Object.freeze({
    show,
    seedVersion: show ? null : current,
    entries: show ? unseenEntries : Object.freeze([]),
    reason: show ? "new-version" : stored.record ? "already-seen" : "baseline"
  });
}

function versionParts(value) {
  const normalized = publicVersion(value);
  return normalized ? normalized.split(".").map(Number) : null;
}
