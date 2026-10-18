/**
 * Scorecard Studio v0.7 Build 004 PDF competition-stat scope policy.
 *
 * Pure helpers classify mapped fields and report whether the explicitly
 * requested cached scope can supply the affected team/player values.
 */

const TEAM_SCOPE_FIELD = /^(away|home)\.team\.(record(?:\.|$)|standings(?:\.|$))/;
const PLAYER_SCOPE_FIELD = /^(away|home)\.(?:lineup\[\]|bench\[\]|bullpen\[\]|additionalStarters\[\]|startingPitcher)\.stats(?:\.|$)/;

function successfulPeopleScope(entry) {
  if (!entry?.people) return false;
  const units = Array.isArray(entry.people.units) ? entry.people.units : [];
  return !units.length || units.every((unit) => unit?.outcome !== "failed");
}

function scopeNeedsStandings(context = {}, scopeKey = null) {
  if (scopeKey === "firstHalf" || scopeKey === "secondHalf") return true;
  return context.family === "postseason" && scopeKey === "regularSeason";
}

function successfulStandingScope(configs) {
  return Array.isArray(configs) && configs.length > 0 && configs.every((config) => config?.outcome === "success");
}

export function classifyPdfStatScopeFields(fieldIds = []) {
  const team = [];
  const player = [];
  for (const value of fieldIds) {
    const fieldId = String(value || "");
    if (TEAM_SCOPE_FIELD.test(fieldId)) team.push(fieldId);
    if (PLAYER_SCOPE_FIELD.test(fieldId)) player.push(fieldId);
  }
  return Object.freeze({
    team: Object.freeze([...new Set(team)]),
    player: Object.freeze([...new Set(player)]),
    usesTeam: team.length > 0,
    usesPlayer: player.length > 0,
    affected: team.length > 0 || player.length > 0
  });
}

export function pdfStatScopeSourceStatus({ context = {}, scopeKey = null, supplemental = {}, fieldUsage = {} } = {}) {
  const peopleEntry = supplemental?.gameDayPeopleScopes?.[scopeKey];
  const peopleAvailable = successfulPeopleScope(peopleEntry);
  const standingsRequired = scopeNeedsStandings(context, scopeKey);
  const standingsEntry = supplemental?.gameDayStandingScopes?.[scopeKey];
  const standingsAvailable = !standingsRequired || successfulStandingScope(standingsEntry);
  const missing = [];
  if (fieldUsage.usesPlayer && !peopleAvailable) missing.push("player statistics");
  if (fieldUsage.usesTeam && !standingsAvailable) missing.push("team record and standings");
  return Object.freeze({
    scopeKey,
    peopleAvailable,
    standingsRequired,
    standingsAvailable,
    missing: Object.freeze(missing),
    complete: missing.length === 0
  });
}

export function pdfStatScopeWarningMessage(scopeLabel, status = {}) {
  const missing = Array.isArray(status.missing) ? status.missing : [];
  const description = missing.length === 2
    ? `${missing[0]} and ${missing[1]}`
    : missing[0] || "some mapped statistics";
  return `${scopeLabel || "The selected period"} data is unavailable for ${description} used by this layout. Generate anyway with those mapped values left blank?`;
}

export function preserveScopedTeamGameNumbers(scopedModel, baseModel) {
  for (const side of ["away", "home"]) {
    if (!scopedModel?.[side]?.team || !baseModel?.[side]?.team) continue;
    scopedModel[side].team.gameNumber = baseModel[side].team.gameNumber;
    const target = `/${side}/team/gameNumber`;
    const baseLineage = baseModel.meta?.lineage?.find((entry) => entry.target === target);
    const scopedIndex = scopedModel.meta?.lineage?.findIndex((entry) => entry.target === target) ?? -1;
    if (baseLineage && scopedIndex >= 0) scopedModel.meta.lineage[scopedIndex] = structuredClone(baseLineage);
  }
  if (scopedModel?.game?.series && baseModel?.game?.series && Object.hasOwn(baseModel.game.series, "status")) {
    scopedModel.game.series.status = baseModel.game.series.status;
  }
  return scopedModel;
}
