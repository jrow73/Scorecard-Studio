# Scorecard Studio v0.3.0 — Build 001

## Build 001.1 — Baseline / Data-Flow Audit

**Status:** Complete  
**Date:** 2026-10-05  
**Scope:** Documentation only  
**Application baseline:** `Scorecard-Studio_v0.2.0_final.zip`  
**Baseline SHA-256:** `D1726D62573A72A54FA8395598AEFD8C644CDDA753CCE8E753473E4CC67B54BE`

### Objective

Establish a code-backed description of the v0.2.0 pregame-data system before v0.3.0 changes its data model. The audit traces every active request from caller through parameter construction, response consumption, normalization/source precedence, transient caching or persistent storage, and downstream use.

The detailed result is in `docs/V030_DATA_SOURCE_AUDIT.md`. That document is the v0.3.0 authority for **what the v0.2.0 application actually fetches and does**. It does not redefine the future normalized model or field catalog.

### Files changed

- `docs/Build_001.md`
- `docs/V030_DATA_SOURCE_AUDIT.md`

No application code, tests, existing historical documentation, or `README.md` was changed.

### Work completed

- Inventoried all seven MLB Stats API request families currently used by the application:
  - hydrated Schedule;
  - Game Feed / Game Pack;
  - Game Boxscore;
  - dated Team Roster;
  - bulk People with `byDateRange` hitting and pitching statistics;
  - dated Team Coaches;
  - dated League Standings.
- Recorded the separate local `app-meta.json` fetch so the complete set of runtime `fetch()` calls is accounted for.
- Traced each request's call sites, parameters, trigger, failure behavior, response properties read, normalized destinations, and consumers.
- Documented the actual pregame source hierarchy, including the special Game 2 path:
  - completed earlier same-day boxscore `seasonStats` precede People `byDateRange` statistics;
  - the completed earlier game's team record precedes the prior-day Standings record;
  - the prior-day streak is advanced from the known earlier-game result;
  - rank, games back, and Last 10 remain prior-day values.
- Audited memory reuse, browser HTTP cache policy, and IndexedDB involvement.
- Reconciled `PREGAME_DATA_INVENTORY.md`, `GAME_PACK_FIELD_MATRIX.md`, and `FIELD_REGISTRY.md` against the executable v0.2.0 code without editing those historical documents.

### Principal findings

1. **The production base path is not Game-Pack-first.** Selecting a game immediately loads dated rosters, prior-day People statistics, and prior-day standings, then normalizes them with hydrated Schedule data. The live feed is fetched later for Game Day, Field Diagnostic, or mapped fields that require umpires/extended venue data.
2. **The runtime registry's `gamePack` requirement is now an overloaded legacy label.** Schedule, roster, People, and earlier-boxscore-backed values are still marked `gamePack` even when no live-feed request supplies them. The requirement metadata therefore cannot serve as accurate provenance or as a complete fetch plan.
3. **API responses are not persisted.** All requests use `cache: "no-store"`. Schedule, feed, and supplemental payloads are held only in the page's in-memory `state`; IndexedDB stores preferences, layouts, and PDF templates—not MLB data or the normalized model.
4. **Core hydration is eager.** Both dated rosters, People statistics, and standings are requested for every selected game before Home is considered ready. Only coaches and most live-feed details are meaningfully on demand.
5. **Doubleheader handling is deliberate but split across sources.** Game 2 can use Game 1 postgame player statistics and team record while continuing to use pre-Game-1 rank/GB/Last-10 context. This mixed-time snapshot is intentional in v0.2.0 and needs explicit provenance in the future model.
6. **The model's provenance is too coarse for v0.3.0.** `meta.sources` records only source-family booleans. It does not identify a value's selected source, response path, cutoff, request outcome, fallback, or Game 2 override.
7. **Some documented normalized families are aspirational, not implemented.** Runtime normalization leaves `coaches` empty, `defense` empty, and `standings.groups` empty. Only the manager and selected-team standings scalars are normalized.
8. **Several stale raw-feed helper functions remain in `app.js`.** They describe lineup/bench/bullpen fallbacks from `liveData.boxscore`, but current UI paths render the normalized Schedule/Roster model and do not call those helpers.

### Documentation authority after Build 001.1

| Document | Build 001.1 status |
|---|---|
| `V030_DATA_SOURCE_AUDIT.md` | Authoritative for observed v0.2.0 request/data-flow behavior and documentation reconciliation |
| `PREGAME_DATA_INVENTORY.md` | Partially authoritative: accepted field intent and late Build 025.2/029 overlays remain useful; older source labels and unimplemented candidates are historical/planned |
| `GAME_PACK_FIELD_MATRIX.md` | Historical fixture evidence. Its Build 025.2 superseding table remains useful, but the older Game-Pack-first architecture is not production reality |
| `FIELD_REGISTRY.md` | Partially authoritative for intended field identity/placement semantics; executable `js/field-registry.js` is runtime authority. Its source-adapter and model-completeness claims require reconciliation |

