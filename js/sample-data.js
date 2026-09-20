/**
 * Scorecard Studio
 * Representative Designer / field-catalog sample data
 * Version: 0.2.0-dev
 * Build: 018.3
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
  const lastName = parts.length > 1 ? parts.at(-1) : "";
  return {
    name,
    firstName: firstName || null,
    lastName: lastName || null,
    useName: firstName || null,
    useLastName: lastName || null,
    initLastName: firstName && lastName ? `${firstName[0]}. ${lastName}` : name,
    boxscoreName: boxscoreName || sampleBoxscoreName(name, firstName, lastName)
  };
}

function sampleBoxscoreName(name, firstName, lastName) {
  const disambiguated = {
    "Brandon Lowe": "Lowe, B",
    "Josh Lowe": "Lowe, J"
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
    date: "2026-09-19",
    startTime: "2026-09-20T02:10:00Z",
    dayNight: "Night",
    number: 2,
    venue: {
      name: "T-Mobile Park",
      city: "Seattle",
      state: "WA",
      country: "USA",
      capacity: 47929,
      turfType: "Grass",
      roofType: "Retractable",
      timeZone: "America/Los_Angeles"
    },
    weather: { temperature: 68, condition: "Partly Cloudy", wind: "7 mph, L to R" },
    umpires: {
      home: { id: 4001, name: "Pat Hoberg", role: "Home Plate" },
      first: { id: 4002, name: "Edwin Jimenez", role: "First Base" },
      second: { id: 4003, name: "Alfonso Márquez", role: "Second Base" },
      third: { id: 4004, name: "Mike Estabrook", role: "Third Base" },
      additional: [
        { id: 4005, name: "Tripp Gibson", role: "Left Field" },
        { id: 4006, name: "Laz Díaz", role: "Right Field" }
      ],
      crew: [
        { id: 4001, name: "Pat Hoberg", role: "Home Plate" },
        { id: 4002, name: "Edwin Jimenez", role: "First Base" },
        { id: 4003, name: "Alfonso Márquez", role: "Second Base" },
        { id: 4004, name: "Mike Estabrook", role: "Third Base" },
        { id: 4005, name: "Tripp Gibson", role: "Left Field" },
        { id: 4006, name: "Laz Díaz", role: "Right Field" }
      ]
    }
  },
  away: sideTeam({
    name: "Tampa Bay Rays", locationName: "Tampa Bay", shortName: "Tampa Bay", clubName: "Rays", abbreviation: "TB",
    wins: 78, losses: 73, league: "American League", division: "American League East", managerName: "Kevin Cash", managerNumber: "16",
    standings: { divisionRank: 3, leagueRank: 7, wildCardRank: 4, divisionGamesBack: "8.5", streak: "W2", last10: { wins: 6, losses: 4, display: "6-4" } },
    starter: sampleStarter("Shane Baz", "Shane", "Baz", "S. Baz", "Baz, S.", "11", "R", 10, 5, 27, 3.19, 1.08),
    lineup: sampleLineup(["Yandy Díaz", "Brandon Lowe", "Junior Caminero", "Jonathan Aranda", "Josh Lowe", "Christopher Morel", "Jake Mangum", "Nick Fortes", "Taylor Walls"], ["1B", "2B", "3B", "DH", "RF", "LF", "CF", "C", "SS"], ["R", "L", "R", "L", "L", "R", "S", "R", "S"]),
    bench: sampleBench(["Kameron Misner", "José Caballero", "Ben Rortvedt", "Curtis Mead", "Richie Palacios", "Bob Seymour"], ["OF", "IF", "C", "IF", "OF", "1B"], ["L", "R", "L", "R", "L", "L"]),
    bullpen: sampleBullpen(["Pete Fairbanks", "Garrett Cleavinger", "Mason Montgomery", "Edwin Uceta", "Kevin Kelly", "Manuel Rodríguez", "Hunter Bigge", "Eric Orze", "Drew Rasmussen", "Joe Boyle", "Ian Seymour", "Cole Sulser", "Jacob Waguespack", "Tyler Alexander"], ["R", "L", "L", "R", "R", "R", "R", "R", "R", "R", "L", "R", "R", "L"])
  }),
  home: sideTeam({
    name: "Seattle Mariners", locationName: "Seattle", shortName: "Seattle", clubName: "Mariners", abbreviation: "SEA",
    wins: 86, losses: 65, league: "American League", division: "American League West", managerName: "Dan Wilson", managerNumber: "6",
    standings: { divisionRank: 1, leagueRank: 2, wildCardRank: 0, divisionGamesBack: "-", streak: "W3", last10: { wins: 7, losses: 3, display: "7-3" } },
    starter: sampleStarter("Logan Gilbert", "Logan", "Gilbert", "L. Gilbert", "Gilbert, L.", "36", "R", 14, 7, 28, 3.11, 1.04),
    lineup: sampleLineup(["J.P. Crawford", "Julio Rodríguez", "Cal Raleigh", "Josh Naylor", "Randy Arozarena", "Jorge Polanco", "Dominic Canzone", "Cole Young", "Victor Robles"], ["SS", "CF", "C", "1B", "LF", "DH", "RF", "2B", "3B"], ["L", "R", "S", "L", "R", "S", "L", "L", "R"]),
    bench: sampleBench(["Mitch Garver", "Leo Rivas", "Luke Raley", "Austin Shenton", "Dylan Moore", "Miles Mastrobuoni"], ["C", "IF", "OF", "IF", "IF", "IF"], ["R", "S", "L", "L", "R", "L"]),
    bullpen: sampleBullpen(["Andrés Muñoz", "Matt Brash", "Gabe Speier", "Eduard Bazardo", "Carlos Vargas", "Casey Legumina", "Collin Snider", "Trent Thornton", "Tayler Saucedo", "Emerson Hancock", "Logan Evans", "Jackson Kowar", "Cody Bolton", "Jhonathan Díaz"], ["R", "R", "L", "R", "R", "R", "R", "R", "L", "R", "R", "R", "R", "L"])
  })
});
