# Scorecard Studio v0.3.0 — API Discovery Backlog

**Build:** 001.3  
**Baseline:** committed Scorecard Studio v0.2.0  
**Prepared:** 2026-10-05  
**Companions:** `V030_DATA_SOURCE_AUDIT.md`, `V030_NORMALIZED_FIELD_MATRIX.md`  
**Baseline SHA-256:** `D1726D62573A72A54FA8395598AEFD8C644CDDA753CCE8E753473E4CC67B54BE`
**Build 002 closure:** Reconciled in Build 002.7; historical investigation text is retained below

## 1. Purpose and boundary

This document is the handoff from Build 001 reconnaissance to Build 002 active API discovery. It collects unresolved questions from:

- the committed v0.2.0 implementation;
- `PREGAME_DATA_INVENTORY.md`;
- `GAME_PACK_FIELD_MATRIX.md`;
- `FIELD_REGISTRY.md`;
- the v0.2.0 release and relevant archived build records; and
- the source/provenance gaps identified in Builds 001.1 and 001.2.

Build 001.3 performs **no live endpoint probing**. Candidate URLs and assets below are leads recorded by the project, not newly verified guarantees. Build 002 must capture reproducible evidence before any candidate changes the data model or application.

The backlog is limited to data that may affect Scorecard Studio's normalized game model, scorecard generation, or a later Game Day experience. General Designer UI, backup/sync, and unrelated product work are outside this document.

## 2. Disposition and priority definitions

### Disposition

| Disposition | Meaning |
|---|---|
| **Build 002** | Deliberately probe and document during the next discovery build |
| **Opportunistic** | Validate when a suitable live/rare fixture exists; historical responses cannot reproduce the required state |
| **Defer** | Potential later value, but not required to design the v0.3.0 core model |
| **Reject** | Do not pursue under the current architecture unless materially new evidence appears |

### Priority

| Priority | Meaning |
|---|---|
| **P0** | Blocks or materially shapes core source/model/provenance design |
| **P1** | Valuable for a known scorecard or near-term product capability |
| **P2** | Useful later; should not delay core architecture |

### Evaluation questions

Every Build 002 investigation should answer:

1. Does this improve traditional scorecard generation, Game Day, or both?
2. Is the data available before first pitch, and when does it appear?
3. Is it stable for completed historical games?
4. Does it behave consistently across MLB, MiLB levels, spring training, and postseason where applicable?
5. Does it eliminate a current derivation or fragile fallback?
6. What are its request cost, fan-out, payload size, and freshness requirements?
7. Can absence be distinguished from not-yet-posted, unsupported, and failed?
8. What provenance/cutoff must the normalized model retain?

## 2.1 Build 002.7 closure status

This table closes the discovery backlog without rewriting its original questions and evidence plans. Detailed source decisions and precedence are authoritative in `V030_SOURCE_ADOPTION_DECISIONS.md`.

