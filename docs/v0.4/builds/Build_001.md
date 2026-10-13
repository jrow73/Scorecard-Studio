# Scorecard Studio v0.4.0 — Build 001

## Build 001.1 — Product-Surface and Field-Exposure Baseline

**Status:** Complete  
**Date:** 2026-10-08  
**Target identity:** `0.4.0-dev • Build 001.1`  
**Baseline:** accepted Scorecard Studio v0.3.0 Build 005.4 package

### Objective

Establish a build-ready v0.4 product contract before changing application code. Reconcile the intended responsibilities of Home, Game Day, Settings, Layout Designer, and the development-era Field Diagnostic; record the current field-exposure and representative-data baseline; and define competition-aware favorite-team and game-selection behavior for MLB and supported MiLB levels.

### Files changed

- `docs/v0.4/builds/Build_001.md`
- `docs/v0.4/V040_PRODUCT_SURFACE_CONTRACT.md`
- `docs/v0.4/V040_FIELD_EXPOSURE_AUDIT.md`
- `docs/v0.4/V040_GAME_SELECTION_SCOPE.md`

No application source, storage schema, normalized contract, saved-layout format, PDF behavior, test fixture, or `README.md` changed.

### Accepted product decisions

1. Home is a game-readiness and launch surface, not a statistics or research dashboard.
2. Game Day is the detailed pregame research companion for information that cannot fit on a printed scorecard.
3. Favorite Team is competition-aware application configuration and belongs in Settings.
4. The normal Field Diagnostic view may be retired after its useful coverage checks are replaced by automated regression evidence.
5. Layout Designer remains selective and print-oriented; it must not be expected to expose every internal normalized value.
6. MLB, Triple-A, Double-A, High-A, and Single-A are the initially evidenced game-selection levels. Rookie-level support requires a bounded discovery pass before commitment.
7. Home must initialize from the saved favorite team's actual level/sport context and must never assume MLB merely because the application started.
8. Game Day must show known pitcher groups rather than inherit a Home preference that hides additional starters or labels every non-selected starter as a reliever.
9. Bullpen composition for a saved PDF layout must be stored per repeated block. A global Home preference must not silently alter generated PDF content.

### Baseline findings

- The runtime registry contains 223 resolvable definitions: 171 active catalog fields and 52 compatibility-only fields.
- All 171 active definitions have representative example metadata and resolve against the existing Designer sample.
- Four active fixed-role umpire definitions are deliberately excluded from Designer selection in favor of the variable Umpire Crew, leaving 167 currently Designer-eligible active fields.
- The representative Designer model remains schema v1. It does not exercise schema-v2 availability, lineage, staff, or the split between core bullpen and `additionalStarters`.
- Existing saved-layout bullpen fields intentionally resolve to the legacy union of core bullpen plus additional starters.
- The current Game Day view is a curated summary rather than the intended near-comprehensive research companion.
- Home currently performs full roster, People, standings, depth-chart, and doubleheader hydration after selection even though its intended readiness function can normally be satisfied from Schedule data.

### Build 001 decimal roadmap

#### Build 001.2 — Automated Coverage Replacement

- Convert the useful “resolve every active field” behavior into portable automated coverage tests and a generated development report.
- Preserve availability/source diagnostics as engineering evidence.
- Remove the Field Diagnostic from normal navigation only after equivalent automated coverage exists.

#### Build 001.3 — Settings Foundation

- Add an application Settings surface.
- Move Favorite Team out of Home.
- Store favorite level/sport and team identity together.
- Migrate existing v0.3 MLB favorite-team records without data loss.
- Establish extensible preferences for a future system/light/dark appearance choice and related global defaults.

#### Build 001.4 — Home Readiness and Schedule Browser

- Load today's favorite-team schedule in the saved competition context.
- Present Ready, Partial, Waiting, No Game, terminal-game, and Unavailable states.
- Add date and level selection for browsing other games.
- Group level results by returned league identity where unambiguous.
- Keep only compact matchup, time/status, optional probable `SP vs SP`, Game Day, and scorecard-generation actions.
- Remove development-era hero, favorite-team editor, venue/weather KPIs, full pitcher list, full lineup list, and additional-starter toggle from Home.

