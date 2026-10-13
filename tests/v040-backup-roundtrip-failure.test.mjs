import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import { BACKUP_SCOPES, createBackupExport } from "../js/v040-backup-export.js";
import { preflightBackupImport } from "../js/v040-backup-import.js";
import { commitBackupRestore, createRestoreCommitPlan } from "../js/v040-backup-restore.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const createdAtUtc = "2026-10-09T22:00:00.000Z";
const committedAtUtc = "2026-10-09T22:05:00.000Z";
const source = Object.freeze({ applicationVersion: "0.4.0-dev", build: "003.5", storageDatabaseVersion: 4 });

function portableState() {
  const updatedAt = "2026-10-09T21:30:00.000Z";
  return {
    settings: [
      { key: "appPreferencesV1", value: { schemaVersion: 1, appearance: "dark" }, updatedAt },
      { key: "favoriteCompetition", value: { levelKey: "double-a", sportId: 12, teamId: 555, teamName: "Test Club" }, updatedAt },
      { key: "favoriteLayoutId", value: "legacy-layout", updatedAt },
      { key: "livePdfLayoutId", value: "modern-layout", updatedAt },
      { key: "includeAdditionalStarters", value: true, updatedAt }
    ],
    layouts: [
      {
        id: "legacy-layout",
        schemaVersion: 1,
        name: "Historical Layout",
        pdfTemplateId: "legacy-pdf",
        mappings: [{ id: "unknown-map", field: "future.unknown.field", x: 0.1, y: 0.2 }],
        repeatedBlocks: [{ id: "legacy-pen", collection: "away.bullpen", capacity: 12, columns: [] }],
        futureLayoutProperty: { nested: ["preserve", 7, true] },
        createdAt: updatedAt,
        updatedAt
      },
      {
        id: "modern-layout",
        schemaVersion: 2,
        name: "Modern Layout",
        pdfTemplateId: "modern-pdf",
        mappings: [],
        repeatedBlocks: [{ id: "core-pen", collection: "home.bullpen", pitcherGroup: "core", columns: [] }],
        createdAt: updatedAt,
        updatedAt
      }
    ],
    pdfTemplates: [
      pdfRecord("legacy-pdf", "historical.pdf", "%PDF-1.4\nhistorical", updatedAt),
      pdfRecord("modern-pdf", "modern.pdf", "%PDF-1.7\nmodern", updatedAt)
    ]
  };
}

function pdfRecord(key, name, content, updatedAt) {
  const bytes = new TextEncoder().encode(content);
  return { key, name, type: "application/pdf", size: bytes.byteLength, blob: new Blob([bytes], { type: "application/pdf" }), updatedAt };
}

async function exportState(state, options = {}) {
  return createBackupExport(state, {
    backupId: options.backupId || "roundtrip",
    createdAtUtc: options.createdAtUtc || createdAtUtc,
    source,
    ...(options.scope ? { scope: options.scope } : {}),
    ...(options.layoutId ? { layoutId: options.layoutId } : {})
  });
}

async function restoreToMemory(exported, current = { settings: [], layouts: [], pdfTemplates: [] }, decisions = {}) {
  const preflight = await preflightBackupImport(exported.json, current);
  assert.equal(preflight.valid, true, JSON.stringify(preflight.diagnostics));
  const plan = createRestoreCommitPlan(preflight, decisions, { currentStorage: current, committedAtUtc });
  const restored = { settings: [], layouts: [], pdfTemplates: [] };
  const result = await commitBackupRestore(plan, { storageCommit: async (operations) => {
    restored.settings = structuredClone(operations.settings);
    restored.layouts = structuredClone(operations.layouts);
    restored.pdfTemplates = operations.pdfTemplates.map((record) => ({ ...record }));
    return { settings: operations.settings.length, layouts: operations.layouts.length, pdfTemplates: operations.pdfTemplates.length };
  } });
  return { preflight, plan, restored, result };
}

