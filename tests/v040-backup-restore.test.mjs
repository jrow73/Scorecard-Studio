import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createBackupExport } from "../js/v040-backup-export.js";
import { preflightBackupImport } from "../js/v040-backup-import.js";
import { RESTORE_POLICIES, commitBackupRestore, createRestoreCommitPlan } from "../js/v040-backup-restore.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const committedAtUtc = "2026-10-09T20:00:00.000Z";

function sourceData() {
  const bytes = new TextEncoder().encode("%PDF-1.4\nrestore");
  return {
    settings: [
      { key: "appPreferencesV1", value: { schemaVersion: 1, appearance: "dark" } },
      { key: "favoriteLayoutId", value: "layout-1" }
    ],
    layouts: [{
      id: "layout-1",
      schemaVersion: 7,
      name: "Imported Layout",
      pdfTemplateId: "pdf-1",
      mappings: [],
      repeatedBlocks: [{ id: "pen", collection: "away.bullpen", columns: [] }],
      futureLayoutProperty: { preserve: true }
    }],
    pdfTemplates: [{ key: "pdf-1", name: "restore.pdf", type: "application/pdf", blob: new Blob([bytes], { type: "application/pdf" }) }]
  };
}

async function conflictPreflight(currentStorage) {
  const exported = await createBackupExport(sourceData(), {
    backupId: "restore-backup",
    createdAtUtc: "2026-10-09T19:00:00.000Z",
    source: { applicationVersion: "0.4.0-dev", build: "002.3", storageDatabaseVersion: 4 }
  });
  return preflightBackupImport(exported.json, currentStorage);
}

test("Replace preserves imported identities and creates one coherent layout/PDF unit", async () => {
  const current = {
    settings: [{ key: "appPreferencesV1", value: { schemaVersion: 1, appearance: "system" } }],
    layouts: [{ id: "layout-1", name: "Old Layout", pdfTemplateId: "pdf-1" }],
    pdfTemplates: [{ key: "pdf-1" }]
  };
  const preflight = await conflictPreflight(current);
  const before = JSON.stringify(preflight.envelope);
  const plan = createRestoreCommitPlan(preflight, { layouts: { "layout-1": RESTORE_POLICIES.REPLACE } }, { currentStorage: current, committedAtUtc });
  assert.equal(plan.readyToCommit, true);
  assert.deepEqual(plan.summary, { layouts: 1, pdfTemplates: 1, settings: 2, replaced: 1, keptBoth: 0, skipped: 0 });
  assert.equal(plan.operations.layouts[0].id, "layout-1");
  assert.equal(plan.operations.layouts[0].pdfTemplateId, "pdf-1");
  assert.equal(plan.operations.layouts[0].futureLayoutProperty.preserve, true);
  assert.equal(Object.hasOwn(plan.operations.layouts[0].repeatedBlocks[0], "pitcherGroup"), false);
  assert.equal(plan.operations.pdfTemplates[0].key, "pdf-1");
  assert.equal(plan.operations.pdfTemplates[0].blob instanceof Blob, true);
  assert.equal(plan.operations.settings.find((row) => row.key === "favoriteLayoutId").value, "layout-1");
  assert.equal(JSON.stringify(preflight.envelope), before);
});

test("Keep Both allocates collision-safe IDs and names and rewrites every reference", async () => {
  const current = {
    settings: [],
    layouts: [
      { id: "layout-1", name: "Imported Layout", pdfTemplateId: "pdf-1" },
      { id: "existing-2", name: "Imported Layout (Imported)", pdfTemplateId: "other-pdf" }
    ],
    pdfTemplates: [{ key: "pdf-1" }, { key: "other-pdf" }]
  };
  const preflight = await conflictPreflight(current);
  const factory = (kind, sourceId, attempt) => attempt === 1 ? sourceId : `${sourceId}-${kind}-copy-${attempt}`;
  const plan = createRestoreCommitPlan(preflight, { defaultPolicy: RESTORE_POLICIES.KEEP_BOTH }, { currentStorage: current, committedAtUtc, idFactory: factory });
  const layout = plan.operations.layouts[0];
  const pdf = plan.operations.pdfTemplates[0];
  assert.equal(layout.id, "layout-1-layout-copy-2");
  assert.equal(layout.pdfTemplateId, "pdf-1-pdfTemplate-copy-2");
  assert.equal(layout.name, "Imported Layout (Imported) 2");
  assert.equal(layout.createdAt, committedAtUtc);
  assert.equal(pdf.key, layout.pdfTemplateId);
  assert.equal(plan.operations.settings.find((row) => row.key === "favoriteLayoutId").value, layout.id);
  assert.deepEqual(plan.remaps[0].layoutId, { from: "layout-1", to: layout.id });
  assert.deepEqual(plan.remaps[0].pdfTemplateId, { from: "pdf-1", to: pdf.key });
});

