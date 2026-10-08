# Scorecard Studio v0.3.0 — Build 003

**Build theme:** Versioned normalized-model design  
**Starting baseline:** committed Scorecard Studio v0.2.0  
**Build 002 authority:** `docs/V030_SOURCE_ADOPTION_DECISIONS.md`

## Build 003.1 — Versioned Model and Provenance Contract

**Status:** Complete  
**Date:** 2026-10-06  
**Scope:** Contract documentation, machine-readable schema, representative fixture, and contract tests; no production changes

### Objective

Define the schema version 2 contract that Build 003.2 adapters and later production implementation will target. Preserve readable normalized data paths while adding explicit competition context, source request outcomes, effective cutoffs, availability, and selected-value lineage.

### Planned outputs

- `docs/V030_BUILD_003_PLAN.md`
- `docs/V030_NORMALIZED_MODEL_V2.md`
- `schemas/v030-normalized-game.schema.json`
- `tests/fixtures/model-contract/v030-game2-mixed-cutoff.json`
- `tests/v030-model-contract.test.mjs`

No production application code, API evidence fixture, historical documentation, or `README.md` was changed.

### Files changed in this increment

- `docs/Build_003.md`
- `docs/V030_BUILD_003_PLAN.md`
- `docs/V030_NORMALIZED_MODEL_V2.md`
- `schemas/v030-normalized-game.schema.json`
- `tests/fixtures/model-contract/v030-game2-mixed-cutoff.json`
- `tests/v030-model-contract.test.mjs`

### Principal decisions

1. Schema version 2 is a deliberate compatibility boundary; `contractRevision` can advance independently for compatible refinements.
2. The normalized data roots remain readable as `game`, `away`, `home`, and `standings` rather than wrapping every scalar.
3. `meta.sourceResults[]` records adapter execution/outcome; `meta.lineage[]` records selected-value availability, source, cutoff, fallback, and transformations. These are different layers.
4. Lineage uses concrete RFC 6901 JSON Pointer targets. Exact records override the most-specific ancestor subtree record, allowing compact shared provenance plus mixed-source leaf overrides.
5. Competition context explicitly retains sport, game type, competition segment, season, selected/official dates, and a deterministic selected Schedule view key.
6. Canonical status preserves the complete raw status tuple and separate scheduled/original/rescheduled/resume dates.
7. Hitting and pitching statistics carry independent explicit sport/game-type/stat-type/date-range scopes.
8. Lineup publication state, manager ambiguity, variable officials, typed standings values, and source-faithful standings groups are structural model concepts.
9. `additionalStarters` and `bullpen` are distinct stored groups. Display may combine them without changing membership/provenance; missing depth annotations retain the roster-minus-starter fallback.
10. The overloaded schema-version-1 `gamePack` label is prohibited from source adapters and lineage.

### Verification

- The JSON Schema and representative fixture parse as JSON.
- The representative snapshot conforms to the supported machine-readable schema subset.
- Source-result and lineage IDs are unique and all references close.
- Available/partial targets resolve in the snapshot.
- Exact and longest-prefix lineage precedence resolves the intended Game 2 overrides.
- The fixture proves Game 1 postgame player/team values can coexist with prior-day standings and a current Game 2 lineup/state.
- Seven Build 003.1 contract subtests pass.
- The cumulative Build 002 evidence suite and unchanged v0.2.0 release regression suite pass.

### Carryover to Build 003.2

- Define each adapter's typed input, source-result envelope, candidate output, capability rules, deterministic request key, and freshness behavior.
- Define partial People-chunk handling and adapter-level error codes.
- Keep schema version 2 unchanged unless adapter-contract work exposes a genuinely incompatible model requirement.

---

## Build 003.2 — Adapter and Capability Contracts

**Status:** Complete  
**Date:** 2026-10-06  
**Scope:** Adapter declarations, capability routing, request-key/freshness/partial-failure contracts, and executable contract tests; no production changes

### Objective

Define typed, deterministic boundaries for every source adapter that can feed normalized schema version 2. Separate planning, execution outcomes, source candidates, normalization precedence, and selected-value lineage so consumers no longer use raw endpoint labels as field requirements.

### Files changed in this increment

- `docs/Build_003.md`
- `docs/V030_ADAPTER_CAPABILITY_CONTRACTS.md`
- `schemas/v030-adapter-registry.schema.json`
- `tests/fixtures/model-contract/v030-adapter-registry.json`
- `tests/v030-adapter-contract.test.mjs`

