/**
 * Scorecard Studio
 * Representative Designer / field-catalog sample data
 * Version: 0.2.0
 */

const POSITION_INFO = {
  P: ["Pitcher", 1], C: ["Catcher", 2], "1B": ["First Base", 3], "2B": ["Second Base", 4],
  "3B": ["Third Base", 5], SS: ["Shortstop", 6], LF: ["Left Field", 7], CF: ["Center Field", 8], RF: ["Right Field", 9],
  DH: ["Designated Hitter", "DH"], OF: ["Outfielder", null], IF: ["Infielder", null]
};

function position(abbreviation) {
  const [name, number] = POSITION_INFO[abbreviation] || [abbreviation, null];
  return { abbreviation, name, number };
}

const SAMPLE_NAME_FIELDS = Object.freeze({
  "Bo Yu": { firstName: "Robert", lastName: "Yu", useName: "Bo", useLastName: "Yu", initLastName: "B Yu", boxscoreName: "Yu, B" },
  "Nico Bell": { firstName: "Nicholas", lastName: "Bell", useName: "Nico", useLastName: "Bell", initLastName: "N Bell", boxscoreName: "Bell, N" },
  "Silas Crowe": { firstName: "Silas", lastName: "Crowe", useName: "Si", useLastName: "Crowe", initLastName: "S Crowe", boxscoreName: "Crowe, S" },
  "Dorian St. James": { firstName: "Dorian", lastName: "St. James", useName: "Dorian", useLastName: "St. James", initLastName: "D St. James", boxscoreName: "St. James" },
  "Christopher Van Buren": { firstName: "Christopher", lastName: "Van Buren", useName: "Christopher", useLastName: "Van Buren", initLastName: "C Van Buren", boxscoreName: "Van Buren" },
  "Santiago De la Cruz": { firstName: "Santiago", lastName: "De la Cruz", useName: "Santiago", useLastName: "De la Cruz", initLastName: "S De la Cruz", boxscoreName: "De la Cruz" },
  "Theodore Fitzpatrick III": { firstName: "Theodore", lastName: "Fitzpatrick", useName: "Theodore", useLastName: "Fitzpatrick", initLastName: "T Fitzpatrick", boxscoreName: "Fitzpatrick", nameSuffix: "III" }
});

function samplePlayerName(name, boxscoreName = null) {
  const explicit = SAMPLE_NAME_FIELDS[name];
  if (explicit) return { name, ...explicit, boxscoreName: boxscoreName || explicit.boxscoreName };
  const parts = String(name || "").trim().split(/\s+/);
  const firstName = parts[0] || "";
  const suffixes = new Set(["Jr.", "Sr.", "II", "III", "IV"]);
  const suffix = parts.length > 2 && suffixes.has(parts.at(-1)) ? parts.at(-1) : "";
  const lastName = parts.length > 1 ? parts.at(suffix ? -2 : -1) : "";
  return {
    name,
    firstName: firstName || null,
    lastName: lastName || null,
    useName: firstName || null,
    useLastName: lastName || null,
    initLastName: firstName && lastName ? `${firstName[0]} ${lastName}` : name,
    boxscoreName: boxscoreName || sampleBoxscoreName(name, firstName, lastName),
    ...(suffix ? { nameSuffix: suffix } : {})
  };
}

function sampleBoxscoreName(name, firstName, lastName) {
  const disambiguated = {
    "Adrian Vale": "Vale, A",
    "Marcos Vale": "Vale, M"
  };
  return disambiguated[name] || lastName || firstName || name;
}

