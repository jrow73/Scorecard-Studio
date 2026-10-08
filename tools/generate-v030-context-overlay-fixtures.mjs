import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeScheduleSnapshot } from "../js/v030-schedule-normalizer.js";
import { normalizeRosterPeopleStaffSnapshot } from "../js/v030-roster-people-normalizer.js";
import { normalizeContextOverlaySnapshot } from "../js/v030-context-overlay-normalizer.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDir = resolve(root, "tests/fixtures/model-contract");
const timestamps = { requestedAtUtc: "2026-10-07T21:00:00.000Z", retrievedAtUtc: "2026-10-07T21:00:00.100Z" };
const date = "2025-07-03";

function standingRow(teamId, name, wins, losses, options = {}) {
  return {
    team: { id: teamId, name }, gamesPlayed: wins + losses,
    leagueRecord: { wins, losses, ties: 0, pct: (wins / (wins + losses)).toFixed(3) },
    divisionRank: options.divisionRank ?? "2", leagueRank: options.leagueRank ?? "7", wildCardRank: options.wildCardRank ?? "3",
    divisionGamesBack: options.divisionGamesBack ?? "4.0", leagueGamesBack: options.leagueGamesBack ?? "8.0", wildCardGamesBack: options.wildCardGamesBack ?? "-",
    streak: { streakCode: options.streak ?? "W2" }, clinchIndicator: options.clinchIndicator,
    eliminationNumber: options.eliminationNumber ?? "-",
    records: { splitRecords: [{ type: "lastTen", wins: options.lastTenWins ?? 6, losses: options.lastTenLosses ?? 4 }] }
  };
}

function standingsSource(type = "regularSeason", cutoffDate = "2025-07-02", sourceResultId = "standings.prior-day") {
  return {
    input: { sportId: 1, leagueIds: [103], standingsType: type, season: 2025, cutoffDate },
    payload: { records: [{ standingsType: type, sport: { id: 1, name: "Major League Baseball" }, league: { id: 103, name: "American League" }, division: { id: 202, name: "American League Central" }, teamRecords: [
      standingRow(138, "Away Club", 19, 16, { streak: "W2" }),
      standingRow(145, "Home Club", 14, 21, { divisionRank: "5", leagueRank: "14", wildCardRank: "11", divisionGamesBack: "9.0", leagueGamesBack: "12.0", wildCardGamesBack: "7.0", streak: "L1", lastTenWins: 3, lastTenLosses: 7 })
    ] }] },
    execution: { ...timestamps, sourceResultId }
  };
}

function official(id, name, officialType) {
  return { official: { id, fullName: name }, officialType };
}

function feedSource(gamePk, officials, venue, sourceResultId) {
  return {
    input: { gamePk: String(gamePk), profile: "officials-venue-v1" },
    payload: { gamePk, gameData: { venue }, liveData: { boxscore: { officials } } },
    execution: { ...timestamps, sourceResultId }
  };
}

function venueSource(sourceResultId = "venue.narrow") {
  return {
    input: { venueId: 4, season: 2025, hydrateProfile: "location-fieldInfo-timezone-v1" },
    payload: { venues: [{ id: 4, name: "Contract Park", location: { city: "Narrow City", state: "Narrow State", country: "USA" }, timeZone: { id: "America/Chicago" }, fieldInfo: { capacity: 41000, turfType: "Grass", roofType: "Open", leftLine: 330, center: 400, rightLine: 330 } }] },
    execution: { ...timestamps, sourceResultId }
  };
}

function updateBaseCase(sourceCase, { id, gamePk, gameNumber = 1, gameType = "R" }) {
  const testCase = structuredClone(sourceCase);
  testCase.id = id;
  const game = testCase.schedule.payload.dates[0].games[0];
  game.gamePk = gamePk;
  game.gameNumber = gameNumber;
  game.gameType = gameType;
  testCase.schedule.selection.gamePk = String(gamePk);
  for (const side of ["away", "home"]) {
    testCase.sources.roster[side].execution.sourceResultId = `roster.${id}.${side}`;
    testCase.sources.coaches[side].execution.sourceResultId = `coaches.${id}.${side}`;
    testCase.sources.depthChart[side].execution.sourceResultId = `depth.${id}.${side}`;
  }
  testCase.sources.people.execution.sourceResultId = `people.${id}`;
  testCase.sources.people.input.gameTypes = [gameType];
  return testCase;
}

function normalizeBase(testCase) {
  const schedule = normalizeScheduleSnapshot(testCase.schedule.payload, testCase.schedule.selection, { ...timestamps, createdAtUtc: timestamps.retrievedAtUtc, snapshotId: `schedule-${testCase.id}`, fixtureKind: "synthetic-contract" });
  return normalizeRosterPeopleStaffSnapshot(schedule, testCase.sources, { createdAtUtc: "2026-10-07T21:00:00.200Z", snapshotId: `base-${testCase.id}`, fixtureKind: "synthetic-contract" });
}

