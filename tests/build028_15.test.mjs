import assert from 'node:assert/strict';
import fs from 'node:fs';
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
assert.ok(app.includes('designerBlockSortDraft: { field: "", direction: "asc" }'));
assert.ok(app.includes('const creating = Boolean(state.designerPaletteSelection && state.designerPendingMode === "repeated")'));
assert.ok(app.includes('state.designerBlockSortDraft = { field: "", direction: "asc" };'));
assert.ok(app.includes('state.designerBlockSortDraft?.field ? { sort:'));
console.log('Build 028.15 focused checks passed.');
