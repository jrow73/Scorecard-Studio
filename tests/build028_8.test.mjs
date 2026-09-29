import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.ok(/^028\.(?:8|9|[1-9]\d+)$/.test(meta.build), `expected Build 028.8 or later, got ${meta.build}`);

const recordBranch = app.match(/else if \(pending\.kind === "record"\) \{([\s\S]*?)\n\s*\} else if \(pending\.kind === "collection"\)/)?.[1] || '';
assert.ok(recordBranch.includes('add("Record Layout"'), 'record workflow still offers Record Layout');
assert.ok(!recordBranch.includes('add("Text Template"'), 'whole record workflow no longer offers Text Template');

assert.ok(css.includes('Build 028.8 - Starting Pitcher palette/workflow cleanup'), '028.8 palette override exists');
assert.ok(css.includes('grid-template-columns: 14px minmax(0, 1fr)'), 'record summary uses compact two-column layout');
assert.ok(css.includes('content: none !important'), 'native/pseudo duplicate chevrons are suppressed');
assert.ok(css.includes('text-align: left'), 'record label is explicitly left-aligned');

console.log('Build 028.8 checks passed.');
