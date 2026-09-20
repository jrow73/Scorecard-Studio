/**
 * Scorecard Studio
 * Canonical pregame field registry
 * Version: 0.2.0-dev
 * Build: 018.3
 */

const SIDE_LABEL = { away: "Away", home: "Home" };

const LEGACY_ALIASES = new Map([
  ["away.teamName", "away.team.name"],
  ["home.teamName", "home.team.name"],
  ["away.startingPitcher.name", "away.startingPitcher.player.name"],
  ["home.startingPitcher.name", "home.startingPitcher.player.name"]
]);

const standard = (entry) => Object.assign(entry, { visibilityTier: "standard", catalog: true });
const custom = (entry) => Object.assign(entry, { visibilityTier: "custom", catalog: true });
const compatibility = (entry) => Object.assign(entry, { visibilityTier: null, catalog: false });

const gameFields = [
  standard(field("game.date", "Game Date", "Game", "date", "atomic", "game.date", ["gamePack"])),
  standard(field("game.startTime", "Scheduled Start", "Game", "instant", "atomic", "game.startTime", ["gamePack"])),
  custom(field("game.dayNight", "Day / Night", "Game", "text", "atomic", "game.dayNight", ["gamePack"])),
  custom(field("game.number", "Game Number (Day)", "Game", "integer", "atomic", "game.number", ["gamePack"])),
  standard(field("game.venue.name", "Venue Name", "Game / Venue", "text", "atomic", "game.venue.name", ["gamePack"])),
  custom(field("game.venue.city", "Venue City", "Game / Venue", "text", "atomic", "game.venue.city", ["gamePack"])),
  custom(field("game.venue.state", "Venue State / Province", "Game / Venue", "text", "atomic", "game.venue.state", ["gamePack"])),
  custom(field("game.venue.country", "Venue Country", "Game / Venue", "text", "atomic", "game.venue.country", ["gamePack"])),
  custom(field("game.venue.capacity", "Venue Capacity", "Game / Venue", "integer", "atomic", "game.venue.capacity", ["gamePack"])),
  custom(field("game.venue.turfType", "Turf Type", "Game / Venue", "text", "atomic", "game.venue.turfType", ["gamePack"])),
  custom(field("game.venue.roofType", "Roof Type", "Game / Venue", "text", "atomic", "game.venue.roofType", ["gamePack"])),
  custom(field("game.weather.temperature", "Temperature", "Game / Weather", "decimal", "atomic", "game.weather.temperature", ["gamePack"])),
  custom(field("game.weather.condition", "Conditions", "Game / Weather", "text", "atomic", "game.weather.condition", ["gamePack"])),
  custom(field("game.weather.wind", "Wind", "Game / Weather", "text", "atomic", "game.weather.wind", ["gamePack"])),
  standard(composite("game.weather.summary", "Weather Summary", "Game / Weather", "weatherSummary", [
    "game.weather.temperature", "game.weather.condition", "game.weather.wind"
  ], ["gamePack"])),
  custom(field("game.umpires.home.name", "Home Plate Umpire", "Game / Umpires", "text", "atomic", "game.umpires.home.name", ["gamePack"])),
  custom(field("game.umpires.first.name", "First Base Umpire", "Game / Umpires", "text", "atomic", "game.umpires.first.name", ["gamePack"])),
  custom(field("game.umpires.second.name", "Second Base Umpire", "Game / Umpires", "text", "atomic", "game.umpires.second.name", ["gamePack"])),
  custom(field("game.umpires.third.name", "Third Base Umpire", "Game / Umpires", "text", "atomic", "game.umpires.third.name", ["gamePack"]))
];

