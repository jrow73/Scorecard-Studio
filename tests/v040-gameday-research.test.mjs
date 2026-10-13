import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  gameDaySourceSummary,
  managerPresentation,
  pitcherGroupPresentation,
  researchScope
} from "../js/v040-gameday.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = path.join(root, "tests", "fixtures", "model-contract", "v030-variable-officials-feed-venue-normalized.json");
const model = JSON.parse(await readFile(fixturePath, "utf8"));

test("Game Day splits selected starter, additional starters, and classified bullpen", () => {
  const groups = pitcherGroupPresentation(model, "away");
  assert.equal(groups.selectedStarter.player.name, "Two-Way Contract Player");
  assert.deepEqual(groups.additionalStarters.map((row) => row.player.name), ["Away Additional Starter"]);
  assert.deepEqual(groups.bullpen.map((row) => row.player.name), ["Away Reliever"]);
  assert.equal(groups.classified, true);
  assert.equal(groups.bullpenLabel, "Core Bullpen");
});

test("Game Day labels the roster-minus-starter fallback without claiming reliever roles", () => {
  const groups = pitcherGroupPresentation(model, "home");
  assert.equal(groups.classified, false);
  assert.equal(groups.additionalStarters.length, 0);
  assert.equal(groups.bullpenLabel, "Other Active Pitchers — Roles Not Classified");
  assert.equal(groups.bullpenNote, "No Starter/Reliever role available");
});

test("ambiguous managers remain visible as candidates", () => {
  const manager = managerPresentation(model.away.manager);
  assert.equal(manager.state, "ambiguous");
  assert.equal(manager.people.length, 2);
  assert.match(manager.title, /ambiguous/i);
});

test("source and research scope summaries preserve effective-date semantics", () => {
  const sources = gameDaySourceSummary(model);
  assert.equal(sources.find((row) => row.adapter === "standings")?.effective, "Through 2025-07-02");
  assert.equal(sources.find((row) => row.adapter === "depthChart")?.effective, "Current annotation");
  assert.deepEqual(researchScope(model), {
    season: 2025,
    sport: "Major League Baseball",
    gameType: "R",
    competitionSegment: "regular",
    selectedDate: "2025-07-03",
    officialDate: "2025-07-03"
  });
});

test("Build 001.5 exposes research sections and retires the diagnostic product route", async () => {
  const [html, app, css] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "js", "app.js"), "utf8"),
    readFile(path.join(root, "css", "styles.css"), "utf8")
  ]);
  for (const id of [
    "gameday-overview", "gameday-team-grid", "gameday-away-lineup", "gameday-home-lineup",
    "gameday-away-pitching", "gameday-home-pitching", "gameday-away-bench", "gameday-home-bench",
    "gameday-away-staff", "gameday-home-staff", "gameday-standings", "gameday-umpires",
    "gameday-venue", "gameday-source-summary"
  ]) assert.match(html, new RegExp(`id=["']${id}["']`));
  assert.doesNotMatch(html, /id=["']nav-field-diagnostic["']/);
  assert.doesNotMatch(html, /data-view=["']field-diagnostic["']/);
  assert.doesNotMatch(app, /openFieldDiagnostic|loadFieldDiagnostic|renderFieldDiagnostic/);
  assert.match(app, /pitcherGroupPresentation/);
  assert.match(css, /gameday-section-nav/);
});
