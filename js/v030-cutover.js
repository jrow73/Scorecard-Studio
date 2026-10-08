/**
 * Scorecard Studio v0.3.0 production normalization pipeline.
 * Build 005.2 keeps HTTP, storage, layout, and rendering concerns outside the
 * three deterministic schema-v2 normalization stages.
 */

import { assertValidNormalizedSnapshot } from "./v030-contract.js?v=030b0054";
import { normalizeScheduleSnapshot } from "./v030-schedule-normalizer.js?v=030b0054";
import { normalizeRosterPeopleStaffSnapshot } from "./v030-roster-people-normalizer.js?v=030b0054";
import { normalizeContextOverlaySnapshot } from "./v030-context-overlay-normalizer.js?v=030b0054";

export const V030_RUNTIME_MODE = "schema-v2";

function phaseExecution(execution, phase) {
  const now = execution?.createdAtUtc ?? new Date().toISOString();
  return {
    applicationVersion: execution?.applicationVersion ?? "0.3.0",
    build: execution?.build ?? "005.2",
    createdAtUtc: now,
    retrievedAtUtc: execution?.retrievedAtUtc ?? now,
    requestedAtUtc: execution?.requestedAtUtc ?? null,
    snapshotId: execution?.snapshotId ? `${execution.snapshotId}-${phase}` : undefined,
    fixtureKind: execution?.fixtureKind ?? null,
    sourceResultId: execution?.sourceResultId
  };
}

export function normalizeV030Pregame(input, execution = {}) {
  const schedule = normalizeScheduleSnapshot(input?.schedulePayload, input?.scheduleSelection, phaseExecution(execution, "schedule"));
  const personnel = normalizeRosterPeopleStaffSnapshot(schedule, {
    roster: input?.roster,
    people: input?.people,
    coaches: input?.coaches,
    depthChart: input?.depthChart
  }, phaseExecution(execution, "personnel"));
  const snapshot = normalizeContextOverlaySnapshot(personnel, {
    standings: input?.standings,
    feed: input?.feed,
    venue: input?.venue,
    boxscore: input?.boxscore
  }, phaseExecution(execution, "complete"));
  return assertValidNormalizedSnapshot(snapshot);
}

export function summarizeV030Availability(snapshot) {
  const counts = {};
  for (const record of snapshot?.meta?.lineage ?? []) counts[record.state] = (counts[record.state] ?? 0) + 1;
  const retryableFailures = (snapshot?.meta?.sourceResults ?? []).filter((entry) => entry.outcome === "failed" && entry.error?.retryable !== false);
  return {
    schemaVersion: snapshot?.schemaVersion ?? null,
    contractRevision: snapshot?.contractRevision ?? null,
    lineageStates: counts,
    sourceOutcomes: Object.fromEntries(["success", "partial", "failed", "notRequested"].map((outcome) => [outcome, (snapshot?.meta?.sourceResults ?? []).filter((entry) => entry.outcome === outcome).length])),
    retryableSourceResultIds: retryableFailures.map((entry) => entry.id)
  };
}