#### Build 001.5 — Game Day Research Companion

- Expand Game Day toward comprehensive user-facing registry coverage.
- Organize dense information into browsable team, lineup, pitching, bench, staff, officials, venue/weather, standings, and advanced sections.
- Show selected starter, additional starters, and core bullpen separately when classifications exist.
- When classification is unavailable, identify the collection honestly as other active pitchers with roles not classified.

#### Build 001.6 — Schema-v2 Representative Data and Catalog Reconciliation

- Replace or supplement the schema-v1 Designer sample with a validated schema-v2 representative snapshot.
- Cover source-supplied name variants, variable crews, staff, standings tokens, classified and fallback pitcher pools, collection capacity, and availability states.
- Decide explicitly which compatibility-only and currently unregistered normalized values belong in Designer, Game Day, both, or neither.

#### Build 001.7 — Designer Pitcher-Group Workflow

- Give each new Bullpen repeated block an explicit pitcher-group choice: core bullpen, core plus additional starters, or additional starters only.
- Preserve existing blocks with no stored choice as the historical combined projection.
- Make Designer preview, Test PDF, live PDF, templates, sorting, overflow, and conditional formatting honor the stored choice.

#### Build 001.8 — Cross-Surface Acceptance and Closure

- Verify favorite-team initialization at every supported level.
- Verify date/level browsing, doubleheaders, lineup publication transitions, missing probable starters, postponed/cancelled/final states, and no-game dates.
- Verify Game Day coverage and pitcher-role truthfulness.
- Verify old layouts remain unchanged and new pitcher-group layouts remain deterministic.
- Package the accepted v0.4 Build 001 implementation or record remaining carryovers.

### Build 001.1 acceptance

Build 001.1 is accepted when the three supporting contracts are internally consistent with the v0.3 runtime and the user-approved product direction, while making no runtime change. Those conditions are satisfied.

### Next action

Proceed to Build 001.2. Do not remove the Field Diagnostic UI until the automated replacement proves active-field coverage, representative resolution, and source/availability reporting without relying on that page.

---

## Build 001.2 — Automated Coverage Replacement

**Status:** Complete  
**Date:** 2026-10-08  
**Target identity:** `0.4.0-dev • Build 001.2`  
**Baseline:** accepted Scorecard Studio v0.3.0 Build 005.4 package plus Build 001.1 documentation

### Objective

Replace the useful mechanical checks from the development-era Field Diagnostic with portable, reproducible engineering evidence. Do not remove or alter the visible diagnostic page until the automated replacement has passed and the later product-surface change is made deliberately.

### Files changed

- `docs/v0.4/builds/Build_001.md`
- `docs/v0.4/V040_FIELD_EXPOSURE_AUDIT.md`
- `docs/v0.4/V040_FIELD_COVERAGE_REPORT.md`
- `tests/v040-field-coverage.test.mjs`
- `tools/generate-v040-field-coverage-report.mjs`

No application source, UI navigation, storage schema, normalized contract, saved-layout format, PDF behavior, representative fixture, or `README.md` changed.

### Automated coverage added

The portable audit locates either a normal application root or the accepted release tree used in the development workspace. It then verifies:

1. the accepted 223-definition registry baseline and its active, compatibility, tier, and Designer-eligibility counts;
2. unique field IDs and required active-field metadata;
3. active and compatibility resolution against the committed representative model;
4. every representative row in all seven repeated collections, rather than slot 1 only;
5. every supported player-name format for every active player-name definition;
6. active-field capability, source, and availability declarations;
7. the four intentional fixed-role umpire exceptions; and
8. safe `unsupported` handling for an unknown field.

The generated report is committed and tested byte-for-byte, so changes to the registry, fixture, or report cannot silently drift apart.

### Results

- 223 of 223 resolvable definitions passed representative resolution: 171 active and 52 compatibility-only.
- All representative rows passed: 9 away lineup, 9 home lineup, 6 away bench, 6 home bench, 14 away bullpen, 14 home bullpen, and 6 umpire crew rows.
- Duplicate IDs, active metadata gaps, active capability gaps, active source-declaration gaps, repeated-row failures, and player-name formatting failures are all zero.
- The generated report records the active catalog by category and the current `gamePack`, `standings`, and `coaches` source declarations.
- The schema-v1 representative-data limitation, curated Game Day limitation, and missing per-field surface disposition remain explicit carryovers rather than false passes.

