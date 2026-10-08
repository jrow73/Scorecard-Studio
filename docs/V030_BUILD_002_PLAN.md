# Scorecard Studio v0.3.0 — Build 002 API Discovery Plan

**Plan source:** Build 001 closure  
**Prepared:** 2026-10-05  
**Starting application baseline:** committed Scorecard Studio v0.2.0  
**Backlog authority:** `docs/V030_API_DISCOVERY_BACKLOG.md`  
**Status:** Complete as of Build 002.7; closure authority is `docs/V030_BUILD_002_CLOSURE.md`

## 1. Build objective

Build 002 will actively test the unresolved API and asset questions identified by Build 001 and produce reproducible evidence for source-adoption decisions.

The build is successful when Scorecard Studio can distinguish:

- verified source behavior;
- conditional/timing-dependent behavior;
- competition- or level-specific behavior;
- reliable fallbacks;
- unsupported or historically unsafe data; and
- product ideas that should remain deferred.

Build 002 is discovery, not adapter implementation. Its final output is an evidence-backed source disposition that a later model-design build can consume.

## 2. Guardrails

1. **Do not modify production application behavior during evidence collection.** No changes to `api.js`, `normalize.js`, `field-registry.js`, UI, storage, or README unless separately authorized after a documented discovery decision.
2. **Preserve the v0.2.0 source model as the control.** A candidate source does not replace an accepted fallback after one successful response.
3. **Capture exact evidence.** Record endpoint, parameters, timestamp, game state, identifiers, relevant payload, interpretation, and limitations.
4. **Minimize fixtures.** Retain only the payload portions necessary to reproduce a finding, while preserving surrounding descriptors needed to interpret scope.
5. **Do not infer absence.** Distinguish not requested, request failed, unsupported, not yet posted, present-empty, and omitted.
6. **Avoid broad polling and fan-out.** Use deliberate snapshots and representative samples. Live timing studies should have a documented cadence and stop condition.
7. **Carry sport/league/game-type context.** Do not add new MLB-only assumptions to discovery tooling.
8. **Keep provenance explicit.** Findings must state effective date/cutoff and whether evidence is current, historical, or a recorded live snapshot.
9. **Do not commit secrets or session data.** The MLB endpoints under study are public; capture tooling must not introduce credentials.
10. **Keep rare cases non-blocking.** A real doubleheader transition or neutral-site event may be completed opportunistically after the corresponding planned increment.

## 3. Evidence artifacts

Build 002 should establish these artifacts before broad probing:

| Artifact | Purpose |
|---|---|
| `docs/Build_002.md` | Cumulative build/increment record |
| `docs/V030_API_EVIDENCE_MANIFEST.md` | Human-readable fixture and capture index |
| `docs/V030_API_FINDINGS.md` | Cross-endpoint findings and final dispositions |
| `tests/fixtures/api-discovery/` or an equivalently documented fixture location | Minimized machine-readable evidence when necessary |
| A small capture/compare utility, if needed | Repeatable requests and focused diffs; investigation-only, not application runtime code |

Every evidence record should include the schema defined in `V030_API_DISCOVERY_BACKLOG.md`: investigation ID, UTC retrieval time, identifiers, game state, exact request, response status/metadata, relevant payload, comparison, interpretation, limitations, and recommended disposition.

Large raw responses should not be retained automatically. Prefer focused JSON fixtures with an adjacent manifest entry explaining what was removed.

## 4. Increment plan

### Build 002.1 — Evidence Harness and Fixture Manifest

**Purpose:** Make all later probing repeatable and reviewable.

**Work**

- Define the machine-readable evidence-record schema.
- Create the fixture manifest and naming convention.
- Build or document a focused capture method that records exact URLs/parameters, UTC time, HTTP result, and selected payload paths.
- Define comparison output for repeated snapshots of the same game.
- Register existing controls: `822955`, `777447`, `777458`, and the named player-stat cases.
- Identify initial MLB, MiLB, spring, postseason, exceptional-state, and asset fixtures without yet claiming findings.

**Acceptance criteria**

- One ordinary read-only request can be captured and reproduced without touching application code.
- A second capture can be compared deterministically.
- Evidence records distinguish live snapshot, current historical response, and previously recorded evidence.
- Fixture storage is bounded, documented, and free of credentials.

