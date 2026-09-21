import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FORMAT_GROUPS, FONT_FACES, COLOR_SWATCHES, appFormattingDefaults,
  appConditionalFormattingDefaults, ensureLayoutFormattingDefaults,
  ensureLayoutConditionalFormatting, conditionalFormattingEnabled,
  formattingGroupForFieldId, formattingGroupForContext, handednessGroup,
  mergeFormat, colorDisplayName, hexToRgb01
} from "../js/formatting.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "js/app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css/styles.css"), "utf8");

assert.equal(FORMAT_GROUPS.length, 11);
assert.deepEqual(FONT_FACES, ["Helvetica", "Times", "Courier"]);
assert.equal(COLOR_SWATCHES.length, 9);
const defaults = appFormattingDefaults();
for (const group of FORMAT_GROUPS) {
  assert.deepEqual(defaults[group.id], { fontFace:"Helvetica", fontSize:10, color:"#000000", bold:false, italic:false });
}
assert.deepEqual(appConditionalFormattingDefaults(), { hitters:false, pitchers:false });
assert.deepEqual(ensureLayoutConditionalFormatting({}), { hitters:false, pitchers:false });
assert.equal(conditionalFormattingEnabled({}, "bats-left"), false);
assert.equal(conditionalFormattingEnabled({ conditionalFormatting:{ hitters:true } }, "bats-left"), true);
assert.equal(conditionalFormattingEnabled({ conditionalFormatting:{ pitchers:true } }, "throws-right"), true);

assert.equal(formattingGroupForFieldId("game.date"), "game");
assert.equal(formattingGroupForFieldId("away.team.name"), "away-team");
assert.equal(formattingGroupForFieldId("away.lineup[].player.name"), "away-players");
assert.equal(formattingGroupForFieldId("home.startingPitcher.player.name"), "home-players");
assert.equal(formattingGroupForContext("home.bullpen"), "home-players");
assert.equal(handednessGroup("home.lineup", "L"), "bats-left");
assert.equal(handednessGroup("away.bullpen", "R"), "throws-right");
assert.equal(handednessGroup("home.startingPitcher", "S"), "throws-switch");

const merged = mergeFormat(defaults["away-players"], { fontSize:6, bold:true });
assert.equal(merged.fontFace, "Helvetica");
assert.equal(merged.fontSize, 6);
assert.equal(merged.color, "#000000");
assert.equal(merged.bold, true);
assert.deepEqual(hexToRgb01("#ff0000"), [1,0,0]);
assert.equal(colorDisplayName("#1565c0"), "Blue");
assert.equal(colorDisplayName("#123456"), "Custom (#123456)");
assert.equal(Object.keys(ensureLayoutFormattingDefaults({})).length, 11);

assert.match(html, /id="layout-formatting-btn"/);
assert.match(html, /id="designer-layout-settings-btn"/);
assert.match(html, /id="layout-formatting-dialog"/);
assert.doesNotMatch(html, /id="field-formatting-dialog"/);
assert.doesNotMatch(html, /id="designer-selection-formatting-btn"/);
assert.match(html, /id="designer-selection-font-face"/);
assert.match(html, /id="designer-selection-font-size"/);
assert.match(html, /id="designer-selection-bold"/);
assert.match(html, /id="designer-selection-italic"/);
assert.match(html, /id="designer-selection-format-restore"/);
assert.match(html, /Current Defaults:/);
assert.match(html, /Restore Defaults/);
assert.doesNotMatch(css, /build019-legacy-font-size/);

assert.doesNotMatch(html, /datalist id="designer-font-size-options"/);
assert.match(html, /id="designer-font-size-menu"/);
assert.match(html, /data-font-size="10"/);
assert.match(css, /designer-format-toolbar \.scorecard-color-panel \{ left: 0; right: auto; \}/);
assert.match(css, /layout-conditional-heading \{ display: flex;/);

assert.match(app, /conditionalFormatting:\s*appConditionalFormattingDefaults\(\)/);
assert.match(app, /Hitter Conditional Formatting/);
assert.match(app, /Pitcher Conditional Formatting/);
assert.match(app, /Format hitters according to their batting side \(Left, Right, Switch\)/);
assert.match(app, /Format pitchers according to their throwing arm \(Left, Right, Switch\)/);
assert.match(app, /conditionalFormattingEnabled\(layout, options\.handednessGroup\)/);
assert.match(app, /renderColorPicker/);
assert.match(app, /Custom Color…/);
assert.match(app, /event\.key === "Enter"/);
assert.match(app, /input\.blur\(\)/);
assert.match(app, /formattingOverride/);
assert.match(app, /embedFormattingFonts/);
assert.match(app, /"Helvetica\|1\|1": S\.HelveticaBoldOblique/);
assert.match(app, /"Times\|1\|1": S\.TimesRomanBoldItalic/);
assert.match(app, /"Courier\|1\|1": S\.CourierBoldOblique/);
assert.doesNotMatch(html, /<option>Arial<\/option>|<option>Times New Roman<\/option>|<option>Courier New<\/option>/);
assert.doesNotMatch(app, /shrinkToFit|maxWidth|textWrap/i);

console.log("Build 019.2 formatting defaults, opt-in conditional formatting, inline Inspector controls, fixed font-size choices, color palette positioning, and PDF-font regression tests passed.");