### Build 001.2 acceptance

Build 001.2 is accepted when the coverage test and generated-report check pass against the accepted v0.3 release tree without changing runtime behavior. Those conditions are satisfied.

### Next action

Proceed to Build 001.3, the Settings foundation. The Field Diagnostic remains visible in this increment; its later removal is now protected by the automated replacement created here.

---

## Build 001.3 — Settings Foundation

**Status:** Complete  
**Date:** 2026-10-08  
**Runtime identity:** `0.4.0-dev • Build 001.3`  
**Baseline:** accepted v0.3.0 Build 005.4 runtime plus Builds 001.1–001.2 documentation and coverage evidence

### Objective

Create the application Settings surface, move Favorite Team editing out of Home, make favorite identity competition-aware, migrate existing v0.3 MLB favorites without loss, and establish a versioned preference record for later global settings.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/api.js`
- `js/v040-settings.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `docs/v0.4/builds/Build_001.md`

`README.md`, the normalized schema, compatibility registry, saved-layout/PDF formats, Designer behavior, and Field Diagnostic behavior did not change.

### Implemented behavior

1. Settings is an enabled normal navigation destination.
2. Favorite Team editing now exists only in Settings; Home links to Settings when setup is required.
3. The user chooses one of the five evidenced competition levels before choosing a team:
   - MLB (`sportId: 1`)
   - Triple-A (`sportId: 11`)
   - Double-A (`sportId: 12`)
   - High-A (`sportId: 13`)
   - Single-A (`sportId: 14`)
4. Team options are fetched for the selected sport and current season, alphabetized, and retain returned league identity when present.
5. The authoritative `favoriteCompetition` record stores level key, sport ID, team ID/name, and optional league ID/name.
6. Existing valid `favoriteTeam` records migrate to MLB context without clearing or changing the selected team. The legacy record is left intact for non-destructive compatibility.
7. If a saved team is missing from, or cannot be validated against, the current team list, its stored identity is retained and the limitation is reported instead of silently selecting another team.
8. A fresh installation with no saved favorite no longer fabricates Seattle or any other team; Home presents a Settings route.
9. Favorite-team Schedule requests now pass the saved sport ID instead of relying on the API layer's MLB default.
10. A versioned `appPreferencesV1` record establishes `appearance: system` as the current behavior while reserving validated `system`, `light`, and `dark` values for a later theming build. Build 001.3 does not claim to implement theme switching.

### Verification

- Six focused Settings tests cover supported levels, lossless migration, current-setting precedence, fresh-install behavior, sport-scoped team discovery, league identity, UI ownership, schedule scoping, and runtime identity.
- The 123 accepted v0.3 contract checks continue to pass after updating the release-identity assertion for the v0.4 development label.
- Browser smoke testing confirmed the Settings route, migrated MLB favorite, level-first workflow, and live Double-A team discovery.
- The protected `README.md` remains unchanged.

### Deferred to Build 001.4

Home still uses the inherited detailed pregame hydration and presentation after a favorite exists. Build 001.4 owns the Schedule-only readiness flow, date/level game browser, compact matchup card, and removal of Home's remaining development-era content.

### Build 001.3 acceptance

Build 001.3 is accepted when a v0.3 favorite migrates without reselection, a favorite at every evidenced level can be stored with sport context, Home uses that context, no-favorite startup is honest, and Settings is the sole favorite editor. Those conditions are satisfied.

### Next action

Proceed to Build 001.4, Home Readiness and Schedule Browser.

---

## Build 001.4 — Home Readiness and Schedule Browser

**Status:** Complete  
**Date:** 2026-10-08  
**Runtime identity:** `0.4.0-dev • Build 001.4`  
**Baseline:** accepted v0.3.0 Build 005.4 runtime plus Builds 001.1–001.3

### Objective

