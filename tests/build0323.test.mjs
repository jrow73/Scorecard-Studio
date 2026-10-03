import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '032.3');
assert.match(html, /designer-capacity-label[^>]*>Number of rows</);
assert.match(html, /designer-column-field-wrap[^>]*hidden>Field/);
assert.match(app, /Number of \$\{arrangement === "horizontal" \? "columns" : "rows"\}/);
assert.match(app, /function repeatedGeometryBanner\(/);
assert.match(app, /function repeatedColumnBanner\(/);
assert.match(app, /function repeatedPositionLabel\(/);
assert.match(app, /Add item to the \$\{noun\}/);
assert.match(app, /Click the point on the top row/);
assert.match(app, /Click the point in the leftmost column/);
assert.match(app, /Click the top-left position/);
assert.match(app, /vertical \$\{rows\}-row list/);
assert.match(app, /horizontal \$\{columns\}-column list/);

const retiredUserPhrases = [
  'Number of slots',
  'Slot field',
  'Add slot content',
  'first slot anchor',
  'opposite/final slot anchor',
  'one-record slot anchor',
  'field anchor in slot 1',
  'baseline origin for slot',
  'outer slot anchors',
  'slot content?',
  'slot content.',
  'slot content`',
  'slot field to render',
  'one-record slot.'
];
for (const phrase of retiredUserPhrases) {
  assert.equal(app.includes(phrase) || html.includes(phrase), false, `retired user-facing phrase remains: ${phrase}`);
}

console.log('Build 032.3 terminology checks passed.');