const sideFields = ["away", "home"].flatMap((side) => {
  const label = SIDE_LABEL[side];
  return [
    standard(field(`${side}.team.name`, `${label} Team — Full Name`, `${label} / Team`, "text", "atomic", `${side}.team.name`, ["gamePack"])),
    custom(field(`${side}.team.locationName`, `${label} Team — Location`, `${label} / Team`, "text", "atomic", `${side}.team.locationName`, ["gamePack"])),
    custom(field(`${side}.team.shortName`, `${label} Team — Short Name`, `${label} / Team`, "text", "atomic", `${side}.team.shortName`, ["gamePack"])),
    standard(field(`${side}.team.clubName`, `${label} Team — Club Name`, `${label} / Team`, "text", "atomic", `${side}.team.clubName`, ["gamePack"])),
    standard(field(`${side}.team.abbreviation`, `${label} Team — Abbreviation`, `${label} / Team`, "text", "atomic", `${side}.team.abbreviation`, ["gamePack"])),
    custom(field(`${side}.team.league.name`, `${label} Team — League`, `${label} / Team`, "text", "atomic", `${side}.team.league.name`, ["gamePack"])),
    custom(field(`${side}.team.division.name`, `${label} Team — Division`, `${label} / Team`, "text", "atomic", `${side}.team.division.name`, ["gamePack"])),
    standard(field(`${side}.team.record.gamesPlayed`, `${label} Team — Games Played`, `${label} / Record`, "integer", "atomic", `${side}.team.record.gamesPlayed`, ["gamePack"])),
    custom(field(`${side}.team.record.wins`, `${label} Team — Wins`, `${label} / Record`, "integer", "atomic", `${side}.team.record.wins`, ["gamePack"])),
    custom(field(`${side}.team.record.losses`, `${label} Team — Losses`, `${label} / Record`, "integer", "atomic", `${side}.team.record.losses`, ["gamePack"])),
    custom(field(`${side}.team.record.pct`, `${label} Team — PCT`, `${label} / Record`, "decimal", "atomic", `${side}.team.record.pct`, ["gamePack"], { precision: 3 })),
    standard(composite(`${side}.team.record.display`, `${label} Team — W-L Record`, `${label} / Record`, "record", [
      `${side}.team.record.wins`, `${side}.team.record.losses`
    ], ["gamePack"])),
    custom(field(`${side}.team.standings.divisionRank`, `${label} Team — Division Rank`, `${label} / Standings`, "integer", "atomic", `${side}.team.standings.divisionRank`, ["standings"])),
    custom(field(`${side}.team.standings.leagueRank`, `${label} Team — League Rank`, `${label} / Standings`, "integer", "atomic", `${side}.team.standings.leagueRank`, ["standings"])),
    custom(field(`${side}.team.standings.wildCardRank`, `${label} Team — Wild Card Rank`, `${label} / Standings`, "integer", "atomic", `${side}.team.standings.wildCardRank`, ["standings"])),
    custom(field(`${side}.team.standings.divisionGamesBack`, `${label} Team — Division Games Back`, `${label} / Standings`, "text", "atomic", `${side}.team.standings.divisionGamesBack`, ["standings"])),
    custom(field(`${side}.team.standings.streak`, `${label} Team — Streak`, `${label} / Standings`, "text", "atomic", `${side}.team.standings.streak`, ["standings"])),
    custom(field(`${side}.team.standings.last10.wins`, `${label} Team — Last 10 Wins`, `${label} / Standings`, "integer", "atomic", `${side}.team.standings.last10.wins`, ["standings"])),
    custom(field(`${side}.team.standings.last10.losses`, `${label} Team — Last 10 Losses`, `${label} / Standings`, "integer", "atomic", `${side}.team.standings.last10.losses`, ["standings"])),
    custom(field(`${side}.team.standings.last10.display`, `${label} Team — Last 10 Record`, `${label} / Standings`, "text", "atomic", `${side}.team.standings.last10.display`, ["standings"])),
    standard(field(`${side}.manager.name`, `${label} Manager`, `${label} / Personnel`, "text", "atomic", `${side}.manager.name`, ["coaches"])),
    custom(field(`${side}.manager.number`, `${label} Manager — Jersey #`, `${label} / Personnel`, "text", "atomic", `${side}.manager.number`, ["coaches"])),
    ...startingPitcherFields(side, label)
  ];
});

const lineupFields = ["away", "home"].flatMap((side) => playerBattingFields(side, "lineup", "Lineup", true));
const benchFields = ["away", "home"].flatMap((side) => playerBattingFields(side, "bench", "Bench", false));

