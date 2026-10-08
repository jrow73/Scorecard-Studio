import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const releaseRoot = [new URL("../", import.meta.url), new URL("../Build004_1_overlay/", import.meta.url)]
  .find((candidate) => fs.existsSync(new URL("app-meta.json", candidate)));
if (!releaseRoot) throw new Error("release application root not found");
const read = (path) => fs.readFileSync(new URL(path, releaseRoot), "utf8");

test("Build 005.2 final application bootstrap selects schema v2 and removes the v1 normalization path", () => {
  const app = read("js/app.js");
  assert.match(app, /normalizeV030Pregame/);
  assert.match(app, /createV030PersistenceController\(createV030StorageBackend\(\)\)/);
  assert.doesNotMatch(app, /normalizePregameData/);
  assert.doesNotMatch(app, /from "\.\/normalize\.js/);
});

test("new cache stores coexist with unchanged layout and PDF stores", () => {
  const storage = read("js/storage.js");
  assert.match(storage, /DB_VERSION = 4/);
  for (const store of ["settings", "pdfTemplates", "layouts", "normalizedSnapshotsV2", "adapterResultsV1"]) assert.match(storage, new RegExp(`"${store}"`));
});

test("saved layouts load non-destructively and explicit saves use compatibility preparation", () => {
  const app = read("js/app.js");
  assert.match(app, /listLayouts\(\)\)\.map\(\(layout\) => loadCompatibleLayout\(layout\)\.layout\)/);
  assert.match(app, /persistRawLayout\(prepareCompatibleLayoutForExplicitSave\(layout\)\.layout\)/);
});

test("additional starters are user controlled, persisted, and off by default", () => {
  const app = read("js/app.js");
  const html = read("index.html");
  assert.match(app, /includeAdditionalStarters: false/);
  assert.match(app, /setSetting\("includeAdditionalStarters"/);
  assert.match(html, /id="include-additional-starters"/);
});

test("PDF and layout consumers still resolve through the compatibility field registry", () => {
  const app = read("js/app.js");
  const registry = read("js/field-registry.js");
  assert.match(app, /resolveField\(/);
  assert.match(app, /getCollectionRows\(/);
  assert.match(registry, /model\?\.schemaVersion === 2/);
  assert.match(registry, /resolveCompatibilityField/);
});

test("the cutover advertises the final browser cache key and v0.3.0 identity", () => {
  const html = read("index.html");
  const meta = JSON.parse(read("app-meta.json"));
  assert.match(html, /v=030b0054/);
  assert.deepEqual(meta, { version: "0.3.0", build: "005.2" });
});
