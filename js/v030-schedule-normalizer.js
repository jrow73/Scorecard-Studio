/**
 * Scorecard Studio v0.3.0 Schedule -> normalized schema-v2 projection.
 *
 * Build 004.3 is intentionally not connected to app.js. It accepts an already
 * retrieved Schedule payload and deterministic execution metadata.
 */

import {
  ContractRuntimeError,
  createLineageRecord,
  createNormalizedSnapshot,
  createSourceResult
} from "./v030-contract.js?v=030b0054";
import { buildSemanticRequestKey, materializeAdapterInput } from "./v030-adapters.js?v=030b0054";

const own = (value, key) => Object.prototype.hasOwnProperty.call(Object(value), key);

function integerOrNull(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function stringOrNull(value) {
  return typeof value === "string" && value.length ? value : null;
}

function idName(value) {
  return { id: integerOrNull(value?.id), name: stringOrNull(value?.name) };
}

function normalizeCompetitionSegment(gameType) {
  return ({ S: "spring", R: "regular", F: "wildCard", D: "divisionSeries", L: "leagueChampionship", W: "worldSeries" })[gameType] ?? (gameType ? "other" : "unknown");
}

function normalizeCanonicalStatus(status = {}) {
  const detailed = String(status.detailedState ?? "").toLowerCase();
  const coded = String(status.codedGameState ?? "").toUpperCase();
  const statusCode = String(status.statusCode ?? "").toUpperCase();
  if (detailed.includes("cancel") || coded === "C" || statusCode.startsWith("C")) return "cancelled";
  if (detailed.includes("postpon") || coded === "D" || statusCode.startsWith("D")) return "postponed";
  if (detailed.includes("suspend")) return "suspended";
  if (detailed.includes("delay")) return "delayed";
  if (detailed === "final" || detailed.includes("completed early") || coded === "F" || statusCode === "F") return "final";
  if (detailed.includes("in progress") || detailed.includes("live") || ["I", "M", "N"].includes(coded)) return "live";
  if (detailed.includes("pre-game") || detailed.includes("pregame") || detailed.includes("warmup") || coded === "P") return "pregame";
  if (detailed.includes("scheduled") || coded === "S") return "scheduled";
  return "unknown";
}

function rawStatus(status = {}) {
  const output = {};
  for (const key of ["abstractGameState", "codedGameState", "detailedState", "statusCode", "abstractGameCode"]) {
    if (typeof status[key] === "string") output[key] = status[key];
  }
  return output;
}

function normalizeDayNight(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "day" || normalized === "night") return normalized;
  return value == null ? null : "unknown";
}

function normalizeDates(game, canonicalStatus) {
  const status = game.status ?? {};
  const originalScheduledStart = stringOrNull(game.gameDate);
  const rescheduledStart = stringOrNull(game.rescheduleDate);
  const resumeStart = stringOrNull(game.resumeDate);
  const activeTbd = status.startTimeTBD === true && ["scheduled", "pregame", "unknown"].includes(canonicalStatus);
  return {
    scheduledStart: activeTbd ? null : (rescheduledStart ?? originalScheduledStart),
    originalScheduledStart,
    officialDate: stringOrNull(game.officialDate),
    rescheduledStart,
    rescheduledDate: stringOrNull(game.rescheduleGameDate),
    resumeStart,
    resumeDate: stringOrNull(game.resumeGameDate)
  };
}

function emptyStandings() {
  return {
    divisionRank: { raw: null, value: null },
    leagueRank: { raw: null, value: null },
    wildCardRank: { raw: null, value: null },
    divisionGamesBack: { raw: null, state: "unknown", games: null },
    leagueGamesBack: { raw: null, state: "unknown", games: null },
    wildCardGamesBack: { raw: null, state: "unknown", games: null },
    streak: null,
    lastTen: { wins: null, losses: null },
    elimination: { raw: null, state: "unknown", value: null },
    clinch: { raw: null, state: "unknown", value: null }
  };
}