No production application code, API evidence fixture, normalized-model schema, historical documentation, or `README.md` was changed.

### Principal decisions

1. The adapter set is closed to Schedule, Feed, Boxscore, Roster, People, Coaches, Standings, Venue, Depth Chart, and Team Logo.
2. Each adapter declares every semantic input, a deterministic versioned request key, accepted source-owned candidates, capability rules, freshness triggers, independently retryable unit, and stable error codes.
3. Capability routing uses the most-specific matching rule and requires a final conservative `untested` default. Support is per source and context, never one global MiLB flag.
4. Adapter execution outcome and concept availability are separate. A successful response may still produce omitted, present-empty, unposted, ambiguous, or unsupported candidates.
5. Request keys materialize defaults and canonicalize set-like arrays, preventing semantically different requests from sharing a cache key.
6. Numeric TTLs are not invented. Schedule/Feed use game-state triggers; dated/scoped sources use semantic scope changes; only validated team logos use the observed 14-day HTTP cache duration.
7. People IDs are deduplicated, sorted, and partitioned into deterministic chunks. Successful chunks survive a partial failure; failed persons become `failed`, never zero statistics; valid empty splits remain `present-empty`.
8. Depth Chart remains optional current-only annotation. Sampled MiLB omission resolves to the roster-minus-starter fallback without failing the core pitcher pool.
9. Planner requests normalized capabilities such as `corePregame`, `officials`, `extendedVenue`, `staff`, `pitcherRoles`, and `game2Overlay`, not raw source names embedded in field definitions.
10. `gamePack` remains prohibited throughout the adapter registry and model source-result contract.

### Verification

- The adapter registry and its JSON Schema parse successfully.
- Registry adapter IDs exactly match the normalized-model source-result vocabulary.
- All ten adapters have unique inputs/key order, scope-complete keys, a conservative default capability, freshness rules, partial/failure policy, outputs, and error codes.
- Request-key tests prove defaults, deduplication, and set ordering are deterministic.
- Capability tests cover MLB, MiLB, spring, untested contexts, and absent MiLB depth charts.
- People partial-chunk tests retain successes and identify failed persons without zero filling.
- Six Build 003.2 adapter-contract subtests pass.
- Build 003.1 model tests, the cumulative Build 002 evidence suite, and the unchanged v0.2.0 regression suite pass.

### Carryover to Build 003.3

- Map schema version 1 data paths and all executable/compatibility field IDs to schema version 2.
- Replace legacy `gamePack` field requirements with normalized consumer capabilities.
- Define version-1 projections/aliases and unsupported-path behavior.
- Define version-aware cache/snapshot persistence and invalidation before any model is stored.

---

## Build 003.3 — Compatibility and Migration Map

**Status:** Complete  
**Date:** 2026-10-07  
**Scope:** Exhaustive schema-v1 field mapping, compatibility projections, normalized capability requirements, and version-aware persistence policy; no production changes

### Objective

Map every executable v0.2.0 field contract to normalized schema version 2, preserve existing layouts without destructive read-time rewrites, replace raw endpoint requirements with consumer capabilities, and prevent persisted snapshots or adapter results from crossing incompatible version/scope boundaries.

### Files changed in this increment

- `docs/Build_003.md`
- `docs/V030_COMPATIBILITY_MIGRATION_MAP.md`
- `schemas/v030-compatibility-map.schema.json`
- `tests/fixtures/model-contract/v030-compatibility-map.json`
- `tests/v030-compatibility-contract.test.mjs`
- `tools/generate-v030-compatibility-map.mjs`

No production application code, historical documentation, source-evidence fixture, normalized-model schema, adapter registry, or `README.md` was changed.

### Principal decisions

1. All 223 resolvable v0.2.0 fields have one explicit schema-v2 disposition: 171 catalog fields plus 52 compatibility-only fields.
2. Known aliases canonicalize in memory and persist only on an explicit user save; unknown field IDs survive round trips, render blank, and report an unsupported diagnostic.
3. Renamed and typed paths use declared projections. Composite displays are derived only from named schema-v2 dependencies.
4. Hitter and pitcher fields project into independent `hitting.totals` and `pitching.totals` scopes; the old merged `stats` namespace is not recreated inside schema version 2.
5. Fixed umpire positions select from the variable official crew by normalized role. Missing roles remain unavailable.
6. Legacy `bullpen[]` projects the union of schema-v2 `bullpen` and `additionalStarters`, preserving v0.2.0 roster-minus-starter semantics. New v0.3.0 presentation may optionally exclude additional starters without changing stored membership.
7. Audited v1 `sourceRequirements` remain evidence only. Schema-v2 resolution uses normalized capabilities and contains no `gamePack` requirement.
8. Layout schema versioning remains independent from normalized snapshot versioning.
9. Schema-v1 normalized snapshots are discarded and recomputed, never upgraded in place, because provenance, scope, source outcomes, and availability cannot be reconstructed safely.
10. Snapshot keys include model version/revision and selected Schedule view; adapter cache keys include adapter revision and the full semantic request key. Failed units are never cached as empty successes.

