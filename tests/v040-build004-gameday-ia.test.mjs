import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { gameDaySeasonContext, pitcherGroupPresentation, standingsGroupTitle, standingsPresentation, visibleGameDaySections } from "../js/v040-gameday.js";
import { DEFAULT_APP_PREFERENCES, normalizeAppPreferences, normalizeGameDayDetailLevel } from "../js/v040-settings.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Game Day detail levels are additive and Standard is the safe default", () => {
  const compact = visibleGameDaySections("compact");
  const standard = visibleGameDaySections("standard");
  const advanced = visibleGameDaySections("advanced");
  assert.deepEqual(compact, ["gameday-overview", "gameday-teams", "gameday-lineups", "gameday-pitchers"]);
  assert.ok(compact.every((id) => standard.includes(id)));
  assert.ok(standard.every((id) => advanced.includes(id)));
  assert.equal(normalizeGameDayDetailLevel("unexpected"), "standard");
  assert.equal(DEFAULT_APP_PREFERENCES.gameDayDetailLevel, "standard");
});

test("season context is derived independently from game scope", () => {
  assert.equal(gameDaySeasonContext({ context: { competitionSegment: "spring", gameType: "S" } }).key, "preseason");
  assert.equal(gameDaySeasonContext({ context: { competitionSegment: "regular", gameType: "R" } }).key, "regular");
  assert.equal(gameDaySeasonContext({ context: { competitionSegment: "postseason", gameType: "W" } }).key, "postseason");
});

test("the detail choice is part of the generic app preference record", () => {
  assert.deepEqual(normalizeAppPreferences({ appearance: "light", gameDayDetailLevel: "advanced" }), {
    schemaVersion: 1,
    appearance: "light",
    gameDayDetailLevel: "advanced"
  });
});

test("Build 004.6 presents user detail controls and keeps source outcomes in a technical disclosure", async () => {
  const [html, app, css] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "js", "app.js"), "utf8"),
    readFile(path.join(root, "css", "styles.css"), "utf8")
  ]);
  for (const level of ["compact", "standard", "advanced"]) assert.match(html, new RegExp(`name="gameday-detail" value="${level}"`));
  assert.match(html, /<details class="gameday-technical-details">/);
  assert.doesNotMatch(html, /Coaches API|Standings API|Core Pregame/);
  assert.doesNotMatch(app, /Schema-v2 pregame data loaded successfully|Coaches API: loaded|Standings API: loaded/);
  assert.match(app, /setSetting\(APP_PREFERENCES_SETTING_KEY, next\)/);
  assert.match(app, /gameDaySeasonContext\(model\)/);
  assert.match(css, /data-detail-level="compact"/);
});

test("Build 004.6a separates relevant standings, names unnamed MLB groups, and removes duplicated research UI", async () => {
  const model = {
    away: { team: { id: 1, name: "Away", league: { name: "American League" }, division: { name: "American League West" } } },
    home: { team: { id: 2, name: "Home", league: { name: "National League" }, division: { name: "National League West" } } },
    standings: { groups: [
      { key: "regularSeason:1:103:200", rows: [{ team: { id: 1 } }] },
      { key: "regularSeason:1:104:203", rows: [{ team: { id: 2 } }] },
      { key: "regularSeason:1:103:202", rows: [{ team: { id: 3 } }] }
    ] }
  };
  const result = standingsPresentation(model);
  assert.equal(result.relevant.length, 2);
  assert.equal(result.other.length, 1);
  assert.equal(result.other[0].title, "American League Central");
  assert.notEqual(standingsGroupTitle({}, []), "Returned Standings Group");

  const [html, app] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "js", "app.js"), "utf8")
  ]);
  assert.match(html, /id="gameday-empty-state"/);
  assert.doesNotMatch(html, /id="gameday-relevant-standings"/);
  assert.match(app, /gameday-team-embedded-standings/);
  assert.match(html, />Pitching Staff</);
  assert.doesNotMatch(html, /Role-aware active arms|Posted batting order|Snapshot Context|Research Context/);
  assert.doesNotMatch(app, /"P\?"|Returned Standings Group|SP role annotations are unavailable; no pitchers are inferred/);
  assert.match(app, /layoutHasRenderableMappings/);
});

test("Build 004.6b keeps wide Game Day layouts dense and protects the team gutter", async () => {
  const styles = await readFile(path.join(root, "css", "styles.css"), "utf8");
  assert.match(styles, /\.gameday-view\s*\{[^}]*width:\s*min\(100%,\s*1400px\)[^}]*margin-inline:\s*auto/s);
  assert.match(styles, /\.gameday-team-grid,\s*\.gameday-lineup-grid\s*\{[^}]*column-gap:\s*28px/s);
  assert.match(styles, /\.gameday-team-grid\s*>\s*\*,\s*\.gameday-lineup-grid\s*>\s*\*\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.gameday-person-row\s*\{[^}]*justify-content:\s*flex-start/s);
  assert.match(styles, /\.gameday-person-row\s*>\s*div:first-child\s*\{[^}]*display:\s*inline-flex/s);
  assert.match(styles, /\[data-detail-level="compact"\]\s*\.gameday-player-table\s*\{[^}]*width:\s*auto/s);
});

