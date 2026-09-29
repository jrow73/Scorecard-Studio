import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const app = read('js/app.js');
const css = read('css/styles.css');
const index = read('index.html');
const meta = JSON.parse(read('app-meta.json'));

assert.ok(/^028\.(?:9|[1-9]\d+)$/.test(meta.build), `expected Build 028.9 or later, got ${meta.build}`);
assert.ok(index.includes(`styles.css?v=${meta.build}`));
assert.ok(index.includes(`app.js?v=${meta.build}`));

assert.ok(app.includes('label: "Starting Pitcher", fields, forcedMode: "record"'), 'Starting Pitcher palette item forces Record Layout');
assert.ok(app.includes('forcedMode:"record"'), 'existing record selection preserves forced Record Layout mode');
assert.ok(css.includes('Build 028.9 - Starting Pitcher final palette/workflow polish'), '028.9 palette alignment override exists');
assert.ok(css.includes('justify-content: flex-start !important;'), 'Starting Pitcher summary is explicitly left aligned');
assert.ok(css.includes('flex: 0 0 14px;'), 'single chevron has a stable left slot');

console.log('Build 028.9 checks passed.');
