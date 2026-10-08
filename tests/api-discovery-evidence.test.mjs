import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compareEvidence, getJsonPointer } from "../tools/api-discovery-capture.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = path.join(here, "fixtures", "api-discovery");
const captureNames = [
  "disc-001-822955-schedule-a.json",
  "disc-001-822955-schedule-b.json"
];
const allowedHosts = new Set(["statsapi.mlb.com", "www.mlbstatic.com"]);

async function load(name) {
  return JSON.parse(await readFile(path.join(fixtureRoot, name), "utf8"));
}

test("JSON Pointer extraction distinguishes missing from present null", () => {
  assert.deepEqual(getJsonPointer({ a: [{ value: null }] }, "/a/0/value"), { found: true, value: null });
  assert.deepEqual(getJsonPointer({ a: [] }, "/a/0/value"), { found: false, value: null });
});

test("captured discovery evidence is focused, scoped, and reproducible", async () => {
  const [left, right] = await Promise.all(captureNames.map(load));
  for (const evidence of [left, right]) {
    assert.equal(evidence.schemaVersion, 1);
    assert.equal(evidence.investigationId, "DISC-001");
    assert.equal(evidence.evidenceKind, "historical-current");
    assert.equal(new URL(evidence.request.url).hostname, "statsapi.mlb.com");
    assert.equal(evidence.response.status, 200);
    assert.match(evidence.response.bodySha256, /^[a-f0-9]{64}$/);
    assert.ok(evidence.response.bodyBytes > 0);
    assert.equal(evidence.selection.values["/dates/0/games/0/gamePk"].value, 822955);
    assert.ok(!Object.prototype.hasOwnProperty.call(evidence, "rawBody"), "full response body must not be persisted");
  }

  const comparison = compareEvidence(left, right);
  assert.equal(comparison.matchingSelections, true);
  assert.equal(comparison.differences.length, 0);
  assert.equal(comparison.comparedPointers, left.selection.jsonPointers.length);
});

test("all discovery fixtures conform to the bounded evidence contract", async () => {
  const names = (await readdir(fixtureRoot)).filter((name) => name.endsWith(".json"));
  assert.ok(names.length >= 120, "expected Build 002.1 through 002.6 evidence fixtures");
  for (const name of names) {
    const evidence = await load(name);
    assert.equal(evidence.schemaVersion, 1, name);
    assert.equal(`${evidence.captureId}.json`, name, name);
    assert.match(evidence.investigationId, /^DISC-\d{3}$/, name);
    assert.ok(["live-snapshot", "historical-current", "recorded-prior"].includes(evidence.evidenceKind), name);
    assert.ok(!Number.isNaN(Date.parse(evidence.capturedAtUtc)), name);
    assert.equal(evidence.request.method, "GET", name);
    assert.ok(allowedHosts.has(new URL(evidence.request.url).hostname), name);
    if (name === "disc-009-999999-logo-missing.json") assert.equal(evidence.response.status, 404, name);
    else assert.equal(evidence.response.status, 200, name);
    assert.match(evidence.response.bodySha256, /^[a-f0-9]{64}$/, name);
    assert.ok(evidence.response.bodyBytes > 0, name);
    assert.ok(evidence.selection.jsonPointers.length > 0, name);
    assert.deepEqual(Object.keys(evidence.selection.values), evidence.selection.jsonPointers, name);
    assert.ok(!Object.prototype.hasOwnProperty.call(evidence, "rawBody"), name);
  }
});

