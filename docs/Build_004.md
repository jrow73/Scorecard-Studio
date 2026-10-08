# Scorecard Studio v0.3.0 — Build 004

**Build theme:** Production implementation of normalized schema version 2  
**Starting production baseline:** committed Scorecard Studio v0.2.0  
**Contract authority:** completed Build 003

## Build 004.1 — Contract Runtime and Typed Constructors

**Status:** Complete  
**Date:** 2026-10-07  
**Scope:** Dormant production contract runtime and executable validation; no fetch, storage, renderer, bootstrap, or user-visible behavior changes

### Objective

Move the schema-v2 primitives proven in Build 003 out of test-only logic and into a browser-safe production module. Establish one deterministic implementation for construction, JSON Pointer access, lineage precedence, and development validation before adapters or normalization target schema version 2.

### Files changed in this increment

- `docs/Build_004.md`
- `docs/V030_CONTRACT_RUNTIME.md`
- `js/v030-contract.js`
- `tests/v030-contract-runtime.test.mjs`

No existing production module, application bootstrap, API orchestration, storage, renderer, fixture, schema, historical documentation, or `README.md` was changed.

### Implemented runtime surface

- Frozen schema, adapter, outcome, availability, coverage, and effective-scope vocabularies.
- Typed constructors for effective descriptors, source results, lineage records, snapshot metadata, and complete normalized snapshots.
- RFC 6901 token escape/unescape, parsing, and own-property-safe pointer resolution.
- Exact-then-longest-prefix lineage lookup with deterministic ambiguity rejection.
- Snapshot validation for version identity, prohibited labels, source/lineage uniqueness, vocabulary, source-reference closure, selected/rejected candidate closure, available-target existence, and caller-declared required lineage targets.
- Stable `ContractRuntimeError` and aggregate `ContractValidationError` failure types/codes.

### Boundary decisions

1. The runtime module has no imports, browser globals, clock reads, network calls, storage calls, or initialization side effects.
2. Constructors copy caller-owned containers and never infer provenance, timestamps, source selection, or availability.
3. Present `null` and missing paths remain distinguishable.
4. Pointer traversal uses own properties only; inherited/prototype values cannot satisfy a contract path.
5. Lineage resolution prefers an exact record, otherwise the most-specific ancestor subtree. Duplicate winners are errors rather than order-dependent selections.
6. Runtime validation complements the machine JSON Schema; it focuses on relational invariants that JSON Schema alone does not safely express.
7. Validation is available to development/test callers but is not wired into the v0.2.0 application path in this increment.

### Verification

- Seven focused Build 004.1 runtime subtests pass.
- All eight Build 003 normalized snapshots validate through the production runtime.
- Invalid duplicate IDs, duplicate lineage targets, dangling references, missing available targets, and missing required coverage produce deterministic errors.
- The cumulative Build 002–004 contract/evidence suite passes.
- An overlay of the new module onto the committed v0.2.0 application passes the unchanged release regression suite.

### Carryover to Build 004.2

- Implement adapter declarations as production modules.
- Implement semantic request-key construction and capability resolution against the Build 003.2 registry.
- Implement deterministic People chunk planning and source-result envelope helpers.
- Keep the existing v0.2.0 fetch orchestration as the user-visible path.

---

## Build 004.2 — Adapter Interfaces, Keys, Capabilities, and Planning

**Status:** Complete  
**Date:** 2026-10-07  
**Scope:** Dormant production adapter declarations, semantic input/key handling, capability routing, staged request planning, People chunking, and execution envelopes; no HTTP or user-visible behavior changes

### Objective

Move the Build 003.2 adapter registry and its deterministic behaviors into browser-safe production modules. Make every future request pass through a closed semantic input, capability, planning, and execution-envelope boundary before any adapter is allowed to perform I/O.

### Files changed in this increment

- `docs/Build_004.md`
- `docs/V030_ADAPTER_RUNTIME.md`
- `js/v030-adapter-definitions.js`
- `js/v030-adapters.js`
- `tests/v030-adapter-runtime.test.mjs`
- `tools/generate-v030-adapter-definitions.mjs`

No existing production module, application bootstrap, API orchestration, storage, renderer, fixture, schema, historical documentation, or `README.md` was changed.

### Implemented runtime surface

- Deep-frozen production declarations for all ten accepted adapters, generated deterministically from the Build 003.2 registry.
- Closed, typed, default-aware semantic input materialization that rejects unknown/unkeyed fields.
- Versioned semantic request keys with stable field ordering, percent encoding, and canonical set sorting/deduplication.
- Most-specific capability resolution with required conservative defaults and deterministic conflict rejection.
- Eight normalized planner capabilities with staged input, reuse, suppression, fallback, blocked-context, and request-deduplication behavior.
- Stable People-ID partitioning and per-chunk semantic request keys.
- Adapter unit and execution-envelope constructors that preserve partial successes, validate adapter error-code vocabularies, and never zero-fill failures.

