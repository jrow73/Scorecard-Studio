/**
 * Scorecard Studio
 * Representative Designer / field-catalog sample data
 * Version: 0.2.0-dev
 * Build: 023
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

function samplePlayerName(name, boxscoreName = null) {
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
    initLastName: firstName && lastName ? `${firstName[0]}. ${lastName}${suffix ? ` ${suffix}` : ""}` : name,
    boxscoreName: boxscoreName || sampleBoxscoreName(name, firstName, lastName)
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
      name, firstName, lastName, useName: firstName, useLastName: lastName, initLastName, boxscoreName,
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
      standings
    },
    manager: { name: managerName, number: managerNumber },
    startingPitcher: starter,
    lineup,
    bench,
    bullpen
  };
}

export const DESIGNER_SAMPLE_MODEL = Object.freeze({
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
    starter: sampleStarter("Nicolás Bellamy", "Nicolás", "Bellamy", "N. Bellamy", "Bellamy, N", "6", "L", 8, 9, 25, 3.84, 1.21),
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
