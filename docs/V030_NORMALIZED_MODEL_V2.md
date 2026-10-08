# Scorecard Studio v0.3.0 — Normalized Model Version 2

**Introduced:** Build 003.1  
**Schema ID:** `scorecard-studio.normalized-game`  
**Schema version:** `2`  
**Initial contract revision:** `0.3.0-draft.1`  
**Current contract revision:** `0.3.0-draft.2`  
**Machine-readable contract:** `schemas/v030-normalized-game.schema.json`

## 1. Contract boundary

Schema version 2 is the normalized snapshot contract between future source adapters and Scorecard Studio consumers. It is not a raw API cache and does not prescribe when adapters execute. It stores normalized values plus enough source-result, availability, cutoff, and lineage metadata to explain the snapshot.

Schema version `1` remains the committed v0.2.0 model. Version `2` is intentionally not emitted by production code in Build 003.1.

The contract revision is separate from `schemaVersion`:

- increment `schemaVersion` only for an incompatible stored-model shape or meaning;
- increment `contractRevision` for compatible clarifications/additions within schema version 2;
- do not infer application version from either value.

## 2. Root shape

```text
schemaId: "scorecard-studio.normalized-game"
schemaVersion: 2
contractRevision: "0.3.0-draft.2"
context
game
away
home
standings
meta {
  snapshot
  sourceResults[]
  lineage[]
}
```

The familiar `game`, `away`, and `home` roots remain readable. Availability and provenance use sidecar records rather than wrapping every scalar in `{ value, provenance }`. This avoids changing every semantic field path while supporting mixed-source snapshots.

## 3. Context

`context` identifies the selected contest and every routing key that can change request meaning:

```text
gamePk                 string
season                 integer
sport { id, name? }
gameType                raw source code
competitionSegment     spring | regular | wildCard | divisionSeries |
                       leagueChampionship | worldSeries | other | unknown
selectedDate           user's schedule-selection date
officialDate           selected game view's official date
selectedViewKey        deterministic key when one gamePk has multiple date views
```

`sport.id + gameType` is the minimum competition identity. League/division IDs remain on team/standings records and in source request scope. `selectedDate` and `officialDate` are date-only strings and must never be parsed as midnight instants.

`selectedViewKey` is required because one direct Schedule response can expose multiple date buckets/views for a gamePk. The initial format is opaque to consumers; adapters must generate it deterministically from selected response context.

## 4. Game state and dates

`game.status` preserves both a conservative canonical state and the raw Schedule tuple:

```text
canonical: scheduled | pregame | live | delayed | suspended |
           postponed | cancelled | final | unknown
raw {
  abstractGameState?
  codedGameState?
  detailedState?
  statusCode?
  abstractGameCode?
}
reason?
startTimeTBD
teamsTBD
```

Unknown source tuples remain `canonical: unknown`; adapters must not force them into the nearest known state. Postponed and cancelled states cannot be inferred from abstract state alone.

`game.dates` separates:

- `scheduledStart`: displayable ISO instant only when confirmed;
- `originalScheduledStart`;
- `officialDate`;
- `rescheduledStart` and `rescheduledDate`;
- `resumeStart` and `resumeDate`.

A TBD placeholder timestamp is not stored as `scheduledStart`. If retaining it is diagnostically useful, it belongs in source-result metadata rather than the displayable normalized value.

## 5. Domain containers

### Teams and personnel

`away` and `home` share one shape:

```text
team
manager
coaches[]
lineup { state, slots[] }
startingPitcher
additionalStarters[]
bench[]
bullpen[]
defense
```

Team identity retains team, league, division, and sport IDs. Team record and standings values are separate because Game 2 can advance W-L while ranks/games-back/Last 10 remain prior-day.

Player identity is a reusable value shape, not a globally unique role object. The same person ID may legitimately appear in lineup, starting pitcher, bullpen, bench, or defensive views. Consumers may join identities by ID but must not deduplicate roles.