test("Skip writes no layout/PDF unit and drops settings that would reference it", async () => {
  const current = { settings: [], layouts: [{ id: "layout-1", name: "Old", pdfTemplateId: "pdf-1" }], pdfTemplates: [{ key: "pdf-1" }] };
  const preflight = await conflictPreflight(current);
  const plan = createRestoreCommitPlan(preflight, { layouts: { "layout-1": RESTORE_POLICIES.SKIP } }, { currentStorage: current, committedAtUtc });
  assert.deepEqual(plan.operations.layouts, []);
  assert.deepEqual(plan.operations.pdfTemplates, []);
  assert.equal(plan.operations.settings.some((row) => row.key === "favoriteLayoutId"), false);
  assert.equal(plan.operations.settings.some((row) => row.key === "appPreferencesV1"), true);
  assert.equal(plan.diagnostics.some((row) => row.code === "SETTING_REFERENCE_SKIPPED"), true);
  assert.equal(plan.summary.skipped, 1);
});

test("Replace cannot overwrite a PDF used by another existing layout", async () => {
  const current = {
    settings: [],
    layouts: [
      { id: "layout-1", name: "Old", pdfTemplateId: "old-pdf" },
      { id: "other-layout", name: "Other", pdfTemplateId: "pdf-1" }
    ],
    pdfTemplates: [{ key: "old-pdf" }, { key: "pdf-1" }]
  };
  const preflight = await conflictPreflight(current);
  assert.deepEqual(preflight.plan.layouts[0].foreignPdfOwners, ["other-layout"]);
  assert.throws(
    () => createRestoreCommitPlan(preflight, { defaultPolicy: RESTORE_POLICIES.REPLACE }, { currentStorage: current, committedAtUtc }),
    /used by: other-layout/
  );
  assert.doesNotThrow(() => createRestoreCommitPlan(preflight, { defaultPolicy: RESTORE_POLICIES.KEEP_BOTH }, {
    currentStorage: current,
    committedAtUtc,
    idFactory: (kind, sourceId) => `${sourceId}-${kind}-safe`
  }));
});

test("unresolved or unsupported conflict decisions cannot create a commit plan", async () => {
  const current = { settings: [], layouts: [{ id: "layout-1", name: "Old", pdfTemplateId: "pdf-1" }], pdfTemplates: [{ key: "pdf-1" }] };
  const preflight = await conflictPreflight(current);
  assert.throws(() => createRestoreCommitPlan(preflight, {}, { currentStorage: current, committedAtUtc }), /requires Replace, Keep Both, or Skip/);
  assert.throws(() => createRestoreCommitPlan(preflight, { defaultPolicy: "merge" }, { currentStorage: current, committedAtUtc }), /Unsupported restore conflict policy/);
  assert.throws(() => createRestoreCommitPlan({ valid: false }), /valid backup preflight/);
  assert.throws(() => createRestoreCommitPlan(preflight, { defaultPolicy: RESTORE_POLICIES.SKIP }, { committedAtUtc }), /current storage snapshot/);
  assert.throws(() => createRestoreCommitPlan(preflight, { layouts: { missing: RESTORE_POLICIES.SKIP }, defaultPolicy: RESTORE_POLICIES.SKIP }, { currentStorage: current, committedAtUtc }), /unknown layout 'missing'/);
});

test("commit submits all stores once and propagates abort/failure without a success result", async () => {
  const preflight = await conflictPreflight({ settings: [], layouts: [], pdfTemplates: [] });
  const plan = createRestoreCommitPlan(preflight, {}, { currentStorage: {}, committedAtUtc });
  let calls = 0;
  const success = await commitBackupRestore(plan, { storageCommit: async (operations) => {
    calls += 1;
    assert.equal(operations.settings.length, 2);
    assert.equal(operations.layouts.length, 1);
    assert.equal(operations.pdfTemplates.length, 1);
    return { settings: 2, layouts: 1, pdfTemplates: 1 };
  } });
  assert.equal(calls, 1);
  assert.deepEqual(success, { backupId: "restore-backup", committedAtUtc, settings: 2, layouts: 1, pdfTemplates: 1 });

  let failedCalls = 0;
  await assert.rejects(() => commitBackupRestore(plan, { storageCommit: async () => {
    failedCalls += 1;
    throw new Error("transaction aborted");
  } }), /transaction aborted/);
  assert.equal(failedCalls, 1);
  await assert.rejects(() => commitBackupRestore({ operations: plan.operations }, { storageCommit: async () => ({}) }), /confirmed restore commit plan/);
});

test("browser storage commit uses one readwrite transaction across all portable stores", async () => {
  const storage = await readFile(path.join(root, "js", "storage.js"), "utf8");
  assert.match(storage, /export async function commitBackupRestoreOperations/);
  assert.match(storage, /database\.transaction\(\[SETTINGS_STORE, LAYOUT_STORE, PDF_STORE\], "readwrite"\)/);
  assert.match(storage, /settingsStore\.put\(record\)/);
  assert.match(storage, /layoutsStore\.put\(record\)/);
  assert.match(storage, /pdfStore\.put\(record\)/);
  assert.match(storage, /transaction\.onabort/);
});