**Expected package:** evidence schema/manifest, capture tooling if necessary, focused test of the tooling, and documentation.

### Build 002.2 — Schedule, Feed Timing, and Game States

**Backlog coverage:** DISC-001, DISC-002; preparation for DISC-013 and DISC-016.

**Work**

- Capture an ordinary future MLB game at selected pregame milestones.
- Compare Schedule lineup/probable/status/venue/weather changes across time.
- Record when feed officials first appear and whether crew composition changes.
- Test historical postponed, makeup, suspended/resumed, delayed, cancelled, and TBD cases where fixtures can be identified.
- Record postseason crew-role shapes when available.

**Acceptance criteria**

- Schedule status vocabulary used by the tested cases is cataloged.
- Lineup/probable/umpire absence can be classified as not posted versus unsupported where evidence permits.
- Feed timing limitations are explicit; no single fixture is generalized without scope.
- Candidate refresh/freshness rules are documented, not implemented.

**Non-blocking carryover:** A real doubleheader transition remains open until a suitable event occurs.

### Build 002.3 — Rosters, People Statistics, and Coaches

**Backlog coverage:** DISC-004, DISC-005, DISC-007; opportunistic DISC-014 and DISC-015.

**Work**

- Test dated roster membership against transaction, injury/inactive, trade, historical, and MiLB cases.
- Determine two-way-player and pitcher-position behavior.
- Revalidate People `All` split controls and extend to Opening Day, spring, postseason, multi-level, and no-prior-stat cases.
- Compare hitting and pitching split descriptors.
- Capture complete coaches role metadata for current and historical/staff-change cases.
- Determine whether manager ambiguity and categorized coach collections can be modeled safely.

**Acceptance criteria**

- Dated roster meaning and known historical limitations are stated.
- Stat scope is described with sport/game/stat-type evidence rather than the word “season” alone.
- Aggregate split selection has a documented fallback or failure policy.
- Manager/coach role mapping has explicit ambiguity rules.
- Existing roster-minus-lineup/starter fallbacks remain unless stronger evidence supports change.

### Build 002.4 — Standings, Venues, and Timezones

**Backlog coverage:** DISC-003, DISC-006, DISC-010; opportunistic DISC-016.

**Work**

- Compare Schedule and feed venue payloads across representative venue types.
- Establish timezone, location, capacity, surface, roof, and optional dimension completeness.
- Test shallow versus deep merge consequences with actual payloads.
- Capture Standings across Opening Day, early season, leader/tie, Wild Card, clinched/eliminated, postseason, and MiLB cases.
- Identify exact semantics for division/league/Wild Card rank and games-back values.
- Attempt full standings-group normalization from already-fetched responses without new fan-out.

**Acceptance criteria**

- Feed necessity for each accepted venue field is known.
- Timezone identifiers and historical limits are documented.
- Games-back/rank source values have a proposed typed representation.
- Full standings groups receive an adopt/defer decision.
- League-wide intraday reconstruction remains rejected unless a direct authoritative response is demonstrated.

### Build 002.5 — Depth Charts and Team Logos

**Backlog coverage:** DISC-008, DISC-009.

**Work**

- Compare depth charts with dated rosters, probable pitchers, and actual recent roles.
- Test MLB/MiLB, historical-date limitations, openers, two-way players, injuries, and missing roles.
- Determine whether depth charts may annotate roles or safely affect bullpen membership.
- Sample logo assets across current MLB, targeted MiLB levels, inactive/renamed/reaffiliated clubs, and special teams.
- Record asset MIME type, redirects, CORS, caching metadata, SVG structure, dimensions, transparency, and browser/PDF feasibility.

**Acceptance criteria**

- Depth chart receives one disposition: membership authority, annotation-only source, opportunistic hint, or reject.
- The roster-pitchers-minus-starter fallback remains defined.
- Logo coverage and current-brand/historical-brand limitations are quantified.
- Logo UI/PDF implementation remains outside Build 002.

### Build 002.6 — MiLB, Spring Training, and Postseason Coverage

**Backlog coverage:** DISC-011, DISC-012 plus cross-source confirmation.

**Work**