test("Build 002.2 fixtures preserve the observed game-state boundaries", async () => {
  const [pregameSchedule, scheduledSchedule, pregameFeed, scheduledFeed, postponed, rescheduledFeed, resumed, cancelled, timeTbd] = await Promise.all([
    load("disc-001-849834-schedule-pregame.json"),
    load("disc-001-849839-schedule-scheduled.json"),
    load("disc-002-849834-feed-pregame.json"),
    load("disc-002-849839-feed-scheduled.json"),
    load("disc-001-777164-schedule-postponed.json"),
    load("disc-001-777164-feed-rescheduled-final.json"),
    load("disc-001-777861-schedule-resumed-final.json"),
    load("disc-001-746577-schedule-cancelled.json"),
    load("disc-001-849809-schedule-time-tbd.json")
  ]);

  const value = (evidence, pointer) => evidence.selection.values[pointer];
  assert.equal(value(pregameSchedule, "/dates/0/games/0/status").value.detailedState, "Pre-Game");
  assert.equal(value(pregameSchedule, "/dates/0/games/0/lineups/awayPlayers").value.length, 9);
  assert.equal(value(pregameSchedule, "/dates/0/games/0/lineups/homePlayers").value.length, 9);
  assert.equal(value(scheduledSchedule, "/dates/0/games/0/status").value.detailedState, "Scheduled");
  assert.equal(value(scheduledSchedule, "/dates/0/games/0/lineups/awayPlayers").found, false);
  assert.equal(value(scheduledSchedule, "/dates/0/games/0/lineups/homePlayers").found, false);
  assert.equal(value(pregameFeed, "/liveData/boxscore/officials").value.length, 6);
  assert.equal(value(scheduledFeed, "/liveData/boxscore/officials").value.length, 0);
  assert.equal(value(postponed, "/dates/0/games/0/status").value.detailedState, "Postponed");
  assert.equal(value(rescheduledFeed, "/gameData/status").value.detailedState, "Final");
  assert.equal(value(resumed, "/dates/0/games/0/officialDate").value, "2025-05-19");
  assert.equal(value(resumed, "/dates/0/games/0/resumeGameDate").value, "2025-05-21");
  assert.equal(value(cancelled, "/dates/0/games/0/status").value.detailedState, "Cancelled");
  assert.equal(value(cancelled, "/dates/0/games/0/gameType").value, "R");
  assert.equal(value(timeTbd, "/dates/0/games/0/status").value.startTimeTBD, true);
  assert.equal(value(timeTbd, "/dates/0/games/0/teams/away/team").value.placeholder, true);
});

test("Build 002.3 dated rosters preserve transaction, IL, level, and two-way boundaries", async () => {
  const names = [
    "disc-004-622554-roster-bal-2025-07-28.json",
    "disc-004-622554-roster-tor-2025-07-30.json",
    "disc-004-622554-transaction.json",
    "disc-004-592450-roster-nya-2025-07-25.json",
    "disc-004-592450-roster-nya-2025-07-28.json",
    "disc-004-592450-roster-nya-2025-08-05.json",
    "disc-004-660271-roster-lan-2025-06-16.json",
    "disc-004-445-roster-aaa-2025-06-01.json",
    "disc-004-402-roster-aa-2025-06-01.json",
    "disc-004-777447-schedule-dh-g1.json",
    "disc-004-777458-schedule-dh-g2.json",
    "disc-004-777458-schedule-dh-rescheduled-view.json",
    "disc-004-145-roster-dh-2025-06-19.json"
  ];
  const [bal, tor, trade, judgeBefore, judgeIl, judgeAfter, ohtani, aaa, aa, game1, game2Original, game2Views, doubleheaderRoster] = await Promise.all(names.map(load));
  const selected = (evidence, pointer) => evidence.selection.values[pointer].value;
  const roster = (evidence) => selected(evidence, "/roster");
  const person = (evidence, id) => roster(evidence).find((entry) => entry.person?.id === id);

  assert.equal(selected(bal, "/rosterType"), "active");
  assert.equal(person(bal, 622554).jerseyNumber, "56");
  assert.equal(person(tor, 622554).jerseyNumber, "48");
  assert.ok(selected(trade, "/transactions").some((entry) => entry.typeCode === "TR" && entry.fromTeam?.id === 110 && entry.toTeam?.id === 141));
  assert.ok(person(judgeBefore, 592450));
  assert.equal(person(judgeIl, 592450), undefined);
  assert.ok(person(judgeAfter, 592450));
  assert.equal(person(ohtani, 660271).position.abbreviation, "TWP");
  assert.equal(roster(aaa).length, 28);
  assert.equal(roster(aa).length, 27);
  assert.equal(selected(game1, "/dates/0/games/0/officialDate"), "2025-06-19");
  assert.equal(selected(game2Original, "/dates/0/games/0/officialDate"), "2025-06-19");
  assert.equal(selected(game1, "/dates/0/games/0/gameNumber"), 1);
  assert.equal(selected(game2Original, "/dates/0/games/0/gameNumber"), 1);
  assert.equal(selected(game2Original, "/dates/0/games/0/status").detailedState, "Postponed");
  assert.equal(selected(game2Views, "/dates/0/games/0").status.detailedState, "Postponed");
  assert.equal(selected(game2Views, "/dates/1/games/0").status.detailedState, "Final");
  assert.equal(selected(game2Views, "/dates/1/games/0").doubleHeader, "Y");
  assert.equal(selected(game2Views, "/dates/1/games/0").gameNumber, 2);
  assert.match(doubleheaderRoster.request.url, /date=2025-06-19/);
  assert.ok(!doubleheaderRoster.request.url.includes("gamePk"));
});

