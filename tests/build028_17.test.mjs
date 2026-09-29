import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.ok(['028.17','028.18'].includes(meta.build));
assert.equal((html.match(/id="designer-place-rows-btn"/g) || []).length, 1);
assert.ok(html.includes('class="designer-layout-workspace-actions" id="designer-layout-workspace-actions" hidden'));
assert.ok(html.includes('class="secondary-button compact-button" id="designer-place-rows-btn"'));
assert.ok(html.indexOf('id="designer-place-rows-btn"') < html.indexOf('id="designer-workspace-new-btn"'));
assert.ok(css.includes('.designer-controls .secondary-button:not(.designer-toolbar-icon)'));
assert.ok(css.includes('.designer-controls .danger-button'));
assert.ok(css.includes('.designer-layout-workspace-actions:not([hidden]) + .designer-child-workspace-actions:not([hidden])'));
assert.ok(app.includes('designerLayoutWorkspaceActions: document.querySelector("#designer-layout-workspace-actions")'));
assert.ok(app.includes('elements.designerLayoutWorkspaceActions.hidden = true'));
assert.ok(app.includes('elements.designerLayoutWorkspaceActions.hidden = !object.geometry'));
console.log('Build 028.17 focused checks passed.');
