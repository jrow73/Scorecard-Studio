import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Settings exposes one accessible System, Light, and Dark appearance group", async () => {
  const html = await read("index.html");
  assert.match(html, /id="appearance-options"/);
  assert.match(html, /<legend class="sr-only">Application appearance<\/legend>/);
  assert.equal((html.match(/name="appearance"/g) || []).length, 3);
  for (const value of ["system", "light", "dark"]) assert.match(html, new RegExp(`value="${value}"`));
  assert.match(html, /id="appearance-status" role="status" aria-live="polite"/);
});

test("appearance applies immediately, persists generically, and rolls back on save failure", async () => {
  const app = await read("js/app.js");
  const apply = app.slice(app.indexOf("function applyAppearancePreference"), app.indexOf("async function handleAppearancePreferenceChange"));
  const change = app.slice(app.indexOf("async function handleAppearancePreferenceChange"), app.indexOf("function handleSystemAppearanceChange"));
  assert.match(apply, /resolveAppearanceTheme\(normalized\.appearance, systemDarkMode\?\.matches === true\)/);
  assert.match(apply, /document\.documentElement\.dataset\.appearance = normalized\.appearance/);
  assert.match(apply, /document\.documentElement\.dataset\.theme = theme/);
  assert.match(apply, /document\.documentElement\.style\.colorScheme = theme/);
  assert.ok(change.indexOf("applyAppearancePreference(next)") < change.indexOf("await setSetting(APP_PREFERENCES_SETTING_KEY, next)"));
  assert.match(change, /applyAppearancePreference\(previous\)/);
  assert.match(change, /appearanceStatus\.classList\.add\("error"\)/);
});

test("System appearance follows operating-system changes without rewriting the preference", async () => {
  const app = await read("js/app.js");
  assert.match(app, /window\.matchMedia\?\.\("\(prefers-color-scheme: dark\)"\)/);
  assert.match(app, /systemDarkMode\?\.addEventListener\?\.\("change", handleSystemAppearanceChange\)/);
  const system = app.slice(app.indexOf("function handleSystemAppearanceChange"), app.indexOf("function preferredScrollBehavior"));
  assert.match(system, /state\.appPreferences\.appearance === "system"/);
  assert.match(system, /applyAppearancePreference\(state\.appPreferences\)/);
  assert.doesNotMatch(system, /setSetting/);
});

test("startup and successful restore both apply the persisted appearance record", async () => {
  const app = await read("js/app.js");
  const initializeSettings = app.slice(app.indexOf("async function initializeFavoriteTeamSetting"), app.indexOf("async function loadSettingsTeams"));
  const restoreRefresh = app.slice(app.indexOf("async function refreshApplicationAfterRestore"), app.indexOf("function clearBackupRestorePreview"));
  assert.match(initializeSettings, /getSetting\(APP_PREFERENCES_SETTING_KEY, null\)/);
  assert.match(initializeSettings, /state\.appPreferences = preferences/);
  assert.match(initializeSettings, /applyAppearancePreference\(preferences\)/);
  assert.match(restoreRefresh, /initializeFavoriteTeamSetting\(\{ throwOnError: true \}\)/);
});

test("the light theme changes application chrome without altering the white PDF work surface", async () => {
  const css = await read("css/styles.css");
  assert.match(css, /:root\[data-theme="light"\]/);
  assert.match(css, /:root\[data-theme="light"\] body/);
  assert.match(css, /:root\[data-theme="light"\] \.app-header/);
  assert.match(css, /:root\[data-theme="light"\] \.card/);
  assert.match(css, /\.designer-stage[\s\S]*?background: #fff/);
});