### Principal decisions

1. Adapter declarations are generated production code rather than runtime JSON fetches, keeping browser imports deterministic and offline-safe.
2. Every declared semantic input participates in the request key. Unknown inputs are rejected so a meaning-changing parameter cannot bypass cache/provenance identity.
3. Defaulted parameters are materialized before keying. Set-like inputs are deduplicated and sorted without mutating caller data.
4. `supported` and `conditional` contexts may be planned; `untested` contexts are blocked from automatic execution; `absent` contexts resolve to their declared fallback.
5. `corePregame` may contain `pending-input` stages because roster membership and People IDs are discovered progressively. Pending is not failure.
6. Already-loaded Feed venue detail and core Standings groups satisfy their capabilities without redundant requests.
7. Game 2 Boxscore work is suppressed until the related earlier game is confirmed Final.
8. Identical semantic request keys are one execution unit even when multiple consumer capabilities need the result.
9. A People chunk failure creates failed-person markers and a retryable failed unit; it never creates zero statistics or erases successful chunks.

### Verification

- Production declarations exactly equal the machine-readable Build 003.2 registry and remain deeply frozen.
- Deterministic key tests cover defaults, type validation, unknown fields, date validation, set ordering, and deduplication.
- Capability tests cover MLB, MiLB, spring, absent depth charts, and untested contexts.
- Planner tests cover staging, reuse, suppression, fallback, blocking, and cross-capability request deduplication.
- People chunk/envelope tests prove successful candidates survive partial failure and failed identities are not zero-filled.
- Six focused Build 004.2 runtime subtests pass.
- The cumulative Build 002–004 contract/evidence suite and unchanged v0.2.0 release regression suite pass.

### Carryover to Build 004.3

- Implement selected Schedule-view normalization into schema version 2.
- Normalize context, complete status/date semantics, team identity, probable starters, original lineups, weather, and venue identity.
- Emit source-result and lineage records through the Build 004.1/004.2 runtime rather than handcrafted alternatives.
- Preserve the v0.2.0 application path behind the existing bootstrap; do not cut over rendering yet.

---

## Build 004.3 — Core Schedule Normalization

**Status:** Complete  
**Date:** 2026-10-07  
**Scope:** Dormant production Schedule-view selection and schema-v2 skeleton normalization; no network, bootstrap, renderer, storage, or user-visible behavior changes

### Objective

Implement the first production normalizer against the Build 003/004 runtime. Convert one explicitly selected hydrated Schedule view into a complete schema-v2 skeleton with source-result and lineage records while leaving roster, People, coaches, standings, Feed, venue-detail, and depth-chart concepts explicitly unavailable or not requested.

### Files changed in this increment

- `docs/Build_004.md`
- `docs/V030_SCHEDULE_NORMALIZER.md`
- `js/v030-schedule-normalizer.js`
- `tests/fixtures/model-contract/v030-schedule-source-cases.json`
- `tests/fixtures/model-contract/v030-schedule-ordinary-normalized.json`
- `tests/fixtures/model-contract/v030-schedule-missing-lineup-normalized.json`
- `tests/v030-model-contract.test.mjs`
- `tests/v030-schedule-normalizer.test.mjs`
- `tools/generate-v030-schedule-contract-fixtures.mjs`

No existing production module, application bootstrap, current API orchestration, storage, renderer, schema, historical documentation, or `README.md` was changed.

### Implemented runtime surface

- Strict selected-date-bucket and gamePk Schedule-view selection with deterministic `selectedViewKey`.
- Explicit missing-view and ambiguous-view failures.
- Complete raw status-tuple retention plus conservative canonical lifecycle mapping.
- Separate scheduled, original, rescheduled, and resumed dates/times.
- Active TBD timestamp suppression and placeholder-team detection.
- Competition context from sport, season, game type, and selected/official dates.
- Schedule-owned team identity/league record, probable pitchers, source-order lineups, weather, and venue identity.
- Complete schema-v2 side skeletons with non-Schedule concepts explicitly marked unavailable/not requested through lineage.
- Reproducible ordinary and missing-lineup Schedule input/output fixtures.

### Principal decisions

