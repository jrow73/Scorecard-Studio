/**
 * Scorecard Studio v0.5 postseason player-stat presentation policy.
 *
 * Pure helpers keep scope selection and empty-state wording independent from
 * browser state and network requests.
 */

function scopes(context = {}) {
  return Array.isArray(context.playerStatScopes) ? context.playerStatScopes : [];
}

export function playerStatScopeToggleVisible(context = {}) {
  return scopes(context).length > 1;
}

export function normalizePlayerStatScopeSelection(context = {}, requested = null) {
  const available = scopes(context);
  if (!available.length) return null;
  const requestedKey = String(requested || "");
  if (available.some((scope) => scope.key === requestedKey)) return requestedKey;
  const preferred = String(context.defaultPlayerStatScope || "");
  return available.some((scope) => scope.key === preferred) ? preferred : available[0].key;
}

function playerRoles(model = {}) {
  const roles = [];
  for (const sideName of ["away", "home"]) {
    const side = model?.[sideName] || {};
    roles.push(...(Array.isArray(side.lineup) ? side.lineup : side.lineup?.slots || []));
    if (side.startingPitcher) roles.push(side.startingPitcher);
    for (const collection of ["bench", "additionalStarters", "bullpen"]) {
      if (Array.isArray(side[collection])) roles.push(...side[collection]);
    }
  }
  return roles;
}

export function playerStatScopeAvailability(model = {}) {
  let returnedGroups = 0;
  let recordedAppearances = 0;
  for (const role of playerRoles(model)) {
    for (const group of ["hitting", "pitching"]) {
      const stats = role?.stats?.[group];
      if (!stats || typeof stats.totals !== "object") continue;
      returnedGroups += 1;
      const appearances = Number(stats.totals.gamesPlayed ?? stats.totals.gamesPitched);
      if (Number.isFinite(appearances)) recordedAppearances += appearances;
    }
  }
  return Object.freeze({
    state: returnedGroups === 0 ? "unavailable" : recordedAppearances === 0 ? "zero" : "available",
    returnedGroups,
    recordedAppearances
  });
}

export function playerStatScopeMessage(scopeKey, availability) {
  const label = ({
    postseason: "Postseason",
    regularSeason: "Regular-season",
    firstHalf: "First-half",
    secondHalf: "Second-half",
    preseason: "Spring / preseason"
  })[scopeKey] || "Selected-scope";
  if (availability?.state === "unavailable") return `Showing ${label.toLowerCase()} team context; no prior player statistics are available through the pregame cutoff.`;
  if (availability?.state === "zero") return `Showing ${label.toLowerCase()} team context; no prior player appearances are recorded through the pregame cutoff.`;
  return `Showing ${label.toLowerCase()} team context and player statistics through the pregame cutoff.`;
}