Replace Home's inherited development-era pregame display with a fast, Schedule-only game browser. Home answers whether the favorite team's selected game is ready, supports date-and-level discovery across the five evidenced competition levels, and defers full research hydration until the user opens Game Day or generates a scorecard.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/api.js`
- `js/v040-home.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `docs/v0.4/builds/Build_001.md`

`README.md`, the normalized schema, compatibility registry, saved-layout format, and PDF format did not change.

### Implemented behavior

1. Initial Home loading now makes a Schedule request for the saved favorite team's competition context and date; it does not hydrate rosters, People statistics, coaches, standings, depth charts, Game Feed, or boxscore data.
2. A user without a favorite receives an honest setup prompt but can still browse games by date and level.
3. The game browser supports MLB, Triple-A, Double-A, High-A, and Single-A using explicit sport IDs.
4. Returned games are grouped by their unambiguous same-league identity. Cross-league or incomplete-league records remain in a neutral `Other / Cross-league` group rather than being guessed into a league.
5. Readiness distinguishes complete lineups, partial lineups, lineups not yet posted, final games, and postponed/cancelled/suspended terminal states.
6. The selected-game summary is deliberately compact: matchup, game status, scheduled first pitch, and independently reported probable starters. A missing probable starter remains `TBD` and is never inferred from the roster.
7. Home no longer displays detailed lineups, benches, bullpens, pitching statistics, venue/weather research, or other development-era diagnostic content.
8. Opening Game Day retains the existing full hydration path. Generating a scorecard hydrates only when requested and warns that incomplete posted lineups may produce blank lineup fields.
9. The Settings team-list request is deferred until Settings is opened, preserving the Schedule-only initial Home boundary.
10. Existing bullpen/additional-starter preference data remains compatible but is no longer presented as a Home-page concern.

### Verification

- 138 automated checks pass, including five new Home tests for readiness states, league grouping, probable-starter independence, sport-scoped schedule discovery, and the Schedule-only hydration boundary.
- The generated v0.4 field-coverage report remains current.
- Browser smoke testing confirmed the `0.4.0-dev • Build 001.4` identity, compact Home game browser, five level choices, no-favorite setup state, and absence of the removed detailed pregame sections.
- The protected `README.md` hash remains unchanged from the accepted baseline.

### Deferred to Build 001.5

Game Day still reflects the inherited curated research presentation. Build 001.5 owns its conversion into the comprehensive scorecard-companion view and the retirement of the old Field Diagnostic surface once equivalent registry visibility is available there.

### Build 001.4 acceptance

Build 001.4 is accepted when Home is Schedule-only, favorite and date/level discovery are competition-aware, readiness and terminal states remain distinct, league grouping is conservative, probable starters are independently truthful, and Game Day/PDF hydration still occurs on demand. Those conditions are satisfied.

### Next action

Proceed to Build 001.5, comprehensive Game Day and Field Diagnostic retirement.

---

