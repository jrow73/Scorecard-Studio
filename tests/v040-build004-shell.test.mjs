import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 004.4 preserves exactly four primary destinations in a compact application header", async () => {
  const [html, css] = await Promise.all([read("index.html"), read("css/styles.css")]);
  const nav = html.slice(html.indexOf('<nav class="nav-list"'), html.indexOf("</nav>", html.indexOf('<nav class="nav-list"')) + 6);
  assert.match(html, /<header class="app-header">/);
  assert.doesNotMatch(html, /class="sidebar"/);
  assert.deepEqual([...nav.matchAll(/id="(nav-[^"]+)"/g)].map((match) => match[1]), ["nav-home", "nav-gameday", "nav-layouts", "nav-settings"]);
  assert.doesNotMatch(nav, /Layout Designer|Generate|Later/);
  assert.match(css, /\.app-header\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.nav-list\s*\{[^}]*display:\s*flex/s);
  assert.match(css, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
});

test("Designer is contextual to a saved layout and absent from primary navigation state", async () => {
  const [html, app, css] = await Promise.all([read("index.html"), read("js/app.js"), read("css/styles.css")]);
  assert.doesNotMatch(html, /id="nav-designer"/);
  assert.doesNotMatch(app, /navDesigner|#nav-designer/);
  assert.match(app, /designer\.textContent = "Open Designer"/);
  assert.match(html, /id="designer-back-btn"[^>]*>Close Layout Designer</);
  assert.match(app, /async function openLayoutDesignerFromLibrary[\s\S]*await openDesigner\(\)/);
  assert.match(app, /elements\.designerBackButton\.addEventListener\("click", \(\) => showView\("layouts"\)\)/);
  assert.match(css, /body\.designer-mode \.app-header/);
});

test("shell refinement preserves skip navigation, support identity, and user-facing page labels", async () => {
  const [html, meta] = await Promise.all([read("index.html"), read("app-meta.json").then(JSON.parse)]);
  assert.match(html, /<a class="skip-link" href="#main-content">Skip to main content<\/a>/);
  assert.match(html, /<main class="main-panel" id="main-content" tabindex="-1">/);
  assert.match(html, /class="app-version-label" data-app-version-label/);
  assert.match(html, /class="app-header-status" aria-label="Application status"/);
  assert.match(html, /id="gameday-empty-state"/);
  assert.match(html, /<p class="section-label">PDF Template Workspace<\/p>/);
  assert.doesNotMatch(html, /data-app-build-prefix|data-app-build-label/);
  assert.deepEqual(meta, { version: "0.4.0", build: "004.9" });
});