function sampleStarter(name, firstName, lastName, initLastName, boxscoreName, number, throws, wins, losses, gamesStarted, era, whip) {
  return {
    player: {
      name, firstName, lastName, useName: name === "Thaddeus McAllister" ? "Thad" : firstName, useLastName: lastName, initLastName: name === "Thaddeus McAllister" ? "T McAllister" : initLastName, boxscoreName,
      number, throws, primaryPosition: position("P")
    },
    position: position("P"),
    stats: {
      gamesPlayed: gamesStarted,
      gamesPitched: gamesStarted,
      gamesStarted,
      wins,
      losses,
      record: `${wins}-${losses}`,
      era,
      whip,
      inningsPitched: "154.2",
      hits: 132,
      runs: 61,
      earnedRuns: 58,
      homeRuns: 17,
      walks: 39,
      strikeouts: 171,
      saves: 0,
      saveOpportunities: 0,
      holds: 0,
      blownSaves: 0,
      winPercentage: .667,
      strikeoutWalkRatio: 4.38,
      strikeoutsPer9Inn: 9.95,
      walksPer9Inn: 2.27,
      hitsPer9Inn: 7.68,
      homeRunsPer9: .99,
      pitchesPerInning: 15.4
    }
  };
}

function battingStats(index, bench = false) {
  const avg = (bench ? .238 : .287) + index / 1000;
  const obp = (bench ? .310 : .352) + index / 1000;
  const slg = (bench ? .390 : .489) + index / 1000;
  return {
    avg,
    obp,
    slg,
    ops: obp + slg,
    homeRuns: (bench ? 4 : 28) + index,
    rbi: (bench ? 18 : 91) + index * 2,
    gamesPlayed: (bench ? 72 : 145) - index,
    plateAppearances: (bench ? 214 : 612) - index * 12,
    stolenBases: (bench ? 3 : 24) + index,
    slashLine: `${avg.toFixed(3).replace(/^0/, "")}/${obp.toFixed(3).replace(/^0/, "")}/${slg.toFixed(3).replace(/^0/, "")}`
  };
}

const SAMPLE_LINEUP_JERSEYS = ["7", "44", "2", "15", "61", "9", "28", "3", "52"];
const SAMPLE_BENCH_JERSEYS = ["18", "5", "47", "12", "33", "8"];
const SAMPLE_BULLPEN_JERSEYS = ["75", "14", "38", "62", "4", "56", "21", "68", "13", "49", "27", "84", "32", "17"];

function sampleLineup(names, positions, bats) {
  return names.map((name, index) => {
    const gamePosition = position(positions[index]);
    const primary = gamePosition.abbreviation === "DH" ? position("1B") : gamePosition;
    return {
      battingOrder: index + 1,
      player: {
        id: 1000 + index,
        ...samplePlayerName(name),
        number: SAMPLE_LINEUP_JERSEYS[index] || String(90 + index),
        bats: bats[index],
        primaryPosition: primary
      },
      position: gamePosition,
      stats: battingStats(index, false)
    };
  });
}

function sampleBench(names, positions, bats) {
  return names.map((name, index) => ({
    player: {
      id: 2000 + index,
      ...samplePlayerName(name),
      number: SAMPLE_BENCH_JERSEYS[index] || String(80 + index),
      bats: bats[index],
      primaryPosition: position(positions[index])
    },
    position: position(positions[index]),
    stats: battingStats(index, true)
  }));
}

function sampleBullpen(names, throws) {
  return names.map((name, index) => {
    const wins = 4 + index;
    const losses = 2 + (index % 3);
    return {
      player: {
        id: 3000 + index,
        ...samplePlayerName(name),
        number: SAMPLE_BULLPEN_JERSEYS[index] || String(70 + index),
        throws: throws[index],
        primaryPosition: position("P")
      },
      position: position("P"),
      stats: {
        gamesStarted: index === 0 ? 0 : index % 2,
        wins,
        losses,
        record: `${wins}-${losses}`,
        era: 1.92 + index / 10,
        whip: .95 + index / 100,
        inningsPitched: `${42 + index}.1`,
        strikeouts: 82 - index * 4,
        walks: 18 + index,
        saves: index === 0 ? 31 : 0,
        holds: index === 0 ? 2 : 6 + index
      }
    };
  });
}

function sideTeam({ name, locationName, shortName, clubName, abbreviation, wins, losses, league, division, managerName, managerNumber, starter, lineup, bench, bullpen, standings }) {
  return {
    team: {
      name, locationName, shortName, clubName, abbreviation,
      league: { name: league },
      division: { name: division },
      record: { gamesPlayed: wins + losses, wins, losses, pct: wins / (wins + losses) },
      gameNumber: wins + losses + 1,
      standings
    },
    manager: { name: managerName, number: managerNumber },
    startingPitcher: starter,
    lineup,
    bench,
    bullpen
  };
}

