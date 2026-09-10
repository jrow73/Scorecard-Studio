/**
 * Scorecard Studio
 * Canonical pregame field registry
 * Version: 0.2.0-dev
 * Build: 010
 */

const SIDE_LABEL = { away: "Away", home: "Home" };

const LEGACY_ALIASES = new Map([
  ["away.teamName", "away.team.name"],
  ["home.teamName", "home.team.name"],
  ["away.startingPitcher.name", "away.startingPitcher.player.name"],
  ["home.startingPitcher.name", "home.startingPitcher.player.name"]
]);

const gameFields = [
  field("game.date", "Game Date", "Game", "date", "atomic", "game.date", ["gamePack"]),
  field("game.startTime", "Scheduled Start", "Game", "instant", "atomic", "game.startTime", ["gamePack"]),
  field("game.venue.name", "Venue Name", "Game / Venue", "text", "atomic", "game.venue.name", ["gamePack"]),
  field("game.weather.temperature", "Temperature", "Game / Weather", "decimal", "atomic", "game.weather.temperature", ["gamePack"]),
  field("game.weather.condition", "Conditions", "Game / Weather", "text", "atomic", "game.weather.condition", ["gamePack"]),
  field("game.weather.wind", "Wind", "Game / Weather", "text", "atomic", "game.weather.wind", ["gamePack"]),
  composite("game.weather.summary", "Weather Summary", "Game / Weather", "weatherSummary", [
    "game.weather.temperature", "game.weather.condition", "game.weather.wind"
  ], ["gamePack"])
];

const sideFields = ["away", "home"].flatMap((side) => {
  const label = SIDE_LABEL[side];
  return [
    field(`${side}.team.name`, `${label} Team — Full Name`, `${label} / Team`, "text", "atomic", `${side}.team.name`, ["gamePack"]),
    field(`${side}.team.locationName`, `${label} Team — Location`, `${label} / Team`, "text", "atomic", `${side}.team.locationName`, ["gamePack"]),
    field(`${side}.team.shortName`, `${label} Team — Short Name`, `${label} / Team`, "text", "atomic", `${side}.team.shortName`, ["gamePack"]),
    field(`${side}.team.clubName`, `${label} Team — Club Name`, `${label} / Team`, "text", "atomic", `${side}.team.clubName`, ["gamePack"]),
    field(`${side}.team.abbreviation`, `${label} Team — Abbreviation`, `${label} / Team`, "text", "atomic", `${side}.team.abbreviation`, ["gamePack"]),
    field(`${side}.team.record.wins`, `${label} Team — Wins`, `${label} / Record`, "integer", "atomic", `${side}.team.record.wins`, ["gamePack"]),
    field(`${side}.team.record.losses`, `${label} Team — Losses`, `${label} / Record`, "integer", "atomic", `${side}.team.record.losses`, ["gamePack"]),
    field(`${side}.team.record.pct`, `${label} Team — PCT`, `${label} / Record`, "decimal", "atomic", `${side}.team.record.pct`, ["gamePack"], { precision: 3 }),
    composite(`${side}.team.record.display`, `${label} Team — W-L Record`, `${label} / Record`, "record", [
      `${side}.team.record.wins`, `${side}.team.record.losses`
    ], ["gamePack"]),
    field(`${side}.manager.name`, `${label} Manager`, `${label} / Personnel`, "text", "atomic", `${side}.manager.name`, ["coaches"]),
    field(`${side}.startingPitcher.player.name`, `${label} Starting Pitcher`, `${label} / Pitching`, "text", "atomic", `${side}.startingPitcher.player.name`, ["gamePack"])
  ];
});

const lineupFields = ["away", "home"].flatMap((side) => {
  const label = SIDE_LABEL[side];
  const collection = `${side}.lineup`;
  const category = `${label} / Starting Lineup`;
  return [
    repeatedField(`${side}.lineup[].battingOrder`, `${label} Lineup — Batting Order`, category, "integer", collection, "battingOrder"),
    repeatedField(`${side}.lineup[].player.number`, `${label} Lineup — Jersey #`, category, "text", collection, "player.number"),
    repeatedField(`${side}.lineup[].player.name`, `${label} Lineup — Player Name`, category, "text", collection, "player.name"),
    repeatedField(`${side}.lineup[].position.abbreviation`, `${label} Lineup — Position`, category, "text", collection, "position.abbreviation"),
    repeatedField(`${side}.lineup[].player.bats`, `${label} Lineup — Bats`, category, "text", collection, "player.bats"),
    repeatedField(`${side}.lineup[].stats.avg`, `${label} Lineup — AVG`, category, "decimal", collection, "stats.avg", { precision: 3 }),
    repeatedField(`${side}.lineup[].stats.obp`, `${label} Lineup — OBP`, category, "decimal", collection, "stats.obp", { precision: 3 }),
    repeatedField(`${side}.lineup[].stats.slg`, `${label} Lineup — SLG`, category, "decimal", collection, "stats.slg", { precision: 3 }),
    repeatedField(`${side}.lineup[].stats.ops`, `${label} Lineup — OPS`, category, "decimal", collection, "stats.ops", { precision: 3 }),
    repeatedField(`${side}.lineup[].stats.homeRuns`, `${label} Lineup — HR`, category, "integer", collection, "stats.homeRuns"),
    repeatedField(`${side}.lineup[].stats.rbi`, `${label} Lineup — RBI`, category, "integer", collection, "stats.rbi")
  ];
});