| DISC | Closure classification | Build 002.7 result | Remaining validation |
|---|---|---|---|
| 001 | Adopt authoritative | Hydrated Schedule remains the base game, status, lineup, probable-pitcher, weather, and venue-identity source. | Same-game ordinary MLB timing; live delayed/suspended tuples. Non-blocking. |
| 002 | Adopt authoritative, timing-conditional | Game Feed remains the officials source; preserve role-bearing collections and missing versus present-empty. | Same-game publication/crew-change timing and MiLB timing. Non-blocking. |
| 003 | Adopt authoritative plus conditional enrichment | Schedule owns game-specific venue identity; season-scoped Venue endpoint is preferred for extended metadata, with already-loaded Feed equivalent. | Narrow Venue comparison below Triple-A and additional temporary venues. Non-blocking. |
| 004 | Adopt authoritative with known scope limit | Dated active roster owns calendar-date membership; absence is not organizational absence. | Same-day between-game roster change cannot be resolved by this endpoint. Non-blocking limitation. |
| 005 | Adopt authoritative when explicitly scoped | People `byDateRange` supplies sport/game-type/stat-type totals; prefer `All`, reject ambiguous multi-split fallback. | Live chunk failure and cross-level aggregate cases. Non-blocking if partial/failure states are modeled. |
| 006 | Adopt authoritative by requested standings type/cutoff | Prior-day regular-season standings remain pregame authority; explicit spring/postseason types remain separate. | Broader split-season/tie marker coverage. Non-blocking. |
| 007 | Adopt authoritative with ambiguity state | Dated Coaches supplies manager/staff rows; preserve repeated roles and zero/multiple manager candidates. | Vacancy/co-manager examples and broader role taxonomy. Non-blocking. |
| 008 | Adopt optional annotation; retain fallback | Depth-chart roles may annotate active-roster matches only. Roster-pitchers-minus-starter remains authoritative fallback. | Opener/bulk roles; MiLB depth data was absent in sampled levels. Non-blocking. |
| 009 | Model optional enrichment; do not require | Current team-logo SVG is a current-brand asset reference with validation and text fallback. | Historical branding and PDF visual certification are later product work. |
| 010 | Adopt source-faithful groups | Normalize each returned standings record as a typed source group; do not synthesize absent league/Wild Card groups. | Product/catalog exposure may remain later work. |
| 011 | Adopt capability-gated routing | MLB/MiLB behavior is endpoint-specific; explicit sport/league context is required. | Future/pregame MiLB timing and separate MiLB Boxscore parity. Non-blocking for schema design. |
| 012 | Adopt competition-aware routing | Spring, regular-season, and postseason requests/totals remain separate; game type selects scope. | Competition-specific roster rules remain unproven. Non-blocking limitation. |
| 013 | Opportunistic, non-blocking | Existing Game 2 precedence remains; model mixed cutoffs and prior-game overlay provenance now. | Capture a real future doubleheader transition. |
| 014 | Opportunistic, non-blocking | Record calendar-date roster scope; do not claim between-game membership. | Capture a real same-day transaction if one occurs. |
| 015 | Opportunistic, partially resolved | Preserve one identity with independent hitting/pitching and role views; do not globally deduplicate. | Capture a live game with simultaneous legitimate two-way roles. |
| 016 | Opportunistic, partially resolved | International/transition fixtures support IANA timezone and game-specific venue identity. | Live before/after neutral-site transition remains useful, not blocking. |
| 017 | Defer | Advanced matchup/situational research is outside the core v0.3.0 scorecard model. | Revisit for a later Game Day research feature. |
| 018 | Defer product/catalog decision | Preserve complete coach collections now; field-catalog exposure is later. | Decide which roles deserve mappable fields. |
| 019 | Defer active-field exposure | Keep optional venue dimensions model-ready; do not activate fields without a workflow. | Product/layout decision. |
| 020 | Defer | Current logo endpoint cannot supply historical brand truth. | Separate archive/licensing investigation if historical branding becomes required. |
| 021 | Retain derivation; reject new fan-out for now | Derive pregame defense from Schedule lineup assignments plus probable pitcher. | Search for corroboration only if Schedule proves insufficient. |
| 022 | Reject | Do not reconstruct league-wide intraday standings client-side. | Reconsider only if a direct authoritative source is discovered. |

## 3. Build 002 investigation backlog

### DISC-001 — Schedule publication timing and game-state taxonomy

**Disposition / priority:** Build 002 / P0  
**Candidate source:** `/api/v1/schedule` with current hydration  
**Current behavior:** Schedule is the authoritative base for selected-game identity, original lineup, probable pitcher, venue/weather, status, and doubleheader metadata.

**Questions**

- When do probable pitchers and original lineups first appear, and can either change before first pitch?
- Which `abstractGameState`, `statusCode`, `detailedState`, `startTimeTBD`, `doubleHeader`, and game-number combinations occur?
- How are postponed, cancelled, suspended, resumed, delayed, and makeup games represented?
- Does a resumed/suspended game retain its original official date, roster date, and lineup semantics?
- Are doubleheader games always ordered and numbered reliably across MLB/MiLB?

