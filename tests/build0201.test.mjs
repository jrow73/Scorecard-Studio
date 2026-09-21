import fs from 'node:fs';
import assert from 'node:assert/strict';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');

assert.match(html, /Build 020\.1 • Designer Workspace/);
assert.match(html, /class="designer-toolbar-actions"[\s\S]*id="designer-undo-btn"[\s\S]*id="designer-redo-btn"[\s\S]*id="designer-layout-settings-btn"/);
assert.match(html, /id="designer-undo-btn"[^>]*title="Undo \(Ctrl\/Cmd\+Z\)"[^>]*aria-label="Undo"[^>]*>↶<\/button>/);
assert.match(html, /id="designer-redo-btn"[^>]*title="Redo \(Ctrl\+Y or Ctrl\/Cmd\+Shift\+Z\)"[^>]*aria-label="Redo"[^>]*>↷<\/button>/);
assert.match(html, /id="designer-layout-settings-btn"[^>]*title="Layout Settings"[^>]*aria-label="Layout Settings"[^>]*>⚙<\/button>/);
assert.doesNotMatch(html, /id="designer-undo-btn"[^>]*>↶ Undo<\/button>/);
assert.match(css, /\.designer-toolbar-icon\s*\{[\s\S]*min-height:\s*36px/);
assert.match(app, /Build:\s*020\.1/);
assert.match(app, /async function undoDesignerChange/);
assert.match(app, /async function redoDesignerChange/);
console.log('Build 020.1 static regression checks passed.');
