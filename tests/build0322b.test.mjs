import fs from 'node:fs';
import assert from 'node:assert/strict';

const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.equal(meta.build, '032.2b');
assert.match(css, /Build 032\.2b — Inspector card and Formatting correction/);
assert.match(css, /\.designer-subordinate-workspace\s*\{[\s\S]*padding:\s*10px !important;/);
assert.match(css, /\.designer-selected-item-card\s*\{[\s\S]*padding:\s*0 !important;/);
assert.match(css, /\.designer-selected-item-card \.designer-workspace-heading\s*\{[\s\S]*border-bottom:\s*1px solid var\(--line\);/);
assert.match(css, /min-height:\s*24px !important;/);
assert.match(css, /height:\s*24px !important;/);
console.log('Build 032.2b focused checks passed.');
