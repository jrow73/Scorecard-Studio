import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildFieldDiagnosticRows, summarizeDiagnosticRows } from "../js/field-diagnostic.js";
import { getCatalogFields, resolveField } from "../js/field-registry.js";
import { normalizePregameData } from "../js/normalize.js";
import { DESIGNER_SAMPLE_MODEL } from "../js/sample-data.js";

// 018.1 acceptance defect: DH must remain visibly identifiable in the derived position-number field.
const sampleDh = DESIGNER_SAMPLE_MODEL.home.lineup.find((slot) => slot.position?.abbreviation === "DH");
assert.ok(sampleDh, "representative lineup includes a DH");
assert.equal(sampleDh.position.number, "DH", "representative DH position number displays DH");

const liveFeed = {
  gameData: {
    game: { pk: 1, season: "2026" },
    datetime: { officialDate: "2026-09-19" },
    teams: {
      away: { id: 1, name: "Away", record: {} },
      home: { id: 2, name: "Home", record: {} }
    },
    players: { ID10: { id: 10, fullName: "Test Hitter", primaryPosition: { abbreviation: "DH", name: "Designated Hitter" } } }
  },
  liveData: {
    boxscore: {
      officials: [],
      teams: {
        away: { battingOrder: [10], players: { ID10: { person: { id: 10, fullName: "Test Hitter" }, position: { abbreviation: "DH", name: "Designated Hitter" }, seasonStats: { batting: {} } } }, bench: [], bullpen: [] },
        home: { battingOrder: [], players: {}, bench: [], bullpen: [] }
      }
    }
  }
};
const normalized = normalizePregameData(liveFeed, {}, { gamePk: 1, officialDate: "2026-09-19" });
assert.equal(normalized.away.lineup[0].position.number, "DH", "live normalized DH position number displays DH");

// 018.1 acceptance defect: normal representative boxscore names should usually resemble source compact names.
assert.equal(DESIGNER_SAMPLE_MODEL.home.lineup[1].player.boxscoreName, "Rodríguez", "typical boxscore sample uses the recognizable last name");
const brandon = DESIGNER_SAMPLE_MODEL.away.lineup.find((slot) => slot.player?.name === "Brandon Lowe");
const josh = DESIGNER_SAMPLE_MODEL.away.lineup.find((slot) => slot.player?.name === "Josh Lowe");
assert.equal(brandon.player.boxscoreName, "Lowe, B", "representative data can demonstrate source disambiguation");
assert.equal(josh.player.boxscoreName, "Lowe, J", "representative data can demonstrate source disambiguation");

// The diagnostic must cover every active field and expose usable summary states.
const diagnosticModel = structuredClone(DESIGNER_SAMPLE_MODEL);
diagnosticModel.meta = { sources: { gamePack: true, coaches: true, standings: true } };
const rows = buildFieldDiagnosticRows(diagnosticModel);
assert.equal(rows.length, getCatalogFields().length, "diagnostic reports every active catalog field");
const summary = summarizeDiagnosticRows(rows);
assert.equal(summary.total, rows.length);
assert.equal(summary.sourceUnavailable, 0, "all representative diagnostic sources are marked loaded");
assert.equal(summary.error, 0, "representative diagnostic has no resolver errors");
assert.ok(summary.available > 0, "diagnostic produces available rows");
const positionRow = rows.find((row) => row.id === "home.lineup[].position.number");
assert.equal(positionRow.status, "available");
assert.equal(positionRow.coverage, "9/9", "DH no longer creates partial position-number coverage");

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
assert.match(html, /Build 018\.(?:2|3)/);
assert.match(html, /Field Coverage Diagnostic/);
assert.match(html, /id="field-diagnostic-table-body"/);
assert.match(app, /buildFieldDiagnosticRows/);
assert.match(app, /hydrateSelectedGameModel/);
assert.match(app, /requirements\.has\("standings"\)/, "PDF/diagnostic hydration can request standings");

console.log(`Build 018.2 live field diagnostic tests passed for ${rows.length} active fields.`);
