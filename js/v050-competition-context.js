/**
 * Scorecard Studio v0.5 competition-presentation policy.
 *
 * This module classifies what Game Day may claim about the selected competition.
 * It does not fetch data and it never infers a MiLB half from a calendar date.
 */

export const MLB_SPORT_ID = 1;
export const SUPPORTED_MILB_SPORT_IDS = Object.freeze([11, 12, 13, 14]);
export const POSTSEASON_GAME_TYPES = Object.freeze(["F", "D", "L", "W"]);
export const PRESEASON_GAME_TYPES = Object.freeze(["S", "E"]);

const MILB_IDS = new Set(SUPPORTED_MILB_SPORT_IDS);
const POSTSEASON_TYPES = new Set([...POSTSEASON_GAME_TYPES, "P", "C"]);
const PRESEASON_TYPES = new Set(PRESEASON_GAME_TYPES);
const SPLIT_TYPES = new Set(["firstHalf", "secondHalf"]);

const STAT_SCOPE = Object.freeze({
  regularSeason: Object.freeze({ key: "regularSeason", label: "Regular Season", gameTypes: Object.freeze(["R"]) }),
  postseason: Object.freeze({ key: "postseason", label: "Postseason", gameTypes: POSTSEASON_GAME_TYPES }),
  preseason: Object.freeze({ key: "preseason", label: "Spring / Preseason", gameTypes: PRESEASON_GAME_TYPES }),
  firstHalf: Object.freeze({ key: "firstHalf", label: "First Half", gameTypes: Object.freeze(["R"]), dateRange: "firstHalf" }),
  secondHalf: Object.freeze({ key: "secondHalf", label: "Second Half", gameTypes: Object.freeze(["R"]), dateRange: "secondHalf" })
});

function dateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

function immutableContext(value) {
  const result = {
    ...value,
    playerStatScopes: Object.freeze([...(value.playerStatScopes || [])]),
    source: Object.freeze({ ...(value.source || {}) })
  };
  return Object.freeze(result);
}

function baseSource({ sportId, gameType, officialDate, splitSeasonType }) {
  return { sportId, gameType, officialDate, splitSeasonType };
}

export function splitSeasonTypeFromStandings(records) {
  const types = new Set((Array.isArray(records) ? records : [])
    .map((record) => record?.standingsType)
    .filter((type) => SPLIT_TYPES.has(type)));
  return types.size === 1 ? [...types][0] : null;
}

export function competitionContextForModel(model = {}) {
  const groups = Array.isArray(model?.standings?.groups) ? model.standings.groups : [];
  return classifyCompetitionPhase({
    sportId: model?.context?.sport?.id ?? model?.context?.sportId,
    gameType: model?.context?.gameType,
    officialDate: model?.context?.officialDate,
    splitSeasonType: splitSeasonTypeFromStandings(groups)
  });
}

function payloadHasGames(payload) {
  return (Array.isArray(payload?.records) ? payload.records : []).some((record) =>
    (Array.isArray(record?.teamRecords) ? record.teamRecords : []).some((row) => Number(row?.gamesPlayed) > 0)
  );
}

export function selectActiveSplitStandingsConfig(configs = []) {
  const successful = (Array.isArray(configs) ? configs : []).filter((config) => config?.outcome === "success");
  const byType = (type) => successful.find((config) => config?.input?.standingsType === type && payloadHasGames(config.payload));
  return byType("secondHalf") || byType("firstHalf") || null;
}

function recordText(record) {
  return record?.wins != null && record?.losses != null ? `${record.wins}-${record.losses}` : null;
}

function lastTenText(standings) {
  if (standings?.lastTen?.display) return standings.lastTen.display;
  return standings?.lastTen?.wins != null && standings?.lastTen?.losses != null
    ? `${standings.lastTen.wins}-${standings.lastTen.losses}`
    : null;
}

function facts(...items) {
  return Object.freeze(items.filter((item) => {
    if (item.value === null || item.value === undefined || item.value === "") return false;
    if (item.format !== "optionalGamesBack" || typeof item.value !== "object") return true;
    return item.value.raw != null || item.value.games != null;
  }).map(Object.freeze));
}

export function standardTeamPresentation(team = {}, context = {}, selectedScope = null) {
  const record = team.record || {};
  const standings = team.standings || {};
  if (context.family === "postseason" && selectedScope === "regularSeason") return Object.freeze({
    note: "Final regular-season record and standing.",
    facts: facts(
      { label: "Final Record", value: recordText(record) },
      { label: "PCT", value: record.pct, format: "pct" },
      { label: "Division Finish", value: standings.divisionRank, format: "rank" }
    )
  });
  if (selectedScope === "firstHalf" || selectedScope === "secondHalf") {
    const half = selectedScope === "secondHalf" ? "Second Half" : "First Half";
    return Object.freeze({
      note: `${half} record and standing through the applicable cutoff.`,
      facts: facts(
        { label: `${half} Record`, value: recordText(record) },
        { label: "PCT", value: record.pct, format: "pct" },
        { label: "Division Rank", value: standings.divisionRank, format: "rank" },
        { label: "Games Back", value: standings.divisionGamesBack, format: "gamesBack" }
      )
    });
  }
  if (context.family === "postseason") return Object.freeze({
    note: "Current-series record through the pregame cutoff.",
    facts: facts({ label: "Series Record", value: recordText(record) })
  });
  return Object.freeze({
    note: "Team record and standings through the pregame cutoff.",
    facts: facts(
      { label: "Record", value: recordText(record) },
      { label: "PCT", value: record.pct, format: "pct" },
      { label: "Games Played", value: record.gamesPlayed },
      { label: "Division Rank", value: standings.divisionRank, format: "rank" },
      { label: "Games Back", value: standings.divisionGamesBack, format: "gamesBack" }
    )
  });
}