export const LEGACY_DESIGNER_SAMPLE_MODEL = Object.freeze({
  schemaVersion: 1,
  game: {
    date: "2026-07-18",
    startTime: "2026-07-19T00:15:00Z",
    dayNight: "Night",
    number: 1,
    venue: {
      // Deliberately long fictional venue name for layout-width stress testing.
      name: "Harbor Field at Crescent Bay",
      city: "Crescent Bay",
      state: "OR",
      country: "USA",
      capacity: 41782,
      turfType: "Grass",
      roofType: "Retractable",
      timeZone: "America/Los_Angeles"
    },
    weather: { temperature: 71, condition: "Partly Cloudy", wind: "11 mph, L to R" },
    umpires: {
      home: { id: 4001, name: "Mara Ellison", role: "Home Plate" },
      first: { id: 4002, name: "Theo Marwick", role: "First Base" },
      second: { id: 4003, name: "Lucía Benavides", role: "Second Base" },
      third: { id: 4004, name: "Graham Pike", role: "Third Base" },
      additional: [
        { id: 4005, name: "Nolan Fairweather", role: "Left Field" },
        { id: 4006, name: "Inez Calderón", role: "Right Field" }
      ],
      crew: [
        { id: 4001, name: "Mara Ellison", role: "Home Plate" },
        { id: 4002, name: "Theo Marwick", role: "First Base" },
        { id: 4003, name: "Lucía Benavides", role: "Second Base" },
        { id: 4004, name: "Graham Pike", role: "Third Base" },
        { id: 4005, name: "Nolan Fairweather", role: "Left Field" },
        { id: 4006, name: "Inez Calderón", role: "Right Field" }
      ]
    }
  },
  away: sideTeam({
    name: "Lakeview Foxes", locationName: "Lakeview", shortName: "Lakeview", clubName: "Foxes", abbreviation: "LVF",
    wins: 74, losses: 77, league: "Continental League", division: "Continental League North", managerName: "Bo Mercer", managerNumber: "4",
    standings: { divisionRank: 3, leagueRank: 8, wildCardRank: 5, divisionGamesBack: "7.5", streak: "L1", last10: { wins: 5, losses: 5, display: "5-5" } },
    starter: sampleStarter("Nicolás Bellamy", "Nicolás", "Bellamy", "N Bellamy", "Bellamy, N", "6", "L", 8, 9, 25, 3.84, 1.21),
    lineup: sampleLineup(["Bo Yu", "Adrian Vale", "Mateo O'Rourke", "Alejandro Villaseñor", "Tess Marlowe", "Jae-Min Park", "Dorian St. James", "Eli Navarro-Soto", "Christopher Van Buren"], ["CF", "2B", "1B", "RF", "C", "SS", "LF", "3B", "DH"], ["L", "R", "S", "L", "R", "L", "S", "R", "R"]),
    bench: sampleBench(["Marcos Vale", "Jo Pike", "Renée Calder", "Ty Hollis", "Santiago De la Cruz", "Max North"], ["IF", "OF", "C", "IF", "1B", "OF"], ["R", "L", "S", "R", "L", "R"]),
    bullpen: sampleBullpen(["Ezra Quinn", "Milo Sandoval", "Anton Reyes", "Beckett Shaw", "Luis Fontaine", "Owen Kade", "Rafael Mercer", "Jonas Voss", "Emmett Price", "Noé Whitaker", "Caleb Frost", "Xavier Boone", "Parker Ibarra", "Dámaso Finch"], ["R", "L", "R", "R", "L", "R", "R", "L", "R", "L", "R", "R", "L", "R"])
  }),
  home: sideTeam({
    name: "Grand Valley Copperheads", locationName: "Grand Valley", shortName: "Grand Valley", clubName: "Copperheads", abbreviation: "GVC",
    wins: 91, losses: 60, league: "Continental League", division: "Continental League South", managerName: "Sebastian Montgomery", managerNumber: "27",
    standings: { divisionRank: 1, leagueRank: 1, wildCardRank: 0, divisionGamesBack: "-", streak: "W4", last10: { wins: 8, losses: 2, display: "8-2" } },
    starter: sampleStarter("Thaddeus McAllister", "Thaddeus", "McAllister", "T. McAllister", "McAllister, T", "47", "R", 18, 2, 29, 2.41, .99),
    lineup: sampleLineup(["Kai Reed", "Lucien Baptiste", "Mara Devereaux", "J. P. Delacroix", "Rocco Fernández", "Amir Washington", "Søren Beck", "Quincy Hartwell", "Theodore Fitzpatrick III"], ["SS", "CF", "C", "1B", "LF", "DH", "RF", "2B", "3B"], ["R", "L", "S", "L", "R", "S", "L", "R", "R"]),
    bench: sampleBench(["Nico Bell", "Ángel Montoya", "Wesley Carrington", "Devin Cho", "Augustus Wynn", "Remy LaSalle"], ["C", "IF", "OF", "IF", "1B", "OF"], ["R", "S", "L", "R", "L", "S"]),
    bullpen: sampleBullpen(["Silas Crowe", "Bennett Okafor", "Marco D'Angelo", "Hugo Serrano", "Levi March", "Tobias Grant", "César Holloway", "Micah Boone", "Felix Laurent", "Orion Vega", "Malcolm Cross", "Rui Nakamura", "Gideon Wells", "Tomás Everhart"], ["R", "R", "L", "R", "L", "R", "R", "L", "R", "R", "L", "R", "R", "L"])
  })
});

