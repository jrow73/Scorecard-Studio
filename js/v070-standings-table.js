/**
 * Scorecard Studio v0.7 Build 007 — configurable division standings tables.
 * This module is deliberately UI/PDF-library independent so coverage and
 * density decisions are testable before anything is drawn.
 */

export const STANDINGS_TABLE_COLUMNS = Object.freeze([
  { key: "rank", label: "Rank", shortLabel: "RK", weight: 0.65 },
  { key: "team", label: "Team", shortLabel: "TEAM", weight: 1.6 },
  { key: "record", label: "W-L", shortLabel: "W-L", weight: 1.15 },
  { key: "pct", label: "PCT", shortLabel: "PCT", weight: 0.95 },
  { key: "gamesBack", label: "GB", shortLabel: "GB", weight: 0.8 },
  { key: "streak", label: "Streak", shortLabel: "STRK", weight: 0.9 },
  { key: "lastTen", label: "Last 10", shortLabel: "L10", weight: 1.05 }
]);

export const STANDINGS_TABLE_COVERAGE = Object.freeze([
  { key: "awayDivision", label: "Away Division" },
  { key: "homeDivision", label: "Home Division" },
  { key: "bothDivisions", label: "Both Team Divisions" },
  { key: "awayLeague", label: "Away League Divisions" },
  { key: "homeLeague", label: "Home League Divisions" },
  { key: "bothLeagues", label: "Both Leagues Divisions" }
]);

export const STANDINGS_TABLE_PANEL_GAP_POINTS = 3;
export const STANDINGS_TABLE_CELL_INSET_POINTS = 0.75;

export const DEFAULT_STANDINGS_TABLE_CONFIG = Object.freeze({
  coverage: "bothDivisions",
  period: "contextual",
  panelsPerRow: 2,
  teamDisplay: "name",
  columns: ["rank", "team", "record", "pct", "gamesBack"],
  rowLimit: 10,
  fontSize: 8,
  showTitle: true,
  showHeader: true,
  highlightSelectedTeams: true,
  widthPercent: 0.62
});

const DIVISION_TYPES = new Set(["regularSeason", "springTraining", "firstHalf", "secondHalf"]);
const VALID_COVERAGE = new Set(STANDINGS_TABLE_COVERAGE.map((entry) => entry.key));
const VALID_COLUMNS = new Set(STANDINGS_TABLE_COLUMNS.map((entry) => entry.key));

