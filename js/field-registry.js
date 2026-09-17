/**
 * Scorecard Studio
 * Canonical pregame field registry
 * Version: 0.2.0-dev
 * Build: 017.1
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
    ...startingPitcherFields(side, label)
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

const benchFields = ["away", "home"].flatMap((side) => {
  const label = SIDE_LABEL[side];
  const collection = `${side}.bench`;
  const category = `${label} / Bench`;
  return [
    repeatedField(`${side}.bench[].player.number`, `${label} Bench — Jersey #`, category, "text", collection, "player.number"),
    repeatedField(`${side}.bench[].player.name`, `${label} Bench — Player Name`, category, "text", collection, "player.name"),
    repeatedField(`${side}.bench[].position.abbreviation`, `${label} Bench — Position`, category, "text", collection, "position.abbreviation"),
    repeatedField(`${side}.bench[].player.bats`, `${label} Bench — Bats`, category, "text", collection, "player.bats"),
    repeatedField(`${side}.bench[].stats.avg`, `${label} Bench — AVG`, category, "decimal", collection, "stats.avg", { precision: 3 }),
    repeatedField(`${side}.bench[].stats.obp`, `${label} Bench — OBP`, category, "decimal", collection, "stats.obp", { precision: 3 }),
    repeatedField(`${side}.bench[].stats.slg`, `${label} Bench — SLG`, category, "decimal", collection, "stats.slg", { precision: 3 }),
    repeatedField(`${side}.bench[].stats.ops`, `${label} Bench — OPS`, category, "decimal", collection, "stats.ops", { precision: 3 }),
    repeatedField(`${side}.bench[].stats.homeRuns`, `${label} Bench — HR`, category, "integer", collection, "stats.homeRuns"),
    repeatedField(`${side}.bench[].stats.rbi`, `${label} Bench — RBI`, category, "integer", collection, "stats.rbi")
  ];
});

const bullpenFields = ["away", "home"].flatMap((side) => {
  const label = SIDE_LABEL[side];
  const collection = `${side}.bullpen`;
  const category = `${label} / Bullpen`;
  return [
    repeatedField(`${side}.bullpen[].player.number`, `${label} Bullpen — Jersey #`, category, "text", collection, "player.number"),
    repeatedField(`${side}.bullpen[].player.name`, `${label} Bullpen — Pitcher Name`, category, "text", collection, "player.name"),
    repeatedField(`${side}.bullpen[].player.throws`, `${label} Bullpen — Throws`, category, "text", collection, "player.throws"),
    repeatedField(`${side}.bullpen[].stats.wins`, `${label} Bullpen — Wins`, category, "integer", collection, "stats.wins"),
    repeatedField(`${side}.bullpen[].stats.losses`, `${label} Bullpen — Losses`, category, "integer", collection, "stats.losses"),
    repeatedField(`${side}.bullpen[].stats.era`, `${label} Bullpen — ERA`, category, "decimal", collection, "stats.era", { precision: 2 }),
    repeatedField(`${side}.bullpen[].stats.whip`, `${label} Bullpen — WHIP`, category, "decimal", collection, "stats.whip", { precision: 2 }),
    repeatedField(`${side}.bullpen[].stats.inningsPitched`, `${label} Bullpen — IP`, category, "text", collection, "stats.inningsPitched"),
    repeatedField(`${side}.bullpen[].stats.strikeouts`, `${label} Bullpen — SO`, category, "integer", collection, "stats.strikeouts"),
    repeatedField(`${side}.bullpen[].stats.saves`, `${label} Bullpen — Saves`, category, "integer", collection, "stats.saves"),
    repeatedField(`${side}.bullpen[].stats.holds`, `${label} Bullpen — Holds`, category, "integer", collection, "stats.holds")
  ];
});


const umpireFields = [
  repeatedField("game.umpires.crew[].name", "Umpire Crew — Name", "Game / Umpires", "text", "game.umpires.crew", "name"),
  repeatedField("game.umpires.crew[].role", "Umpire Crew — Role", "Game / Umpires", "text", "game.umpires.crew", "role")
];

const repeatedFields = [...lineupFields, ...benchFields, ...bullpenFields, ...umpireFields];

// Build 017.1: player-name formatting is a field capability, not a Starting-Pitcher special case.
for (const entry of repeatedFields) {
  if (entry.rowPath === "player.name") {
    entry.formatKind = "playerName";
    entry.formatSourcePath = "player";
  }
}

export const FIELD_REGISTRY = Object.freeze([...gameFields, ...sideFields, ...repeatedFields].map((entry, index) => Object.freeze({
  ...entry,
  order: index + 1,
  availability: "supported",
  introducedIn: entry.introducedIn || "v0.2.0"
})));

const byId = new Map(FIELD_REGISTRY.map((entry) => [entry.id, entry]));
const supportedCollections = new Set(repeatedFields.map((entry) => entry.collection));

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
    const rows = getCollectionRows(model, definition.collection);
    let row = null;
    if (selector?.role) {
      const wantedRole = canonicalRoleKey(selector.role);
      row = rows.find((candidate) => canonicalRoleKey(repeatedRowRole(definition.collection, candidate)) === wantedRole) || null;
      if (!row) return { value: null, state: "missing", reason: `Collection role ${selector.role} is not available.`, fieldId: canonicalId };
    } else {
      const slot = Number(selector?.slot);
      if (!Number.isInteger(slot) || slot < 1) return { value: null, state: "unsupported", reason: "Repeated field requires a positive slot selector or role selector.", fieldId: canonicalId };
      row = rows[slot - 1];
      if (!row) return { value: null, state: "missing", reason: `Collection slot ${slot} is not available.`, fieldId: canonicalId };
    }
    const value = readPath(row, definition.rowPath);
    const formatSource = definition.formatSourcePath ? readPath(row, definition.formatSourcePath) : null;
    return value === null || value === undefined || value === ""
      ? { value: null, state: "missing", reason: "Value is not available.", fieldId: canonicalId, formatSource }
      : { value, state: "available", reason: "", fieldId: canonicalId, formatSource };
  }

  if (definition.kind === "atomic") {
    const value = readPath(model, definition.path);
    const formatSource = definition.formatSourcePath ? readPath(model, definition.formatSourcePath) : null;
    return value === null || value === undefined || value === ""
      ? { value: null, state: "missing", reason: "Value is not available.", fieldId: canonicalId, formatSource }
      : { value, state: "available", reason: "", fieldId: canonicalId, formatSource };
  }

  if (definition.resolver === "record") return resolveRecord(model, definition);
  if (definition.resolver === "pitchingCompact") return resolvePitchingCompact(model, definition);
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

function resolvePitchingCompact(model, definition) {
  const values = Object.fromEntries(definition.dependencies.map((id) => [id.split(".").at(-1), resolveField(model, id)]));
  const parts = [];
  if (values.record?.state === "available") parts.push(String(values.record.value));
  if (values.era?.state === "available") parts.push(`${twoDecimals(values.era.value)} ERA`);
  if (values.whip?.state === "available") parts.push(`${twoDecimals(values.whip.value)} WHIP`);
  if (!parts.length) return { value: null, state: "missing", reason: "Pitching summary is not available.", fieldId: definition.id };
  return { value: parts.join(" • "), state: parts.length === 3 ? "available" : "partial", reason: parts.length === 3 ? "" : "Pitching summary is partial.", fieldId: definition.id };
}

function twoDecimals(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : String(value);
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


function repeatedRowRole(collection, row) {
  if (collection === "game.umpires.crew") return row?.role ?? null;
  if (collection === "away.lineup" || collection === "home.lineup") return row?.position?.abbreviation ?? null;
  return null;
}

function canonicalRoleKey(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (text.includes("home") && text.includes("plate")) return "HP";
  if (text.includes("first")) return "1B";
  if (text.includes("second")) return "2B";
  if (text.includes("third")) return "3B";
  if (text.includes("left") && text.includes("field")) return "LF";
  if (text.includes("right") && text.includes("field")) return "RF";
  if (text.includes("replay")) return "REPLAY";
  return text.toUpperCase().replace(/[^A-Z0-9]+/g, "");
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

function startingPitcherFields(side, label) {
  const root = `${side}.startingPitcher`;
  const category = `${label} / Starting Pitcher`;
  const entries = [
    field(`${root}.player.name`, `${label} Starting Pitcher — Player Name`, category, "text", "atomic", `${root}.player.name`, ["gamePack"]),
    field(`${root}.player.number`, `${label} Starting Pitcher — Jersey #`, category, "text", "atomic", `${root}.player.number`, ["gamePack"]),
    field(`${root}.player.throws`, `${label} Starting Pitcher — Throws`, category, "text", "atomic", `${root}.player.throws`, ["gamePack"]),
    field(`${root}.stats.gamesPlayed`, `${label} Starting Pitcher — Games`, category, "integer", "atomic", `${root}.stats.gamesPlayed`, ["gamePack"]),
    field(`${root}.stats.gamesPitched`, `${label} Starting Pitcher — Games Pitched`, category, "integer", "atomic", `${root}.stats.gamesPitched`, ["gamePack"]),
    field(`${root}.stats.gamesStarted`, `${label} Starting Pitcher — Games Started`, category, "integer", "atomic", `${root}.stats.gamesStarted`, ["gamePack"]),
    field(`${root}.stats.wins`, `${label} Starting Pitcher — Wins`, category, "integer", "atomic", `${root}.stats.wins`, ["gamePack"]),
    field(`${root}.stats.losses`, `${label} Starting Pitcher — Losses`, category, "integer", "atomic", `${root}.stats.losses`, ["gamePack"]),
    composite(`${root}.stats.record`, `${label} Starting Pitcher — W-L`, category, "record", [`${root}.stats.wins`, `${root}.stats.losses`], ["gamePack"]),
    field(`${root}.stats.era`, `${label} Starting Pitcher — ERA`, category, "decimal", "atomic", `${root}.stats.era`, ["gamePack"], { precision: 2 }),
    field(`${root}.stats.whip`, `${label} Starting Pitcher — WHIP`, category, "decimal", "atomic", `${root}.stats.whip`, ["gamePack"], { precision: 2 }),
    field(`${root}.stats.inningsPitched`, `${label} Starting Pitcher — IP`, category, "text", "atomic", `${root}.stats.inningsPitched`, ["gamePack"]),
    field(`${root}.stats.hits`, `${label} Starting Pitcher — Hits`, category, "integer", "atomic", `${root}.stats.hits`, ["gamePack"]),
    field(`${root}.stats.runs`, `${label} Starting Pitcher — Runs`, category, "integer", "atomic", `${root}.stats.runs`, ["gamePack"]),
    field(`${root}.stats.earnedRuns`, `${label} Starting Pitcher — Earned Runs`, category, "integer", "atomic", `${root}.stats.earnedRuns`, ["gamePack"]),
    field(`${root}.stats.homeRuns`, `${label} Starting Pitcher — Home Runs`, category, "integer", "atomic", `${root}.stats.homeRuns`, ["gamePack"]),
    field(`${root}.stats.walks`, `${label} Starting Pitcher — Walks`, category, "integer", "atomic", `${root}.stats.walks`, ["gamePack"]),
    field(`${root}.stats.strikeouts`, `${label} Starting Pitcher — Strikeouts`, category, "integer", "atomic", `${root}.stats.strikeouts`, ["gamePack"]),
    field(`${root}.stats.saves`, `${label} Starting Pitcher — Saves`, category, "integer", "atomic", `${root}.stats.saves`, ["gamePack"]),
    field(`${root}.stats.saveOpportunities`, `${label} Starting Pitcher — Save Opportunities`, category, "integer", "atomic", `${root}.stats.saveOpportunities`, ["gamePack"]),
    field(`${root}.stats.holds`, `${label} Starting Pitcher — Holds`, category, "integer", "atomic", `${root}.stats.holds`, ["gamePack"]),
    field(`${root}.stats.blownSaves`, `${label} Starting Pitcher — Blown Saves`, category, "integer", "atomic", `${root}.stats.blownSaves`, ["gamePack"]),
    field(`${root}.stats.winPercentage`, `${label} Starting Pitcher — Win Percentage`, category, "decimal", "atomic", `${root}.stats.winPercentage`, ["gamePack"], { precision: 3 }),
    field(`${root}.stats.strikeoutWalkRatio`, `${label} Starting Pitcher — K/BB`, category, "decimal", "atomic", `${root}.stats.strikeoutWalkRatio`, ["gamePack"], { precision: 2 }),
    field(`${root}.stats.strikeoutsPer9Inn`, `${label} Starting Pitcher — K/9`, category, "decimal", "atomic", `${root}.stats.strikeoutsPer9Inn`, ["gamePack"], { precision: 2 }),
    field(`${root}.stats.walksPer9Inn`, `${label} Starting Pitcher — BB/9`, category, "decimal", "atomic", `${root}.stats.walksPer9Inn`, ["gamePack"], { precision: 2 }),
    field(`${root}.stats.hitsPer9Inn`, `${label} Starting Pitcher — H/9`, category, "decimal", "atomic", `${root}.stats.hitsPer9Inn`, ["gamePack"], { precision: 2 }),
    field(`${root}.stats.homeRunsPer9`, `${label} Starting Pitcher — HR/9`, category, "decimal", "atomic", `${root}.stats.homeRunsPer9`, ["gamePack"], { precision: 2 }),
    field(`${root}.stats.pitchesPerInning`, `${label} Starting Pitcher — Pitches/Inning`, category, "decimal", "atomic", `${root}.stats.pitchesPerInning`, ["gamePack"], { precision: 2 }),
    composite(`${root}.stats.compact`, `${label} Starting Pitcher — Pitching Summary`, category, "pitchingCompact", [`${root}.stats.record`, `${root}.stats.era`, `${root}.stats.whip`], ["gamePack"])
  ];
  for (const entry of entries) entry.record = root;
  const name = entries[0];
  name.formatKind = "playerName";
  name.formatSourcePath = `${root}.player`;
  name.legacyLabels = [`${label} Starting Pitcher`];
  return entries;
}
