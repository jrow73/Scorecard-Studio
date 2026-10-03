import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(html, /id="designer-individual-content-type"/);
assert.match(html, /<option value="field">Single Item<\/option>/);
assert.match(html, /<option value="template">Text Template<\/option>/);
assert.match(html, /id="designer-individual-template"/);
assert.match(html, /id="designer-individual-template-preview"/);
assert.match(html, /Insert into editor/);

assert.match(app, /function individualTemplateSupported\(collection\)/);
assert.match(app, /\["away\.lineup", "home\.lineup"\]/);
assert.match(app, /content: placement\.content \|\| \{ type: "field"/);
assert.match(app, /const lastType = last\.content\?\.type === "template" \? "template" : "field"/);
assert.match(app, /resolveSlotContent\(mapping\.content, DESIGNER_SAMPLE_MODEL, mapping\.collection, mapping\.selector\)/);
assert.match(app, /resolveSlotContent\(content, model, mapping\.collection, mapping\.selector\)/);
assert.match(app, /Placed \$\{placedLabel\} for \$\{individualSelectorLabel\(mapping\)\}\. Ready for the next individual placement\./);
assert.match(app, /\["mapping", "repeatedColumn", "individual"\]\.includes\(selection\.kind\)/);
assert.match(app, /\["mapping", "repeatedColumn", "individual"\]\.includes\(selection\?\.kind\)/);

console.log("Build 032.4 Defensive Alignment Text Template checks passed.");
