import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.equal(meta.version, '0.2.0-dev');
assert.match(meta.build, /^02[3-9](?:\.|$)/);

// Lasso completion must commit structural-parent state before rendering selection state,
// including the one-visible-child case.
assert.match(app, /setDesignerMultiSelection\(found, \{ completeBlockIds: completeBlocks \}\)/);
assert.match(app, /setDesignerMultiSelection\(\[\.\.\.base, \.\.\.found\], \{ completeBlockIds: new Set\(\[\.\.\.priorComplete, \.\.\.completeBlocks\]\) \}\)/);
assert.match(app, /if \(options\.completeBlockIds instanceof Set\) state\.designerCompleteBlockSelection = new Set\(options\.completeBlockIds\);/);

// A structurally selected single child must not be collapsed back to an ordinary
// single selection when the user begins dragging it.
assert.match(app, /if \(!isDesignerSelectionSelected\(selection\)\) selectDesignerObject\(selection\);\s*const selections = designerStructuralSelectionActive\(\) \? structuralDesignerSelections\(\) : \[selection\];/s);
assert.doesNotMatch(app, /if \(!designerMultiSelectionActive\(\) \|\| !isDesignerSelectionSelected\(selection\)\) selectDesignerObject\(selection\);/);

// Complete structural selection gets the multi-selection halo even when only one
// child definition is selected.
assert.match(app, /const structuralGroup = selected && designerStructuralSelectionActive\(\);/);
assert.match(app, /element\.classList\.toggle\("multi-selected", structuralGroup\);/);

console.log('Build 022.3 lasso structural-selection state checks passed.');
