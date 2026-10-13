#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DESIGNER_HIDDEN_ACTIVE_FIELDS = Object.freeze([
  "game.umpires.home.name",
  "game.umpires.first.name",
  "game.umpires.second.name",
  "game.umpires.third.name"
]);

const ACCEPTED_STATES = new Set(["available", "partial"]);
const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), "..");

function isApplicationRoot(candidate) {
  return existsSync(path.join(candidate, "js", "field-registry.js"))
    && existsSync(path.join(candidate, "js", "sample-data.js"))
    && existsSync(path.join(candidate, "js", "formatter.js"));
}

export function findApplicationRoot(start = process.cwd(), override = null) {
  const candidates = [
    override ? path.resolve(override) : null,
    path.resolve(start),
    repositoryRoot,
    path.join(path.resolve(start), "Build005_4_complete_release"),
    path.join(repositoryRoot, "Build005_4_complete_release"),
    path.join(path.resolve(start), "Build004_1_overlay"),
    path.join(repositoryRoot, "Build004_1_overlay")
  ].filter(Boolean);
  const root = candidates.find(isApplicationRoot);
  if (!root) throw new Error("Unable to locate a Scorecard Studio application root.");
  return root;
}

function selectorFor(definition, slot = 1) {
  return definition.cardinality === "repeated" ? { slot } : null;
}

function gap(definition, property) {
  const value = definition[property];
  return value === null || value === undefined || String(value).trim() === "";
}

function countBy(items, key) {
  return Object.fromEntries([...new Set(items.map((item) => item[key]))]
    .sort((left, right) => String(left).localeCompare(String(right)))
    .map((value) => [value, items.filter((item) => item[key] === value).length]));
}