const SAMPLE_SCOPE = Object.freeze({
  sportId: 1,
  gameTypes: ["R"],
  statType: "byDateRange",
  startDate: "2026-01-01",
  endDate: "2026-07-17",
  aggregate: { sportId: 1, code: "mlb", selection: "single-unambiguous" }
});

function v2Position(value, roleLabel = null) {
  const abbreviation = value?.abbreviation ?? null;
  return {
    abbreviation,
    name: value?.name ?? null,
    number: value?.number ?? null,
    roleLabel
  };
}

function positionType(value) {
  if (!value?.abbreviation) return null;
  if (["P", "SP", "RP"].includes(value.abbreviation)) return "Pitcher";
  if (value.abbreviation === "C") return "Catcher";
  if (["LF", "CF", "RF", "OF"].includes(value.abbreviation)) return "Outfielder";
  if (value.abbreviation === "DH") return "Hitter";
  return "Infielder";
}

function v2Person(player, idOffset = 0) {
  const primary = player?.primaryPosition || {};
  return {
    id: player?.id == null ? null : Number(player.id) + idOffset,
    name: player?.name ?? null,
    firstName: player?.firstName ?? null,
    lastName: player?.lastName ?? null,
    useName: player?.useName ?? null,
    useLastName: player?.useLastName ?? null,
    boxscoreName: player?.boxscoreName ?? null,
    firstLastName: player?.firstLastName ?? player?.name ?? null,
    nameFirstLast: player?.nameFirstLast ?? player?.name ?? null,
    lastFirstName: player?.lastFirstName ?? (player?.lastName && player?.firstName ? `${player.lastName}, ${player.firstName}` : player?.name ?? null),
    initLastName: player?.initLastName ?? null,
    lastInitName: player?.lastInitName ?? (player?.lastName && player?.firstName ? `${player.lastName}, ${player.firstName[0]}` : null),
    nameSuffix: player?.nameSuffix ?? null,
    nameTitle: player?.nameTitle ?? null,
    pronunciation: player?.pronunciation ?? null,
    number: player?.number ?? null,
    bats: player?.bats ?? null,
    throws: player?.throws ?? null,
    primaryPosition: {
      abbreviation: primary.abbreviation ?? null,
      name: primary.name ?? null,
      type: positionType(primary)
    }
  };
}

function scopedStats(totals) {
  return { scope: { ...SAMPLE_SCOPE, gameTypes: [...SAMPLE_SCOPE.gameTypes], aggregate: { ...SAMPLE_SCOPE.aggregate } }, totals: { ...totals } };
}

