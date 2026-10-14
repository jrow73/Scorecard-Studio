import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { normalizedIdentityName, playerIdentityPresentation } from "../js/v050-player-identity.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 004.1 projects a distinct formal name and verbatim pronunciation", () => {
  assert.deepEqual(playerIdentityPresentation({
    name: "Cal Raleigh",
    firstName: "Caleb",
    lastName: "Raleigh",
    pronunciation: "CAY-leb RAH-lee"
  }), {
    displayedName: "Cal Raleigh",
    formalName: "Caleb Raleigh",
    pronunciation: "CAY-leb RAH-lee",
    hasDetails: true
  });

  assert.deepEqual(playerIdentityPresentation({
    name: "Josh Naylor",
    firstName: "Joshua-Douglas",
    lastName: "Naylor"
  }), {
    displayedName: "Josh Naylor",
    formalName: "Joshua-Douglas Naylor",
    pronunciation: null,
    hasDetails: true
  });
});

test("Build 004.1 suppresses duplicate or incomplete identity details", () => {
  assert.equal(playerIdentityPresentation({ name: "Shohei Ohtani", firstName: "Shohei", lastName: "Ohtani", pronunciation: "show-HEY oh-TAWN-ee" }).formalName, null);
  assert.equal(playerIdentityPresentation({ name: "Aaron Judge", firstName: "Aaron", lastName: "Judge" }).hasDetails, false);
  assert.equal(playerIdentityPresentation({ name: "Single", firstName: "Formal" }).formalName, null);
  assert.equal(normalizedIdentityName("D’Angelo  Smith"), normalizedIdentityName("D'Angelo Smith"));
  assert.equal(normalizedIdentityName("Joshua–Douglas Naylor"), normalizedIdentityName("Joshua-Douglas Naylor"));
});

test("Build 004.2 wires accessible identity triggers into every player table", async () => {
  const [app, css, meta, html] = await Promise.all([
    read("js/app.js"), read("css/styles.css"), read("app-meta.json").then(JSON.parse), read("index.html")
  ]);
  assert.deepEqual(meta, { version: "0.5.0", build: "005.2" });
  assert.match(html, /styles\.css\?v=050b0052/);
  assert.match(html, /app\.js\?v=050b0052/);
  assert.match(app, /playerIdentityNameMarkup\(slot\.player\)/);
  assert.match(app, /playerIdentityNameMarkup\(item\?\.player \|\| \{\}\)/);
  assert.match(app, /playerIdentityNameMarkup\(item\.player\)/);
  assert.match(app, /aria-expanded="false"/);
  assert.match(app, /event\.key !== "Escape"/);
  assert.match(app, /Math\.hypot[\s\S]*> 8/);
  assert.match(app, /window\.innerWidth/);
  assert.match(css, /\.gameday-player-identity-popover/);
  assert.match(css, /z-index:\s*1200/);
  assert.match(css, /pointer-events:\s*none/);
});
