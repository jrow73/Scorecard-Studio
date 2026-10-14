/**
 * Scorecard Studio v0.4 Game Day presentation policy.
 * Pure helpers keep research-view truthfulness testable outside the browser.
 */

const KNOWN_LINEAGE_STATES = new Set(["available", "present-empty", "partial"]);

export const GAME_DAY_DETAIL_LEVELS = Object.freeze(["compact", "standard", "advanced"]);

export const GAME_DAY_SECTION_LEVELS = Object.freeze({
  "gameday-overview": "compact",
  "gameday-teams": "compact",
  "gameday-lineups": "compact",
  "gameday-pitchers": "compact",
  "gameday-benches": "standard",
  "gameday-standings-section": "advanced",
  "gameday-staff-section": "advanced"
});

const DETAIL_RANK = Object.freeze({ compact: 0, standard: 1, advanced: 2 });

export function normalizeGameDayDetailLevel(value) {
  return GAME_DAY_DETAIL_LEVELS.includes(value) ? value : "standard";
}

export function visibleGameDaySections(level) {
  const selectedRank = DETAIL_RANK[normalizeGameDayDetailLevel(level)];
  return Object.freeze(Object.entries(GAME_DAY_SECTION_LEVELS)
    .filter(([, minimum]) => DETAIL_RANK[minimum] <= selectedRank)
    .map(([id]) => id));
}

export function gameDaySeasonContext(model) {
  const scope = researchScope(model);
  const segment = String(scope.competitionSegment || "").toLowerCase();
  const gameType = String(scope.gameType || "").toUpperCase();
  if (segment.includes("spring") || ["S", "E"].includes(gameType)) {
    return Object.freeze({ key: "preseason", label: "Spring / Preseason", note: "Spring context; regular-season standings may not apply." });
  }
  if (segment.includes("post") || ["F", "D", "L", "W", "C", "P"].includes(gameType)) {
    return Object.freeze({ key: "postseason", label: "Postseason", note: "Postseason context; standings are shown only when returned for this game scope." });
  }
  if (segment.includes("regular") || gameType === "R") {
    return Object.freeze({ key: "regular", label: "Regular Season", note: "Regular-season records and standings use the available pregame cutoff." });
  }
  return Object.freeze({ key: "other", label: scope.competitionSegment || scope.gameType || "Season context unavailable", note: "Competition context is shown as reported for the selected game." });
}

export function lineageForTarget(model, target) {
  return (model?.meta?.lineage || []).find((record) => record?.target === target) || null;
}

export function pitcherGroupPresentation(model, side) {
  const team = model?.[side] || {};
  const classification = lineageForTarget(model, `/${side}/additionalStarters`);
  const classified = KNOWN_LINEAGE_STATES.has(classification?.state);
  return {
    selectedStarter: team.startingPitcher || null,
    additionalStarters: Array.isArray(team.additionalStarters) ? team.additionalStarters : [],
    bullpen: Array.isArray(team.bullpen) ? team.bullpen : [],
    classified,
    bullpenLabel: classified ? "Core Bullpen" : "Other Active Pitchers — Roles Not Classified",
    bullpenNote: classified
      ? "Dated active-roster pitchers excluding the selected starter and pitchers carrying an SP annotation."
      : "No Starter/Reliever role available",
    classificationState: classification?.state || "not-requested"
  };
}

const MLB_DIVISION_NAMES = Object.freeze({
  200: "American League West",
  201: "American League East",
  202: "American League Central",
  203: "National League West",
  204: "National League East",
  205: "National League Central"
});

// These scopes supplement a team's primary division/half standings row. They
// are intentionally not standalone tables: the API can return one-row leader
// records for every unrelated division, which would otherwise leak into the
// visible Other Standings section.
const DATA_ONLY_STANDINGS_TYPES = new Set(["divisionLeaders", "wildCardWithLeaders"]);

export function standingsPresentation(model) {
  const groups = (Array.isArray(model?.standings?.groups) ? model.standings.groups : [])
    .filter((group) => !DATA_ONLY_STANDINGS_TYPES.has(String(group?.standingsType || parseStandingsKey(group?.key).standingsType)));
  const sideEntries = [{ key: "away", data: model?.away }, { key: "home", data: model?.home }].filter((entry) => entry.data);
  const sides = sideEntries.map((entry) => entry.data);
  const selectedTeamIds = new Set(sides.map((side) => Number(side?.team?.id)).filter(Number.isFinite));
  const relevant = [];
  const other = [];
  for (const group of groups) {
    const standingsType = String(group?.standingsType || parseStandingsKey(group?.key).standingsType);
    const isWildCard = standingsType === "wildCard";
    const rowIds = new Set((group?.rows || []).map((row) => Number(row?.team?.id)).filter(Number.isFinite));
    const matchingEntries = sideEntries.filter((entry) => rowIds.has(Number(entry.data?.team?.id)));
    const matchingSides = matchingEntries.map((entry) => entry.data);
    const leagueSideKey = standingsLeagueSideKey(group, sideEntries);
    const item = Object.freeze({ group, matchingSides: Object.freeze(matchingSides), matchingSideKeys: Object.freeze(matchingEntries.map((entry) => entry.key)), leagueSideKey, title: standingsGroupTitle(group, matchingSides) });
    (matchingSides.length && !isWildCard ? relevant : other).push(item);
  }
  return Object.freeze({
    relevant: Object.freeze(dedupeStandings(relevant).sort(compareRelevantStandings)),
    other: Object.freeze(dedupeStandings(other).sort(compareOtherStandings)),
    selectedTeamIds
  });
}

