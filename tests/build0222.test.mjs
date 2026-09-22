import fs from 'node:fs';
import assert from 'node:assert/strict';
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.equal(meta.version, '0.2.0-dev');
assert.match(meta.build, /^02[3-9](?:\.|$)/);
assert.match(app, /function designerStructuralSelectionActive\(\) \{\s*return designerMultiSelectionActive\(\) \|\| completeDesignerBlockIds\(\)\.size > 0;/s);
assert.match(app, /function structuralDesignerSelections\(\) \{[\s\S]*for \(const selection of activeDesignerSelections\(\)\)/);
assert.match(app, /const selections = designerStructuralSelectionActive\(\) \? structuralDesignerSelections\(\) : \[selection\]/);
assert.match(app, /if \(designerStructuralSelectionActive\(\)\) \{\s*for \(const selection of structuralDesignerSelections\(\)\)/s);
assert.match(app, /if \(designerStructuralSelectionActive\(\)\) return deleteDesignerMultiSelection\(\)/);
assert.match(app, /if \(!layout \|\| !designerStructuralSelectionActive\(\)\) return;/);
console.log('Build 022.2 single-child repeated-layout structural selection checks passed.');
