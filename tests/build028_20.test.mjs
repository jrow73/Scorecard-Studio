import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const meta = JSON.parse(fs.readFileSync(new URL('../app-meta.json', import.meta.url), 'utf8'));
const closure = fs.readFileSync(new URL('../docs/Build_028.20_Implementation.md', import.meta.url), 'utf8');
const roadmap = fs.readFileSync(new URL('../docs/DESIGNER_COMPLETION_INVENTORY.md', import.meta.url), 'utf8');

if (meta.build !== '028.20') throw new Error('app-meta build is not 028.20');
if (!html.includes('id="designer-back-btn" type="button">Close Layout Designer</button>')) throw new Error('Close Layout Designer text missing');
if (!html.includes('id="designer-prev-btn" type="button" aria-label="Previous PDF page" title="Previous PDF page">←</button>')) throw new Error('Designer previous-page arrow/accessibility text missing');
if (!html.includes('id="designer-next-btn" type="button" aria-label="Next PDF page" title="Next PDF page">→</button>')) throw new Error('Designer next-page arrow/accessibility text missing');
if (!html.includes('./js/app.js?v=028.20')) throw new Error('Build 028.20 app cache key missing');
if (!closure.includes('Build 028 Closure')) throw new Error('Build 028.20 closure documentation missing');
for (const build of ['Build 029', 'Build 030', 'Build 031', 'Build 032']) {
  if (!roadmap.includes(build)) throw new Error(`Remaining roadmap is missing ${build}`);
}
console.log('Build 028.20 focused checks passed.');
