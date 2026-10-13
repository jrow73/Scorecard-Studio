import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 004.8d publishes one current browser identity across runtime and exports", async () => {
  const [metaText, html, app] = await Promise.all([
    read("app-meta.json"),
    read("index.html"),
    read("js/app.js")
  ]);
  assert.deepEqual(JSON.parse(metaText), { version: "0.4.0", build: "004.9" });
  assert.match(html, /css\/styles\.css\?v=040/);
  assert.match(html, /js\/app\.js\?v=040/);
  assert.match(app, /applicationVersion: "0\.4\.0", build: "004\.9", storageDatabaseVersion/);
});

test("browser acceptance covers appearance, storage, complete download integrity, responsive layout, and console failures", async () => {
  const script = await read("tools/run-v040-browser-acceptance.mjs");
  assert.match(script, /IndexedDB ready/);
  assert.match(script, /chooseAppearance\("light"\)/);
  assert.match(script, /chooseAppearance\("dark"\)/);
  assert.match(script, /chooseAppearance\("system"\)/);
  assert.match(script, /startupMirror: win\.localStorage\.getItem\("scorecardStudio\.appearance"\)/);
  assert.match(script, /assert\.notEqual\(result\.appearance\.light\.text, result\.appearance\.dark\.text\)/);
  assert.match(script, /for \(const view of \["home", "gameday", "layouts", "settings"\]\)/);
  assert.match(script, /horizontalOverflow: view\.scrollWidth > view\.clientWidth \+ 1/);
  assert.match(script, /__scorecardAcceptance\.blobs/);
  assert.match(script, /scorecard-studio-backup/);
  assert.match(script, /formatVersion: 1/);
  assert.match(script, /horizontalOverflow/);
  assert.match(script, /#backup-open-restore-btn/);
  assert.match(script, /#backup-restore-dialog/);
  assert.match(script, /initialStep: "Step 1 of 3 · Choose"/);
  assert.match(script, /withinViewport: true/);
  assert.match(script, /initialFocus: "backup-restore-dialog-title"/);
  assert.match(script, /skipLinkFirst: true/);
  assert.match(script, /namedDialogs: true/);
  assert.match(script, /unhandledrejection/);
  assert.match(script, /for \(const method of \["warn", "error"\]\)/);
  assert.match(script, /manual-required/);
});

test("browser acceptance uses isolated disposable profiles and never commits a restore", async () => {
  const script = await read("tools/run-v040-browser-acceptance.mjs");
  assert.match(script, /--user-data-dir=/);
  assert.match(script, /scorecard-browser-profile-/);
  assert.match(script, /__acceptance__\.html/);
  assert.doesNotMatch(script, /backup-confirm-restore-btn/);
  assert.doesNotMatch(script, /commitBackupRestore/);
});
