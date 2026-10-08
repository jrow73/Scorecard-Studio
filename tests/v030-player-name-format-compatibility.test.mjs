import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { getCompatibilityDefinition, resolveCompatibilityField } from "../js/v030-compatibility-resolver.js";
import { normalizeV030Pregame } from "../js/v030-cutover.js";

const applicationRoot = [new URL("../", import.meta.url), new URL("../Build004_1_overlay/", import.meta.url)]
  .find((candidate) => fs.existsSync(new URL("js/formatter.js", candidate)));
if (!applicationRoot) throw new Error("release application root not found");
const { formatFieldValue } = await import(new URL("js/formatter.js", applicationRoot));
const { resolveSlotContent } = await import(new URL("js/slot-content.js", applicationRoot));

const fixture = JSON.parse(fs.readFileSync(new URL("./fixtures/model-contract/v030-roster-people-source-cases.json", import.meta.url), "utf8"))[0];
const normalizedSchema = JSON.parse(fs.readFileSync(new URL("../schemas/v030-normalized-game.schema.json", import.meta.url), "utf8"));
const snapshot = normalizeV030Pregame({ schedulePayload: fixture.schedule.payload, scheduleSelection: fixture.schedule.selection, ...fixture.sources }, { createdAtUtc: "2025-07-03T20:00:00.000Z" });

test("schema-v2 person contract declares the source name variants used by legacy PDF formatting", () => {
  const properties = normalizedSchema.$defs.person.properties;
  for (const key of ["firstName", "lastName", "useName", "useLastName", "initLastName", "boxscoreName"]) assert.ok(properties[key], key);
});

for (const fieldId of ["away.lineup[].player.name", "away.bullpen[].player.name"]) {
  test(`${fieldId} never renders blank for a supported legacy name format`, () => {
    const compatibility = getCompatibilityDefinition(fieldId);
    const definition = { id: fieldId, formatKind: "playerName", valueType: "string", defaultFormat: {} };
    const resolution = resolveCompatibilityField(snapshot, fieldId, { slot: 1 });
    assert.equal(compatibility?.v1?.cardinality, "repeated");
    for (const nameFormat of ["full", "first-initial-last", "last", "first", "use", "boxscore"]) {
      assert.notEqual(formatFieldValue(definition, resolution, snapshot, { nameFormat }), "", nameFormat);
    }
  });
}

test("canonical-name fallback retains common suffixes", () => {
  const definition = { formatKind: "playerName", valueType: "string" };
  const resolution = { state: "available", value: "Bobby Witt Jr.", formatSource: { name: "Bobby Witt Jr." } };
  assert.equal(formatFieldValue(definition, resolution, snapshot, { nameFormat: "last" }), "Witt Jr.");
  assert.equal(formatFieldValue(definition, resolution, snapshot, { nameFormat: "first-initial-last" }), "B Witt Jr.");
});

test("PDF repeated-slot resolution renders lineup and bullpen names from canonical schema-v2 names", () => {
  const lineup = resolveSlotContent(
    { type: "field", field: "away.lineup[].player.name", format: { nameFormat: "last" } },
    snapshot,
    "away.lineup",
    { slot: 1 }
  );
  const bullpen = resolveSlotContent(
    { type: "field", field: "away.bullpen[].player.name", format: { nameFormat: "first-initial-last" } },
    snapshot,
    "away.bullpen",
    { slot: 1 }
  );
  assert.match(lineup, /\S/);
  assert.match(bullpen, /\S/);
});

test("legacy PDF name formats preserve authoritative API variants before using fallbacks", () => {
  const source = structuredClone(fixture);
  const playerId = source.schedule.payload.dates[0].games[0].lineups.awayPlayers[0].id;
  const schedulePerson = source.schedule.payload.dates[0].games[0].lineups.awayPlayers[0];
  Object.assign(schedulePerson, { fullName: "Schedule Preferred Example", firstName: "Schedule Formal", useName: "Schedule Preferred" });
  const rosterEntry = source.sources.roster.away.payload.roster.find((entry) => entry.person.id === playerId);
  Object.assign(rosterEntry.person, { fullName: "Roster Preferred Example", firstName: "Roster Formal", lastName: "Roster Example", useName: "Roster Preferred" });
  const peoplePerson = source.sources.people.units.flatMap((unit) => unit.payload?.people || []).find((person) => person.id === playerId);
  Object.assign(peoplePerson, {
    fullName: "Preferred Example",
    firstName: "Formal",
    lastName: "Example",
    useName: "Preferred",
    useLastName: "Example",
    initLastName: "F Example",
    boxscoreName: "Example, F M"
  });

  const model = normalizeV030Pregame(
    { schedulePayload: source.schedule.payload, scheduleSelection: source.schedule.selection, ...source.sources },
    { createdAtUtc: "2025-07-03T20:00:00.000Z" }
  );
  const player = model.away.lineup.slots[0].player;
  assert.deepEqual(
    {
      name: player.name,
      firstName: player.firstName,
      lastName: player.lastName,
      useName: player.useName,
      useLastName: player.useLastName,
      initLastName: player.initLastName,
      boxscoreName: player.boxscoreName
    },
    {
      name: "Preferred Example",
      firstName: "Formal",
      lastName: "Example",
      useName: "Preferred",
      useLastName: "Example",
      initLastName: "F Example",
      boxscoreName: "Example, F M"
    }
  );

  const expected = new Map([
    ["full", "Preferred Example"],
    ["first", "Formal"],
    ["last", "Example"],
    ["first-initial-last", "F Example"],
    ["use", "Preferred"],
    ["boxscore", "Example, F M"]
  ]);
  for (const [nameFormat, value] of expected) {
    assert.equal(
      resolveSlotContent(
        { type: "field", field: "away.lineup[].player.name", format: { nameFormat } },
        model,
        "away.lineup",
        { slot: 1 }
      ),
      value,
      nameFormat
    );
  }
});