### Verification

- Baseline archive hash recorded before extraction.
- All `fetch()` sites and every exported API wrapper were enumerated.
- API wrappers were traced to every caller in `app.js`.
- Normalized output paths were traced through `normalize.js`, the runtime field registry, Home, Game Day, Field Diagnostic, and live PDF generation.
- Storage code was checked to distinguish transient API state from IndexedDB persistence.
- The three named historical documents were reviewed against executable behavior.
- Deliverable archive contents were checked to contain only the two files listed above.

### Deferred to later Build 001 increments

- A field-by-field normalized-model reconciliation and corrected source-requirement vocabulary.
- A value-level provenance design.
- API discovery/backlog work, including team logos and depth-chart roles.
- Application-code or `README.md` changes.

---

## Build 001.2 — Field / Model Reconciliation

**Status:** Complete  
**Date:** 2026-10-05  
**Scope:** Documentation only  
**Detailed deliverable:** `docs/V030_NORMALIZED_FIELD_MATRIX.md`

### Objective

Reverse the Build 001.1 endpoint-first audit and trace the system concept-by-concept:

```text
normalized concept → real source hierarchy → transformation → registry field → consumer
```

The reconciliation covers every executable runtime field, identifies normalized values without field IDs, separates implemented behavior from historical/planned documentation, and proposes the source/provenance vocabulary needed for the future v0.3.0 model.

### Files changed in 001.2

- `docs/Build_001.md`
- `docs/V030_NORMALIZED_FIELD_MATRIX.md`

`docs/V030_DATA_SOURCE_AUDIT.md` remains unchanged and authoritative for the Build 001.1 request-flow audit. No application code, tests, historical documentation, or `README.md` was changed.

### Catalog reconciliation result

The executable `FIELD_REGISTRY` contains:

- **223 total resolvable fields**;
- **171 active catalog fields**: 64 Standard and 107 Custom;
- **52 compatibility-only fields** retained for resolution but hidden from the active catalog;
- **125 scalar fields** and **98 repeated fields**;
- **203 fields labeled `gamePack`**, 16 labeled `standings`, and 4 labeled `coaches`.

All 223 fields resolve against the deterministic representative model. No registry ID points to a structurally impossible normalized path. The defect is therefore not field-path breakage; it is that source requirements and several prose contracts no longer describe how those values are produced in live use.

### Principal 001.2 findings

1. **The active catalog is structurally sound but source-blind.** The existing `gamePack` label combines at least Schedule, roster, People statistics, prior-game boxscore, Game Feed, and derived values.
2. **Fetch planning and provenance must become separate concepts.** A field can be usable from an already-loaded fallback while its preferred source failed, and one normalized record can combine several sources.
3. **Game 2 requires value-level provenance.** Player statistics and the team record can be post-Game-1 while rank, games back, and Last 10 remain prior-day values.
4. **There are no active registered fields that are permanently unpopulatable by the current normalizer.** Missing live values are data/timing/source failures, not dead active paths.
5. **The normalized model contains useful unexposed values.** Examples include game type, venue timezone, source IDs, name variants, detailed pitching statistics, and internal join keys.
6. **Several documented families remain aspirational.** Coach collections, defensive views, full standings groups, venue dimensions, per-value provenance, and detailed availability states are not implemented.
7. **Compatibility fields are concentrated in pitching.** Of 52 compatibility fields, 42 are starting-pitcher fields, 8 are bullpen fields, and 2 are lineup batting-order fields.

### Authority after 001.2

- `V030_DATA_SOURCE_AUDIT.md` is authoritative for v0.2.0 request and payload flow.
- `V030_NORMALIZED_FIELD_MATRIX.md` is authoritative for the v0.2.0 normalized-field/registry reconciliation and the proposed v0.3.0 source vocabulary.
- Executable `js/field-registry.js` remains the authority for fields that v0.2.0 can actually resolve.
- The three pre-v0.3.0 documents remain intact as product intent, fixture evidence, and development history, subject to the status classifications recorded in Builds 001.1 and 001.2.

### Deferred after 001.2

- Implementing corrected source requirements or provenance.
- Choosing the final v0.3.0 normalized schema.
- Deciding which unexposed or planned families enter the future active catalog.
- Active MLB API discovery and endpoint probing.
- Application-code or `README.md` changes.

---

## Build 001.3 — API Discovery Backlog

**Status:** Complete  
**Date:** 2026-10-05  
**Scope:** Documentation and Build 002 investigation planning only  
**Detailed deliverable:** `docs/V030_API_DISCOVERY_BACKLOG.md`

### Objective

