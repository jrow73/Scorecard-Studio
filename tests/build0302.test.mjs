import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '030.2');

// Parent Field Palette summary is plain text with one consistent count phrase.
assert.match(index, /<div class="layout-settings-summary-line"><span id="layout-field-summary-detail"><\/span><\/div>/);
assert.doesNotMatch(index, /id="layout-field-count"/);
assert.match(app, /layoutFieldSummaryDetail\.textContent = `\$\{selected\.size\} of \$\{totalCount\} selected`/);
assert.doesNotMatch(app, /Custom Fields ·/);
assert.doesNotMatch(app, /available fields selected/);

// Child count moves out of the header and into the footer as ordinary text.
assert.doesNotMatch(index, /layout-custom-fields-header-actions"><span[^>]*id="layout-custom-field-count"/);
assert.match(index, /layout-settings-child-footer"><div class="layout-custom-fields-footer-left"><span class="layout-custom-field-count" id="layout-custom-field-count"><\/span><button[^>]*id="layout-custom-fields-restore-standard"/);
assert.match(app, /layoutCustomFieldCount\.textContent = `\$\{state\.layoutFieldDraft\.size\} of \$\{totalCount\} selected`/);

// Existing 030.1 footer actions remain intact.
assert.match(index, /id="layout-custom-fields-restore-standard"[^>]*>Restore Standard Fields<\/button>[\s\S]*?<button class="secondary-button" id="layout-custom-fields-cancel"[\s\S]*?<button class="primary-button" id="layout-custom-fields-save"/);

console.log('Build 030.2 tests passed.');
