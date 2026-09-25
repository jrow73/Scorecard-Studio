import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '026.4');
assert.match(html, /id="layout-custom-fields-restore-standard"[^>]*>Restore Standard Fields</);
assert.match(app, /layoutCustomFieldsRestoreStandard: document\.querySelector\("#layout-custom-fields-restore-standard"\)/);
assert.match(app, /function restoreStandardCustomFieldDraft\(\)[\s\S]*new Set\(standardDesignerFieldIds\(\)\)/);
assert.match(app, /layoutCustomFieldsRestoreStandard\?\.addEventListener\("click", restoreStandardCustomFieldDraft\)/);

const start = app.indexOf('} else if (pending.kind === "record") {');
const end = app.indexOf('} else if (pending.kind === "collection") {', start);
assert.ok(start >= 0 && end > start, 'record creation branch should exist');
const recordBranch = app.slice(start, end);
assert.doesNotMatch(recordBranch, /add\("Single Item"/);
assert.match(recordBranch, /add\("Text Template"/);
assert.match(recordBranch, /add\("Record Layout"/);

console.log('Build 026.4 contract checks passed.');
