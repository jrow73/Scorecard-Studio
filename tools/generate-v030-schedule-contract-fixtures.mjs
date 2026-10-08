import { writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeScheduleSnapshot } from "../js/v030-schedule-normalizer.js";

const root = path.resolve(process.argv[2] ?? ".");
const outputDir = path.join(root, "tests", "fixtures", "model-contract");

function person(id, name, abbreviation, positionName, type, code) {
  return {
    id,
    fullName: name,
    primaryPosition: { abbreviation, name: positionName, type, code: String(code) }
  };
}

function team(id, name, abbreviation, leagueId) {
  return {
    id,
    name,
    locationName: name.split(" ").slice(0, -1).join(" "),
    shortName: name,
    clubName: name.split(" ").at(-1),
    abbreviation,
    sport: { id: 1, name: "Major League Baseball" },
    league: { id: leagueId, name: leagueId === 103 ? "American League" : "National League" },
    division: { id: leagueId === 103 ? 202 : 205, name: "Contract Division" }
  };
}

function game(gamePk, includeLineups) {
  const awayPlayers = Array.from({ length: 9 }, (_, index) => person(710000 + index, `Away Fixture Player ${index + 1}`, "CF", "Center Fielder", "Outfielder", 8));
  const homePlayers = Array.from({ length: 9 }, (_, index) => person(720000 + index, `Home Fixture Player ${index + 1}`, "SS", "Shortstop", "Infielder", 6));
  const value = {
    gamePk,
    gameType: "R",
    season: "2025",
    gameDate: "2025-07-03T23:10:00Z",
    officialDate: "2025-07-03",
    dayNight: "night",
    gameNumber: 1,
    status: {
      abstractGameState: "Preview",
      codedGameState: includeLineups ? "P" : "S",
      detailedState: includeLineups ? "Pre-Game" : "Scheduled",
      statusCode: includeLineups ? "P" : "S",
      startTimeTBD: false,
      abstractGameCode: "P"
    },
    teams: {
      away: {
        team: team(145, "Chicago White Sox", "CWS", 103),
        leagueRecord: { wins: 42, losses: 43, ties: 0, pct: ".494" },
        probablePitcher: person(730001, "Away Fixture Probable", "P", "Pitcher", "Pitcher", 1)
      },
      home: {
        team: team(138, "St. Louis Cardinals", "STL", 104),
        leagueRecord: { wins: 45, losses: 40, ties: 0, pct: ".529" },
        probablePitcher: person(730002, "Home Fixture Probable", "P", "Pitcher", "Pitcher", 1)
      }
    },
    venue: { id: 4, name: "Contract Park" },
    weather: { temp: 78, condition: "Partly Cloudy", wind: "8 mph, Out To RF" }
  };
  if (includeLineups) value.lineups = { awayPlayers, homePlayers };
  return value;
}

function contractCase(name, gamePk, includeLineups) {
  return {
    name,
    payload: { dates: [{ date: "2025-07-03", games: [game(gamePk, includeLineups)] }] },
    selection: { gamePk: String(gamePk), sportId: 1, selectedDate: "2025-07-03" },
    execution: {
      requestedAtUtc: "2026-10-07T19:00:00.000Z",
      retrievedAtUtc: "2026-10-07T19:00:00.100Z",
      createdAtUtc: "2026-10-07T19:00:00.200Z",
      responseStatus: 200,
      bodySha256: null,
      snapshotId: `schedule-${name}`,
      applicationVersion: "0.3.0-design",
      build: "004.3",
      fixtureKind: "synthetic-contract"
    }
  };
}

const cases = [
  contractCase("ordinary", 800201, true),
  contractCase("missing-lineup", 800202, false)
];

await writeFile(path.join(outputDir, "v030-schedule-source-cases.json"), `${JSON.stringify({ schemaVersion: 1, cases }, null, 2)}\n`, "utf8");
for (const item of cases) {
  const normalized = normalizeScheduleSnapshot(item.payload, item.selection, item.execution);
  await writeFile(path.join(outputDir, `v030-schedule-${item.name}-normalized.json`), `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
}
console.log(`Wrote ${cases.length} Schedule source/output contract cases.`);