function normalizeRecord(side) {
  const record = side?.leagueRecord;
  return {
    gamesPlayed: record ? (numberOrNull(record.wins) ?? 0) + (numberOrNull(record.losses) ?? 0) + (numberOrNull(record.ties) ?? 0) : null,
    wins: numberOrNull(record?.wins),
    losses: numberOrNull(record?.losses),
    pct: numberOrNull(record?.pct)
  };
}

function normalizeTeam(side, fallbackSport) {
  const team = side?.team ?? {};
  return {
    id: integerOrNull(team.id),
    name: stringOrNull(team.name),
    locationName: stringOrNull(team.locationName),
    shortName: stringOrNull(team.shortName),
    clubName: stringOrNull(team.clubName ?? team.teamName),
    abbreviation: stringOrNull(team.abbreviation),
    sport: idName(team.sport ?? fallbackSport),
    league: idName(team.league),
    division: idName(team.division),
    record: normalizeRecord(side),
    gameNumber: null,
    standings: emptyStandings(),
    logo: { url: null, brandScope: null }
  };
}

function normalizePerson(value = {}) {
  const result = {
    id: integerOrNull(value.id),
    name: stringOrNull(value.fullName ?? value.name),
    number: stringOrNull(value.primaryNumber),
    bats: stringOrNull(value.batSide?.code ?? value.bats),
    throws: stringOrNull(value.pitchHand?.code ?? value.throws),
    primaryPosition: {
      abbreviation: stringOrNull(value.primaryPosition?.abbreviation),
      name: stringOrNull(value.primaryPosition?.name),
      type: stringOrNull(value.primaryPosition?.type)
    }
  };
  for (const key of ["firstName", "lastName", "useName", "useLastName", "boxscoreName", "firstLastName", "nameFirstLast", "lastFirstName", "initLastName", "lastInitName", "nameSuffix", "nameTitle", "pronunciation"]) {
    const normalized = stringOrNull(value[key]);
    if (normalized !== null) result[key] = normalized;
  }
  return result;
}

function normalizePosition(person, starter = false) {
  if (starter) return { abbreviation: "P", name: "Pitcher", number: 1, roleLabel: "probable-starter" };
  return {
    abbreviation: stringOrNull(person?.primaryPosition?.abbreviation),
    name: stringOrNull(person?.primaryPosition?.name),
    number: integerOrNull(person?.primaryPosition?.code),
    roleLabel: "schedule-primary-position"
  };
}

function normalizeProbablePitcher(value) {
  if (!value || value.id == null) return null;
  return { player: normalizePerson(value), position: normalizePosition(value, true), stats: {} };
}

function normalizeLineup(game, side) {
  const lineupsPresent = own(game, "lineups") && game.lineups && own(game.lineups, `${side}Players`);
  const raw = lineupsPresent && Array.isArray(game.lineups[`${side}Players`]) ? game.lineups[`${side}Players`] : [];
  const slots = raw.map((player, index) => ({
    battingOrder: index + 1,
    slotState: "available",
    player: normalizePerson(player),
    position: normalizePosition(player),
    stats: {}
  }));
  return {
    lineup: { state: slots.length >= 9 ? "posted" : slots.length ? "partial" : "notPosted", slots },
    availability: slots.length ? (slots.length >= 9 ? "available" : "partial") : (lineupsPresent ? "present-empty" : "unposted"),
    sourcePresent: lineupsPresent
  };
}

function normalizeVenue(value = {}) {
  return {
    id: integerOrNull(value.id),
    name: stringOrNull(value.name),
    location: { city: null, state: null, country: null },
    timeZone: { iana: null },
    fieldInfo: { capacity: null, turfType: null, roofType: null, dimensions: {} }
  };
}

function normalizeWeather(value) {
  return {
    temperature: numberOrNull(value?.temp ?? value?.temperature),
    condition: stringOrNull(value?.condition),
    wind: stringOrNull(value?.wind)
  };
}

