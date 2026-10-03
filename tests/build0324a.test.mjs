import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");

const populateStart = app.indexOf("function populateNameFormatSelects()");
assert.ok(populateStart >= 0, "populateNameFormatSelects should exist");
const populateBlock = app.slice(populateStart, app.indexOf("function validDesignerDateFormat", populateStart));

assert.match(populateBlock, /elements\.designerIndividualTemplateNameFormat/);
assert.match(populateBlock, /placeholderSelects = new Set\([\s\S]*designerIndividualTemplateNameFormat/);
assert.match(populateBlock, /for \(const select of \[([\s\S]*?)designerIndividualTemplateNameFormat/);
assert.match(app, /designerIndividualTemplateField\?\.addEventListener\("change", \(\) => \{ syncTemplateNameFormatControl\(elements\.designerIndividualTemplateField, elements\.designerIndividualTemplateNameFormatWrap, elements\.designerIndividualTemplateNameFormat\)/);
assert.match(app, /for \(const entry of PLAYER_NAME_FORMATS\)/);

console.log("Build 032.4a Defensive Alignment Player Name format checks passed.");
