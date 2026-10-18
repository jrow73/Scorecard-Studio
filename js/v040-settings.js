/**
 * Scorecard Studio
 * v0.4 application-settings contract
 */

export const FAVORITE_COMPETITION_SETTING_KEY = "favoriteCompetition";
export const LEGACY_FAVORITE_TEAM_SETTING_KEY = "favoriteTeam";
export const APP_PREFERENCES_SETTING_KEY = "appPreferencesV1";
export const APPEARANCE_STARTUP_STORAGE_KEY = "scorecardStudio.appearance";
export const LOCAL_DATA_RESET_SIGNAL_STORAGE_KEY = "scorecardStudio.localDataReset";
export const ONBOARDING_STORAGE_KEY = "scorecardStudio.onboarding";
export const WHATS_NEW_STORAGE_KEY = "scorecardStudio.whatsNew";
export const APP_OWNED_LOCAL_STORAGE_KEYS = Object.freeze([
  APPEARANCE_STARTUP_STORAGE_KEY,
  LOCAL_DATA_RESET_SIGNAL_STORAGE_KEY,
  ONBOARDING_STORAGE_KEY,
  WHATS_NEW_STORAGE_KEY
]);

export const SUPPORTED_COMPETITION_LEVELS = Object.freeze([
  Object.freeze({ levelKey: "mlb", sportId: 1, label: "MLB" }),
  Object.freeze({ levelKey: "triple-a", sportId: 11, label: "Triple-A" }),
  Object.freeze({ levelKey: "double-a", sportId: 12, label: "Double-A" }),
  Object.freeze({ levelKey: "high-a", sportId: 13, label: "High-A" }),
  Object.freeze({ levelKey: "single-a", sportId: 14, label: "Single-A" })
]);

export const DEFAULT_APP_PREFERENCES = Object.freeze({
  schemaVersion: 1,
  appearance: "system",
  gameDayDetailLevel: "standard"
});

export const APPEARANCE_PREFERENCES = Object.freeze(["system", "light", "dark"]);
export const GAME_DAY_DETAIL_LEVELS = Object.freeze(["compact", "standard", "advanced"]);

export function competitionLevelByKey(levelKey) {
  return SUPPORTED_COMPETITION_LEVELS.find((level) => level.levelKey === String(levelKey || "")) || null;
}

export function competitionLevelBySportId(sportId) {
  const numericSportId = Number(sportId);
  return SUPPORTED_COMPETITION_LEVELS.find((level) => level.sportId === numericSportId) || null;
}

export function normalizeFavoriteCompetition(value) {
  if (!value || typeof value !== "object") return null;
  const level = competitionLevelByKey(value.levelKey) || competitionLevelBySportId(value.sportId);
  const teamId = Number(value.teamId);
  const teamName = text(value.teamName);
  if (!level || !Number.isInteger(teamId) || teamId <= 0 || !teamName) return null;
  const leagueId = Number(value.leagueId);
  const leagueName = text(value.leagueName);
  return Object.freeze({
    levelKey: level.levelKey,
    sportId: level.sportId,
    teamId,
    teamName,
    ...(Number.isInteger(leagueId) && leagueId > 0 ? { leagueId } : {}),
    ...(leagueName ? { leagueName } : {})
  });
}

export function migrateFavoriteCompetition(storedCompetition, legacyFavoriteTeam) {
  const current = normalizeFavoriteCompetition(storedCompetition);
  if (current) return Object.freeze({ value: current, migrated: false, source: "current" });

  const teamId = Number(legacyFavoriteTeam?.id);
  const teamName = text(legacyFavoriteTeam?.name);
  if (!Number.isInteger(teamId) || teamId <= 0 || !teamName) {
    return Object.freeze({ value: null, migrated: false, source: "none" });
  }

  return Object.freeze({
    value: Object.freeze({ levelKey: "mlb", sportId: 1, teamId, teamName }),
    migrated: true,
    source: "legacy-v0.3"
  });
}

export function normalizeAppPreferences(value) {
  const appearance = normalizeAppearancePreference(value?.appearance);
  const gameDayDetailLevel = normalizeGameDayDetailLevel(value?.gameDayDetailLevel);
  return Object.freeze({ schemaVersion: 1, appearance, gameDayDetailLevel });
}

export function normalizeGameDayDetailLevel(value) {
  return GAME_DAY_DETAIL_LEVELS.includes(value) ? value : "standard";
}

export function resolveAppearanceTheme(appearance, systemPrefersDark = false) {
  const normalized = normalizeAppearancePreference(appearance);
  return normalized === "system" ? (systemPrefersDark ? "dark" : "light") : normalized;
}

export function normalizeAppearancePreference(value) {
  return APPEARANCE_PREFERENCES.includes(value) ? value : "system";
}

export function readAppearanceStartupPreference(storage = globalThis.localStorage) {
  try {
    return normalizeAppearancePreference(storage?.getItem?.(APPEARANCE_STARTUP_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function writeAppearanceStartupPreference(appearance, storage = globalThis.localStorage) {
  const normalized = normalizeAppearancePreference(appearance);
  try {
    storage?.setItem?.(APPEARANCE_STARTUP_STORAGE_KEY, normalized);
    return true;
  } catch {
    return false;
  }
}

function text(value) {
  return String(value ?? "").trim();
}