function sideSkeleton(game, sideName, fallbackSport) {
  const sourceSide = game.teams?.[sideName] ?? {};
  const lineup = normalizeLineup(game, sideName);
  return {
    value: {
      team: normalizeTeam(sourceSide, fallbackSport),
      manager: { state: "notRequested", candidates: [], selected: null },
      coaches: [],
      lineup: lineup.lineup,
      startingPitcher: normalizeProbablePitcher(sourceSide.probablePitcher),
      additionalStarters: [],
      bench: [],
      bullpen: [],
      defense: {}
    },
    lineup,
    sourceSide
  };
}

function flattenViews(payload) {
  const output = [];
  const dates = Array.isArray(payload?.dates) ? payload.dates : [];
  dates.forEach((dateEntry, dateIndex) => {
    const games = Array.isArray(dateEntry?.games) ? dateEntry.games : [];
    games.forEach((game, gameIndex) => output.push({ game, dateEntry, dateIndex, gameIndex, bucketDate: stringOrNull(dateEntry.date) }));
  });
  return output;
}

function viewSummary(view) {
  return {
    gamePk: String(view.game?.gamePk ?? ""),
    bucketDate: view.bucketDate,
    officialDate: stringOrNull(view.game?.officialDate),
    gameNumber: integerOrNull(view.game?.gameNumber),
    detailedState: stringOrNull(view.game?.status?.detailedState),
    dateIndex: view.dateIndex,
    gameIndex: view.gameIndex
  };
}

export function selectScheduleView(payload, suppliedSelection) {
  const selection = materializeAdapterInput("schedule", suppliedSelection ?? {});
  let candidates = flattenViews(payload).filter((view) => String(view.game?.gamePk ?? "") === selection.gamePk);
  if (!candidates.length) {
    throw new ContractRuntimeError("MATCHING_VIEW_MISSING", `Schedule response has no view for gamePk ${selection.gamePk}.`, { selection });
  }

  const selectedDateMatches = candidates.filter((view) => view.bucketDate === selection.selectedDate);
  if (!selectedDateMatches.length) {
    throw new ContractRuntimeError("MATCHING_VIEW_MISSING", `Schedule response has no ${selection.gamePk} view in selected date bucket ${selection.selectedDate}.`, {
      selection,
      candidates: candidates.map(viewSummary)
    });
  }
  candidates = selectedDateMatches;

  if (candidates.length !== 1) {
    throw new ContractRuntimeError("SELECTION_AMBIGUOUS", `Schedule response has ${candidates.length} eligible views for gamePk ${selection.gamePk}.`, {
      selection,
      candidates: candidates.map(viewSummary)
    });
  }
  const selected = candidates[0];
  const gameNumber = integerOrNull(selected.game.gameNumber) ?? 1;
  const viewDate = selected.bucketDate ?? stringOrNull(selected.game.officialDate) ?? selection.selectedDate;
  return { ...selected, selection, selectedViewKey: `${selection.gamePk}:${viewDate}:${gameNumber}` };
}

function lineageRecord({ id, target, state, sourceResult, sourcePath = null, coverage = "subtree", selected = true, reason = null, transformations = [] }) {
  return createLineageRecord({
    id: `lineage.${id}`,
    target,
    coverage,
    state,
    sourceResultRefs: sourceResult ? [sourceResult.id] : [],
    selectedSourceResultRef: selected && sourceResult ? sourceResult.id : null,
    sourcePath,
    effective: sourceResult?.effective ?? null,
    selectionReason: reason,
    fallbackUsed: false,
    rejectedCandidates: [],
    transformations,
    derivationInputs: []
  });
}

