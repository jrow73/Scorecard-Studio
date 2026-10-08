import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(here);

const fixtureNames = [
  "v030-game2-mixed-cutoff.json",
  "v030-ordinary-pregame.json",
  "v030-missing-lineup.json",
  "v030-two-way-roles.json",
  "v030-manager-ambiguity.json",
  "v030-variable-officials.json",
  "v030-milb-capability-absence.json",
  "v030-scoped-competition-stats.json"
];

async function fixture(name) {
  return JSON.parse(await readFile(path.join(workspace, "tests", "fixtures", "model-contract", name), "utf8"));
}

function getPointer(root, pointer) {
  let value = root;
  for (const token of pointer.slice(1).split("/").map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"))) {
    if (value === null || value === undefined || !Object.prototype.hasOwnProperty.call(Object(value), token)) return { found: false };
    value = value[token];
  }
  return { found: true, value };
}

function effectiveLineage(entries, target) {
  const exact = entries.filter((entry) => entry.coverage === "exact" && entry.target === target);
  assert.ok(exact.length <= 1, `duplicate exact lineage for ${target}`);
  if (exact.length) return exact[0];
  const ancestors = entries
    .filter((entry) => entry.coverage === "subtree" && (target === entry.target || target.startsWith(`${entry.target}/`)))
    .sort((left, right) => right.target.length - left.target.length);
  assert.ok(ancestors.length, `missing lineage for ${target}`);
  assert.equal(ancestors.filter((entry) => entry.target.length === ancestors[0].target.length).length, 1, `ambiguous lineage for ${target}`);
  return ancestors[0];
}

test("Build 003 fixture suite closes identity, lineage, and vocabulary invariants", async () => {
  for (const name of fixtureNames) {
    const model = await fixture(name);
    assert.equal(model.schemaId, "scorecard-studio.normalized-game", name);
    assert.equal(model.schemaVersion, 2, name);
    assert.equal(model.contractRevision, "0.3.0-draft.1", name);
    assert.equal(model.meta.snapshot.fixtureKind, "synthetic-contract", name);
    assert.ok(!JSON.stringify(model).match(/gamePack/i), `${name}: prohibited source label`);

    const sourceIds = model.meta.sourceResults.map((entry) => entry.id);
    const lineageIds = model.meta.lineage.map((entry) => entry.id);
    const targets = model.meta.lineage.map((entry) => `${entry.coverage}:${entry.target}`);
    assert.equal(new Set(sourceIds).size, sourceIds.length, `${name}: duplicate source-result ID`);
    assert.equal(new Set(lineageIds).size, lineageIds.length, `${name}: duplicate lineage ID`);
    assert.equal(new Set(targets).size, targets.length, `${name}: duplicate target/coverage`);

    const knownSources = new Set(sourceIds);
    for (const entry of model.meta.lineage) {
      for (const ref of entry.sourceResultRefs) assert.ok(knownSources.has(ref), `${name}: unknown source ${ref}`);
      if (entry.selectedSourceResultRef) {
        assert.ok(knownSources.has(entry.selectedSourceResultRef), `${name}: missing selected source`);
        assert.ok(entry.sourceResultRefs.includes(entry.selectedSourceResultRef), `${name}: selected source is not a candidate`);
      }
      if (["available", "partial", "present-empty"].includes(entry.state)) {
        assert.equal(getPointer(model, entry.target).found, true, `${name}: ${entry.target} must resolve`);
      }
    }
  }
});

test("ordinary and unposted pregame states remain distinct", async () => {
  const ordinary = await fixture("v030-ordinary-pregame.json");
  assert.equal(ordinary.game.status.canonical, "pregame");
  assert.equal(ordinary.away.lineup.state, "posted");
  assert.equal(ordinary.home.lineup.state, "posted");
  assert.ok(ordinary.away.lineup.slots.length > 0);
  assert.ok(ordinary.away.startingPitcher);

  const missing = await fixture("v030-missing-lineup.json");
  assert.equal(missing.away.lineup.state, "notPosted");
  assert.equal(missing.home.lineup.state, "notPosted");
  assert.deepEqual(missing.away.lineup.slots, []);
  assert.equal(effectiveLineage(missing.meta.lineage, "/away/lineup").state, "unposted");
  assert.equal(missing.meta.sourceResults.find((entry) => entry.adapter === "schedule").outcome, "success");
});

