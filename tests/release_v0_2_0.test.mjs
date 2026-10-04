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

// Release identity remains development status until final acceptance.
assert.equal(meta.version, "0.2.0");
assert.equal(meta.build, "");

// All first-party browser assets use one current RC cache key.
const browserSources = [html, ...fs.readdirSync(path.join(root, "js")).filter(f => f.endsWith(".js")).map(f => read(`js/${f}`))];
const versionedAssets = browserSources.flatMap(s => [...s.matchAll(/(?:\.\/)?(?:css\/|js\/|\.\/)[A-Za-z0-9_./-]+\.(?:js|css)\?v=([A-Za-z0-9._-]+)/g)].map(m => m[1]));
assert.ok(versionedAssets.length > 0, "Expected versioned first-party assets.");
assert.deepEqual([...new Set(versionedAssets)], ["020"]);

// Final Designer header remains clean.
assert.match(html, /<h3 id="designer-heading">Layout Designer<\/h3>/);
assert.doesNotMatch(html, /Designer Workspace/i);

// Favorite Layout is explicit and separate from last-used Home layout persistence.
assert.match(html, /id="favorite-layout-btn"[^>]*>Set as Favorite<\/button>/);
assert.match(app, /getSetting\("favoriteLayoutId", ""\)/);
assert.match(app, /setSetting\("favoriteLayoutId", layout\.id\)/);
assert.match(app, /getSetting\("livePdfLayoutId", ""\)/);

// Defensive Alignment must not expose Pitcher as a role.
const roleSection = app.slice(app.indexOf("const INDIVIDUAL_ROLE_OPTIONS"), app.indexOf("function syncDesignerIndividualControls"));
assert.doesNotMatch(roleSection, /\["P", "Pitcher"\]/);
assert.match(roleSection, /\["DH", "Designated Hitter"\]/);
assert.match(app, /removeObsoleteDefensivePitcherMappings/);

// Initial repeated/record placement cancellation is explicitly discardable.
assert.match(app, /beginDesignerBlockGeometryPlacement\(\{ discardBlockOnCancel: true \}\)/);
assert.match(app, /discardBlockOnCancel: placement\.discardBlockOnCancel === true/);
assert.match(app, /function discardUnfinishedDesignerBlock\(blockId\)/);
assert.match(app, /Placement canceled\. The unfinished layout was discarded\./);

// iPad/WebKit child-dialog ghost focus outline suppression is present.
assert.match(css, /\.layout-settings-child-dialog:focus[\s\S]*outline:\s*none/);
assert.match(css, /\.layout-settings-child-dialog:focus-visible[\s\S]*outline:\s*none/);

// Accepted Text Template terminology stays intact.
assert.match(html, /id="designer-column-template-insert-btn"[^>]*>Insert into editor<\/button>/);
assert.doesNotMatch(html, /id="designer-column-template-insert-btn"[^>]*>Insert Field<\/button>/);

// Confirmed-dead DOM registry entries stay removed.
for (const deadKey of [
  "designerFontSize", "designerTemplateFontSize", "designerColumnFontSize",
  "designerIndividualStrategy", "designerIndividualSlotWrap", "designerIndividualSlot",
  "designerIndividualFontSize", "designerSelectionHelp", "layoutFieldCount"
]) {
  assert.doesNotMatch(app, new RegExp(`\\b${deadKey}\\s*:`));
}

// Production JavaScript must remain syntactically valid.
for (const file of fs.readdirSync(path.join(root, "js")).filter(f => f.endsWith(".js"))) {
  execFileSync(process.execPath, ["--check", path.join(root, "js", file)], { stdio: "pipe" });
}

console.log("v0.2.0 final release regression checks passed.");