**Evidence plan:** Capture the same ordinary game at early-day, lineup-posted, pregame, live, and final states; add historical postponed/suspended/resumed/makeup examples. Diff only the properties Scorecard Studio consumes plus relevant status metadata.

**Decision enabled:** Canonical game-state model, refresh rules, and whether status-specific source/cutoff policies are required.

### DISC-002 — Pregame umpire publication timing and crew evolution

**Disposition / priority:** Build 002 / P0  
**Candidate source:** `/api/v1.1/game/{gamePk}/feed/live`; investigate whether a narrower officials source exists  
**Current behavior:** Feed officials are the only runtime source for fixed umpire roles and the repeated crew.

**Questions**

- How long before first pitch does `liveData.boxscore.officials[]` appear?
- Is the crew absent, empty, partial, or complete before publication?
- Can assignments change between early pregame, lineup time, first pitch, and final?
- How are six-person postseason crews, replay officials, and left/right-field roles represented?
- Is availability consistent in MiLB?

**Evidence plan:** Timed snapshots for multiple MLB games; at least one postseason six-person crew when available; representative MiLB levels. Record `officialType`, IDs, names, ordering, and game state.

**Decision enabled:** Whether officials remain lazy feed data, need explicit “not posted” availability, and require role normalization beyond text matching.

### DISC-003 — Venue metadata and timezone completeness

**Disposition / priority:** Build 002 / P0  
**Candidate sources:** hydrated Schedule venue, Game Feed venue; investigate a narrower team/venue endpoint only if needed  
**Current behavior:** Venue is a shallow Feed-over-Schedule merge. Live PDF may fetch the feed for extended venue fields or a missing timezone.

**Questions**

- Which source reliably supplies IANA timezone, location, capacity, surface, roof, and dimensions?
- Does Schedule hydration make the feed request unnecessary for any accepted fields?
- Are nested venue objects complete enough to require a deep merge rather than top-level replacement?
- How do neutral-site, international, spring-training, shared, renamed, and temporary venues behave?
- Are timezone identifiers historical or current-only after a venue/team change?

**Evidence plan:** Compare Schedule and feed venue objects for ordinary MLB, neutral-site/international, spring, historical renamed venue, and MiLB fixtures.

**Decision enabled:** Venue adapter boundaries, merge semantics, feed necessity, and timezone provenance.

### DISC-004 — Dated roster historical semantics

**Disposition / priority:** Build 002 / P0  
**Candidate source:** `/api/v1/teams/{teamId}/roster?date={officialDate}&hydrate=person`  
**Current behavior:** The dated roster is the authoritative membership source for bench/bullpen derivation and player identity.

**Questions**

- Does `date` consistently reconstruct the active game roster rather than the organization/current roster?
- How are injured, inactive, optioned, suspended, designated, two-way, and recently traded players represented?
- What happens on transaction dates and between games of a doubleheader?
- Are roster position/type fields stable enough to classify pitchers and two-way players?
- Does historical behavior remain reliable across MLB and MiLB?

**Evidence plan:** Known transaction/trade dates, an injured-list activation, an option/recall, a doubleheader roster move, a two-way player, completed historical MLB games, and at least two MiLB levels. Compare roster membership with Schedule lineup/probable IDs.

**Decision enabled:** Membership provenance, roster-date semantics, two-way handling, and whether an additional transaction/status source is necessary.

### DISC-005 — People `byDateRange` scope and competition boundaries

**Disposition / priority:** Build 002 / P0  
**Candidate source:** bulk `/api/v1/people?...hydrate=stats(group=[hitting,pitching],type=[byDateRange],...)`  
**Current behavior:** The `sport.id = 0` / `All` split is preferred; prior-day range provides pregame MLB totals. Existing evidence covers traded, single-team, and MLB-debut examples.