test("Build 002.3 People fixtures preserve aggregate, cutoff, competition, and two-way behavior", async () => {
  const [controls, coltPre, coltPost, twoWay, preOpening, regularEnd, postseasonEnd] = await Promise.all([
    load("disc-005-aggregate-controls-2026-10-04.json"),
    load("disc-005-806068-people-pre-debut.json"),
    load("disc-005-806068-people-post-debut.json"),
    load("disc-005-660271-people-two-way-2025-06-17.json"),
    load("disc-005-660271-people-pre-opening-2025-03-17.json"),
    load("disc-005-660271-people-regular-end-2025-09-28.json"),
    load("disc-005-660271-people-postseason-end-2025-10-30.json")
  ]);
  const selected = (evidence, pointer) => evidence.selection.values[pointer].value;
  const group = (stats, name) => stats.find((entry) => entry.group?.displayName === name);
  const allSplit = (statsGroup) => statsGroup.splits.find((split) => split.sport?.id === 0 || split.sport?.code === "All");

  const ward = selected(controls, "/people/0/stats");
  const dominguez = selected(controls, "/people/1/stats");
  const raleigh = selected(controls, "/people/2/stats");
  assert.equal(selected(controls, "/people/0/id"), 621493);
  assert.equal(group(ward, "hitting").splits.length, 3);
  assert.equal(allSplit(group(ward, "hitting")).stat.gamesPlayed, 143);
  assert.equal(group(dominguez, "pitching").splits.length, 3);
  assert.equal(allSplit(group(dominguez, "pitching")).stat.gamesPitched, 67);
  assert.equal(group(raleigh, "hitting").splits.length, 2);
  assert.deepEqual(group(raleigh, "hitting").splits[0].stat, allSplit(group(raleigh, "hitting")).stat);

  assert.equal(group(selected(coltPre, "/people/0/stats"), "hitting").splits.length, 0);
  assert.equal(allSplit(group(selected(coltPost, "/people/0/stats"), "hitting")).stat.gamesPlayed, 2);
  assert.equal(selected(twoWay, "/people/0/primaryPosition").abbreviation, "TWP");
  assert.ok(allSplit(group(selected(twoWay, "/people/0/stats"), "hitting")));
  assert.ok(allSplit(group(selected(twoWay, "/people/0/stats"), "pitching")));
  for (const statsGroup of selected(preOpening, "/people/0/stats")) assert.equal(statsGroup.splits.length, 0);
  assert.deepEqual(selected(regularEnd, "/people/0/stats"), selected(postseasonEnd, "/people/0/stats"));
  assert.equal(regularEnd.response.bodySha256, postseasonEnd.response.bodySha256);
});

