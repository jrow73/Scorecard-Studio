import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeScheduleSnapshot } from "../js/v030-schedule-normalizer.js";
import { normalizeRosterPeopleStaffSnapshot } from "../js/v030-roster-people-normalizer.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDir = resolve(root, "tests/fixtures/model-contract");
const timestamps = { requestedAtUtc: "2026-10-07T20:00:00.000Z", retrievedAtUtc: "2026-10-07T20:00:00.100Z" };

const position = (code, name, type, abbreviation) => ({ code, name, type, abbreviation });
const player = (id, fullName, primaryPosition, extra = {}) => ({ id, fullName, primaryPosition, batSide: { code: extra.bats ?? "R" }, pitchHand: { code: extra.throws ?? "R" }, primaryNumber: extra.number ?? null });
const rosterEntry = (rawPlayer, jerseyNumber, rosterPosition = rawPlayer.primaryPosition) => ({ person: rawPlayer, jerseyNumber, position: rosterPosition, status: { code: "A", description: "Active" } });

const P = position("1", "Pitcher", "Pitcher", "P");
const SP = position("S", "Starting Pitcher", "Pitcher", "SP");
const SS = position("6", "Shortstop", "Infielder", "SS");
const C = position("2", "Catcher", "Catcher", "C");
const TWP = position("Y", "Two-Way Player", "Two-Way Player", "TWP");

function rawStats(group, sportId, stat) {
  return { type: { displayName: "byDateRange" }, group: { displayName: group }, splits: [{ sport: { id: sportId }, stat }] };
}

function enriched(rawPlayer, sportId, groups = ["hitting", "pitching"]) {
  return {
    ...rawPlayer,
    stats: groups.map((group) => rawStats(group, sportId, group === "hitting"
      ? { gamesPlayed: 70, avg: ".275", obp: ".350", slg: ".440", homeRuns: 11, rbi: 42 }
      : { gamesPlayed: 18, gamesPitched: 18, gamesStarted: 4, wins: 8, losses: 4, era: "3.21", whip: "1.18" }))
  };
}

function schedulePayload({ gamePk, sportId, sportName, away, home, date = "2025-07-03" }) {
  return { dates: [{ date, games: [{
    gamePk, gameDate: `${date}T23:10:00.000Z`, officialDate: date, season: "2025", gameType: "R", gameNumber: 1,
    status: { abstractGameState: "Preview", codedGameState: "P", detailedState: "Pre-Game", statusCode: "P" },
    sport: { id: sportId, name: sportName }, venue: { id: 4, name: "Contract Park" }, dayNight: "night",
    teams: {
      away: { team: { id: away.teamId, name: away.teamName, sport: { id: sportId, name: sportName } }, probablePitcher: away.starter, leagueRecord: { wins: 10, losses: 8, pct: ".556" } },
      home: { team: { id: home.teamId, name: home.teamName, sport: { id: sportId, name: sportName } }, probablePitcher: home.starter, leagueRecord: { wins: 9, losses: 9, pct: ".500" } }
    },
    lineups: { awayPlayers: away.lineup, homePlayers: home.lineup }
  }]}] };
}

function sourceInput(teamId, date, season = 2025) {
  return {
    roster: { teamId, date, rosterType: "active", hydrateProfile: "person-v1" },
    coaches: { teamId, date, season },
    depthChart: { teamId, season }
  };
}