**Questions**

- What exactly does the `All` split aggregate across leagues, clubs, levels, and competition types?
- Does `startDate={season}-01-01` behave correctly for spring training, postseason, winter leagues, and seasons spanning calendar boundaries?
- How are Opening Day, debut, no-appearance, traded, two-way, and multi-level seasons represented?
- Do pitching and hitting groups use identical split conventions?
- What happens when more than 100 IDs require chunking and one chunk fails?

**Evidence plan:** Preserve existing controls (Taylor Ward, Seranthony Domínguez, Cal Raleigh, Colt Emerson), then add Opening Day, postseason, spring, two-way, MLB/MiLB multi-level, and no-prior-stat cases. Capture all split descriptors, not only `stat`.

**Decision enabled:** Stat-scope descriptor, range construction, aggregate-selection policy, and whether competition/sport IDs must be explicit inputs.

### DISC-006 — Standings semantics, Wild Card fields, and date cutoffs

**Disposition / priority:** Build 002 / P0  
**Candidate source:** `/api/v1/standings`  
**Current behavior:** Regular-season standings for `officialDate - 1 day` supply pregame team record, ranks, division games back, streak, and Last 10.

**Questions**

- Which `standingsTypes` and record groups are returned for regular season, Wild Card, postseason, spring, and MiLB?
- What are the exact semantics/paths for league games back and Wild Card games back?
- How are leaders, ties, not-applicable values, clinch/elimination markers, and rank strings represented?
- Does `date` mean end-of-day consistently across sports/levels and historical seasons?
- Are Last 10 and streak splits present before ten games or in short seasons?

**Evidence plan:** Opening Day, early season, division leader/tie, Wild Card contender, eliminated/clinched club, postseason date, and multiple MiLB leagues. Retain complete `records[]`, `teamRecords[]`, and split descriptors.

**Decision enabled:** Typed games-back/rank model, standings-scope identifiers, full-table feasibility, and correct regular/postseason adapter selection.

### DISC-007 — Coaches roles, ambiguity, and historical correctness

**Disposition / priority:** Build 002 / P1  
**Candidate source:** `/api/v1/teams/{teamId}/coaches?date={date}&season={season}`  
**Current behavior:** The first exact/fuzzy manager match populates the manager; other returned staff are ignored. Existing prose reports one historical manager-change success.

**Questions**

- Which `job`, `title`, and role properties appear for manager, bench, hitting, assistant hitting, pitching, bullpen, catching, and other coaches?
- Are multiple people per role common, and is ordering meaningful?
- How does the endpoint represent interim/co-managers, vacancies, staff changes, and uniform numbers?
- Does `date` consistently return the historical staff, or does `season` dominate?
- What is available for MiLB?

**Evidence plan:** Current MLB clubs, a known in-season manager change, clubs with multiple hitting/pitching roles, historical seasons, and MiLB teams. Preserve every roster entry and its role metadata.

**Decision enabled:** Manager ambiguity policy and whether categorized coach collections can move from placeholder to supported model family.

### DISC-008 — Pitcher depth-chart roles

**Disposition / priority:** Build 002 / P1  
**Candidate source:** `/api/v1/teams/{teamId}/roster/depthChart?season={season}`  
**Current behavior:** Bullpen is every dated-roster pitcher except the selected probable starter.

**Questions**

- Are rotation starters distinguishable as `SP` from relievers/other pitchers?
- Are depth charts current-only or historically date-aware despite the candidate URL exposing only `season`?
- How often are roles missing, stale, duplicated, or inconsistent with the dated roster and probable pitcher?
- How are openers, bulk pitchers, two-way players, injured pitchers, and MiLB staffs classified?

**Evidence plan:** Compare depth chart, dated roster, probable pitcher, and recent games for multiple MLB teams; repeat at several MiLB levels and historical dates. Include opener/bullpen-game and two-way examples.