1. `selectedDate` is a semantic request input and must match the containing Schedule date bucket. A unique same-game view in another bucket is not silently substituted.
2. Multiple same-game views in one selected bucket are rejected as ambiguous instead of relying on response order.
3. Status classification uses detailed/coded/status-code evidence. Abstract `Final` alone does not collapse postponed or cancelled states into completed Final.
4. An active scheduled/pregame `startTimeTBD` suppresses displayable `scheduledStart` while retaining the raw original timestamp for audit. A historical Final timestamp is retained even when a stale TBD flag remains.
5. Schedule lineup source order becomes one-based batting order. Missing path is `unposted`; explicit empty array is `present-empty`; a short non-empty list is `partial`.
6. Schedule lineups are never synthesized from a roster. Bench, bullpen, defense, and additional starters remain not requested.
7. Hydrated lineup people expose primary-position metadata only; lineage labels the projection rather than claiming a confirmed game-position source.
8. Schedule owns venue ID/name only. Extended location, timezone, and field information remain not requested even if an uncontrolled response happens to contain them.
9. Probable-pitcher identity is retained with empty stats; People/Boxscore statistics remain independently not requested.
10. Every normalized output is built with the 004.1 constructors and Schedule semantic key from 004.2.

### Verification

- Strict multi-view selection is tested against the captured postponed/rescheduled same-`gamePk` response.
- Ordinary and missing-lineup outputs regenerate byte-for-byte and conform to the full schema-v2 machine contract.
- Focused tests cover missing versus present-empty lineups, active TBD placeholders, placeholder teams, postponed/rescheduled dates, historical Final/TBD behavior, cancelled status, and unknown status tuples.
- Seven focused Build 004.3 subtests pass.
- The cumulative Build 002–004 contract/evidence suite and unchanged v0.2.0 release regression suite pass.

### Carryover to Build 004.4

- Join dated active rosters without changing original Schedule lineup membership.
- Add scoped People hitting/pitching totals with partial-chunk behavior.
- Add manager/coaches selection and ambiguity handling.
- Add optional depth-chart role annotations and the authoritative roster-minus-starter fallback.
- Preserve two-way identities across legitimate role views.

---

## Build 004.4 — Rosters, People, Staff, and Pitcher Classification

**Status:** Complete  
**Date:** 2026-10-07  
**Scope:** Dormant production enrichment of Schedule snapshots; no network, bootstrap, renderer, storage, or user-visible behavior changes

### Objective

Join dated active-roster membership, explicitly scoped People statistics, dated staff, and optional current depth-chart annotations onto the Build 004.3 Schedule snapshot without weakening source boundaries. Preserve original Schedule lineup membership and selected probable starters while deriving bench and pitcher collections from dated rosters.

### Files changed in this increment

- `docs/Build_004.md`
- `docs/V030_ROSTER_PEOPLE_STAFF_NORMALIZER.md`
- `js/v030-roster-people-normalizer.js`
- `tests/fixtures/model-contract/v030-roster-people-source-cases.json`
- `tests/fixtures/model-contract/v030-mlb-two-way-manager-depth-partial-people-normalized.json`
- `tests/fixtures/model-contract/v030-milb-depth-absence-fallback-normalized.json`
- `tests/v030-model-contract.test.mjs`
- `tests/v030-roster-people-normalizer.test.mjs`
- `tools/generate-v030-roster-people-fixtures.mjs`

No application bootstrap, current API orchestration, storage, renderer, schema, historical documentation, or `README.md` was changed.

### Implemented runtime surface

- Strict team/date roster-scope validation before identity joins.
- Dated active-roster membership with stable source order and per-collection person-ID deduplication.
- Roster/People identity enrichment of existing Schedule lineup and probable-pitcher roles without changing their membership or order.
- Explicit People selection by requested statistic type, group, sport/level, game types, and date range.
- Independent hitting and pitching views for two-way players.
- Partial People-unit handling that retains successful people, marks failed identities, and never manufactures zero totals.
- Bench derivation only after a lineup is posted.
- Deterministic manager selection, ambiguity preservation, complete non-manager coaching staff, and stable coach categories.
- Optional current depth-chart SP annotations intersected with dated roster IDs.
- Separate `startingPitcher`, `additionalStarters`, and core `bullpen` collections with the authoritative roster-minus-selected-starter fallback.
- Reproducible MLB/two-way/ambiguous-manager/partial-People and MiLB/depth-absence fixtures.

### Principal decisions

