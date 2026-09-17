import assert from "node:assert/strict";
import { normalizePregameData } from "../js/normalize.js";
import { getFieldDefinition, getSupportedFields, resolveField } from "../js/field-registry.js";
import { formatFieldValue } from "../js/formatter.js";
import { contextTemplateFieldIds, fieldsForRecordContext, resolveSlotContent, slotContentFieldIds, templateTokenForContextField } from "../js/slot-content.js";

const pitcher = {
  id: 101,
  fullName: "Logan Gilbert",
  firstName: "Logan",
  lastName: "Gilbert",
  useName: "Logan",
  useLastName: "Gilbert",
  initLastName: "L. Gilbert",
  primaryNumber: "36",
  pitchHand: { code: "R" }
};
const feed = {
  gameData: {
    game: { pk: 1, season: "2026", sport: { id: 1 } },
    datetime: { officialDate: "2026-09-15" },
    probablePitchers: { away: pitcher, home: { ...pitcher, id: 202, fullName: "Shane Baz", initLastName: "S. Baz" } },
    players: { ID101: pitcher, ID202: { ...pitcher, id: 202, fullName: "Shane Baz", initLastName: "S. Baz" }, ID301: { id: 301, fullName: "Julio Rodríguez", firstName: "Julio", lastName: "Rodríguez", useName: "Julio", useLastName: "Rodríguez", initLastName: "J. Rodríguez" } },
    teams: { away: { id: 10, name: "Away" }, home: { id: 20, name: "Home" } }
  },
  liveData: { boxscore: { teams: {
    away: { battingOrder: [301], players: {
      ID101: { person: { id: 101, fullName: "Logan Gilbert" }, jerseyNumber: "36", seasonStats: { pitching: { gamesPlayed: 27, gamesPitched: 27, gamesStarted: 27, wins: 11, losses: 7, era: "3.42", whip: "1.08", inningsPitched: "154.2", hits: 132, runs: 61, earnedRuns: 58, homeRuns: 17, baseOnBalls: 39, strikeOuts: 171 } } },
      ID301: { person: { id: 301, fullName: "Julio Rodríguez" }, jerseyNumber: "44", position: { abbreviation: "CF" }, seasonStats: { batting: { avg: ".284" } } }
    }, bench: [], bullpen: [] },
    home: { battingOrder: [], players: { ID202: { person: { id: 202, fullName: "Shane Baz" }, seasonStats: { pitching: { wins: 10, losses: 5, era: "3.19", whip: "1.08" } } } }, bench: [], bullpen: [] }
  } } }
};

const model = normalizePregameData(feed);
const awayFields = fieldsForRecordContext("away.startingPitcher");
const homeFields = fieldsForRecordContext("home.startingPitcher");
assert.equal(awayFields.length, homeFields.length, "home/away Starting Pitcher exposure stays symmetric");
assert.ok(awayFields.length >= 20, "Starting Pitcher exposes the established pitching family");
assert.equal(resolveField(model, "away.startingPitcher.player.number").value, "36");
assert.equal(resolveField(model, "away.startingPitcher.stats.record").value, "11-7");
assert.equal(resolveField(model, "away.startingPitcher.stats.walks").value, 39);
assert.equal(resolveField(model, "away.startingPitcher.stats.compact").value, "11-7 • 3.42 ERA • 1.08 WHIP");

const nameDefinition = getFieldDefinition("away.startingPitcher.player.name");
const nameResolution = resolveField(model, nameDefinition.id);
assert.equal(formatFieldValue(nameDefinition, nameResolution, model, { nameFormat: "first-initial-last" }), "L. Gilbert");
assert.equal(formatFieldValue(nameDefinition, { ...nameResolution, formatSource: { name: "Single Name" } }, model, { nameFormat: "first-initial-last" }), "Single Name", "missing source variant falls back to full name");