test("two-way identity is retained in independent hitting and pitching roles", async () => {
  const model = await fixture("v030-two-way-roles.json");
  const hitter = model.away.lineup.slots[0];
  const pitcher = model.away.startingPitcher;
  assert.equal(hitter.player.id, pitcher.player.id);
  assert.notEqual(hitter, pitcher);
  assert.ok(hitter.stats.hitting);
  assert.equal(hitter.stats.pitching, undefined);
  assert.ok(pitcher.stats.pitching);
  assert.equal(pitcher.stats.hitting, undefined);
  assert.notEqual(effectiveLineage(model.meta.lineage, "/away/lineup/slots/0/stats/hitting").id,
    effectiveLineage(model.meta.lineage, "/away/startingPitcher/stats/pitching").id);
});

test("manager ambiguity preserves candidates without selecting one", async () => {
  const model = await fixture("v030-manager-ambiguity.json");
  assert.equal(model.away.manager.state, "ambiguous");
  assert.equal(model.away.manager.candidates.length, 2);
  assert.equal(model.away.manager.selected, null);
  const provenance = effectiveLineage(model.meta.lineage, "/away/manager");
  assert.equal(provenance.state, "ambiguous");
  assert.equal(provenance.selectedSourceResultRef, null);
});

test("officials remain a variable source-faithful crew", async () => {
  const model = await fixture("v030-variable-officials.json");
  assert.equal(model.game.umpires.crew.length, 6);
  assert.ok(model.game.umpires.crew.some((official) => official.role === "Replay Official"));
  assert.ok(model.game.umpires.crew.some((official) => official.role === "Left Field"));
  assert.equal(Object.prototype.hasOwnProperty.call(model.game.umpires, "home"), false);
  assert.equal(effectiveLineage(model.meta.lineage, "/game/umpires/crew").selectedSourceResultRef, "feed.officials");
});

test("MiLB depth-chart absence uses the roster-minus-starter fallback", async () => {
  const model = await fixture("v030-milb-capability-absence.json");
  assert.equal(model.context.sport.id, 14);
  assert.equal(model.meta.sourceResults.find((entry) => entry.id === "depth.away-omitted").outcome, "success");
  assert.deepEqual(model.away.additionalStarters, []);
  assert.ok(model.away.bullpen.length > 0);
  const absent = effectiveLineage(model.meta.lineage, "/away/additionalStarters");
  const fallback = effectiveLineage(model.meta.lineage, "/away/bullpen");
  assert.equal(absent.state, "omitted");
  assert.equal(fallback.fallbackUsed, true);
  assert.deepEqual(fallback.transformations, ["exclude-selected-starter"]);
});

test("competition-scoped statistics never silently substitute regular-season totals", async () => {
  const model = await fixture("v030-scoped-competition-stats.json");
  assert.equal(model.context.gameType, "S");
  assert.equal(model.context.competitionSegment, "spring");
  assert.deepEqual(model.away.lineup.slots[0].stats.hitting.scope.gameTypes, ["S"]);
  assert.deepEqual(model.away.startingPitcher.stats.pitching.scope.gameTypes, ["S"]);
  assert.equal(model.standings.groups[0].standingsType, "springTraining");
  assert.ok(!JSON.stringify(model.away.lineup.slots[0].stats).includes('"R"'));
});

test("Game 2 source precedence remains explicit across mixed cutoffs", async () => {
  const model = await fixture("v030-game2-mixed-cutoff.json");
  assert.equal(effectiveLineage(model.meta.lineage, "/away/lineup/slots/0/player/name").selectedSourceResultRef, "schedule.game2");
  assert.equal(effectiveLineage(model.meta.lineage, "/away/lineup/slots/0/stats/hitting/totals/avg").selectedSourceResultRef, "boxscore.game1");
  assert.equal(effectiveLineage(model.meta.lineage, "/away/team/record/wins").selectedSourceResultRef, "boxscore.game1");
  assert.equal(effectiveLineage(model.meta.lineage, "/away/team/standings/divisionRank/value").selectedSourceResultRef, "standings.prior-day");
  assert.notDeepEqual(
    effectiveLineage(model.meta.lineage, "/away/team/record/wins").effective,
    effectiveLineage(model.meta.lineage, "/away/team/standings/divisionRank/value").effective
  );
});
