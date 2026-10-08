import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));
const stripSuffix = (specifier) => specifier.split(/[?#]/, 1)[0];
const javascriptFiles = fs.readdirSync(path.join(root, "js")).filter((name) => name.endsWith(".js"));

test("release-candidate HTML assets and JavaScript module imports resolve locally", () => {
  const html = read("index.html");
  for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) {
    const target = stripSuffix(match[1]).replace(/^\.\//, "");
    assert.ok(exists(target), `missing HTML asset: ${target}`);
  }

  for (const name of javascriptFiles) {
    const source = read(`js/${name}`);
    const specifiers = [
      ...source.matchAll(/\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?["'](\.[^"']+)["']/g),
      ...source.matchAll(/\bimport\(\s*["'](\.[^"']+)["']\s*\)/g)
    ].map((match) => match[1]);
    for (const specifier of specifiers) {
      const target = path.resolve(root, "js", stripSuffix(specifier));
      assert.ok(fs.existsSync(target), `${name} imports missing module ${specifier}`);
    }
  }
});

test("all versioned browser assets use the final 005.4 cache identity", () => {
  const sources = [read("index.html"), ...javascriptFiles.map((name) => read(`js/${name}`))];
  const versions = sources.flatMap((source) => [...source.matchAll(/\?v=([A-Za-z0-9._-]+)/g)].map((match) => match[1]));
  assert.ok(versions.length > 0);
  assert.deepEqual([...new Set(versions)], ["030b0054"]);
});

test("final identity, schema-v2 cutover, and storage boundaries are coherent", () => {
  assert.deepEqual(JSON.parse(read("app-meta.json")), { version: "0.3.0", build: "005.2" });
  const app = read("js/app.js");
  const contract = read("js/v030-contract.js");
  const storage = read("js/storage.js");
  assert.match(app, /normalizeV030Pregame/);
  assert.doesNotMatch(app, /normalizePregameData/);
  assert.match(app, /const full = version \|\| \(build \? `Build \$\{build\}` : "Scorecard Studio"\)/);
  assert.doesNotMatch(app, /`\$\{version\} • Build \$\{build\}`/);
  assert.match(contract, /NORMALIZED_CONTRACT_REVISION = "0\.3\.0-draft\.2"/);
  assert.match(storage, /DB_VERSION = 4/);
  for (const store of ["settings", "pdfTemplates", "layouts", "normalizedSnapshotsV2", "adapterResultsV1"]) {
    assert.match(storage, new RegExp(`"${store}"`), store);
  }
});

test("README remains the protected v1 end-state document", () => {
  const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "README.md"))).digest("hex").toUpperCase();
  assert.equal(hash, "7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE");
});