Beginning with contract revision `0.3.0-draft.2`, a person may also retain source-supplied name variants including `firstName`, `lastName`, `useName`, `useLastName`, `boxscoreName`, `initLastName`, and the other documented Stats API name forms. These are distinct source values rather than reconstructions of `name` (`fullName`). Normalization merges each variant independently, preferring the scoped People identity, then the hydrated dated-roster identity, then Schedule. Consumers may derive a display form only when its exact source variant is unavailable.

`lineup.state` is `notPosted`, `partial`, `posted`, or `unavailable`. `slots` preserves the posted source order and actual cardinality. Missing lineup data does not become an empty confirmed lineup or a roster-derived lineup.

Pitcher groups implement the Build 002 decision:

- `startingPitcher` is selected only from the Schedule probable-pitcher source;
- `additionalStarters` contains active-roster pitchers annotated `SP` by an available intersected depth chart, excluding the selected starter;
- `bullpen` is the remaining active pitcher pool when annotations are available;
- a consumer may display `bullpen + additionalStarters` without changing stored group identity; and
- if annotations are unavailable, `additionalStarters` is unavailable/empty by explicit lineage and `bullpen` falls back to roster pitchers minus starter.

### Player statistics

Hitting and pitching totals are separate scoped objects:

```text
stats {
  hitting?  { scope, totals }
  pitching? { scope, totals }
}
```

Every scope retains sport ID, requested game types, stat type, start date, end date, and selected aggregate descriptor. Spring, regular-season, and postseason totals cannot occupy one unqualified “season” object. Boxscore post-Game-1 overrides retain their own effective cutoff through lineage.

### Standings values

Ranks, games back, elimination, and clinch values preserve raw tokens plus typed interpretations. A raw dash does not become numeric zero. Root `standings.groups[]` contains only source records actually returned by an explicitly scoped request, keyed by standings type, sport, league, and division.

## 6. Source-result records

`meta.sourceResults[]` records adapter execution, not selected value ownership. Each record has a unique `id` and includes:

```text
adapter
request { key, endpointFamily, method, parameters }
scope
requestedAtUtc?
retrievedAtUtc?
effective
outcome
response?
error?
```

Accepted adapters are `schedule`, `feed`, `boxscore`, `roster`, `people`, `coaches`, `standings`, `venue`, `depthChart`, and `teamLogo`. The adapter list is versioned and deliberately excludes `gamePack`.

Outcomes are:

- `success` — request completed and was parseable;
- `partial` — only part of the requested entity set succeeded;
- `failed` — request/validation failed;
- `notRequested` — an adapter was deliberately not executed for this snapshot.

A successful request can still yield an omitted, empty, ambiguous, or unsupported concept. Source outcome and value availability are separate.

`request.key` is a deterministic semantic key that includes every parameter affecting meaning. It is not necessarily the literal URL and must not contain credentials.

## 7. Effective scope

Every source result and lineage record can carry an `effective` descriptor:

| Kind | Required meaning |
|---|---|
| `instant` | Value is effective at one known UTC instant. |
| `date` | Value represents one date-only scope, such as a dated active roster. |
| `dateRange` | Value aggregates an inclusive start/end date range. |
| `endOfDay` | Value represents standings through the end of a cutoff date. |
| `gameState` | Value reflects a game/source state at retrieval. |
| `current` | Source is explicitly current-only, such as the sampled team logo/depth chart. |
| `unknown` | Evidence cannot establish a stronger cutoff. |

The descriptor preserves appropriate fields such as `date`, `startDate`, `endDate`, `cutoffDate`, `instantUtc`, `gamePk`, and raw/canonical game state. It must not claim historical precision the source did not prove.

## 8. Lineage and availability

`meta.lineage[]` maps a normalized JSON Pointer target to its selected source and availability state.