export async function buildCoverageAudit(applicationRoot = findApplicationRoot()) {
  const registryModule = await import(pathToFileURL(path.join(applicationRoot, "js", "field-registry.js")).href);
  const sampleModule = await import(pathToFileURL(path.join(applicationRoot, "js", "sample-data.js")).href);
  const formatterModule = await import(pathToFileURL(path.join(applicationRoot, "js", "formatter.js")).href);
  const surfaceModule = await import(pathToFileURL(path.join(applicationRoot, "js", "v040-field-surfaces.js")).href);
  const {
    FIELD_REGISTRY,
    capabilityRequirementsForField,
    getCollectionRows,
    resolveField
  } = registryModule;
  const { DESIGNER_SAMPLE_MODEL, LEGACY_DESIGNER_SAMPLE_MODEL } = sampleModule;
  const { PLAYER_NAME_FORMATS, formatFieldValue } = formatterModule;
  const { FIELD_SURFACE_DISPOSITIONS, UNREGISTERED_VALUE_DISPOSITIONS } = surfaceModule;

  const active = FIELD_REGISTRY.filter((definition) => definition.catalog !== false);
  const compatibility = FIELD_REGISTRY.filter((definition) => definition.catalog === false);
  const duplicateIds = [...new Set(FIELD_REGISTRY.map((definition) => definition.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index))].sort();
  const metadataGaps = active.flatMap((definition) => [
    ...["label", "description", "exampleValue", "visibilityTier", "valueType", "cardinality"]
      .filter((property) => gap(definition, property))
      .map((property) => ({ fieldId: definition.id, property }))
  ]);

  const resolutionFailures = (definitions) => definitions.flatMap((definition) => {
    const resolution = resolveField(DESIGNER_SAMPLE_MODEL, definition.id, selectorFor(definition));
    return ACCEPTED_STATES.has(resolution.state)
      ? []
      : [{ fieldId: definition.id, state: resolution.state, reason: resolution.reason || "" }];
  });

  const collectionNames = [...new Set(active
    .filter((definition) => definition.cardinality === "repeated")
    .map((definition) => definition.collection))].sort();
  const collections = collectionNames.map((collection) => {
    const definitions = active.filter((definition) => definition.collection === collection);
    const rows = getCollectionRows(DESIGNER_SAMPLE_MODEL, collection);
    const failures = definitions.flatMap((definition) => rows.flatMap((row, index) => {
      const resolution = resolveField(DESIGNER_SAMPLE_MODEL, definition.id, { slot: index + 1 });
      return ACCEPTED_STATES.has(resolution.state)
        ? []
        : [{ fieldId: definition.id, slot: index + 1, state: resolution.state, reason: resolution.reason || "" }];
    }));
    return { collection, fieldCount: definitions.length, rowCount: rows.length, failures };
  });

  const nameFormatFailures = active
    .filter((definition) => definition.formatKind === "playerName")
    .flatMap((definition) => {
      const resolution = resolveField(DESIGNER_SAMPLE_MODEL, definition.id, selectorFor(definition));
      return PLAYER_NAME_FORMATS.flatMap(({ value: nameFormat }) => {
        const formatted = formatFieldValue(definition, resolution, DESIGNER_SAMPLE_MODEL, { nameFormat });
        return formatted ? [] : [{ fieldId: definition.id, nameFormat }];
      });
    });

  const capabilityGaps = active
    .filter((definition) => capabilityRequirementsForField(definition.id).length === 0)
    .map((definition) => definition.id);
  const sourceRequirementGaps = active
    .filter((definition) => !Array.isArray(definition.sourceRequirements) || definition.sourceRequirements.length === 0)
    .map((definition) => definition.id);
  const sourceRequirementCounts = Object.fromEntries([...new Set(active.flatMap((definition) => definition.sourceRequirements || []))]
    .sort()
    .map((source) => [source, active.filter((definition) => definition.sourceRequirements?.includes(source)).length]));
  const availabilityCounts = countBy(active, "availability");
  const hiddenSet = new Set(DESIGNER_HIDDEN_ACTIVE_FIELDS);
  const designerEligible = active.filter((definition) => !hiddenSet.has(definition.id));
  const dispositionsById = new Map(FIELD_SURFACE_DISPOSITIONS.map((entry) => [entry.fieldId, entry]));
  const surfaceDispositionGaps = FIELD_REGISTRY.filter((definition) => !dispositionsById.has(definition.id)).map((definition) => definition.id);
  const surfaceDispositionDuplicates = FIELD_SURFACE_DISPOSITIONS.map((entry) => entry.fieldId)
    .filter((fieldId, index, ids) => ids.indexOf(fieldId) !== index);
  const surfaceCounts = Object.fromEntries(["home", "gameDay", "designer", "legacyLayout", "internal"]
    .map((surface) => [surface, FIELD_SURFACE_DISPOSITIONS.filter((entry) => entry.surfaces[surface]).length]));
  const activeSurfaceMismatches = active.flatMap((definition) => {
    const disposition = dispositionsById.get(definition.id);
    const expectedDesigner = !hiddenSet.has(definition.id);
    return disposition?.surfaces.gameDay === true
      && disposition?.surfaces.designer === expectedDesigner
      && disposition?.surfaces.legacyLayout === true ? [] : [definition.id];
  });
  const compatibilitySurfaceMismatches = compatibility.filter((definition) => {
    const surfaces = dispositionsById.get(definition.id)?.surfaces;
    return !surfaces || surfaces.home || surfaces.gameDay || surfaces.designer || !surfaces.legacyLayout || surfaces.internal;
  }).map((definition) => definition.id);
  const unregisteredDispositionGaps = UNREGISTERED_VALUE_DISPOSITIONS
    .filter((entry) => !entry.family || !entry.decision || !entry.schemaPaths?.length)
    .map((entry) => entry.family || "(unnamed)");

  const appSourcePath = path.join(applicationRoot, "js", "app.js");
  const appSource = existsSync(appSourcePath) ? await readFile(appSourcePath, "utf8") : "";
  const gameDayStart = appSource.indexOf("function renderGameDay");
  const gameDayEnd = gameDayStart < 0 ? -1 : appSource.indexOf("\nfunction ", gameDayStart + 20);
  const gameDaySource = gameDayStart < 0 ? "" : appSource.slice(gameDayStart, gameDayEnd < 0 ? undefined : gameDayEnd);

  return {
    counts: {
      total: FIELD_REGISTRY.length,
      active: active.length,
      compatibility: compatibility.length,
      standard: active.filter((definition) => definition.visibilityTier === "standard").length,
      custom: active.filter((definition) => definition.visibilityTier === "custom").length,
      designerEligible: designerEligible.length
    },
    categoryCounts: countBy(active, "category"),
    sampleSchemaVersion: DESIGNER_SAMPLE_MODEL.schemaVersion,
    legacySampleSchemaVersion: LEGACY_DESIGNER_SAMPLE_MODEL.schemaVersion,
    duplicateIds,
    metadataGaps,
    activeResolutionFailures: resolutionFailures(active),
    compatibilityResolutionFailures: resolutionFailures(compatibility),
    repeatedRowFailures: collections.flatMap((collection) => collection.failures),
    nameFormatFailures,
    capabilityGaps,
    sourceRequirementGaps,
    sourceRequirementCounts,
    availabilityCounts,
    collections,
    surfaceCounts,
    surfaceDispositionGaps,
    surfaceDispositionDuplicates,
    activeSurfaceMismatches,
    compatibilitySurfaceMismatches,
    unregisteredDispositionCount: UNREGISTERED_VALUE_DISPOSITIONS.length,
    unregisteredDispositionGaps,
    hiddenActiveFields: DESIGNER_HIDDEN_ACTIVE_FIELDS.filter((fieldId) => active.some((definition) => definition.id === fieldId)),
    fieldDiagnosticPresent: appSource.includes("renderFieldDiagnostic"),
    gameDayUsesRegistryEnumeration: /getCatalogFields\s*\(/.test(gameDaySource),
    unknownFieldState: resolveField(DESIGNER_SAMPLE_MODEL, "v040.audit.unknown", null).state
  };
}

function issueList(items, formatter) {
  return items.length ? items.map((item) => `- ${formatter(item)}`).join("\n") : "- None.";
}

export function renderCoverageReport(audit) {
  const collectionRows = audit.collections
    .map(({ collection, fieldCount, rowCount, failures }) => `| \`${collection}\` | ${fieldCount} | ${rowCount} | ${failures.length} |`)
    .join("\n");
  const categoryRows = Object.entries(audit.categoryCounts)
    .map(([category, count]) => `| ${category} | ${count} |`)
    .join("\n");
  const sourceRows = Object.entries(audit.sourceRequirementCounts)
    .map(([source, count]) => `| \`${source}\` | ${count} |`)
    .join("\n");
  const availabilityRows = Object.entries(audit.availabilityCounts)
    .map(([state, count]) => `| \`${state}\` | ${count} |`)
    .join("\n");
  const pass = audit.duplicateIds.length === 0
    && audit.metadataGaps.length === 0
    && audit.activeResolutionFailures.length === 0
    && audit.compatibilityResolutionFailures.length === 0
    && audit.repeatedRowFailures.length === 0
    && audit.nameFormatFailures.length === 0
    && audit.capabilityGaps.length === 0
    && audit.sourceRequirementGaps.length === 0
    && audit.surfaceDispositionGaps.length === 0
    && audit.surfaceDispositionDuplicates.length === 0
    && audit.activeSurfaceMismatches.length === 0
    && audit.compatibilitySurfaceMismatches.length === 0
    && audit.unregisteredDispositionGaps.length === 0
    && audit.unknownFieldState === "unsupported";

  return `# Scorecard Studio v0.4 Field-Coverage Report

**Generated by:** \`tools/generate-v040-field-coverage-report.mjs\`  
**Coverage baseline:** established in v0.4.0 Build 001.2; reconciled to schema v2 in Build 001.6  
**Result:** ${pass ? "PASS" : "FAIL"}

## Coverage summary

| Measure | Count |
|---|---:|
| All resolvable definitions | ${audit.counts.total} |
| Active catalog definitions | ${audit.counts.active} |
| Compatibility-only definitions | ${audit.counts.compatibility} |
| Standard tier | ${audit.counts.standard} |
| Custom tier | ${audit.counts.custom} |
| Designer-eligible active definitions | ${audit.counts.designerEligible} |
| Meaningful unregistered value families with a disposition | ${audit.unregisteredDispositionCount} |

The automated replacement resolves every active and compatibility definition against the committed representative model. Repeated collections are checked across every representative row, and every active player-name field is checked in every supported name format.

## Automated assertions

| Assertion | Failures |
|---|---:|
| Duplicate field IDs | ${audit.duplicateIds.length} |
| Active-field metadata gaps | ${audit.metadataGaps.length} |
| Active-field representative resolution | ${audit.activeResolutionFailures.length} |
| Compatibility-field representative resolution | ${audit.compatibilityResolutionFailures.length} |
| Repeated-field all-row resolution | ${audit.repeatedRowFailures.length} |
| Player-name format resolution | ${audit.nameFormatFailures.length} |
| Active-field capability declarations | ${audit.capabilityGaps.length} |
| Active-field source declarations | ${audit.sourceRequirementGaps.length} |
| Missing/duplicate field-surface dispositions | ${audit.surfaceDispositionGaps.length + audit.surfaceDispositionDuplicates.length} |
| Active/compatibility surface-policy mismatches | ${audit.activeSurfaceMismatches.length + audit.compatibilitySurfaceMismatches.length} |
| Unregistered-family disposition gaps | ${audit.unregisteredDispositionGaps.length} |
| Unknown field resolves as \`unsupported\` | ${audit.unknownFieldState === "unsupported" ? 0 : 1} |

## Product-surface decisions

| Surface | Resolvable fields intentionally assigned |
|---|---:|
| Home | ${audit.surfaceCounts.home} |
| Game Day | ${audit.surfaceCounts.gameDay} |
| Designer | ${audit.surfaceCounts.designer} |
| Saved/legacy layouts | ${audit.surfaceCounts.legacyLayout} |
| Internal-only registry fields | ${audit.surfaceCounts.internal} |

Home remains Schedule-only, so it consumes no hydrated registry fields. Game Day owns all 171 active fields as a research surface. Designer owns the same active set except for four fixed-role umpire aliases, where the variable Umpire Crew collection is the accepted workflow. All 223 definitions remain resolvable for saved layouts. The 52 compatibility-only definitions are deliberately legacy-only; they are not promoted merely because representative data can resolve them.

## Availability and source evidence

| Declared availability | Active fields |
|---|---:|
${availabilityRows}

| Required source | Active fields |
|---|---:|
${sourceRows}

Source counts overlap when one definition requires more than one source. Runtime resolution state is tested separately above; the representative model produces only \`available\` or accepted \`partial\` results for active fields.

## Repeated collections

| Collection | Active fields | Representative rows | Failures |
|---|---:|---:|---:|
${collectionRows}

## Active catalog by category

| Category | Fields |
|---|---:|
${categoryRows}

## Intentional Designer exception

The following active fixed-role umpire fields remain hidden from new Designer selection because the variable Umpire Crew collection is the accepted workflow:

${issueList(audit.hiddenActiveFields, (fieldId) => `\`${fieldId}\``)}

