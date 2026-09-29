import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const app = read('js/app.js');
const index = read('index.html');
const css = read('css/styles.css');
const meta = JSON.parse(read('app-meta.json'));

assert.ok(Number(meta.build) >= 28.14);
assert.ok(/styles\.css\?v=028\.(?:14|15)/.test(index));
assert.ok(/app\.js\?v=028\.(?:14|15)/.test(index));

assert.ok(index.includes('id="designer-block-sort"'), 'sort dropdown exists');
assert.ok(index.includes('Sort: None'), 'sort default is None');
assert.ok(index.includes('id="designer-block-sort-asc"'), 'ascending action exists');
assert.ok(index.includes('id="designer-block-sort-desc"'), 'descending action exists');
assert.ok(css.includes('.designer-sort-direction-button.active'), 'active direction styling exists');

assert.ok(app.includes('["away.bench", "home.bench", "away.bullpen", "home.bullpen"]'), 'sorting is scoped to Bench/Bullpen');
assert.ok(app.includes('function repeatedSourceSlots(model, block)'), 'display-slot to source-slot sorter exists');
assert.ok(app.includes('function repeatedSourceSelector(model, block, displaySlot)'), 'shared source selector exists');
assert.ok(app.includes('resolution.formatSource || {}'), 'player-name sorting can use normalized player metadata');
assert.ok(app.includes('/[.]player[.]number$/.test(definition.id)'), 'jersey number receives numeric sort treatment');
assert.ok(app.includes('if (!a) return 1;') && app.includes('if (!b) return -1;'), 'blank sort values stay at bottom');
assert.ok(app.includes('const selector = repeatedSourceSelector(model, block, slotIndex + 1);'), 'PDF rendering uses sorted source selector');
assert.ok(app.includes('repeatedSourceSelector(DESIGNER_SAMPLE_MODEL, block, slot)'), 'Designer preview uses sorted source selector');
assert.ok(app.includes('conditionalFormattingGroup(DESIGNER_SAMPLE_MODEL, blockContext(block), repeatedSourceSelector'), 'conditional formatting follows sorted source row');

console.log('Build 028.14 Bench/Bullpen sorting checks passed.');