function seriesLeader(model = {}) {
  const away = model?.away?.team || {};
  const home = model?.home?.team || {};
  const awayWins = Number(away.record?.wins);
  const homeWins = Number(home.record?.wins);
  if (!Number.isFinite(awayWins) || !Number.isFinite(homeWins)) return null;
  if (awayWins === homeWins) return awayWins ? `Series tied, ${awayWins}–${homeWins}` : "Series tied, 0–0";
  const leader = awayWins > homeWins ? away : home;
  const leaderWins = Math.max(awayWins, homeWins);
  const trailerWins = Math.min(awayWins, homeWins);
  const gamesInSeries = Number(model?.game?.series?.gamesInSeries);
  const winsNeeded = Number.isInteger(gamesInSeries) && gamesInSeries > 0 ? Math.floor(gamesInSeries / 2) + 1 : null;
  return winsNeeded && leaderWins >= winsNeeded
    ? `${leader.name || "Series winner"} win series, ${leaderWins}–${trailerWins}`
    : `${leader.name || "Series leader"} lead series, ${leaderWins}–${trailerWins}`;
}

export function postseasonSeriesPresentation(model = {}) {
  const context = competitionContextForModel(model);
  if (context.family !== "postseason") return null;
  const series = model?.game?.series || {};
  const gameNumber = Number(series.gameNumber);
  const gamesInSeries = Number(series.gamesInSeries);
  return Object.freeze({
    title: series.description || "Postseason Series",
    gameLabel: Number.isInteger(gameNumber) && gameNumber > 0 ? `Game ${gameNumber}` : null,
    formatLabel: Number.isInteger(gamesInSeries) && gamesInSeries > 0 ? `Best of ${gamesInSeries}` : null,
    status: seriesLeader(model)
  });
}

function performanceFacts(team, side) {
  const standings = team.standings || {};
  return facts(
    { label: "Runs Scored", value: standings.runsScored },
    { label: "Runs Allowed", value: standings.runsAllowed },
    { label: "Run Differential", value: standings.runDifferential, format: "signed" },
    { label: "Home Record", value: standings.homeRecord, format: "record", emphasized: side === "home" },
    { label: "Away Record", value: standings.awayRecord, format: "record", emphasized: side === "away" }
  );
}

export function advancedTeamPresentation(team = {}, context = {}, side = null, selectedScope = null) {
  const record = team.record || {};
  const standings = team.standings || {};
  const mode = context.advancedMode || "conservative";

  if (context.family === "postseason" && selectedScope === "regularSeason") return Object.freeze({
    note: "Final regular-season record and standing.", standingsType: "regularSeason",
    facts: facts(
      { label: "Final Record", value: recordText(record) },
      { label: "PCT", value: record.pct, format: "pct" },
      { label: "Division Finish", value: standings.divisionRank, format: "rank" }
    )
  });

  if (mode === "spring") return Object.freeze({
    note: "Spring performance through the pregame cutoff.", standingsType: "springTraining",
    facts: performanceFacts(team, side)
  });
  if (mode === "form") return Object.freeze({
    note: "Season performance through the pregame cutoff.", standingsType: "regularSeason",
    facts: performanceFacts(team, side)
  });
  if (mode === "mlb-wild-card") return Object.freeze({
    note: "Season performance and playoff-race position through the pregame cutoff.", standingsType: "regularSeason",
    facts: Object.freeze([
      ...performanceFacts(team, side),
      ...facts(
      { label: "League Rank", value: standings.leagueRank, format: "rank" },
      { label: "Wild Card Rank", value: standings.wildCardRank, format: "rank" },
      { label: "Wild Card Games Back", value: standings.wildCardGamesBack, format: "optionalGamesBack" }
      )
    ])
  });
  if (mode === "postseason") return Object.freeze({
    note: "Current-series record through the pregame cutoff.", standingsType: null,
    facts: facts(
      { label: "Series Record", value: recordText(record) }
    )
  });
  if (mode === "milb-half") {
    const half = context.standingsType === "secondHalf" ? "Second Half" : "First Half";
    return Object.freeze({
      note: `${half} performance through the pregame cutoff.`, standingsType: context.standingsType,
      facts: performanceFacts(team, side)
    });
  }
  if (mode === "division") return Object.freeze({
    note: "Competition-specific standings were not available; showing the returned division context.", standingsType: "regularSeason",
    facts: facts(
      { label: "Division Rank", value: standings.divisionRank, format: "rank" },
      { label: "Games Back", value: standings.divisionGamesBack, format: "gamesBack" },
      { label: "Current Streak", value: standings.streak }
    )
  });
  return Object.freeze({ note: "Competition-specific standings are not available for this event.", standingsType: null, facts: Object.freeze([]) });
}