1. The dated roster is authoritative for team membership. A depth-chart-only identity can never enter bench or pitcher collections.
2. The Schedule probable pitcher remains the selected starter. Roster or depth order cannot replace that selection.
3. A usable depth annotation set requires at least one roster-matched `SP` label. When usable, matched SP pitchers other than the selected starter become `additionalStarters`; all other roster pitchers become the core bullpen.
4. Missing, empty, failed, or non-SP depth data does not erase pitchers. The core bullpen falls back to dated roster pitchers minus the selected starter, and lineage records that fallback.
5. The future display preference to include additional starters in a bullpen list remains a presentation concern. Build 004.4 does not merge normalized collections.
6. A player may legitimately occur in more than one role view. In particular, a two-way player may simultaneously occupy a lineup slot and `startingPitcher`; deduplication is local to derived collections, not global across the side.
7. Bench membership is not inferred before any Schedule lineup is posted.
8. People statistic groups are selected independently. Missing or ambiguous groups remain unavailable rather than borrowing another sport/competition or filling zeros.
9. A partial People request has one aggregate partial source result. Players in successful units retain their data; players assigned to failed units receive failed stats lineage and empty stats objects.
10. An explicit `MNGR` job ID or exact Manager job is preferred. Multiple surviving explicit candidates remain ambiguous with `selected: null`; response order is never a tie-break.

### Verification

- The MLB fixture reproduces a two-way selected starter in both lineup and pitching views.
- A roster-matched SP label creates one additional starter; an inactive depth-only SP is rejected.
- A partial People execution preserves a successful reliever's pitching totals while a failed additional starter remains unfilled and explicitly failed.
- Two explicit manager records remain ambiguous; a single home manager resolves normally.
- The Single-A fixture reproduces successful depth responses with no roster annotations and retains all dated roster pitchers other than the selected starter in the bullpen fallback.
- Both generated outputs conform to the complete schema-v2 machine contract and production relational validation.
- The cumulative Build 002–004 suite and unchanged v0.2.0 release regression suite pass.

### Carryover to Build 004.5

- Add explicitly scoped Standings normalization and group retention.
- Add variable Feed officials and conditional venue detail.
- Add the Game 1 Final Boxscore overlay for Game 2 record, streak, and player-stat cutoffs.
- Record winning and rejected candidates for every mixed-cutoff precedence decision.

---

## Build 004.5 — Standings, Officials, Venue Detail, and Game 2 Overlay

**Status:** Complete  
**Date:** 2026-10-07  
**Scope:** Dormant production context enrichment and selected-value precedence; no network, bootstrap, renderer, storage, or user-visible behavior changes

### Objective

Complete the remaining contextual sources required before compatibility work: explicitly scoped Standings, variable Feed officials, conditional extended venue metadata, and the narrow Game 1 Final Boxscore overlay for a selected Game 2. Preserve every effective cutoff and rejected fallback in schema-v2 lineage.

### Files changed in this increment

- `docs/Build_004.md`
- `docs/V030_CONTEXT_OVERLAY_NORMALIZER.md`
- `js/v030-context-overlay-normalizer.js`
- `tests/fixtures/model-contract/v030-context-overlay-source-cases.json`
- `tests/fixtures/model-contract/v030-variable-officials-feed-venue-normalized.json`
- `tests/fixtures/model-contract/v030-spring-scoped-standings-normalized.json`
- `tests/fixtures/model-contract/v030-game2-production-mixed-cutoff-normalized.json`
- `tests/v030-context-overlay-normalizer.test.mjs`
- `tests/v030-model-contract.test.mjs`
- `tools/generate-v030-context-overlay-fixtures.mjs`

No application bootstrap, current API orchestration, storage, renderer, schema, historical documentation, or `README.md` was changed.

### Implemented runtime surface

- Explicit sport, league-set, standings type, season, and end-of-day cutoff validation.
- Source-faithful standings groups keyed by standings type plus sport/league/division identity.
- Selected-team row joins with division-aware disambiguation and no synthetic league reconstruction.
- Typed rank, games-back, elimination, and clinch values that preserve raw tokens.
- Ordinary pregame record and team-game-number derivation from the accepted standings cutoff.
- Variable Feed official crews that preserve every returned official, role, and source order.
- Distinct omitted, present-empty, failed, and available officials lineage.
- Extended venue selection using already-loaded Feed detail first, otherwise the narrow season-scoped Venue source.
- Field-group venue lineage with winning and rejected candidates.
- Strict Game 2 overlay validation: selected game number, same calendar date, verified Final status, related gamePk, and identical participating-team set.
- Game 1 postgame team-record and player-stat overrides, plus one-result streak advancement without intraday standings reconstruction.

### Principal decisions