```text
id
target                 RFC 6901 JSON Pointer into the normalized snapshot
coverage               exact | subtree
state
sourceResultRefs[]
selectedSourceResultRef?
sourcePath?
effective?
selectionReason?
fallbackUsed
rejectedCandidates[]
transformations[]
derivationInputs[]
```

Availability states are:

| State | Meaning |
|---|---|
| `available` | A usable normalized value or confirmed collection is present. |
| `unposted` | Dynamic pregame data is expected but not posted in the observed state. |
| `present-empty` | Source explicitly returned an empty collection/group. |
| `omitted` | Successful response omitted the property. |
| `not-requested` | Required adapter was intentionally not run. |
| `unsupported` | Capability policy says the concept is unsupported in this context. |
| `not-applicable` | Concept does not apply to this game/context. |
| `ambiguous` | Multiple candidates exist without a safe selection. |
| `partial` | Some requested entities/children are available and others are not. |
| `failed` | Request, parse, join, or validation failure prevented resolution. |
| `stale` | Retained value is older than the accepted freshness policy. |

Rules:

1. An exact lineage record overrides every subtree record for the same target.
2. Otherwise the most-specific ancestor subtree record applies.
3. Equal-specificity duplicate records are invalid.
4. Every registered/resolvable field and every collection root must resolve to one lineage record.
5. `available` targets must exist in the data snapshot. Non-available targets may be absent or null.
6. A lineage source reference must resolve to `meta.sourceResults[].id`.
7. Derived values list every normalized/source input in `derivationInputs`; they may have more than one source result.
8. `fallbackUsed` states whether the preferred candidate lost, not whether the value is derived.

This longest-prefix sidecar strategy allows one lineage record to cover a source-consistent subtree while permitting exact overrides for mixed-source leaves such as Game 2 W-L, streak, rank, and player totals.

## 9. Mixed-cutoff Game 2 contract

One schema version 2 snapshot may validly contain:

| Value | Source/effective cutoff |
|---|---|
| Game 2 lineup | Game 2 Schedule state at retrieval, or `unposted` |
| Player totals | Game 1 Final Boxscore seasonStats for matching player |
| Team W-L | Game 1 Final Boxscore team record |
| Streak | Prior-day Standings plus known Game 1 result derivation |
| Rank / games back / Last 10 | Prior-day Standings end-of-day cutoff |

The snapshot timestamp therefore cannot serve as the effective cutoff for every value. The Build 003.1 contract fixture demonstrates the required sidecar overrides.

## 10. Snapshot metadata and persistence boundary

`meta.snapshot` includes:

```text
id
createdAtUtc
producer { applicationVersion, build? }
fixtureKind?           live | historical-current | synthetic-contract
```

Schema version 2 snapshots must be stored under a version-aware key. Build 003.1 does not authorize persistence; Build 003.3 will define migration/invalidation. Complete raw API bodies, credentials, and binary logo/PDF content do not belong in the normalized snapshot.

## 11. Validation invariants

- Root schema identifiers and versions are exact.
- UTC timestamps use a `Z` suffix; date-only values remain `YYYY-MM-DD`.
- Source-result and lineage IDs are unique.
- Request keys are non-empty and semantically scoped.
- All lineage source references exist.
- Available lineage targets resolve in the snapshot.
- Collection roots carry lineage even when empty/unposted.
- No source result, request requirement, or lineage record uses `gamePack`.
- Team sides share one schema shape.
- Valid zero and false values remain available values.
- Unknown raw status, games-back, elimination, and clinch tokens are preserved rather than coerced.

## 12. Deferred to later Build 003 increments

- Exact adapter candidate-envelope types and cache/freshness algorithms: Build 003.2.
- Schema version 1 compatibility projection and field-registry path mapping: Build 003.3.
- Broader ordinary/missing/ambiguous/MiLB/competition fixture suite and implementation order: Build 003.4.
- Production adapter and normalizer changes: after Build 003 contract closure.
