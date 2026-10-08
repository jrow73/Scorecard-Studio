/**
 * Scorecard Studio v0.3.0 standings, officials, venue-detail, and Game 2 overlay.
 *
 * Build 004.5 is side-effect free. It accepts a schema-v2 snapshot and
 * already-retrieved payloads; it performs no HTTP, storage, or UI work.
 */

import {
  ContractRuntimeError,
  assertValidNormalizedSnapshot,
  createLineageRecord,
  createSourceResult,
  findEffectiveLineage
} from "./v030-contract.js?v=030b0054";
import { buildSemanticRequestKey, materializeAdapterInput } from "./v030-adapters.js?v=030b0054";

const clone = (value) => structuredClone(value);
const own = (value, key) => Object.prototype.hasOwnProperty.call(Object(value), key);

function integerOrNull(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "" || /^[-.]+$/.test(String(value))) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function stringOrNull(value) {
  return typeof value === "string" && value.length ? value : null;
}

function idName(value = {}) {
  return { id: integerOrNull(value.id), name: stringOrNull(value.name) };
}

function sourceResult(adapter, config, scope, effective, outcome = "success") {
  const input = materializeAdapterInput(adapter, config.input);
  const metadata = config.execution ?? {};
  return createSourceResult({
    id: metadata.sourceResultId ?? `${adapter}.${buildSemanticRequestKey(adapter, input)}`,
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

function addSource(snapshot, source) {
  if (snapshot.meta.sourceResults.some((entry) => entry.id === source.id)) throw new ContractRuntimeError("SOURCE_ID_DUPLICATE", `Duplicate source-result ID ${source.id}.`);
  snapshot.meta.sourceResults.push(source);
}

function lineage({ id, target, state, sources = [], selected = null, sourcePath = null, effective = null, reason = null, fallbackUsed = false, rejectedCandidates = [], transformations = [], derivationInputs = [], coverage = "exact" }) {
  return createLineageRecord({
    id: `lineage.${id}`,
    target,
    coverage,
    state,
    sourceResultRefs: sources.map((entry) => entry.id),
    selectedSourceResultRef: selected?.id ?? null,
    sourcePath,
    effective: effective ?? selected?.effective ?? null,
    selectionReason: reason,
    fallbackUsed,
    rejectedCandidates,
    transformations,
    derivationInputs
  });
}

function replaceLineage(snapshot, record) {
  snapshot.meta.lineage = snapshot.meta.lineage.filter((entry) => !(entry.target === record.target && entry.coverage === record.coverage));
  snapshot.meta.lineage.push(record);
}

function rank(raw) {
  const text = raw === null || raw === undefined || raw === "" ? null : String(raw);
  return { raw: text, value: /^\d+$/.test(text ?? "") ? Number(text) : null };
}

function gamesBack(raw) {
  const text = raw === null || raw === undefined || raw === "" ? null : String(raw);
  if (text === "-") return { raw: text, state: "leader", games: null };
  const games = numberOrNull(text);
  if (games == null) return { raw: text, state: text == null ? "notApplicable" : "unknown", games: null };
  return { raw: text, state: text.startsWith("+") || games < 0 ? "ahead" : games === 0 ? "leader" : "behind", games: Math.abs(games) };
}

function elimination(raw) {
  const text = raw === null || raw === undefined || raw === "" ? null : String(raw);
  if (text === "-") return { raw: text, state: "notEliminated", value: null };
  if (text?.toUpperCase() === "E") return { raw: text, state: "eliminated", value: null };
  const value = numberOrNull(text);
  return { raw: text, state: value == null ? (text == null ? "unknown" : "unknown") : "remaining", value };
}

function clinch(raw) {
  const text = raw === null || raw === undefined || raw === "" ? null : String(raw);
  const state = ({ w: "wildCard", x: "postseason", y: "division", z: "bestRecord" })[String(text ?? "").toLowerCase()] ?? (text == null ? "none" : "unknown");
  return { raw: text, state, value: null };
}

function lastTen(row) {
  const split = (Array.isArray(row?.records?.splitRecords) ? row.records.splitRecords : []).find((entry) => entry?.type === "lastTen" || /last ten/i.test(String(entry?.description ?? "")));
  return { wins: integerOrNull(split?.wins), losses: integerOrNull(split?.losses) };
}

function teamRecord(row) {
  const record = row?.leagueRecord ?? row?.record ?? {};
  const wins = integerOrNull(record.wins);
  const losses = integerOrNull(record.losses);
  return {
    gamesPlayed: integerOrNull(row?.gamesPlayed) ?? (wins != null && losses != null ? wins + losses : null),
    wins,
    losses,
    pct: numberOrNull(record.pct ?? row?.winningPercentage)
  };
}

function normalizedStandings(row) {
  return {
    divisionRank: rank(row?.divisionRank),
    leagueRank: rank(row?.leagueRank),
    wildCardRank: rank(row?.wildCardRank),
    divisionGamesBack: gamesBack(row?.divisionGamesBack ?? row?.gamesBack),
    leagueGamesBack: gamesBack(row?.leagueGamesBack),
    wildCardGamesBack: gamesBack(row?.wildCardGamesBack),
    streak: stringOrNull(row?.streak?.streakCode ?? row?.streak?.code),
    lastTen: lastTen(row),
    elimination: elimination(row?.eliminationNumber),
    clinch: clinch(row?.clinchIndicator)
  };
}

function normalizeStandingsGroup(record, standingsType, sourceOrder) {
  return {
    key: `${standingsType}:${record?.sport?.id ?? "none"}:${record?.league?.id ?? "none"}:${record?.division?.id ?? "none"}`,
    standingsType,
    sport: idName(record?.sport),
    league: idName(record?.league),
    division: idName(record?.division),
    rows: (Array.isArray(record?.teamRecords) ? record.teamRecords : []).map((row, rowIndex) => ({
      team: idName(row?.team),
      record: teamRecord(row),
      rank: rank(row?.divisionRank ?? row?.leagueRank ?? row?.wildCardRank),
      gamesBack: gamesBack(row?.divisionGamesBack ?? row?.gamesBack ?? row?.leagueGamesBack ?? row?.wildCardGamesBack),
      streak: stringOrNull(row?.streak?.streakCode ?? row?.streak?.code),
      lastTen: lastTen(row),
      elimination: elimination(row?.eliminationNumber),
      clinch: clinch(row?.clinchIndicator),
      sourceOrder: sourceOrder + rowIndex
    }))
  };
}

function selectTeamStanding(candidates, side) {
  if (!candidates.length) return { state: "omitted", row: null };
  const divisionMatches = candidates.filter((entry) => side.team.division.id != null && Number(entry.record?.division?.id) === Number(side.team.division.id));
  const eligible = divisionMatches.length ? divisionMatches : candidates;
  return eligible.length === 1 ? { state: "available", row: eligible[0].row } : { state: "ambiguous", row: null };
}

function applyStandings(snapshot, configs) {
  const list = !configs ? [] : Array.isArray(configs) ? configs : [configs];
  if (!list.length) return [];
  const sources = [];
  const groups = [];
  const candidatesByTeam = new Map();
  let sourceOrder = 0;
  for (const config of list) {
    const input = materializeAdapterInput("standings", config.input);
    if (input.sportId !== snapshot.context.sport.id || input.season !== snapshot.context.season) {
      throw new ContractRuntimeError("IDENTITY_JOIN_FAILED", "Standings sport/season scope does not match the selected game.", { input, context: snapshot.context });
    }
    const source = sourceResult("standings", config, { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey, standingsType: input.standingsType, leagueIds: input.leagueIds }, { kind: "endOfDay", cutoffDate: input.cutoffDate }, config.outcome ?? "success");
    addSource(snapshot, source);
    sources.push(source);
    if ((config.outcome ?? "success") !== "success") continue;
    for (const record of Array.isArray(config.payload?.records) ? config.payload.records : []) {
      const group = normalizeStandingsGroup(record, record?.standingsType ?? input.standingsType, sourceOrder);
      groups.push(group);
      sourceOrder += group.rows.length;
      for (const row of Array.isArray(record?.teamRecords) ? record.teamRecords : []) {
        const id = integerOrNull(row?.team?.id);
        if (id == null) continue;
        if (!candidatesByTeam.has(id)) candidatesByTeam.set(id, []);
        candidatesByTeam.get(id).push({ row, record, source });
      }
    }
  }
  snapshot.standings.groups = groups;
  replaceLineage(snapshot, lineage({
    id: "standings.groups", target: "/standings/groups", state: groups.length ? "available" : "present-empty", sources, selected: sources.length === 1 ? sources[0] : null,
    effective: sources.length === 1 ? sources[0].effective : null, sourcePath: "/records",
    reason: "Preserve only source-returned standings groups under their explicit request scope.", transformations: ["preserve-source-groups", "type-rank-games-back-and-marker-tokens"]
  }));

  for (const sideName of ["away", "home"]) {
    const side = snapshot[sideName];
    const candidates = candidatesByTeam.get(Number(side.team.id)) ?? [];
    const selected = selectTeamStanding(candidates, side);
    if (selected.row) {
      side.team.record = teamRecord(selected.row);
      side.team.standings = normalizedStandings(selected.row);
      side.team.gameNumber = side.team.record.gamesPlayed == null ? null : side.team.record.gamesPlayed + Math.max(1, snapshot.game.gameNumber ?? 1);
    }
    const selectedCandidate = candidates.find((entry) => entry.row === selected.row);
    replaceLineage(snapshot, lineage({
      id: `${sideName}.standings`, target: `/${sideName}/team/standings`, state: selected.state, sources: [...new Set(candidates.map((entry) => entry.source))], selected: selectedCandidate?.source ?? null,
      sourcePath: selected.row ? "/records/*/teamRecords/*" : null, effective: selectedCandidate?.source?.effective ?? null,
      reason: selected.state === "ambiguous" ? "Multiple equally scoped returned groups contain this team." : "Selected the returned team row in the explicit standings scope.",
      transformations: ["match-team-id", "prefer-team-division-group", "type-rank-games-back-and-marker-tokens"]
    }));
    replaceLineage(snapshot, lineage({
      id: `${sideName}.pregame-record`, target: `/${sideName}/team/record`, state: selected.state, sources: [...new Set(candidates.map((entry) => entry.source))], selected: selectedCandidate?.source ?? null,
      sourcePath: selected.row ? "/records/*/teamRecords/*/leagueRecord" : null, effective: selectedCandidate?.source?.effective ?? null,
      reason: "The explicitly scoped standings team row supplies the ordinary pregame record.", transformations: ["normalize-team-record"]
    }));
    replaceLineage(snapshot, lineage({
      id: `${sideName}.game-number`, target: `/${sideName}/team/gameNumber`, state: side.team.gameNumber == null ? "omitted" : "available", sources: selectedCandidate ? [selectedCandidate.source] : [], selected: selectedCandidate?.source ?? null,
      effective: selectedCandidate?.source?.effective ?? null, reason: "Derived from prior-cutoff games played plus the selected within-day game number.", transformations: ["derive-selected-team-game-number"], derivationInputs: [`/${sideName}/team/record/gamesPlayed`, "/game/gameNumber"]
    }));
  }
  return sources;
}

function feedVenue(payload) {
  return payload?.gameData?.venue ?? null;
}

function venuePayload(config) {
  if (!config) return null;
  if (Array.isArray(config.payload?.venues)) return config.payload.venues[0] ?? null;
  return config.payload?.venue ?? config.payload ?? null;
}

function normalizedVenueDetail(raw = {}) {
  const field = raw.fieldInfo ?? {};
  const dimensions = {};
  for (const [key, value] of Object.entries(field)) if (!["capacity", "turfType", "roofType"].includes(key)) dimensions[key] = value;
  return {
    location: { city: stringOrNull(raw.location?.city), state: stringOrNull(raw.location?.stateAbbrev ?? raw.location?.state), country: stringOrNull(raw.location?.country) },
    timeZone: { iana: stringOrNull(raw.timeZone?.id) },
    fieldInfo: { capacity: integerOrNull(field.capacity), turfType: stringOrNull(field.turfType), roofType: stringOrNull(field.roofType), dimensions }
  };
}

function hasVenueDetail(raw) {
  const value = normalizedVenueDetail(raw ?? {});
  return Object.values(value.location).some((entry) => entry != null) || value.timeZone.iana != null || value.fieldInfo.capacity != null
    || value.fieldInfo.turfType != null || value.fieldInfo.roofType != null || Object.keys(value.fieldInfo.dimensions).length > 0;
}

function applyFeedAndVenue(snapshot, feedConfig, venueConfig) {
  let feedSource = null;
  let feedDetail = null;
  if (feedConfig) {
    const input = materializeAdapterInput("feed", feedConfig.input);
    if (input.gamePk !== String(snapshot.context.gamePk) || String(feedConfig.payload?.gamePk ?? input.gamePk) !== String(snapshot.context.gamePk)) {
      throw new ContractRuntimeError("IDENTITY_JOIN_FAILED", "Feed gamePk does not match the selected game.");
    }
    feedSource = sourceResult("feed", feedConfig, { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey }, {
      kind: "gameState", gamePk: String(snapshot.context.gamePk), canonicalGameState: snapshot.game.status.canonical, rawGameState: snapshot.game.status.raw.detailedState ?? "Unknown"
    }, feedConfig.outcome ?? "success");
    addSource(snapshot, feedSource);
    const officialsPresent = own(feedConfig.payload?.liveData?.boxscore ?? {}, "officials");
    const officials = officialsPresent && Array.isArray(feedConfig.payload.liveData.boxscore.officials) ? feedConfig.payload.liveData.boxscore.officials : [];
    snapshot.game.umpires.crew = officials.map((entry) => ({ id: integerOrNull(entry?.official?.id), name: stringOrNull(entry?.official?.fullName), role: stringOrNull(entry?.officialType) }));
    const outcome = feedConfig.outcome ?? "success";
    const officialState = outcome === "failed" ? "failed" : !officialsPresent ? "omitted" : officials.length ? "available" : "present-empty";
    replaceLineage(snapshot, lineage({
      id: "officials.crew", target: "/game/umpires/crew", state: officialState, sources: [feedSource], selected: ["available", "present-empty"].includes(officialState) ? feedSource : null,
      sourcePath: "/liveData/boxscore/officials", reason: "Preserve every returned official and source role in source order.", transformations: officials.length ? ["preserve-source-order", "preserve-variable-crew-cardinality"] : []
    }));
    feedDetail = (feedConfig.outcome ?? "success") === "success" ? feedVenue(feedConfig.payload) : null;
  }

  let venueSource = null;
  let narrowDetail = null;
  if (venueConfig) {
    const input = materializeAdapterInput("venue", venueConfig.input);
    if (input.venueId !== snapshot.game.venue.id || input.season !== snapshot.context.season) {
      throw new ContractRuntimeError("IDENTITY_JOIN_FAILED", "Venue ID/season scope does not match the selected game.", { input, venue: snapshot.game.venue, season: snapshot.context.season });
    }
    venueSource = sourceResult("venue", venueConfig, { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey, venueId: input.venueId, season: input.season }, { kind: "date", date: snapshot.context.officialDate }, venueConfig.outcome ?? "success");
    addSource(snapshot, venueSource);
    narrowDetail = (venueConfig.outcome ?? "success") === "success" ? venuePayload(venueConfig) : null;
  }

  const feedUsable = hasVenueDetail(feedDetail);
  const venueUsable = hasVenueDetail(narrowDetail);
  const selected = feedUsable ? feedSource : venueUsable ? venueSource : null;
  const raw = feedUsable ? feedDetail : venueUsable ? narrowDetail : null;
  if (raw) Object.assign(snapshot.game.venue, normalizedVenueDetail(raw));
  const allSources = [feedSource, venueSource].filter(Boolean);
  const rejected = selected && allSources.length > 1 ? allSources.filter((entry) => entry !== selected).map((entry) => ({ sourceResultRef: entry.id, reason: selected === feedSource ? "Already-loaded Feed detail is accepted, so the equivalent narrow Venue candidate is not selected." : "Feed did not provide usable extended venue detail." })) : [];
  for (const [suffix, sourcePath] of [["location", "/location"], ["timeZone", "/timeZone"], ["fieldInfo", "/fieldInfo"]]) {
    const target = `/game/venue/${suffix}`;
    replaceLineage(snapshot, lineage({
      id: `venue.${suffix.toLowerCase()}`, target, coverage: "subtree", state: selected ? "available" : allSources.length ? "omitted" : "not-requested", sources: allSources, selected,
      sourcePath: selected === feedSource ? `/gameData/venue${sourcePath}` : selected === venueSource ? `/venues/0${sourcePath}` : null,
      reason: selected === feedSource ? "Already-loaded Feed venue detail wins over an equivalent narrow candidate." : selected === venueSource ? "Narrow season-scoped Venue detail supplies fields because usable Feed detail is unavailable." : "No usable extended venue candidate was available.",
      rejectedCandidates: rejected, transformations: selected ? ["preserve-schedule-venue-identity", "normalize-extended-venue-fields"] : []
    }));
  }
  return { feedSource, venueSource };
}

function normalizeSeasonStats(seasonStats, snapshot) {
  const output = {};
  const scope = (code) => ({
    sportId: snapshot.context.sport.id,
    gameTypes: [snapshot.context.gameType],
    statType: "seasonStats",
    startDate: `${snapshot.context.season}-01-01`,
    endDate: snapshot.context.officialDate,
    aggregate: { sportId: snapshot.context.sport.id, code, selection: "single-unambiguous" }
  });
  const hitting = seasonStats?.batting;
  if (hitting) output.hitting = { scope: scope("game1-postgame"), totals: normalizeStatTotals(hitting, "hitting") };
  const pitching = seasonStats?.pitching;
  if (pitching) output.pitching = { scope: scope("game1-postgame"), totals: normalizeStatTotals(pitching, "pitching") };
  return output;
}

function normalizeStatTotals(raw, group) {
  const keys = group === "hitting"
    ? ["gamesPlayed", "avg", "obp", "slg", "ops", "plateAppearances", "homeRuns", "rbi", "stolenBases"]
    : ["gamesPlayed", "gamesPitched", "gamesStarted", "wins", "losses", "era", "whip", "inningsPitched", "strikeOuts", "baseOnBalls", "saves", "holds"];
  const output = {};
  for (const key of keys) if (own(raw, key)) output[key] = numberOrNull(raw[key]) ?? (raw[key] == null ? null : String(raw[key]));
  return output;
}

function boxscoreMaps(payload) {
  const teams = new Map();
  const players = new Map();
  for (const sourceSide of ["away", "home"]) {
    const team = payload?.teams?.[sourceSide];
    const teamId = integerOrNull(team?.team?.id);
    if (teamId != null) teams.set(teamId, team);
    for (const entry of Object.values(team?.players ?? {})) if (entry?.person?.id != null && entry?.seasonStats) players.set(Number(entry.person.id), entry.seasonStats);
  }
  return { teams, players };
}

function advanceStreak(base, won, isTie) {
  if (isTie || won == null) return base;
  const match = /^([WL])(\d+)$/i.exec(String(base ?? ""));
  if (!match) return won ? "W1" : "L1";
  const direction = match[1].toUpperCase();
  const count = Number(match[2]);
  return won ? (direction === "W" ? `W${count + 1}` : "W1") : (direction === "L" ? `L${count + 1}` : "L1");
}

function earlierWon(context, teamId) {
  if (context.isTie === true) return null;
  if (Number(context.awayTeamId) === Number(teamId)) return context.awayIsWinner === true;
  if (Number(context.homeTeamId) === Number(teamId)) return context.homeIsWinner === true;
  return null;
}

function overlayRoleStats(snapshot, role, target, boxscoreSource, maps) {
  const stats = maps.players.get(Number(role?.player?.id));
  if (!stats) return;
  const normalized = normalizeSeasonStats(stats, snapshot);
  for (const [group, value] of Object.entries(normalized)) {
    const groupTarget = `${target}/stats/${group}`;
    const prior = findEffectiveLineage(snapshot.meta.lineage, groupTarget);
    role.stats[group] = value;
    const sources = [boxscoreSource];
    const rejectedCandidates = [];
    if (prior?.selectedSourceResultRef && prior.selectedSourceResultRef !== boxscoreSource.id) {
      const priorSource = snapshot.meta.sourceResults.find((entry) => entry.id === prior.selectedSourceResultRef);
      if (priorSource?.adapter === "people") {
        sources.push(priorSource);
        rejectedCandidates.push({ sourceResultRef: prior.selectedSourceResultRef, reason: "Valid prior-cutoff statistics are older than the completed earlier game's postgame totals." });
      }
    }
    replaceLineage(snapshot, lineage({
      id: `game2.${target.replaceAll("/", "-").toLowerCase()}.${group}`, target: groupTarget, state: "available", sources, selected: boxscoreSource,
      sourcePath: `/teams/*/players/*[person.id=${role.player.id}]/seasonStats/${group === "hitting" ? "batting" : "pitching"}`,
      reason: "Game 1 Final seasonStats override prior-cutoff People totals for the selected Game 2 context.", rejectedCandidates,
      transformations: [`normalize-${group}-stats`, "attach-explicit-game1-postgame-scope"]
    }));
  }
}

function applyGame2Overlay(snapshot, config, standingsSources) {
  if (!config) return null;
  const input = materializeAdapterInput("boxscore", config.input);
  const earlier = config.earlierGame ?? {};
  const selectedTeamIds = new Set([Number(snapshot.away.team.id), Number(snapshot.home.team.id)]);
  const earlierTeamIds = new Set([Number(earlier.awayTeamId), Number(earlier.homeTeamId)]);
  const sameTeams = selectedTeamIds.size === earlierTeamIds.size && [...selectedTeamIds].every((id) => earlierTeamIds.has(id));
  if (snapshot.game.gameNumber == null || snapshot.game.gameNumber < 2 || input.gamePk !== String(earlier.gamePk) || earlier.officialDate !== snapshot.context.officialDate || earlier.canonicalStatus !== "final" || !sameTeams) {
    throw new ContractRuntimeError("IDENTITY_JOIN_FAILED", "Game 1 overlay requires a verified Final earlier same-day game between the selected teams.", { input, earlier, selectedGameNumber: snapshot.game.gameNumber });
  }
  const source = sourceResult("boxscore", config, { gamePk: snapshot.context.gamePk, selectedViewKey: snapshot.context.selectedViewKey, relatedGamePk: input.gamePk }, {
    kind: "gameState", gamePk: input.gamePk, canonicalGameState: "final", rawGameState: earlier.rawGameState ?? "Final"
  }, config.outcome ?? "success");
  addSource(snapshot, source);
  if ((config.outcome ?? "success") !== "success") return source;
  const maps = boxscoreMaps(config.payload);
  for (const sideName of ["away", "home"]) {
    const side = snapshot[sideName];
    const priorRecordLineage = findEffectiveLineage(snapshot.meta.lineage, `/${sideName}/team/record`);
    const priorSource = priorRecordLineage?.selectedSourceResultRef ? snapshot.meta.sourceResults.find((entry) => entry.id === priorRecordLineage.selectedSourceResultRef) : standingsSources[0];
    const boxTeam = maps.teams.get(Number(side.team.id));
    if (boxTeam?.team?.record) {
      side.team.record = teamRecord({ record: boxTeam.team.record, gamesPlayed: boxTeam.team.record.gamesPlayed });
      side.team.gameNumber = side.team.record.gamesPlayed == null ? null : side.team.record.gamesPlayed + 1;
      const sources = [source, priorSource].filter(Boolean);
      replaceLineage(snapshot, lineage({
        id: `game2.${sideName}.record`, target: `/${sideName}/team/record`, coverage: "exact", state: "available", sources, selected: source,
        sourcePath: `/teams/*[team.id=${side.team.id}]/team/record`, reason: "Earlier same-day game is Final, so its postgame record overrides the prior-cutoff standings record.",
        rejectedCandidates: priorSource ? [{ sourceResultRef: priorSource.id, reason: "Valid fallback but older than the completed earlier game." }] : [], transformations: ["normalize-team-record"]
      }));
      replaceLineage(snapshot, lineage({
        id: `game2.${sideName}.game-number`, target: `/${sideName}/team/gameNumber`, state: "available", sources: [source], selected: source,
        reason: "Derived from the post-Game-1 record plus the selected upcoming game.", transformations: ["derive-next-team-game-number"], derivationInputs: [`/${sideName}/team/record/gamesPlayed`]
      }));
    }
    const won = earlierWon(earlier, side.team.id);
    const before = side.team.standings.streak;
    side.team.standings.streak = advanceStreak(before, won, earlier.isTie === true);
    const standingsSource = findEffectiveLineage(snapshot.meta.lineage, `/${sideName}/team/standings`)?.selectedSourceResultRef;
    const streakSources = [snapshot.meta.sourceResults.find((entry) => entry.id === standingsSource), source].filter(Boolean);
    replaceLineage(snapshot, lineage({
      id: `game2.${sideName}.streak`, target: `/${sideName}/team/standings/streak`, state: before == null && won == null ? "omitted" : "available", sources: streakSources, selected: null,
      effective: source.effective, reason: "Locally advanced the prior-cutoff streak by exactly one known Final Game 1 result.", transformations: ["advance-streak-one-known-result"],
      derivationInputs: [`/${sideName}/team/standings/streak@${standingsSource ?? "unavailable"}`, `game-result@${source.id}`]
    }));
    for (let index = 0; index < side.lineup.slots.length; index += 1) overlayRoleStats(snapshot, side.lineup.slots[index], `/${sideName}/lineup/slots/${index}`, source, maps);
    if (side.startingPitcher) overlayRoleStats(snapshot, side.startingPitcher, `/${sideName}/startingPitcher`, source, maps);
    for (const collection of ["additionalStarters", "bench", "bullpen"]) side[collection].forEach((role, index) => overlayRoleStats(snapshot, role, `/${sideName}/${collection}/${index}`, source, maps));
  }
  return source;
}

export function normalizeContextOverlaySnapshot(baseSnapshot, sources = {}, execution = {}) {
  const snapshot = clone(baseSnapshot);
  const standingsSources = applyStandings(snapshot, sources.standings);
  applyFeedAndVenue(snapshot, sources.feed, sources.venue);
  applyGame2Overlay(snapshot, sources.boxscore, standingsSources);
  snapshot.meta.snapshot = {
    ...snapshot.meta.snapshot,
    id: execution.snapshotId ?? `${snapshot.meta.snapshot.id}-context-overlay`,
    createdAtUtc: execution.createdAtUtc ?? snapshot.meta.snapshot.createdAtUtc,
    producer: { applicationVersion: execution.applicationVersion ?? "0.3.0", build: execution.build ?? "004.5" },
    fixtureKind: execution.fixtureKind ?? snapshot.meta.snapshot.fixtureKind
  };
  return assertValidNormalizedSnapshot(snapshot, {
    requiredTargets: ["/game/umpires/crew", "/game/venue/location", "/away/team/standings", "/home/team/standings", "/standings/groups"]
  });
}