1. Standings requests are meaningful only with their complete semantic scope. Sport/season mismatches fail before normalization.
2. Returned standings groups are retained exactly as groups returned by the source. The normalizer does not synthesize league-wide, Wild Card, or intraday groups.
3. Raw standings tokens remain auditable. In particular, `"-"` is a leader marker with `games: null`, not a fabricated numeric zero.
4. Feed officials are a role-bearing collection of variable length. The six-person control survives intact; an explicit empty array is `present-empty` rather than omitted.
5. Schedule continues to own venue ID/name. Feed or Venue supplies only location, timezone, and field information.
6. Already-loaded usable Feed venue detail wins. If Feed is unavailable or lacks usable detail, the season-scoped narrow Venue response wins. An equivalent losing candidate is recorded rather than silently discarded.
7. A Boxscore overlay is rejected unless the selected game is Game 2 or later and the related game is verified Final, same-day, and between the same two clubs.
8. Game 1 postgame team records and available `seasonStats` override older standings/People candidates. Lineage records the older valid candidate as rejected.
9. Rank, games back, Last 10, elimination, clinch, and source-returned groups remain at the accepted standings cutoff. No league-wide intraday reconstruction is attempted.
10. Streak is a derived value: prior-cutoff streak plus exactly one known earlier-game result. Its lineage has both inputs and no false single selected source.
11. Boxscore statistics are applied only for identities and stat groups actually returned. Missing groups retain their previous value and provenance.

### Verification

- A six-official Feed crew reproduces in source order without a four-person assumption.
- Feed venue detail wins over a simultaneous narrow Venue candidate and records that rejected candidate.
- The narrow Venue source supplies Game 2 extended fields when Feed has no venue object.
- Explicit empty Feed officials normalize as `present-empty`.
- A spring game retains `S`, `spring`, spring-scoped People totals, and a `springTraining` standings request/group.
- Standings group order and row order remain source-faithful; leader dashes remain nonnumeric.
- The Game 2 fixture proves distinct Schedule, prior-day Standings, and Game 1 Final Boxscore cutoffs in one validated snapshot.
- Invalid non-Final or mismatched standings scopes fail deterministically.
- All generated outputs conform to the schema-v2 machine contract and production relational validation.
- The cumulative Build 002–004 suite and unchanged v0.2.0 release regression suite pass.

### Carryover to Build 004.6

- Implement the production compatibility resolver from the Build 003.3 map.
- Preserve all 223 v0.2.0 field IDs, aliases, repeated-field behavior, composites, and unknown-field round trips.
- Project legacy bullpen as `bullpen + additionalStarters`.
- Add the v0.3.0 presentation preference for optionally including additional starters without changing normalized membership.

---

## Build 004.6 — Compatibility Resolver and Layout Integration

**Status:** Complete  
**Date:** 2026-10-07  
**Scope:** Schema-v2 compatibility resolution and non-destructive saved-layout loading; no network, bootstrap, storage write, renderer cutover, or user-visible behavior changes

### Objective

Implement the Build 003.3 compatibility map as production runtime code so existing v0.2.0 fields and saved layouts can resolve against schema-v2 snapshots. Preserve layout storage independently, retain unknown identifiers, and formalize both legacy bullpen output and the optional v0.3.0 additional-starter presentation behavior.

### Files changed in this increment

- `docs/Build_004.md`
- `docs/V030_COMPATIBILITY_RESOLVER.md`
- `js/v030-compatibility-definitions.js`
- `js/v030-compatibility-resolver.js`
- `js/v030-layout-compatibility.js`
- `tests/fixtures/model-contract/v030-compatibility-layout-cases.json`
- `tests/v030-compatibility-resolver.test.mjs`
- `tests/v030-layout-compatibility.test.mjs`
- `tools/generate-v030-compatibility-definitions.mjs`
- `tools/generate-v030-compatibility-layout-fixtures.mjs`

No application bootstrap, API orchestration, storage implementation, current renderer, normalized schema, historical documentation, or `README.md` was changed.

### Implemented runtime surface

- Generated, frozen production declarations for all 223 canonical v0.2.0 field IDs and four aliases.
- Direct, projected, derived, repeated-slot, repeated-row-index, and semantic-role resolution against schema-v2 snapshots.
- Capability aggregation using schema-v2 capability names instead of legacy endpoint/source labels.
- Availability and lineage propagation, including explicit ambiguous manager selection and source-aware additional-starter rows.
- Non-mutating layout loading with in-memory alias canonicalization and no implicit persistence request.
- Unknown-field blank rendering, exact round-trip preservation, and one aggregate diagnostic per layout.
- Explicit-save preparation that persists known canonical IDs while leaving unknown IDs untouched.
- Authoritative legacy bullpen union and a separate opt-in v0.3.0 pitcher-display preference.
- Reproducible representative saved-layout compatibility fixture.

### Principal decisions

