/**
 * Scorecard Studio
 * v0.4 Schedule-first Home helpers
 */

export function scheduleReadiness(game) {
  const rawStatus = String(game?.status || "").trim();
  const abstractState = String(game?.abstractGameState || "").toLowerCase();
  const statusCode = String(game?.statusCode || "").toUpperCase();
  if (abstractState === "final" || statusCode === "F" || /^final\b/i.test(rawStatus)) {
    return Object.freeze({ key: "terminal", label: rawStatus || "Final", tone: "neutral", lineupsComplete: true });
  }
  if (/postpon|cancel|suspend/i.test(rawStatus)) {
    return Object.freeze({ key: "terminal", label: rawStatus, tone: "warning", lineupsComplete: false });
  }
  const awayCount = Array.isArray(game?.awayLineup) ? game.awayLineup.length : 0;
  const homeCount = Array.isArray(game?.homeLineup) ? game.homeLineup.length : 0;
  if (awayCount >= 9 && homeCount >= 9) return Object.freeze({ key: "ready", label: "Ready", tone: "ready", lineupsComplete: true });
  if (awayCount > 0 || homeCount > 0) return Object.freeze({ key: "partial", label: "Partial", tone: "warning", lineupsComplete: false });
  return Object.freeze({ key: "waiting", label: "Waiting for lineups", tone: "neutral", lineupsComplete: false });
}

export function scheduleLeagueGroup(game) {
  if (Number(game?.sportId) === 1) return Object.freeze({ key: "mlb", label: "MLB" });
  const awayId = Number(game?.awayLeagueId) || null;
  const homeId = Number(game?.homeLeagueId) || null;
  const awayName = text(game?.awayLeagueName);
  const homeName = text(game?.homeLeagueName);
  if (awayId && homeId && awayId === homeId) {
    return Object.freeze({ key: `league-${awayId}`, label: awayName || homeName || `League ${awayId}` });
  }
  return Object.freeze({ key: "other", label: "Other / Cross-league" });
}

export function groupScheduleGames(games) {
  const groups = new Map();
  for (const game of games || []) {
    const group = scheduleLeagueGroup(game);
    if (!groups.has(group.key)) groups.set(group.key, { ...group, games: [] });
    groups.get(group.key).games.push(game);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, games: group.games.sort(compareGames) }))
    .sort((left, right) => {
      if (left.key === "other") return 1;
      if (right.key === "other") return -1;
      return left.label.localeCompare(right.label);
    });
}

export function probablePitcherMatchup(game) {
  return Object.freeze({
    away: text(game?.awayProbablePitcher?.fullName) || text(game?.awayProbablePitcher?.name) || "TBD",
    home: text(game?.homeProbablePitcher?.fullName) || text(game?.homeProbablePitcher?.name) || "TBD"
  });
}

export function gameMatchesSearch(game, query, groupLabel = "") {
  const search = searchableText(query);
  if (!search) return true;
  const candidate = [
    game?.awayTeam,
    game?.homeTeam,
    game?.awayTeamAbbreviation,
    game?.homeTeamAbbreviation,
    game?.awayAbbreviation,
    game?.homeAbbreviation,
    game?.awayTeamData?.abbreviation,
    game?.homeTeamData?.abbreviation,
    game?.awayLeagueName,
    game?.homeLeagueName,
    groupLabel
  ].map(searchableText).filter(Boolean).join(" ");
  return candidate.includes(search);
}

function compareGames(left, right) {
  const time = String(left?.gameDate || "").localeCompare(String(right?.gameDate || ""));
  return time || String(left?.gamePk || "").localeCompare(String(right?.gamePk || ""));
}

function text(value) {
  return String(value ?? "").trim();
}

function searchableText(value) {
  return text(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}
