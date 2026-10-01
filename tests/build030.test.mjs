import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '030');

// Parent Layout Settings is overview-only and exposes the three child editors.
for (const id of ['layout-details-open','layout-custom-fields-open','layout-formatting-open']) {
  assert.match(index, new RegExp(`id="${id}"`));
}
assert.match(index, /layout-settings-parent-footer[\s\S]*value="close">Close<\/button>/);
assert.doesNotMatch(index, /Save Layout Settings/);

// Each child owns its Save/Cancel transaction boundary.
for (const id of ['layout-details-dialog','layout-custom-fields-dialog','layout-default-formatting-dialog']) {
  assert.match(index, new RegExp(`id="${id}"`));
}
for (const fn of ['saveLayoutDetails','saveCustomFieldSelectorDraft','saveLayoutFormattingDefaults']) {
  assert.match(app, new RegExp(`async function ${fn}\\(`));
}
for (const fn of ['cancelLayoutDetails','cancelCustomFieldSelector','cancelLayoutDefaultFormatting']) {
  assert.match(app, new RegExp(`function ${fn}\\(`));
}

// Saving children persists immediately and refreshes the parent summary.
assert.match(app, /function refreshLayoutSettingsSummaries\(/);
assert.match(app, /saveLayoutDetails[\s\S]*await saveLayout\(layout\)[\s\S]*refreshLayoutSettingsSummaries/);
assert.match(app, /saveCustomFieldSelectorDraft[\s\S]*await saveLayout\(layout\)[\s\S]*refreshLayoutSettingsSummaries/);
assert.match(app, /saveLayoutFormattingDefaults[\s\S]*await saveLayout\(layout\)[\s\S]*refreshLayoutSettingsSummaries/);

// Fixed chrome: header/footer remain outside a scrolling child body.
assert.match(css, /\.layout-settings-child-card[\s\S]*grid-template-rows:\s*auto minmax\(0, 1fr\) auto/);
assert.match(css, /\.layout-settings-child-body[\s\S]*overflow:\s*auto/);

console.log('Build 030 tests passed.');
