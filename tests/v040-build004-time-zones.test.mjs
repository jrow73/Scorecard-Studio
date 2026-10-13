import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { formatDualZoneInstant, formatFieldValue, normalizeTimeZoneId } from "../js/formatter.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const instant = "2026-10-12T00:00:00Z";
const gameZone = "America/New_York";

test("Build 004.9 accepts the normalized venue timezone object", () => {
  assert.equal(normalizeTimeZoneId({ iana: gameZone }), gameZone);
  assert.equal(normalizeTimeZoneId({ id: gameZone }), gameZone);
  assert.equal(normalizeTimeZoneId({ tz: gameZone }), gameZone);
});

test("scorecard instant fields always format in the game's venue timezone", () => {
  const expected = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: gameZone }).format(new Date(instant));
  const actual = formatFieldValue(
    { valueType: "instant" },
    { state: "available", value: instant },
    { game: { venue: { timeZone: { iana: gameZone } } } }
  );
  assert.equal(actual, expected);
});

test("browser first pitch shows user and game-local times when they differ", async () => {
  const date = new Date(instant);
  const options = { hour: "numeric", minute: "2-digit", timeZoneName: "short" };
  const userText = new Intl.DateTimeFormat(undefined, options).format(date);
  const gameText = new Intl.DateTimeFormat(undefined, { ...options, timeZone: gameZone }).format(date);
  const expected = gameText === userText ? userText : `${userText} (you) • ${gameText} (game)`;
  assert.equal(formatDualZoneInstant(instant, { iana: gameZone }), expected);

  const app = await readFile(path.join(root, "js", "app.js"), "utf8");
  assert.match(app, /void loadSelectedGameVenueTimeZone\(selected\)/);
  assert.match(app, /formatDualZoneInstant\(scheduled, game\.venue\?\.timeZone\)/);
  assert.match(app, /needsGameLocalTime = fieldIds\.some[\s\S]*?canonicalFieldId\(fieldId\) === "game\.startTime"/);
  assert.match(app, /requirements\.has\("extendedVenue"\) \|\| needsGameLocalTime/);
});
