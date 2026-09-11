/**
 * Scorecard Studio
 * Pregame API normalization
 * Version: 0.2.0-dev
 * Build: 014
 */

export function normalizePregameData(feed, supplemental = {}, scheduleGame = null) {
  const gd = feed?.gameData || {};
  const live = feed?.liveData || {};
  const date = gd.datetime?.officialDate || scheduleGame?.officialDate || null;
  const model = {
    schemaVersion: 1,
    context: {
      gamePk: String(gd.game?.pk || scheduleGame?.gamePk || ""),
      season: Number(gd.game?.season || String(date || "").slice(0, 4)) || null,
      sportId: gd.game?.sport?.id ?? 1,
      selectedDate: date,
      retrievedAt: new Date().toISOString()
    },
    game: normalizeGame(gd, live),
    away: null,
    home: null,
    standings: { groups: [] },
    meta: { sources: { gamePack: Boolean(feed), coaches: Boolean(supplemental.coaches), standings: Boolean(supplemental.standingsPayloads) } }
  };

  model.away = normalizeSide(feed, "away", supplemental.coaches?.away, supplemental.standingsPayloads);
  model.home = normalizeSide(feed, "home", supplemental.coaches?.home, supplemental.standingsPayloads);
  return model;
}

function normalizeGame(gd, live) {
  const venue = gd.venue || {};
  const weather = gd.weather || {};
  const field = venue.fieldInfo || {};
  const location = venue.location || {};
  return {
    date: gd.datetime?.officialDate ?? null,
    startTime: gd.datetime?.dateTime ?? null,
    dayNight: gd.datetime?.dayNight ?? null,
    type: gd.game?.type ?? null,
    number: numberOrNull(gd.game?.gameNumber),
    venue: {
      id: venue.id ?? null,
      name: venue.name ?? null,
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

function normalizeSide(feed, side, coachesPayload, standingsPayloads) {
  const gd = feed?.gameData || {};
  const team = gd.teams?.[side] || {};
  const standing = findStanding(standingsPayloads, team.id);
  const lineup = normalizeLineup(feed, side);
  const starter = normalizeStartingPitcher(feed, side);
  return {
    team: {
      id: team.id ?? null,
      name: team.name ?? null,
      locationName: team.locationName ?? null,
      shortName: team.shortName ?? null,
      clubName: team.clubName ?? team.teamName ?? null,
      abbreviation: team.abbreviation ?? null,
      league: { id: team.league?.id ?? null, name: team.league?.name ?? null },
      division: { id: team.division?.id ?? null, name: team.division?.nameShort ?? team.division?.name ?? null },
      record: {
        gamesPlayed: numberOrNull(team.record?.gamesPlayed),
        wins: numberOrNull(team.record?.wins),
        losses: numberOrNull(team.record?.losses),
        pct: decimalOrNull(team.record?.winningPercentage),
        divisionLeader: booleanOrNull(team.record?.divisionLeader)
      },
      standings: normalizeStanding(standing)
    },
    manager: normalizeManager(coachesPayload),
    coaches: [],
    lineup,
    startingPitcher: starter,
    bench: normalizeMembership(feed, side, "bench", new Set(lineup.filter((slot) => slot?.player?.id).map((slot) => String(slot.player.id)))),
    bullpen: normalizeBullpen(feed, side, starter?.player?.id),
    defense: {}
  };
}

function normalizeLineup(feed, side) {
  const box = feed?.liveData?.boxscore?.teams?.[side] || {};
  const ids = Array.isArray(box.battingOrder) ? box.battingOrder.map(String) : [];
  const capacity = Math.max(9, ids.length);
  const slots = Array.from({ length: capacity }, (_, index) => ({ battingOrder: index + 1, player: null, position: null, stats: {} }));
  ids.forEach((id, index) => { slots[index] = normalizeBoxPlayer(feed, side, id, index + 1); });
  return slots;
}

function normalizeStartingPitcher(feed, side) {
  const probable = feed?.gameData?.probablePitchers?.[side];
  if (!probable?.id && !probable?.fullName) return null;
  const normalized = normalizeBoxPlayer(feed, side, String(probable.id || ""), null, probable);
  if (!normalized.player?.name) normalized.player.name = probable.fullName ?? null;
  return normalized;
}

function normalizeMembership(feed, side, key, excludedIds = new Set()) {
  const box = feed?.liveData?.boxscore?.teams?.[side] || {};
  if (!Array.isArray(box[key])) return [];
  const seen = new Set();
  const result = [];
  for (const rawId of box[key]) {
    const id = String(rawId);
    if (seen.has(id) || excludedIds.has(id)) continue;
    seen.add(id);
    result.push(normalizeBoxPlayer(feed, side, id));
  }
  return result;
}

function normalizeBullpen(feed, side, starterId) {
  const excluded = new Set(starterId ? [String(starterId)] : []);
  return normalizeMembership(feed, side, "bullpen", excluded);
}

function normalizeBoxPlayer(feed, side, id, battingOrder = null, fallbackPerson = null) {
  const box = feed?.liveData?.boxscore?.teams?.[side] || {};
  const boxPlayer = box.players?.[`ID${id}`] || box.players?.[id] || {};
  const gamePlayer = feed?.gameData?.players?.[`ID${id}`] || feed?.gameData?.players?.[id] || fallbackPerson || {};
  const person = boxPlayer.person || {};
  const player = {
    id: numberOrNull(person.id ?? gamePlayer.id ?? fallbackPerson?.id),
    name: person.fullName ?? gamePlayer.fullName ?? fallbackPerson?.fullName ?? null,
    number: boxPlayer.jerseyNumber ?? gamePlayer.primaryNumber ?? null,
    firstName: gamePlayer.firstName ?? null,
    lastName: gamePlayer.lastName ?? null,
    useName: gamePlayer.useName ?? null,
    useLastName: gamePlayer.useLastName ?? null,
    boxscoreName: gamePlayer.boxscoreName ?? null,
    firstLastName: gamePlayer.firstLastName ?? gamePlayer.nameFirstLast ?? null,
    lastFirstName: gamePlayer.lastFirstName ?? null,
    initLastName: gamePlayer.initLastName ?? null,
    lastInitName: gamePlayer.lastInitName ?? null,
    nameSuffix: gamePlayer.nameSuffix ?? null,
    nameTitle: gamePlayer.nameTitle ?? null,
    pronunciation: gamePlayer.pronunciation ?? null,
    bats: gamePlayer.batSide?.code ?? boxPlayer.batSide?.code ?? null,
    throws: handCode(gamePlayer.pitchHand?.code ?? boxPlayer.pitchHand?.code),
    primaryPosition: {
      abbreviation: gamePlayer.primaryPosition?.abbreviation ?? null,
      name: gamePlayer.primaryPosition?.name ?? null
    }
  };
  return {
    battingOrder,
    player,
    position: {
      abbreviation: boxPlayer.position?.abbreviation ?? null,
      name: boxPlayer.position?.name ?? null
    },
    stats: normalizeStats(boxPlayer.seasonStats)
  };
}

function normalizeStats(seasonStats) {
  const batting = seasonStats?.batting || {};
  const pitching = seasonStats?.pitching || {};
  return {
    gamesPlayed: numberOrNull(batting.gamesPlayed ?? pitching.gamesPlayed),
    avg: decimalOrNull(batting.avg), obp: decimalOrNull(batting.obp), slg: decimalOrNull(batting.slg), ops: decimalOrNull(batting.ops),
    homeRuns: numberOrNull(batting.homeRuns ?? pitching.homeRuns), rbi: numberOrNull(batting.rbi),
    wins: numberOrNull(pitching.wins), losses: numberOrNull(pitching.losses), era: decimalOrNull(pitching.era), whip: decimalOrNull(pitching.whip),
    inningsPitched: pitching.inningsPitched ?? null, strikeouts: numberOrNull(pitching.strikeOuts), saves: numberOrNull(pitching.saves), holds: numberOrNull(pitching.holds)
  };
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

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
function decimalOrNull(value) { return numberOrNull(value); }
function booleanOrNull(value) { return typeof value === "boolean" ? value : null; }
function handCode(value) {
  const code = String(value || "").toUpperCase();
  return code.startsWith("R") ? "R" : code.startsWith("L") ? "L" : code || null;
}
