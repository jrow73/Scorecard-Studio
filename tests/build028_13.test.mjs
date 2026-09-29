import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const app = read('js/app.js');
const index = read('index.html');
const meta = JSON.parse(read('app-meta.json'));

assert.ok(/^028\.(?:13|1[4-9]|[2-9]\d+)$/.test(meta.build), `expected Build 028.13 or later, got ${meta.build}`);
assert.ok(index.includes(`styles.css?v=${meta.build}`));
assert.ok(index.includes(`app.js?v=${meta.build}`));

for (const id of ['away.bench','home.bench','away.bullpen','home.bullpen']) {
  const escaped = id.replace('.', '\\.');
  assert.match(app, new RegExp(`id:\"${escaped}\"[^\n]+forcedMode:\"repeated\"`), `${id} forces Repeated Layout in the palette`);
}
assert.ok(app.includes('["away.lineup","home.lineup","away.bench","home.bench","away.bullpen","home.bullpen"].includes(object.collection)'), 'existing Bench/Bullpen repeated blocks preserve forced Repeated Layout for New Instance');
assert.ok(app.includes('["away.lineup","home.lineup","away.bench","home.bench","away.bullpen","home.bullpen"].includes(object.block.collection)'), 'repeated-column selections preserve forced Repeated Layout context');

console.log('Build 028.13 Bench/Bullpen workflow checks passed.');
