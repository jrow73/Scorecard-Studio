import fs from 'node:fs';
import assert from 'node:assert/strict';

const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.equal(meta.build, '032.2a');
assert.match(css, /Build 032\.2a — Inspector card spacing correction/);
assert.match(css, /\.designer-selected-item-card,[\s\S]*\.designer-new-item-panel\s*\{[\s\S]*padding:\s*10px;/);
assert.match(css, /\.designer-selected-item-card \.designer-workspace-heading\s*\{[\s\S]*gap:\s*0;[\s\S]*padding-bottom:\s*0;/);
assert.match(css, /\.designer-selected-item-card \.designer-workspace-heading \.section-label,[\s\S]*\.designer-new-item-panel \.section-label\s*\{[\s\S]*margin-bottom:\s*2px;/);
console.log('Build 032.2a focused checks passed.');