## Deliberate boundaries retained for later increments

- The live representative model is schema v${audit.sampleSchemaVersion}; the former schema v${audit.legacySampleSchemaVersion} model remains an explicit compatibility fixture only.
- Build 001.7 implements per-block Core Bullpen / Combined Pitchers / Additional Starting Pitchers selection. Existing blocks with no stored mode continue to use the historical combined projection.
- The Field Diagnostic product route is ${audit.fieldDiagnosticPresent ? "still present unexpectedly" : "retired"}. Its mechanical coverage purpose remains supplied by this generated report and the portable automated checks.
- Logos remain deferred pending asset sourcing, licensing, fallback, and layout behavior acceptance.

## Detailed failures

### Duplicate IDs

${issueList(audit.duplicateIds, (id) => `\`${id}\``)}

### Metadata

${issueList(audit.metadataGaps, (item) => `\`${item.fieldId}\`: missing ${item.property}`)}

### Active resolution

${issueList(audit.activeResolutionFailures, (item) => `\`${item.fieldId}\`: ${item.state} — ${item.reason}`)}

### Compatibility resolution

${issueList(audit.compatibilityResolutionFailures, (item) => `\`${item.fieldId}\`: ${item.state} — ${item.reason}`)}

### Repeated rows

${issueList(audit.repeatedRowFailures, (item) => `\`${item.fieldId}\` slot ${item.slot}: ${item.state} — ${item.reason}`)}