test("complete backup survives export, preflight, commit, and re-export without portable-data drift", async () => {
  const first = await exportState(portableState());
  const { restored, result } = await restoreToMemory(first);
  assert.deepEqual(result, { backupId: "roundtrip", committedAtUtc, settings: 3, layouts: 2, pdfTemplates: 2 });
  const second = await exportState(restored);
  assert.deepEqual(second.envelope.settings, first.envelope.settings);
  assert.deepEqual(second.envelope.layouts, first.envelope.layouts);
  assert.deepEqual(second.envelope.pdfTemplates, first.envelope.pdfTemplates);
});

test("single-layout round trip remains isolated from all global settings and sibling layouts", async () => {
  const first = await exportState(portableState(), { scope: BACKUP_SCOPES.SINGLE_LAYOUT, layoutId: "modern-layout" });
  const { restored, result } = await restoreToMemory(first);
  assert.deepEqual(first.envelope.settings, []);
  assert.deepEqual(result, { backupId: "roundtrip", committedAtUtc, settings: 0, layouts: 1, pdfTemplates: 1 });
  assert.deepEqual(restored.layouts.map((row) => row.id), ["modern-layout"]);
  assert.deepEqual(restored.pdfTemplates.map((row) => row.key), ["modern-pdf"]);
  const second = await exportState(restored, { scope: BACKUP_SCOPES.SINGLE_LAYOUT, layoutId: "modern-layout" });
  assert.deepEqual(second.envelope.layouts, first.envelope.layouts);
  assert.deepEqual(second.envelope.pdfTemplates, first.envelope.pdfTemplates);
});

test("historical layout semantics, unknown fields, and source objects remain untouched", async () => {
  const input = portableState();
  const before = JSON.stringify(input.layouts[0]);
  const exported = await exportState(input);
  const { preflight, restored } = await restoreToMemory(exported);
  const prepared = preflight.prepared.layouts.find((row) => row.id === "legacy-layout");
  const committed = restored.layouts.find((row) => row.id === "legacy-layout");
  assert.equal(JSON.stringify(input.layouts[0]), before);
  assert.deepEqual(prepared, input.layouts[0]);
  assert.deepEqual(committed, input.layouts[0]);
  assert.equal(Object.hasOwn(committed.repeatedBlocks[0], "pitcherGroup"), false);
  assert.equal(committed.mappings[0].field, "future.unknown.field");
  assert.deepEqual(committed.futureLayoutProperty, { nested: ["preserve", 7, true] });
});

test("structural corruption and broken references fail before a writable plan exists", async () => {
  const original = JSON.parse((await exportState(portableState())).json);
  const cases = [];

  const duplicateLayout = structuredClone(original);
  duplicateLayout.layouts.push(structuredClone(duplicateLayout.layouts[0]));
  cases.push([duplicateLayout, "LAYOUT_DUPLICATE"]);

  const duplicatePdf = structuredClone(original);
  duplicatePdf.pdfTemplates.push(structuredClone(duplicatePdf.pdfTemplates[0]));
  cases.push([duplicatePdf, "PDF_DUPLICATE"]);

  const missingPdf = structuredClone(original);
  missingPdf.layouts[0].pdfTemplateId = "missing-pdf";
  cases.push([missingPdf, "LAYOUT_PDF_MISSING"]);

  const tamperedHash = structuredClone(original);
  tamperedHash.pdfTemplates[0].data.sha256 = "F".repeat(64);
  cases.push([tamperedHash, "PDF_HASH_MISMATCH"]);

  for (const [envelope, code] of cases) {
    const result = await preflightBackupImport(JSON.stringify(envelope));
    assert.equal(result.valid, false, code);
    assert.equal(result.writesPerformed, 0, code);
    assert.equal(result.plan, null, code);
    assert.equal(result.diagnostics.some((row) => row.code === code), true, code);
  }
});

test("quota-style transaction abort keeps every portable store unchanged", async () => {
  const fake = createFakeIndexedDb({ failWrites: true });
  const original = globalThis.indexedDB;
  const originalConsoleError = console.error;
  globalThis.indexedDB = fake.indexedDB;
  console.error = () => {};
  try {
    const storage = await freshStorageModule("quota-abort");
    await assert.rejects(() => storage.commitBackupRestoreOperations({
      settings: [{ key: "setting", value: true }],
      layouts: [{ id: "layout" }],
      pdfTemplates: [{ key: "pdf", blob: new Blob(["%PDF-1.4"]) }]
    }), /no partial restore was kept/);
    assert.deepEqual(fake.records(), { settings: [], layouts: [], pdfTemplates: [] });
    assert.equal(fake.transactionCalls.length, 1);
    assert.deepEqual(fake.transactionCalls[0], { stores: ["settings", "layouts", "pdfTemplates"], mode: "readwrite" });
  } finally {
    globalThis.indexedDB = original;
    console.error = originalConsoleError;
  }
});

