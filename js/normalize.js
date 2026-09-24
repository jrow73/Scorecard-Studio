/**
 * Scorecard Studio
 * Pregame API normalization
 * Version: 0.2.0-dev
 * Build: 025.2
 */

export function normalizePregameData(feed, supplemental = {}, scheduleGame = null) {
  const gd = feed?.gameData || {};
  const live = feed?.liveData || {};
  const date = scheduleGame?.officialDate || gd.datetime?.officialDate || null;
  const sportId = scheduleGame?.sportId ?? gd.game?.sport?.id ?? 1;
  const model = {
    schemaVersion: 1,
    context: {
      gamePk: String(scheduleGame?.gamePk || gd.game?.pk || ""),
      season: Number(scheduleGame?.season || gd.game?.season || String(date || "").slice(0, 4)) || null,
      sportId,
      selectedDate: date,
      retrievedAt: new Date().toISOString()
    },
    game: normalizeGame(gd, live, scheduleGame),
    away: null,
    home: null,
    standings: { groups: [] },
    meta: { sources: {
      gamePack: Boolean(feed),
      schedule: Boolean(scheduleGame),
      rosters: Boolean(supplemental.rosters?.away || supplemental.rosters?.home),
      peopleStats: Array.isArray(supplemental.people?.people) && supplemental.people.people.length > 0,
      coaches: Boolean(supplemental.coaches?.away || supplemental.coaches?.home),
      standings: Array.isArray(supplemental.standingsPayloads) && supplemental.standingsPayloads.length > 0
    } }
  };

  const peopleMap = buildPeopleMap(supplemental.people);
  model.away = normalizeSide(feed, "away", scheduleGame, supplemental.rosters?.away, peopleMap, supplemental.coaches?.away, supplemental.standingsPayloads);
  model.home = normalizeSide(feed, "home", scheduleGame, supplemental.rosters?.home, peopleMap, supplemental.coaches?.home, supplemental.standingsPayloads);
  return model;
}

function normalizeGame(gd, live, scheduleGame) {
  const venue = gd.venue || scheduleGame?.venueData || {};
  const weather = scheduleGame?.weather || gd.weather || {};
  const field = venue.fieldInfo || {};
  const location = venue.location || {};
  return {
    date: scheduleGame?.officialDate ?? gd.datetime?.officialDate ?? null,
    startTime: scheduleGame?.gameDate ?? gd.datetime?.dateTime ?? null,
    dayNight: normalizeDayNight(scheduleGame?.dayNight ?? gd.datetime?.dayNight),
    type: scheduleGame?.gameType ?? gd.game?.type ?? null,
    number: numberOrNull(scheduleGame?.gameNumber ?? gd.game?.gameNumber),
    venue: {
      id: venue.id ?? null,
      name: venue.name ?? scheduleGame?.venue ?? null,
      capacity: numberOrNull(field.capacity),
      turfType: field.turfType ?? null,
      roofType: field.roofType ?? null,
      city: location.city ?? null,
      state: location.stateAbbrev ?? location.state ?? null,
      country: location.country ?? null,
      timeZone: venue.timeZone?.id ?? venue.timeZone?.tz ?? null
    },
    weather: {
      temperature: numberOrNull(weather.temp),
      condition: weather.condition ?? null,
      wind: weather.wind ?? null
    },
    umpires: normalizeUmpires(live?.boxscore?.officials)
  };
}

function normalizeSide(feed, side, scheduleGame, rosterPayload, peopleMap, coachesPayload, standingsPayloads) {
  const gd = feed?.gameData || {};
  const scheduleTeam = side === "away" ? scheduleGame?.awayTeamData : scheduleGame?.homeTeamData;
  const team = scheduleTeam || gd.teams?.[side] || {};
  const teamId = team.id ?? (side === "away" ? scheduleGame?.awayTeamId : scheduleGame?.homeTeamId);
  const standing = findStanding(standingsPayloads, teamId);
  const lineupSource = side === "away" ? scheduleGame?.awayLineup : scheduleGame?.homeLineup;
  const probable = side === "away" ? scheduleGame?.awayProbablePitcher : scheduleGame?.homeProbablePitcher;
  const rosterEntries = Array.isArray(rosterPayload?.roster) ? rosterPayload.roster : [];
  const lineup = normalizeScheduleLineup(lineupSource, rosterEntries, peopleMap);
  const starter = normalizeStartingPitcher(probable, rosterEntries, peopleMap);
  const lineupIds = new Set(lineup.map((slot) => slot?.player?.id).filter(Boolean).map(String));
  const bench = lineupIds.size ? normalizeBench(rosterEntries, lineupIds, peopleMap) : [];
  const bullpen = normalizeBullpen(rosterEntries, starter?.player?.id, peopleMap);
  const record = normalizePregameRecord(standing);

  return {
    team: {
      id: teamId ?? null,
      name: team.name ?? (side === "away" ? scheduleGame?.awayTeam : scheduleGame?.homeTeam) ?? null,
      locationName: team.locationName ?? null,
      shortName: team.shortName ?? null,
      clubName: team.clubName ?? team.teamName ?? null,
      abbreviation: team.abbreviation ?? null,
      league: { id: team.league?.id ?? null, name: team.league?.name ?? null },
      division: { id: team.division?.id ?? null, name: team.division?.nameShort ?? team.division?.name ?? null },
      record,
      standings: normalizeStanding(standing)
    },
    manager: normalizeManager(coachesPayload),
    coaches: [],
    lineup,
    startingPitcher: starter,
    bench,
    bullpen,
    defense: {}
  };
}

