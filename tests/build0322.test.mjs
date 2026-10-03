import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.equal(meta.build, '032.2a');
assert.match(html, /designer-prev-btn[^>]*designer-toolbar-icon|designer-toolbar-icon[^>]*designer-prev-btn/);
assert.match(html, /designer-next-btn[^>]*designer-toolbar-icon|designer-toolbar-icon[^>]*designer-next-btn/);
assert.match(css, /Build 032\.2 — Designer visual consistency pass/);
assert.match(css, /\.designer-palette \.secondary-button\.compact-button/);
assert.match(css, /#designer-template-text,[\s\S]*#designer-selection-template,[\s\S]*#designer-column-template/);
assert.match(css, /min-height:\s*28px;[\s\S]*height:\s*28px;/);
console.log('Build 032.2 focused checks passed.');