**Decision enabled:** Whether depth chart may annotate bullpen/rotation roles, whether it can affect membership, and when the current roster-minus-starter fallback remains authoritative.

### DISC-009 — Team-logo coverage and asset behavior

**Disposition / priority:** Build 002 / P1  
**Candidate asset:** `https://www.mlbstatic.com/team-logos/{teamId}.svg`  
**Current behavior:** No logo source or image field exists.

**Questions**

- What team IDs return usable SVGs across MLB, MiLB, inactive clubs, and affiliates?
- Does the asset represent current branding for historical dates, or can historical marks be requested?
- What happens for renamed, relocated, reaffiliated, all-star, national, spring, and neutral-site teams?
- Are response MIME type, caching headers, redirects, CORS, dimensions/viewBox, and transparency suitable for browser preview and PDF embedding?
- What fallback is appropriate when an asset is absent or unsuitable?

**Evidence plan:** Request a coverage sample spanning current MLB, each targeted MiLB level, inactive/renamed/reaffiliated clubs, and special teams. Record HTTP/asset metadata and visual identity limits; do not assume historical correctness from a successful response.

**Decision enabled:** Whether logos enter the future model as asset references, which provenance/branding disclaimer is required, and whether Designer/PDF work belongs in a later product version.

### DISC-010 — Full standings-group normalization

**Disposition / priority:** Build 002 / P1  
**Candidate source:** existing Standings response  
**Current behavior:** The app fetches complete standings responses but extracts only the two selected teams; `standings.groups` remains empty.

**Questions**

- Can `records[]` be deterministically keyed as division, league, and Wild Card groups?
- Which group identifiers, names, ordering, ranks, ties, and record types must be preserved?
- Are team-name variants available without an additional metadata request?
- How do interleague opponents, unusual MiLB structures, and postseason brackets affect grouping?

**Evidence plan:** Reuse DISC-006 captures and attempt a source-to-group mapping without adding requests. Document groups that cannot be assigned unambiguously.

**Decision enabled:** Whether root `standings.groups[]` becomes supported, stays deferred, or is removed from the immediate v0.3.0 model.

### DISC-011 — MiLB parity across the production source chain

**Disposition / priority:** Build 002 / P0  
**Candidate sources:** Schedule, roster, People, standings, coaches, feed, depth chart, logo asset  
**Current behavior:** API plumbing carries a selected sport ID in some places, but the product has been verified primarily with MLB and defaults Schedule to sport ID 1.

**Questions**

- Which source families and fields work at Triple-A, Double-A, High-A, Single-A, and other intended levels?
- Which sport/league IDs are required, and where does defaulting to MLB create incorrect behavior?
- Are lineups, probable pitchers, rosters, stats, standings, coaches, officials, venue metadata, and logos equally available?
- Do roster sizes, doubleheaders, extra lineup slots, and league structures require model changes?

**Evidence plan:** A common matrix of at least one future/pregame and one completed historical game per intended level. Run the same extraction checklist for every current adapter and record unsupported fields explicitly.

**Decision enabled:** Supported-sport boundary for v0.3.0, adapter capability flags, and removal of accidental MLB-only assumptions.

### DISC-012 — Spring-training and postseason boundaries

**Disposition / priority:** Build 002 / P0  
**Candidate sources:** current production source chain with competition-aware parameters  
**Current behavior:** `standingsTypes=regularSeason` and People range beginning January 1 are hard-coded; six-person postseason umpires exist only in representative data.

**Questions**

- Which fields and stat groups should a spring-training or postseason scorecard show?
- Does `byDateRange` mix regular-season, spring, or postseason statistics without explicit game/stat type?
- Which standings source/type is meaningful outside the regular season?
- How are postseason rosters, probable pitchers, and expanded umpire crews represented?
- Should a selected game's `gameType` select distinct adapters or stat scopes?

**Evidence plan:** At least one spring-training game and one game from each available postseason round, comparing Schedule game type, People splits, roster, standings response, and officials.

