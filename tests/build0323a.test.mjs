import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");

assert.match(app, /Click the row where the record should be placed on the scorecard\. Press Escape to cancel\./);
assert.match(app, /Click the point on the row where the item should be placed\. Press Escape to cancel\./);
assert.match(app, /Click the point on the row where \$\{label\} should be placed\./);
assert.match(app, /return "Add item to the row"/);
assert.match(app, /Arrange several attributes on one row\./);
assert.doesNotMatch(app, /Click the point where the record should be placed on the scorecard/);
assert.doesNotMatch(app, /isRecordBlock\(block\)\) return "Click the point where the item should be placed/);
console.log("Build 032.3a focused terminology checks passed.");