function normalizeScheduleLineup(players, rosterEntries, peopleMap) {
  const source = Array.isArray(players) ? players : [];
  if (!source.length) return [];
  return source.map((person, index) => {
    const id = person?.id;
    const rosterEntry = findRosterEntry(rosterEntries, id);
    const player = normalizePlayer(person, rosterEntry, peopleMap.get(String(id)));
    const pos = person?.primaryPosition || {};
    return {
      battingOrder: index + 1,
      player,
      position: {
        abbreviation: pos.abbreviation ?? null,
        name: defensivePositionName(pos.abbreviation) ?? pos.name ?? null,
        number: defensivePositionNumber(pos.abbreviation)
      },
      stats: normalizeHydratedStats(peopleMap.get(String(id)))
    };
  });
}

function normalizeStartingPitcher(probable, rosterEntries, peopleMap) {
  if (!probable?.id && !probable?.fullName) return null;
  const id = probable?.id;
  const rosterEntry = findRosterEntry(rosterEntries, id);
  const enriched = peopleMap.get(String(id));
  return {
    battingOrder: null,
    player: normalizePlayer(probable, rosterEntry, enriched),
    position: { abbreviation: "P", name: "Pitcher", number: 1 },
    stats: normalizeHydratedStats(enriched)
  };
}

function normalizeBench(rosterEntries, lineupIds, peopleMap) {
  return rosterEntries
    .filter((entry) => {
      const id = String(entry?.person?.id ?? "");
      if (!id || lineupIds.has(id)) return false;
      return !isPitcher(entry?.position || entry?.person?.primaryPosition);
    })
    .map((entry) => normalizeRosterRecord(entry, peopleMap))
    .sort(comparePlayerName);
}

function normalizeBullpen(rosterEntries, starterId, peopleMap) {
  const starterKey = starterId != null ? String(starterId) : null;
  return rosterEntries
    .filter((entry) => {
      const id = String(entry?.person?.id ?? "");
      return id && id !== starterKey && isPitcher(entry?.position || entry?.person?.primaryPosition);
    })
    .map((entry) => normalizeRosterRecord(entry, peopleMap))
    .sort(comparePlayerName);
}

function normalizeRosterRecord(entry, peopleMap) {
  const id = entry?.person?.id;
  const enriched = peopleMap.get(String(id));
  const pos = entry?.position || entry?.person?.primaryPosition || enriched?.primaryPosition || {};
  return {
    battingOrder: null,
    player: normalizePlayer(entry?.person || {}, entry, enriched),
    position: {
      abbreviation: pos.abbreviation ?? null,
      name: defensivePositionName(pos.abbreviation) ?? pos.name ?? null,
      number: defensivePositionNumber(pos.abbreviation)
    },
    stats: normalizeHydratedStats(enriched)
  };
}

function normalizePlayer(basePerson, rosterEntry, enrichedPerson) {
  const p = enrichedPerson || rosterEntry?.person || basePerson || {};
  const fallback = rosterEntry?.person || basePerson || {};
  const primary = p.primaryPosition || fallback.primaryPosition || rosterEntry?.position || {};
  return {
    id: numberOrNull(p.id ?? fallback.id),
    name: p.fullName ?? fallback.fullName ?? null,
    number: rosterEntry?.jerseyNumber ?? p.primaryNumber ?? fallback.primaryNumber ?? null,
    firstName: p.firstName ?? fallback.firstName ?? null,
    lastName: p.lastName ?? fallback.lastName ?? null,
    useName: p.useName ?? fallback.useName ?? null,
    useLastName: p.useLastName ?? fallback.useLastName ?? null,
    boxscoreName: p.boxscoreName ?? fallback.boxscoreName ?? null,
    firstLastName: p.firstLastName ?? p.nameFirstLast ?? fallback.firstLastName ?? fallback.nameFirstLast ?? null,
    lastFirstName: p.lastFirstName ?? fallback.lastFirstName ?? null,
    initLastName: p.initLastName ?? fallback.initLastName ?? null,
    lastInitName: p.lastInitName ?? fallback.lastInitName ?? null,
    nameSuffix: p.nameSuffix ?? fallback.nameSuffix ?? null,
    nameTitle: p.nameTitle ?? fallback.nameTitle ?? null,
    pronunciation: p.pronunciation ?? fallback.pronunciation ?? null,
    bats: p.batSide?.code ?? fallback.batSide?.code ?? null,
    throws: handCode(p.pitchHand?.code ?? fallback.pitchHand?.code),
    primaryPosition: { abbreviation: primary.abbreviation ?? null, name: primary.name ?? null }
  };
}