test("Build 002.3 coaches fixtures preserve dated manager changes and repeated roles", async () => {
  const [before, after, current, aaa] = await Promise.all([
    load("disc-007-120-coaches-before-change.json"),
    load("disc-007-120-coaches-after-change.json"),
    load("disc-007-114-coaches-2026-postseason.json"),
    load("disc-007-445-coaches-aaa-2025.json")
  ]);
  const rows = (evidence) => evidence.selection.values["/roster"].value;
  assert.equal(rows(before).find((entry) => entry.job === "Manager").person.id, 118363);
  assert.equal(rows(after).find((entry) => entry.job === "Interim Manager").person.id, 111867);
  assert.equal(rows(after).some((entry) => entry.job === "Manager"), false);
  assert.equal(rows(current).length, 16);
  assert.equal(rows(current).filter((entry) => entry.job === "Assistant Pitching Coach").length, 2);
  assert.equal(rows(aaa).filter((entry) => entry.job === "Hitting Coach").length, 2);
  assert.equal(rows(aaa).filter((entry) => entry.job === "Pitching Coach").length, 2);
});

test("Build 002.4 venue pairs preserve Schedule identity and Feed detail boundaries", async () => {
  const controls = [
    ["745001", "ordinary", 5325, "America/Chicago", 2024],
    ["745814", "london", 5381, "Europe/London", 2024],
    ["778563", "tokyo", 2397, "Asia/Tokyo", 2025],
    ["778718", "spring", 5000, "America/New_York", 2025],
    ["781501", "aaa", 2541, "America/New_York", 2025],
    ["745652", "oakland-2024", 10, "America/Los_Angeles", 2024],
    ["778494", "sutter-2025", 2529, "America/Los_Angeles", 2025]
  ];

  for (const [gamePk, label, venueId, timeZone, season] of controls) {
    const [schedule, feed, narrow] = await Promise.all([
      load(`disc-003-${gamePk}-schedule-${label}.json`),
      load(`disc-003-${gamePk}-feed-${label}.json`),
      load(`disc-003-${venueId}-venue-${season}.json`)
    ]);
    const scheduleVenue = schedule.selection.values["/dates/0/games/0/venue"].value;
    const feedVenue = feed.selection.values["/gameData/venue"].value;
    const narrowVenue = narrow.selection.values["/venues/0"].value;
    assert.equal(scheduleVenue.id, venueId);
    assert.equal(feedVenue.id, venueId);
    assert.equal(scheduleVenue.name, feedVenue.name);
    assert.equal(scheduleVenue.location, undefined, `${label}: Schedule location should be absent`);
    assert.equal(scheduleVenue.timeZone, undefined, `${label}: Schedule timezone should be absent`);
    assert.equal(scheduleVenue.fieldInfo, undefined, `${label}: Schedule fieldInfo should be absent`);
    assert.equal(feedVenue.timeZone.id, timeZone);
    assert.ok(feedVenue.location.city);
    assert.ok(feedVenue.location.country);
    assert.ok(Number.isInteger(feedVenue.fieldInfo.capacity));
    assert.ok(feedVenue.fieldInfo.turfType);
    assert.ok(feedVenue.fieldInfo.roofType);
    assert.deepEqual(narrowVenue, feedVenue, `${label}: hydrated narrow venue response should match the feed venue object`);
  }

  const london = await load("disc-003-745814-feed-london.json");
  const londonField = london.selection.values["/gameData/venue"].value.fieldInfo;
  assert.equal(londonField.leftCenter, undefined, "venue dimensions are optional, not a fixed five-value shape");
  assert.equal(londonField.rightCenter, undefined, "venue dimensions are optional, not a fixed five-value shape");
});