function makeMlbCase() {
  const away = {
    teamId: 138, teamName: "Away Club",
    twoWay: player(660271, "Two-Way Contract Player", TWP, { number: "17", bats: "L" }),
    additional: player(610031, "Away Additional Starter", P, { number: "31" }),
    reliever: player(610021, "Away Reliever", P, { number: "55" }),
    bench: player(610041, "Away Bench", C, { number: "12" })
  };
  away.starter = away.twoWay;
  away.lineup = [away.twoWay];
  const home = {
    teamId: 145, teamName: "Home Club",
    starter: player(610012, "Home Starter", P, { number: "41", throws: "L" }),
    hitter: player(610002, "Home Hitter", SS, { number: "18", bats: "L" }),
    reliever: player(610022, "Home Reliever", P, { number: "58" }),
    bench: player(610042, "Home Bench", C, { number: "19" })
  };
  home.lineup = [home.hitter];
  const date = "2025-07-03";
  const peopleInput = { personIds: [660271, 610031, 610021, 610041, 610012, 610002, 610022, 610042], sportId: 1, gameTypes: ["R"], statGroups: ["hitting", "pitching"], statType: "byDateRange", startDate: "2025-01-01", endDate: date, chunkSize: 4 };
  const inputs = { away: sourceInput(away.teamId, date), home: sourceInput(home.teamId, date) };
  return {
    id: "mlb-two-way-manager-depth-partial-people",
    schedule: { payload: schedulePayload({ gamePk: 800044, sportId: 1, sportName: "Major League Baseball", away, home, date }), selection: { gamePk: "800044", selectedDate: date, sportId: 1, hydrateProfile: "pregame-v1" } },
    sources: {
      roster: {
        away: { input: inputs.away.roster, payload: { rosterType: "active", roster: [rosterEntry(away.twoWay, "17"), rosterEntry(away.additional, "31"), rosterEntry(away.reliever, "55"), rosterEntry(away.bench, "12")] }, execution: { ...timestamps, sourceResultId: "roster.away" } },
        home: { input: inputs.home.roster, payload: { rosterType: "active", roster: [rosterEntry(home.starter, "41"), rosterEntry(home.hitter, "18"), rosterEntry(home.reliever, "58"), rosterEntry(home.bench, "19")] }, execution: { ...timestamps, sourceResultId: "roster.home" } }
      },
      people: { input: peopleInput, units: [
        { outcome: "success", personIds: [660271, 610021, 610041, 610002], payload: { people: [enriched(away.twoWay, 1), enriched(away.reliever, 1, ["pitching"]), enriched(away.bench, 1, ["hitting"]), enriched(home.hitter, 1, ["hitting"])] } },
        { outcome: "failed", personIds: [610031, 610012, 610022, 610042] }
      ], execution: { ...timestamps, sourceResultId: "people.partial", error: { code: "REQUEST_FAILED", summary: "One independently retryable People unit failed." } } },
      coaches: {
        away: { input: inputs.away.coaches, payload: { roster: [
          { person: player(1001, "Manager One", {}), jerseyNumber: "1", job: "Manager", jobId: "MNGR", title: "Manager" },
          { person: player(1002, "Manager Two", {}), jerseyNumber: "2", job: "Manager", jobId: "MNGR", title: "Interim Manager" },
          { person: player(1003, "Bench Coach", {}), jerseyNumber: "3", job: "Bench Coach", jobId: "COAB", title: "Bench Coach" }
        ] }, execution: { ...timestamps, sourceResultId: "coaches.away" } },
        home: { input: inputs.home.coaches, payload: { roster: [
          { person: player(2001, "Home Manager", {}), jerseyNumber: "4", job: "Manager", jobId: "MNGR", title: "Manager" },
          { person: player(2002, "Pitching Coach", {}), jerseyNumber: "5", job: "Pitching Coach", jobId: "COAP", title: "Pitching Coach" }
        ] }, execution: { ...timestamps, sourceResultId: "coaches.home" } }
      },
      depthChart: {
        away: { input: inputs.away.depthChart, payload: { roster: [rosterEntry(away.additional, "", SP), rosterEntry(away.reliever, "", P), rosterEntry(player(999999, "Inactive Starter", P), "", SP)] }, execution: { ...timestamps, sourceResultId: "depth.away" } },
        home: { input: inputs.home.depthChart, payload: { roster: [rosterEntry(home.reliever, "", P)] }, execution: { ...timestamps, sourceResultId: "depth.home" } }
      }
    }
  };
}

