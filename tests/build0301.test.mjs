import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '030.1');

// Cancel + Save are adjacent on the bottom-right; restore actions live bottom-left.
assert.match(index, /layout-details-child-card|layout-settings-child-card/);
assert.match(index, /layout-settings-child-footer"><span class="dialog-spacer"><\/span><button class="secondary-button" id="layout-details-cancel"[\s\S]*?<button class="primary-button" id="layout-details-save"/);
assert.match(index, /layout-settings-child-footer"><button class="secondary-button" id="layout-custom-fields-restore-standard"[^>]*>Restore Standard Fields<\/button><span class="dialog-spacer"><\/span><button class="secondary-button" id="layout-custom-fields-cancel"[\s\S]*?<button class="primary-button" id="layout-custom-fields-save"/);
assert.match(index, /layout-settings-child-footer"><button class="secondary-button" id="layout-formatting-reset-btn"[^>]*>Restore App Defaults<\/button><span class="dialog-spacer"><\/span><button class="secondary-button" id="layout-formatting-cancel"[\s\S]*?<button class="primary-button" id="layout-formatting-save-btn"/);

// All child close paths route through dirty-state guards.
assert.match(app, /layoutDetailsCancel\?\.addEventListener\("click", requestCloseLayoutDetails\)/);
assert.match(app, /layoutDetailsClose\?\.addEventListener\("click", requestCloseLayoutDetails\)/);
assert.match(app, /layoutCustomFieldsCancel\?\.addEventListener\("click", requestCloseCustomFieldSelector\)/);
assert.match(app, /layoutFormattingCancel\?\.addEventListener\("click", requestCloseLayoutDefaultFormatting\)/);
assert.match(app, /layoutDetailsDialog\?\.addEventListener\("cancel"[\s\S]*requestCloseLayoutDetails/);
assert.match(app, /layoutCustomFieldsDialog\?\.addEventListener\("cancel"[\s\S]*requestCloseCustomFieldSelector/);
assert.match(app, /layoutDefaultFormattingDialog\?\.addEventListener\("cancel"[\s\S]*requestCloseLayoutDefaultFormatting/);
assert.match(app, /function showLayoutSettingsDiscardPrompt\(/);

// Save and restore buttons are state-aware.
assert.match(app, /layoutDetailsSave\.disabled = !layoutDetailsIsDirty\(\)/);
assert.match(app, /layoutCustomFieldsSave\.disabled = !customFieldSelectorIsDirty\(\)/);
assert.match(app, /layoutCustomFieldsRestoreStandard\.disabled = fieldSelectionIsStandard\(state\.layoutFieldDraft\)/);
assert.match(app, /layoutFormattingSaveButton\.disabled = !layoutFormattingIsDirty\(\)/);
assert.match(app, /layoutFormattingResetButton\.disabled = layoutFormattingIsAtAppDefaults\(\)/);

// Parent formatting summary is deliberately simple.
assert.match(app, /Currently using app defaults/);
assert.match(app, /Currently using custom formatting/);

console.log('Build 030.1 tests passed.');
