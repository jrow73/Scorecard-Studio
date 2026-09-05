/**
 * Scorecard Studio
 * MLB Stats API access
 * Version: 0.1.0-web-dev
 * Build: 001
 */

const MLB_API_BASE = "https://statsapi.mlb.com/api/v1";

export async function fetchMlbSchedule(date) {
  try {
    const params = new URLSearchParams({
      sportId: "1",
      date,
      hydrate: "team,venue"
    });

    const response = await fetch(`${MLB_API_BASE}/schedule?${params.toString()}`, {
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
    console.error("Unable to load MLB schedule:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to load the MLB schedule."
    );
  }
}

function normalizeSchedule(data) {
  const dates = Array.isArray(data?.dates) ? data.dates : [];
  const games = dates.flatMap((dateEntry) =>
    Array.isArray(dateEntry?.games) ? dateEntry.games : []
  );

  return games.map((game) => ({
    gamePk: game.gamePk,
    gameDate: game.gameDate,
    awayTeam: game.teams?.away?.team?.name ?? "Away Team",
    homeTeam: game.teams?.home?.team?.name ?? "Home Team",
    venue: game.venue?.name ?? "Venue TBD",
    status: game.status?.detailedState ?? "Scheduled"
  }));
}
