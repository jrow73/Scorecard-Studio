import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const html = read('index.html');
const app = read('js/app.js');
const css = read('css/styles.css');
const meta = JSON.parse(read('app-meta.json'));

assert.equal(meta.build, '024.3');

// Selected Object card: compact action row and no routine helper prose.
const inspectorStart = html.indexOf('id="designer-live-inspector"');
const inspectorEnd = html.indexOf('</section>', inspectorStart);
const inspector = html.slice(inspectorStart, inspectorEnd);
assert.doesNotMatch(inspector, /designer-selection-help/);
assert.doesNotMatch(html, /Parent actions apply to the complete object/);
assert.doesNotMatch(html, /Content in each slot/);
const deselect = inspector.indexOf('designer-selection-clear-btn');
const newInstance = inspector.indexOf('designer-selection-new-instance-btn');
const editLayout = inspector.indexOf('designer-workspace-layout-btn');
const del = inspector.indexOf('designer-selection-delete-btn');
assert.ok(deselect < newInstance && newInstance < editLayout && editLayout < del);
assert.match(css, /designer-live-inspector \.designer-panel-heading[\s\S]*display: grid/);

// Inspector terminology is user-facing.
assert.match(html, /id="designer-workspace-new-btn"[^>]*>Create New Item</);
assert.match(html, /id="designer-place-column-btn"[^>]*>Place Item on Scorecard</);
assert.match(html, /id="designer-individual-place-btn"[^>]*>Place Item on Scorecard</);

// Individual Placement creation no longer renders an inventory of existing mappings.
assert.doesNotMatch(html, /Individual mappings/);
assert.doesNotMatch(html, /id="designer-individual-list"/);
assert.match(app, /function renderDesignerIndividualList\(\) \{[\s\S]*inventory-free/);

// Placed Text Template editor matches creation flow.
assert.match(html, /id="designer-selection-template-field" aria-label="Choose text field to insert"/);
assert.doesNotMatch(html, /for="designer-selection-template-field">Insert field/);
assert.match(html, /id="designer-selection-template-name-format-wrap" hidden><select/);
assert.match(app, /placeholder\.textContent = "Choose text field to insert…"/);
assert.match(app, /templateTokenWithNameFormat\(field, context, elements\.designerSelectionTemplateNameFormat/);
assert.match(app, /designerSelectionTemplateField\.value = ""/);
assert.match(app, /syncTemplateNameFormatControl\(elements\.designerSelectionTemplateField/);

// Disabled Paste retains hover/tooltip affordances instead of suppressing pointer events.
assert.doesNotMatch(css, /designer-paste-menu\.disabled\s*\{[^}]*pointer-events\s*:\s*none/s);
assert.match(css, /designer-paste-menu\.disabled > summary \{ cursor: not-allowed; pointer-events: auto; \}/);
assert.match(html, /id="designer-paste-btn" title="Paste \(Ctrl\/Cmd\+V\)"/);

console.log('Build 024.2 checks passed.');