function normalizeHydratedStats(person) {
  const groups = Array.isArray(person?.stats) ? person.stats : [];
  const battingGroup = groups.find((group) => String(group?.group?.displayName || "").toLowerCase() === "hitting");
  const pitchingGroup = groups.find((group) => String(group?.group?.displayName || "").toLowerCase() === "pitching");
  const batting = selectAggregateSplit(battingGroup)?.stat || {};
  const pitching = selectAggregateSplit(pitchingGroup)?.stat || {};
  return normalizeStats({ batting, pitching });
}

function selectAggregateSplit(group) {
  const splits = Array.isArray(group?.splits) ? group.splits : [];
  if (!splits.length) return null;
  return splits.find((split) => Number(split?.sport?.id) === 0 || String(split?.sport?.code || "").toLowerCase() === "all") || splits[0];
}

function normalizeStats(seasonStats) {
  const batting = seasonStats?.batting || {};
  const pitching = seasonStats?.pitching || {};
  return {
    gamesPlayed: numberOrNull(batting.gamesPlayed ?? pitching.gamesPlayed),
    gamesPitched: numberOrNull(pitching.gamesPitched), gamesStarted: numberOrNull(pitching.gamesStarted),
    avg: decimalOrNull(batting.avg), obp: decimalOrNull(batting.obp), slg: decimalOrNull(batting.slg), ops: decimalOrNull(batting.ops),
    plateAppearances: numberOrNull(batting.plateAppearances), stolenBases: numberOrNull(batting.stolenBases),
    slashLine: slashLine(batting.avg, batting.obp, batting.slg),
    homeRuns: numberOrNull(batting.homeRuns ?? pitching.homeRuns), rbi: numberOrNull(batting.rbi),
    wins: numberOrNull(pitching.wins), losses: numberOrNull(pitching.losses), record: winLossRecord(pitching.wins, pitching.losses), era: decimalOrNull(pitching.era), whip: decimalOrNull(pitching.whip),
    inningsPitched: pitching.inningsPitched ?? null, hits: numberOrNull(pitching.hits), runs: numberOrNull(pitching.runs),
    earnedRuns: numberOrNull(pitching.earnedRuns), walks: numberOrNull(pitching.baseOnBalls), strikeouts: numberOrNull(pitching.strikeOuts),
    saves: numberOrNull(pitching.saves), saveOpportunities: numberOrNull(pitching.saveOpportunities), holds: numberOrNull(pitching.holds), blownSaves: numberOrNull(pitching.blownSaves),
    winPercentage: decimalOrNull(pitching.winPercentage), strikeoutWalkRatio: decimalOrNull(pitching.strikeoutWalkRatio),
    strikeoutsPer9Inn: decimalOrNull(pitching.strikeoutsPer9Inn), walksPer9Inn: decimalOrNull(pitching.walksPer9Inn),
    hitsPer9Inn: decimalOrNull(pitching.hitsPer9Inn), homeRunsPer9: decimalOrNull(pitching.homeRunsPer9), pitchesPerInning: decimalOrNull(pitching.pitchesPerInning)
  };
}

function normalizePregameRecord(standing) {
  const record = standing?.leagueRecord || standing?.record || {};
  const wins = numberOrNull(record.wins);
  const losses = numberOrNull(record.losses);
  const gamesPlayed = wins != null && losses != null ? wins + losses : numberOrNull(record.gamesPlayed);
  return {
    gamesPlayed,
    wins,
    losses,
    pct: decimalOrNull(record.pct ?? record.winningPercentage),
    divisionLeader: booleanOrNull(standing?.divisionLeader)
  };
}

function buildPeopleMap(payload) {
  const map = new Map();
  for (const person of Array.isArray(payload?.people) ? payload.people : []) if (person?.id != null) map.set(String(person.id), person);
  return map;
}

