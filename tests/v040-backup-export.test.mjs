import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { BACKUP_SCOPES, createBackupExport } from "../js/v040-backup-export.js";
import { SETTING_PORTABILITY, createBackupSettingRegistry } from "../js/v040-backup-settings.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixedOptions = Object.freeze({
  backupId: "backup-fixed",
  createdAtUtc: "2026-10-09T15:00:00.000Z",
  source: { applicationVersion: "0.4.0-dev", build: "002.2", storageDatabaseVersion: 4 }
});
const pdfA = new TextEncoder().encode("%PDF-1.4\nA");
const pdfB = new TextEncoder().encode("%PDF-1.4\nB");

function sourceData() {
  return {
    settings: [
      { key: "livePdfLayoutId", value: "layout-b", updatedAt: "2026-10-09T14:00:00.000Z" },
      { key: "futureDisplayDensity", value: { schemaVersion: 1, density: "compact" }, updatedAt: "2026-10-09T14:00:00.000Z" },
      { key: "favoriteLayoutId", value: "layout-a", updatedAt: "2026-10-09T14:00:00.000Z" },
      { key: "appPreferencesV1", value: { schemaVersion: 1, appearance: "dark" }, updatedAt: "2026-10-09T14:00:00.000Z" },
      { key: "favoriteCompetition", value: { levelKey: "double-a", sportId: 12, teamId: 555, teamName: "Future Club" } },
      { key: "includeAdditionalStarters", value: true },
      { key: "unregisteredSetting", value: "not exported" }
    ],
    layouts: [
      { id: "layout-b", schemaVersion: 8, name: "B", pdfTemplateId: "pdf-b", mappings: [] },
      { id: "layout-a", schemaVersion: 7, name: "A", pdfTemplateId: "pdf-a", mappings: [], repeatedBlocks: [{ collection: "away.bullpen", columns: [] }] }
    ],
    pdfTemplates: [
      { key: "pdf-b", name: "b.pdf", type: "application/pdf", blob: new Blob([pdfB], { type: "application/pdf" }) },
      { key: "pdf-a", name: "a.pdf", type: "application/pdf", blob: new Blob([pdfA], { type: "application/pdf" }) },
      { key: "orphan", name: "orphan.pdf", type: "application/pdf", blob: new Blob([pdfA], { type: "application/pdf" }) }
    ]
  };
}

function registryWithFutureSetting() {
  return createBackupSettingRegistry([{
    key: "futureDisplayDensity",
    portability: SETTING_PORTABILITY.PORTABLE,
    normalize(value) {
      if (!["comfortable", "compact"].includes(value?.density)) throw new Error("unsupported density");
      return { schemaVersion: 1, density: value.density };
    }
  }]);
}

test("complete export is deterministic, sorted, and carries only registered portable settings", async () => {
  const options = { ...fixedOptions, settingRegistry: registryWithFutureSetting() };
  const first = await createBackupExport(sourceData(), options);
  const reversed = sourceData();
  reversed.settings.reverse();
  reversed.layouts.reverse();
  reversed.pdfTemplates.reverse();
  const second = await createBackupExport(reversed, options);

  assert.equal(first.json, second.json);
  assert.ok(first.json.endsWith("\n"));
  assert.deepEqual(first.envelope.layouts.map((row) => row.id), ["layout-a", "layout-b"]);
  assert.deepEqual(first.envelope.pdfTemplates.map((row) => row.key), ["pdf-a", "pdf-b"]);
  assert.deepEqual(first.envelope.settings.map((row) => row.key), ["appPreferencesV1", "favoriteCompetition", "favoriteLayoutId", "futureDisplayDensity"]);
  assert.deepEqual(first.envelope.settings.find((row) => row.key === "futureDisplayDensity")?.value, { schemaVersion: 1, density: "compact" });
  assert.equal(first.envelope.pdfTemplates.some((row) => row.key === "orphan"), false);
  assert.equal(first.diagnostics.some((row) => row.code === "SETTING_UNREGISTERED" && row.key === "unregisteredSetting"), true);
});

test("PDF output uses decoded size, Base64, SHA-256, and preserved filenames", async () => {
  const result = await createBackupExport(sourceData(), { ...fixedOptions, settingRegistry: registryWithFutureSetting() });
  const template = result.envelope.pdfTemplates.find((row) => row.key === "pdf-a");
  assert.equal(template.name, "a.pdf");
  assert.equal(template.type, "application/pdf");
  assert.equal(template.size, pdfA.byteLength);
  assert.deepEqual(new Uint8Array(Buffer.from(template.data.value, "base64")), pdfA);
  assert.equal(template.data.sha256, createHash("sha256").update(pdfA).digest("hex").toUpperCase());
});

test("single-layout export carries exactly one layout and PDF with no settings", async () => {
  const result = await createBackupExport(sourceData(), { ...fixedOptions, scope: BACKUP_SCOPES.SINGLE_LAYOUT, layoutId: "layout-b", settingRegistry: registryWithFutureSetting() });
  assert.equal(result.envelope.scope, "singleLayout");
  assert.deepEqual(result.envelope.layouts.map((row) => row.id), ["layout-b"]);
  assert.deepEqual(result.envelope.pdfTemplates.map((row) => row.key), ["pdf-b"]);
  assert.deepEqual(result.envelope.settings, []);
});

test("legacy favorite migration is canonical while retired records remain absent", async () => {
  const input = sourceData();
  input.settings = [
    { key: "favoriteTeam", value: { id: 123, name: "Legacy Club" }, updatedAt: "2026-10-09T13:00:00.000Z" },
    { key: "includeAdditionalStarters", value: true },
    { key: "livePdfLayoutId", value: "layout-a" }
  ];
  const result = await createBackupExport(input, fixedOptions);
  assert.deepEqual(result.envelope.settings, [{
    key: "favoriteCompetition",
    value: { levelKey: "mlb", sportId: 1, teamId: 123, teamName: "Legacy Club" },
    updatedAt: "2026-10-09T13:00:00.000Z"
  }]);
});

test("dangling layout references and invalid PDF bytes fail before producing an export", async () => {
  const missing = sourceData();
  missing.pdfTemplates = missing.pdfTemplates.filter((row) => row.key !== "pdf-a");
  await assert.rejects(() => createBackupExport(missing, fixedOptions), /missing PDF template 'pdf-a'/);

  const invalid = sourceData();
  invalid.pdfTemplates.find((row) => row.key === "pdf-a").blob = new Blob(["not a pdf"], { type: "application/pdf" });
  await assert.rejects(() => createBackupExport(invalid, fixedOptions), /does not have a PDF signature/);
});

test("storage exposes one read-only transaction for a consistent portable snapshot", async () => {
  const storage = await readFile(path.join(root, "js", "storage.js"), "utf8");
  assert.match(storage, /export async function readBackupStorageSnapshot/);
  assert.match(storage, /database\.transaction\(storeNames, "readonly"\)/);
  assert.match(storage, /\[SETTINGS_STORE, LAYOUT_STORE, PDF_STORE\]/);
  assert.doesNotMatch(storage, /\[SETTINGS_STORE, LAYOUT_STORE, PDF_STORE, NORMALIZED_SNAPSHOT_STORE/);
});
