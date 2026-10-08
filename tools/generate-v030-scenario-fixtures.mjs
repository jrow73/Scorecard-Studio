import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? ".");
const fixtureDir = path.join(root, "tests", "fixtures", "model-contract");
const base = JSON.parse(await readFile(path.join(fixtureDir, "v030-game2-mixed-cutoff.json"), "utf8"));

const clone = (value) => structuredClone(value);

function person(id, name, number, primary = ["CF", "Center Fielder", "Outfielder"], bats = "R", throws = "R") {
  return {
    id,
    name,
    number,
    bats,
    throws,
    primaryPosition: { abbreviation: primary[0], name: primary[1], type: primary[2] }
  };
}

function scope(gameTypes = ["R"], sportId = 1, endDate = "2025-07-03") {
  return {
    sportId,
    gameTypes,
    statType: "byDateRange",
    startDate: "2025-01-01",
    endDate,
    aggregate: { sportId, code: null, selection: "all" }
  };
}

function hitting(gameTypes = ["R"], sportId = 1) {
  return { scope: scope(gameTypes, sportId), totals: { gamesPlayed: 80, avg: 0.275, obp: 0.35, slg: 0.44, homeRuns: 11, rbi: 42 } };
}

function pitching(gameTypes = ["R"], sportId = 1) {
  return { scope: scope(gameTypes, sportId), totals: { gamesPlayed: 18, gamesStarted: 17, wins: 8, losses: 4, era: 3.21, whip: 1.18 } };
}

function role(player, position, stats = {}) {
  return {
    player,
    position: { abbreviation: position[0], name: position[1], number: position[2], roleLabel: position[3] ?? null },
    stats
  };
}

function slot(order, player, position, stats = { hitting: hitting() }) {
  return { battingOrder: order, slotState: "available", ...role(player, position, stats) };
}

function effective(kind = "gameState", context = {}) {
  if (kind === "gameState") return { kind, gamePk: context.gamePk, canonicalGameState: "pregame", rawGameState: "Pre-Game" };
  if (kind === "date") return { kind, date: context.officialDate };
  if (kind === "dateRange") return { kind, startDate: "2025-01-01", endDate: context.officialDate };
  if (kind === "endOfDay") return { kind, cutoffDate: context.officialDate };
  if (kind === "current") return { kind };
  return { kind: "unknown" };
}

function source(context, id, adapter, kind = "gameState", outcome = "success") {
  return {
    id,
    adapter,
    request: { key: `${adapter}|v1|scenario=${id}`, endpointFamily: `scenario-${adapter}`, method: "GET", parameters: { scenario: id } },
    scope: { gamePk: context.gamePk, selectedViewKey: context.selectedViewKey },
    requestedAtUtc: outcome === "notRequested" ? null : "2026-10-07T18:00:00.000Z",
    retrievedAtUtc: outcome === "notRequested" ? null : "2026-10-07T18:00:00.100Z",
    effective: effective(kind, context),
    outcome,
    response: outcome === "success" ? { status: 200, bodySha256: null } : undefined,
    error: null
  };
}

function lineage(id, target, state, sourceResult, options = {}) {
  const selected = options.selected ?? (state === "available" || state === "partial" || state === "present-empty" ? sourceResult.id : null);
  return {
    id: `lineage.${id}`,
    target,
    coverage: options.coverage ?? "subtree",
    state,
    sourceResultRefs: [sourceResult.id],
    selectedSourceResultRef: selected,
    sourcePath: options.sourcePath ?? null,
    effective: options.effective ?? sourceResult.effective,
    selectionReason: options.reason ?? null,
    fallbackUsed: options.fallbackUsed ?? false,
    rejectedCandidates: [],
    transformations: options.transformations ?? [],
    derivationInputs: options.derivationInputs ?? []
  };
}