function canonicalPitchingTotals(totals) {
  const result = { ...totals };
  if (Object.hasOwn(result, "strikeouts")) {
    result.strikeOuts = result.strikeouts;
    delete result.strikeouts;
  }
  if (Object.hasOwn(result, "walks")) {
    result.baseOnBalls = result.walks;
    delete result.walks;
  }
  return result;
}

function v2Role(role, idOffset, group, roleLabel = null) {
  return {
    player: v2Person(role.player, idOffset),
    position: v2Position(role.position, roleLabel),
    stats: group === "hitting" ? { hitting: scopedStats(role.stats) } : { pitching: scopedStats(canonicalPitchingTotals(role.stats)) }
  };
}

function typedRank(value) {
  const number = Number(value);
  return { raw: value == null ? null : String(value), value: Number.isInteger(number) ? number : null };
}

function typedGamesBack(value) {
  const raw = value == null ? null : String(value);
  if (raw === "-") return { raw, state: "leader", games: null };
  const games = Number(raw);
  return { raw, state: Number.isFinite(games) ? "behind" : "unknown", games: Number.isFinite(games) ? games : null };
}

function typedStandings(value, side) {
  const performance = side === "away"
    ? { runsScored: 683, runsAllowed: 506, home: [47, 25], away: [38, 27] }
    : { runsScored: 641, runsAllowed: 572, home: [44, 29], away: [34, 34] };
  return {
    divisionRank: typedRank(value.divisionRank),
    leagueRank: typedRank(value.leagueRank),
    wildCardRank: typedRank(value.wildCardRank),
    divisionGamesBack: typedGamesBack(value.divisionGamesBack),
    leagueGamesBack: typedGamesBack(value.divisionGamesBack),
    wildCardGamesBack: typedGamesBack(value.wildCardRank === 0 ? "-" : "2.5"),
    runsScored: performance.runsScored,
    runsAllowed: performance.runsAllowed,
    runDifferential: performance.runsScored - performance.runsAllowed,
    homeRecord: { wins: performance.home[0], losses: performance.home[1], display: `${performance.home[0]}-${performance.home[1]}` },
    awayRecord: { wins: performance.away[0], losses: performance.away[1], display: `${performance.away[0]}-${performance.away[1]}` },
    streak: value.streak,
    lastTen: { wins: value.last10.wins, losses: value.last10.losses },
    elimination: { raw: "-", state: "notEliminated", value: null },
    clinch: { raw: null, state: "none", value: null }
  };
}

function staffPerson(name, number, id) {
  const [firstName, ...rest] = name.split(" ");
  return v2Person({ id, name, firstName, lastName: rest.join(" "), useName: firstName, useLastName: rest.join(" "), number, primaryPosition: {} });
}

