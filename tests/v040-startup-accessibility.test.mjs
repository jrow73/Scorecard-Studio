import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  APPEARANCE_STARTUP_STORAGE_KEY,
  readAppearanceStartupPreference,
  writeAppearanceStartupPreference
} from "../js/v040-settings.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("startup appearance mirror is bounded, failure-safe, and separate from authoritative preferences", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  assert.equal(APPEARANCE_STARTUP_STORAGE_KEY, "scorecardStudio.appearance");
  assert.equal(readAppearanceStartupPreference(storage), "system");
  assert.equal(writeAppearanceStartupPreference("dark", storage), true);
  assert.equal(values.get(APPEARANCE_STARTUP_STORAGE_KEY), "dark");
  assert.equal(readAppearanceStartupPreference(storage), "dark");
  assert.equal(writeAppearanceStartupPreference("unknown", storage), true);
  assert.equal(readAppearanceStartupPreference(storage), "system");
  const unavailable = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(readAppearanceStartupPreference(unavailable), "system");
  assert.equal(writeAppearanceStartupPreference("light", unavailable), false);
});

test("startup theme is resolved before the stylesheet and reconciled from IndexedDB", async () => {
  const [html, app] = await Promise.all([read("index.html"), read("js/app.js")]);
  const bootstrap = html.indexOf('const key = "scorecardStudio.appearance"');
  const stylesheet = html.indexOf('<link rel="stylesheet"');
  assert.ok(bootstrap > 0 && bootstrap < stylesheet, "The startup theme bootstrap must run before CSS is requested.");
  assert.match(html.slice(bootstrap, stylesheet), /prefers-color-scheme: dark/);
  assert.match(html.slice(bootstrap, stylesheet), /document\.documentElement\.dataset\.theme = theme/);
  const initializeSettings = app.slice(app.indexOf("async function initializeFavoriteTeamSetting"), app.indexOf("async function loadSettingsTeams"));
  assert.match(initializeSettings, /getSetting\(APP_PREFERENCES_SETTING_KEY, null\)/);
  assert.match(initializeSettings, /applyAppearancePreference\(preferences\)/);
  const apply = app.slice(app.indexOf("function applyAppearancePreference"), app.indexOf("async function handleAppearancePreferenceChange"));
  assert.match(apply, /writeAppearanceStartupPreference\(normalized\.appearance\)/);
});

test("reduced-motion preference disables decorative motion and smooth programmatic scrolling", async () => {
  const [css, app] = await Promise.all([read("css/styles.css"), read("js/app.js")]);
  const reduced = css.slice(css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reduced, /animation-duration: \.01ms !important/);
  assert.match(reduced, /animation-iteration-count: 1 !important/);
  assert.match(reduced, /transition-duration: \.01ms !important/);
  assert.match(reduced, /scroll-behavior: auto !important/);
  assert.match(app, /window\.matchMedia\?\.\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.equal((app.match(/scrollIntoView\(\{ behavior: preferredScrollBehavior\(\)/g) || []).length, 2);
});

test("keyboard users can bypass navigation and every modal has a programmatic name", async () => {
  const [html, css] = await Promise.all([read("index.html"), read("css/styles.css")]);
  assert.match(html, /<a class="skip-link" href="#main-content">Skip to main content<\/a>/);
  assert.match(html, /<main class="main-panel" id="main-content" tabindex="-1">/);
  assert.doesNotMatch(css, /\.skip-link[\s\S]*?transform: translateY\(calc\(-100%/);
  assert.match(css, /\.skip-link[\s\S]*?opacity: 0;[\s\S]*?pointer-events: none/);
  assert.match(css, /\.skip-link:focus,[\s\S]*?\.skip-link:focus-visible[\s\S]*?opacity: 1;[\s\S]*?pointer-events: auto/);
  assert.match(css, /button:focus-visible,[\s\S]*?summary:focus-visible[\s\S]*?outline: 3px solid/);
  const dialogs = [...html.matchAll(/<dialog\s+([^>]+)>/g)];
  assert.equal(dialogs.length, 4);
  for (const [, attributes] of dialogs) {
    const labelId = attributes.match(/aria-labelledby="([^"]+)"/)?.[1];
    assert.ok(labelId, `Dialog is missing aria-labelledby: ${attributes}`);
    assert.match(html, new RegExp(`id="${labelId}"`));
  }
});