function finiteId(value) {
  const id = Number(value?.id ?? value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function normalizeStandingsTableConfig(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const columns = [...new Set((Array.isArray(source.columns) ? source.columns : DEFAULT_STANDINGS_TABLE_CONFIG.columns)
    .map(String).filter((key) => VALID_COLUMNS.has(key)))];
  if (!columns.includes("team")) columns.splice(Math.min(1, columns.length), 0, "team");
  return {
    coverage: VALID_COVERAGE.has(source.coverage) ? source.coverage : DEFAULT_STANDINGS_TABLE_CONFIG.coverage,
    period: ["contextual", "regularSeason", "springTraining", "firstHalf", "secondHalf"].includes(source.period) ? source.period : "contextual",
    panelsPerRow: Math.max(1, Math.min(3, Number(source.panelsPerRow) || DEFAULT_STANDINGS_TABLE_CONFIG.panelsPerRow)),
    teamDisplay: source.teamDisplay === "abbreviation" ? "abbreviation" : "name",
    columns,
    rowLimit: Math.max(1, Math.min(10, Number(source.rowLimit) || DEFAULT_STANDINGS_TABLE_CONFIG.rowLimit)),
    fontSize: Math.max(4, Math.min(14, Number(source.fontSize) || DEFAULT_STANDINGS_TABLE_CONFIG.fontSize)),
    showTitle: source.showTitle !== false,
    showHeader: source.showHeader !== false,
    highlightSelectedTeams: source.highlightSelectedTeams !== false,
    widthPercent: Math.max(0.06, Math.min(0.96, Number(source.widthPercent) || DEFAULT_STANDINGS_TABLE_CONFIG.widthPercent))
  };
}

export function contextualStandingsType(model, groups = model?.standings?.groups || []) {
  const available = new Set(groups.map((group) => group?.standingsType).filter(Boolean));
  const segment = String(model?.context?.competitionSegment || "").toLowerCase();
  if (segment === "spring" && available.has("springTraining")) return "springTraining";
  if (segment === "postseason") return available.has("regularSeason") ? "regularSeason" : null;
  if (available.has("secondHalf")) return "secondHalf";
  if (available.has("firstHalf")) return "firstHalf";
  if (available.has("regularSeason")) return "regularSeason";
  if (available.has("springTraining")) return "springTraining";
  return null;
}

function selectedIds(model, coverage) {
  const awayDivision = finiteId(model?.away?.team?.division);
  const homeDivision = finiteId(model?.home?.team?.division);
  const awayLeague = finiteId(model?.away?.team?.league);
  const homeLeague = finiteId(model?.home?.team?.league);
  if (coverage === "awayDivision") return { divisionIds: new Set([awayDivision].filter(Boolean)), leagueIds: new Set() };
  if (coverage === "homeDivision") return { divisionIds: new Set([homeDivision].filter(Boolean)), leagueIds: new Set() };
  if (coverage === "bothDivisions") return { divisionIds: new Set([awayDivision, homeDivision].filter(Boolean)), leagueIds: new Set() };
  if (coverage === "awayLeague") return { divisionIds: new Set(), leagueIds: new Set([awayLeague].filter(Boolean)) };
  if (coverage === "homeLeague") return { divisionIds: new Set(), leagueIds: new Set([homeLeague].filter(Boolean)) };
  return { divisionIds: new Set(), leagueIds: new Set([awayLeague, homeLeague].filter(Boolean)) };
}

export function resolveDivisionStandingsGroups(model, config = {}) {
  const normalized = normalizeStandingsTableConfig(config);
  const groups = Array.isArray(model?.standings?.groups) ? model.standings.groups : [];
  const period = normalized.period === "contextual" ? contextualStandingsType(model, groups) : normalized.period;
  if (!period || !DIVISION_TYPES.has(period)) return [];
  const ids = selectedIds(model, normalized.coverage);
  const selected = groups.filter((group) => {
    if (!group || group.standingsType !== period || !DIVISION_TYPES.has(group.standingsType)) return false;
    const divisionId = finiteId(group.division);
    const leagueId = finiteId(group.league);
    return ids.divisionIds.size ? ids.divisionIds.has(divisionId) : ids.leagueIds.has(leagueId);
  });
  const seen = new Set();
  return selected.filter((group) => {
    const divisionId = finiteId(group.division);
    const key = divisionId ? `${period}:division:${divisionId}` : String(group.key || `${period}:${finiteId(group.league) || ""}:unknown`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => String(a?.league?.name || "").localeCompare(String(b?.league?.name || ""))
    || String(a?.division?.name || "").localeCompare(String(b?.division?.name || "")));
}

export function standingsTeamMetadataMap(model, teams = []) {
  const result = new Map();
  for (const team of teams || []) {
    const id = finiteId(team);
    if (id) result.set(id, { id, name: team.name || "", abbreviation: team.abbreviation || "" });
  }
  for (const side of [model?.away, model?.home]) {
    const id = finiteId(side?.team);
    if (!id) continue;
    const prior = result.get(id) || {};
    result.set(id, { id, name: prior.name || side.team.name || "", abbreviation: prior.abbreviation || side.team.abbreviation || "" });
  }
  return result;
}

export function standingsRowCells(row, config = {}, metadata = new Map()) {
  const normalized = normalizeStandingsTableConfig(config);
  const teamId = finiteId(row?.team);
  const meta = metadata instanceof Map ? metadata.get(teamId) : metadata?.[teamId];
  const teamName = normalized.teamDisplay === "abbreviation"
    ? String(meta?.abbreviation || row?.team?.abbreviation || "").trim()
    : String(row?.team?.name || meta?.name || "").trim();
  const values = {
    rank: row?.rank?.display ?? row?.rank?.raw ?? row?.rank?.value ?? "",
    team: teamName,
    record: row?.record?.display ?? ((row?.record?.wins != null && row?.record?.losses != null) ? `${row.record.wins}-${row.record.losses}` : ""),
    pct: row?.record?.pct?.display ?? (Number.isFinite(Number(row?.record?.pct)) ? Number(row.record.pct).toFixed(3).replace(/^0/, "") : ""),
    gamesBack: row?.gamesBack?.display ?? row?.gamesBack?.raw ?? row?.gamesBack?.games ?? row?.gamesBack?.value ?? "",
    streak: row?.streak?.display ?? row?.streak ?? "",
    lastTen: row?.lastTen?.display ?? ((row?.lastTen?.wins != null && row?.lastTen?.losses != null) ? `${row.lastTen.wins}-${row.lastTen.losses}` : "")
  };
  return normalized.columns.map((key) => String(values[key] ?? ""));
}

export function standingsTableGeometry(groupCount, config = {}, visibleRowCount = null) {
  const normalized = normalizeStandingsTableConfig(config);
  const panels = Math.max(1, normalized.panelsPerRow);
  const rows = Math.max(1, Math.ceil(Math.max(0, Number(groupCount) || 0) / panels));
  const lineHeight = normalized.fontSize * 1.32;
  const titleRows = normalized.showTitle ? 1 : 0;
  const headerRows = normalized.showHeader ? 1 : 0;
  const renderedRows = Math.max(1, Math.min(normalized.rowLimit, Number.isFinite(Number(visibleRowCount)) ? Number(visibleRowCount) : normalized.rowLimit));
  const panelHeight = (titleRows + headerRows + renderedRows) * lineHeight + 6;
  return { panelsPerRow: panels, panelRows: rows, lineHeight, panelHeight, heightPoints: rows * panelHeight + Math.max(0, rows - 1) * STANDINGS_TABLE_PANEL_GAP_POINTS };
}

/**
 * Gives the Designer and Test PDF a realistic, deterministic standings set.
 * Live PDFs continue to use only API-normalized data.
 */
export function createRepresentativeStandingsFixture(sourceModel = {}) {
  const model = typeof structuredClone === "function"
    ? structuredClone(sourceModel)
    : JSON.parse(JSON.stringify(sourceModel));
  const leagues = [
    { id: 990, name: "Continental League", divisions: [
      { id: 9901, name: "Continental League North" },
      { id: 9902, name: "Continental League Central" },
      { id: 9903, name: "Continental League South" }
    ] },
    { id: 991, name: "Federal League", divisions: [
      { id: 9911, name: "Federal League East" },
      { id: 9912, name: "Federal League Central" },
      { id: 9913, name: "Federal League West" }
    ] }
  ];
  const names = [
    ["Seals", "Owls", "Foxes", "Pilots", "Bears"],
    ["Comets", "Hawks", "Millers", "Knights", "Rapids"],
    ["Copperheads", "Pelicans", "Giants", "Scorpions", "Captains"],
    ["Clippers", "Bridges", "Pines", "Orioles", "Waves"],
    ["Rails", "Jays", "Foxes", "Loons", "Colts"],
    ["Copperheads", "Elk", "Stars", "Roadrunners", "Oaks"]
  ];
  const abbreviations = [
    ["HBS", "PCO", "LVF", "RBP", "SMB"], ["CPC", "PRH", "IWM", "MTK", "CDR"],
    ["GVC", "CPL", "RDG", "DSC", "BCC"], ["ATC", "BKB", "CRP", "ORO", "PCW"],
    ["UNR", "MLJ", "FDF", "LSL", "CRC"], ["GVC", "CSE", "PCS", "MSR", "GSO"]
  ];
  const teams = [];
  const groups = [];
  let groupIndex = 0;
  for (const league of leagues) {
    for (const division of league.divisions) {
      const rows = names[groupIndex].map((name, index) => {
        const selectedAway = groupIndex === 0 && index === 2;
        const selectedHome = groupIndex === 5 && index === 0;
        const id = selectedAway ? 901 : selectedHome ? 902 : 12000 + groupIndex * 10 + index;
        const wins = 91 - groupIndex * 2 - index * 5;
        const losses = 60 + groupIndex * 2 + index * 5;
        teams.push({ id, name, abbreviation: abbreviations[groupIndex][index] });
        return {
          team: { id, name },
          rank: { raw: String(index + 1), value: index + 1 },
          record: { wins, losses, gamesPlayed: wins + losses, pct: wins / (wins + losses) },
          gamesBack: { raw: index ? String(index * 2.5) : "—", games: index ? index * 2.5 : null },
          streak: `${index % 2 ? "L" : "W"}${(index % 4) + 1}`,
          lastTen: { wins: 8 - index, losses: 2 + index },
          sourceOrder: index
        };
      });
      for (const standingsType of ["regularSeason", "springTraining", "firstHalf", "secondHalf"]) {
        groups.push({
          key: `${standingsType}:representative:${league.id}:${division.id}`,
          standingsType,
          league: { id: league.id, name: league.name },
          division: { id: division.id, name: division.name },
          rows: rows.map((row) => ({ ...row }))
        });
      }
      groupIndex += 1;
    }
  }
  model.away = model.away || {};
  model.home = model.home || {};
  model.away.team = { ...(model.away.team || {}), id: 901, name: "Foxes", abbreviation: "LVF", league: leagues[0], division: leagues[0].divisions[0] };
  model.home.team = { ...(model.home.team || {}), id: 902, name: "Copperheads", abbreviation: "GVC", league: leagues[1], division: leagues[1].divisions[2] };
  model.context = { ...(model.context || {}), competitionSegment: "regular" };
  model.standings = { ...(model.standings || {}), groups };
  return { model, teams };
}

export function standingsColumnLayout(widthPoints, config = {}) {
  const normalized = normalizeStandingsTableConfig(config);
  const definitions = normalized.columns.map((key) => STANDINGS_TABLE_COLUMNS.find((entry) => entry.key === key));
  const total = definitions.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  let offset = 0;
  return definitions.map((entry) => {
    const width = widthPoints * entry.weight / total;
    const column = { ...entry, x: offset, width };
    offset += width;
    return column;
  });
}

export function standingsGroupTitle(group) {
  return String(group?.division?.name || group?.league?.name || "Division Standings");
}

export function standingsSelectedTeamIds(model) {
  return new Set([finiteId(model?.away?.team), finiteId(model?.home?.team)].filter(Boolean));
}
