/**
 * Scorecard Studio
 * Stats API access
 * Version: 0.2.0
 */

const STATS_API_V1 = "https://statsapi.mlb.com/api/v1";
const GAME_FEED = "https://statsapi.mlb.com/api/v1.1/game";

export async function fetchFavoriteTeamSchedule(date, teamId, sportId = 1) {
  return (await fetchFavoriteTeamScheduleBundle(date, teamId, sportId)).games;
}

export async function fetchFavoriteTeamScheduleBundle(date, teamId, sportId = 1) {
  try {
    const params = new URLSearchParams({
      sportId: String(sportId || 1),
      teamId: String(teamId),
      date,
      hydrate: "lineups,weather,venue,team,probablePitcher"
    });

    const response = await fetch(`${STATS_API_V1}/schedule?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`Stats API returned HTTP ${response.status}.`);
    const payload = await response.json();
    return { games: normalizeSchedule(payload, sportId), payload };
  } catch (error) {
    console.error("Unable to load favorite-team schedule:", error);
    throw new Error(error instanceof Error ? error.message : "Unable to load the selected date's schedule.");
  }
}

export async function fetchGameFeed(gamePk) {
  return fetchJson(`${GAME_FEED}/${encodeURIComponent(String(gamePk))}/feed/live`, "game feed");
}

export async function fetchGameBoxscore(gamePk) {
  return fetchJson(`${STATS_API_V1}/game/${encodeURIComponent(String(gamePk))}/boxscore`, "game boxscore");
}

export async function fetchTeamRoster(teamId, date) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  params.set("hydrate", "person");
  return fetchJson(`${STATS_API_V1}/teams/${encodeURIComponent(String(teamId))}/roster?${params.toString()}`, "roster API");
}

export async function fetchPeoplePregameStats(personIds, startDate, endDate, options = {}) {
  const ids = [...new Set((personIds || []).map((id) => Number(id)).filter(Number.isFinite))];
  if (!ids.length) return { people: [], units: [] };
  const chunkSize = Number.isInteger(options.chunkSize) && options.chunkSize > 0 ? options.chunkSize : 100;
  const chunks = [];
  for (let index = 0; index < ids.length; index += chunkSize) chunks.push(ids.slice(index, index + chunkSize));

  const gameTypes = Array.isArray(options.gameTypes) && options.gameTypes.length ? options.gameTypes : ["R"];
  const statGroups = Array.isArray(options.statGroups) && options.statGroups.length ? options.statGroups : ["hitting", "pitching"];
  const sportScope = Number.isInteger(options.sportId) ? `,sportId=${options.sportId}` : "";
  const results = await Promise.allSettled(chunks.map(async (chunk) => {
    const hydrate = `stats(group=[${statGroups.join(",")}],type=[byDateRange]${sportScope},gameType=[${gameTypes.join(",")}],startDate=${startDate},endDate=${endDate})`;
    const params = new URLSearchParams({ personIds: chunk.join(","), hydrate });
    return fetchJson(`${STATS_API_V1}/people?${params.toString()}`, "people stats API");
  }));

  const units = results.map((result, index) => result.status === "fulfilled"
    ? { outcome: "success", personIds: chunks[index], payload: result.value }
    : { outcome: "failed", personIds: chunks[index], payload: null, error: { code: "REQUEST_FAILED", summary: String(result.reason?.message ?? result.reason ?? "People request failed."), retryable: true } });
  return { people: units.flatMap((unit) => Array.isArray(unit.payload?.people) ? unit.payload.people : []), units };
}

export async function fetchTeamCoaches(teamId, date, season) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (season) params.set("season", String(season));
  return fetchJson(`${STATS_API_V1}/teams/${encodeURIComponent(String(teamId))}/coaches?${params.toString()}`, "coaches API");
}

export async function fetchLeagueStandings(leagueId, date, season, options = {}) {
  const params = new URLSearchParams({ leagueId: String(leagueId), standingsTypes: options.standingsType || "regularSeason" });
  if (options.sportId) params.set("sportId", String(options.sportId));
  if (date) params.set("date", date);
  if (season) params.set("season", String(season));
  return fetchJson(`${STATS_API_V1}/standings?${params.toString()}`, "standings API");
}

export async function fetchTeamDepthChart(teamId) {
  return fetchJson(`${STATS_API_V1}/teams/${encodeURIComponent(String(teamId))}/roster/depthChart`, "depth chart API");
}

export async function fetchVenueDetails(venueId, season) {
  const params = new URLSearchParams({ season: String(season), hydrate: "location,fieldInfo,timezone" });
  return fetchJson(`${STATS_API_V1}/venues/${encodeURIComponent(String(venueId))}?${params.toString()}`, "venue API");
}

async function fetchJson(url, label) {
  try {
    const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}.`);
    return await response.json();
  } catch (error) {
    console.error(`${label} request failed:`, error);
    throw new Error(error instanceof Error ? error.message : `${label} request failed.`);
  }
}

function normalizeSchedule(data, requestedSportId = 1) {
  const dates = Array.isArray(data?.dates) ? data.dates : [];
  const games = dates.flatMap((dateEntry) => Array.isArray(dateEntry?.games) ? dateEntry.games : []);

  return games.map((game) => ({
    gamePk: String(game.gamePk ?? ""),
    gameDate: game.gameDate ?? "",
    officialDate: game.officialDate ?? "",
    season: Number(game.season || String(game.officialDate || "").slice(0, 4)) || null,
    sportId: Number(game.sport?.id ?? requestedSportId ?? 1) || 1,
    gameType: game.gameType ?? null,
    gameNumber: Number(game.gameNumber) || 1,
    doubleHeader: game.doubleHeader ?? "N",
    dayNight: game.dayNight ?? null,
    startTimeTBD: Boolean(game.status?.startTimeTBD),
    statusCode: game.status?.statusCode ?? null,
    abstractGameState: game.status?.abstractGameState ?? null,
    awayTeam: game.teams?.away?.team?.name ?? "Away Team",
    homeTeam: game.teams?.home?.team?.name ?? "Home Team",
    awayTeamId: game.teams?.away?.team?.id ?? null,
    homeTeamId: game.teams?.home?.team?.id ?? null,
    awayLeagueId: game.teams?.away?.team?.league?.id ?? null,
    homeLeagueId: game.teams?.home?.team?.league?.id ?? null,
    awayTeamData: game.teams?.away?.team ?? null,
    homeTeamData: game.teams?.home?.team ?? null,
    awayIsWinner: game.teams?.away?.isWinner === true,
    homeIsWinner: game.teams?.home?.isWinner === true,
    isTie: game.isTie === true,
    awayProbablePitcher: game.teams?.away?.probablePitcher ?? null,
    homeProbablePitcher: game.teams?.home?.probablePitcher ?? null,
    awayLineup: Array.isArray(game.lineups?.awayPlayers) ? game.lineups.awayPlayers : [],
    homeLineup: Array.isArray(game.lineups?.homePlayers) ? game.lineups.homePlayers : [],
    venue: game.venue?.name ?? "Venue TBD",
    venueData: game.venue ?? null,
    weather: game.weather ?? null,
    status: game.status?.detailedState ?? "Scheduled"
  }));
}
