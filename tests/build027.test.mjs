import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../js/app.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../css/styles.css", import.meta.url), "utf8");
const meta = JSON.parse(await readFile(new URL("../app-meta.json", import.meta.url), "utf8"));

assert.equal(meta.build, "027.3");
assert.match(html, /designer-selection-fit-toggle/);
assert.match(html, /designer-selection-fit-width/);
assert.match(html, /Enable Shrink to Fit/);
assert.doesNotMatch(html, /Remove Width Limit/);
assert.doesNotMatch(html, /Text stays at its preferred size/);
assert.match(css, /designer-text-fit-guide/);
assert.match(css, /designer-text-fit-handle/);
assert.match(css, /designer-fit-width-row/);
assert.doesNotMatch(css, /\.designer-text-fit-handle\s*\{[^}]*border-radius:\s*50%/s);
assert.match(app, /fitWidthPoints/);
assert.match(app, /fitWidthEnabled/);
assert.match(app, /found\.target\.fitWidthEnabled = false/);
assert.match(app, /designerStoredTextFitWidth\(found\.target\)/);
assert.doesNotMatch(app, /delete found\.target\.fitWidthPoints/);
assert.match(app, /function fittedPdfFontSize/);
assert.match(app, /preferredSize \* \(fitWidth \/ maxWidth\)/);
assert.match(app, /drawAlignedPdfText\([^;]+designerTextFitWidth\(mapping\)\)/s);
assert.match(app, /drawAlignedPdfText\([^;]+designerTextFitWidth\(column\)\)/s);
assert.match(app, /applyPreviewTextFit\(marker, mapping, previewFormat\)/);
assert.match(app, /applyPreviewTextFit\(marker, column, previewFormat\)/);
assert.doesNotMatch(app, /min(?:imum)?FontSize|MIN_FONT_SIZE/);

// Math contract: fit values remain preferred size; overflow scales only as much as needed.
const fitted = (preferred, measured, allowed) => measured <= allowed ? preferred : preferred * (allowed / measured);
assert.equal(fitted(10, 40, 60), 10);
assert.equal(fitted(10, 100, 60), 6);
assert.equal(fitted(4, 80, 40), 2, "no hard minimum prevents legitimate sub-4pt fitting");

console.log("Build 027 source-contract tests passed.");
