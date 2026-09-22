import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const { DESIGNER_SAMPLE_MODEL: model } = await import(pathToFileURL(new URL('../js/sample-data.js', import.meta.url).pathname));

assert.equal(model.away.lineup.length, 9);
assert.equal(model.home.lineup.length, 9);
assert.equal(model.away.bench.length, 6);
assert.equal(model.home.bench.length, 6);
assert.equal(model.away.bullpen.length, 14);
assert.equal(model.home.bullpen.length, 14);
assert.equal(model.game.umpires.crew.length, 6);
assert.notEqual(model.away.team.name.length, model.home.team.name.length);
assert.ok(model.game.venue.name.length >= 27, 'venue should stress long venue-name layouts');

const serialized = JSON.stringify(model);
for (const realName of ['Seattle Mariners','Tampa Bay Rays','T-Mobile Park','Julio Rodríguez','Logan Gilbert','Shane Baz','Dan Wilson','Kevin Cash','Pat Hoberg']) {
  assert.ok(!serialized.includes(realName), `representative data must not contain ${realName}`);
}

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
assert.ok(app.includes('const model = DESIGNER_SAMPLE_MODEL;'));
assert.ok(app.includes('buildDesignerTestFilename(layout)'));
assert.ok(app.includes('_TEST.pdf'));
assert.ok(!app.includes('No game is loaded. Return Home and load a game first.'));

const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));
assert.equal(meta.build, '023');

console.log('Build 023 representative-data checks passed.');
