import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../css/styles.css", import.meta.url), "utf8");

// 1. Build identity advances without changing the v0.2.0 development milestone.
assert.match(html, /Build (?:017\.4|018\.[0-3])/);
assert.match(app, /Build: (?:017\.4|018\.[0-3])/);

// 2. Record Layout is one record / one anchor and does not expose repeated arrangement choices.
assert.match(app, /const isRecord = isRecordContext\(requestedContext\)/);
assert.match(app, /if \(isRecord\) \{\s*rows = 1;\s*columns = 1;/s);
assert.match(app, /classList\.toggle\("creating-record", pendingMode === "record"\)/);
assert.match(css, /#designer-context-tools\.creating-record label:has\(#designer-block-arrangement\)/);
assert.match(css, /#designer-context-tools\.creating-record #designer-capacity-wrap/);
assert.match(css, /#designer-context-tools\.creating-record #designer-grid-dimensions/);

// 3. Record/repeated children continue to support both Field and Text Template content.
assert.match(html, /<option value="field">Field<\/option>/);
assert.match(html, /<option value="template">Text Template<\/option>/);
assert.match(app, /contentType === "template"/);
assert.match(app, /content = \{ type: "field", field \}/);

// 4. Place New Item stays in the subordinate workspace while an existing block child is edited.
assert.match(app, /if \(editingChild && isRepeated && parentBlock\?\.geometry\)/);
assert.match(app, /designerWorkspaceNewButton\.hidden = false/);
assert.match(app, /designerChildWorkspaceActions\) elements\.designerChildWorkspaceActions\.hidden = false/);
const parentStart = html.indexOf('id="designer-live-inspector"');
const parentEnd = html.indexOf('</section>', parentStart);
assert.doesNotMatch(html.slice(parentStart, parentEnd), /id="designer-workspace-new-btn"/);

console.log("Build 017.4 hotfix regression tests passed.");