test("Build 002.4 standings fixtures preserve cutoff, scope, and typed-token boundaries", async () => {
  const [preOpening, openingDay, early, alFinal, nlFinal, wildCard, postseason, spring, il, pcl, types] = await Promise.all([
    load("disc-006-mlb-al-pre-opening-2025-03-26.json"),
    load("disc-006-mlb-al-opening-day-2025-03-27.json"),
    load("disc-006-mlb-al-early-2025-04-05.json"),
    load("disc-006-mlb-al-final-2025-09-28.json"),
    load("disc-006-mlb-nl-final-2025-09-28.json"),
    load("disc-006-mlb-wildcard-final-2025-09-28.json"),
    load("disc-006-mlb-postseason-2025-10-05.json"),
    load("disc-006-mlb-spring-2025-03-15.json"),
    load("disc-006-il-final-2025-09-21.json"),
    load("disc-006-pcl-final-2025-09-21.json"),
    load("disc-006-standings-types.json")
  ]);
  const records = (evidence) => evidence.selection.values["/records"].value;
  const teams = (evidence) => records(evidence).flatMap((record) => record.teamRecords || []);

  assert.equal(records(preOpening).length, 3);
  assert.ok(teams(preOpening).every((team) => team.gamesPlayed === 0));
  assert.ok(teams(preOpening).every((team) => team.streak === undefined));
  assert.ok(teams(openingDay).some((team) => team.gamesPlayed === 1));
  assert.ok(teams(openingDay).some((team) => team.records.splitRecords.find((split) => split.type === "lastTen")?.wins === 1));
  assert.ok(teams(early).some((team) => team.gamesPlayed < 10));
  assert.ok(teams(early).every((team) => team.records.splitRecords.some((split) => split.type === "lastTen")));

  for (const evidence of [alFinal, nlFinal]) {
    assert.equal(records(evidence).length, 3);
    assert.ok(records(evidence).every((record) => record.standingsType === "regularSeason"));
    assert.ok(records(evidence).every((record) => record.teamRecords.length === 5));
    assert.ok(teams(evidence).some((team) => ["w", "y", "z"].includes(team.clinchIndicator)));
    assert.ok(teams(evidence).some((team) => team.eliminationNumber === "E"));
    assert.ok(teams(evidence).some((team) => /^\+\d+(?:\.\d+)?$/.test(team.wildCardGamesBack)));
    assert.ok(teams(evidence).every((team) => /^\d+$/.test(team.divisionRank)));
  }

  assert.equal(records(wildCard).filter((record) => record.standingsType === "wildCard").length, 2);
  assert.equal(records(wildCard).filter((record) => record.standingsType === "divisionLeaders").length, 6);
  assert.ok(records(wildCard).filter((record) => record.standingsType === "wildCard").every((record) => record.teamRecords.length === 12));
  assert.ok(records(postseason).length > 0);
  assert.ok(records(postseason).every((record) => record.standingsType === "postseason"));
  assert.equal(records(spring).length, 6);
  assert.ok(records(spring).every((record) => record.standingsType === "springTraining"));
  assert.deepEqual(records(il).map((record) => record.teamRecords.length), [10, 10]);
  assert.deepEqual(records(pcl).map((record) => record.teamRecords.length), [5, 5]);

  const typeNames = Object.values(types.selection.values).map((entry) => entry.value?.name).filter(Boolean);
  assert.ok(typeNames.includes("regularSeason"));
  assert.ok(typeNames.includes("wildCardWithLeaders"));
  assert.ok(typeNames.includes("springTraining"));
  assert.ok(typeNames.includes("postseason"));
});