test("successful storage transaction publishes all three stores together", async () => {
  const fake = createFakeIndexedDb({ failWrites: false });
  const original = globalThis.indexedDB;
  globalThis.indexedDB = fake.indexedDB;
  try {
    const storage = await freshStorageModule("atomic-success");
    const result = await storage.commitBackupRestoreOperations({
      settings: [{ key: "setting", value: true }],
      layouts: [{ id: "layout", name: "Restored" }],
      pdfTemplates: [{ key: "pdf", blob: new Blob(["%PDF-1.4"]) }]
    });
    assert.deepEqual(result, { settings: 1, layouts: 1, pdfTemplates: 1 });
    assert.deepEqual(fake.records(), {
      settings: [{ key: "setting", value: true }],
      layouts: [{ id: "layout", name: "Restored" }],
      pdfTemplates: [{ key: "pdf", blob: new Blob(["%PDF-1.4"]) }]
    });
    assert.equal(fake.transactionCalls.length, 1);
  } finally {
    globalThis.indexedDB = original;
  }
});

test("backup snapshot reopens a connection invalidated by live database deletion", async () => {
  const fake = createDeletedDatabaseIndexedDb();
  const original = globalThis.indexedDB;
  globalThis.indexedDB = fake.indexedDB;
  try {
    const storage = await freshStorageModule("snapshot-reconnect");
    const snapshot = await storage.readBackupStorageSnapshot();
    assert.deepEqual(snapshot.settings, [{ key: "appearance", value: "dark" }]);
    assert.deepEqual(snapshot.layouts, [{ id: "layout-a", name: "A" }]);
    assert.equal(snapshot.pdfTemplates[0].key, "pdf-a");
    assert.equal(snapshot.pdfTemplates[0].blob.size, 8);
    assert.equal(fake.openCalls(), 2);
    assert.equal(fake.atomicReads(), 2);
    assert.equal(fake.staleConnectionClosed(), true);
  } finally {
    globalThis.indexedDB = original;
  }
});

test("workflow guards stale preflights, locks confirmation, and distinguishes refresh failure after commit", async () => {
  const app = await readFile(path.join(root, "js", "app.js"), "utf8");
  const handler = app.slice(app.indexOf("async function handleBackupRestoreFile"), app.indexOf("function renderBackupPreflight"));
  assert.match(handler, /const selectionToken = state\.backupSelectionToken/);
  assert.ok((handler.match(/selectionToken !== state\.backupSelectionToken/g) || []).length >= 4);
  assert.match(handler, /if \(selectionToken === state\.backupSelectionToken\)/);
  assert.match(app, /state\.backupSelectionToken \+= 1/);

  const confirm = app.slice(app.indexOf("async function confirmBackupRestore"), app.indexOf("function clearBackupRestorePreview"));
  assert.match(confirm, /state\.backupCommitInProgress = true/);
  assert.match(confirm, /backupConfirmCancelButton\.disabled = true/);
  assert.match(confirm, /Unable to commit backup restore/);
  assert.match(confirm, /Restore failed; no partial restore was kept/);
  assert.match(confirm, /Restore committed but the interface could not refresh/);
  assert.match(confirm, /The restore was saved \(\$\{restoredCounts\}\), but the screen could not refresh/);
  assert.match(confirm, /showBackupRestoreStage\("complete"\)/);
  assert.ok(confirm.indexOf("await commitBackupRestore(commitPlan)") < confirm.indexOf("await refreshApplicationAfterRestore()"));
  assert.match(app, /if \(state\.backupCommitInProgress\) event\.preventDefault\(\)/);
});