### Player-name formats

${issueList(audit.nameFormatFailures, (item) => `\`${item.fieldId}\`: ${item.nameFormat}`)}

### Capability declarations

${issueList(audit.capabilityGaps, (fieldId) => `\`${fieldId}\``)}

### Source declarations

${issueList(audit.sourceRequirementGaps, (fieldId) => `\`${fieldId}\``)}

### Field-surface dispositions

${issueList([...audit.surfaceDispositionGaps, ...audit.surfaceDispositionDuplicates, ...audit.activeSurfaceMismatches, ...audit.compatibilitySurfaceMismatches], (fieldId) => `\`${fieldId}\``)}

### Unregistered normalized families

${issueList(audit.unregisteredDispositionGaps, (family) => `\`${family}\``)}

## Interpretation

This report replaces the retired Field Diagnostic's broad mechanical “does every field resolve?” check with reproducible engineering evidence. The Designer/Test PDF sample now exercises schema-v2 structure while the separate schema-v1 fixture protects historical compatibility. Every resolvable definition and every meaningful unregistered schema-v2 family has an explicit product disposition.
`;
}

function parseArguments(argv) {
  const args = { root: null, output: path.join(repositoryRoot, "docs", "v0.4", "V040_FIELD_COVERAGE_REPORT.md"), mode: "print" };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--root") args.root = argv[++index];
    else if (argv[index] === "--output") args.output = path.resolve(argv[++index]);
    else if (argv[index] === "--write") args.mode = "write";
    else if (argv[index] === "--check") args.mode = "check";
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return args;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const applicationRoot = findApplicationRoot(process.cwd(), args.root);
  const report = renderCoverageReport(await buildCoverageAudit(applicationRoot));
  if (args.mode === "write") {
    await mkdir(path.dirname(args.output), { recursive: true });
    await writeFile(args.output, report, "utf8");
    process.stdout.write(`Wrote ${args.output}\n`);
    return;
  }
  if (args.mode === "check") {
    const committed = await readFile(args.output, "utf8");
    if (committed !== report) throw new Error(`Generated report differs from ${args.output}`);
    process.stdout.write(`Coverage report is current: ${args.output}\n`);
    return;
  }
  process.stdout.write(report);
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === path.resolve(scriptPath).toLowerCase()) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
