import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 004.5a keeps all Layout Settings editors inside one stable dialog with a true top-right close control", async () => {
  const [html, app, css] = await Promise.all([read("index.html"), read("js/app.js"), read("css/styles.css")]);
  const settingsMarkup = html.slice(html.indexOf('<dialog id="layout-formatting-dialog"'), html.indexOf('<dialog id="layout-pdf-error-dialog"'));

  assert.equal((settingsMarkup.match(/<dialog\b/g) || []).length, 1);
  for (const id of ["layout-settings-summary-view", "layout-details-dialog", "layout-custom-fields-dialog", "layout-default-formatting-dialog"]) {
    assert.match(settingsMarkup, new RegExp(`<section id="${id}"`));
  }
  assert.doesNotMatch(settingsMarkup, /id="layout-settings-back"/);
  assert.match(app, /function showLayoutSettingsView\(view = "summary"/);
  assert.match(app, /function requestCloseLayoutSettingsEditor\(\)/);
  assert.match(app, /function requestCloseLayoutSettingsSurface\(\)[\s\S]*?layoutSettingsView === "summary"[\s\S]*?requestCloseLayoutSettingsEditor\(\)/);
  assert.match(app, /function requestCloseLayoutSettings\(\)/);
  assert.match(app, /layoutSettingsClose\?\.addEventListener\("click", requestCloseLayoutSettingsSurface\)/);
  assert.doesNotMatch(app, /layoutSettingsClose\?\.addEventListener\("click", requestCloseLayoutSettings\)/);
  assert.doesNotMatch(app, /layout(?:CustomFields|Details|DefaultFormatting)Dialog\?\.(?:showModal|close)\(/);
  assert.match(css, /\.layout-settings-shell\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*height:\s*min\(84vh, 900px\)/s);
  assert.match(css, /\.layout-settings-shell-body\s*\{[^}]*flex:\s*1 1 auto;[^}]*min-height:\s*0;[^}]*overflow:\s*auto;/s);
  assert.match(css, /\.layout-settings-shell-footer\s*\{[^}]*flex:\s*0 0 auto;/s);
  assert.match(css, /\.layout-settings-shell-heading\s*\{\s*grid-column:\s*1;/);
  assert.match(css, /\.layout-settings-shell-close\s*\{[^}]*grid-column:\s*2;/s);
});

test("Field Palette provides progressive disclosure, search, and default-on mirroring", async () => {
  const [html, app] = await Promise.all([read("index.html"), read("js/app.js")]);

  assert.match(html, /id="layout-field-search"[^>]*type="search"/);
  assert.match(html, /id="layout-field-mirror"[^>]*checked/);
  assert.match(html, /id="layout-fields-expand-all"/);
  assert.match(html, /id="layout-fields-collapse-all"/);
  assert.match(app, /document\.createElement\("details"\)/);
  assert.match(app, /section\.open = Boolean\(q\) \|\| state\.layoutFieldExpanded\.has\(group\.key\)/);
  assert.match(app, /state\.layoutFieldMirror = true/);
  assert.match(app, /updateMirroredFieldSelection\(/);
});

test("Field Palette combines mirrored categories into permanent Away and Home columns", async () => {
  const [app, css] = await Promise.all([read("js/app.js"), read("css/styles.css")]);
  for (const label of [
    "Game Day Information", "Venue Information", "Team Information", "Team Records", "Team Standings",
    "Team Personnel", "Starting Pitchers", "Starting Lineup", "Bench", "Bullpen"
  ]) assert.match(app, new RegExp(`label: "${label}"`));

  assert.doesNotMatch(app, /key: "away-(?:team|record|standings|personnel|starting-pitcher|lineup|bench|bullpen)"/);
  assert.match(app, /categories: \["Game", "Game \/ Weather", "Game \/ Umpires"\]/);
  assert.match(app, /items\.className = "layout-field-picker-side-grid"/);
  assert.match(app, /heading\.append\(headingCopy, actions\)/);
  assert.match(app, /button\[data-picker-action\][\s\S]*?event\.preventDefault\(\)/);
  assert.match(css, /\.layout-field-picker-side-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(0, 1fr\)/s);
  assert.doesNotMatch(css, /@media \(max-width: 800px\)[\s\S]*?\.layout-field-picker-side-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test("each category restores its own standard fields and has a distinct themed header", async () => {
  const [app, css] = await Promise.all([read("js/app.js"), read("css/styles.css")]);

  assert.match(app, /restoreStandard\.textContent = "Standard Fields"/);
  assert.match(app, /restoreStandard\.dataset\.standardFieldIds = standardFieldIds/);
  assert.match(app, /button\.dataset\.pickerAction === "standard"/);
  assert.match(app, /restoreStandardFieldSelection\(state\.layoutFieldDraft, ids, standardIds\)/);
  assert.match(css, /\.layout-custom-fields-view \.layout-field-picker-heading\s*\{[^}]*border-left:\s*4px solid[^}]*background:/s);
  assert.match(css, /\.layout-custom-fields-view \.layout-field-picker-group\s*\{[^}]*border-color:[^}]*box-shadow:/s);
  assert.match(css, /:root\[data-theme="light"\] \.layout-custom-fields-view \.layout-field-picker-heading/);
});