const bullpenFields = ["away", "home"].flatMap((side) => {
  const label = SIDE_LABEL[side];
  const collection = `${side}.bullpen`;
  const category = `${label} / Bullpen`;
  return [
    standard(repeatedField(`${side}.bullpen[].player.number`, `${label} Bullpen — Jersey #`, category, "text", collection, "player.number")),
    standard(repeatedField(`${side}.bullpen[].player.name`, `${label} Bullpen — Pitcher Name`, category, "text", collection, "player.name")),
    standard(repeatedField(`${side}.bullpen[].player.throws`, `${label} Bullpen — Throws`, category, "text", collection, "player.throws")),
    standard(repeatedField(`${side}.bullpen[].stats.record`, `${label} Bullpen — W-L`, category, "text", collection, "stats.record")),
    standard(repeatedField(`${side}.bullpen[].stats.era`, `${label} Bullpen — ERA`, category, "decimal", collection, "stats.era", { precision: 2 })),
    standard(repeatedField(`${side}.bullpen[].stats.whip`, `${label} Bullpen — WHIP`, category, "decimal", collection, "stats.whip", { precision: 2 })),
    custom(repeatedField(`${side}.bullpen[].stats.gamesStarted`, `${label} Bullpen — Games Started`, category, "integer", collection, "stats.gamesStarted")),
    custom(repeatedField(`${side}.bullpen[].stats.wins`, `${label} Bullpen — Wins`, category, "integer", collection, "stats.wins")),
    custom(repeatedField(`${side}.bullpen[].stats.losses`, `${label} Bullpen — Losses`, category, "integer", collection, "stats.losses")),
    compatibility(repeatedField(`${side}.bullpen[].stats.inningsPitched`, `${label} Bullpen — IP`, category, "text", collection, "stats.inningsPitched")),
    compatibility(repeatedField(`${side}.bullpen[].stats.strikeouts`, `${label} Bullpen — SO`, category, "integer", collection, "stats.strikeouts")),
    compatibility(repeatedField(`${side}.bullpen[].stats.saves`, `${label} Bullpen — Saves`, category, "integer", collection, "stats.saves")),
    compatibility(repeatedField(`${side}.bullpen[].stats.holds`, `${label} Bullpen — Holds`, category, "integer", collection, "stats.holds"))
  ];
});

const umpireFields = [
  standard(repeatedField("game.umpires.crew[].name", "Umpire Crew — Name", "Game / Umpires", "text", "game.umpires.crew", "name")),
  standard(repeatedField("game.umpires.crew[].role", "Umpire Crew — Role", "Game / Umpires", "text", "game.umpires.crew", "role"))
];

const repeatedFields = [...lineupFields, ...benchFields, ...bullpenFields, ...umpireFields];
for (const entry of repeatedFields) {
  if (entry.rowPath === "player.name") {
    entry.formatKind = "playerName";
    entry.formatSourcePath = "player";
  }
}

export const FIELD_REGISTRY = Object.freeze([...gameFields, ...sideFields, ...repeatedFields].map((entry, index) => {
  const catalog = entry.catalog !== false;
  const metadata = catalog ? fieldCatalogMetadata(entry) : { description: null, exampleValue: null };
  return Object.freeze({
    ...entry,
    order: index + 1,
    availability: "supported",
    catalog,
    visibilityTier: entry.visibilityTier ?? null,
    description: entry.description || metadata.description,
    exampleValue: entry.exampleValue ?? metadata.exampleValue,
    introducedIn: entry.introducedIn || "v0.2.0"
  });
}));

const byId = new Map(FIELD_REGISTRY.map((entry) => [entry.id, entry]));
const supportedCollections = new Set(repeatedFields.map((entry) => entry.collection));

export function canonicalFieldId(fieldId) { return LEGACY_ALIASES.get(fieldId) || fieldId; }
export function getFieldDefinition(fieldId) { return byId.get(canonicalFieldId(fieldId)) || null; }

// Compatibility API: returns all resolvable fields, including catalog:false legacy fields.
export function getSupportedFields(options = {}) {
  const cardinality = options.cardinality || null;
  const collection = options.collection || null;
  return FIELD_REGISTRY.filter((entry) => (!cardinality || entry.cardinality === cardinality) && (!collection || entry.collection === collection));
}