## Build 001.5 — Game Day Research Companion

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 001.5`  
**Baseline:** accepted v0.3.0 Build 005.4 runtime plus Builds 001.1–001.4

### Objective

Turn Game Day into the detailed pregame research companion, make pitcher-role presentation truthful and independent of the retired Home preference, and remove the development-era Field Diagnostic product route after confirming its automated replacement remains authoritative.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/v040-gameday.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `tests/v040-gameday-research.test.mjs`
- `tools/generate-v040-field-coverage-report.mjs`
- `docs/v0.4/V040_FIELD_COVERAGE_REPORT.md`
- `docs/v0.4/builds/Build_001.md`

`README.md`, the normalized schema, compatibility registry, saved-layout format, Designer behavior, and PDF behavior did not change.

### Implemented behavior

1. Game Day is organized as a browsable research companion with anchored sections for overview, teams, lineups, pitching, bench, staff, standings, game context, and source scope.
2. The overview reports matchup, raw game status, official date, scheduled first pitch, day/night state, game number, competition, and game type.
3. Team cards expose full records, percentage, games played, selected team game number, abbreviation, league, division, division/league/wild-card ranks, games back, streak, and last-ten record.
4. Lineup tables expose batting order, identity, position, handedness, games, plate appearances, AVG, OBP, SLG, OPS, home runs, RBI, and stolen bases for every posted slot.
5. Pitching is always divided into selected starter, additional SP-annotated active-roster pitchers, and the remaining pitcher pool. The global legacy display preference cannot hide a Game Day group.
6. When the depth-chart annotation is usable, the remaining pool is labeled `Core Bullpen`. When it is unavailable, Game Day labels the authoritative roster-minus-starter fallback `Other Active Pitchers — Roles Not Classified` and does not infer reliever roles.
7. Bench rows include complete available registry batting totals rather than the former short summary.
8. Managers and the full returned dated coaching staff are displayed. Ambiguous manager results remain visible as candidates rather than silently choosing the first record.
9. Every source-returned standings group is shown with rank, record, percentage, games back, streak, and last-ten values. Missing group labels use the matching selected team's normalized league/division identity when available.
10. Variable officials, venue location/time zone/field information, weather, source outcomes, source-effective dates, and snapshot competition scope are visible.
11. Advanced matchup history, batter-versus-pitcher data, splits, and recent-form research are explicitly identified as unavailable rather than fabricated.
12. Field Diagnostic has been removed from navigation, routing, markup, and application bootstrap. Its pure historical helper remains non-product code for older regression evidence; the generated v0.4 coverage report and automated tests are the authoritative replacement.

### Verification

- 143 automated checks pass, including five new Game Day tests for classified and fallback pitcher groups, ambiguous managers, source freshness, research scope, section coverage, and diagnostic-route retirement.
- The generated field-coverage report is current and records the Field Diagnostic route as retired.
- HTML validation found 314 unique element IDs and no duplicates.
- A live browser smoke test loaded the July 3, 2025 Minnesota–Miami game and confirmed schema-v2 hydration, both posted lineups, selected starters, additional starters, core bullpens, benches, dated managers/coaches, all returned standings groups, officials, venue detail, and source cutoff labels.
- The protected `README.md` retains SHA-256 `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Deferred to Build 001.6

The Designer's representative model remains schema v1, and per-field product-surface disposition is not yet encoded. Build 001.6 owns a validated schema-v2 representative snapshot plus explicit reconciliation of active, compatibility-only, and currently unregistered normalized values across Designer and Game Day.

### Build 001.5 acceptance

Build 001.5 is accepted when Game Day provides the intended dense companion view, pitcher roles remain honest under both classified and fallback states, staff and source freshness are visible, the legacy Home preference cannot suppress pitcher groups, and Field Diagnostic can be removed without losing reproducible coverage evidence. Those conditions are satisfied.

### Next action

Proceed to Build 001.6, Schema-v2 Representative Data and Catalog Reconciliation.

---

## Build 001.6 — Schema-v2 Representative Data and Catalog Reconciliation

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 001.6`  
**Baseline:** accepted v0.3.0 Build 005.4 runtime plus Builds 001.1–001.5

### Objective

Make schema v2 the authoritative Designer/Test PDF representative model, preserve schema-v1 compatibility evidence, and explicitly decide the product-surface disposition of every resolvable field and meaningful unregistered normalized family.

### Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `js/sample-data.js`
- `js/v040-field-surfaces.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `tests/v040-field-coverage.test.mjs`
- `tests/v040-schema-v2-representative.test.mjs`
- `tools/generate-v040-field-coverage-report.mjs`
- `docs/v0.4/V040_FIELD_COVERAGE_REPORT.md`
- `docs/v0.4/V040_FIELD_EXPOSURE_AUDIT.md`
- `docs/v0.4/builds/Build_001.md`

`README.md`, the normalized schema, saved-layout format, PDF format, and live normalization behavior did not change.

### Implemented behavior

