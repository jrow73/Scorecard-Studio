import fs from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const html = read('index.html');
const app = read('js/app.js');
const meta = JSON.parse(read('app-meta.json'));

assert.equal(meta.build, '025');

// Home exposes saved-layout selection and live generation.
assert.match(html, /id="live-pdf-layout-select"/);
assert.match(html, /id="live-pdf-generate-btn"[^>]*>Generate Live PDF</);
assert.match(html, /id="live-pdf-message"/);

// Designer and live generation share one populated-PDF drawing path.
assert.match(app, /buildPopulatedPdf\(layout, DESIGNER_SAMPLE_MODEL\)/);
assert.match(app, /async function generateLivePdf\(\)/);
assert.match(app, /const fieldIds = collectLayoutFieldIds\(layout\)/);
assert.match(app, /const model = await buildModelForMappings\(fieldIds, String\(game\.gamePk\)\)/);
assert.match(app, /const result = await buildPopulatedPdf\(layout, model\)/);
assert.match(app, /async function buildPopulatedPdf\(layout, model\)/);

// Changing games invalidates the old live feed until the new feed loads.
assert.match(app, /state\.selectedGamePk = selected\.gamePk;\s*state\.selectedFeed = null;\s*state\.normalizedPregame = null;/);
assert.match(app, /Game selection changed while the PDF was being prepared/);

// Last live-generation layout is a small browser preference, not a new layout model.
assert.match(app, /getSetting\("livePdfLayoutId", ""\)/);
assert.match(app, /setSetting\("livePdfLayoutId", layout\.id\)/);

console.log('Build 025 live PDF integration checks passed.');
