/**
 * Scorecard Studio
 * MLB Stats API access
 * Version: 0.1.0-web-dev
 * Build: 003
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
    throw new Error(error instanceof Error ? error.message : "Unable to load today's schedule.");
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