### Verification

- The generator reproduces an exhaustive map from the committed v0.2.0 registry.
- The map and JSON Schema parse successfully.
- Every current field appears exactly once and retains its audited v1 metadata.
- All four aliases resolve to mapped canonical IDs.
- Capability requirements use the closed normalized vocabulary and contain no `gamePack` label.
- Contract tests cover renamed, typed, role-scoped, composite, official-role, and legacy-bullpen projections.
- Persistence tests enforce safe unknown-field handling, schema-v1 snapshot recomputation, and version-aware adapter cache keys.

### Carryover to Build 003.4

- Add the remaining representative schema-v2 fixtures: ordinary pregame, missing lineup, two-way roles, manager ambiguity, variable officials, MiLB capability absence, and scoped competition statistics.
- Convert source precedence and cross-fixture invariants into executable contract tests.
- Produce the ordered production implementation plan and close Build 003.

---

## Build 003.4 — Contract Fixtures and Implementation Plan

**Status:** Complete  
**Date:** 2026-10-07  
**Scope:** Representative schema-v2 scenario fixtures, cross-fixture invariants, ordered production implementation plan, and Build 003 closure; no production changes

### Objective

Exercise the Build 003 model, adapter, capability, compatibility, and persistence decisions across every required edge case, then convert the closed contract into a bounded implementation sequence.

### Files changed in this increment

- `docs/Build_003.md`
- `docs/V030_BUILD_003_PLAN.md`
- `docs/V030_CONTRACT_FIXTURE_MATRIX.md`
- `docs/V030_PRODUCTION_IMPLEMENTATION_PLAN.md`
- `tests/fixtures/model-contract/v030-ordinary-pregame.json`
- `tests/fixtures/model-contract/v030-missing-lineup.json`
- `tests/fixtures/model-contract/v030-two-way-roles.json`
- `tests/fixtures/model-contract/v030-manager-ambiguity.json`
- `tests/fixtures/model-contract/v030-variable-officials.json`
- `tests/fixtures/model-contract/v030-milb-capability-absence.json`
- `tests/fixtures/model-contract/v030-scoped-competition-stats.json`
- `tests/v030-model-contract.test.mjs`
- `tests/v030-contract-scenarios.test.mjs`
- `tools/generate-v030-scenario-fixtures.mjs`

No production application code, normalized-model schema, adapter registry, compatibility map, source-evidence fixture, historical documentation, or `README.md` was changed.

### Principal decisions proved

1. A successful Schedule response with no lineup yields `notPosted`/`unposted`, not an empty confirmed lineup or request failure.
2. One person identity may occupy independent hitting and pitching roles without role deduplication or stat-scope merging.
3. Multiple manager-like candidates remain `ambiguous`; no arbitrary manager is selected.
4. Officials remain a variable source-faithful crew. Fixed base-position fields exist only as compatibility projections.
5. A successful Single-A depth-chart response that omits role annotations preserves the roster-minus-starter bullpen fallback.
6. Spring statistics and standings retain explicit spring scope; regular-season values are not silently substituted.
7. Game 2 precedence preserves separate Schedule, Game 1 Final Boxscore, and prior-day Standings cutoffs within one snapshot.
8. The production implementation is ordered into eight gated increments, keeping the v0.2.0 path as the control until user-visible cutover.

### Verification

- All eight normalized snapshots conform to the machine-readable schema subset.
- All fixture source-result IDs, lineage IDs, references, and target/coverage pairs are closed and unique.
- Eight Build 003.4 scenario/invariant subtests pass.
- The cumulative Build 002–003 contract/evidence suite passes.
- The unchanged v0.2.0 release regression suite passes.

## Build 003 closure

Build 003 is complete. The model shape, adapter boundary, capability routing, compatibility map, persistence rules, representative scenarios, source precedence, and production implementation order are now explicit and executable.

The next increment is **Build 004.1 — Contract runtime and typed constructors**.