// User-facing catalog API: omits compatibility-only fields while preserving their resolvers.
export function getCatalogFields(options = {}) {
  const tier = options.visibilityTier || null;
  return getSupportedFields(options).filter((entry) => entry.catalog !== false && (!tier || entry.visibilityTier === tier));
}

export function getFieldLabel(fieldId) {
  const definition = getFieldDefinition(fieldId);
  return definition?.label || String(fieldId || "Unknown field");
}

export function getFieldDescription(fieldId) {
  return getFieldDefinition(fieldId)?.description || "";
}

export function getFieldExampleValue(fieldId) {
  return getFieldDefinition(fieldId)?.exampleValue ?? "";
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

function rowHasMember(row) { return Boolean(row?.player?.id || row?.player?.name); }

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

function twoDecimals(value) { const number = Number(value); return Number.isFinite(number) ? number.toFixed(2) : String(value); }

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


function fieldCatalogMetadata(entry) {
  const id = String(entry.id || "");
  const game = {
    "game.date": ["Official game date.", "Sep 19, 2026"],
    "game.startTime": ["Scheduled first-pitch time.", "7:10 PM"],
    "game.dayNight": ["Whether the game is designated as a day or night game.", "Night"],
    "game.number": ["Game number within the day, such as Game 2 of a doubleheader.", "2"],
    "game.venue.name": ["Ballpark or venue name.", "T-Mobile Park"],
    "game.venue.city": ["City where the venue is located.", "Seattle"],
    "game.venue.state": ["State or province where the venue is located.", "WA"],
    "game.venue.country": ["Country where the venue is located.", "USA"],
    "game.venue.capacity": ["Published seating capacity of the venue.", "47,929"],
    "game.venue.turfType": ["Playing-surface type reported for the venue.", "Grass"],
    "game.venue.roofType": ["Roof configuration reported for the venue.", "Retractable"],
    "game.weather.temperature": ["Pregame temperature at the venue.", "68"],
    "game.weather.condition": ["Pregame weather conditions.", "Partly Cloudy"],
    "game.weather.wind": ["Pregame wind speed and direction.", "7 mph, L to R"],
    "game.weather.summary": ["Combined pregame conditions, temperature, and wind.", "Partly Cloudy • 68° • 7 mph, L to R"],
    "game.umpires.home.name": ["Name of the home-plate umpire.", "Pat Hoberg"],
    "game.umpires.first.name": ["Name of the first-base umpire.", "Edwin Jimenez"],
    "game.umpires.second.name": ["Name of the second-base umpire.", "Alfonso Márquez"],
    "game.umpires.third.name": ["Name of the third-base umpire.", "Mike Estabrook"],
    "game.umpires.crew[].name": ["Umpire name within the umpire-crew collection.", "Pat Hoberg"],
    "game.umpires.crew[].role": ["Assigned umpire position or role.", "Home Plate"]
  };
  if (game[id]) return metadataPair(game[id]);

  const sideId = id.replace(/^(away|home)\./, "");
  const side = {
    "team.name": ["Full team name including location and club name.", "Seattle Mariners"],
    "team.locationName": ["Team location or market name.", "Seattle"],
    "team.shortName": ["Short team name supplied by the source data.", "Seattle"],
    "team.clubName": ["Club name without the location.", "Mariners"],
    "team.abbreviation": ["Standard team abbreviation.", "SEA"],
    "team.league.name": ["League name for the team.", "American League"],
    "team.division.name": ["Division name for the team.", "American League West"],
    "team.record.gamesPlayed": ["Season games played before or including the selected game, as supplied by the source.", "151"],
    "team.record.wins": ["Season wins.", "86"],
    "team.record.losses": ["Season losses.", "65"],
    "team.record.pct": ["Season winning percentage.", ".570"],
    "team.record.display": ["Season win-loss record.", "86-65"],
    "team.standings.divisionRank": ["Current rank within the team's division.", "1"],
    "team.standings.leagueRank": ["Current rank within the team's league.", "2"],
    "team.standings.wildCardRank": ["Current Wild Card rank, when applicable.", "1"],
    "team.standings.divisionGamesBack": ["Games behind the division leader.", "2.5"],
    "team.standings.streak": ["Current winning or losing streak.", "W3"],
    "team.standings.last10.wins": ["Wins in the team's last 10 games.", "7"],
    "team.standings.last10.losses": ["Losses in the team's last 10 games.", "3"],
    "team.standings.last10.display": ["Win-loss record over the team's last 10 games.", "7-3"],
    "manager.name": ["Team manager's name.", "Dan Wilson"],
    "manager.number": ["Manager's uniform number, when available.", "6"]
  };
  if (side[sideId]) return metadataPair(side[sideId]);

  const starterId = sideId.replace(/^startingPitcher\./, "");
  const starter = {
    "player.name": ["Starting pitcher's name. Display can be changed with Name Format.", "Logan Gilbert"],
    "player.number": ["Starting pitcher's jersey number.", "36"],
    "player.throws": ["Starting pitcher's throwing hand.", "R"],
    "stats.gamesStarted": ["Season games started by the pitcher.", "28"],
    "stats.wins": ["Pitcher's season wins.", "14"],
    "stats.losses": ["Pitcher's season losses.", "7"],
    "stats.record": ["Pitcher's season win-loss record.", "14-7"],
    "stats.era": ["Earned Run Average: earned runs allowed per nine innings.", "3.11"],
    "stats.whip": ["WHIP: walks plus hits allowed per inning pitched.", "1.04"]
  };
  if (sideId.startsWith("startingPitcher.") && starter[starterId]) return metadataPair(starter[starterId]);

  const collectionMatch = sideId.match(/^(lineup|bench|bullpen)\[\]\.(.+)$/);
  if (collectionMatch) {
    const [, collection, leaf] = collectionMatch;
    const commonPlayer = {
      "player.number": ["Player's jersey number.", collection === "bullpen" ? "75" : "44"],
      "player.name": [collection === "bullpen" ? "Pitcher's name. Display can be changed with Name Format." : "Player's name. Display can be changed with Name Format.", collection === "bullpen" ? "Andrés Muñoz" : "Julio Rodríguez"]
    };
    if (commonPlayer[leaf]) return metadataPair(commonPlayer[leaf]);
    if (collection === "bullpen") {
      const bullpen = {
        "player.throws": ["Pitcher's throwing hand.", "R"],
        "stats.record": ["Pitcher's season win-loss record.", "4-2"],
        "stats.era": ["Earned Run Average: earned runs allowed per nine innings.", "1.92"],
        "stats.whip": ["WHIP: walks plus hits allowed per inning pitched.", "0.95"],
        "stats.gamesStarted": ["Season games started by the pitcher.", "0"],
        "stats.wins": ["Pitcher's season wins.", "4"],
        "stats.losses": ["Pitcher's season losses.", "2"]
      };
      if (bullpen[leaf]) return metadataPair(bullpen[leaf]);
    } else {
      const batting = {
        "player.bats": ["Player's batting side: Left, Right, or Switch.", "R"],
        "position.abbreviation": [collection === "lineup" ? "Player's defensive position in today's posted lineup." : "Player's listed game position, when available.", collection === "lineup" ? "CF" : "OF"],
        "position.name": ["Full name of the player's position in today's posted lineup.", "Center Field"],
        "position.number": ["Traditional defensive position number (P=1 through RF=9); designated hitter displays as DH.", "8"],
        "player.primaryPosition.abbreviation": ["Player's typical or primary position abbreviation.", collection === "lineup" ? "CF" : "OF"],
        "player.primaryPosition.name": ["Full name of the player's typical or primary position.", collection === "lineup" ? "Center Field" : "Outfielder"],
        "stats.avg": ["Batting average: hits divided by at-bats.", ".287"],
        "stats.obp": ["On-base percentage: rate of reaching base by hit, walk, or hit-by-pitch, with sacrifice-fly adjustment.", ".352"],
        "stats.slg": ["Slugging percentage: total bases divided by at-bats.", ".489"],
        "stats.ops": ["OPS: on-base percentage plus slugging percentage.", ".841"],
        "stats.homeRuns": ["Season home runs.", "28"],
        "stats.rbi": ["Season runs batted in.", "91"],
        "stats.gamesPlayed": ["Season games played by the player.", "145"],
        "stats.plateAppearances": ["Season plate appearances.", "612"],
        "stats.stolenBases": ["Season stolen bases.", "24"],
        "stats.slashLine": ["Convenience batting line shown as AVG/OBP/SLG.", ".287/.352/.489"]
      };
      if (batting[leaf]) return metadataPair(batting[leaf]);
    }
  }

  return {
    description: `Scorecard field: ${String(entry.label || entry.id)}.`,
    exampleValue: exampleFallback(entry)
  };
}

function metadataPair(pair) { return { description: pair[0], exampleValue: pair[1] }; }
function exampleFallback(entry) {
  if (entry.valueType === "integer") return "1";
  if (entry.valueType === "decimal") return ".500";
  return "Example";
}

function readPath(root, path) { return String(path).split(".").reduce((value, key) => value == null ? undefined : value[key], root); }
function field(id, label, category, valueType, kind, path, sourceRequirements, defaultFormat = {}) { return { id, label, category, valueType, kind, path, sourceRequirements, defaultFormat, cardinality: "single" }; }
function composite(id, label, category, resolver, dependencies, sourceRequirements) { return { id, label, category, valueType: "text", kind: "composite", resolver, dependencies, sourceRequirements, defaultFormat: {}, cardinality: "single" }; }
function repeatedField(id, label, category, valueType, collection, rowPath, defaultFormat = {}) { return { id, label, category, valueType, kind: "atomic", cardinality: "repeated", collection, rowPath, sourceRequirements: ["gamePack"], defaultFormat }; }

function playerBattingFields(side, collectionName, noun, isLineup) {
  const label = SIDE_LABEL[side];
  const collection = `${side}.${collectionName}`;
  const category = `${label} / ${noun === "Lineup" ? "Starting Lineup" : noun}`;
  const prefix = `${side}.${collectionName}[]`;
  const result = [];
  if (isLineup) result.push(compatibility(repeatedField(`${prefix}.battingOrder`, `${label} Lineup — Batting Order`, category, "integer", collection, "battingOrder")));
  result.push(
    standard(repeatedField(`${prefix}.player.number`, `${label} ${noun} — Jersey #`, category, "text", collection, "player.number")),
    standard(repeatedField(`${prefix}.player.name`, `${label} ${noun} — Player Name`, category, "text", collection, "player.name")),
    standard(repeatedField(`${prefix}.player.bats`, `${label} ${noun} — Bats`, category, "text", collection, "player.bats"))
  );
  if (isLineup) {
    result.push(
      standard(repeatedField(`${prefix}.position.abbreviation`, `${label} Lineup — Today's Position`, category, "text", collection, "position.abbreviation")),
      custom(repeatedField(`${prefix}.position.name`, `${label} Lineup — Today's Position Full Name`, category, "text", collection, "position.name")),
      custom(repeatedField(`${prefix}.position.number`, `${label} Lineup — Today's Position Number`, category, "text", collection, "position.number")),
      custom(repeatedField(`${prefix}.player.primaryPosition.abbreviation`, `${label} Lineup — Primary Position`, category, "text", collection, "player.primaryPosition.abbreviation")),
      custom(repeatedField(`${prefix}.player.primaryPosition.name`, `${label} Lineup — Primary Position Full Name`, category, "text", collection, "player.primaryPosition.name"))
    );
  } else {
    result.push(
      standard(repeatedField(`${prefix}.player.primaryPosition.abbreviation`, `${label} Bench — Primary Position`, category, "text", collection, "player.primaryPosition.abbreviation")),
      custom(repeatedField(`${prefix}.player.primaryPosition.name`, `${label} Bench — Primary Position Full Name`, category, "text", collection, "player.primaryPosition.name")),
      custom(repeatedField(`${prefix}.position.abbreviation`, `${label} Bench — Game Position`, category, "text", collection, "position.abbreviation"))
    );
  }
  result.push(
    standard(repeatedField(`${prefix}.stats.avg`, `${label} ${noun} — AVG`, category, "decimal", collection, "stats.avg", { precision: 3 })),
    custom(repeatedField(`${prefix}.stats.obp`, `${label} ${noun} — OBP`, category, "decimal", collection, "stats.obp", { precision: 3 })),
    custom(repeatedField(`${prefix}.stats.slg`, `${label} ${noun} — SLG`, category, "decimal", collection, "stats.slg", { precision: 3 })),
    custom(repeatedField(`${prefix}.stats.ops`, `${label} ${noun} — OPS`, category, "decimal", collection, "stats.ops", { precision: 3 })),
    custom(repeatedField(`${prefix}.stats.homeRuns`, `${label} ${noun} — HR`, category, "integer", collection, "stats.homeRuns")),
    custom(repeatedField(`${prefix}.stats.rbi`, `${label} ${noun} — RBI`, category, "integer", collection, "stats.rbi")),
    custom(repeatedField(`${prefix}.stats.gamesPlayed`, `${label} ${noun} — Games Played`, category, "integer", collection, "stats.gamesPlayed")),
    custom(repeatedField(`${prefix}.stats.plateAppearances`, `${label} ${noun} — Plate Appearances`, category, "integer", collection, "stats.plateAppearances")),
    custom(repeatedField(`${prefix}.stats.stolenBases`, `${label} ${noun} — Stolen Bases`, category, "integer", collection, "stats.stolenBases")),
    custom(repeatedField(`${prefix}.stats.slashLine`, `${label} ${noun} — Slash Line`, category, "text", collection, "stats.slashLine"))
  );
  return result;
}

function startingPitcherFields(side, label) {
  const root = `${side}.startingPitcher`;
  const category = `${label} / Starting Pitcher`;
  const entries = [
    standard(field(`${root}.player.name`, `${label} Starting Pitcher — Player Name`, category, "text", "atomic", `${root}.player.name`, ["gamePack"])),
    standard(field(`${root}.player.number`, `${label} Starting Pitcher — Jersey #`, category, "text", "atomic", `${root}.player.number`, ["gamePack"])),
    standard(field(`${root}.player.throws`, `${label} Starting Pitcher — Throws`, category, "text", "atomic", `${root}.player.throws`, ["gamePack"])),
    compatibility(field(`${root}.stats.gamesPlayed`, `${label} Starting Pitcher — Games`, category, "integer", "atomic", `${root}.stats.gamesPlayed`, ["gamePack"])),
    compatibility(field(`${root}.stats.gamesPitched`, `${label} Starting Pitcher — Games Pitched`, category, "integer", "atomic", `${root}.stats.gamesPitched`, ["gamePack"])),
    standard(field(`${root}.stats.gamesStarted`, `${label} Starting Pitcher — Games Started`, category, "integer", "atomic", `${root}.stats.gamesStarted`, ["gamePack"])),
    custom(field(`${root}.stats.wins`, `${label} Starting Pitcher — Wins`, category, "integer", "atomic", `${root}.stats.wins`, ["gamePack"])),
    custom(field(`${root}.stats.losses`, `${label} Starting Pitcher — Losses`, category, "integer", "atomic", `${root}.stats.losses`, ["gamePack"])),
    standard(composite(`${root}.stats.record`, `${label} Starting Pitcher — W-L`, category, "record", [`${root}.stats.wins`, `${root}.stats.losses`], ["gamePack"])),
    standard(field(`${root}.stats.era`, `${label} Starting Pitcher — ERA`, category, "decimal", "atomic", `${root}.stats.era`, ["gamePack"], { precision: 2 })),
    custom(field(`${root}.stats.whip`, `${label} Starting Pitcher — WHIP`, category, "decimal", "atomic", `${root}.stats.whip`, ["gamePack"], { precision: 2 })),
    compatibility(field(`${root}.stats.inningsPitched`, `${label} Starting Pitcher — IP`, category, "text", "atomic", `${root}.stats.inningsPitched`, ["gamePack"])),
    compatibility(field(`${root}.stats.hits`, `${label} Starting Pitcher — Hits`, category, "integer", "atomic", `${root}.stats.hits`, ["gamePack"])),
    compatibility(field(`${root}.stats.runs`, `${label} Starting Pitcher — Runs`, category, "integer", "atomic", `${root}.stats.runs`, ["gamePack"])),
    compatibility(field(`${root}.stats.earnedRuns`, `${label} Starting Pitcher — Earned Runs`, category, "integer", "atomic", `${root}.stats.earnedRuns`, ["gamePack"])),
    compatibility(field(`${root}.stats.homeRuns`, `${label} Starting Pitcher — Home Runs`, category, "integer", "atomic", `${root}.stats.homeRuns`, ["gamePack"])),
    compatibility(field(`${root}.stats.walks`, `${label} Starting Pitcher — Walks`, category, "integer", "atomic", `${root}.stats.walks`, ["gamePack"])),
    compatibility(field(`${root}.stats.strikeouts`, `${label} Starting Pitcher — Strikeouts`, category, "integer", "atomic", `${root}.stats.strikeouts`, ["gamePack"])),
    compatibility(field(`${root}.stats.saves`, `${label} Starting Pitcher — Saves`, category, "integer", "atomic", `${root}.stats.saves`, ["gamePack"])),
    compatibility(field(`${root}.stats.saveOpportunities`, `${label} Starting Pitcher — Save Opportunities`, category, "integer", "atomic", `${root}.stats.saveOpportunities`, ["gamePack"])),
    compatibility(field(`${root}.stats.holds`, `${label} Starting Pitcher — Holds`, category, "integer", "atomic", `${root}.stats.holds`, ["gamePack"])),
    compatibility(field(`${root}.stats.blownSaves`, `${label} Starting Pitcher — Blown Saves`, category, "integer", "atomic", `${root}.stats.blownSaves`, ["gamePack"])),
    compatibility(field(`${root}.stats.winPercentage`, `${label} Starting Pitcher — Win Percentage`, category, "decimal", "atomic", `${root}.stats.winPercentage`, ["gamePack"], { precision: 3 })),
    compatibility(field(`${root}.stats.strikeoutWalkRatio`, `${label} Starting Pitcher — K/BB`, category, "decimal", "atomic", `${root}.stats.strikeoutWalkRatio`, ["gamePack"], { precision: 2 })),
    compatibility(field(`${root}.stats.strikeoutsPer9Inn`, `${label} Starting Pitcher — K/9`, category, "decimal", "atomic", `${root}.stats.strikeoutsPer9Inn`, ["gamePack"], { precision: 2 })),
    compatibility(field(`${root}.stats.walksPer9Inn`, `${label} Starting Pitcher — BB/9`, category, "decimal", "atomic", `${root}.stats.walksPer9Inn`, ["gamePack"], { precision: 2 })),
    compatibility(field(`${root}.stats.hitsPer9Inn`, `${label} Starting Pitcher — H/9`, category, "decimal", "atomic", `${root}.stats.hitsPer9Inn`, ["gamePack"], { precision: 2 })),
    compatibility(field(`${root}.stats.homeRunsPer9`, `${label} Starting Pitcher — HR/9`, category, "decimal", "atomic", `${root}.stats.homeRunsPer9`, ["gamePack"], { precision: 2 })),
    compatibility(field(`${root}.stats.pitchesPerInning`, `${label} Starting Pitcher — Pitches/Inning`, category, "decimal", "atomic", `${root}.stats.pitchesPerInning`, ["gamePack"], { precision: 2 })),
    compatibility(composite(`${root}.stats.compact`, `${label} Starting Pitcher — Pitching Summary`, category, "pitchingCompact", [`${root}.stats.record`, `${root}.stats.era`, `${root}.stats.whip`], ["gamePack"]))
  ];
  for (const entry of entries) entry.record = root;
  const name = entries[0];
  name.formatKind = "playerName";
  name.formatSourcePath = `${root}.player`;
  name.legacyLabels = [`${label} Starting Pitcher`];
  return entries;
}