1. The Build 003.3 machine map is the declaration authority; production field declarations are generated rather than independently hand-maintained.
2. Compatibility resolution never requests API endpoints. Consumers aggregate declared capabilities and the adapter runtime decides how to satisfy them.
3. A recognized alias canonicalizes in memory when a layout opens, but opening alone never rewrites storage.
4. Unknown field IDs remain where they were stored, resolve unsupported, render blank, and are summarized by one diagnostic per layout.
5. A missing value retains the most specific concept availability/lineage, including exact parent concept lineage when a child value cannot exist because the parent is failed or ambiguous.
6. Legacy bullpen fields always see core bullpen followed by additional starters, with person-ID deduplication and source-correct lineage.
7. The v0.3.0 `includeAdditionalStarters` option defaults false and affects display rows only. It cannot change normalized collections or legacy saved-layout output.
8. Layout storage remains independent of schema-v2 snapshot storage. Snapshot cache migration is deferred to Build 004.7.
9. The compatibility modules remain disconnected from application bootstrap until the user-visible cutover gate in Build 004.8.

### Verification

- The generated declaration module exactly matches all 223 machine-map entries and four aliases.
- Every declared field registers and resolves as supported against a complete schema-v2 snapshot.
- Representative saved-layout values match the unchanged v0.2.0 resolver, including aliases, repeated lineup rows, the legacy bullpen union, fixed-role officials, and derived records.
- A six-person official crew resolves by both semantic role and source-order slot.
- An ambiguous manager remains blank with `ambiguous` lineage rather than selecting the first candidate.
- Layout input objects remain unchanged after load; unknown fields survive load and explicit-save preparation.
- The additional-starter display preference is off by default and does not affect the legacy union.
- The cumulative Build 002–004 suite and unchanged v0.2.0 release regression suite pass.

### Carryover to Build 004.7

- Add separately versioned normalized-snapshot and adapter-result persistence keys.
- Reject and recompute schema-v1 normalized snapshots rather than inventing schema-v2 provenance.
- Add event/scope freshness invalidation and failed-unit retry behavior.
- Prove that layouts and generated exports remain outside normalized-cache migration.

---

## Build 004.7 — Version-Aware Persistence and Refresh

**Status:** Complete  
**Date:** 2026-10-08  
**Scope:** Dormant schema-v2 snapshot and adapter-result persistence policy; no current database migration, bootstrap connection, renderer cutover, layout rewrite, or user-visible behavior changes

### Objective

Implement collision-safe, separately versioned persistence for normalized snapshots and adapter results. Reject schema-v1 snapshots instead of fabricating schema-v2 provenance, make freshness event/scope aware, and retain successful partial units while retrying only eligible failures.

### Files changed in this increment

- `docs/Build_004.md`
- `docs/V030_ADAPTER_RUNTIME.md`
- `docs/V030_PERSISTENCE_AND_REFRESH.md`
- `js/v030-persistence.js`
- `tests/fixtures/model-contract/v030-persistence-cases.json`
- `tests/v030-persistence.test.mjs`
- `tools/generate-v030-persistence-fixtures.mjs`

No current storage module, application bootstrap, API orchestration, renderer, layout schema, export path, normalized schema, historical documentation, or `README.md` was changed.

### Implemented runtime surface

- Independent `normalizedSnapshotsV2` and `adapterResultsV1` logical stores behind an injected three-method backend.
- Percent-encoded normalized-snapshot keys containing namespace, schema version, contract revision, game ID, and selected Schedule view.
- Adapter-result keys containing namespace, adapter contract revision, and the complete canonical semantic request key.
- Strict current-schema/current-contract snapshot writes and read-time recomputation decisions.
- No-upgrade handling for schema-v1 snapshots and malformed or identity-mismatched payloads.
- Event-, scope-, and TTL-aware adapter cache inspection.
- Partial-result persistence containing normalized successful candidates plus explicit failed-unit retry metadata.
- Successful failed-unit merge without refetching or replacing already successful units.
- Explicit terminal handling for non-retryable failures.
- Failed-only and declared-invalid empty-success write suppression.
- Reproducible namespace/version/scope collision fixture.

### Principal decisions

1. Normalized snapshots and adapter results have separate namespaces, stores, versions, and key material.
2. Layouts, settings, PDF templates, and generated exports are user-authored or independently managed data; cache migration cannot access or rewrite them.
3. Schema-v1 normalized records are disposable derived data. They are rejected and recomputed, never upgraded in place.
4. Adapter semantic request keys remain the sole scope identity. Persistence does not reconstruct, abbreviate, or independently reinterpret their inputs.
5. Same-key selection and consumer demand may reuse valid records. Declared state/scope changes, milestones, prior-game finality, missing required fields, expiry, and manual refresh invalidate them.
6. Numeric expiry is applied only where evidence declared one: the 14-day Team Logo TTL.
7. Partial cache records retain successful normalized candidates and expose failed units separately. A retry can replace only a previously failed retryable unit.
8. A failed unit cannot masquerade as empty success, zero statistics, or absent data.
9. Complete raw adapter responses are not written into adapter-result records.
10. The controller is intentionally dormant until Build 004.8 connects the schema-v2 path to browser storage and user-visible rendering.