function makeScenario(slug, gamePk, mutate) {
  const model = clone(base);
  model.context.gamePk = gamePk;
  model.context.selectedDate = "2025-07-03";
  model.context.officialDate = "2025-07-03";
  model.context.selectedViewKey = `${gamePk}:2025-07-03:1`;
  model.game.dates.scheduledStart = "2025-07-03T23:10:00.000Z";
  model.game.dates.originalScheduledStart = "2025-07-03T23:10:00.000Z";
  model.game.dates.officialDate = "2025-07-03";
  model.game.gameNumber = 1;
  model.game.umpires.crew = [];

  const awayBatter = person(610001, "Away Example Batter", "7");
  const homeBatter = person(610002, "Home Example Batter", "18", ["SS", "Shortstop", "Infielder"], "L", "R");
  const awayStarter = person(610011, "Away Example Starter", "32", ["P", "Pitcher", "Pitcher"], "R", "R");
  const homeStarter = person(610012, "Home Example Starter", "41", ["P", "Pitcher", "Pitcher"], "R", "L");
  const awayReliever = person(610021, "Away Example Reliever", "55", ["P", "Pitcher", "Pitcher"], "R", "R");
  const homeReliever = person(610022, "Home Example Reliever", "58", ["P", "Pitcher", "Pitcher"], "R", "R");

  model.away.lineup = { state: "posted", slots: [slot(1, awayBatter, ["CF", "Center Field", 8])] };
  model.home.lineup = { state: "posted", slots: [slot(1, homeBatter, ["SS", "Shortstop", 6])] };
  model.away.startingPitcher = role(awayStarter, ["P", "Pitcher", 1, "SP"], { pitching: pitching() });
  model.home.startingPitcher = role(homeStarter, ["P", "Pitcher", 1, "SP"], { pitching: pitching() });
  model.away.bench = [];
  model.home.bench = [];
  model.away.additionalStarters = [];
  model.home.additionalStarters = [];
  model.away.bullpen = [role(awayReliever, ["P", "Pitcher", 1, "P"], { pitching: pitching() })];
  model.home.bullpen = [role(homeReliever, ["P", "Pitcher", 1, "P"], { pitching: pitching() })];
  model.away.manager = { state: "notRequested", candidates: [], selected: null };
  model.home.manager = { state: "notRequested", candidates: [], selected: null };
  model.away.coaches = [];
  model.home.coaches = [];

  const schedule = source(model.context, "schedule.primary", "schedule");
  const roster = source(model.context, "roster.teams", "roster", "date");
  const people = source(model.context, "people.scoped", "people", "dateRange");
  const standings = source(model.context, "standings.scoped", "standings", "endOfDay");
  const coaches = source(model.context, "coaches.not-requested", "coaches", "date", "notRequested");
  model.meta = {
    snapshot: {
      id: `contract-${slug}`,
      createdAtUtc: "2026-10-07T18:01:00.000Z",
      producer: { applicationVersion: "0.3.0-design", build: "003.4" },
      fixtureKind: "synthetic-contract"
    },
    sourceResults: [schedule, roster, people, standings, coaches],
    lineage: [
      lineage("game", "/game", "available", schedule),
      lineage("away", "/away", "available", schedule),
      lineage("home", "/home", "available", schedule),
      lineage("standings", "/standings", "available", standings),
      lineage("away-roster", "/away/bullpen", "available", roster, { coverage: "exact" }),
      lineage("home-roster", "/home/bullpen", "available", roster, { coverage: "exact" }),
      lineage("away-hitting", "/away/lineup/slots/0/stats/hitting", "available", people),
      lineage("home-hitting", "/home/lineup/slots/0/stats/hitting", "available", people),
      lineage("away-pitching", "/away/startingPitcher/stats/pitching", "available", people),
      lineage("home-pitching", "/home/startingPitcher/stats/pitching", "available", people),
      lineage("away-manager", "/away/manager", "not-requested", coaches, { coverage: "exact" }),
      lineage("home-manager", "/home/manager", "not-requested", coaches, { coverage: "exact" })
    ]
  };

  mutate?.(model, { schedule, roster, people, standings, coaches, awayBatter, homeBatter, awayStarter, homeStarter });
  return model;
}

