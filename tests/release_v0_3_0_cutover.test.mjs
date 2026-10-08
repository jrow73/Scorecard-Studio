import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const html = read("index.html");
const app = read("js/app.js");
const css = read("css/styles.css");
const meta = JSON.parse(read("app-meta.json"));

assert.deepEqual(meta, { version: "0.3.0", build: "005.2" });
const browserSources = [
  html, app,
  ...["field-registry", "field-diagnostic", "slot-content", "v030-cutover", "v030-persistence", "v030-schedule-normalizer", "v030-roster-people-normalizer", "v030-context-overlay-normalizer", "v030-compatibility-resolver"]
    .map((name) => read(`js/${name}.js`))
];
const versionedAssets = browserSources.flatMap((source) => [...source.matchAll(/(?:\.\/)?(?:css\/|js\/|\.\/)[A-Za-z0-9_./-]+\.(?:js|css)\?v=([A-Za-z0-9._-]+)/g)].map((match) => match[1]));
assert.ok(versionedAssets.length > 0);
assert.deepEqual([...new Set(versionedAssets)], ["030b0054"]);

assert.match(app, /normalizeV030Pregame/);
assert.doesNotMatch(app, /normalizePregameData/);
assert.match(app, /const full = version \|\| \(build \? `Build \$\{build\}` : "Scorecard Studio"\)/);
assert.doesNotMatch(app, /`\$\{version\} • Build \$\{build\}`/);
assert.match(app, /getSetting\("favoriteLayoutId", ""\)/);
assert.match(app, /setSetting\("favoriteLayoutId", layout\.id\)/);
assert.match(app, /beginDesignerBlockGeometryPlacement\(\{ discardBlockOnCancel: true \}\)/);
assert.match(css, /\.layout-settings-child-dialog:focus[\s\S]*outline:\s*none/);
assert.match(html, /id="include-additional-starters"/);

for (const file of fs.readdirSync(path.join(root, "js")).filter((entry) => entry.endsWith(".js"))) {
  execFileSync(process.execPath, ["--check", path.join(root, "js", file)], { stdio: "pipe" });
}

console.log("v0.3.0 Build 005.2 final release regression checks passed.");
