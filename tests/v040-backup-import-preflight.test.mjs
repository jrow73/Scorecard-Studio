import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createBackupExport } from "../js/v040-backup-export.js";
import { preflightBackupImport } from "../js/v040-backup-import.js";
import { SETTING_PORTABILITY, createBackupSettingRegistry } from "../js/v040-backup-settings.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pdfBytes = new TextEncoder().encode("%PDF-1.4\npreflight");
const fixedOptions = Object.freeze({
  backupId: "preflight-backup",
  createdAtUtc: "2026-10-09T18:00:00.000Z",
  source: { applicationVersion: "0.4.0-dev", build: "002.2", storageDatabaseVersion: 4 }
});

function sourceData() {
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
      mappings: [{ id: "known", fieldId: "game.date" }],
      repeatedBlocks: [{ id: "pen", collection: "away.bullpen", capacity: 12, columns: [] }],
      futureLayoutProperty: { preserved: true }
    }],
    pdfTemplates: [{ key: "pdf-1", name: "import.pdf", type: "application/pdf", blob: new Blob([pdfBytes], { type: "application/pdf" }) }]
  };
}

async function validJson() {
  return (await createBackupExport(sourceData(), fixedOptions)).json;
}

test("valid backup produces a no-write plan and preserves raw historical layout semantics", async () => {
  const result = await preflightBackupImport(await validJson(), { settings: [], layouts: [], pdfTemplates: [] });
  assert.equal(result.valid, true);
  assert.equal(result.writesPerformed, 0);
  assert.deepEqual(result.plan.summary, {
    layoutsToAdd: 1,
    layoutConflicts: 0,
    pdfTemplatesToAdd: 1,
    pdfTemplateConflicts: 0,
    settingsToAdd: 2,
    settingsToReplace: 0,
    unsupportedSettings: 0
  });
  const imported = result.prepared.layouts[0];
  assert.equal(imported.futureLayoutProperty.preserved, true);
  assert.equal(Object.hasOwn(imported.repeatedBlocks[0], "pitcherGroup"), false);
  assert.equal(result.plan.layouts[0].requiresPersistentWrite, false);
  assert.equal(result.plan.requiresConflictResolution, false);
});

test("current IDs and names produce a reference-aware conflict preview without writes", async () => {
  const current = {
    settings: [{ key: "appPreferencesV1", value: { schemaVersion: 1, appearance: "system" } }],
    layouts: [
      { id: "layout-1", name: "Existing ID", pdfTemplateId: "existing-pdf" },
      { id: "other-layout", name: "Imported Layout", pdfTemplateId: "other-pdf" }
    ],
    pdfTemplates: [{ key: "pdf-1" }]
  };
  const result = await preflightBackupImport(await validJson(), current);
  assert.equal(result.valid, true);
  assert.equal(result.writesPerformed, 0);
  assert.equal(result.plan.requiresConflictResolution, true);
  assert.deepEqual(result.plan.layouts[0].conflicts, ["layoutId", "pdfTemplateId", "layoutName"]);
  assert.equal(result.plan.layouts[0].action, "conflict");
  assert.equal(result.plan.settings.find((row) => row.key === "appPreferencesV1").action, "replace");
  assert.equal(result.plan.settings.find((row) => row.key === "favoriteLayoutId").referencedLayoutId, "layout-1");
  assert.equal(result.plan.summary.layoutConflicts, 1);
});

test("PDF Base64, decoded size, signature, and SHA-256 corruption are rejected", async () => {
  const base = JSON.parse(await validJson());

  const malformed = structuredClone(base);
  malformed.pdfTemplates[0].data.value = "%%%=";
  let result = await preflightBackupImport(JSON.stringify(malformed));
  assert.equal(result.valid, false);
  assert.equal(result.diagnostics.some((row) => row.code === "PDF_BASE64_INVALID"), true);

  const wrongSize = structuredClone(base);
  wrongSize.pdfTemplates[0].size += 1;
  result = await preflightBackupImport(JSON.stringify(wrongSize));
  assert.equal(result.valid, false);
  assert.equal(result.diagnostics.some((row) => row.code === "PDF_SIZE_MISMATCH"), true);

  const wrongHash = structuredClone(base);
  wrongHash.pdfTemplates[0].data.sha256 = "0".repeat(64);
  result = await preflightBackupImport(JSON.stringify(wrongHash));
  assert.equal(result.valid, false);
  assert.equal(result.diagnostics.some((row) => row.code === "PDF_HASH_MISMATCH"), true);

  const wrongSignature = structuredClone(base);
  const badBytes = new TextEncoder().encode("NOTDF-1.4\npreflight");
  wrongSignature.pdfTemplates[0].data.value = Buffer.from(badBytes).toString("base64");
  wrongSignature.pdfTemplates[0].size = badBytes.byteLength;
  wrongSignature.pdfTemplates[0].data.sha256 = await sha256Hex(badBytes);
  result = await preflightBackupImport(JSON.stringify(wrongSignature));
  assert.equal(result.valid, false);
  assert.equal(result.diagnostics.some((row) => row.code === "PDF_SIGNATURE_INVALID"), true);
});