**Decision enabled:** Competition-aware context and whether v0.3.0 must model separate stat scopes rather than a single “season/YTD” object.

## 4. Opportunistic validation backlog

### DISC-013 — Live doubleheader transition

**Disposition / priority:** Opportunistic / P0  
**Current control:** Historical STL at CHW on 2025-06-19 (`777447` / `777458`) validates post-Game-1 behavior; synthetic tests cover Game 1 not Final.

Capture a real future doubleheader from before Game 1 through Game 1 Final and Game 2 lineup publication. Confirm targeted Schedule refresh, status transition, prior boxscore availability, player/team/streak overlays, and conservative broader standings. Historical calls cannot reproduce the live transition.

### DISC-014 — Same-day roster transaction between doubleheader games

**Disposition / priority:** Opportunistic / P1

When a real case occurs, determine whether the dated roster endpoint distinguishes between Game 1 and Game 2 membership or only calendar-date membership. If it cannot, document the limitation rather than inventing a game-specific roster.

### DISC-015 — Two-way player role behavior

**Disposition / priority:** Opportunistic / P1

Capture a game where a two-way player legitimately belongs in more than one normalized role. Compare Schedule assignment, dated roster position, People hitting/pitching groups, and depth chart. Validate that role views share identity without global deduplication.

### DISC-016 — Neutral-site/international timezone transition

**Disposition / priority:** Opportunistic / P1

Capture Schedule and feed before/after a neutral-site or international game to confirm venue identity, IANA timezone, scheduled instant, official date, and whether team/home designations remain stable.

## 5. Deferred discovery items

### DISC-017 — Advanced matchup and situational statistics

**Disposition / priority:** Defer / P2

Season series, batter-versus-pitcher history, platoon splits, recent form, opponent splits, and situational research may benefit a future Game Day research view but do not shape the traditional v0.3.0 scorecard model. Do not expand Build 002 into open-ended sabermetric discovery.

### DISC-018 — Full coaching-staff scorecard catalog

**Disposition / priority:** Defer / P2

DISC-007 should validate source structure now, but deciding which non-manager coaching roles become mappable scorecard fields belongs to a later catalog/product decision.

### DISC-019 — Venue dimensions as active fields

**Disposition / priority:** Defer / P2

DISC-003 should record availability while inspecting venue payloads. Exposing and formatting dimensions is not required for the core model unless a real scorecard workflow needs them.

### DISC-020 — Historical team branding archive

**Disposition / priority:** Defer / P2

DISC-009 should determine whether the candidate asset is current-brand-only. Locating or licensing historically accurate brand archives is separate from validating the current asset source.

### DISC-021 — Defensive-alignment corroboration source

**Disposition / priority:** Defer / P2

The authoritative pregame defensive assignment is already derivable from Schedule lineup positions plus the probable pitcher. Current feed defense is mutable during play. Search for another endpoint only if Schedule evidence proves insufficient.

## 6. Rejected approach

### DISC-022 — League-wide intraday standings reconstruction

**Disposition / priority:** Reject / P2

Do not reconstruct Game 2 division/league/Wild Card rank, games back, or Last 10 by fetching and replaying every same-day league result. The accepted v0.2.0 policy keeps those fields at the prior-day snapshot and discloses the cutoff. Last 10 also cannot be advanced safely from aggregate W-L without knowing which oldest result leaves the rolling window.

Build 002 may accept a single authoritative endpoint that directly returns a reliable between-games snapshot, if one is discovered while testing Standings. Absence of such an endpoint is not justification for client-side league reconstruction.

## 7. Questions that do not need new endpoint discovery

Build 002 should avoid spending time “discovering” data already present in fetched responses:

| Concept | Existing evidence | Needed work |
|---|---|---|
| Game type | Already normalized from Schedule/feed | Model/catalog decision |
| Venue timezone | Already normalized from hydrated venue/feed | Completeness validation under DISC-003 |
| Full standings rows | Existing Standings payload contains all team records | Shape validation under DISC-006/010 |
| Non-manager coaching staff | Coaches payload already returns roster entries | Role/history validation under DISC-007 |
| Player name variants | People/roster metadata already carries them | Catalog/provenance decision |
| Detailed pitching statistics | `normalizeStats()` already consumes many leaves | Catalog decision |
| Additional umpire roles | Feed crew and normalized `crew[]` already preserve them | Timing/role validation under DISC-002 |
| Defensive views | Derivable from Schedule lineup assignment | Model decision; DISC-021 remains deferred |
| Team/league/division IDs | Already retained internally | Model/provenance decision |

## 8. Required Build 002 evidence format

Each probe should produce a small evidence record containing:

```text
investigation ID
retrieval timestamp (UTC)
game/team/player identifiers
game state at retrieval
exact endpoint and query parameters
HTTP status and relevant response metadata
minimal relevant payload excerpt or saved fixture
observed presence/absence and value shape
comparison to another time/state/source when applicable
interpretation
known limitations / whether the result is repeatable historically
recommended model/source disposition
```

Do not record a field as “verified” from one successful fixture without documenting its scope. In particular:

- pregame timing requires multiple snapshots of the same game;
- historical correctness requires a known date-sensitive control;
- MiLB support requires multiple levels;
- absence must distinguish unsupported, not posted, empty, request failure, and bad parameters;
- a current response cannot prove that the same asset/personnel data was historically accurate.

## 9. Fixture matrix for Build 002

### Existing controls to preserve

| Control | Existing value |
|---|---|
| Recorded pregame Game Pack evidence | gamePk `822955`, SEA at TB, recorded as Pre-Game/Preview on 2026-07-10; useful as historical evidence, not reproducible at that state now |
| Doubleheader historical control | gamePk `777447`, STL at CHW Game 1, 2025-06-19 |
| Doubleheader Game 2 control | gamePk `777458`, same date/matchup |
| Traded-player aggregate examples | Taylor Ward, Seranthony Domínguez |
| Single-team aggregate example | Cal Raleigh |
| MLB-debut boundary example | Colt Emerson |

### New fixture categories to locate during Build 002

- ordinary future MLB game captured at multiple pregame stages;
- future real doubleheader for live transition capture;
- Opening Day game;
- postponed/makeup game;
- suspended/resumed game;
- spring-training game;
- postseason game with expanded umpire crew;
- neutral-site or international game;
- transaction-date roster example;
- two-way player example;
- at least one future and one historical game at each intended MiLB level;
- known manager/staff change;
- Wild Card leader/tie/clinched/eliminated examples;
- renamed/reaffiliated/inactive team IDs for logo testing.

## 10. Build 002 recommended sequence

1. **Evidence harness and fixture manifest** — define capture format, IDs, timestamps, redaction/storage rules, and comparison tooling.
2. **Current-source semantics** — Schedule, roster, People, Standings, Coaches, and Feed timing using MLB controls.
3. **Known candidates** — depth chart and team-logo coverage.
4. **Competition/level matrix** — MiLB, spring training, and postseason.
5. **Rare/live cases** — doubleheader transition, neutral sites, two-way players, transaction timing.
6. **Disposition report** — classify every investigated item as adopt, retain current fallback, model for future use, defer, or reject.

Build 002 should not change production adapters while evidence is still being collected. A later model-design decision should determine which verified sources enter the versioned normalized contract.

## 11. Build 001.4 closure inputs

After Build 002 discovery is scoped—but before it begins—Build 001.4 can close Build 001 by confirming:

- the 12 deliberate Build 002 investigations and their order;
- which fixture categories are realistically obtainable;
- whether MiLB is an immediate v0.3.0 design requirement or a capability boundary to preserve;
- whether logos and depth charts remain in Build 002 or move to later focused work;
- the accepted non-goals, especially advanced matchup research and intraday standings reconstruction;
- the documentation/evidence package expected from each Build 002 increment.
