import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '026.3');
assert.match(html, /id="layout-custom-fields-close"/);
assert.match(html, /id="layout-custom-discard-dialog"/);
assert.match(html, /id="layout-custom-discard-confirm"/);
assert.match(app, /function customFieldSelectorIsDirty\(\)/);
assert.match(app, /function requestCloseCustomFieldSelector\(\)/);
assert.match(css, /\.layout-custom-fields-sticky[\s\S]*position:\s*sticky/);
assert.match(css, /\.dark-message-dialog \.formatting-dialog-card/);
assert.match(app, /visible\.filter\(\(item\) => item\.kind !== "custom"\)\.length/);
assert.match(app, /group\.id === "custom" \? ""/);
assert.match(app, /item\.kind === "custom" \? "" : "Available"/);
assert.match(app, /recordDetails\.append\(children\)/);
assert.match(app, /function updateDesignerBottomCollapseVisibility\(\)/);
assert.match(app, /dataset\.visibleFieldIds/);
assert.match(app, /button\.dataset\.visibleFieldIds \|\| button\.dataset\.fieldIds/);
assert.match(html, /dark-message-dialog/);

console.log('Build 026.3 contract checks passed.');