1. Designer and Generate Test PDF now use a contract-valid schema-v2 representative snapshot.
2. The former schema-v1 representative is retained as the explicitly named `LEGACY_DESIGNER_SAMPLE_MODEL` compatibility fixture.
3. Representative data exercises posted nine-player lineups, six-player benches, variable officials, complete name variants, managers and categorized coaches, typed standings tokens, source results, and lineage.
4. The away side exercises usable SP depth annotations: three additional starters plus eleven core bullpen pitchers. The home side exercises failed depth classification and the authoritative fourteen-pitcher roster-minus-starter fallback.
5. All 223 resolvable definitions remain structurally valid against schema v2. All active fields and every representative row resolve, and every supported player-name format produces output.
6. Every registry definition now has an executable disposition across Home, Game Day, Designer, saved/legacy layouts, and internal use.
7. Home owns no hydrated registry fields because it is intentionally Schedule-only. Game Day owns all 171 active fields. Designer owns 167, excluding the four fixed-role umpire aliases. Saved layouts retain all 223.
8. The 52 compatibility-only fields remain legacy-only. They are not promoted merely because the comprehensive sample can resolve them.
9. Ten meaningful unregistered schema-v2 families have explicit dispositions, including status/date variants, competition context, venue detail, identity keys, standings groups, staff ambiguity, name variants, pitcher groups, provenance, and logos.
10. Existing bullpen blocks retain the historical combined projection. Per-block pitcher-group mode remains isolated to Build 001.7.

### Verification

- The schema-v2 representative passes `validateNormalizedSnapshot` with no errors.
- The generated field-coverage report passes with 223 unique field decisions, 171 Game Day fields, 167 Designer fields, 223 saved-layout fields, and ten reconciled unregistered families.
- All 149 current regression checks pass after the Build 001.6 identity and cache revision update.
- The protected `README.md` remains unchanged.

### Deferred to Build 001.7

Build 001.7 owns the visible per-block pitcher-group selection and its saved-layout, preview, Test PDF, live PDF, sorting, overflow, and conditional-formatting semantics.

### Build 001.6 acceptance

Build 001.6 is accepted when schema v2 drives representative rendering, schema v1 remains deliberate compatibility evidence, classified and fallback pitcher pools are tested, every active/compatibility definition retains its intended behavior, and every normalized family has an explicit product disposition. Those conditions are satisfied.

### Next action

Proceed to Build 001.7, Designer Pitcher-Group Workflow.

---

## Build 001.7 — Designer Pitcher-Group Workflow

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 001.7`  
**Baseline:** accepted v0.3.0 Build 005.4 runtime plus Builds 001.1–001.6

### Objective

Give each bullpen repeated block a deterministic, saved choice among Core Bullpen, Combined Pitchers, and Additional Starting Pitchers while preserving every existing layout's historical combined output.

### Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `js/field-registry.js`
- `js/slot-content.js`
- `js/v030-compatibility-resolver.js`
- `js/v040-field-surfaces.js`
- `js/v040-pitcher-groups.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-designer-pitcher-groups.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `tools/generate-v040-field-coverage-report.mjs`
- `docs/v0.4/V040_FIELD_COVERAGE_REPORT.md`
- `docs/v0.4/V040_FIELD_EXPOSURE_AUDIT.md`
- `docs/v0.4/V040_PRODUCT_SURFACE_CONTRACT.md`
- `docs/v0.4/builds/Build_001.md`

`README.md`, normalized snapshot production, application settings, Home, Game Day, PDF templates, scalar mappings, and individual mappings did not change.

### Implemented behavior

1. New away/home bullpen repeated blocks display a required per-block Pitcher Group selector.
2. New blocks default to Core Bullpen and persist `pitcherGroup: "core"` in layout schema version 8.
3. The available choices are:
   - Core Bullpen — normalized `bullpen` only;
   - Combined Pitchers — a stable person-ID-deduplicated `bullpen + additionalStarters` union; and
   - Additional Starting Pitchers — normalized `additionalStarters` only.
4. Existing blocks with no `pitcherGroup` property resolve as Combined Pitchers and remain unmodified during compatibility load.
5. Opening an old block explains the compatibility behavior. Choosing a value explicitly upgrades only that block through the normal Designer save path.
6. On a classified team, Core and Additional are distinct. When classification is unavailable, Core remains the authoritative roster-minus-starter fallback and Additional is honestly empty/omitted.
7. Designer preview, Text Templates, Test PDF, and live PDF use the same selected rows.
8. Sorting operates inside the selected group. Overflow warnings count only selected-group rows.
9. Conditional formatting resolves handedness from the same selected source row used for displayed content.
10. Block lists, selectors, messages, and overflow notices identify the selected pitcher group.
11. The setting belongs exclusively to the repeated layout block; no Home, Game Day, or global preference can alter generated membership.
12. The eight detailed compatibility-only bullpen statistics remain available to saved layouts but are not silently promoted into the new-field catalog.