function boxscorePlayer(id, batting, pitching = null) {
  return { person: { id }, seasonStats: { batting, ...(pitching ? { pitching } : {}) } };
}

function game2Boxscore() {
  return {
    input: { gamePk: "800045", relationship: "earlierSameDayGame" },
    earlierGame: { gamePk: "800045", officialDate: date, canonicalStatus: "final", rawGameState: "Final", awayTeamId: 138, homeTeamId: 145, awayIsWinner: true, homeIsWinner: false, isTie: false },
    payload: { teams: {
      away: { team: { id: 138, record: { gamesPlayed: 36, wins: 20, losses: 16, pct: ".556" } }, players: {
        ID660271: boxscorePlayer(660271, { gamesPlayed: 71, avg: ".281", obp: ".361", slg: ".451", homeRuns: 12, rbi: 44 }, { gamesPlayed: 19, gamesPitched: 19, gamesStarted: 5, wins: 9, losses: 4, era: "3.11", whip: "1.16" }),
        ID610021: boxscorePlayer(610021, {}, { gamesPlayed: 19, gamesPitched: 19, gamesStarted: 0, wins: 2, losses: 1, era: "2.90", whip: "1.10" })
      } },
      home: { team: { id: 145, record: { gamesPlayed: 36, wins: 14, losses: 22, pct: ".389" } }, players: {
        ID610002: boxscorePlayer(610002, { gamesPlayed: 68, avg: ".260", obp: ".330", slg: ".410", homeRuns: 9, rbi: 37 }),
        ID610012: boxscorePlayer(610012, {}, { gamesPlayed: 18, gamesPitched: 18, gamesStarted: 18, wins: 5, losses: 8, era: "4.20", whip: "1.31" })
      } }
    } },
    execution: { ...timestamps, sourceResultId: "boxscore.game1" }
  };
}

async function buildCases() {
  const rosterCases = JSON.parse(await readFile(resolve(fixtureDir, "v030-roster-people-source-cases.json"), "utf8"));
  const mlb = rosterCases.find((entry) => entry.id === "mlb-two-way-manager-depth-partial-people");
  const officialsCase = updateBaseCase(mlb, { id: "variable-officials-feed-venue", gamePk: 800047 });
  const springCase = updateBaseCase(mlb, { id: "spring-scoped-standings", gamePk: 800048, gameType: "S" });
  const game2Case = updateBaseCase(mlb, { id: "game2-production-mixed-cutoff", gamePk: 800046, gameNumber: 2 });

  return [
    {
      id: officialsCase.id,
      baseSnapshot: normalizeBase(officialsCase),
      sources: {
        standings: standingsSource(),
        feed: feedSource(800047, [
          official(700001, "Home Plate Official", "Home Plate"), official(700002, "First Base Official", "First Base"),
          official(700003, "Second Base Official", "Second Base"), official(700004, "Third Base Official", "Third Base"),
          official(700005, "Left Field Official", "Left Field"), official(700006, "Replay Official", "Replay Official")
        ], { id: 4, name: "Contract Park", location: { city: "Feed City", stateAbbrev: "FC", country: "USA" }, timeZone: { id: "America/Chicago" }, fieldInfo: { capacity: 42000, turfType: "Grass", roofType: "Retractable", leftLine: 329, center: 401 } }, "feed.officials-venue"),
        venue: venueSource()
      }
    },
    {
      id: springCase.id,
      baseSnapshot: normalizeBase(springCase),
      sources: { standings: standingsSource("springTraining", "2025-07-02", "standings.spring") }
    },
    {
      id: game2Case.id,
      baseSnapshot: normalizeBase(game2Case),
      sources: {
        standings: standingsSource(),
        feed: feedSource(800046, [], null, "feed.game2-empty-officials"),
        venue: venueSource("venue.game2"),
        boxscore: game2Boxscore()
      }
    }
  ];
}

export function normalizeCase(testCase) {
  return normalizeContextOverlaySnapshot(testCase.baseSnapshot, testCase.sources, { createdAtUtc: "2026-10-07T21:01:00.000Z", snapshotId: `build-004.5-${testCase.id}`, fixtureKind: "synthetic-contract" });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cases = await buildCases();
  await mkdir(fixtureDir, { recursive: true });
  await writeFile(resolve(fixtureDir, "v030-context-overlay-source-cases.json"), `${JSON.stringify(cases, null, 2)}\n`);
  for (const testCase of cases) await writeFile(resolve(fixtureDir, `v030-${testCase.id}-normalized.json`), `${JSON.stringify(normalizeCase(testCase), null, 2)}\n`);
  console.log(`Generated ${cases.length} Build 004.5 source cases and normalized snapshots.`);
}

