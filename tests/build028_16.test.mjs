import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const slot = fs.readFileSync(new URL('../js/slot-content.js', import.meta.url), 'utf8');
const formatting = fs.readFileSync(new URL('../js/formatting.js', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.ok(['028.16','028.17','028.18'].includes(meta.build));
assert.ok(app.includes('function teamInfoContextForField(fieldId)'));
assert.ok(app.includes('return "away.teamInfo"'));
assert.ok(app.includes('return "home.teamInfo"'));
assert.ok(app.includes('{ originField: origin.id }'));
assert.ok(app.includes('mapping.content?.originField'));
assert.ok(app.includes('["field","collection","record","context","originField","formattingGroup"]'));
assert.ok(slot.includes('value === "away.teamInfo"'));
assert.ok(slot.includes('value === "home.teamInfo"'));
assert.ok(formatting.includes('String(context) === "away.teamInfo"'));
assert.ok(formatting.includes('String(context) === "home.teamInfo"'));
console.log('Build 028.16 focused checks passed.');