### Verification

- All 154 current regression checks pass.
- Focused tests verify classified 11/3/14 row sets, fallback 14/0 behavior, missing-mode compatibility, non-mutating layout loads, explicit persistence, selector-aware field resolution, and all repeated rendering paths.
- The generated field-coverage report remains current with all 223 saved-layout definitions resolving.
- Browser smoke testing confirmed the `0.4.0-dev • Build 001.7` application and Layouts surface load with the new dependency/cache chain.
- The protected `README.md` retains SHA-256 `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Deferred to Build 001.8

Build 001.8 owns cross-surface acceptance and closure: supported levels, game-state transitions, old-layout equivalence, new pitcher-group determinism, and final Build 001 packaging/carryover review.

### Build 001.7 acceptance

Build 001.7 is accepted when each new bullpen block owns an explicit group, old blocks remain Combined Pitchers without load-time writes, classified and fallback data stay truthful, and every preview/PDF/formatting path uses the identical row selection. Those conditions are satisfied.

### Next action

Proceed to Build 001.8, Cross-Surface Acceptance and Closure.

---

## Build 001.8 — Cross-Surface Acceptance and Closure

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 001.8`  
**Baseline:** accepted v0.3.0 Build 005.4 runtime plus Builds 001.1–001.7

### Objective

Close v0.4 Build 001 with one consolidated, reproducible acceptance gate spanning supported competition levels, Schedule-first selection/readiness, Game Day research truthfulness, schema-v2 representative coverage, old-layout equivalence, and all three per-block pitcher-group modes.

### Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `tests/v040-build001-acceptance.test.mjs`
- `docs/v0.4/builds/V040_BUILD001_ACCEPTANCE.md`
- `docs/v0.4/builds/Build_001.md`

`README.md`, normalization, source selection, storage, saved-layout semantics, field mappings, product behavior, and PDF rendering did not change.

### Closure findings

1. All five supported levels preserve competition-aware favorite-team identity and issue correctly scoped Schedule requests.
2. Empty dates remain empty; same-date doubleheaders retain both game identities and deterministic ordering.
3. Waiting, Partial, Ready, Final, Postponed, Cancelled, and Suspended states remain truthful.
4. Probable starters are optional and independently render as `TBD`; they never determine lineup readiness.
5. Home remains Schedule-first, while Game Day retains the comprehensive research role established in Build 001.5.
6. Classified pitcher data produces separate selected-starter, additional-starter, and core-bullpen groups. Missing classification preserves the authoritative roster-minus-starter fallback without claiming reliever roles.
7. Schema-v2 representative data and all 223 field-disposition decisions remain current.
8. New bullpen blocks deterministically support Core, Combined, and Additional modes across every rendering path.
9. Historical blocks with no mode remain Combined and are not modified during compatibility load.
10. The closure gate exposed no application defect; Build 001.8 therefore changes runtime identity and acceptance evidence only.

### Verification

- 160 current regression checks pass, including 6 consolidated Build 001 acceptance checks.
- The generated v0.4 field-coverage report is current.
- Browser smoke testing confirmed the Build 001.8 identity and successful loading of Home, Game Day, and the Layout Library/Designer entry.
- The protected `README.md` retains SHA-256 `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Carryovers

- Rookie-level support remains behind the documented discovery gate.
- College baseball and Korean professional baseball remain separate provider investigations.
- Advanced matchup history, batter-versus-pitcher data, splits, and recent-form research remain unavailable until authoritative sources are adopted.
- Broader appearance and global-preference work may extend Settings in a later build.

### Build 001.8 acceptance

Build 001.8 is accepted when the cross-surface matrix passes, browser entry points load under the closure identity, legacy layouts remain unchanged, new pitcher-group output is deterministic, and remaining work is explicitly carried forward rather than hidden. Those conditions are satisfied.

### Next action

Build 001 is complete. Scope v0.4 Build 002 from the recorded carryovers and the next user-prioritized product goal.
