import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getFieldExampleValue } from "../js/field-registry.js";
import { normalizePregameData } from "../js/normalize.js";
import { DESIGNER_SAMPLE_MODEL } from "../js/sample-data.js";

// 018.2-01: Day/Night display values use consistent title casing.
assert.equal(DESIGNER_SAMPLE_MODEL.game.dayNight, "Night");
const dayNightFeed = {
  gameData: {
    game: { pk: 1, season: "2026" },
    datetime: { officialDate: "2026-09-19", dayNight: "night" },
    teams: { away: { id: 1, name: "Away", record: {} }, home: { id: 2, name: "Home", record: {} }, },
    players: {}
  },
  liveData: { boxscore: { officials: [], teams: { away: { battingOrder: [], players: {}, bench: [], bullpen: [] }, home: { battingOrder: [], players: {}, bench: [], bullpen: [] } } } }
};
const dayNightModel = normalizePregameData(dayNightFeed, {}, { gamePk: 1, officialDate: "2026-09-19" });
assert.equal(dayNightModel.game.dayNight, "Night", "live dayNight is normalized for display parity");
assert.equal(getFieldExampleValue("game.dayNight"), "Night");

// 018.2-02: fixed-umpire representative values look like actual names, not placeholder labels.
assert.equal(DESIGNER_SAMPLE_MODEL.game.umpires.first.name, "Edwin Jimenez");
assert.equal(DESIGNER_SAMPLE_MODEL.game.umpires.second.name, "Alfonso Márquez");
assert.equal(DESIGNER_SAMPLE_MODEL.game.umpires.third.name, "Mike Estabrook");
for (const id of ["game.umpires.first.name", "game.umpires.second.name", "game.umpires.third.name"]) {
  assert.doesNotMatch(getFieldExampleValue(id), /^(First|Second|Third) Umpire$/);
}

// 018.2-03: division representative values match the live long-form convention.
assert.equal(DESIGNER_SAMPLE_MODEL.home.team.division.name, "American League West");
assert.equal(DESIGNER_SAMPLE_MODEL.away.team.division.name, "American League East");
assert.equal(getFieldExampleValue("home.team.division.name"), "American League West");

// 018.2-04: today's full position name is derived from the posted abbreviation,
// while the player's primary position remains the broader source-backed concept.
const positionFeed = {
  gameData: {
    game: { pk: 2, season: "2026" },
    datetime: { officialDate: "2026-09-19", dayNight: "day" },
    teams: { away: { id: 1, name: "Away", record: {} }, home: { id: 2, name: "Home", record: {} } },
    players: {
      ID10: {
        id: 10,
        fullName: "Test Left Fielder",
        primaryPosition: { abbreviation: "OF", name: "Outfielder" }
      }
    }
  },
  liveData: {
    boxscore: {
      officials: [],
      teams: {
        away: {
          battingOrder: [10],
          players: {
            ID10: {
              person: { id: 10, fullName: "Test Left Fielder" },
              position: { abbreviation: "LF", name: "Outfielder" },
              seasonStats: { batting: {} }
            }
          },
          bench: [], bullpen: []
        },
        home: { battingOrder: [], players: {}, bench: [], bullpen: [] }
      }
    }
  }
};
const positionModel = normalizePregameData(positionFeed, {}, { gamePk: 2, officialDate: "2026-09-19" });
assert.equal(positionModel.away.lineup[0].position.abbreviation, "LF");
assert.equal(positionModel.away.lineup[0].position.name, "Left Field", "posted LF derives a specific full name");
assert.equal(positionModel.away.lineup[0].position.number, 7);
assert.equal(positionModel.away.lineup[0].player.primaryPosition.name, "Outfielder", "primary position preserves broader source semantics");


// 018.3-05: representative roster depth and jersey-number variety support layout stress testing.
for (const side of ["away", "home"]) {
  assert.equal(DESIGNER_SAMPLE_MODEL[side].lineup.length, 9, `${side} representative lineup has 9 players`);
  assert.equal(DESIGNER_SAMPLE_MODEL[side].bench.length, 6, `${side} representative bench has 6 players`);
  assert.equal(DESIGNER_SAMPLE_MODEL[side].bullpen.length, 14, `${side} representative bullpen has 14 pitchers`);

  for (const collectionName of ["lineup", "bench", "bullpen"]) {
    const numbers = DESIGNER_SAMPLE_MODEL[side][collectionName].map((row) => String(row.player.number));
    assert.ok(numbers.some((number) => number.length === 1), `${side} ${collectionName} includes a single-digit jersey number`);
    assert.ok(numbers.some((number) => number.length === 2), `${side} ${collectionName} includes a double-digit jersey number`);
    const numeric = numbers.map(Number);
    const ascending = numeric.every((value, index) => index === 0 || numeric[index - 1] < value);
    const descending = numeric.every((value, index) => index === 0 || numeric[index - 1] > value);
    assert.equal(ascending || descending, false, `${side} ${collectionName} jersey numbers are not sequentially ordered`);
  }
}
assert.equal(DESIGNER_SAMPLE_MODEL.game.umpires.crew.length, 6, "representative umpire crew supports six-umpire postseason layouts");
assert.equal(DESIGNER_SAMPLE_MODEL.game.umpires.additional.length, 2, "representative crew includes two additional outfield umpires");

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const diagnostic = readFileSync(new URL("../js/field-diagnostic.js", import.meta.url), "utf8");
assert.match(html, /Build 018\.3/);
assert.match(html, /app\.js\?v=018305/);
assert.match(app, /normalize\.js\?v=0183/);
assert.match(app, /sample-data\.js\?v=018305/);
assert.match(diagnostic, /field-registry\.js\?v=0183/);

console.log("Build 018.3 final field-catalog closure tests passed.");
