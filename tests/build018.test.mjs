import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizePregameData } from "../js/normalize.js";
import { getCatalogFields, getFieldDefinition, getSupportedFields, resolveField } from "../js/field-registry.js";
import { formatFieldValue, PLAYER_NAME_FORMATS } from "../js/formatter.js";

const player = (id, fullName, extras = {}) => ({
  id, fullName, firstName: fullName.split(" ")[0], lastName: fullName.split(" ").slice(1).join(" "),
  useName: fullName.split(" ")[0], useLastName: fullName.split(" ").slice(1).join(" "),
  initLastName: `${fullName[0]}. ${fullName.split(" ").slice(1).join(" ")}`,
  boxscoreName: extras.boxscoreName || `${fullName.split(" ").slice(1).join(" ")}, ${fullName[0]}.`,
  primaryNumber: extras.number || "1", batSide: { code: extras.bats || "R" }, pitchHand: { code: extras.throws || "R" },
  primaryPosition: extras.primaryPosition || { abbreviation: "SS", name: "Shortstop" }
});

const awayStarter = player(101, "Logan Gilbert", { number: "36", primaryPosition: { abbreviation: "P", name: "Pitcher" } });
const homeStarter = player(202, "George Kirby", { number: "68", primaryPosition: { abbreviation: "P", name: "Pitcher" } });
const hitter = player(301, "Julio Rodríguez", { number: "44", boxscoreName: "Rodríguez, J.", primaryPosition: { abbreviation: "CF", name: "Center Fielder" } });
const reliever = player(401, "Andrés Muñoz", { number: "75", primaryPosition: { abbreviation: "P", name: "Pitcher" } });

const feed = {
  gameData: {
    game: { pk: 1, season: "2026", sport: { id: 1 }, gameNumber: 2 },
    datetime: { officialDate: "2026-09-19", dateTime: "2026-09-20T00:10:00Z", dayNight: "night" },
    venue: { name: "T-Mobile Park", fieldInfo: { capacity: 47929, turfType: "Grass", roofType: "Retractable" }, location: { city: "Seattle", stateAbbrev: "WA", country: "USA" }, timeZone: { id: "America/Los_Angeles" } },
    weather: { temp: 68, condition: "Partly Cloudy", wind: "7 mph, L To R" },
    probablePitchers: { away: awayStarter, home: homeStarter },
    players: { ID101: awayStarter, ID202: homeStarter, ID301: hitter, ID401: reliever },
    teams: {
      away: { id: 10, name: "Seattle Mariners", locationName: "Seattle", shortName: "Seattle", clubName: "Mariners", abbreviation: "SEA", league: { id: 103, name: "American League" }, division: { id: 200, nameShort: "AL West" }, record: { gamesPlayed: 151, wins: 86, losses: 65, winningPercentage: ".570" } },
      home: { id: 20, name: "Home Club", locationName: "Home", shortName: "Home", clubName: "Club", abbreviation: "HOM", record: { gamesPlayed: 151, wins: 80, losses: 71, winningPercentage: ".530" } }
    }
  },
  liveData: { boxscore: {
    officials: [
      { official: { id: 1, fullName: "Pat Hoberg" }, officialType: "Home Plate" },
      { official: { id: 2, fullName: "First Ump" }, officialType: "First Base" },
      { official: { id: 3, fullName: "Second Ump" }, officialType: "Second Base" },
      { official: { id: 4, fullName: "Third Ump" }, officialType: "Third Base" }
    ],
    teams: {
      away: { battingOrder: [301], bench: [], bullpen: [401], players: {
        ID101: { person: { id: 101, fullName: awayStarter.fullName }, jerseyNumber: "36", position: { abbreviation: "P", name: "Pitcher" }, seasonStats: { pitching: { gamesStarted: 29, wins: 14, losses: 7, era: "3.11", whip: "1.04", strikeOuts: 190 } } },
        ID301: { person: { id: 301, fullName: hitter.fullName }, jerseyNumber: "44", position: { abbreviation: "SS", name: "Shortstop" }, seasonStats: { batting: { gamesPlayed: 145, plateAppearances: 612, avg: ".287", obp: ".352", slg: ".489", ops: ".841", homeRuns: 28, rbi: 91, stolenBases: 24 } } },
        ID401: { person: { id: 401, fullName: reliever.fullName }, jerseyNumber: "75", position: { abbreviation: "P", name: "Pitcher" }, seasonStats: { pitching: { gamesStarted: 0, wins: 4, losses: 2, era: "1.92", whip: "0.95", strikeOuts: 82, saves: 31, holds: 2 } } }
      } },
      home: { battingOrder: [], bench: [], bullpen: [], players: { ID202: { person: { id: 202, fullName: homeStarter.fullName }, jerseyNumber: "68", seasonStats: { pitching: { gamesStarted: 28, wins: 13, losses: 8, era: "3.28", whip: "1.07" } } } } }
    }
  } }
};

