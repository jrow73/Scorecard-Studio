import fs from 'node:fs';
const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const checks = [
  ['date keyed to game.date', app.includes('definition?.id === "game.date"')],
  ['date hide is deterministic', app.includes('designerFieldDateFormatWrap.style.display = isGameDate ? "" : "none"')],
  ['palette renderer omits status text', !app.includes('status.textContent = directInstances.length')],
  ['palette renderer omits checkmark', !app.includes('check.textContent = instances.length ? "✓" : ""')],
  ['used palette border exists', css.includes('.designer-palette-item.placed {') && css.includes('74, 222, 128')],
  ['028.2+ cache refs', /styles\.css\?v=028\.\d+/.test(html) && /app\.js\?v=028\.\d+/.test(html)],
];
let failures = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failures++; }
if (failures) process.exit(1);
