import fs from 'node:fs';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const checks = [
  ['Formatting card is a sibling after Selected Item', /<\/section>\s*<details class="designer-formatting-card"/.test(html)],
  ['Formatting card uses square/minus state controls', css.includes('content: "□"') && css.includes('content: "−"')],
  ['X/Y use compact two-column row', css.includes('#designer-selection-position-controls') && css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important')],
  ['Formatting groups have separators', css.includes('.designer-format-group + .designer-format-group') && css.includes('border-top: 1px solid var(--line)')],
  ['Current Defaults precedes Restore Defaults as separate rows', /designer-defaults-group[\s\S]*designer-selection-format-summary[\s\S]*designer-selection-format-restore/.test(html)],
  ['Formatting starts collapsed on Designer entry', app.includes('elements.designerFormattingCard.open = false')],
  ['028.3+ cache refs', /styles\.css\?v=028\.\d+/.test(html) && /app\.js\?v=028\.\d+/.test(html)],
];
let failures = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failures++; }
if (failures) process.exit(1);