const model = normalizePregameData(feed);

// Standard/Custom metadata is explicit for active catalog entries.
for (const definition of getCatalogFields()) assert.ok(["standard", "custom"].includes(definition.visibilityTier), `${definition.id} has a visibility tier`);
assert.equal(getFieldDefinition("away.team.name").visibilityTier, "standard");
assert.equal(getFieldDefinition("away.team.locationName").visibilityTier, "custom");
assert.equal(getFieldDefinition("away.startingPitcher.stats.strikeouts").catalog, false, "legacy SP strikeouts remain resolvable but hidden from active catalog");
assert.ok(getSupportedFields().some((f) => f.id === "away.startingPitcher.stats.strikeouts"), "compatibility field remains supported");
assert.ok(!getCatalogFields().some((f) => f.id === "away.startingPitcher.stats.strikeouts"), "compatibility field is not advertised");

// Easy scalar additions.
assert.equal(resolveField(model, "game.number").value, 2);
assert.equal(resolveField(model, "game.dayNight").value, "night");
assert.equal(resolveField(model, "game.venue.city").value, "Seattle");
assert.equal(resolveField(model, "away.team.record.gamesPlayed").value, 151);
assert.equal(resolveField(model, "away.team.league.name").value, "American League");
assert.equal(resolveField(model, "game.umpires.home.name").value, "Pat Hoberg");

// Lineup derived/stat additions.
assert.equal(resolveField(model, "away.lineup[].position.number", { slot: 1 }).value, 6);
assert.equal(resolveField(model, "away.lineup[].player.primaryPosition.abbreviation", { slot: 1 }).value, "CF");
assert.equal(resolveField(model, "away.lineup[].stats.plateAppearances", { slot: 1 }).value, 612);
assert.equal(resolveField(model, "away.lineup[].stats.stolenBases", { slot: 1 }).value, 24);
assert.equal(resolveField(model, "away.lineup[].stats.slashLine", { slot: 1 }).value, ".287/.352/.489");

// Bullpen six-stat family and compatibility extras.
assert.equal(resolveField(model, "away.bullpen[].stats.record", { slot: 1 }).value, "4-2");
assert.equal(resolveField(model, "away.bullpen[].stats.gamesStarted", { slot: 1 }).value, 0);
assert.equal(resolveField(model, "away.bullpen[].stats.saves", { slot: 1 }).value, 31, "legacy bullpen Saves still resolves");

// Name format includes Boxscore Name with full-name fallback.
assert.ok(PLAYER_NAME_FORMATS.some((entry) => entry.value === "boxscore"));
const nameDef = getFieldDefinition("away.lineup[].player.name");
const nameResolution = resolveField(model, nameDef.id, { slot: 1 });
assert.equal(formatFieldValue(nameDef, nameResolution, model, { nameFormat: "boxscore" }), "Rodríguez, J.");
assert.equal(formatFieldValue(nameDef, { ...nameResolution, formatSource: { name: "Fallback Name" } }, model, { nameFormat: "boxscore" }), "Fallback Name");

// Home/Away active catalog symmetry for side families.
for (const family of ["startingPitcher", "lineup", "bench", "bullpen"]) {
  const away = getCatalogFields().filter((f) => f.id.startsWith(`away.${family}`)).map((f) => f.id.replace(/^away\./, ""));
  const home = getCatalogFields().filter((f) => f.id.startsWith(`home.${family}`)).map((f) => f.id.replace(/^home\./, ""));
  assert.deepEqual(away, home, `${family} catalog stays symmetric`);
}

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
assert.match(html, /Build 018/);
assert.match(app, /getCatalogFields/, "Designer uses the active catalog API");

console.log("Build 018 field catalog, normalization, compatibility, symmetry, and name-format tests passed.");
