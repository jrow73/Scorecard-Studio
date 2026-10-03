import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '032.1');

// Palette filter gains an explicit Unused-only state.
assert.match(html, /<option value="all">All data<\/option>[\s\S]*?<option value="used">Used only<\/option>[\s\S]*?<option value="unused">Unused only<\/option>/);
assert.match(app, /if \(filter === "unused" && instances\.length\) return false;/);

// Search and Used/Unused filtering force matching categories open for visibility.
assert.match(app, /\["used", "unused"\]\.includes\(elements\.designerPaletteFilter\?\.value\)/);

// Category ratios are calculated from the complete available immediate-child set,
// not from the search/filter-reduced visible list.
assert.match(app, /renderDesignerPaletteCategories\(elements\.designerUnplacedList, visible, allItems\)/);
assert.match(app, /const availableGroupItems = allItems\.filter\(\(item\) => item\.groupId === group\.id\);/);
assert.match(app, /const usedInGroup = availableGroupItems\.filter\(\(item\) => designerInstancesForItem\(item, selectedLayout\(\)\)\.length\)\.length;/);
assert.match(app, /const groupStatus = group\.id === "custom" \? "" : `\$\{usedInGroup\} of \$\{availableGroupItems\.length\}`;/);

// Old one-sided category wording is no longer generated.
assert.doesNotMatch(app, /`\$\{usedInGroup\} used`/);
assert.doesNotMatch(app, /`\$\{groupItems\.length\} available`/);

console.log('Build 032.1 tests passed.');
