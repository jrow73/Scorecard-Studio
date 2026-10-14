import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 003.1 records the Savant field-outline no-go and preserves the textual fallback", async () => {
  const [checkpoint, roadmap, research] = await Promise.all([
    read("docs/v0.5/V050_BUILD_003_1_CHECKPOINT.md"),
    read("docs/v0.5/V050_ROADMAP.md"),
    read("docs/v0.5/V050_RESEARCH_FINDINGS.md")
  ]);
  assert.match(checkpoint, /Complete — no-go for Savant-derived field outlines/);
  assert.match(checkpoint, /Textual field dimensions remain the universal Venue fallback/);
  assert.match(checkpoint, /mlb\.com\/official-information\/terms-of-use/);
  assert.match(roadmap, /Build 003\.2 — Theme-aware diagram renderer[\s\S]*Skipped under the Build 003\.1 no-go decision/);
  assert.match(roadmap, /Build 004\.1 — Identity projection[\s\S]*Status:\*\* Complete/);
  assert.match(research, /includes no Savant extractor, copied geometry, generated stadium artifact, or runtime Savant request/);
});

test("Build 003.1 keeps Baseball Savant and stadium geometry out of runtime assets", async () => {
  const runtimeRoots = ["index.html", "css", "js"];
  const files = [];
  for (const entry of runtimeRoots) {
    const absolute = path.join(root, entry);
    if (path.extname(entry)) files.push(absolute);
    else {
      const names = await readdir(absolute, { recursive: true, withFileTypes: true });
      for (const name of names) if (name.isFile()) files.push(path.join(name.parentPath ?? name.path, name.name));
    }
  }
  const runtime = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(runtime, /baseballsavant\.mlb\.com/i);

  const applicationFiles = await readdir(root, { recursive: true, withFileTypes: true });
  const forbidden = applicationFiles
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^(?:stadiums?|field[-_]?outlines?)\.(?:json|svg)$/i.test(name));
  assert.deepEqual(forbidden, []);
});