test("Build 002.4 standings groups are deterministic only at returned source-group scope", async () => {
  const [regular, wildCard] = await Promise.all([
    load("disc-006-mlb-al-final-2025-09-28.json"),
    load("disc-006-mlb-wildcard-final-2025-09-28.json")
  ]);
  const records = (evidence) => evidence.selection.values["/records"].value;
  const sourceKey = (record) => [record.standingsType, record.sport?.id ?? "none", record.league?.id ?? "none", record.division?.id ?? "none"].join(":");
  const regularRecords = records(regular);
  const keys = regularRecords.map(sourceKey);

  assert.equal(new Set(keys).size, keys.length);
  assert.ok(regularRecords.every((record) => record.division?.id));
  assert.ok(regularRecords.every((record) => record.teamRecords.every((team) => team.team?.id && team.team?.name)));
  assert.equal(new Set(regularRecords.flatMap((record) => record.teamRecords.map((team) => team.team.id))).size, 15);
  assert.equal(regularRecords.some((record) => !record.division), false, "regularSeason response has no explicit league-wide group");
  assert.equal(regularRecords.some((record) => record.standingsType === "wildCard"), false, "regularSeason response has no explicit Wild Card group");

  const wildRecords = records(wildCard);
  assert.ok(wildRecords.some((record) => record.standingsType === "wildCard"));
  assert.ok(wildRecords.some((record) => record.standingsType === "divisionLeaders"));
  const typedKeys = wildRecords.map(sourceKey);
  const untypedKeys = wildRecords.map((record) => [record.league?.id ?? "none", record.division?.id ?? "none"].join(":"));
  assert.equal(new Set(typedKeys).size, typedKeys.length);
  assert.ok(new Set(untypedKeys).size < untypedKeys.length, "standingsType is required to disambiguate groups sharing league/division IDs");
  const partitionedTeamIds = wildRecords.flatMap((record) => record.teamRecords.map((team) => team.team.id));
  assert.equal(new Set(partitionedTeamIds).size, 30, "Wild Card plus leader groups partition all 30 MLB teams in this response");
});

test("Build 002.5 depth charts are season-insensitive role annotations, not roster authority", async () => {
  const [dodgers2025, dodgers2026, rays, columbusDepth, dodgersRoster, columbusRoster] = await Promise.all([
    load("disc-008-119-depthchart-2025.json"),
    load("disc-008-119-depthchart-2026.json"),
    load("disc-008-139-depthchart-2025.json"),
    load("disc-008-445-depthchart-2025.json"),
    load("disc-004-660271-roster-lan-2025-06-16.json"),
    load("disc-004-445-roster-aaa-2025-06-01.json")
  ]);
  const selected = (evidence, pointer) => evidence.selection.values[pointer].value;
  const roster = (evidence) => selected(evidence, "/roster");
  const la = roster(dodgers2025);

  assert.equal(selected(dodgers2025, "/rosterType"), "depthChart");
  assert.equal(selected(dodgers2025, "/teamId"), 119);
  assert.deepEqual(roster(dodgers2025), roster(dodgers2026), "season parameter did not change the captured Dodgers depth chart");
  assert.ok(la.some((entry) => entry.position?.abbreviation === "SP"));
  assert.ok(la.some((entry) => entry.position?.abbreviation === "P"));
  assert.ok(la.some((entry) => ["D15", "D60"].includes(entry.status?.code)), "depth chart includes inactive pitchers");
  assert.equal(la.find((entry) => entry.person?.id === 660271)?.position?.abbreviation, "DH");
  assert.equal(roster(dodgersRoster).find((entry) => entry.person?.id === 660271)?.position?.abbreviation, "TWP");
  assert.ok(roster(rays).some((entry) => entry.position?.abbreviation === "CP"));
  assert.equal(columbusDepth.selection.values["/roster"].found, false);
  assert.equal(roster(columbusDepth), null);
  assert.equal(roster(columbusRoster).length, 28, "empty MiLB depth chart must not replace the dated active roster");
});