function sideLineage(sideName, normalized, sourceResult, sourceBase) {
  const records = [
    lineageRecord({ id: `${sideName}.team`, target: `/${sideName}/team`, state: "available", sourceResult, sourcePath: `${sourceBase}/teams/${sideName}/team` }),
    lineageRecord({ id: `${sideName}.record`, target: `/${sideName}/team/record`, coverage: "exact", state: normalized.sourceSide.leagueRecord ? "available" : "omitted", sourceResult, sourcePath: `${sourceBase}/teams/${sideName}/leagueRecord`, selected: Boolean(normalized.sourceSide.leagueRecord) }),
    lineageRecord({ id: `${sideName}.team-game-number`, target: `/${sideName}/team/gameNumber`, coverage: "exact", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: `${sideName}.team-standings`, target: `/${sideName}/team/standings`, coverage: "subtree", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: `${sideName}.team-logo`, target: `/${sideName}/team/logo`, coverage: "subtree", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: `${sideName}.manager`, target: `/${sideName}/manager`, state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: `${sideName}.coaches`, target: `/${sideName}/coaches`, coverage: "exact", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({
      id: `${sideName}.lineup`, target: `/${sideName}/lineup`, state: normalized.lineup.availability, sourceResult,
      sourcePath: `${sourceBase}/lineups/${sideName}Players`, selected: ["available", "partial"].includes(normalized.lineup.availability),
      reason: normalized.lineup.availability === "unposted" ? "Schedule did not publish the lineup path." : normalized.lineup.availability === "present-empty" ? "Schedule published an empty lineup array." : "Schedule lineup order is preserved.",
      transformations: normalized.lineup.lineup.slots.length ? ["preserve-source-order", "assign-one-based-batting-order", "mark-primary-position-projection"] : []
    }),
    lineageRecord({
      id: `${sideName}.starter`, target: `/${sideName}/startingPitcher`, state: normalized.value.startingPitcher ? "available" : "omitted", sourceResult,
      sourcePath: `${sourceBase}/teams/${sideName}/probablePitcher`, selected: Boolean(normalized.value.startingPitcher),
      transformations: normalized.value.startingPitcher ? ["normalize-probable-pitcher"] : []
    }),
    lineageRecord({ id: `${sideName}.additional-starters`, target: `/${sideName}/additionalStarters`, coverage: "exact", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: `${sideName}.bench`, target: `/${sideName}/bench`, coverage: "exact", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: `${sideName}.bullpen`, target: `/${sideName}/bullpen`, coverage: "exact", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: `${sideName}.defense`, target: `/${sideName}/defense`, coverage: "exact", state: "not-requested", sourceResult: null, selected: false })
  ];
  if (normalized.value.startingPitcher) records.push(lineageRecord({ id: `${sideName}.starter-stats`, target: `/${sideName}/startingPitcher/stats`, coverage: "exact", state: "not-requested", sourceResult: null, selected: false }));
  normalized.lineup.lineup.slots.forEach((slot, index) => records.push(lineageRecord({
    id: `${sideName}.lineup-${index}-stats`, target: `/${sideName}/lineup/slots/${index}/stats`, coverage: "exact", state: "not-requested", sourceResult: null, selected: false
  })));
  return records;
}

export function normalizeScheduleSnapshot(payload, suppliedSelection, execution) {
  const metadata = execution ?? {};
  const selected = selectScheduleView(payload, suppliedSelection);
  const game = selected.game;
  const statusSource = game.status ?? {};
  const canonicalStatus = normalizeCanonicalStatus(statusSource);
  const sport = game.sport ?? game.teams?.away?.team?.sport ?? { id: selected.selection.sportId, name: null };
  const season = integerOrNull(game.season) ?? integerOrNull(String(game.officialDate ?? "").slice(0, 4));
  if (season == null || !game.officialDate) throw new ContractRuntimeError("SOURCE_SHAPE_INVALID", "Selected Schedule view lacks season or officialDate.", { view: viewSummary(selected) });

  const away = sideSkeleton(game, "away", sport);
  const home = sideSkeleton(game, "home", sport);
  const teamsTBD = statusSource.teamsTBD === true || game.teams?.away?.team?.placeholder === true || game.teams?.home?.team?.placeholder === true;
  const requestKey = buildSemanticRequestKey("schedule", selected.selection);
  const sourceBase = `/dates/${selected.dateIndex}/games/${selected.gameIndex}`;
  const sourceResult = createSourceResult({
    id: `schedule.${selected.selection.gamePk}.${selected.dateIndex}.${selected.gameIndex}`,
    adapter: "schedule",
    request: { key: requestKey, endpointFamily: "schedule", method: "GET", parameters: selected.selection },
    scope: { gamePk: selected.selection.gamePk, selectedViewKey: selected.selectedViewKey },
    requestedAtUtc: metadata.requestedAtUtc ?? null,
    retrievedAtUtc: metadata.retrievedAtUtc ?? null,
    effective: { kind: "gameState", gamePk: selected.selection.gamePk, canonicalGameState: canonicalStatus, rawGameState: statusSource.detailedState ?? "Unknown" },
    outcome: "success",
    response: { status: metadata.responseStatus ?? 200, bodySha256: metadata.bodySha256 ?? null },
    error: null
  });

  const normalizedGame = {
    status: {
      canonical: canonicalStatus,
      raw: rawStatus(statusSource),
      reason: stringOrNull(statusSource.reason),
      startTimeTBD: statusSource.startTimeTBD === true,
      teamsTBD
    },
    dates: normalizeDates(game, canonicalStatus),
    dayNight: normalizeDayNight(game.dayNight),
    gameNumber: integerOrNull(game.gameNumber),
    venue: normalizeVenue(game.venue),
    weather: normalizeWeather(game.weather),
    umpires: { crew: [] }
  };

  const lineage = [
    lineageRecord({ id: "context", target: "/context", state: "available", sourceResult, sourcePath: sourceBase, transformations: ["select-schedule-view", "normalize-competition-segment"] }),
    lineageRecord({ id: "game", target: "/game", state: "available", sourceResult, sourcePath: sourceBase, transformations: ["normalize-status", "separate-game-dates", "suppress-active-tbd-placeholder-time"] }),
    lineageRecord({ id: "venue-extended", target: "/game/venue/location", coverage: "subtree", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: "venue-time-zone", target: "/game/venue/timeZone", coverage: "subtree", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: "venue-field-info", target: "/game/venue/fieldInfo", coverage: "subtree", state: "not-requested", sourceResult: null, selected: false }),
    lineageRecord({ id: "weather", target: "/game/weather", coverage: "subtree", state: game.weather ? "available" : "omitted", sourceResult, sourcePath: `${sourceBase}/weather`, selected: Boolean(game.weather) }),
    lineageRecord({ id: "umpires", target: "/game/umpires", coverage: "subtree", state: "not-requested", sourceResult: null, selected: false }),
    ...sideLineage("away", away, sourceResult, sourceBase),
    ...sideLineage("home", home, sourceResult, sourceBase),
    lineageRecord({ id: "standings", target: "/standings", coverage: "subtree", state: "not-requested", sourceResult: null, selected: false })
  ];

  return createNormalizedSnapshot({
    context: {
      gamePk: selected.selection.gamePk,
      season,
      sport: idName(sport),
      gameType: stringOrNull(game.gameType) ?? "unknown",
      competitionSegment: normalizeCompetitionSegment(game.gameType),
      selectedDate: selected.selection.selectedDate,
      officialDate: game.officialDate,
      selectedViewKey: selected.selectedViewKey
    },
    game: normalizedGame,
    away: away.value,
    home: home.value,
    standings: { groups: [] },
    meta: {
      snapshot: {
        id: metadata.snapshotId ?? `schedule-${selected.selectedViewKey}`,
        createdAtUtc: metadata.createdAtUtc ?? metadata.retrievedAtUtc,
        producer: { applicationVersion: metadata.applicationVersion ?? "0.3.0", build: metadata.build ?? "004.3" },
        fixtureKind: metadata.fixtureKind ?? null
      },
      sourceResults: [sourceResult],
      lineage
    }
  }, {
    requiredTargets: ["/context", "/game/status", "/away/team/name", "/away/lineup", "/home/team/name", "/home/lineup", "/standings/groups"]
  });
}