test("successful restore immediately refreshes the favorite selector and Home readiness", async () => {
  const app = await readFile(path.join(root, "js", "app.js"), "utf8");
  const refresh = app.slice(app.indexOf("async function refreshApplicationAfterRestore"), app.indexOf("function clearBackupRestorePreview"));
  assert.match(refresh, /await initializeFavoriteTeamSetting\(\{ throwOnError: true \}\)/);
  assert.match(refresh, /state\.settingsTeamsLoadedLevel = null/);
  assert.match(refresh, /await loadSettingsTeams\(state\.favoriteCompetition\?\.levelKey \|\| "mlb", \{ preserveSavedFavorite: true \}\)/);
  assert.match(refresh, /await refreshLayouts\(\{ throwOnError: true \}\)/);
  assert.match(refresh, /await loadLevelSchedule\(getLocalDateString\(\), state\.favoriteCompetition\?\.levelKey \|\| elements\.homeLevelSelect\.value \|\| "mlb"\)/);
});

async function freshStorageModule(label) {
  const url = pathToFileURL(path.join(root, "js", "storage.js"));
  url.searchParams.set("test", `${label}-${Date.now()}-${Math.random()}`);
  return import(url.href);
}

function createFakeIndexedDb({ failWrites }) {
  const committed = { settings: [], layouts: [], pdfTemplates: [] };
  const transactionCalls = [];
  const database = {
    objectStoreNames: { contains: () => true },
    transaction(stores, mode) {
      transactionCalls.push({ stores: [...stores], mode });
      const staged = { settings: [], layouts: [], pdfTemplates: [] };
      let abortQueued = false;
      const transaction = {
        error: null,
        objectStore(name) {
          return {
            put(record) {
              staged[name].push(record);
              if (failWrites && !abortQueued) {
                abortQueued = true;
                queueMicrotask(() => {
                  transaction.error = Object.assign(new Error("Quota exceeded"), { name: "QuotaExceededError" });
                  transaction.onabort?.();
                });
              }
            }
          };
        },
        abort() {
          transaction.error ||= new Error("Transaction aborted");
          queueMicrotask(() => transaction.onabort?.());
        }
      };
      if (!failWrites) {
        queueMicrotask(() => {
          for (const name of Object.keys(committed)) committed[name].push(...staged[name]);
          transaction.oncomplete?.();
        });
      }
      return transaction;
    },
    close() {}
  };
  return {
    indexedDB: {
      open() {
        const request = { result: database, error: null };
        queueMicrotask(() => request.onsuccess?.());
        return request;
      }
    },
    transactionCalls,
    records: () => structuredClone(committed)
  };
}

function createDeletedDatabaseIndexedDb() {
  const records = {
    settings: [{ key: "appearance", value: "dark" }],
    layouts: [{ id: "layout-a", name: "A" }],
    pdfTemplates: [{ key: "pdf-a", name: "a.pdf", blob: new Blob(["%PDF-1.4"], { type: "application/pdf" }) }]
  };
  let opens = 0;
  let atomicReads = 0;
  let staleClosed = false;
  const staleDatabase = {
    objectStoreNames: { contains: () => true },
    transaction() {
      atomicReads += 1;
      throw Object.assign(new Error("The database connection is closing"), { name: "InvalidStateError" });
    },
    close() { staleClosed = true; }
  };
  const freshDatabase = {
    objectStoreNames: { contains: () => true },
    transaction(stores) {
      atomicReads += 1;
      let remaining = stores.length;
      const transaction = {
        error: null,
        objectStore(name) {
          return {
            getAll() {
              const request = { result: null, error: null };
              queueMicrotask(() => {
                request.result = structuredClone(records[name]);
                request.onsuccess?.();
                remaining -= 1;
                if (remaining === 0) queueMicrotask(() => transaction.oncomplete?.());
              });
              return request;
            }
          };
        }
      };
      return transaction;
    },
    close() {}
  };
  return {
    indexedDB: {
      open() {
        opens += 1;
        const request = { result: opens === 1 ? staleDatabase : freshDatabase, error: null };
        queueMicrotask(() => request.onsuccess?.());
        return request;
      }
    },
    openCalls: () => opens,
    atomicReads: () => atomicReads,
    staleConnectionClosed: () => staleClosed
  };
}
