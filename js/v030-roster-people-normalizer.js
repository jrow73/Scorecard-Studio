/**
 * Scorecard Studio v0.3.0 roster, People, staff, and pitcher-role projection.
 *
 * Build 004.4 remains dormant: callers provide an existing Schedule snapshot
 * and already-retrieved source payloads. This module performs no I/O.
 */

import {
  ContractRuntimeError,
  assertValidNormalizedSnapshot,
  createLineageRecord,
  createSourceResult
} from "./v030-contract.js?v=030b0054";
import { buildSemanticRequestKey, materializeAdapterInput } from "./v030-adapters.js?v=030b0054";

const own = (value, key) => Object.prototype.hasOwnProperty.call(Object(value), key);
const clone = (value) => structuredClone(value);

function integerOrNull(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function stringOrNull(value) {
  return typeof value === "string" && value.length ? value : null;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "" || /^[-.]+$/.test(String(value))) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function position(value = {}, roleLabel = null) {
  return {
    abbreviation: stringOrNull(value.abbreviation),
    name: stringOrNull(value.name),
    number: integerOrNull(value.code) ?? stringOrNull(value.code),
    roleLabel
  };
}

function person(base = {}, rosterEntry = null, enriched = null) {
  const primary = enriched?.primaryPosition ?? base.primaryPosition ?? rosterEntry?.position ?? {};
  const rosterPerson = rosterEntry?.person ?? {};
  const result = {
    id: integerOrNull(enriched?.id ?? base.id ?? rosterEntry?.person?.id),
    name: stringOrNull(enriched?.fullName ?? rosterPerson.fullName ?? base.fullName ?? base.name),
    number: stringOrNull(rosterEntry?.jerseyNumber ?? enriched?.primaryNumber ?? base.primaryNumber),
    bats: stringOrNull(enriched?.batSide?.code ?? base.batSide?.code),
    throws: stringOrNull(enriched?.pitchHand?.code ?? base.pitchHand?.code),
    primaryPosition: {
      abbreviation: stringOrNull(primary.abbreviation),
      name: stringOrNull(primary.name),
      type: stringOrNull(primary.type)
    }
  };
  for (const key of ["firstName", "lastName", "useName", "useLastName", "boxscoreName", "firstLastName", "nameFirstLast", "lastFirstName", "initLastName", "lastInitName", "nameSuffix", "nameTitle", "pronunciation"]) {
    const normalized = stringOrNull(enriched?.[key] ?? rosterPerson[key] ?? base[key]);
    if (normalized !== null) result[key] = normalized;
  }
  return result;
}

function isPitcher(value = {}) {
  const code = String(value.code ?? "").toUpperCase();
  const abbreviation = String(value.abbreviation ?? "").toUpperCase();
  const type = String(value.type ?? "").toLowerCase();
  const name = String(value.name ?? "").toLowerCase();
  return ["1", "S"].includes(code) || ["P", "SP", "RP", "CP", "TWP"].includes(abbreviation)
    || type.includes("pitcher") || type.includes("two-way") || name.includes("pitcher") || name.includes("two-way");
}

function uniqueRoster(payload) {
  const seen = new Set();
  const result = [];
  for (const entry of Array.isArray(payload?.roster) ? payload.roster : []) {
    const id = integerOrNull(entry?.person?.id);
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    result.push(entry);
  }
  return result;
}

function normalizeTotals(group, stat) {
  const keys = group === "hitting"
    ? ["gamesPlayed", "avg", "obp", "slg", "ops", "plateAppearances", "homeRuns", "rbi", "stolenBases"]
    : ["gamesPlayed", "gamesPitched", "gamesStarted", "wins", "losses", "era", "whip", "inningsPitched", "strikeOuts", "baseOnBalls", "saves", "holds"];
  const result = {};
  for (const key of keys) if (own(stat, key)) result[key] = numberOrNull(stat[key]) ?? (stat[key] == null ? null : String(stat[key]));
  return result;
}

function selectScopedStats(rawPerson, groupName, input) {
  const groups = (Array.isArray(rawPerson?.stats) ? rawPerson.stats : []).filter((entry) =>
    String(entry?.group?.displayName ?? "").toLowerCase() === groupName
    && String(entry?.type?.displayName ?? "").toLowerCase() === String(input.statType).toLowerCase());
  if (!groups.length) return { state: "omitted", value: null, reason: "Requested statistic group was not returned." };
  const splits = groups.flatMap((group) => Array.isArray(group.splits) ? group.splits : []);
  const exact = splits.filter((split) => Number(split?.sport?.id) === input.sportId);
  const all = splits.filter((split) => Number(split?.sport?.id) === 0 || String(split?.sport?.code ?? "").toLowerCase() === "all");
  const candidates = exact.length ? exact : all;
  if (candidates.length !== 1) {
    return { state: candidates.length ? "ambiguous" : "omitted", value: null, reason: candidates.length ? "Multiple equally scoped aggregate splits were returned." : "No requested-sport or all-sport aggregate split was returned." };
  }
  const selected = candidates[0];
  return {
    state: "available",
    value: {
      scope: {
        sportId: input.sportId,
        gameTypes: [...input.gameTypes],
        statType: input.statType,
        startDate: input.startDate,
        endDate: input.endDate,
        aggregate: {
          sportId: integerOrNull(selected?.sport?.id),
          code: stringOrNull(selected?.sport?.code),
          selection: exact.length ? "single-unambiguous" : "all"
        }
      },
      totals: normalizeTotals(groupName, selected.stat ?? {})
    },
    reason: exact.length ? "Selected the one exact-sport aggregate split." : "Selected the one explicit all-sport aggregate split."
  };
}

function executionSource(adapter, config, scope, effective, outcome = "success") {
  const input = materializeAdapterInput(adapter, config.input);
  const metadata = config.execution ?? {};
  return createSourceResult({
    id: metadata.sourceResultId ?? `${adapter}.${scope.side ?? "shared"}.${buildSemanticRequestKey(adapter, input)}`,
    adapter,
    request: { key: buildSemanticRequestKey(adapter, input), endpointFamily: adapter, method: "GET", parameters: input },
    scope,
    requestedAtUtc: metadata.requestedAtUtc ?? null,
    retrievedAtUtc: metadata.retrievedAtUtc ?? null,
    effective,
    outcome,
    response: outcome === "notRequested" ? undefined : { status: metadata.responseStatus ?? 200, bodySha256: metadata.bodySha256 ?? null },
    error: metadata.error ?? null
  });
}

function lineage({ id, target, state, source = null, sourcePath = null, fallbackUsed = false, reason = null, transformations = [], coverage = "exact", derivationInputs = [] }) {
  return createLineageRecord({
    id: `lineage.${id}`,
    target,
    coverage,
    state,
    sourceResultRefs: source ? [source.id] : [],
    selectedSourceResultRef: source && ["available", "partial", "present-empty"].includes(state) ? source.id : null,
    sourcePath,
    effective: source?.effective ?? null,
    selectionReason: reason,
    fallbackUsed,
    rejectedCandidates: [],
    transformations,
    derivationInputs
  });
}

function replaceLineage(snapshot, target, record) {
  snapshot.meta.lineage = snapshot.meta.lineage.filter((entry) => !(entry.target === target && entry.coverage === record.coverage));
  snapshot.meta.lineage.push(record);
}

function addSource(snapshot, source) {
  if (snapshot.meta.sourceResults.some((entry) => entry.id === source.id)) throw new ContractRuntimeError("SOURCE_ID_DUPLICATE", `Duplicate source-result ID ${source.id}.`);
  snapshot.meta.sourceResults.push(source);
}

function peopleBundle(config, snapshot) {
  if (!config) return null;
  const input = materializeAdapterInput("people", config.input);
  const people = new Map();
  const failedIds = new Set();
  const units = Array.isArray(config.units) ? config.units : [{ payload: config.payload, outcome: config.outcome ?? "success", personIds: input.personIds }];
  let successes = 0;
  let failures = 0;
  for (const unit of units) {
    if ((unit.outcome ?? "success") === "failed") {
      failures += 1;
      for (const id of unit.personIds ?? []) failedIds.add(Number(id));
      continue;
    }
    successes += 1;
    for (const entry of Array.isArray(unit.payload?.people) ? unit.payload.people : []) if (entry?.id != null) people.set(Number(entry.id), entry);
  }
  const outcome = successes && failures ? "partial" : failures ? "failed" : "success";
  const source = executionSource("people", config, { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey }, {
    kind: "dateRange", startDate: input.startDate, endDate: input.endDate
  }, outcome);
  return { input, people, failedIds, source, outcome };
}

function enrichIdentity(role, rosterEntry, enriched) {
  role.player = person(role.player ?? {}, rosterEntry, enriched);
}

function applyStats(snapshot, sideName, role, target, people) {
  const id = role?.player?.id;
  if (id == null || !people) return;
  const raw = people.people.get(id);
  if (!raw) {
    const state = people.failedIds.has(id) ? "failed" : (people.outcome === "failed" ? "failed" : "omitted");
    const targetSlug = target.replaceAll("/", "-").toLowerCase();
    replaceLineage(snapshot, `${target}/stats`, lineage({
      id: `${sideName}.${targetSlug}.stats`, target: `${target}/stats`, state, source: people.source,
      reason: state === "failed" ? "The independently retryable People unit for this player failed; no totals were fabricated." : "People returned no record for this roster identity."
    }));
    return;
  }
  role.stats = {};
  const targetSlug = target.replaceAll("/", "-").toLowerCase();
  for (const group of ["hitting", "pitching"]) {
    if (!people.input.statGroups.includes(group)) continue;
    const selected = selectScopedStats(raw, group, people.input);
    if (selected.value) role.stats[group] = selected.value;
    replaceLineage(snapshot, `${target}/stats/${group}`, lineage({
      id: `${sideName}.${targetSlug}.stats.${group}`, target: `${target}/stats/${group}`, state: selected.state, source: people.source,
      sourcePath: `/people[id=${id}]/stats[group=${group}]`, reason: selected.reason,
      transformations: selected.value ? ["select-requested-stat-type", "select-unambiguous-sport-aggregate", "preserve-null-without-zero-fill"] : []
    }));
  }
}

function roleFromRoster(entry, enriched, roleLabel = null) {
  const rawPosition = entry?.position ?? entry?.person?.primaryPosition ?? enriched?.primaryPosition ?? {};
  return { player: person(entry?.person ?? {}, entry, enriched), position: position(rawPosition, roleLabel), stats: {} };
}

function depthLabels(payload, rosterIds) {
  const labels = new Map();
  if (!Array.isArray(payload?.roster)) return { usable: false, labels };
  for (const entry of payload.roster) {
    const id = integerOrNull(entry?.person?.id);
    if (id == null || !rosterIds.has(id)) continue;
    const label = String(entry?.position?.abbreviation ?? "").toUpperCase();
    if (label === "SP") labels.set(id, "SP");
    else if (!labels.has(id) && ["P", "RP", "CP"].includes(label)) labels.set(id, label);
  }
  return { usable: [...labels.values()].includes("SP"), labels };
}

function managerCandidate(entry) {
  return {
    person: person(entry?.person ?? {}, { jerseyNumber: entry?.jerseyNumber }, null),
    job: stringOrNull(entry?.job),
    title: stringOrNull(entry?.title),
    jobId: stringOrNull(entry?.jobId)
  };
}

function coachCategory(entry) {
  const text = `${entry?.job ?? ""} ${entry?.title ?? ""}`.toLowerCase();
  if (text.includes("bench")) return "bench";
  if (text.includes("bullpen")) return "bullpen";
  if (text.includes("pitch")) return "pitching";
  if (text.includes("hitting") || text.includes("hit coach")) return "hitting";
  if (text.includes("catch")) return "catching";
  if (text.includes("base")) return "base";
  return text.trim() ? "other" : "unknown";
}

function applyStaff(snapshot, sideName, config) {
  if (!config) return;
  const side = snapshot[sideName];
  const input = materializeAdapterInput("coaches", config.input);
  const outcome = config.outcome ?? "success";
  const source = executionSource("coaches", config, { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey, side: sideName, teamId: input.teamId }, { kind: "date", date: input.date }, outcome);
  addSource(snapshot, source);
  const roster = Array.isArray(config.payload?.roster) ? config.payload.roster : [];
  if (outcome === "failed") {
    side.manager = { state: "failed", candidates: [], selected: null };
    side.coaches = [];
  } else {
    const explicit = roster.filter((entry) => String(entry?.jobId ?? "").toUpperCase() === "MNGR" || /^manager$/i.test(String(entry?.job ?? "")));
    const candidates = explicit.length ? explicit : roster.filter((entry) => /manager/i.test(`${entry?.job ?? ""} ${entry?.title ?? ""}`));
    const normalized = candidates.map(managerCandidate);
    side.manager = { state: normalized.length === 1 ? "available" : normalized.length ? "ambiguous" : "missing", candidates: normalized, selected: normalized.length === 1 ? normalized[0].person : null };
    const managerIds = new Set(candidates.map((entry) => Number(entry?.person?.id)));
    side.coaches = roster.filter((entry) => !managerIds.has(Number(entry?.person?.id))).map((entry) => ({ ...managerCandidate(entry), category: coachCategory(entry) }));
  }
  replaceLineage(snapshot, `/${sideName}/manager`, lineage({
    id: `${sideName}.staff-manager`, target: `/${sideName}/manager`, state: side.manager.state === "missing" ? "omitted" : side.manager.state, source,
    sourcePath: "/roster", reason: side.manager.state === "ambiguous" ? "More than one explicit manager candidate survived deterministic selection." : null,
    transformations: ["prefer-job-id-mngr", "prefer-exact-manager-job", "reject-unsafe-first-candidate-selection"]
  }));
  replaceLineage(snapshot, `/${sideName}/coaches`, lineage({
    id: `${sideName}.coaches`, target: `/${sideName}/coaches`, state: outcome === "failed" ? "failed" : side.coaches.length ? "available" : "present-empty", source,
    sourcePath: "/roster", transformations: ["exclude-manager-candidates", "classify-coach-category"]
  }));
}

function applySide(snapshot, sideName, rosterConfig, depthConfig, people) {
  if (!rosterConfig) throw new ContractRuntimeError("INPUT_REQUIRED", `Build 004.4 requires a dated roster for ${sideName}.`);
  const side = snapshot[sideName];
  const rosterInput = materializeAdapterInput("roster", rosterConfig.input);
  if (Number(side.team.id) !== rosterInput.teamId || rosterInput.date !== snapshot.context.officialDate) {
    throw new ContractRuntimeError("IDENTITY_JOIN_FAILED", `${sideName} roster scope does not match the selected game.`, { rosterInput, teamId: side.team.id, officialDate: snapshot.context.officialDate });
  }
  const rosterSource = executionSource("roster", rosterConfig, { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey, side: sideName, teamId: rosterInput.teamId }, { kind: "date", date: rosterInput.date }, rosterConfig.outcome ?? "success");
  addSource(snapshot, rosterSource);
  const roster = uniqueRoster(rosterConfig.payload);
  const rosterById = new Map(roster.map((entry) => [Number(entry.person.id), entry]));
  const enrichedById = people?.people ?? new Map();

  for (let index = 0; index < side.lineup.slots.length; index += 1) {
    const role = side.lineup.slots[index];
    enrichIdentity(role, rosterById.get(role.player.id), enrichedById.get(role.player.id));
    applyStats(snapshot, sideName, role, `/${sideName}/lineup/slots/${index}`, people);
  }
  if (side.startingPitcher) {
    enrichIdentity(side.startingPitcher, rosterById.get(side.startingPitcher.player.id), enrichedById.get(side.startingPitcher.player.id));
    side.startingPitcher.position.roleLabel = "SP";
    applyStats(snapshot, sideName, side.startingPitcher, `/${sideName}/startingPitcher`, people);
  }

  const lineupIds = new Set(side.lineup.slots.map((slot) => slot.player.id).filter((id) => id != null));
  side.bench = lineupIds.size ? roster.filter((entry) => !lineupIds.has(Number(entry.person.id)) && !isPitcher(entry.position ?? entry.person?.primaryPosition)).map((entry) => roleFromRoster(entry, enrichedById.get(Number(entry.person.id)))) : [];

  const selectedStarterId = side.startingPitcher?.player?.id ?? null;
  const pitcherEntries = roster.filter((entry) => Number(entry.person.id) !== selectedStarterId && isPitcher(entry.position ?? entry.person?.primaryPosition));
  let depthSource = null;
  let classification = { usable: false, labels: new Map() };
  if (depthConfig) {
    const depthInput = materializeAdapterInput("depthChart", depthConfig.input);
    depthSource = executionSource("depthChart", depthConfig, { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey, side: sideName, teamId: depthInput.teamId }, { kind: "current" }, depthConfig.outcome ?? "success");
    addSource(snapshot, depthSource);
    if ((depthConfig.outcome ?? "success") === "success") classification = depthLabels(depthConfig.payload, new Set(rosterById.keys()));
  }
  const additional = classification.usable ? pitcherEntries.filter((entry) => classification.labels.get(Number(entry.person.id)) === "SP") : [];
  const bullpen = classification.usable ? pitcherEntries.filter((entry) => classification.labels.get(Number(entry.person.id)) !== "SP") : pitcherEntries;
  side.additionalStarters = additional.map((entry) => roleFromRoster(entry, enrichedById.get(Number(entry.person.id)), "SP"));
  side.bullpen = bullpen.map((entry) => roleFromRoster(entry, enrichedById.get(Number(entry.person.id)), classification.labels.get(Number(entry.person.id)) ?? "P"));

  const collections = [["bench", side.bench], ["additionalStarters", side.additionalStarters], ["bullpen", side.bullpen]];
  for (const [name, roles] of collections) roles.forEach((role, index) => applyStats(snapshot, sideName, role, `/${sideName}/${name}/${index}`, people));

  replaceLineage(snapshot, `/${sideName}/bench`, lineage({
    id: `${sideName}.bench`, target: `/${sideName}/bench`, state: lineupIds.size ? (side.bench.length ? "available" : "present-empty") : "unposted", source: rosterSource,
    sourcePath: "/roster", reason: lineupIds.size ? "Dated non-pitcher roster members not present in the posted lineup." : "Bench membership is not inferred before any lineup is posted.",
    transformations: ["deduplicate-roster-person-id", "exclude-lineup-members", "exclude-pitchers"]
  }));
  replaceLineage(snapshot, `/${sideName}/additionalStarters`, lineage({
    id: `${sideName}.additional-starters`, target: `/${sideName}/additionalStarters`, state: classification.usable ? (side.additionalStarters.length ? "available" : "present-empty") : (depthConfig ? "omitted" : "not-requested"), source: depthSource,
    sourcePath: depthSource ? "/roster" : null, reason: classification.usable ? "Current SP labels were intersected with dated active-roster pitcher IDs." : "No usable SP annotation set was available; pitcher membership remains with the bullpen fallback.",
    transformations: classification.usable ? ["intersect-dated-roster", "select-sp-labels", "exclude-selected-starter"] : []
  }));
  replaceLineage(snapshot, `/${sideName}/bullpen`, lineage({
    id: `${sideName}.bullpen`, target: `/${sideName}/bullpen`, state: side.bullpen.length ? "available" : "present-empty", source: rosterSource,
    sourcePath: "/roster", fallbackUsed: !classification.usable,
    reason: classification.usable ? "Dated roster pitchers minus selected starter and SP-annotated additional starters." : "Authoritative fallback: dated roster pitchers minus selected starter.",
    transformations: classification.usable ? ["deduplicate-roster-person-id", "exclude-selected-starter", "exclude-sp-annotated-additional-starters"] : ["deduplicate-roster-person-id", "exclude-selected-starter"]
  }));
}

export function normalizeRosterPeopleStaffSnapshot(scheduleSnapshot, sources, execution = {}) {
  const snapshot = clone(scheduleSnapshot);
  const people = peopleBundle(sources?.people, snapshot);
  if (people) addSource(snapshot, people.source);
  for (const sideName of ["away", "home"]) {
    applySide(snapshot, sideName, sources?.roster?.[sideName], sources?.depthChart?.[sideName], people);
    applyStaff(snapshot, sideName, sources?.coaches?.[sideName]);
  }
  snapshot.meta.snapshot = {
    ...snapshot.meta.snapshot,
    id: execution.snapshotId ?? `${snapshot.meta.snapshot.id}-roster-people-staff`,
    createdAtUtc: execution.createdAtUtc ?? snapshot.meta.snapshot.createdAtUtc,
    producer: { applicationVersion: execution.applicationVersion ?? "0.3.0", build: execution.build ?? "004.4" },
    fixtureKind: execution.fixtureKind ?? snapshot.meta.snapshot.fixtureKind
  };
  return assertValidNormalizedSnapshot(snapshot, {
    requiredTargets: ["/away/bench", "/away/bullpen", "/away/additionalStarters", "/home/bench", "/home/bullpen", "/home/additionalStarters"]
  });
}
