import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const registryPath = path.resolve(args.get("--registry") ?? "js/field-registry.js");
const outputPath = path.resolve(args.get("--output") ?? "tests/fixtures/model-contract/v030-compatibility-map.json");
const { FIELD_REGISTRY, FIELD_ALIASES = {} } = await import(pathToFileURL(registryPath).href);

function dependencies(...paths) {
  return paths;
}

function mapField(field) {
  const id = field.id;
  let disposition = "direct";
  let targetPath = field.path ?? null;
  let targetCollection = field.collection ?? null;
  let targetRowPath = field.rowPath ?? null;
  let projection = null;
  let targetDependencies = [];
  let capabilityRequirements = ["corePregame"];

  const exact = {
    "game.date": ["projected", "game.dates.officialDate", "official-date"],
    "game.startTime": ["projected", "game.dates.scheduledStart", "scheduled-start"],
    "game.number": ["projected", "game.gameNumber", "renamed-path"],
    "game.venue.city": ["projected", "game.venue.location.city", "renamed-path"],
    "game.venue.state": ["projected", "game.venue.location.state", "renamed-path"],
    "game.venue.country": ["projected", "game.venue.location.country", "renamed-path"],
    "game.venue.capacity": ["projected", "game.venue.fieldInfo.capacity", "renamed-path"],
    "game.venue.turfType": ["projected", "game.venue.fieldInfo.turfType", "renamed-path"],
    "game.venue.roofType": ["projected", "game.venue.fieldInfo.roofType", "renamed-path"],
    "away.manager.name": ["projected", "away.manager.selected.name", "selected-manager"],
    "away.manager.number": ["projected", "away.manager.selected.number", "selected-manager"],
    "home.manager.name": ["projected", "home.manager.selected.name", "selected-manager"],
    "home.manager.number": ["projected", "home.manager.selected.number", "selected-manager"]
  };

  if (exact[id]) [disposition, targetPath, projection] = exact[id];

  if (/^game\.venue\.(city|state|country|capacity|turfType|roofType)$/.test(id)) {
    capabilityRequirements = ["extendedVenue"];
  }
  if (/^[^.]+\.manager\./.test(id)) capabilityRequirements = ["staff"];

  const umpireRole = id.match(/^game\.umpires\.(home|first|second|third)\.name$/);
  if (umpireRole) {
    const role = { home: "home-plate", first: "first-base", second: "second-base", third: "third-base" }[umpireRole[1]];
    disposition = "projected";
    targetPath = null;
    targetDependencies = ["game.umpires.crew"];
    projection = `select-official-role:${role}`;
    capabilityRequirements = ["officials"];
  }

  if (id.startsWith("game.umpires.crew[]")) capabilityRequirements = ["officials"];

  if (id === "game.weather.summary") {
    disposition = "derived";
    targetPath = null;
    targetDependencies = dependencies("game.weather.temperature", "game.weather.condition", "game.weather.wind");
    projection = "weather-summary-v1";
  }

  const recordDisplay = id.match(/^(away|home)\.team\.record\.display$/);
  if (recordDisplay) {
    disposition = "derived";
    targetPath = null;
    targetDependencies = dependencies(`${recordDisplay[1]}.team.record.wins`, `${recordDisplay[1]}.team.record.losses`);
    projection = "wins-losses-record-v1";
  }

  const rank = id.match(/^(away|home)\.team\.standings\.(divisionRank|leagueRank|wildCardRank)$/);
  if (rank) {
    disposition = "projected";
    targetPath = `${rank[1]}.team.standings.${rank[2]}.value`;
    projection = "rank-value";
  }

  const gamesBack = id.match(/^(away|home)\.team\.standings\.divisionGamesBack$/);
  if (gamesBack) {
    disposition = "projected";
    targetPath = `${gamesBack[1]}.team.standings.divisionGamesBack.raw`;
    projection = "games-back-raw";
  }

  const lastTen = id.match(/^(away|home)\.team\.standings\.last10\.(wins|losses|display)$/);
  if (lastTen) {
    const side = lastTen[1];
    if (lastTen[2] === "display") {
      disposition = "derived";
      targetPath = null;
      targetDependencies = dependencies(`${side}.team.standings.lastTen.wins`, `${side}.team.standings.lastTen.losses`);
      projection = "wins-losses-last-ten-v1";
    } else {
      disposition = "projected";
      targetPath = `${side}.team.standings.lastTen.${lastTen[2]}`;
      projection = "renamed-path";
    }
  }

  const starterStats = id.match(/^(away|home)\.startingPitcher\.stats\.(.+)$/);
  if (starterStats) {
    const [side, stat] = starterStats.slice(1);
    if (stat === "record") {
      disposition = "derived";
      targetPath = null;
      targetDependencies = dependencies(`${side}.startingPitcher.stats.pitching.totals.wins`, `${side}.startingPitcher.stats.pitching.totals.losses`);
      projection = "wins-losses-record-v1";
    } else if (stat === "compact") {
      disposition = "derived";
      targetPath = null;
      targetDependencies = dependencies(`${side}.startingPitcher.stats.pitching.totals.wins`, `${side}.startingPitcher.stats.pitching.totals.losses`, `${side}.startingPitcher.stats.pitching.totals.era`);
      projection = "pitching-compact-v1";
    } else {
      disposition = "projected";
      targetPath = `${side}.startingPitcher.stats.pitching.totals.${stat}`;
      projection = "pitching-stat-scope";
    }
  }

  const repeated = id.match(/^(away|home)\.(lineup|bench|bullpen)\[\]\.(.+)$/);
  if (repeated) {
    const [, side, group, row] = repeated;
    const v2Collection = group === "lineup" ? `${side}.lineup.slots` : `${side}.${group}`;
    targetCollection = v2Collection;
    targetPath = null;
    targetRowPath = row;
    disposition = group === "lineup" ? "projected" : "direct";
    projection = group === "lineup" ? "lineup-slots" : null;

    if (group === "bullpen") {
      disposition = "projected";
      targetCollection = null;
      targetDependencies = [`${side}.bullpen`, `${side}.additionalStarters`];
      projection = "legacy-bullpen-union-v1";
    }

    const stats = row.match(/^stats\.(.+)$/);
    if (stats) {
      const stat = stats[1];
      const statGroup = group === "bullpen" ? "pitching" : "hitting";
      if (stat === "record") {
        targetRowPath = null;
        targetDependencies.push(`${v2Collection}[].stats.${statGroup}.totals.wins`, `${v2Collection}[].stats.${statGroup}.totals.losses`);
        projection = group === "bullpen" ? "legacy-bullpen-record-v1" : "wins-losses-record-v1";
        disposition = "derived";
      } else if (stat === "slashLine") {
        targetRowPath = null;
        targetDependencies.push(`${v2Collection}[].stats.hitting.totals.avg`, `${v2Collection}[].stats.hitting.totals.obp`, `${v2Collection}[].stats.hitting.totals.slg`);
        projection = "hitting-slash-line-v1";
        disposition = "derived";
      } else {
        targetRowPath = `stats.${statGroup}.totals.${stat}`;
        projection = group === "bullpen" ? "legacy-bullpen-pitching-stat-v1" : `${statGroup}-stat-scope`;
        disposition = "projected";
      }
    }
  }

  return {
    fieldId: id,
    v1: {
      catalog: field.catalog === true,
      visibilityTier: field.visibilityTier || "compatibility-only",
      kind: field.kind,
      cardinality: field.cardinality,
      path: field.path ?? null,
      collection: field.collection ?? null,
      rowPath: field.rowPath ?? null,
      sourceRequirements: field.sourceRequirements ?? []
    },
    v2: {
      disposition,
      path: targetPath,
      collection: targetCollection,
      rowPath: targetRowPath,
      dependencies: [...new Set(targetDependencies)],
      projection,
      capabilityRequirements,
      unavailableBehavior: "blank-with-availability-state"
    }
  };
}

