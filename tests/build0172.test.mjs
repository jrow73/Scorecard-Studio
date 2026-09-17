import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getFieldDefinition } from "../js/field-registry.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../css/styles.css", import.meta.url), "utf8");

// Item 1: Name Format remains capability-driven by the exact selected field.
for (const id of [
  "away.startingPitcher.player.name",
  "home.startingPitcher.player.name",
  "away.lineup[].player.name",
  "away.bench[].player.name",
  "away.bullpen[].player.name"
]) assert.equal(getFieldDefinition(id)?.formatKind, "playerName", `${id} supports Name Format`);
for (const id of [
  "game.date",
  "away.startingPitcher.player.number",
  "away.startingPitcher.player.throws",
  "away.startingPitcher.stats.era",
  "away.lineup[].player.number",
  "away.lineup[].position"
]) assert.notEqual(getFieldDefinition(id)?.formatKind, "playerName", `${id} does not support Name Format`);
assert.match(app, /const hasNameFormat = !isTemplate && definition\?\.formatKind === "playerName";/, "selected-item Name Format is exact-field capability-driven");
assert.match(app, /designerSelectionNameFormatWrap\.hidden = true;/, "parent/layout reset hides Name Format");

// Items 3/4: parent controls and subordinate workspace are structurally separated.
const parentStart = html.indexOf('id="designer-live-inspector"');
const parentEnd = html.indexOf('</section>', parentStart);
const parentMarkup = html.slice(parentStart, parentEnd);
assert.match(parentMarkup, /id="designer-selection-delete-btn"/, "parent card owns Delete");
assert.match(parentMarkup, /id="designer-selection-new-instance-btn"/, "parent card owns New Instance");
assert.match(parentMarkup, /id="designer-workspace-layout-btn"/, "parent card owns Edit Layout");
assert.doesNotMatch(parentMarkup, /id="designer-selection-controls"/, "child controls are outside parent card");
assert.match(html, /id="designer-subordinate-workspace"/, "subordinate workspace exists");
assert.match(html, /id="designer-workspace-label"/, "subordinate workspace has an explicit context label");
assert.doesNotMatch(html, /id="designer-workspace-item-btn"/, "Selected Item is no longer a mode button");
assert.match(app, /selectDesignerObject\(parentSelection, \{ inspectorMode: "layout" \}\)/, "Edit Layout explicitly switches to parent selection");
assert.match(app, /selectDesignerObject\(parentSelection, \{ inspectorMode: "new" \}\)/, "Place New Item explicitly switches to parent selection");
assert.match(app, /setDesignerWorkspaceHeading\("Selected Item", designerChildLabel/, "child workspace identifies the selected child");
assert.match(app, /designerSelectionRemoveItemButton\.hidden = !editingChild;/, "child removal is a separate action");
assert.match(html, /<option value="">Choose content type…<\/option>/, "Place New Item starts with Content Type as the first decision");
assert.match(app, /designerPlaceColumnButton\.hidden = !hasType;/, "slot-content controls progressively reveal after content type selection");

// Item 5: Starting Pitcher record rows use a visible row-wide details toggle.
assert.doesNotMatch(app, /event\.offsetX > 26/, "record-row expansion no longer depends on a tiny click region");
assert.match(css, /designer-record-fields\.designer-record-direct > summary\.designer-palette-item::before/, "record row has an explicit chevron");
assert.match(css, /designer-record-fields\.designer-record-direct\[open\].*summary\.designer-palette-item::before/, "record row has a distinct expanded chevron");
assert.match(app, /Use \$\{item\.label\} record/, "record-level creation remains available after row-wide toggle conversion");

console.log("Build 017.2 inspector hierarchy, Name Format visibility, and Starting Pitcher palette tests passed.");