function standingsLeagueSideKey(group, sideEntries) {
  const parsed = parseStandingsKey(group?.key);
  const leagueId = Number(group?.league?.id ?? parsed.leagueId);
  if (!Number.isFinite(leagueId)) return null;
  const matchingKeys = sideEntries
    .filter((entry) => Number(entry.data?.team?.league?.id) === leagueId)
    .map((entry) => entry.key);
  return matchingKeys.length === 1 ? matchingKeys[0] : matchingKeys.length > 1 ? "shared" : null;
}

function compareOtherStandings(left, right) {
  const order = (item) => item.leagueSideKey === "away" ? 0 : item.leagueSideKey === "home" ? 1 : 2;
  return order(left) - order(right);
}

function compareRelevantStandings(left, right) {
  const order = (item) => item.matchingSideKeys?.includes("away") ? 0 : item.matchingSideKeys?.includes("home") ? 1 : 2;
  return order(left) - order(right);
}

export function standingsGroupTitle(group, matchingSides = []) {
  const parsed = parseStandingsKey(group?.key);
  const standingsType = String(group?.standingsType || parsed.standingsType || "");
  const matchingLeague = matchingSides.find((side) => side?.team?.league?.name)?.team?.league?.name;
  const matchingDivision = matchingSides.find((side) => side?.team?.division?.name)?.team?.division?.name;
  const leagueName = group?.league?.name || matchingLeague || null;
  const divisionName = group?.division?.name || matchingDivision || MLB_DIVISION_NAMES[Number(group?.division?.id ?? parsed.divisionId)] || null;
  if (standingsType === "wildCard") return `${leagueName || "League"} Wild Card`;
  if (leagueName && divisionName && !divisionName.toLowerCase().includes(leagueName.toLowerCase())) return `${leagueName} — ${divisionName}`;
  if (divisionName) return divisionName;
  if (leagueName) return leagueName;
  const divisionId = group?.division?.id ?? parsed.divisionId;
  const leagueId = group?.league?.id ?? parsed.leagueId;
  if (divisionId != null) return `Division ${divisionId}`;
  if (leagueId != null) return `League ${leagueId}`;
  return "Additional Standings";
}

function parseStandingsKey(key) {
  const parts = String(key || "").split(":");
  return {
    standingsType: parts[0] || null,
    leagueId: parts.length > 2 && parts[2] !== "none" ? parts[2] : null,
    divisionId: parts.length > 3 && parts[3] !== "none" ? parts[3] : null
  };
}

function dedupeStandings(items) {
  const seen = new Set();
  return items.filter((item) => {
    const rowKey = (item.group?.rows || []).map((row) => row?.team?.id).filter(Boolean).join(",");
    const key = item.group?.key || rowKey || item.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function managerPresentation(manager) {
  const selected = manager?.selected || (manager?.name ? { person: { name: manager.name, number: manager.number } } : null);
  const candidates = Array.isArray(manager?.candidates) ? manager.candidates : [];
  if (selected) {
    const person = selected.person || selected;
    return {
      state: "selected",
      title: selected.title || selected.job || "Manager",
      people: [{ name: person.name || "Manager", number: person.number || null }]
    };
  }
  if (manager?.state === "ambiguous" && candidates.length) {
    return {
      state: "ambiguous",
      title: "Manager candidates — source is ambiguous",
      people: candidates.map((candidate) => ({
        name: candidate?.person?.name || "Manager candidate",
        number: candidate?.person?.number || null,
        role: candidate.title || candidate.job || "Manager"
      }))
    };
  }
  return { state: manager?.state || "missing", title: "Manager", people: [] };
}

export function gameDaySourceSummary(model) {
  const rows = Array.isArray(model?.meta?.sourceResults) ? model.meta.sourceResults : [];
  const byAdapter = new Map();
  for (const row of rows) {
    const prior = byAdapter.get(row.adapter);
    if (!prior || sourceRank(row.outcome) > sourceRank(prior.outcome)) byAdapter.set(row.adapter, row);
  }
  return [...byAdapter.values()].sort((a, b) => String(a.adapter).localeCompare(String(b.adapter))).map((row) => ({
    adapter: row.adapter,
    outcome: row.outcome,
    effective: effectiveLabel(row.effective)
  }));
}

export function researchScope(model) {
  const context = model?.context || {};
  return {
    season: context.season ?? null,
    sport: context.sport?.name || null,
    gameType: context.gameType || null,
    competitionSegment: context.competitionSegment || null,
    selectedDate: context.selectedDate || null,
    officialDate: context.officialDate || null
  };
}

function sourceRank(outcome) {
  return ({ success: 4, partial: 3, failed: 2, notRequested: 1 })[outcome] || 0;
}

function effectiveLabel(effective) {
  if (!effective) return "Scope not reported";
  if (effective.kind === "dateRange") return `${effective.startDate || "?"} through ${effective.endDate || "?"}`;
  if (effective.kind === "endOfDay") return `Through ${effective.cutoffDate || "prior cutoff"}`;
  if (effective.kind === "date") return effective.date || "Date scoped";
  if (effective.kind === "current") return "Current annotation";
  if (effective.kind === "gameState") return effective.rawGameState || effective.canonicalGameState || "Game-state scoped";
  return effective.instantUtc || effective.kind || "Scope not reported";
}
