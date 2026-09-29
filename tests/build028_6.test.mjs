import fs from 'node:fs';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

const templatePos = html.indexOf('id="designer-selection-template-wrap"');
const formattingPos = html.indexOf('id="designer-formatting-card"');
const selectedItemStart = html.indexOf('<section class="designer-selected-item-card">');
const selectedItemEnd = html.indexOf('</section>', selectedItemStart);

const checks = [
  ['Text Template block exists', templatePos >= 0],
  ['Text Template block is before Formatting', templatePos >= 0 && formattingPos >= 0 && templatePos < formattingPos],
  ['Text Template block remains in Selected Item section', templatePos > selectedItemStart && templatePos < selectedItemEnd],
  ['Template editor controls preserved', html.includes('id="designer-selection-template"') && html.includes('id="designer-selection-template-preview"') && html.includes('id="designer-selection-template-field"') && html.includes('id="designer-selection-template-insert-btn"')],
  ['current cache refs', html.includes(`styles.css?v=${meta.build}`) && html.includes(`app.js?v=${meta.build}`)],
  ['028.6+ metadata', /^028\.(?:6|7|8|9|[1-9]\d+)$/.test(meta.build)],
];
let failures = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failures++;
}
if (failures) process.exit(1);
