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

test("v0.4.0 HTML assets and JavaScript module imports resolve locally", () => {
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

test("all versioned browser assets use the final v0.4.0 cache identity", () => {
  const sources = [read("index.html"), ...javascriptFiles.map((name) => read(`js/${name}`))];
  const versions = sources.flatMap((source) => [...source.matchAll(/\?v=([A-Za-z0-9._-]+)/g)].map((match) => match[1]));
  assert.ok(versions.length > 0);
  assert.deepEqual([...new Set(versions)], ["040"]);
});

test("final identity and persisted-data boundaries are coherent", () => {
  assert.deepEqual(JSON.parse(read("app-meta.json")), { version: "0.4.0", build: "004.9" });
  const app = read("js/app.js");
  const storage = read("js/storage.js");
  const backup = read("js/v040-backup-export.js");
  assert.match(app, /applicationVersion: "0\.4\.0", build: "004\.9"/);
  assert.match(app, /version && build && version\.includes\("-dev"\)/);
  assert.match(storage, /const DB_VERSION = 4/);
  assert.match(backup, /BACKUP_FORMAT_VERSION = 1/);
});

test("the accepted v0.4.0 product surfaces remain present in the final cut", () => {
  const html = read("index.html");
  const app = read("js/app.js");
  for (const id of ["nav-home", "nav-gameday", "nav-layouts", "nav-settings"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /id="appearance-options"/);
  assert.match(html, /id="backup-open-restore-btn"/);
  assert.match(html, /id="gameday-detail-level"/);
  assert.match(app, /formatDualZoneInstant\(scheduled, game\.venue\?\.timeZone\)/);
  assert.match(app, /void loadSelectedGameVenueTimeZone\(selected\)/);
});

test("README remains the protected v1 end-state document", () => {
  const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "README.md"))).digest("hex").toUpperCase();
  assert.equal(hash, "7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE");
});
