import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

assert.ok(/^028\.(?:7|8|9|[1-9]\d+)$/.test(meta.build), `expected Build 028.7 or later, got ${meta.build}`);
assert.ok(html.includes(`styles.css?v=${meta.build}`));
assert.ok(html.includes(`app.js?v=${meta.build}`));
assert.match(html, /id="designer-individual-field-wrap"[^>]*hidden/);
assert.match(html, /id="designer-individual-name-format-wrap"[^>]*hidden/);
assert.match(html, /id="designer-individual-alignment-wrap"[^>]*hidden/);
assert.match(html, /id="designer-individual-place-btn"[^>]*hidden/);
for (const id of ['designer-individual-field-wrap','designer-individual-name-format-wrap','designer-individual-alignment-wrap','designer-individual-place-btn']) {
  assert.match(css, new RegExp(`#${id}\\[hidden\\]`));
}
assert.match(app, /designerIndividualFieldWrap\.hidden = !roleReady/);
assert.match(app, /designerIndividualAlignmentWrap\.hidden = !\(fieldReady && nameReady\)/);
assert.match(app, /designerIndividualPlaceButton\.hidden = !\(fieldReady && nameReady/);
console.log('Build 028.7 focused progressive-reveal checks passed.');
