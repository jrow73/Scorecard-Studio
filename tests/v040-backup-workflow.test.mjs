import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function sources() {
  const [html, app, storage, styles, meta] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "js", "app.js"), "utf8"),
    readFile(path.join(root, "js", "storage.js"), "utf8"),
    readFile(path.join(root, "css", "styles.css"), "utf8"),
    readFile(path.join(root, "app-meta.json"), "utf8")
  ]);
  return { html, app, storage, styles, meta: JSON.parse(meta) };
}

test("Settings exposes complete, single-layout, and staged restore controls", async () => {
  const { html, styles } = await sources();
  assert.match(html, /id="backup-complete-btn"/);
  assert.match(html, /id="backup-layout-select"/);
  assert.match(html, /id="backup-layout-btn"/);
  assert.match(html, /id="backup-open-restore-btn"/);
  assert.match(html, /id="backup-restore-file-btn"[^>]*type="button"/);
  assert.match(html, /id="backup-restore-file"[^>]*accept="application\/json,\.json"/);
  assert.match(html, /id="backup-preflight"[^>]*hidden/);
  assert.match(html, /id="backup-review-restore-btn"[^>]*disabled/);
  assert.match(html, /id="backup-restore-dialog"/);
  assert.match(html, /id="backup-confirm-stage"[^>]*hidden/);
  assert.match(html, /id="backup-complete-stage"[^>]*hidden/);
  assert.match(html, /id="backup-confirm-restore-btn"/);
  assert.match(styles, /v0\.4 Build 002\.5 — backup and restore workflows/);
});

test("file selection stays read-only until a separately confirmed atomic commit", async () => {
  const { app } = await sources();
  const selection = app.slice(app.indexOf("async function handleBackupRestoreFile"), app.indexOf("function renderBackupPreflight"));
  assert.match(selection, /readBackupStorageSnapshot\(\)/);
  assert.match(selection, /const fileText = await file\.text\(\)/);
  assert.match(selection, /preflightBackupImport\(fileText, currentStorage\)/);
  assert.doesNotMatch(selection, /commitBackupRestore\(/);
  assert.doesNotMatch(selection, /commitBackupRestoreOperations\(/);

  const review = app.slice(app.indexOf("function reviewBackupRestore"), app.indexOf("async function confirmBackupRestore"));
  assert.match(review, /createRestoreCommitPlan\(state\.backupPreflight/);
  assert.match(review, /state\.backupCurrentStorage/);
  assert.doesNotMatch(review, /commitBackupRestore\(/);

  const commit = app.slice(app.indexOf("async function confirmBackupRestore"), app.indexOf("function clearBackupRestorePreview"));
  assert.match(commit, /const commitPlan = state\.backupCommitPlan/);
  assert.match(commit, /await commitBackupRestore\(commitPlan\)/);
  assert.match(commit, /await refreshApplicationAfterRestore\(\)/);
  const refresh = app.slice(app.indexOf("async function refreshApplicationAfterRestore"), app.indexOf("function clearBackupRestorePreview"));
  assert.match(refresh, /await initializeFavoriteTeamSetting\(\{ throwOnError: true \}\)/);
  assert.match(refresh, /loadSettingsTeams\(.+\{ preserveSavedFavorite: true \}\)/);
  assert.match(refresh, /await refreshLayouts\(\{ throwOnError: true \}\)/);
});

test("conflict UI requires explicit policy and blocks unsafe shared-PDF replacement", async () => {
  const { app } = await sources();
  const row = app.slice(app.indexOf("function createBackupConflictRow"), app.indexOf("function updateRestoreReviewAvailability"));
  assert.match(row, /new Option\("Choose an action…", ""\)/);
  assert.match(row, /replace\.disabled = sharedPdf/);
  assert.match(row, /RESTORE_POLICIES\.REPLACE/);
  assert.match(row, /RESTORE_POLICIES\.KEEP_BOTH/);
  assert.match(row, /RESTORE_POLICIES\.SKIP/);
  assert.match(app, /\.every\(\(select\) => Boolean\(select\.value\)\)/);
});

test("exports use the consistent portable snapshot and current runtime metadata", async () => {
  const { app, storage, meta } = await sources();
  assert.match(app, /const snapshot = await readBackupStorageSnapshot\(\)/);
  assert.match(app, /createBackupExport\(snapshot/);
  assert.match(app, /applicationVersion: "0\.4\.0", build: "004\.9", storageDatabaseVersion: STORAGE_DATABASE_VERSION/);
  assert.match(storage, /export const STORAGE_DATABASE_VERSION = DB_VERSION/);
  assert.deepEqual(meta, { version: "0.4.0", build: "004.9" });
});

test("the browser entry point cache-busts the visible workflow release", async () => {
  const { html } = await sources();
  assert.match(html, /css\/styles\.css\?v=040/);
  assert.match(html, /js\/app\.js\?v=040/);
});

test("Build 003.5 keeps choose, review, confirm, and completion in one progressive modal", async () => {
  const { html, app, styles } = await sources();
  assert.match(html, /Complete backup/);
  assert.match(html, /One layout/);
  assert.match(html, /Import Backup…/);
  assert.match(html, /aria-label="Restore steps"/);
  assert.match(html, /id="backup-restore-dialog"/);
  assert.match(html, /id="backup-select-stage"/);
  assert.match(html, /id="backup-preflight"[^>]*hidden/);
  assert.match(html, /id="backup-confirm-stage"[^>]*hidden/);
  assert.match(html, /id="backup-complete-stage"[^>]*hidden/);
  assert.match(html, /Restore This Backup\?/);
  assert.match(html, /id="backup-status"[^>]*aria-atomic="true"/);
  assert.match(app, /function showBackupRestoreStage\(stage\)/);
  assert.match(app, /showBackupRestoreStage\("review"\)/);
  assert.match(app, /showBackupRestoreStage\("confirm"\)/);
  assert.match(app, /showBackupRestoreStage\("complete"\)/);
  assert.match(app, /const report = typeof options\.report[\s\S]*report\("Preparing your backup…", "working"\)/);
  assert.match(app, /setBackupStatus\("Checking this backup without changing browser storage…", "working"\)/);
  assert.match(app, /setBackupStatus\("Restoring the approved records…", "working"\)/);
  assert.match(app, /No conflicts found\. Existing unrelated layouts and PDFs will remain in place\./);
  assert.match(app, /backupStatus\.setAttribute\("aria-busy", String\(busy\)\)/);
  assert.match(styles, /\.backup-status\.working::before/);
  assert.match(styles, /\.backup-restore-dialog\s*\{/);
  assert.match(styles, /max-width: calc\(100vw - 32px\)/);
  assert.match(styles, /overflow-x: hidden/);
});