test("Build 002.5 logo fixtures preserve vector, cache, CORS, and missing-asset behavior", async () => {
  const validNames = [
    "disc-009-119-logo-current-mlb.json",
    "disc-009-133-logo-relocated.json",
    "disc-009-159-logo-al-all-star.json",
    "disc-009-160-logo-nl-all-star.json",
    "disc-009-402-logo-aa.json",
    "disc-009-42-logo-placeholder.json",
    "disc-009-445-logo-aaa.json"
  ];
  const valid = await Promise.all(validNames.map(load));
  for (const evidence of valid) {
    const asset = evidence.selection.values["/asset"].value;
    assert.equal(evidence.response.status, 200);
    assert.equal(evidence.response.headers.contentType, "image/svg+xml");
    assert.match(evidence.response.headers.cacheControl, /max-age=1209600/);
    assert.equal(evidence.response.headers.accessControlAllowOrigin, "*");
    assert.equal(evidence.response.redirected, false);
    assert.equal(asset.isSvg, true);
    assert.match(asset.viewBox, /^\S+\s+\S+\s+\S+\s+\S+$/);
    assert.equal(asset.width, null);
    assert.equal(asset.height, null);
    assert.equal(asset.transparentCanvasByDefault, true);
    assert.equal(asset.hasRasterImage, false);
  }

  const missing = await load("disc-009-999999-logo-missing.json");
  const missingAsset = missing.selection.values["/asset"].value;
  assert.equal(missing.response.status, 404);
  assert.match(missing.response.headers.contentType, /^text\/html/);
  assert.equal(missing.response.headers.accessControlAllowOrigin, null);
  assert.equal(missingAsset.isSvg, false);
  assert.equal(missingAsset.viewBox, null);
});

test("Build 002.6 regular-season game sources preserve the sampled MiLB level contract", async () => {
  const controls = [
    [781501, "aaa", 11, 3],
    [783048, "aa", 12, 3],
    [784002, "high-a", 13, 2],
    [786772, "single-a", 14, 2]
  ];

  for (const [gamePk, label, sportId, officialCount] of controls) {
    const [schedule, feed] = await Promise.all([
      load(`disc-011-${gamePk}-schedule-${label}.json`),
      load(`disc-011-${gamePk}-feed-${label}.json`)
    ]);
    const scheduleValue = (pointer) => schedule.selection.values[pointer].value;
    const feedValue = (pointer) => feed.selection.values[pointer].value;
    const teams = scheduleValue("/dates/0/games/0/teams");
    const lineups = scheduleValue("/dates/0/games/0/lineups");

    assert.equal(scheduleValue("/dates/0/games/0/gameType"), "R", label);
    assert.equal(scheduleValue("/dates/0/games/0/status").detailedState, "Final", label);
    assert.equal(lineups.awayPlayers.length, 9, label);
    assert.equal(lineups.homePlayers.length, 9, label);
    assert.ok(teams.away.probablePitcher, label);
    assert.ok(teams.home.probablePitcher, label);
    assert.equal(teams.away.team.sport.id, sportId, label);
    assert.equal(teams.home.team.sport.id, sportId, label);
    assert.equal(feedValue("/gameData/game").type, "R", label);
    assert.equal(feedValue("/liveData/boxscore/officials").length, officialCount, label);
    assert.ok(Object.keys(feedValue("/liveData/boxscore/teams").away.players).length > 0, label);
    assert.ok(Object.keys(feedValue("/liveData/boxscore/teams").home.players).length > 0, label);
  }
});

