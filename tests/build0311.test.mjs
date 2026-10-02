import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '031.1');

// Direct generic Text Template creation must not leave the now-empty chooser panel visible.
assert.match(app, /const directGenericTemplate = pending\.kind === "custom" && pendingMode === "template";/);
assert.match(app, /elements\.designerNewItemPanel\.hidden = directGenericTemplate;/);

// Standalone/new and selected-template editing terminology is now explicit.
assert.match(html, /<label for="designer-template-text">Editor/);
assert.match(html, /id="designer-template-insert-btn"[^>]*>Insert into editor<\/button>/);
assert.match(html, /<label for="designer-selection-template">Editor/);
assert.match(html, /id="designer-selection-template-insert-btn"[^>]*>Insert into editor<\/button>/);

// Build 031.1 intentionally does not manually relabel the repeated-record creation editor;
// that surface will be checked separately for whether shared UI behavior carries through.
assert.match(html, /<label for="designer-column-template">Text template/);
assert.match(html, /id="designer-column-template-insert-btn"[^>]*>Insert Field<\/button>/);

console.log('Build 031.1 tests passed.');