const fields = Object.values(FIELD_REGISTRY).map(mapField);
const defaultAliases = {
  "away.teamName": "away.team.name",
  "home.teamName": "home.team.name",
  "away.startingPitcher.name": "away.startingPitcher.player.name",
  "home.startingPitcher.name": "home.startingPitcher.player.name"
};
const aliases = Object.entries(Object.keys(FIELD_ALIASES).length ? FIELD_ALIASES : defaultAliases)
  .map(([alias, canonical]) => ({ alias, canonical, policy: "canonicalize-in-memory" }));

const output = {
  schemaId: "scorecard-studio.compatibility-map",
  schemaVersion: 1,
  contractRevision: "0.3.0-draft.1",
  sourceModel: { schemaVersion: 1, fieldCount: fields.length, catalogCount: fields.filter((field) => field.v1.catalog).length },
  targetModel: { schemaVersion: 2 },
  capabilityVocabulary: ["corePregame", "officials", "extendedVenue", "staff", "pitcherRoles", "game2Overlay"],
  aliases,
  fields,
  unknownFieldPolicy: {
    resolution: "unsupported",
    render: "blank-placeholder",
    preserveOnLoadAndSave: true,
    diagnostics: "retain-original-id-and-report-once-per-layout"
  },
  persistencePolicy: {
    layouts: {
      storageSchemaIndependentFromNormalizedModel: true,
      canonicalizeKnownAliases: "in-memory-on-load",
      persistCanonicalIds: "only-on-explicit-user-save",
      preserveUnknownFields: true
    },
    normalizedSnapshots: {
      keyParts: ["namespace", "schemaVersion", "contractRevision", "gamePk", "selectedViewKey"],
      namespace: "normalized-game",
      acceptSchemaVersions: [2],
      v1ReadPolicy: "discard-and-recompute",
      inPlaceUpgrade: false,
      reason: "schema-v1 snapshots cannot reconstruct schema-v2 source results, scope, availability, or lineage"
    },
    adapterCache: {
      keyParts: ["namespace", "adapterContractRevision", "requestKey"],
      namespace: "adapter-result",
      cacheSuccessfulAndPartialUnitsOnly: true,
      cacheFailureAsEmpty: false,
      invalidateOn: ["semantic-key-change", "adapter-contract-revision-change", "declared-freshness-trigger"]
    },
    generatedArtifacts: {
      pdfAndExportBlobs: "unaffected",
      reason: "rendered outputs are not normalized snapshots or adapter results"
    }
  }
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${fields.length} field mappings to ${outputPath}`);
