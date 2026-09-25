import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.ok(['026.2', '026.3'].includes(meta.build));
assert.match(html, /id="layout-field-total-count"/);
assert.match(html, /id="layout-field-standard-count"/);
assert.doesNotMatch(html, /has 170 possible fields/);
assert.doesNotMatch(html, /The 65 most common fields/);
assert.match(app, /categories: \["Game", "Game \/ Weather"\]/);
assert.match(app, /key: "away-team"[\s\S]*key: "home-team"/);
assert.match(app, /key: "away-lineup"[\s\S]*key: "home-lineup"/);
assert.match(app, /dataset\.pickerCount/);
assert.match(app, /dataset\.pickerAction = "select"/);
assert.match(app, /dataset\.pickerAction = "deselect"/);
assert.match(app, /PDF Cannot Be Replaced|layoutPdfErrorDialog/);
assert.match(app, /function designerFieldEnabled/);
assert.match(app, /populateDesignerSelectionTemplateFieldSelect\(\)[\s\S]*filter\(\(definition\) => designerFieldEnabled\(definition\)\)/);
assert.match(app, /const selected = new Set\(state\.layoutFieldDraftSaved\)/);
assert.doesNotMatch(app, /state\.layoutFieldDraftSaved\.size \? state\.layoutFieldDraftSaved : new Set\(standardDesignerFieldIds\(\)\)/);
assert.match(css, /layout-field-picker-group\.full-width/);

console.log('Build 026.2 contract checks passed.');
