import assert from "node:assert/strict";
import fs from "node:fs";
import { getCatalogFields } from "../js/field-registry.js";

const app = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../css/styles.css", import.meta.url), "utf8");
const meta = JSON.parse(fs.readFileSync(new URL("../app-meta.json", import.meta.url), "utf8"));

assert.equal(meta.build, "026");
assert.match(html, /Standard Fields/);
assert.match(html, /Custom Fields/);
assert.match(html, /layout-custom-field-list/);
assert.match(app, /paletteMode/);
assert.match(app, /enabledFieldIds/);
assert.match(app, /visibilityTier === "standard"/);
assert.match(app, /LEGACY_UMPIRE_SCALAR_PREFIXES/);
assert.match(app, /state\.designerPaletteExpanded\.clear\(\)/);
assert.match(app, /id\.startsWith\("away\.manager"\)/);
assert.match(css, /\.layout-settings-card \{/);
assert.match(css, /\.layout-choice-card:has\(input:checked\)/);

const standard = getCatalogFields().filter((d) => d.visibilityTier === "standard");
const custom = getCatalogFields().filter((d) => d.visibilityTier === "custom");
assert.ok(standard.length > 0, "registry still exposes Standard fields");
assert.ok(custom.length > 0, "registry still exposes Custom fields");
assert.ok(standard.some((d) => d.collection === "game.umpires.crew"), "Umpire Crew remains a Standard collection");
assert.ok(custom.some((d) => d.id === "away.startingPitcher.stats.whip"), "custom picker has real Custom-tier player fields");

console.log("Build 026 field-palette/settings contract passed.");