function makeMilbCase() {
  const away = { teamId: 249, teamName: "Single-A Away", starter: player(700001, "MiLB Away Starter", P), lineup: [player(700011, "MiLB Away Hitter", SS)], reliever: player(700021, "MiLB Away Reliever", P), extra: player(700022, "MiLB Rotation Pitcher", P) };
  const home = { teamId: 432, teamName: "Single-A Home", starter: player(700002, "MiLB Home Starter", P), lineup: [player(700012, "MiLB Home Hitter", SS)], reliever: player(700023, "MiLB Home Reliever", P) };
  const date = "2025-07-03";
  const inputs = { away: sourceInput(away.teamId, date), home: sourceInput(home.teamId, date) };
  const ids = [700001, 700011, 700021, 700022, 700002, 700012, 700023];
  return {
    id: "milb-depth-absence-fallback",
    schedule: { payload: schedulePayload({ gamePk: 800045, sportId: 14, sportName: "Single-A", away, home, date }), selection: { gamePk: "800045", selectedDate: date, sportId: 14, hydrateProfile: "pregame-v1" } },
    sources: {
      roster: {
        away: { input: inputs.away.roster, payload: { rosterType: "active", roster: [rosterEntry(away.starter, "1"), rosterEntry(away.lineup[0], "2"), rosterEntry(away.reliever, "3"), rosterEntry(away.extra, "4")] }, execution: { ...timestamps, sourceResultId: "roster.milb-away" } },
        home: { input: inputs.home.roster, payload: { rosterType: "active", roster: [rosterEntry(home.starter, "5"), rosterEntry(home.lineup[0], "6"), rosterEntry(home.reliever, "7")] }, execution: { ...timestamps, sourceResultId: "roster.milb-home" } }
      },
      people: { input: { personIds: ids, sportId: 14, gameTypes: ["R"], statGroups: ["hitting", "pitching"], statType: "byDateRange", startDate: "2025-01-01", endDate: date, chunkSize: 100 }, payload: { people: ids.map((id) => {
        const raw = [away.starter, ...away.lineup, away.reliever, away.extra, home.starter, ...home.lineup, home.reliever].find((entry) => entry.id === id);
        return enriched(raw, 14);
      }) }, execution: { ...timestamps, sourceResultId: "people.milb" } },
      depthChart: {
        away: { input: inputs.away.depthChart, payload: { rosterType: "depthChart" }, execution: { ...timestamps, sourceResultId: "depth.milb-away" } },
        home: { input: inputs.home.depthChart, payload: { rosterType: "depthChart" }, execution: { ...timestamps, sourceResultId: "depth.milb-home" } }
      }
    }
  };
}

export function buildCases() {
  return [makeMlbCase(), makeMilbCase()];
}

export function normalizeCase(testCase) {
  const schedule = normalizeScheduleSnapshot(testCase.schedule.payload, testCase.schedule.selection, { ...timestamps, createdAtUtc: timestamps.retrievedAtUtc, snapshotId: `schedule-${testCase.id}`, fixtureKind: "synthetic-contract" });
  return normalizeRosterPeopleStaffSnapshot(schedule, testCase.sources, { createdAtUtc: "2026-10-07T20:01:00.000Z", snapshotId: `build-004.4-${testCase.id}`, fixtureKind: "synthetic-contract" });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cases = buildCases();
  await mkdir(fixtureDir, { recursive: true });
  await writeFile(resolve(fixtureDir, "v030-roster-people-source-cases.json"), `${JSON.stringify(cases, null, 2)}\n`);
  for (const testCase of cases) await writeFile(resolve(fixtureDir, `v030-${testCase.id}-normalized.json`), `${JSON.stringify(normalizeCase(testCase), null, 2)}\n`);
  console.log(`Generated ${cases.length} Build 004.4 source cases and normalized snapshots.`);
}