export function competitionContextNote(context = {}) {
  if (context.key === "preseason") return "Spring context; Advanced shows spring performance when returned.";
  if (context.key === "mlb-regular-early") return "Regular-season context; Advanced shows team performance before the September playoff race.";
  if (context.key === "mlb-regular-playoff-race") return "Playoff-race context; Advanced keeps team performance and adds league and Wild Card position.";
  if (context.key === "postseason") return "Postseason context; regular-season race standings are not presented as current.";
  if (context.key === "milb-first-half" || context.key === "milb-second-half") return `${context.label} context is based on returned split-season standings.`;
  if (context.key === "milb-regular-unknown-half") return "MiLB split-season context was not returned; Advanced uses conservative division information.";
  return "Competition-specific standings are hidden when their meaning cannot be established.";
}

export function classifyCompetitionPhase(input = {}) {
  const sportId = Number(input.sportId);
  const gameType = String(input.gameType || "").trim().toUpperCase();
  const officialDate = String(input.officialDate || "").trim() || null;
  const parts = dateParts(officialDate);
  const splitSeasonType = SPLIT_TYPES.has(input.splitSeasonType) ? input.splitSeasonType : null;
  const source = baseSource({ sportId: Number.isFinite(sportId) ? sportId : null, gameType: gameType || null, officialDate, splitSeasonType });

  if (PRESEASON_TYPES.has(gameType)) {
    return immutableContext({
      key: "preseason",
      family: "preseason",
      label: "Spring / Preseason",
      advancedMode: "spring",
      standingsType: "springTraining",
      playerStatScopes: [STAT_SCOPE.preseason],
      defaultPlayerStatScope: "preseason",
      source: { ...source, policy: "game-type" }
    });
  }

  if (POSTSEASON_TYPES.has(gameType)) {
    return immutableContext({
      key: "postseason",
      family: "postseason",
      label: "Postseason",
      advancedMode: "postseason",
      standingsType: null,
      playerStatScopes: [STAT_SCOPE.regularSeason, STAT_SCOPE.postseason],
      defaultPlayerStatScope: "postseason",
      source: { ...source, policy: "game-type" }
    });
  }

  if (gameType === "R" && sportId === MLB_SPORT_ID) {
    if (!parts) {
      return immutableContext({
        key: "mlb-regular-unknown",
        family: "regular-season",
        label: "Regular Season",
        advancedMode: "division",
        standingsType: "regularSeason",
        playerStatScopes: [STAT_SCOPE.regularSeason],
        defaultPlayerStatScope: "regularSeason",
        source: { ...source, policy: "missing-date-fallback" }
      });
    }
    const playoffRace = parts.month > 9 || (parts.month === 9 && parts.day >= 1);
    return immutableContext({
      key: playoffRace ? "mlb-regular-playoff-race" : "mlb-regular-early",
      family: "regular-season",
      label: playoffRace ? "Regular Season — Playoff Race" : "Regular Season",
      advancedMode: playoffRace ? "mlb-wild-card" : "form",
      standingsType: playoffRace ? "wildCardWithLeaders" : "regularSeason",
      playerStatScopes: [STAT_SCOPE.regularSeason],
      defaultPlayerStatScope: "regularSeason",
      source: { ...source, policy: "mlb-september-1" }
    });
  }

  if (gameType === "R" && MILB_IDS.has(sportId)) {
    if (splitSeasonType) {
      return immutableContext({
        key: splitSeasonType === "firstHalf" ? "milb-first-half" : "milb-second-half",
        family: "regular-season",
        label: splitSeasonType === "firstHalf" ? "First Half" : "Second Half",
        advancedMode: "milb-half",
        standingsType: splitSeasonType,
        playerStatScopes: splitSeasonType === "secondHalf" ? [STAT_SCOPE.firstHalf, STAT_SCOPE.secondHalf] : [STAT_SCOPE.firstHalf],
        defaultPlayerStatScope: splitSeasonType === "secondHalf" ? "secondHalf" : "firstHalf",
        source: { ...source, policy: "explicit-split-standings" }
      });
    }
    return immutableContext({
      key: "milb-regular-unknown-half",
      family: "regular-season",
      label: "Regular Season",
      advancedMode: "division",
      standingsType: "regularSeason",
      playerStatScopes: [STAT_SCOPE.regularSeason],
      defaultPlayerStatScope: "regularSeason",
      source: { ...source, policy: "split-standings-unavailable" }
    });
  }

  return immutableContext({
    key: "special-or-unknown",
    family: "other",
    label: "Special Event",
    advancedMode: "conservative",
    standingsType: null,
    playerStatScopes: [],
    defaultPlayerStatScope: null,
    source: { ...source, policy: "conservative-fallback" }
  });
}
