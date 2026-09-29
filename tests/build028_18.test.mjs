import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.equal(meta.build, '028.18');
assert.ok(app.includes('wireDesignerToolbarPopovers();'));
assert.ok(app.includes('function closeDesignerToolbarPopovers(except = null)'));
assert.ok(app.includes('menu?.addEventListener("toggle"'));
assert.ok(app.includes('document.addEventListener("pointerdown"'));
assert.ok(app.includes('closeDesignerToolbarPopover(elements.designerZoomMenu)'));
assert.ok(app.includes('closeDesignerToolbarPopovers(elements.designerPasteMenu)'));
console.log('Build 028.18 focused checks passed.');
