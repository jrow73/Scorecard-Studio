/**
 * Scorecard Studio
 * MLB Stats API access
 * Version: 0.2.0-dev
 * Build: 009
 */

const MLB_API_V1 = "https://statsapi.mlb.com/api/v1";
const MLB_GAME_FEED = "https://statsapi.mlb.com/api/v1.1/game";

export async function fetchFavoriteTeamSchedule(date, teamId) {
  try {
    const params = new URLSearchParams({
      sportId: "1",
      teamId: String(teamId),
      date,
      hydrate: "team,venue,probablePitcher"
    });

    const response = await fetch(`${MLB_API_V1}/schedule?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`MLB Stats API returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    return normalizeSchedule(data);
  } catch (error) {
    console.error("Unable to load favorite-team schedule:", error);
    throw new Error(error instanceof Error ? error.message : "Unable to load the selected date's schedule.");
  }
}

export async function fetchGameFeed(gamePk) {
  try {
    const response = await fetch(`${MLB_GAME_FEED}/${encodeURIComponent(String(gamePk))}/feed/live`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`MLB game feed returned HTTP ${response.status}.`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Unable to load game ${gamePk}:`, error);
    throw new Error(error instanceof Error ? error.message : "Unable to load pregame data.");
  }
}

export async function fetchTeamCoaches(teamId, date, season) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (season) params.set("season", String(season));
  return fetchJson(`${MLB_API_V1}/teams/${encodeURIComponent(String(teamId))}/coaches?${params.toString()}`, "MLB coaches API");
}

export async function fetchLeagueStandings(leagueId, date, season) {
  const params = new URLSearchParams({
    leagueId: String(leagueId),
    standingsTypes: "regularSeason"
  });
  if (date) params.set("date", date);
  if (season) params.set("season", String(season));
  return fetchJson(`${MLB_API_V1}/standings?${params.toString()}`, "MLB standings API");
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

function normalizeSchedule(data) {
  const dates = Array.isArray(data?.dates) ? data.dates : [];
  const games = dates.flatMap((dateEntry) => Array.isArray(dateEntry?.games) ? dateEntry.games : []);

  return games.map((game) => ({
    gamePk: String(game.gamePk ?? ""),
    gameDate: game.gameDate ?? "",
    officialDate: game.officialDate ?? "",
    awayTeam: game.teams?.away?.team?.name ?? "Away Team",
    homeTeam: game.teams?.home?.team?.name ?? "Home Team",
    awayTeamId: game.teams?.away?.team?.id ?? null,
    homeTeamId: game.teams?.home?.team?.id ?? null,
    venue: game.venue?.name ?? "Venue TBD",
    status: game.status?.detailedState ?? "Scheduled"
  }));
}
