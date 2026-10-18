/**
 * Scorecard Studio
 * v0.7 first-visit welcome and highlights-tour contract
 */

import { ONBOARDING_STORAGE_KEY } from "./v040-settings.js?v=100r002";

export const ONBOARDING_CONTENT_VERSION = 1;
export const ONBOARDING_SETTING_KEY = "onboardingV1";
export const ONBOARDING_STATUSES = Object.freeze(["completed", "dismissed"]);

export const ONBOARDING_TOUR_STEPS = Object.freeze([
  Object.freeze({
    eyebrow: "Home",
    title: "Find a Game",
    description: "Browse schedules by date and competition level, then select the matchup you want to research or print.",
    highlights: Object.freeze(["Set a favorite team in Settings for a faster daily start.", "Refresh Schedule checks for the latest pregame information."])
  }),
  Object.freeze({
    eyebrow: "Game Day",
    title: "Research Before First Pitch",
    description: "Use Game Day as a spoiler-safe research companion for the selected matchup.",
    highlights: Object.freeze(["Review lineups, pitching, teams, standings, venue, weather, and officials.", "Choose Compact, Standard, or Advanced detail whenever it helps."])
  }),
  Object.freeze({
    eyebrow: "Layout Library",
    title: "Build a Reusable Layout",
    description: "Attach your own blank scorecard PDF and save it as a reusable layout.",
    highlights: Object.freeze(["Every new layout begins with the recommended Standard Fields.", "Layout Settings controls fields, formatting, names, and the source PDF."])
  }),
  Object.freeze({
    eyebrow: "Designer",
    title: "Place Your Scorecard Fields",
    description: "Position team, player, game, and statistical fields directly over the PDF template.",
    highlights: Object.freeze(["Generate a Test PDF while refining the layout.", "Return Home to generate a live scorecard for a selected game."])
  }),
  Object.freeze({
    eyebrow: "Settings",
    title: "Protect Your Work",
    description: "Scorecard Studio keeps layouts and uploaded templates in this browser, so backups matter.",
    highlights: Object.freeze(["Download a Complete Backup before clearing browser data or changing devices.", "Restore checks the backup and shows conflicts before writing anything."])
  })
]);

export function normalizeOnboardingRecord(value) {
  let candidate = value;
  if (typeof candidate === "string") {
    try { candidate = JSON.parse(candidate); }
    catch { return null; }
  }
  if (!candidate || typeof candidate !== "object") return null;
  if (Number(candidate.contentVersion) !== ONBOARDING_CONTENT_VERSION) return null;
  if (!ONBOARDING_STATUSES.includes(candidate.status)) return null;
  return Object.freeze({
    contentVersion: ONBOARDING_CONTENT_VERSION,
    status: candidate.status,
    recordedAt: typeof candidate.recordedAt === "string" ? candidate.recordedAt : null
  });
}

export function createOnboardingRecord(status, recordedAt = new Date().toISOString()) {
  if (!ONBOARDING_STATUSES.includes(status)) return null;
  return Object.freeze({
    contentVersion: ONBOARDING_CONTENT_VERSION,
    status,
    recordedAt
  });
}

export function onboardingStartupDecision({ indexedDbRecord = null, legacyRecord = null, hasUserData = false } = {}) {
  const current = normalizeOnboardingRecord(indexedDbRecord);
  if (current) return Object.freeze({ showWelcome: false, record: current, migrateRecord: null });

  const legacy = normalizeOnboardingRecord(legacyRecord);
  if (legacy && hasUserData === true) {
    return Object.freeze({ showWelcome: false, record: legacy, migrateRecord: legacy });
  }

  return Object.freeze({ showWelcome: true, record: null, migrateRecord: null });
}

export function readOnboardingRecord(storage = globalThis.localStorage) {
  try {
    if (!storage?.getItem) return Object.freeze({ available: false, record: null });
    return Object.freeze({ available: true, record: normalizeOnboardingRecord(storage.getItem(ONBOARDING_STORAGE_KEY)) });
  } catch {
    return Object.freeze({ available: false, record: null });
  }
}

export function shouldShowFirstVisitWelcome(storage = globalThis.localStorage) {
  const result = readOnboardingRecord(storage);
  return result.available && !result.record;
}

export function writeOnboardingRecord(status, storage = globalThis.localStorage, recordedAt = new Date().toISOString()) {
  if (!ONBOARDING_STATUSES.includes(status)) return false;
  try {
    if (!storage?.setItem) return false;
    storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
      contentVersion: ONBOARDING_CONTENT_VERSION,
      status,
      recordedAt
    }));
    return true;
  } catch {
    return false;
  }
}