const scenarios = {
  "v030-ordinary-pregame.json": makeScenario("ordinary-pregame", "800001"),

  "v030-missing-lineup.json": makeScenario("missing-lineup", "800002", (model, refs) => {
    model.away.lineup = { state: "notPosted", slots: [] };
    model.home.lineup = { state: "notPosted", slots: [] };
    model.meta.lineage = model.meta.lineage.filter((entry) => !entry.id.endsWith("-hitting"));
    model.meta.lineage.push(
      lineage("away-lineup-unposted", "/away/lineup", "unposted", refs.schedule, { coverage: "exact", reason: "Schedule succeeded but did not publish an away lineup." }),
      lineage("home-lineup-unposted", "/home/lineup", "unposted", refs.schedule, { coverage: "exact", reason: "Schedule succeeded but did not publish a home lineup." })
    );
  }),

  "v030-two-way-roles.json": makeScenario("two-way-roles", "800003", (model, refs) => {
    const twoWay = person(660271, "Two-Way Contract Player", "17", ["TWP", "Two-Way Player", "Two-Way Player"], "L", "R");
    model.away.lineup.slots[0] = slot(2, clone(twoWay), ["DH", "Designated Hitter", 10], { hitting: hitting() });
    model.away.startingPitcher = role(clone(twoWay), ["P", "Pitcher", 1, "SP"], { pitching: pitching() });
    model.meta.lineage = model.meta.lineage.filter((entry) => !entry.id.startsWith("lineage.away-hitting") && !entry.id.startsWith("lineage.away-pitching"));
    model.meta.lineage.push(
      lineage("two-way-hitting", "/away/lineup/slots/0/stats/hitting", "available", refs.people, { reason: "Same identity retained in a hitting role." }),
      lineage("two-way-pitching", "/away/startingPitcher/stats/pitching", "available", refs.people, { reason: "Same identity retained in a pitching role." })
    );
  }),

  "v030-manager-ambiguity.json": makeScenario("manager-ambiguity", "800004", (model, refs) => {
    const coaches = source(model.context, "coaches.away", "coaches", "date");
    model.meta.sourceResults = model.meta.sourceResults.filter((entry) => entry.adapter !== "coaches");
    model.meta.sourceResults.push(coaches);
    model.away.manager = {
      state: "ambiguous",
      candidates: [
        { person: person(620001, "Acting Manager A", "12"), job: "Manager", title: "Manager", jobId: "MNGR" },
        { person: person(620002, "Acting Manager B", "26"), job: "Interim Manager", title: "Interim Manager", jobId: "INTM" }
      ],
      selected: null
    };
    model.meta.lineage = model.meta.lineage.filter((entry) => !entry.id.includes("manager"));
    model.meta.lineage.push(
      lineage("away-manager-ambiguous", "/away/manager", "ambiguous", coaches, { coverage: "exact", reason: "Multiple manager-like candidates; no safe selection." }),
      lineage("home-manager-not-requested", "/home/manager", "not-requested", coaches, { coverage: "exact" })
    );
  }),

  "v030-variable-officials.json": makeScenario("variable-officials", "800005", (model) => {
    const feed = source(model.context, "feed.officials", "feed");
    model.meta.sourceResults.push(feed);
    model.game.umpires.crew = [
      { id: 700001, name: "Home Plate Official", role: "Home Plate" },
      { id: 700002, name: "First Base Official", role: "First Base" },
      { id: 700003, name: "Second Base Official", role: "Second Base" },
      { id: 700004, name: "Third Base Official", role: "Third Base" },
      { id: 700005, name: "Left Field Official", role: "Left Field" },
      { id: 700006, name: "Replay Official", role: "Replay Official" }
    ];
    model.meta.lineage.push(lineage("officials-variable", "/game/umpires/crew", "available", feed, { coverage: "exact", reason: "Preserve every returned official and source role without forcing a four-slot crew." }));
  }),

  "v030-milb-capability-absence.json": makeScenario("milb-capability-absence", "800006", (model, refs) => {
    model.context.sport = { id: 14, name: "Single-A" };
    model.away.team.sport = clone(model.context.sport);
    model.home.team.sport = clone(model.context.sport);
    const depth = source(model.context, "depth.away-omitted", "depthChart", "current");
    model.meta.sourceResults.push(depth);
    model.away.additionalStarters = [];
    model.meta.lineage = model.meta.lineage.filter((entry) => entry.target !== "/away/bullpen");
    model.meta.lineage.push(
      lineage("milb-depth-omitted", "/away/additionalStarters", "omitted", depth, { coverage: "exact", reason: "Successful sampled Single-A depth-chart response omitted roster annotations." }),
      lineage("milb-bullpen-fallback", "/away/bullpen", "available", refs.roster, { coverage: "exact", fallbackUsed: true, reason: "Roster pitchers minus selected starter remains authoritative when role annotations are absent.", transformations: ["exclude-selected-starter"] })
    );
  }),

  "v030-scoped-competition-stats.json": makeScenario("scoped-competition-stats", "800007", (model) => {
    model.context.gameType = "S";
    model.context.competitionSegment = "spring";
    for (const side of [model.away, model.home]) {
      side.lineup.slots[0].stats.hitting = hitting(["S"]);
      side.startingPitcher.stats.pitching = pitching(["S"]);
    }
    model.standings.groups[0].standingsType = "springTraining";
    model.standings.groups[0].key = "springTraining:1:104:205";
  })
};

await mkdir(fixtureDir, { recursive: true });
for (const [name, value] of Object.entries(scenarios)) {
  await writeFile(path.join(fixtureDir, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
console.log(`Wrote ${Object.keys(scenarios).length} Build 003.4 scenario fixtures.`);
