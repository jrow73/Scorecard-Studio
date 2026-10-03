import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(
  html,
  /<label for="designer-column-template">Editor\s*<textarea id="designer-column-template"/,
  'Repeated-record Text Template creation should label the textarea Editor.'
);
assert.match(
  html,
  /id="designer-column-template-insert-btn"[^>]*>Insert into editor<\/button>/,
  'Repeated-record Text Template creation should use Insert into editor.'
);
assert.doesNotMatch(
  html,
  /id="designer-column-template-insert-btn"[^>]*>Insert Field<\/button>/,
  'The old Insert Field label should not remain on the repeated-record Text Template button.'
);

console.log('Build 032.4b checks passed.');
