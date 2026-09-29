import fs from 'node:fs';
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

const checks = [
  ['Inspector explicitly suppresses horizontal scrolling', /\.designer-controls\s*\{[\s\S]*?overflow-x:\s*hidden;/.test(css)],
  ['Formatting containers can shrink to Inspector width', css.includes('.designer-formatting-card-body,') && /max-width:\s*100%;/.test(css) && /min-width:\s*0;/.test(css)],
  ['Typography toolbar wraps instead of forcing width', /\.designer-format-toolbar-compact\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;/.test(css)],
  ['Formatting controls cap at available width', css.includes('#designer-selection-alignment,') && css.includes('#designer-selection-fit-width') && css.includes('max-width: 100%;')],
  ['028.5+ cache refs', /styles\.css\?v=028\.[5-9]/.test(html) && /app\.js\?v=028\.[5-9]/.test(html)],
  ['028.5+ metadata', /^028\.(?:[5-9]|[1-9][0-9]+)$/.test(meta.build)],
];
let failures = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failures++;
}
if (failures) process.exit(1);
