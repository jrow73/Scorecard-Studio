import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("v0.5.0 publishes one final application and browser-cache identity", async () => {
  const [meta, html, app] = await Promise.all([read("app-meta.json").then(JSON.parse), read("index.html"), read("js/app.js")]);
  assert.deepEqual(meta, { version: "0.5.0", build: "005.2" });
  assert.match(html, /styles\.css\?v=050b0052/);
  assert.match(html, /app\.js\?v=050b0052/);
  assert.match(app, /applicationVersion: "0\.5\.0", build: "005\.2"/);

  const productionFiles = ["index.html"];
  const javascript = await readdir(path.join(root, "js"), { recursive: true, withFileTypes: true });
  for (const entry of javascript) if (entry.isFile() && entry.name.endsWith(".js")) productionFiles.push(path.relative(root, path.join(entry.parentPath ?? entry.path, entry.name)));
  const production = (await Promise.all(productionFiles.map(read))).join("\n");
  const cacheKeys = [...production.matchAll(/[?]v=([A-Za-z0-9._-]+)/g)].map((match) => match[1]);
  assert.ok(cacheKeys.length > 0);
  assert.deepEqual([...new Set(cacheKeys)], ["050b0052"]);
});

test("v0.5.0 README presents local portability and Game Day without advertising cloud sync", async () => {
  const readme = await read("README.md");
  assert.match(readme, /Game Day Research Companion/);
  assert.match(readme, /spoiler-safe/i);
  assert.match(readme, /do not automatically synchronize between devices/i);
  assert.doesNotMatch(readme, /Optional Cloud Storage and Synchronization/i);
  assert.equal(createHash("sha256").update(readme).digest("hex"), "e3498e0592bb7e22cd9591849ec4ef0e112d046944e1a82c1254342b5d04a6ec");
});

test("v0.5.0 Game Day exposes only accepted user-facing navigation", async () => {
  const html = await read("index.html");
  assert.doesNotMatch(html, /gameday-season-note|gameday-player-stat-scope-status|gameday-research|gameday-source-summary/);
  assert.doesNotMatch(html, />Technical Details<|Technical source details/);
  for (const label of ["Game", "Teams", "Lineups", "Bench", "Pitching Staff", "Staff", "Other Standings"]) assert.match(html, new RegExp(`>${label}<`));
});
