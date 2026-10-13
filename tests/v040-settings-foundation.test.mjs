import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_APP_PREFERENCES,
  APPEARANCE_PREFERENCES,
  SUPPORTED_COMPETITION_LEVELS,
  migrateFavoriteCompetition,
  normalizeAppPreferences,
  normalizeFavoriteCompetition,
  resolveAppearanceTheme
} from "../js/v040-settings.js";
import { fetchTeamsForSport } from "../js/api.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("settings expose only the five evidence-backed competition levels", () => {
  assert.deepEqual(SUPPORTED_COMPETITION_LEVELS.map(({ levelKey, sportId, label }) => ({ levelKey, sportId, label })), [
    { levelKey: "mlb", sportId: 1, label: "MLB" },
    { levelKey: "triple-a", sportId: 11, label: "Triple-A" },
    { levelKey: "double-a", sportId: 12, label: "Double-A" },
    { levelKey: "high-a", sportId: 13, label: "High-A" },
    { levelKey: "single-a", sportId: 14, label: "Single-A" }
  ]);
});

test("v0.3 favorite teams migrate losslessly into MLB competition context", () => {
  assert.deepEqual(migrateFavoriteCompetition(null, { id: 118, name: "Kansas City Royals" }), {
    value: { levelKey: "mlb", sportId: 1, teamId: 118, teamName: "Kansas City Royals" },
    migrated: true,
    source: "legacy-v0.3"
  });
});

test("current competition-aware favorites win and retain optional league identity", () => {
  const current = { levelKey: "double-a", sportId: 12, teamId: 567, teamName: "Example Club", leagueId: 111, leagueName: "Example League" };
  assert.deepEqual(migrateFavoriteCompetition(current, { id: 136, name: "Seattle Mariners" }), {
    value: current,
    migrated: false,
    source: "current"
  });
  assert.equal(normalizeFavoriteCompetition({ sportId: 999, teamId: 1, teamName: "Unknown" }), null);
});

test("a new installation has no fabricated favorite and preferences are extensible", () => {
  assert.deepEqual(migrateFavoriteCompetition(null, null), { value: null, migrated: false, source: "none" });
  assert.deepEqual(normalizeAppPreferences(null), DEFAULT_APP_PREFERENCES);
  assert.deepEqual(normalizeAppPreferences({ appearance: "dark", ignored: true }), { schemaVersion: 1, appearance: "dark", gameDayDetailLevel: "standard" });
  assert.deepEqual(APPEARANCE_PREFERENCES, ["system", "light", "dark"]);
  assert.equal(resolveAppearanceTheme("system", false), "light");
  assert.equal(resolveAppearanceTheme("system", true), "dark");
  assert.equal(resolveAppearanceTheme("light", true), "light");
  assert.equal(resolveAppearanceTheme("dark", false), "dark");
});

test("team discovery is sport-scoped and preserves returned league identity", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return {
      ok: true,
      json: async () => ({ teams: [
        { id: 22, name: "Zulu Club", sport: { id: 12 }, league: { id: 110, name: "Eastern League" } },
        { id: 11, name: "Alpha Club", sport: { id: 12 }, league: { id: 111, name: "Southern League" } }
      ] })
    };
  };
  try {
    assert.deepEqual(await fetchTeamsForSport(12, 2026), [
      { id: 11, name: "Alpha Club", sportId: 12, leagueId: 111, leagueName: "Southern League" },
      { id: 22, name: "Zulu Club", sportId: 12, leagueId: 110, leagueName: "Eastern League" }
    ]);
    const url = new URL(requestedUrl);
    assert.equal(url.pathname, "/api/v1/teams");
    assert.equal(url.searchParams.get("sportId"), "12");
    assert.equal(url.searchParams.get("season"), "2026");
    assert.equal(url.searchParams.get("activeStatus"), "Y");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Settings owns favorite editing and Home no longer contains the editor", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  const app = await readFile(path.join(root, "js", "app.js"), "utf8");
  const api = await readFile(path.join(root, "js", "api.js"), "utf8");
  const meta = JSON.parse(await readFile(path.join(root, "app-meta.json"), "utf8"));
  assert.match(html, /id="nav-settings"/);
  assert.match(html, /data-view="settings"/);
  assert.match(html, /id="favorite-level-select"/);
  assert.doesNotMatch(html, /class="card favorite-card" data-view="home"/);
  assert.match(app, /setSetting\(FAVORITE_COMPETITION_SETTING_KEY/);
  assert.match(app, /fetchSportScheduleBundle\(requestedDate, level\.sportId\)/);
  assert.match(app, /state\.favoriteCompetition\?\.levelKey === level\.levelKey/);
  assert.match(app, /version\.includes\("-dev"\)/);
  assert.match(api, /export async function fetchTeamsForSport/);
  assert.deepEqual(meta, { version: "0.4.0", build: "004.9" });
});