### Verification

- Snapshot keys differ across schema version, contract revision, game ID, and selected view.
- Adapter keys differ across contract revisions, roster dates, People game types, person sets, cutoffs, and every other declared semantic input.
- Valid schema-v2 snapshots round-trip as cloned values; schema-v1, old-revision, malformed, and wrong-view records require recomputation.
- A People partial result retains successful people and returns only retryable failed chunks for retry.
- A successful chunk retry completes the record without refetching the successful chunk.
- Non-retryable failures remain explicit terminal failures.
- Failed-only execution and empty success for an `emptyIsFailure` adapter produce no cache record.
- Lookup, event invalidation, semantic-scope mismatch, and Team Logo TTL boundaries are deterministic.
- The injected persistence controller calls only the two new logical stores.
- The cumulative Build 002–004 suite and unchanged v0.2.0 release regression suite pass.

### Carryover to Build 004.8

- Connect the validated schema-v2 orchestration, persistence, compatibility resolver, and renderer behind the user-visible cutover.
- Expose actionable availability diagnostics and the additional-starter display preference.
- Record v1/v2 parity evidence, PDF/export checks, and representative manual smoke tests.
- Remove the temporary dual path only after the full cutover gate passes, while retaining rollback by restoring the prior application bundle.

---

## Build 004.8 — User-Visible Cutover and Cleanup

**Status:** Complete  
**Date:** 2026-10-08  
**Scope:** Schema-v2 production bootstrap, browser persistence connection, compatibility-backed layout/PDF consumers, actionable diagnostics, additional-starter preference, and cutover validation

### Objective

Make normalized schema version 2 the only normal application path, connect the Build 004.7 cache without rewriting user-authored data, preserve existing layouts and generated-PDF behavior through the Build 004.6 compatibility resolver, and expose the accepted pitcher-classification choice in the UI.