test("Build 004.6c uses consistent player tables and stable core context", async () => {
  const [html, app, styles] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "js", "app.js"), "utf8"),
    readFile(path.join(root, "css", "styles.css"), "utf8")
  ]);
  assert.ok(html.indexOf('id="gameday-benches"') < html.indexOf('id="gameday-pitchers"'));
  assert.doesNotMatch(html, /<div data-gameday-min-level="standard"><h3>Officials/);
  assert.match(app, /Double Header Game Number/);
  assert.match(app, /const selectedGame = currentScheduleGame\(\)/);
  assert.doesNotMatch(app, /\["Day \/ Night"|\["Game Number"|\["Competition"/);
  assert.match(app, /gameday-pitcher-table/);
  assert.match(app, /gameday-bench-table/);
  assert.match(app, /mlbstatic\.com\/team-logos\/\$\{numericTeamId\}\.svg/);
  assert.doesNotMatch(app, /gameDayPitcherRow|gameday-person-identity/);
  assert.match(styles, /\.gameday-person-row\.simple\s*\{[^}]*grid-template-columns:\s*minmax\(max-content,\s*190px\)/s);
  const fallback = pitcherGroupPresentation({ away: { bullpen: [] }, meta: { lineage: [] } }, "away");
  assert.equal(fallback.bullpenNote, "No Starter/Reliever role available");
});

test("Build 004.6d packs Advanced stats and aligns standings with each team", async () => {
  const crossDivision = standingsPresentation({
    away: { team: { id: 115, name: "Colorado Rockies", division: { name: "National League West" } } },
    home: { team: { id: 147, name: "New York Yankees", division: { name: "American League East" } } },
    standings: { groups: [
      { key: "regularSeason:1:103:201", rows: [{ team: { id: 147 } }] },
      { key: "regularSeason:1:104:203", rows: [{ team: { id: 115 } }] }
    ] }
  });
  assert.deepEqual(crossDivision.relevant.map((item) => item.matchingSideKeys), [["away"], ["home"]]);
  assert.deepEqual(crossDivision.relevant.map((item) => item.title), ["National League West", "American League East"]);

  const sharedDivision = standingsPresentation({
    away: { team: { id: 142, name: "Minnesota Twins", division: { name: "American League Central" } } },
    home: { team: { id: 116, name: "Detroit Tigers", division: { name: "American League Central" } } },
    standings: { groups: [
      { key: "regularSeason:1:103:202", rows: [{ team: { id: 142 } }, { team: { id: 116 } }] }
    ] }
  });
  assert.equal(sharedDivision.relevant.length, 1);
  assert.deepEqual(sharedDivision.relevant[0].matchingSideKeys, ["away", "home"]);

  const [app, styles] = await Promise.all([
    readFile(path.join(root, "js", "app.js"), "utf8"),
    readFile(path.join(root, "css", "styles.css"), "utf8")
  ]);
  for (const label of ["G", "IP", "BB", "SV", "HLD"]) {
    assert.match(app, new RegExp(`data-gameday-min-level="advanced">${label}<`));
  }
  assert.match(app, /gameday-standings-away/);
  assert.match(app, /gameday-standings-home/);
  assert.match(app, /gameday-standings-shared/);
  assert.match(styles, /\[data-detail-level="advanced"\]\s*\.gameday-player-table\s*\{[^}]*width:\s*auto;[^}]*min-width:\s*0/s);
  assert.match(styles, /#gameday-standings\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
  assert.match(styles, /@media \(max-width:\s*1280px\)[\s\S]*\[data-detail-level="advanced"\] #gameday-lineups/s);
});

test("Build 004.6e keeps repeated table columns aligned and bounds staff roles", async () => {
  const [html, app, styles] = await Promise.all([
    readFile(path.join(root, "index.html"), "utf8"),
    readFile(path.join(root, "js", "app.js"), "utf8"),
    readFile(path.join(root, "css", "styles.css"), "utf8")
  ]);
  assert.equal((html.match(/gameday-batter-table/g) || []).length, 2);
  assert.match(app, /gameday-batter-table gameday-bench-table/);
  assert.match(styles, /\.gameday-batter-table,\s*\.gameday-pitcher-table\s*\{\s*table-layout:\s*fixed/s);
  assert.match(styles, /\[data-detail-level="standard"\]\s*\.gameday-batter-table\s*\{\s*width:\s*471px/);
  assert.match(styles, /\[data-detail-level="advanced"\] \.gameday-batter-table,\s*\[data-detail-level="advanced"\] \.gameday-pitcher-table\s*\{\s*width:\s*640px/);
  assert.match(styles, /\.gameday-batter-table th:nth-child\(2\)[^{]*\{[^}]*width:\s*185px;[^}]*min-width:\s*185px;[^}]*max-width:\s*185px/s);
  assert.match(styles, /\.gameday-pitcher-table th:nth-child\(2\)[^{]*\{[^}]*width:\s*185px;[^}]*min-width:\s*185px;[^}]*max-width:\s*185px/s);
  assert.match(styles, /\.gameday-person-row\.simple\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*230px\)/s);
  assert.match(styles, /\.gameday-person-row\.simple strong\s*\{[^}]*white-space:\s*normal/s);
});
