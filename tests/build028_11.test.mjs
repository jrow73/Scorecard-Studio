import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const css = read('css/styles.css');
const index = read('index.html');
const meta = JSON.parse(read('app-meta.json'));

assert.ok(/^028\.(?:11|1[2-9]|[2-9]\d+)$/.test(meta.build), `expected Build 028.11 or later, got ${meta.build}`);
assert.ok(index.includes(`styles.css?v=${meta.build}`));
assert.ok(index.includes(`app.js?v=${meta.build}`));
assert.ok(css.includes('#layout-formatting-dialog::backdrop'), 'Layout Settings has a specific backdrop rule');
assert.ok(css.includes('background: rgba(2, 6, 12, .86);'), 'Backdrop is strongly dimmed');
assert.ok(css.includes('#layout-formatting-dialog .layout-settings-card'), 'Layout Settings card has specific modal treatment');
assert.ok(css.includes('border: 1px solid rgba(124, 199, 255, .42);'), 'Modal edge is visibly defined');
assert.ok(!css.slice(css.lastIndexOf('/* Build 028.11')).includes('backdrop-filter'), 'No backdrop blur is introduced');

console.log('Build 028.11 modal-separation checks passed.');
