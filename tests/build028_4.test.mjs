import fs from 'node:fs';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));

const checks = [
  ['child item buttons remain compact', css.includes('.designer-child-workspace-actions .compact-button') && css.includes('flex: 0 0 auto !important') && css.includes('font-size: 12px !important')],
  ['child item buttons do not stretch', css.includes('width: auto !important') && css.includes('min-width: 0 !important')],
  ['Formatting square/minus indicators are suppressed', /\.designer-formatting-card > summary::after,[\s\S]*content: none !important;[\s\S]*display: none !important;/.test(css)],
  ['Formatting remains a details/summary toggle', /<details class="designer-formatting-card"[\s\S]*<summary><span>Formatting<\/span><\/summary>/.test(html)],
  ['028.4+ cache refs', /styles\.css\?v=028\.\d+/.test(html) && /app\.js\?v=028\.\d+/.test(html)],
  ['028.4+ metadata', /^028\.\d+$/.test(meta.build)],
];
let failures = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failures++;
}
if (failures) process.exit(1);