function v2Side(legacy, side) {
  const idOffset = side === "away" ? 100000 : 200000;
  const teamId = side === "away" ? 901 : 902;
  const divisionId = side === "away" ? 9901 : 9902;
  const manager = staffPerson(legacy.manager.name, legacy.manager.number, idOffset + 9001);
  const bullpenRoles = legacy.bullpen.map((row) => v2Role(row, idOffset, "pitching", "P"));
  const classified = side === "away";
  const additionalStarters = classified ? bullpenRoles.slice(0, 3).map((row) => ({ ...row, position: { ...row.position, roleLabel: "SP" } })) : [];
  const bullpen = classified ? bullpenRoles.slice(3) : bullpenRoles;
  const lineup = legacy.lineup.map((row) => ({ ...v2Role(row, idOffset, "hitting", "schedule-primary-position"), battingOrder: row.battingOrder, slotState: "available" }));
  const coaches = [
    ["Avery Bench", "12", "Bench Coach", "COAB", "bench"],
    ["Jordan Swing", "31", "Hitting Coach", "COAH", "hitting"],
    ["Morgan Pitch", "45", "Pitching Coach", "COAP", "pitching"],
    ["Riley Catch", "88", "Bullpen Coach", "COAC", "bullpen"]
  ].map(([name, number, title, jobId, category], index) => ({ person: staffPerson(name, number, idOffset + 9100 + index), job: title, title, jobId, category }));
  const defense = Object.fromEntries(lineup.filter((row) => row.position.abbreviation !== "DH").map((row) => [row.position.abbreviation, row]));
  return {
    team: {
      id: teamId,
      name: legacy.team.name,
      locationName: legacy.team.locationName,
      shortName: legacy.team.shortName,
      clubName: legacy.team.clubName,
      abbreviation: legacy.team.abbreviation,
      sport: { id: 1, name: "Major League Baseball" },
      league: { id: 990, name: legacy.team.league.name },
      division: { id: divisionId, name: legacy.team.division.name },
      record: { ...legacy.team.record },
      gameNumber: legacy.team.gameNumber,
      standings: typedStandings(legacy.team.standings, side),
      logo: { url: null, brandScope: null }
    },
    manager: { state: "available", candidates: [{ person: manager, job: "Manager", title: "Manager", jobId: "MNGR" }], selected: manager },
    coaches,
    lineup: { state: "posted", slots: lineup },
    startingPitcher: v2Role({ ...legacy.startingPitcher, player: { ...legacy.startingPitcher.player, id: 8001 } }, idOffset, "pitching", "SP"),
    additionalStarters,
    bench: legacy.bench.map((row) => v2Role(row, idOffset, "hitting", null)),
    bullpen,
    defense
  };
}

function sourceResult(id, adapter, effective, outcome = "success") {
  return {
    id,
    adapter,
    request: { key: `${adapter}|v040-representative`, endpointFamily: adapter, method: "GET", parameters: { fixture: "v040-designer" } },
    scope: { gamePk: "990001", selectedViewKey: "990001:2026-07-18:1" },
    requestedAtUtc: "2026-07-18T12:00:00Z",
    retrievedAtUtc: "2026-07-18T12:00:01Z",
    effective,
    outcome,
    response: { status: outcome === "failed" ? 503 : 200, bodySha256: null },
    error: outcome === "failed" ? { code: "REPRESENTATIVE_UNAVAILABLE", summary: "Intentional fallback scenario." } : null
  };
}

function lineage(id, target, sourceRef, state = "available", extras = {}) {
  return {
    id,
    target,
    coverage: extras.coverage || "subtree",
    state,
    sourceResultRefs: sourceRef ? [sourceRef] : [],
    selectedSourceResultRef: state === "available" || state === "partial" || state === "present-empty" ? sourceRef : null,
    sourcePath: extras.sourcePath || null,
    effective: extras.effective || null,
    selectionReason: extras.reason || null,
    fallbackUsed: extras.fallbackUsed === true,
    rejectedCandidates: [],
    transformations: extras.transformations || [],
    derivationInputs: []
  };
}

function standingsGroup(side, sourceOrder) {
  const standings = side.team.standings;
  return {
    key: `regularSeason:1:${side.team.league.id}:${side.team.division.id}`,
    standingsType: "regularSeason",
    sport: { ...side.team.sport },
    league: { ...side.team.league },
    division: { ...side.team.division },
    rows: [{
      team: { id: side.team.id, name: side.team.name },
      record: { ...side.team.record },
      rank: { ...standings.divisionRank },
      gamesBack: { ...standings.divisionGamesBack },
      streak: standings.streak,
      lastTen: { ...standings.lastTen },
      elimination: { ...standings.elimination },
      clinch: { ...standings.clinch },
      sourceOrder
    }]
  };
}

