import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  classifyCompetitionPhase,
  splitSeasonTypeFromStandings
} from "../js/v050-competition-context.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.join(here, "fixtures", "api-discovery");
const load = async (name) => JSON.parse(await readFile(path.join(fixtureRoot, name), "utf8"));
const selected = (evidence, pointer) => evidence.selection.values[pointer].value;

test("MLB regular-season policy changes at September 1", () => {
  assert.equal(classifyCompetitionPhase({ sportId: 1, gameType: "R", officialDate: "2025-08-31" }).key, "mlb-regular-early");
  const september = classifyCompetitionPhase({ sportId: 1, gameType: "R", officialDate: "2025-09-01" });
  assert.equal(september.key, "mlb-regular-playoff-race");
  assert.equal(september.advancedMode, "mlb-wild-card");
  assert.equal(september.standingsType, "wildCardWithLeaders");
  assert.equal(september.source.policy, "mlb-september-1");
});

test("MLB date boundary uses official YYYY-MM-DD and falls back conservatively", () => {
  const invalid = classifyCompetitionPhase({ sportId: 1, gameType: "R", officialDate: "not-a-date" });
  assert.equal(invalid.key, "mlb-regular-unknown");
  assert.equal(invalid.advancedMode, "division");
  assert.equal(invalid.source.policy, "missing-date-fallback");
});

test("preseason and postseason types select separate standings/stat policies", () => {
  const spring = classifyCompetitionPhase({ sportId: 1, gameType: "S", officialDate: "2025-03-15" });
  assert.equal(spring.key, "preseason");
  assert.equal(spring.standingsType, "springTraining");
  assert.deepEqual(spring.playerStatScopes[0].gameTypes, ["S", "E"]);

  for (const gameType of ["F", "D", "L", "W"]) {
    const postseason = classifyCompetitionPhase({ sportId: 1, gameType, officialDate: "2025-10-15" });
    assert.equal(postseason.key, "postseason");
    assert.equal(postseason.standingsType, null);
    assert.equal(postseason.defaultPlayerStatScope, "postseason");
    assert.deepEqual(postseason.playerStatScopes.map((scope) => scope.key), ["regularSeason", "postseason"]);
    assert.deepEqual(postseason.playerStatScopes[1].gameTypes, ["F", "D", "L", "W"]);
  }
});

test("MiLB half classification requires explicit standings evidence", () => {
  const unknown = classifyCompetitionPhase({ sportId: 12, gameType: "R", officialDate: "2025-07-01" });
  assert.equal(unknown.key, "milb-regular-unknown-half");
  assert.equal(unknown.standingsType, "regularSeason");

  const first = classifyCompetitionPhase({ sportId: 12, gameType: "R", officialDate: "2025-06-19", splitSeasonType: "firstHalf" });
  assert.equal(first.key, "milb-first-half");
  assert.equal(first.standingsType, "firstHalf");
  assert.equal(first.source.policy, "explicit-split-standings");

  const second = classifyCompetitionPhase({ sportId: 12, gameType: "R", officialDate: "2025-09-07", splitSeasonType: "secondHalf" });
  assert.equal(second.key, "milb-second-half");
  assert.equal(second.standingsType, "secondHalf");
});

test("MiLB postseason receives the same two player-stat choices", () => {
  const postseason = classifyCompetitionPhase({ sportId: 14, gameType: "L", officialDate: "2025-09-16" });
  assert.equal(postseason.family, "postseason");
  assert.deepEqual(postseason.playerStatScopes.map((scope) => scope.key), ["regularSeason", "postseason"]);
});

test("All-Star and unrecognized game types remain conservative", () => {
  for (const gameType of ["A", "", "Z"]) {
    const context = classifyCompetitionPhase({ sportId: 1, gameType, officialDate: "2025-07-15" });
    assert.equal(context.key, "special-or-unknown");
    assert.equal(context.advancedMode, "conservative");
    assert.equal(context.standingsType, null);
    assert.deepEqual(context.playerStatScopes, []);
  }
});

test("split standings helper accepts one explicit half and rejects mixed/absent scopes", async () => {
  const firstEvidence = await load("disc-023-113-firsthalf-2025.json");
  const secondEvidence = await load("disc-023-113-secondhalf-2025.json");
  const firstRecords = [selected(firstEvidence, "/records/0"), selected(firstEvidence, "/records/1")];
  const secondRecords = [selected(secondEvidence, "/records/0"), selected(secondEvidence, "/records/1")];
  assert.equal(splitSeasonTypeFromStandings(firstRecords), "firstHalf");
  assert.equal(splitSeasonTypeFromStandings(secondRecords), "secondHalf");
  assert.equal(splitSeasonTypeFromStandings([...firstRecords, ...secondRecords]), null);
  assert.equal(splitSeasonTypeFromStandings([{ standingsType: "regularSeason" }]), null);
});

test("classifier output and nested policy collections are immutable", () => {
  const context = classifyCompetitionPhase({ sportId: 1, gameType: "W", officialDate: "2025-10-30" });
  assert.ok(Object.isFrozen(context));
  assert.ok(Object.isFrozen(context.source));
  assert.ok(Object.isFrozen(context.playerStatScopes));
  assert.ok(Object.isFrozen(context.playerStatScopes[1]));
  assert.ok(Object.isFrozen(context.playerStatScopes[1].gameTypes));
});