export const FIELD_REGISTRY = Object.freeze([...gameFields, ...sideFields, ...lineupFields].map((entry, index) => Object.freeze({
  ...entry,
  order: index + 1,
  availability: "supported",
  introducedIn: entry.introducedIn || "v0.2.0"
})));

const byId = new Map(FIELD_REGISTRY.map((entry) => [entry.id, entry]));
const supportedCollections = new Set(lineupFields.map((entry) => entry.collection));

export function canonicalFieldId(fieldId) {
  return LEGACY_ALIASES.get(fieldId) || fieldId;
}

export function getFieldDefinition(fieldId) {
  return byId.get(canonicalFieldId(fieldId)) || null;
}

export function getSupportedFields(options = {}) {
  const cardinality = options.cardinality || null;
  const collection = options.collection || null;
  return FIELD_REGISTRY.filter((entry) => (!cardinality || entry.cardinality === cardinality) && (!collection || entry.collection === collection));
}

export function getFieldLabel(fieldId) {
  const definition = getFieldDefinition(fieldId);
  return definition?.label || String(fieldId || "Unknown field");
}

export function resolveField(model, fieldId, selector = null) {
  const canonicalId = canonicalFieldId(fieldId);
  const definition = byId.get(canonicalId);
  if (!definition) return { value: null, state: "unsupported", reason: `Unsupported field: ${fieldId}`, fieldId: canonicalId };

  if (definition.cardinality === "repeated") {
    const slot = Number(selector?.slot);
    if (!Number.isInteger(slot) || slot < 1) return { value: null, state: "unsupported", reason: "Repeated field requires a positive slot selector.", fieldId: canonicalId };
    const rows = getCollectionRows(model, definition.collection);
    const row = rows[slot - 1];
    if (!row) return { value: null, state: "missing", reason: `Collection slot ${slot} is not available.`, fieldId: canonicalId };
    const value = readPath(row, definition.rowPath);
    return value === null || value === undefined || value === ""
      ? { value: null, state: "missing", reason: "Value is not available.", fieldId: canonicalId }
      : { value, state: "available", reason: "", fieldId: canonicalId };
  }

  if (definition.kind === "atomic") {
    const value = readPath(model, definition.path);
    return value === null || value === undefined || value === ""
      ? { value: null, state: "missing", reason: "Value is not available.", fieldId: canonicalId }
      : { value, state: "available", reason: "", fieldId: canonicalId };
  }

  if (definition.resolver === "record") return resolveRecord(model, definition);
  if (definition.resolver === "weatherSummary") return resolveWeather(model, definition);
  return { value: null, state: "unsupported", reason: "Resolver is not implemented.", fieldId: canonicalId };
}

export function sourceRequirementsForFields(fieldIds) {
  const requirements = new Set();
  for (const fieldId of fieldIds) {
    const definition = getFieldDefinition(fieldId);
    for (const requirement of definition?.sourceRequirements || []) requirements.add(requirement);
  }
  return requirements;
}

export function getCollectionRows(model, collection) {
  if (!supportedCollections.has(collection)) return [];
  const value = readPath(model, collection);
  return Array.isArray(value) ? value : [];
}

export function collectionHasOverflow(model, collection, capacity) {
  const rows = getCollectionRows(model, collection);
  return rows.slice(Math.max(0, Number(capacity) || 0)).some((row) => rowHasMember(row));
}

function rowHasMember(row) {
  return Boolean(row?.player?.id || row?.player?.name);
}

function resolveRecord(model, definition) {
  const values = definition.dependencies.map((id) => resolveField(model, id));
  if (values.some((item) => item.state !== "available")) return { value: null, state: "missing", reason: "Both wins and losses are required.", fieldId: definition.id };
  return { value: `${values[0].value}-${values[1].value}`, state: "available", reason: "", fieldId: definition.id };
}

function resolveWeather(model, definition) {
  const [temp, condition, wind] = definition.dependencies.map((id) => resolveField(model, id));
  const parts = [];
  if (condition.state === "available") parts.push(String(condition.value));
  if (temp.state === "available") parts.push(`${temp.value}°`);
  if (wind.state === "available") parts.push(String(wind.value));
  if (!parts.length) return { value: null, state: "missing", reason: "Weather is not available.", fieldId: definition.id };
  const partial = [temp, condition, wind].some((item) => item.state !== "available");
  return { value: parts.join(" • "), state: partial ? "partial" : "available", reason: partial ? "Weather summary is partial." : "", fieldId: definition.id };
}

function readPath(root, path) {
  return String(path).split(".").reduce((value, key) => value == null ? undefined : value[key], root);
}

function field(id, label, category, valueType, kind, path, sourceRequirements, defaultFormat = {}) {
  return { id, label, category, valueType, kind, path, sourceRequirements, defaultFormat, cardinality: "single" };
}

function composite(id, label, category, resolver, dependencies, sourceRequirements) {
  return { id, label, category, valueType: "text", kind: "composite", resolver, dependencies, sourceRequirements, defaultFormat: {}, cardinality: "single" };
}

function repeatedField(id, label, category, valueType, collection, rowPath, defaultFormat = {}) {
  return { id, label, category, valueType, kind: "atomic", cardinality: "repeated", collection, rowPath, sourceRequirements: ["gamePack"], defaultFormat };
}
