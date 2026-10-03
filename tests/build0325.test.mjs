import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const meta = JSON.parse(fs.readFileSync(new URL("../app-meta.json", import.meta.url), "utf8"));

assert.equal(meta.build, "032.5");
assert.match(html, /<h3 id="designer-heading">Layout Designer<\/h3>/);
assert.match(html, /id="designer-layout-meta"/);
assert.doesNotMatch(html, /data-app-build-upper-prefix="Designer Workspace"/);
assert.doesNotMatch(html, />Designer Workspace<\/p>/);

console.log("Build 032.5 checks passed.");