function createV2DesignerSample(legacy) {
  const away = v2Side(legacy.away, "away");
  const home = v2Side(legacy.home, "home");
  const sources = [
    sourceResult("sample.schedule", "schedule", { kind: "gameState", gamePk: "990001", canonicalGameState: "pregame", rawGameState: "Preview" }),
    sourceResult("sample.people", "people", { kind: "dateRange", startDate: "2026-01-01", endDate: "2026-07-17" }),
    sourceResult("sample.roster.away", "roster", { kind: "date", date: "2026-07-18" }),
    sourceResult("sample.roster.home", "roster", { kind: "date", date: "2026-07-18" }),
    sourceResult("sample.coaches", "coaches", { kind: "date", date: "2026-07-18" }),
    sourceResult("sample.standings", "standings", { kind: "endOfDay", cutoffDate: "2026-07-17" }),
    sourceResult("sample.feed", "feed", { kind: "gameState", gamePk: "990001", canonicalGameState: "pregame", rawGameState: "Preview" }),
    sourceResult("sample.depth.away", "depthChart", { kind: "current" }),
    sourceResult("sample.depth.home", "depthChart", { kind: "current" }, "failed")
  ];
  const game = legacy.game;
  return {
    schemaId: "scorecard-studio.normalized-game",
    schemaVersion: 2,
    contractRevision: "0.3.0-draft.2",
    context: {
      gamePk: "990001", season: 2026, sport: { id: 1, name: "Major League Baseball" }, gameType: "R",
      competitionSegment: "regular", selectedDate: game.date, officialDate: game.date, selectedViewKey: "990001:2026-07-18:1"
    },
    game: {
      status: { canonical: "pregame", raw: { abstractGameState: "Preview", codedGameState: "P", detailedState: "Pre-Game", statusCode: "P" }, reason: null, startTimeTBD: false, teamsTBD: false },
      dates: { scheduledStart: game.startTime, originalScheduledStart: game.startTime, officialDate: game.date, rescheduledStart: null, rescheduledDate: null, resumeStart: null, resumeDate: null },
      dayNight: "night", gameNumber: game.number,
      series: { description: "NL Championship Series", gameNumber: 3, gamesInSeries: 7, status: "Copperheads lead series, 2–0" },
      venue: { id: 990, name: game.venue.name, location: { city: game.venue.city, state: game.venue.state, country: game.venue.country }, timeZone: { iana: game.venue.timeZone }, fieldInfo: { capacity: game.venue.capacity, turfType: game.venue.turfType, roofType: game.venue.roofType, dimensions: { leftLine: 332, center: 404, rightLine: 326 } } },
      weather: { ...game.weather },
      umpires: { crew: game.umpires.crew.map((official) => ({ ...official })) }
    },
    away,
    home,
    standings: { groups: [standingsGroup(away, 0), standingsGroup(home, 1)] },
    meta: {
      snapshot: { id: "v040-designer-representative", createdAtUtc: "2026-07-18T12:00:02Z", producer: { applicationVersion: "0.4.0-dev", build: "001.6" }, fixtureKind: "synthetic-contract" },
      sourceResults: sources,
      lineage: [
        lineage("sample.game", "/game", "sample.schedule"),
        lineage("sample.officials", "/game/umpires", "sample.feed"),
        lineage("sample.away", "/away", "sample.schedule"),
        lineage("sample.home", "/home", "sample.schedule"),
        lineage("sample.away.stats", "/away/lineup", "sample.people"),
        lineage("sample.home.stats", "/home/lineup", "sample.people"),
        lineage("sample.away.additional", "/away/additionalStarters", "sample.depth.away", "available", { coverage: "exact", reason: "SP annotations intersected with the dated active roster." }),
        lineage("sample.away.bullpen", "/away/bullpen", "sample.roster.away", "available", { coverage: "exact", reason: "Dated roster pitchers minus selected and SP-annotated starters." }),
        lineage("sample.home.additional", "/home/additionalStarters", "sample.depth.home", "omitted", { coverage: "exact", reason: "No usable SP annotation set was available." }),
        lineage("sample.home.bullpen", "/home/bullpen", "sample.roster.home", "available", { coverage: "exact", reason: "Authoritative dated roster-minus-starter fallback.", fallbackUsed: true }),
        lineage("sample.staff.away", "/away/manager", "sample.coaches"),
        lineage("sample.staff.home", "/home/manager", "sample.coaches"),
        lineage("sample.standings.root", "/standings", "sample.standings")
      ]
    }
  };
}

export const DESIGNER_SAMPLE_MODEL = Object.freeze(createV2DesignerSample(LEGACY_DESIGNER_SAMPLE_MODEL));
