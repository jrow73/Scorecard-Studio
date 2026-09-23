import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const html = read('index.html');
const app = read('js/app.js');
const meta = JSON.parse(read('app-meta.json'));

assert.equal(meta.build, '024.3');

// Standalone/Record Text Template insertion has the same Player Name format control as other template editors.
assert.match(html, /id="designer-template-name-format-wrap" hidden><select id="designer-template-name-format" aria-label="Choose name format"><\/select><\/span>/);
assert.match(app, /designerTemplateField\.addEventListener\("change", syncDesignerTemplateInsertControls\)/);
assert.match(app, /designerTemplateNameFormat\?\.addEventListener\("change", syncDesignerTemplateInsertControls\)/);
assert.match(app, /placeholder\.textContent = "Choose text field to insert…"/);
assert.match(app, /definition\.formatKind === "playerName" && !elements\.designerTemplateNameFormat\?\.value/);
assert.match(app, /templateTokenWithNameFormat\(fieldId, context, elements\.designerTemplateNameFormat\?\.value\)/);
assert.match(app, /elements\.designerTemplateField\.value = "";[\s\S]*elements\.designerTemplateNameFormat\.value = "";[\s\S]*syncDesignerTemplateInsertControls\(\)/);

console.log('Build 024.3 checks passed.');
