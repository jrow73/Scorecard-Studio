import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getFieldDefinition } from "../js/field-registry.js";
import { templateTokenForContextField } from "../js/slot-content.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../css/styles.css", import.meta.url), "utf8");

// 1. Name Format remains exact-field capability based and hidden wrappers cannot be overridden.
assert.equal(getFieldDefinition("away.startingPitcher.player.name")?.formatKind, "playerName");
assert.notEqual(getFieldDefinition("game.date")?.formatKind, "playerName");
assert.notEqual(getFieldDefinition("away.startingPitcher.player.throws")?.formatKind, "playerName");
assert.match(app, /definition\?\.formatKind === "playerName"/);
assert.match(css, /#designer-selection-name-format-wrap\[hidden\]/);
assert.match(css, /#designer-column-name-format-wrap\[hidden\]/);

// 2. Context-aware labels and insertion are restored for record Text Templates.
assert.equal(templateTokenForContextField("away.startingPitcher.player.throws"), "[Throws]");
assert.equal(templateTokenForContextField("away.startingPitcher.player.name"), "[Player Name]");
assert.match(app, /option\.textContent = context \? slotFieldShortLabel\(definition\) : definition\.label;/);
assert.match(app, /const token = context \? templateTokenForContextField\(fieldId\) : templateTokenForField\(fieldId\);/);

// 3. Place New Item is no longer a parent-card action.
const parentStart = html.indexOf('id="designer-live-inspector"');
const parentEnd = html.indexOf('</section>', parentStart);
const parentMarkup = html.slice(parentStart, parentEnd);
assert.doesNotMatch(parentMarkup, /id="designer-workspace-new-btn"/);
const childActions = html.indexOf('id="designer-child-workspace-actions"');
const subordinate = html.indexOf('id="designer-subordinate-workspace"');
assert.ok(childActions > subordinate, "Place New Item lives in subordinate child workspace");
assert.match(app, /designerChildWorkspaceActions\.hidden = false/);

// 4. Scoped child mode hides the global repeated-layout inventory.
assert.match(app, /classList\.add\("scoped-child-workspace"\)/);
assert.match(app, /designerBlockList\.hidden = true/);
assert.match(css, /#designer-context-tools\.scoped-child-workspace #designer-block-list/);

// 5. Progressive reveal starts at Content Type and branches explicitly.
assert.match(html, /<option value="">Choose content type…<\/option>/);
assert.match(html, /<option value="">Choose alignment…<\/option>/);
assert.match(app, /designerColumnFieldWrap\.hidden = !isField/);
assert.match(app, /designerColumnTemplateWrap\.hidden = !isTemplate/);
assert.match(app, /alignmentLabel\.hidden = !hasType/);
assert.match(app, /fontSizeLabel\.hidden = !hasType/);
assert.match(css, /#designer-slot-fields-panel \[hidden\]/);

// 6. Required configuration is blank/reset and Add Slot Content is validity-gated.
assert.match(app, /function resetDesignerSlotConfiguration\(\)/);
assert.match(app, /designerColumnAlignment\.value = ""/);
assert.match(app, /designerColumnFontSize\.value = ""/);
assert.match(app, /designerColumnNameFormat\.value = ""/);
assert.match(app, /designerPlaceColumnButton\.disabled = isField/);
assert.match(app, /hasField && hasAlignment && hasFontSize && hasNameFormat/);
assert.match(app, /hasTemplate && hasAlignment && hasFontSize/);

console.log("Build 017.3 acceptance hotfix regression tests passed.");
