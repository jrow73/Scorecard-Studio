# Scorecard Studio v0.3.0 — Ordered Production Implementation Plan

**Prepared:** Build 003.4  
**Implementation input:** completed Build 001–003 contracts  
**Current production control:** committed v0.2.0

## 1. Objective

Implement normalized schema version 2 in bounded, reversible increments without breaking v0.2.0 layouts, exports, or the established roster-minus-starter fallback. Each increment has one integration boundary and must keep the release regression suite green.

This plan orders dependencies; it does not authorize combining increments merely because files overlap.

## 2. Required implementation order

### Build 004.1 — Contract runtime and typed constructors

Implement schema-v2 constants, availability/source-result/lineage constructors, JSON Pointer resolution, longest-prefix lineage lookup, and development validation. Do not fetch or render schema-v2 data yet.

**Gate:** all Build 003 fixtures load and validate through production runtime helpers; duplicate IDs, dangling references, and ambiguous lineage fail deterministically.

### Build 004.2 — Adapter interfaces, request keys, and planner

Implement the ten adapter declarations from Build 003.2, deterministic semantic request keys, capability resolution, People chunk planning, and source-result envelopes. Keep existing v0.2.0 fetch orchestration as the user-visible path.

**Gate:** contract request-key/capability tests run against production modules; no field definition contains endpoint routing or `gamePack`.

### Build 004.3 — Core Schedule normalization

Normalize selected Schedule view, context, status/dates, team identity, probable starters, original lineups, weather, and venue identity into schema version 2. Preserve the v0.2.0 path behind a temporary runtime switch.

**Gate:** ordinary and missing-lineup fixtures are reproducible; TBD time and multi-view selection rules are covered; no roster-derived lineup is fabricated.

### Build 004.4 — Rosters, People, staff, and pitcher classification

Add dated active-roster joins, scoped People hitting/pitching statistics, manager/coaches selection, two-way role preservation, and optional depth-chart annotations.

Store `startingPitcher`, `additionalStarters`, and core `bullpen` separately. When usable SP annotations are absent, retain the authoritative dated-roster-pitchers-minus-selected-starter fallback.

**Gate:** two-way, manager-ambiguity, and MiLB-absence fixtures are reproducible. Partial People chunks retain successful persons and never zero-fill failures.

### Build 004.5 — Standings, officials, venue detail, and Game 2 overlay

Add explicitly scoped Standings, variable Feed officials, conditional venue detail, and the Game 1 Final Boxscore overlay. Apply precedence only in the selected context and record every winning/rejected candidate and cutoff.

**Gate:** variable-officials, scoped-competition, and mixed-cutoff Game 2 fixtures are reproducible. Ranks, games back, Last 10, W-L, streak, and player totals retain distinct effective cutoffs.

### Build 004.6 — Compatibility resolver and layout integration

Implement the Build 003.3 field map in front of schema-v2 snapshots. Preserve all 223 field IDs, four aliases, repeated-field behavior, composites, and unknown-field round trips.

Implement legacy `bullpen[]` as `bullpen + additionalStarters`. Add the new presentation setting that optionally includes additional starters in a v0.3.0 bullpen list without changing normalized membership.

**Gate:** representative existing layouts render equivalently against v1 and the v2 compatibility resolver, subject only to intentionally explicit unavailable states. Loading a layout causes no persistent rewrite.

### Build 004.7 — Version-aware persistence and refresh

Add separately versioned normalized-snapshot and adapter-result stores/keys. Reject and recompute schema-v1 normalized snapshots; never invent missing v2 provenance. Implement event/scope freshness triggers and failed-unit retry behavior.

**Gate:** version/scope collision tests pass; schema-v1 snapshots cannot be read as v2; failed adapter units cannot masquerade as empty success; layouts and existing exports remain untouched.

### Build 004.8 — User-visible cutover and cleanup

Enable schema version 2 for normal use, expose actionable availability diagnostics and the additional-starter display preference, and remove the temporary dual-path switch only after parity evidence is recorded.

**Gate:** full release regression, Build 002 evidence, Build 003 contracts, compatibility layouts, PDF/export checks, and representative manual smoke tests pass. Rollback remains possible by restoring the prior application bundle without migrating layouts backward.

## 3. Cross-cutting rules

1. Production adapters emit candidates and source results; only normalization policy selects final values.
2. Consumers request capabilities, never endpoint names.
3. Source success and concept availability remain separate.
4. No value crosses sport, game type, standings type, date range, selected Schedule view, or game-state cutoff without an explicit rule.
5. `null`, empty, omitted, unposted, ambiguous, partial, failed, unsupported, stale, and not-requested remain distinct.
6. Complete raw responses stay out of normalized snapshots.
7. Layouts are never rewritten merely by opening them.
8. New UI/catalog work waits until the compatibility resolver is stable unless required to expose an accepted contract state.

## 4. Rollback and observability

Until Build 004.8 closure, the v0.2.0 execution path remains the behavioral control. Each increment should record:

- selected Schedule view and semantic request keys;
- adapter outcomes and failed retry units;
- capability decisions;
- normalization candidates and selected/rejected sources;
- compatibility field ID and projection; and
- snapshot schema/revision and invalidation reason.

Diagnostics must avoid raw response bodies, credentials, and personal/local storage contents. A rollback may discard version-2 snapshots and adapter caches because both are reproducible; it must preserve layouts and user-generated exports.

## 5. Definition of production-ready

Schema version 2 is production-ready only when:

- all Build 003 fixture/invariant tests execute against production modules rather than test-only helpers;
- all 223 v1 fields resolve through the compatibility boundary;
- the eight contract scenarios are reproducible from adapter candidates;
- cache/snapshot keys cannot collide across version or semantic scope;
- the additional-starter preference affects presentation only;
- the unchanged v0.2.0 release regression suite passes; and
- the temporary v1/v2 comparison evidence contains no unexplained field differences.
