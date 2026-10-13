import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  DESIGNER_HIDDEN_ACTIVE_FIELDS,
  buildCoverageAudit,
  findApplicationRoot,
  renderCoverageReport
} from "../tools/generate-v040-field-coverage-report.mjs";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "..");
const applicationRoot = findApplicationRoot(repositoryRoot);

test("v0.4 field coverage preserves the accepted registry baseline", async () => {
  const audit = await buildCoverageAudit(applicationRoot);
  assert.deepEqual(audit.counts, {
    total: 223,
    active: 171,
    compatibility: 52,
    standard: 64,
    custom: 107,
    designerEligible: 167
  });
  assert.equal(audit.sampleSchemaVersion, 2);
  assert.equal(audit.legacySampleSchemaVersion, 1);
  assert.deepEqual(audit.hiddenActiveFields, DESIGNER_HIDDEN_ACTIVE_FIELDS);
  assert.deepEqual(audit.surfaceCounts, { home: 0, gameDay: 171, designer: 167, legacyLayout: 223, internal: 0 });
  assert.equal(audit.unregisteredDispositionCount, 10);
});

test("all active and compatibility fields resolve without structural gaps", async () => {
  const audit = await buildCoverageAudit(applicationRoot);
  assert.deepEqual(audit.duplicateIds, []);
  assert.deepEqual(audit.metadataGaps, []);
  assert.deepEqual(audit.activeResolutionFailures, []);
  assert.deepEqual(audit.compatibilityResolutionFailures, []);
  assert.deepEqual(audit.capabilityGaps, []);
  assert.deepEqual(audit.sourceRequirementGaps, []);
  assert.deepEqual(audit.surfaceDispositionGaps, []);
  assert.deepEqual(audit.surfaceDispositionDuplicates, []);
  assert.deepEqual(audit.activeSurfaceMismatches, []);
  assert.deepEqual(audit.compatibilitySurfaceMismatches, []);
  assert.deepEqual(audit.unregisteredDispositionGaps, []);
  assert.deepEqual(audit.availabilityCounts, { supported: 171 });
  assert.deepEqual(audit.sourceRequirementCounts, { coaches: 4, gamePack: 151, standings: 16 });
  assert.equal(audit.unknownFieldState, "unsupported");
});

test("all representative collection rows and player-name formats resolve", async () => {
  const audit = await buildCoverageAudit(applicationRoot);
  assert.deepEqual(audit.collections.map(({ collection, fieldCount, rowCount }) => ({ collection, fieldCount, rowCount })), [
    { collection: "away.bench", fieldCount: 16, rowCount: 6 },
    { collection: "away.bullpen", fieldCount: 9, rowCount: 14 },
    { collection: "away.lineup", fieldCount: 18, rowCount: 9 },
    { collection: "game.umpires.crew", fieldCount: 2, rowCount: 6 },
    { collection: "home.bench", fieldCount: 16, rowCount: 6 },
    { collection: "home.bullpen", fieldCount: 9, rowCount: 14 },
    { collection: "home.lineup", fieldCount: 18, rowCount: 9 }
  ]);
  assert.deepEqual(audit.repeatedRowFailures, []);
  assert.deepEqual(audit.nameFormatFailures, []);
});

test("generated field coverage report is committed and current", async () => {
  const audit = await buildCoverageAudit(applicationRoot);
  const expected = renderCoverageReport(audit);
  const reportPath = path.join(repositoryRoot, "docs", "v0.4", "V040_FIELD_COVERAGE_REPORT.md");
  assert.equal(await readFile(reportPath, "utf8"), expected);
});
