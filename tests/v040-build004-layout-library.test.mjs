import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 004.4 opens on the compact library and keeps creation in a focused internal view", async () => {
  const [html, app] = await Promise.all([read("index.html"), read("js/app.js")]);
  assert.match(html, /id="layout-library-panel"/);
  assert.match(html, /id="open-create-layout-btn"[^>]*>Create Layout</);
  assert.match(html, /id="layout-create-workflow" hidden/);
  assert.match(html, /id="close-create-layout-btn"[^>]*>Back to Library</);
  assert.ok(html.indexOf('id="layout-library-panel"') < html.indexOf('id="layout-create-workflow"'));
  assert.match(app, /function showLayoutCreateWorkflow\(\)[\s\S]*layoutLibraryPanel\.hidden = true[\s\S]*layoutCreateWorkflow\.hidden = false/);
  assert.match(app, /function showLayoutLibrary\(\)[\s\S]*layoutCreateWorkflow\.hidden = true[\s\S]*layoutLibraryPanel\.hidden = false/);
});

test("every layout card owns Designer, Settings, and less-common local actions", async () => {
  const [html, app] = await Promise.all([read("index.html"), read("js/app.js")]);
  const renderer = app.slice(app.indexOf("function renderLayoutList"), app.indexOf("function updateFavoriteLayoutButton"));
  assert.match(renderer, /designer\.textContent = "Open Designer"/);
  assert.match(renderer, /settings\.textContent = "Settings"/);
  for (const label of ["Duplicate", "Export Backup", "Set as Favorite", "Delete Layout"]) assert.match(renderer, new RegExp(label));
  assert.match(renderer, /layout-card-menu/);
  assert.doesNotMatch(html, /id="layout-detail-card"|id="pdf-viewer"|id="open-designer-btn"/);
});

test("library actions select records without eager PDF rendering and reuse existing storage contracts", async () => {
  const app = await read("js/app.js");
  const opener = app.slice(app.indexOf("async function openLayout(id)"), app.indexOf("async function saveSelectedLayoutMetadata"));
  assert.doesNotMatch(opener, /getPdfTemplate|loadPdfDocument|showPdfDocument|scrollIntoView/);
  assert.match(app, /async function openLayoutDesignerFromLibrary[\s\S]*await openLayout\(id\)[\s\S]*await openDesigner\(\)/);
  assert.match(app, /async function openLayoutSettingsFromLibrary[\s\S]*await openLayout\(id\)[\s\S]*openLayoutFormattingDialog\(\)/);
  assert.match(app, /async function exportLayoutFromLibrary[\s\S]*BACKUP_SCOPES\.SINGLE_LAYOUT[\s\S]*layoutId: id/);
  assert.doesNotMatch(app, /STORAGE_DATABASE_VERSION\s*=|indexedDB\.open\([^)]*,\s*\d+/);
});

test("layout cards remain compact and responsive under the Build 004.4 identity", async () => {
  const [css, meta] = await Promise.all([read("css/styles.css"), read("app-meta.json").then(JSON.parse)]);
  assert.match(css, /\.layout-list\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fill,/s);
  assert.match(css, /\.layout-list-item\s*\{[^}]*grid-template-rows:\s*1fr auto/s);
  assert.match(css, /\.layout-card-menu-items\s*\{[^}]*position:\s*absolute/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.layout-card-menu-items\s*\{\s*position:\s*static;/);
  assert.deepEqual(meta, { version: "0.4.0", build: "004.9" });
});