Convert every unresolved source question from the v0.2.0 code, Builds 001.1/001.2, current project documentation, and relevant historical build notes into a prioritized, testable discovery backlog.

Build 001.3 deliberately makes no live MLB API calls. It defines what Build 002 should probe, which evidence must be captured, which accepted v0.2.0 behaviors are controls rather than open questions, and which ideas should not consume discovery time.

### Files changed in 001.3

- `docs/Build_001.md`
- `docs/V030_API_DISCOVERY_BACKLOG.md`

The Build 001.1 data-source audit and Build 001.2 normalized-field matrix remain unchanged. No application code, tests, historical documentation, or `README.md` was changed.

### Backlog result

The backlog defines 22 investigation records:

- **12 planned Build 002 investigations**;
- **4 opportunistic validations** that require a suitable live or rare fixture;
- **5 deferred product/research ideas** that do not affect the v0.3.0 core model;
- **1 explicitly rejected approach**: league-wide intraday standings reconstruction.

The highest-priority Build 002 work covers:

- Schedule timing/state behavior;
- umpire publication timing;
- venue/timezone completeness;
- historical roster semantics;
- People-stat competition/sport scope;
- standings and Wild Card semantics;
- coaches role/history behavior;
- pitcher depth-chart roles;
- team-logo coverage/asset behavior;
- full standings-group shapes;
- MiLB parity across current source families; and
- spring-training/postseason boundaries.

### Principal 001.3 findings

1. **Several apparent API gaps are normalization gaps.** Full standings rows and coaching staff are already in responses the app fetches; player name variants, game type, venue timezone, and many detailed stats are also already available.
2. **Timing is the largest unresolved dimension.** A single stored pregame fixture cannot establish when lineups, probable pitchers, umpires, coaches, or other fields become available.
3. **MiLB is a cross-cutting test axis, not one endpoint.** Schedule, rosters, People, standings, coaches, feed, depth chart, and logo coverage all require level-aware verification without adding new `sportId=1` assumptions.
4. **Competition boundaries need explicit evidence.** Regular season, Opening Day, spring training, postseason, debut, traded-player, and season-transition cases can exercise different stat and standings semantics.
5. **The accepted doubleheader model remains the control.** Build 002 may look for a cheaper authoritative intraday source, but must not replace conservative Game 2 behavior without stronger evidence.
6. **Build 002 needs captured evidence, not undocumented browser observations.** Each probe must retain exact URL/parameters, retrieval time, game state, relevant payload excerpts, interpretation, and repeatability limits.

### Deferred after 001.3

- Executing the Build 002 probes.
- Selecting the final v0.3.0 normalized schema and provenance representation.
- Implementing new endpoints, assets, adapters, fields, or caches.
- Product UI work such as team-logo placement or Game 2 disclosure.
- Application-code or `README.md` changes.

---

## Build 001.4 — Build 001 Closure / Build 002 Plan

**Status:** Complete  
**Date:** 2026-10-05  
**Scope:** Documentation and planning only  
**Closure:** `docs/V030_BUILD_001_CLOSURE.md`  
**Next-build plan:** `docs/V030_BUILD_002_PLAN.md`

### Objective

Close the reconnaissance build, record its accepted architectural decisions and authority boundaries, and convert the Build 001.3 backlog into a sequenced Build 002 evidence plan.

### Files changed in 001.4

- `docs/Build_001.md`
- `docs/V030_BUILD_001_CLOSURE.md`
- `docs/V030_BUILD_002_PLAN.md`

No application code, tests, v0.2.0 historical documentation, or `README.md` was changed.

### Accepted closure decisions

1. **MiLB is a compatibility requirement, not yet a universal-support promise.** Future architecture must carry sport/league context and avoid new MLB-only assumptions; Build 002 will establish the evidence boundary.
2. **Depth-chart and logo feasibility remain in Build 002.** Depth-chart roles have the higher priority because they may improve an existing normalized collection; logos are an asset-feasibility investigation for a later UI capability.
3. **The conservative Game 2 standings policy remains authoritative.** Broader standings stay at the prior-day snapshot unless a single reliable source directly provides the between-games state.
4. **Advanced matchup/situational research remains deferred.** It must not expand the traditional scorecard model or delay core data architecture.
5. **Build 002 is evidence-first.** It may add capture tooling, fixture manifests, minimized evidence, and documentation, but it will not alter production adapters or normalized behavior while source semantics remain under investigation.

### Build 001 completion statement

Build 001 has answered the four reconnaissance questions established at its start:

- what v0.2.0 fetches and consumes;
- how raw data becomes the current normalized model and registry fields;
- which source questions are verified, unresolved, deferred, or rejected; and
- how Build 002 will investigate the unresolved questions reproducibly.

The current implementation remains unchanged. Build 002 begins from the same committed v0.2.0 baseline plus the four Build 001 documentation packages.
