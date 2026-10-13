import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { BACKUP_SCOPES, createBackupExport } from "../js/v040-backup-export.js";
import { preflightBackupImport } from "../js/v040-backup-import.js";
import { RESTORE_POLICIES, commitBackupRestore, createRestoreCommitPlan } from "../js/v040-backup-restore.js";
import { normalizeAppPreferences, resolveAppearanceTheme } from "../js/v040-settings.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const updatedAt = "2026-10-10T16:00:00.000Z";
const exportOptions = Object.freeze({
  backupId: "build-003-closure",
  createdAtUtc: "2026-10-10T16:05:00.000Z",
  source: { applicationVersion: "0.4.0-dev", build: "003.5", storageDatabaseVersion: 4 }
});

function portableState() {
  const pdfBytes = new TextEncoder().encode("%PDF-1.4\nBuild 003 closure");
  return {
    settings: [
      { key: "appPreferencesV1", value: { schemaVersion: 1, appearance: "dark" }, updatedAt },
      { key: "favoriteCompetition", value: { levelKey: "double-a", sportId: 12, teamId: 555, teamName: "Portable Club", leagueId: 123, leagueName: "Portable League" }, updatedAt },
      { key: "favoriteLayoutId", value: "layout-a", updatedAt },
      { key: "livePdfLayoutId", value: "layout-a", updatedAt },
      { key: "includeAdditionalStarters", value: true, updatedAt }
    ],
    layouts: [{ id: "layout-a", schemaVersion: 2, name: "Portable Layout", pdfTemplateId: "pdf-a", mappings: [], repeatedBlocks: [], createdAt: updatedAt, updatedAt }],
    pdfTemplates: [{ key: "pdf-a", name: "portable.pdf", type: "application/pdf", size: pdfBytes.byteLength, blob: new Blob([pdfBytes], { type: "application/pdf" }), updatedAt }]
  };
}

async function commitToMemory(plan) {
  let written = null;
  await commitBackupRestore(plan, { storageCommit: async (operations) => {
    written = operations;
    return {
      settings: operations.settings.length,
      layouts: operations.layouts.length,
      pdfTemplates: operations.pdfTemplates.length
    };
  } });
  return written;
}

test("complete backup round-trips every current portable preference and excludes transient settings", async () => {
  const exported = await createBackupExport(portableState(), exportOptions);
  assert.deepEqual(exported.envelope.settings.map((record) => record.key), ["appPreferencesV1", "favoriteCompetition", "favoriteLayoutId"]);

  const preflight = await preflightBackupImport(exported.json, { settings: [], layouts: [], pdfTemplates: [] });
  assert.equal(preflight.valid, true, JSON.stringify(preflight.diagnostics));
  const plan = createRestoreCommitPlan(preflight, {}, { currentStorage: { settings: [], layouts: [], pdfTemplates: [] }, committedAtUtc: "2026-10-10T16:10:00.000Z" });
  const written = await commitToMemory(plan);
  assert.deepEqual(written.settings.map((record) => record.key), ["appPreferencesV1", "favoriteCompetition", "favoriteLayoutId"]);
  assert.equal(written.settings.find((record) => record.key === "favoriteLayoutId")?.value, "layout-a");
  assert.equal(written.settings.find((record) => record.key === "favoriteCompetition")?.value.teamId, 555);
  const preferences = normalizeAppPreferences(written.settings.find((record) => record.key === "appPreferencesV1")?.value);
  assert.equal(preferences.appearance, "dark");
  assert.equal(resolveAppearanceTheme(preferences.appearance, false), "dark");
});

test("single-layout backup remains preference-isolated", async () => {
  const exported = await createBackupExport(portableState(), { ...exportOptions, scope: BACKUP_SCOPES.SINGLE_LAYOUT, layoutId: "layout-a" });
  assert.deepEqual(exported.envelope.settings, []);
  assert.deepEqual(exported.envelope.layouts.map((record) => record.id), ["layout-a"]);
  assert.deepEqual(exported.envelope.pdfTemplates.map((record) => record.key), ["pdf-a"]);
});

test("Keep Both rewrites the portable favorite-layout reference to the restored copy", async () => {
  const source = portableState();
  const exported = await createBackupExport(source, exportOptions);
  const current = portableState();
  const preflight = await preflightBackupImport(exported.json, current);
  assert.equal(preflight.valid, true, JSON.stringify(preflight.diagnostics));
  assert.equal(preflight.plan.layouts[0].requiresChoice, true);
  const plan = createRestoreCommitPlan(preflight, { layouts: { "layout-a": RESTORE_POLICIES.KEEP_BOTH } }, {
    currentStorage: current,
    committedAtUtc: "2026-10-10T16:10:00.000Z",
    idFactory: (kind) => kind === "layout" ? "layout-copy" : "pdf-copy"
  });
  const written = await commitToMemory(plan);
  assert.equal(written.layouts[0].id, "layout-copy");
  assert.equal(written.layouts[0].pdfTemplateId, "pdf-copy");
  assert.equal(written.pdfTemplates[0].key, "pdf-copy");
  assert.equal(written.settings.find((record) => record.key === "favoriteLayoutId")?.value, "layout-copy");
});

test("post-restore refresh reapplies appearance and favorite state before refreshing layouts", async () => {
  const app = await readFile(path.join(root, "js", "app.js"), "utf8");
  const refresh = app.slice(app.indexOf("async function refreshApplicationAfterRestore"), app.indexOf("function clearBackupRestorePreview"));
  assert.ok(refresh.indexOf("await initializeFavoriteTeamSetting({ throwOnError: true })") < refresh.indexOf("await refreshLayouts({ throwOnError: true })"));
  assert.match(app, /state\.appPreferences = preferences;\s*applyAppearancePreference\(preferences\)/);
  assert.match(app, /state\.favoriteCompetition = migration\.value/);
});

test("Build 003 closure leaves the protected product contract unchanged", async () => {
  const [meta, readme] = await Promise.all([
    readFile(path.join(root, "app-meta.json"), "utf8").then(JSON.parse),
    readFile(path.join(root, "README.md"), "utf8")
  ]);
  assert.deepEqual(meta, { version: "0.4.0", build: "004.9" });
  assert.match(readme, /Scorecard Studio/);
});