### Files changed in this increment

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `docs/Build_004.md`
- `docs/V030_CUTOVER_AND_RELEASE_VALIDATION.md`
- `js/api.js`
- `js/app.js`
- `js/field-diagnostic.js`
- `js/field-registry.js`
- `js/slot-content.js`
- `js/storage.js`
- `js/v030-cutover.js`
- `tests/release_v0_3_0_cutover.test.mjs`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v030-cutover.test.mjs`

`README.md`, saved layout structures, PDF-template records, generated exports, the normalized schema, historical documentation, and the legacy `normalize.js` reference module were not modified.

### Implemented production behavior

- Schedule, dated rosters, explicitly competition-scoped People statistics, depth annotations, standings, coaches, Feed officials/venue detail, narrow Venue detail, and verified Game 1 boxscore context now pass through one schema-v2 composition boundary.
- The application bootstrap no longer imports or invokes `normalizePregameData`; there is no runtime dual-path switch.
- Existing field definitions, templates, repeated blocks, the Designer, and PDF generation continue to call the field registry, which delegates schema-v2 values to the compatibility resolver.
- Layout open is non-destructive and in-memory only; recognized aliases are canonicalized only when a user explicitly saves.
- IndexedDB advances to version 4 and adds only `normalizedSnapshotsV2` and `adapterResultsV1`. Existing settings, layouts, and PDF-template stores retain their names and schemas.
- Same-view selection may reuse a valid schema-v2 snapshot. Manual refresh recomputes from source. Cached schema-v1 or mismatched records cannot enter the v2 path.
- Depth-chart `SP` labels split `additionalStarters` from the core bullpen only when a usable annotation set exists. The authoritative fallback remains dated roster pitchers minus the selected starter.
- “Include additional starters” is off by default, persists as a setting, and affects Home/Game Day display only. Legacy saved-layout bullpen fields continue their established compatibility union.
- Field Diagnostic reports capability names and normalized availability rather than treating endpoint success as field availability.
- Browser identity advances to `0.3.0-dev • Build 004.8` with cache key `030b0048`.

### Verification

- 117 cumulative Build 002–004 contract, evidence, compatibility, persistence, and cutover tests pass.
- The dedicated 004.8 release regression passes and syntax-checks every production JavaScript file.
- A live-browser smoke test loaded the 2025-07-03 Kansas City at Seattle game through schema v2 with posted lineups, scoped player statistics, managers, standings, officials, venue detail, and no browser warnings/errors.
- Home displayed core bullpen rows with the preference off; enabling it added the depth-chart SP rows; disabling it restored the default list and persisted state.
- Game Day rendered typed standings, nested hitting/pitching totals, staff, variable officials, and extended venue data.
- Field Diagnostic resolved all 171 active catalog fields in the representative live control and displayed capability labels.
- Historical v0.2.0 build-number tests remain immutable historical checks and are not a valid aggregate command after a new release identity. Their current structural acceptance checks are carried forward by `release_v0_3_0_cutover.test.mjs`.

### Rollback

Restore the prior application bundle. No layout, PDF-template, or settings downgrade is required. The two new cache stores are derived data and may remain unused; the prior bundle does not address them. If Build 004.8 has not yet been overlaid, retaining the Build 004.7 application files is equivalent to rollback.

### Carryover

- Conduct broader user acceptance with real saved layouts/PDF templates in the target deployment environment.
- Promote `0.3.0-dev` to the final `0.3.0` release identity only after release acceptance.
- Decide whether dormant adapter-result persistence should be connected to request-unit execution in a later performance build; Build 004.8 connects normalized-snapshot persistence only.

---

## Build 004.8a — Player-Name Format Compatibility Correction

**Status:** Complete  
**Date:** 2026-10-08  
**Scope:** Narrow post-cutover correction for lineup and bullpen names in saved-layout/live-PDF repeated slots

### Finding

User acceptance with a real PDF template exposed a compatibility gap that the clean-profile Build 004.8 smoke test could not exercise. Schema-v2 player records correctly retain one canonical full name, but legacy layouts may request derived formats such as Last Name, First Name, Use Name, Boxscore Name, or First Initial + Last Name. The shared formatter returned an empty string when the corresponding legacy component was absent. Starting-pitcher and bench names remained visible in the observed template because those slots requested the canonical full-name format.

### Correction

- Preserve exact legacy name components whenever a source record supplies them.
- Otherwise derive safe first/last display parts from the canonical schema-v2 full name.
- Retain common suffixes (`Jr.`, `Sr.`, `II`, `III`, `IV`, and `V`) with the inferred last name.
- Fall back to the canonical full name rather than emitting a blank value for any supported player-name format.
- Advance the browser cache key to `030b0048a` and build identity to `004.8a` so deployed browsers load the corrected module graph.

No normalization schema, API behavior, saved layout, PDF template, layout geometry, or `README.md` was changed.

### Verification

- Every supported legacy name format produces a nonblank value for schema-v2 lineup and bullpen records.
- A repeated-slot integration check exercises the same field/format/context/selector path used by saved-layout PDF rendering.
- Suffix behavior is explicitly covered for last-name and first-initial-plus-last-name formats.
- The full cumulative suite passes with 121 tests, and the dedicated release regression passes after the cache/build update.

---

## Build 004.8b — Source-Faithful Player Names

**Status:** Complete  
**Date:** 2026-10-08  
**Scope:** Preserve Stats API player-name variants through schema-v2 normalization and restore their established v0.2 saved-layout/PDF meanings

### Finding

Build 004.8a prevented blank legacy name formats by deriving display values from the canonical full name. User acceptance with an unchanged v0.2 Designer layout then showed that the derivations were not equivalent to the Stats API values: `fullName` commonly uses a preferred name, `firstName` may be formal, and `boxscoreName` can carry source-authored disambiguation that cannot be reconstructed reliably.

### Correction

- Preserve source-supplied person name variants in normalized schema-v2 player objects.
- Merge every variant independently with People, hydrated dated roster, then Schedule precedence.
- Keep `name` as the normalized representation of source `fullName`.
- Resolve Full, First, Last, First Initial + Last, Use Name, and Boxscore formats from their corresponding API values first.
- Retain Build 004.8a derivation only as a last-resort fallback when the requested source value is absent.
- Advance the normalized contract revision to `0.3.0-draft.2`, browser cache key to `030b0048b`, and application identity to Build `004.8b`.

Saved v0.2 layouts and PDF templates require no migration or resave. No API request, pitcher classification, layout geometry, or `README.md` was changed.

### Verification

- A deliberately divergent identity verifies preferred full name, formal first name, last name, use name, API `initLastName`, and a multi-initial API `boxscoreName` end to end through the repeated-slot PDF resolver.
- Older `0.3.0-draft.1` normalized cache records are rejected and recomputed.
- Derivation remains nonblank for sources that do not provide the richer variants.
- All 123 cumulative tests and the dedicated release regression pass.
