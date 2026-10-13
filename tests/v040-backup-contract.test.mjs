import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const schema = JSON.parse(await read("schemas/v040-backup-envelope-v1.schema.json"));
const fixtureText = await read("tests/fixtures/v040-backup/complete-v1.json");
const fixture = JSON.parse(fixtureText);

test("backup envelope v1 fixes identity while keeping registered setting values generic", () => {
  assert.equal(schema.properties.format.const, "scorecard-studio-backup");
  assert.equal(schema.properties.formatVersion.const, 1);
  assert.deepEqual(schema.properties.scope.enum, ["complete", "singleLayout"]);
  assert.deepEqual(schema.$defs.settingRecord.properties.value, {});
  assert.equal(schema.$defs.settingRecord.additionalProperties, false);
  assert.notEqual(schema.$defs.layoutRecord.additionalProperties, false);
  for (const key of ["format", "formatVersion", "backupId", "createdAtUtc", "source", "scope", "settings", "layouts", "pdfTemplates"]) {
    assert.ok(schema.required.includes(key), `missing required envelope member ${key}`);
  }
});

test("representative complete backup preserves a registered hypothetical future setting", () => {
  const roundTrip = JSON.parse(JSON.stringify(fixture));
  const future = roundTrip.settings.find((record) => record.key === "futureDisplayDensity");
  assert.deepEqual(future?.value, { schemaVersion: 1, density: "compact" });
  assert.equal(roundTrip.format, "scorecard-studio-backup");
  assert.equal(roundTrip.formatVersion, 1);
  assert.equal(roundTrip.scope, "complete");
});

test("fixture layout and PDF references are complete and integrity metadata is correct", () => {
  const templates = new Map(fixture.pdfTemplates.map((record) => [record.key, record]));
  for (const layout of fixture.layouts) assert.ok(templates.has(layout.pdfTemplateId), `missing template ${layout.pdfTemplateId}`);
  for (const template of fixture.pdfTemplates) {
    const bytes = Buffer.from(template.data.value, "base64");
    assert.equal(bytes.byteLength, template.size);
    assert.equal(createHash("sha256").update(bytes).digest("hex").toUpperCase(), template.data.sha256.toUpperCase());
  }
});

test("current storage inventory distinguishes portable records from reproducible caches", async () => {
  const storage = await read("js/storage.js");
  for (const declaration of [
    'SETTINGS_STORE = "settings"',
    'PDF_STORE = "pdfTemplates"',
    'LAYOUT_STORE = "layouts"',
    'NORMALIZED_SNAPSHOT_STORE = "normalizedSnapshotsV2"',
    'ADAPTER_RESULT_STORE = "adapterResultsV1"'
  ]) assert.match(storage, new RegExp(declaration.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  const contract = await read("docs/v0.4/V040_BACKUP_RESTORE_CONTRACT.md");
  for (const portable of ["`settings`", "`layouts`", "`pdfTemplates`"]) assert.match(contract, new RegExp(portable));
  for (const cache of ["`normalizedSnapshotsV2`", "`adapterResultsV1`"]) {
    assert.match(contract, new RegExp(`${cache.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\n]+Exclude`, "i"));
  }
});

test("contract requires no-write preflight, atomic commit, and reference-aware conflicts", async () => {
  const contract = await read("docs/v0.4/V040_BACKUP_RESTORE_CONTRACT.md");
  assert.match(contract, /Preflight — no writes/);
  assert.match(contract, /one multi-store IndexedDB transaction/);
  assert.match(contract, /Replace:[^\n]+layout\/PDF unit/);
  assert.match(contract, /Keep Both:[^\n]+rewrite `layout\.pdfTemplateId`/);
  assert.match(contract, /Skip:[^\n]+neither member/);
  assert.match(contract, /credentials, authorization grants, secrets[^\n]+excluded/i);
});

test("Build 002.1 leaves the protected v1 README contract untouched", async () => {
  const bytes = await readFile(path.join(root, "README.md"));
  assert.equal(createHash("sha256").update(bytes).digest("hex").toUpperCase(), "7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE");
});
