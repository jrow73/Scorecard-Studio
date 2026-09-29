import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const app = read('js/app.js');
const index = read('index.html');
const meta = JSON.parse(read('app-meta.json'));

assert.ok(/^028\.(?:10|1[1-9]|[2-9]\d+)$/.test(meta.build), `expected Build 028.10 or later, got ${meta.build}`);
assert.ok(index.includes(`styles.css?v=${meta.build}`));
assert.ok(index.includes(`app.js?v=${meta.build}`));

assert.ok(app.includes('function startingPitcherContextForField(fieldId)'), 'SP field context helper exists');
assert.ok(app.includes('function startingPitcherContextForTarget(target)'), 'SP target context helper exists');
assert.ok(app.includes('function scalarFormattingOptions(target, model = DESIGNER_SAMPLE_MODEL, layout = null)'), 'scalar conditional-format resolver exists');
assert.ok(app.includes('populateDesignerTemplateFieldSelect(recordContext)'), 'SP-derived template picker is scoped to record context');
assert.ok(app.includes('startingPitcherContextForTarget(selected)'), 'existing SP-derived template editor restores record context');
assert.ok(app.includes('effectiveFormatting(mapping, scalarFormattingOptions(mapping, DESIGNER_SAMPLE_MODEL))'), 'Designer preview applies SP conditional formatting');
assert.ok(app.includes('effectiveFormatting(mapping, scalarFormattingOptions(mapping, model, layout))'), 'generated PDF applies live SP conditional formatting');
assert.ok(app.includes('...(placement.context ? { context: placement.context } : {})'), 'new SP scalar placements persist context');
assert.ok(app.includes('const options = inlineFormattingOptions({ selection, object, target });'), 'Inspector defaults/restore use SP conditional context');

console.log('Build 028.10 Starting Pitcher context/conditional-format checks passed.');
