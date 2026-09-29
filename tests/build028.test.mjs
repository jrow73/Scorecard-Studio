import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { formatDateOnly, formatFieldValue, isValidDateFormatPattern } from "../js/formatter.js";

const app = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../css/styles.css", import.meta.url), "utf8");
const formatter = fs.readFileSync(new URL("../js/formatter.js", import.meta.url), "utf8");

test("Build 028 date formatting works and validates", () => {
  assert.ok(formatter.includes('DEFAULT_DATE_FORMAT = "M/D/YYYY"'));
  assert.equal(formatDateOnly("2026-09-19", "M/D/YYYY"), "9/19/2026");
  assert.equal(formatDateOnly("2026-09-19", "MM/DD/YYYY"), "09/19/2026");
  assert.equal(formatDateOnly("2026-09-19", "MMM D, YYYY"), "Sep 19, 2026");
  assert.equal(formatDateOnly("2026-09-19", "MMMM D, YYYY"), "September 19, 2026");
  assert.equal(formatDateOnly("2026-09-19", "MMM"), "Sep");
  assert.equal(formatDateOnly("2026-09-19", "D"), "19");
  assert.equal(isValidDateFormatPattern("MMM D, YYYY"), true);
  assert.equal(isValidDateFormatPattern("MM.DD.YYYY"), false);
  assert.match(html, /designer-field-date-format/);
  assert.match(html, /designer-selection-date-format/);
});

test("First Initial + Last Name uses use/display name before formal first name", () => {
  const def = { formatKind: "playerName", valueType: "string" };
  const resolution = { state: "available", value: "Bo Yu", formatSource: { name:"Bo Yu", firstName:"Robert", useName:"Bo", lastName:"Yu" } };
  assert.equal(formatFieldValue(def, resolution, {}, { nameFormat:"first-initial-last" }), "B Yu");
});

test("Build 028 inspector has Selected Item and Formatting sibling cards", () => {
  assert.match(html, /designer-selected-item-card/);
  assert.match(html, /designer-formatting-card/);
  assert.match(html, /designer-workspace-new-btn/);
  assert.match(css, /designer-formatting-card\[open\]/);
});

test("Build 028 exposes Defensive Alignment", () => {
  assert.ok(app.includes("away.defensiveAlignment"));
  assert.ok(app.includes("home.defensiveAlignment"));
  assert.ok(app.includes('label:"Defensive Alignment"'));
});

test("Build 028 palette expandable rows use a leading chevron column", () => {
  assert.ok(css.includes("designer-palette-item-details > summary.designer-palette-item"));
  assert.ok(css.includes("grid-template-columns:14px 18px minmax(0,1fr) auto"));
});