- Run the common source checklist at representative MiLB levels.
- Capture future/pregame and historical completed fixtures where possible.
- Compare lineup length, roster size, probable pitchers, stats, standings, coaches, officials, venues, depth chart, and logos.
- Test spring-training and postseason game types and stat/standings scopes.
- Record expanded postseason umpire roles.
- Identify every place where sport/league/game type must influence request construction or normalization.

**Acceptance criteria**

- A capability matrix states supported, conditional, absent, and untested families by level/competition.
- The plan does not claim universal MiLB support from one level.
- Regular-season, spring, and postseason stat scopes are not conflated.
- Required context keys for the future normalized model are explicit.

### Build 002.7 — Findings and Source-Adoption Decisions

**Purpose:** Close discovery without prematurely implementing it.

**Work**

- Reconcile every DISC record with captured evidence.
- Classify each investigated source/concept as:
  - adopt as authoritative;
  - adopt as optional annotation/enrichment;
  - retain current source/fallback;
  - model for future use but do not fetch yet;
  - defer; or
  - reject.
- Identify unresolved live/rare validations and state whether they block model design.
- Produce the source/cutoff/provenance requirements for the next normalized-model design build.
- Prioritize implementation work without changing production code in the closure package.

**Acceptance criteria**

- Every planned Build 002 investigation has evidence, an explicit limitation, and a disposition—or a documented reason it could not be tested.
- Conflicting sources have a recommended precedence rule.
- MiLB and competition-type support boundaries are explicit.
- The next build can design a versioned model without relying on stale Game-Pack-first assumptions.

## 5. Fixture strategy

### Controls

- gamePk `822955`: recorded pregame feed evidence only; current refetch is postgame and must not replace the recorded interpretation;
- gamePk `777447`: historical doubleheader Game 1 control;
- gamePk `777458`: historical doubleheader Game 2 control;
- Taylor Ward and Seranthony Domínguez: traded-player aggregate controls;
- Cal Raleigh: single-team aggregate control;
- Colt Emerson: MLB-debut boundary control.

### Required new categories

- multi-stage ordinary future MLB game;
- Opening Day;
- postponed/makeup and suspended/resumed games;
- spring-training game;
- postseason game with expanded crew;
- neutral-site/international game;
- roster transaction-date example;
- manager/staff change;
- two-way player;
- Wild Card leader/tie/clinched/eliminated cases;
- future and historical fixtures at each intended MiLB level;
- renamed/reaffiliated/inactive team IDs for asset checks.

Fixture IDs should be selected from evidence, not invented in the plan. The manifest must state why each fixture is useful and which DISC records it covers.

## 6. Timing-study guidance

For a selected live game, prefer a small milestone schedule rather than continuous polling:

- early day or first practical capture;
- after lineups/probables are expected;
- approximately one hour before scheduled start;
- shortly before first pitch;
- first live-state capture; and
- final/postgame capture.

Adjust cadence when the Schedule status changes, and stop when the relevant transition has been observed. Build 002.1 should formalize the exact cadence before any recurring monitor is considered. Manual/ad hoc evidence remains acceptable when timing cannot be automated safely.

## 7. Decision framework

Each final source disposition should be justified across:

| Dimension | Questions |
|---|---|
| Pregame availability | Is it present before first pitch, and at what stage? |
| Historical safety | Does a completed-game request preserve the intended pregame fact? |
| Scope correctness | Which sport, league, team, season, game type, and cutoff does it represent? |
| Completeness | Is absence meaningful and distinguishable from failure/not posted? |
| Stability | Is the field shape consistent across fixtures and levels? |
| Cost | How many requests and how much fan-out/payload are required? |
| Fallback | What accepted behavior remains when it is missing or unreliable? |
| Provenance | What metadata must accompany the normalized value? |
| Consumer value | Does it materially benefit scorecard generation or later Game Day? |

One fixture may demonstrate possibility; it does not demonstrate reliability. Adoption as authoritative requires evidence proportional to the source's impact.

## 8. Expected Build 002 closure output

Build 002 should end with:

- a reviewed evidence manifest;
- minimized reproducible fixtures where needed;
- endpoint/asset findings with scope and timing caveats;
- a capability matrix for MLB/MiLB and competition types;
- an authoritative/optional/fallback/deferred/rejected disposition table;
- a recommended source-precedence and provenance contract; and
- a bounded plan for the next normalized-model design build.

It should not end with opportunistic production changes made while evidence was still incomplete.
