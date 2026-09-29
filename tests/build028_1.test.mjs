import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../css/styles.css", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const meta = JSON.parse(fs.readFileSync(new URL("../app-meta.json", import.meta.url), "utf8"));

test("Build 028.1 scopes Date Format UI to Game Date only", () => {
  assert.match(app, /const isGameDate = definition\?\.id === "game\.date";/);
  assert.match(app, /designerFieldDateFormatWrap\.hidden = !isGameDate/);
  assert.match(app, /const hasDateFormat = !isTemplate && definition\?\.id === "game\.date";/);
  assert.doesNotMatch(app, /designerFieldDateFormatWrap\.hidden = definition\?\.valueType !== "date"/);
});

test("Build 028.1 uses explicit palette chevron cells", () => {
  const matches = app.match(/className = "designer-palette-chevron"/g) || [];
  assert.ok(matches.length >= 2, "record and ordinary expandable palette summaries should both get explicit chevrons");
  assert.match(css, /grid-template-columns:\s*14px 18px minmax\(0, 1fr\) auto/);
  assert.match(css, /\.designer-palette-chevron::before \{ content: "\\25B6"; \}/);
  assert.match(css, /\[open\][^\n]*designer-palette-chevron::before[\s\S]*content: "\\25BC"/);
});

test("Build metadata and cache busters are 028.1", () => {
  assert.equal(meta.build, "028.1");
  assert.match(html, /styles\.css\?v=028\.1/);
  assert.match(html, /app\.js\?v=028\.1/);
});