test("unsupported versions, unknown envelope properties, limits, and scope violations fail closed", async () => {
  const base = JSON.parse(await validJson());
  const newer = structuredClone(base);
  newer.formatVersion = 2;
  assert.equal((await preflightBackupImport(JSON.stringify(newer))).diagnostics.some((row) => row.code === "BACKUP_VERSION_UNSUPPORTED"), true);

  const unknown = structuredClone(base);
  unknown.executeThis = true;
  assert.equal((await preflightBackupImport(JSON.stringify(unknown))).diagnostics.some((row) => row.code === "BACKUP_PROPERTY_UNKNOWN"), true);

  const limited = await preflightBackupImport(JSON.stringify(base), {}, { limits: { maxJsonBytes: 10 } });
  assert.equal(limited.diagnostics.some((row) => row.code === "BACKUP_TOO_LARGE"), true);

  const badScope = structuredClone(base);
  badScope.scope = "singleLayout";
  assert.equal((await preflightBackupImport(JSON.stringify(badScope))).diagnostics.some((row) => row.code === "SINGLE_LAYOUT_SETTINGS"), true);
});

test("unregistered settings are previewed as unsupported while invalid registered settings fail", async () => {
  const withUnknown = JSON.parse(await validJson());
  withUnknown.settings.push({ key: "futureUnknown", value: { untouched: true } });
  let result = await preflightBackupImport(JSON.stringify(withUnknown));
  assert.equal(result.valid, true);
  assert.deepEqual(result.plan.unsupportedSettings, [{ key: "futureUnknown", reason: "unregistered" }]);
  assert.equal(result.plan.summary.unsupportedSettings, 1);

  const invalidKnown = JSON.parse(await validJson());
  invalidKnown.settings.push({ key: "favoriteCompetition", value: { sportId: 12, teamId: 0, teamName: "" } });
  result = await preflightBackupImport(JSON.stringify(invalidKnown));
  assert.equal(result.valid, false);
  assert.equal(result.diagnostics.some((row) => row.code === "SETTING_VALUE_INVALID"), true);
});

test("a newly registered future setting validates through the generic importer path", async () => {
  const envelope = JSON.parse(await validJson());
  envelope.settings.push({ key: "futureDisplayDensity", value: { schemaVersion: 1, density: "compact" } });
  const registry = createBackupSettingRegistry([{
    key: "futureDisplayDensity",
    portability: SETTING_PORTABILITY.PORTABLE,
    defaultValue: { schemaVersion: 1, density: "comfortable" },
    normalize(value) {
      if (!["comfortable", "compact"].includes(value?.density)) throw new Error("unsupported density");
      return { schemaVersion: 1, density: value.density };
    }
  }]);
  const result = await preflightBackupImport(JSON.stringify(envelope), {}, { settingRegistry: registry });
  assert.equal(result.valid, true);
  assert.deepEqual(result.prepared.settings.find((row) => row.key === "futureDisplayDensity")?.value, { schemaVersion: 1, density: "compact" });
});

test("preflight module contains no browser-storage write dependency", async () => {
  const source = await readFile(path.join(root, "js", "v040-backup-import.js"), "utf8");
  assert.doesNotMatch(source, /from ["']\.\/storage\.js/);
  assert.doesNotMatch(source, /putRecord|setSetting|saveLayout|savePdfTemplate|deleteRecord/);
  assert.match(source, /writesPerformed:\s*0/);
});

async function sha256Hex(bytes) {
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}