const recordTemplate = {
  type: "template",
  template: "#[Away Starting Pitcher — Jersey #] [Away Starting Pitcher — Player Name] ([Away Starting Pitcher — W-L], [Away Starting Pitcher — ERA] ERA)"
};
assert.equal(resolveSlotContent(recordTemplate, model, "away.startingPitcher"), "#36 Logan Gilbert (11-7, 3.42 ERA)");
assert.equal(resolveSlotContent({ type: "template", template: "[Away Starting Pitcher]" }, model, "away.startingPitcher"), "Logan Gilbert", "Build 016 template label remains compatible");

const lineupTemplate = { type: "template", template: "#[Away Lineup — Jersey #] [Away Lineup — Player Name] ([Away Lineup — AVG])" };
assert.equal(resolveSlotContent(lineupTemplate, model, "away.lineup", { slot: 1 }), "#44 Julio Rodríguez (.284)");
assert.equal(resolveSlotContent({ type: "template", template: "[Away Starting Pitcher — ERA]" }, model, "away.lineup", { slot: 1 }), "", "tokens outside the row context do not resolve");
assert.deepEqual(contextTemplateFieldIds(recordTemplate.template, "away.startingPitcher").length, 4);
assert.deepEqual(slotContentFieldIds({ type: "field", field: "away.startingPitcher.stats.era" }, "away.startingPitcher"), ["away.startingPitcher.stats.era"]);

assert.ok(getSupportedFields({ cardinality: "repeated", collection: "away.lineup" }).length > 0, "Build 016 repeated field registry remains available");
// Build 017.1: name-format capability is shared by repeated player-name fields.
for (const fieldId of ["away.lineup[].player.name", "home.lineup[].player.name", "away.bench[].player.name", "home.bench[].player.name", "away.bullpen[].player.name", "home.bullpen[].player.name"]) {
  assert.equal(getFieldDefinition(fieldId)?.formatKind, "playerName", `${fieldId} exposes player-name formatting capability`);
}
assert.equal(getFieldDefinition("game.date")?.formatKind, undefined, "Game Date does not expose Name Format");
assert.equal(getFieldDefinition("away.lineup[].player.number")?.formatKind, undefined, "Jersey # does not expose Name Format");

const lineupNameDefinition = getFieldDefinition("away.lineup[].player.name");
const lineupNameResolution = resolveField(model, lineupNameDefinition.id, { slot: 1 });
assert.equal(formatFieldValue(lineupNameDefinition, lineupNameResolution, model, { nameFormat: "last" }), "Rodríguez", "lineup name formatting uses row player metadata");
assert.equal(formatFieldValue(lineupNameDefinition, lineupNameResolution, model, { nameFormat: "first-initial-last" }), "J. Rodríguez", "lineup first-initial formatting works");

// Context-local tokens are concise while Build 017 long tokens remain valid.
assert.equal(templateTokenForContextField("away.startingPitcher.player.name"), "[Player Name]");
assert.equal(templateTokenForContextField("away.startingPitcher.stats.record"), "[W-L]");
assert.equal(templateTokenForContextField("away.lineup[].player.number"), "[Jersey #]");
assert.equal(resolveSlotContent({ type: "template", template: "#[Jersey #] [Player Name] ([AVG])" }, model, "away.lineup", { slot: 1 }), "#44 Julio Rodríguez (.284)");
assert.equal(resolveSlotContent({ type: "template", template: "[Player Name] ([W-L], [ERA] ERA)" }, model, "away.startingPitcher"), "Logan Gilbert (11-7, 3.42 ERA)");
assert.equal(resolveSlotContent({ type: "template", template: "[ERA]" }, model, "away.lineup", { slot: 1 }), "", "short tokens remain isolated to their current context");
assert.equal(resolveSlotContent({ type: "template", template: "[Away Lineup — Player Name]" }, model, "away.lineup", { slot: 1 }), "Julio Rodríguez", "long Build 017 token remains compatible");

console.log("Build 017 registry, normalization, name-format, compatibility, and contextual slot-content tests passed.");