function findRosterEntry(entries, personId) {
  return (entries || []).find((entry) => String(entry?.person?.id ?? "") === String(personId ?? "")) || null;
}

function isPitcher(position) {
  const code = String(position?.code ?? "").toUpperCase();
  const abbr = String(position?.abbreviation ?? "").toUpperCase();
  const type = String(position?.type ?? "").toLowerCase();
  const name = String(position?.name ?? "").toLowerCase();
  return code === "1" || abbr === "P" || type === "pitcher" || name === "pitcher";
}

function comparePlayerName(a, b) {
  return String(a?.player?.name || "").localeCompare(String(b?.player?.name || ""));
}

function normalizeManager(payload) {
  const roster = Array.isArray(payload?.roster) ? payload.roster : [];
  const candidates = roster.filter((entry) => /^manager$/i.test(String(entry?.job || entry?.title || ""))) || [];
  const manager = candidates[0] || roster.find((entry) => /manager/i.test(String(entry?.job || entry?.title || "")));
  return manager ? { id: manager.person?.id ?? null, name: manager.person?.fullName ?? null, number: manager.jerseyNumber ?? null } : { id: null, name: null, number: null };
}

function normalizeStanding(standing) {
  if (!standing) return { divisionRank: null, leagueRank: null, wildCardRank: null, divisionGamesBack: null, streak: null, last10: { wins: null, losses: null, display: null } };
  const split = (standing?.records?.splitRecords || []).find((item) => item?.type === "lastTen" || /last ten/i.test(String(item?.type || item?.description || "")));
  const lastTen = split || standing?.lastTen || {};
  const wins = numberOrNull(lastTen.wins), losses = numberOrNull(lastTen.losses);
  return {
    divisionRank: numberOrNull(standing.divisionRank),
    leagueRank: numberOrNull(standing.leagueRank),
    wildCardRank: numberOrNull(standing.wildCardRank),
    divisionGamesBack: standing.gamesBack ?? standing.divisionGamesBack ?? null,
    streak: standing?.streak?.streakCode ?? standing?.streak?.code ?? null,
    last10: { wins, losses, display: wins != null && losses != null ? `${wins}-${losses}` : null }
  };
}

function normalizeUmpires(officials) {
  const result = { home: null, first: null, second: null, third: null, additional: [], crew: [] };
  for (const item of Array.isArray(officials) ? officials : []) {
    const official = { id: item?.official?.id ?? null, name: item?.official?.fullName ?? null, role: item?.officialType ?? null };
    result.crew.push(official);
    const role = String(item?.officialType || "").toLowerCase();
    if (role.includes("home")) result.home = official;
    else if (role.includes("first")) result.first = official;
    else if (role.includes("second")) result.second = official;
    else if (role.includes("third")) result.third = official;
    else result.additional.push(official);
  }
  return result;
}

function findStanding(payloads, teamId) {
  if (!Array.isArray(payloads) || !teamId) return null;
  for (const payload of payloads) for (const record of payload?.records || []) {
    const match = (record?.teamRecords || []).find((teamRecord) => String(teamRecord?.team?.id) === String(teamId));
    if (match) return match;
  }
  return null;
}

function defensivePositionNumber(value) {
  const key = String(value || "").trim().toUpperCase();
  return ({ P: 1, C: 2, "1B": 3, "2B": 4, "3B": 5, SS: 6, LF: 7, CF: 8, RF: 9, DH: "DH" })[key] ?? null;
}

function defensivePositionName(value) {
  const key = String(value || "").trim().toUpperCase();
  return ({ P: "Pitcher", C: "Catcher", "1B": "First Base", "2B": "Second Base", "3B": "Third Base", SS: "Shortstop", LF: "Left Field", CF: "Center Field", RF: "Right Field", DH: "Designated Hitter", OF: "Outfielder", IF: "Infielder", PH: "Pinch Hitter", PR: "Pinch Runner" })[key] ?? null;
}

function normalizeDayNight(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "day") return "Day";
  if (text === "night") return "Night";
  return value ?? null;
}

function handCode(code) { const value = String(code || "").trim().toUpperCase(); return value === "R" || value === "L" ? value : value || null; }
function numberOrNull(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
function decimalOrNull(value) { if (value == null || value === "") return null; const n = Number(value); return Number.isFinite(n) ? n : null; }
function booleanOrNull(value) { return typeof value === "boolean" ? value : null; }
function slashLine(avg, obp, slg) { return [avg, obp, slg].every((v) => v != null && v !== "") ? [avg, obp, slg].map((v) => String(v).replace(/^0(?=\.)/, "")).join("/") : null; }
function winLossRecord(wins, losses) { return wins != null && losses != null ? `${wins}-${losses}` : null; }