test("Build 002.6 MiLB support remains endpoint-specific and sport-scoped", async () => {
  const selected = (evidence, pointer) => evidence.selection.values[pointer];
  const [highRoster, singleRoster, aaCoaches, highCoaches, singleCoaches, aaDepth, highDepth, singleDepth, aaStandings, highStandings, singleStandings] = await Promise.all([
    load("disc-011-432-roster-high-a.json"),
    load("disc-011-249-roster-single-a.json"),
    load("disc-011-402-coaches-aa.json"),
    load("disc-011-432-coaches-high-a.json"),
    load("disc-011-249-coaches-single-a.json"),
    load("disc-011-402-depthchart-aa.json"),
    load("disc-011-432-depthchart-high-a.json"),
    load("disc-011-249-depthchart-single-a.json"),
    load("disc-011-113-standings-aa.json"),
    load("disc-011-116-standings-high-a.json"),
    load("disc-011-122-standings-single-a.json")
  ]);

  assert.equal(selected(highRoster, "/roster").value.length, 27);
  assert.equal(selected(singleRoster, "/roster").value.length, 27);
  assert.deepEqual([aaCoaches, highCoaches, singleCoaches].map((evidence) => selected(evidence, "/roster").value.length), [7, 4, 5]);
  for (const evidence of [aaDepth, highDepth, singleDepth]) {
    assert.equal(selected(evidence, "/rosterType").value, "depthChart");
    assert.equal(selected(evidence, "/roster").found, false);
  }
  for (const evidence of [aaStandings, highStandings, singleStandings]) {
    assert.deepEqual(selected(evidence, "/records").value.map((record) => record.teamRecords.length), [6, 6]);
  }

  const people = await Promise.all([
    ["disc-011-668954-people-aaa.json", 11],
    ["disc-011-674868-people-aa.json", 12],
    ["disc-011-802105-people-high-a.json", 13],
    ["disc-011-679977-people-single-a.json", 14]
  ].map(async ([name, sportId]) => [await load(name), sportId]));
  for (const [evidence, sportId] of people) {
    assert.match(evidence.request.url, new RegExp(`sportId%3D${sportId}`));
    const pitching = selected(evidence, "/people/0/stats").value.find((entry) => entry.group?.displayName === "pitching");
    assert.ok(pitching.splits.some((split) => split.sport?.id === sportId));
    assert.ok(pitching.splits.some((split) => split.sport?.id === 0));
  }
});

test("Build 002.6 competition fixtures require explicit game-type scope", async () => {
  const gameControls = [
    [778718, "spring", "S", 4],
    [813072, "wild-card", "F", 6],
    [813047, "division-series", "D", 6],
    [813040, "league-championship", "L", 6],
    [813027, "world-series", "W", 6]
  ];
  for (const [gamePk, label, gameType, officials] of gameControls) {
    const [schedule, feed] = await Promise.all([
      load(`disc-012-${gamePk}-schedule-${label}.json`),
      load(`disc-012-${gamePk}-feed-${label}.json`)
    ]);
    assert.equal(schedule.selection.values["/dates/0/games/0/gameType"].value, gameType, label);
    assert.equal(schedule.selection.values["/dates/0/games/0/lineups"].value.awayPlayers.length, 9, label);
    assert.equal(schedule.selection.values["/dates/0/games/0/lineups"].value.homePlayers.length, 9, label);
    assert.equal(feed.selection.values["/gameData/game"].value.type, gameType, label);
    assert.equal(feed.selection.values["/liveData/boxscore/officials"].value.length, officials, label);
  }

  const [spring, regular, postseason, defaultPreOpening, defaultPostseason] = await Promise.all([
    load("disc-012-660271-people-spring-2025.json"),
    load("disc-012-660271-people-regular-2025.json"),
    load("disc-012-660271-people-postseason-2025.json"),
    load("disc-005-660271-people-pre-opening-2025-03-17.json"),
    load("disc-005-660271-people-postseason-end-2025-10-30.json")
  ]);
  const stats = (evidence) => evidence.selection.values["/people/0/stats"].value;
  const group = (evidence, name) => stats(evidence).find((entry) => entry.group?.displayName === name);
  const all = (entry) => entry.splits.find((split) => split.sport?.id === 0);

  assert.match(spring.request.url, /gameType%3D%5BS%5D/);
  assert.equal(all(group(spring, "hitting")).stat.gamesPlayed, 7);
  assert.ok(stats(defaultPreOpening).every((entry) => entry.splits.length === 0));
  assert.match(regular.request.url, /gameType%3D%5BR%5D/);
  assert.equal(all(group(regular, "hitting")).stat.gamesPlayed, 158);
  assert.equal(all(group(regular, "pitching")).stat.gamesPitched, 14);
  assert.match(postseason.request.url, /gameType%3D%5BF%2CD%2CL%2CW%5D/);
  assert.equal(all(group(postseason, "hitting")).stat.gamesPlayed, 15);
  assert.equal(all(group(postseason, "pitching")).stat.gamesPitched, 3);
  assert.equal(stats(defaultPostseason).some((entry) => all(entry)?.stat?.gamesPlayed === 15), false);
});
