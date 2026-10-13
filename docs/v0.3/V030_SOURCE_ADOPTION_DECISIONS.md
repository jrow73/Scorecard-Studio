# Scorecard Studio v0.3.0 — Source Adoption Decisions

**Authority introduced:** Build 002.7  
**Baseline:** committed Scorecard Studio v0.2.0  
**Evidence set:** 120 minimized fixtures, DISC-001 through DISC-012  
**Companions:** `V030_API_FINDINGS.md`, `V030_API_EVIDENCE_MANIFEST.md`, `V030_COMPETITION_CAPABILITY_MATRIX.md`

## 1. Purpose and decision boundary

This document is the final Build 002 source-policy handoff to the v0.3.0 normalized-model design. It decides which sources may own, annotate, or fall back for each concept. It does not change request behavior, application code, field catalog, storage, UI, or PDF rendering.

Evidence is bounded. A historical-current response proves what can be retrieved now for the named control, not the exact payload that existed on the original game date. A live snapshot proves only its captured state. Those limitations are represented below instead of being converted into universal support claims.

## 2. Disposition vocabulary

| Disposition | Contract |
|---|---|
| Authoritative | May own the concept within the stated scope. |
| Conditional authority | May own the concept only when its request context, cutoff, and availability requirements are satisfied. |
| Optional annotation/enrichment | May add metadata after intersection with an authoritative identity or membership source; cannot create or remove authoritative entities. |
| Retained fallback | Existing behavior remains required when a stronger optional source is unavailable. |
| Model now, fetch later | Reserve a normalized/provenance shape without adding default request fan-out. |
| Defer | Valuable later but not required for the core v0.3.0 model. |
| Reject | Do not implement under the current architecture without materially new evidence. |

## 3. Final source dispositions

| Source or concept | Disposition | Accepted scope | Required fallback or boundary |
|---|---|---|---|
| Hydrated Schedule | Authoritative | Selected-game identity, raw status tuple, game type/number, scheduled and official dates, TBD/placeholder markers, original lineup, probable pitcher, weather, and game-specific venue identity | Missing lineup/probable is an availability state. A direct gamePk response can contain multiple date views and must be contextually selected. |
| Game Feed | Conditional authority | Officials; already-loaded extended venue metadata; feed-owned live/game context | Keep lazy or milestone-triggered. Do not fetch solely for venue details when the narrow Venue request is sufficient. Feed status does not overwrite Schedule's postponement relationship without retaining both source views. |
| Separate Boxscore | Conditional authority | Earlier-game postgame player `seasonStats` and team record for a later same-day game after the earlier game is Final | People prior-day totals and prior-day standings remain fallbacks. No league-wide intraday reconstruction. MiLB endpoint parity remains untested. |
| Dated active roster | Authoritative | Active calendar-date team membership, roster position/status, jersey, and person identity enrichment | Absence does not mean outside the organization. The endpoint cannot prove between-game membership on the same date. |
| People `byDateRange` | Conditional authority | Hitting/pitching totals for explicit sport, game type, stat type, start date, and end date | Prefer sport `0` / `All`; allow one unambiguous split only with fallback provenance; treat multi-split/no-aggregate as ambiguous. Empty splits differ from failure. |
| Dated Coaches | Conditional authority | Manager and complete staff collection for requested team/date/season | Preserve repeated roles. Resolve recognized manager job IDs/jobs first; zero or multiple candidates remain explicit, not first-match success. |
| Standings | Conditional authority | Returned source groups and selected-team rows for explicit sport/league, standings type, season, and end-of-day cutoff | Use prior day for ordinary pregame values. Preserve raw rank/games-back/elimination/clinch tokens. Never synthesize missing groups or intraday league state. |
| Season-scoped Venue | Conditional authority | Extended location, IANA timezone, capacity, surface, roof, and optional dimensions for selected venue ID/season | Schedule keeps game-specific ID/name. If Feed is already loaded, its equivalent venue object can satisfy these fields. Fields remain optional and historically qualified. |
| Depth chart | Optional annotation | Pitching-role labels after person-ID intersection with the dated active roster | Never membership or selected-starter authority. Missing data is normal. Retain roster-pitchers-minus-starter fallback. |
| Team-logo SVG | Model now, fetch later; optional enrichment | Valid current-brand asset reference keyed by team ID and retrieval time | Validate status, MIME, and SVG structure. Fall back to text/abbreviation. Never claim historical branding. |
| Transactions | Corroborative discovery only | Evidence for roster test cases | Do not add as a production dependency for the current model. |
| Schedule-derived defense | Retained derivation | Pregame position assignments from original lineup plus probable pitcher | Do not add a corroboration endpoint unless Schedule evidence later proves inadequate. |
| League-wide intraday reconstruction | Reject | None | Keep prior-day cutoff disclosure and the narrow earlier-game overlay only. |

## 4. Authoritative source precedence

The following order is a semantic precedence contract, not permission to fetch every source eagerly.

| Normalized concept | Precedence | Selection rule |
|---|---|---|
| Selected game and competition | Schedule selected view → Feed identity fallback | Match gamePk and intended date/view; retain `sportId`, `gameType`, season, official date, and retrieval time. |
| Canonical state | Schedule raw tuple and lifecycle metadata; retain Feed state as a separate source observation when loaded | Never collapse postponed/cancelled from abstract state alone. |
| Start time | `null`/unconfirmed when Schedule `startTimeTBD` is true → otherwise Schedule instant → Feed fallback | Preserve placeholder-team state and original/rescheduled/resumed instants separately. |
| Venue identity | Schedule | Keep selected-game venue ID/name even when extended detail comes from another source. |
| Venue detail | already-loaded Feed equivalent → narrow season-scoped Venue request → unavailable | Normalize field-by-field; preserve requested season and source. |
| Weather | Schedule → Feed fallback | Whole-source selection is acceptable until field-level conflicts are observed; provenance must name the selected source. |
| Original lineup | Schedule only | Omitted means unposted/unavailable, not an empty nine-player lineup. Preserve source order and actual cardinality. |
| Selected starting pitcher | Schedule probable pitcher only | Depth chart cannot replace it. Missing remains missing. |
| Active membership | Dated roster only | Apply requested team/date scope; do not upgrade calendar-date membership to game-specific truth. |
| Player identity leaves | People → roster person → Schedule person | Preserve per-leaf fallback provenance when sources differ. |
| Jersey number | roster jersey → People/Schedule primary number | Preserve original text. |
| Bench | active-roster non-pitchers minus posted Schedule lineup | Blank/unavailable until lineup membership exists; do not infer a full bench from an unposted lineup. |
| Pitcher pool | active-roster pitchers, including explicit two-way handling | Roster remains membership authority. |
| Selected starter removal | Schedule probable-pitcher ID | If absent, retain the full pitcher pool and mark starter unresolved. |
| Additional starters | active pitcher IDs intersected with depth-chart `SP`, excluding selected starter | Store as a derived group with annotation provenance. |
| Core Bullpen | active pitcher pool minus selected starter minus `additionalStarters` when annotations are available | User presentation may optionally include `additionalStarters`; if annotations are absent, fall back to active pitchers minus starter. |
| Player pregame totals | People scoped aggregate → one unambiguous scoped split → missing/ambiguous | Never select the first of multiple non-aggregate splits. Keep hitting and pitching independent. |
| Game 2 player totals | earlier Final-game Boxscore `seasonStats` for matching player → People prior-day scoped total | Record mixed cutoff per player/source. |
| Team pregame record | prior-day Standings | Cutoff is end of the preceding official date. |
| Game 2 selected-team record | earlier Final-game Boxscore record → prior-day Standings | Does not advance ranks, games back, or Last 10 league-wide. |
| Team rank/GB/Last 10 | prior-day Standings only | Preserve raw semantic tokens and cutoff. |
| Game 2 streak | prior-day Standings streak advanced by known earlier result → new W1/L1 only when base is unusable | Mark as local derivation with both input sources. |
| Manager | recognized exact job ID/job → controlled manager-title match → ambiguous/missing | Never choose the first arbitrary manager-like row. |
| Coaching staff | every dated Coaches row in source order | Preserve person, jersey, job, title, and jobId; categories are repeated collections. |
| Officials | Feed officials collection | Preserve `officialType`, source order, and variable crew cardinality. |
| Standings groups | each record actually returned by the explicitly scoped Standings request | Key by standings type, sport, league, and division. Do not manufacture absent groups. |
| Team logo | validated current SVG reference → team abbreviation/text → empty placeholder | Asset failure does not fail game data. |

## 5. Competition and level routing contract

Every adapter request must start from explicit context rather than an MLB default:

```text
competition = {
  sportId,
  gameType,
  season,
  officialDate,
  leagueId?,
  divisionId?
}
```

Endpoint-specific request scope adds:

- People: stat groups, stat type, requested `gameType[]`, start date, end date, and sport ID;
- Standings: sport/league, standings type, season, and cutoff date;
- Roster/Coaches: team ID plus date, and season where required;
- Venue: venue ID plus requested season;
- Schedule/Feed/Boxscore: selected gamePk plus the contextual Schedule view.

Spring (`S`), regular season (`R`), Wild Card (`F`), Division Series (`D`), League Championship (`L`), and World Series (`W`) are separate scopes. Their totals must not be silently combined. MiLB support is a per-source capability state, not one global boolean; the authoritative bounded matrix is `V030_COMPETITION_CAPABILITY_MATRIX.md`.

## 6. Availability and failure contract

The v0.3.0 model must distinguish at least:

| State | Meaning |
|---|---|
| `available` | Requested source supplied a usable value. |
| `unposted` | Expected dynamic data has not yet appeared for the current game state. |
| `present-empty` | Source returned the collection/group with no entries or splits. |
| `omitted` | Successful response did not contain the requested property. |
| `unsupported` | Capability matrix says the source/concept is not supported in this context. |
| `ambiguous` | Source returned multiple candidates without a safe selection rule. |
| `partial` | Some requested entities/chunks/sides succeeded and others failed or were missing. |
| `failed` | Request, parsing, or validation failed. |
| `stale` | A retained value is older than the accepted freshness policy. |

An ordinary missing value is not enough to represent these states. Empty player stat splits, omitted MiLB depth-chart rosters, present-empty officials, a failed People chunk, and an invalid logo are semantically different.

## 7. Required provenance contract

Build 003 should design a versioned model that can attach the following metadata at source-result and selected-value granularity without duplicating full raw responses.

### Source-result provenance

```text
sourceId
endpointFamily
requestScope / context keys
requestedAtUtc
retrievedAtUtc
effectiveStart? / effectiveThrough?
gameStateAtRetrieval?
responseStatus
availabilityState
errorCode? / errorSummary?
evidence or cache age?
```

### Selected-value provenance

```text
selectedSourceId
sourcePath or concept key
effectiveThrough
selectionReason
fallbackUsed
rejectedCandidates[]
derivationInputs[]
availabilityState
```

The model need not wrap every scalar in a verbose object. Build 003 may use shared provenance references, source-result registries, and family-level metadata, provided mixed-source/mixed-cutoff values can identify their actual source and effective cutoff.

## 8. Refresh, cache, and request-planning requirements

- Schedule refreshes should be milestone/status driven; Build 002 does not establish universal minute-based timing.
- Feed remains lazy unless a consumer requires officials or another feed-owned concept; it should be refreshable rather than permanently reused without age/state checks.
- Roster, People, Coaches, Standings, Venue, and assets need cache keys containing every semantic request parameter, not a generic source name.
- Partial People chunk success may be retained only with per-person/per-chunk availability. Failed chunks must not become zero statistics.
- Current logo refresh is independent of saved game data and may honor its HTTP cache metadata.
- No normalized snapshot should be persisted until schema versioning, migrations, source-result provenance, and freshness rules exist.

## 9. Unresolved validations and blocker status

No remaining Build 002 validation blocks core model design.

| Validation | What it can still change | Blocker status |
|---|---|---|
| Ordinary same-game Schedule/officials milestones | Refresh cadence and confidence in `unposted` transitions | Non-blocking; model already represents state/availability. |
| Live delayed or suspended game | Additional raw status tuples and refresh behavior | Non-blocking; raw tuple and unknown canonical mapping are preserved. |
| Real future doubleheader transition | Refresh ordering and mixed-cutoff verification | Non-blocking; precedence and derivation provenance are defined. |
| Between-games roster transaction | Whether a stronger game-specific membership source is later needed | Non-blocking; current calendar-date limitation is explicit. |
| Live simultaneous two-way roles | Role-view validation | Non-blocking; shared identity with independent views is required now. |
| Live neutral-site transition | Refresh behavior for venue/timezone changes | Non-blocking; IANA timezone and game-specific identity are retained. |
| Future/pregame MiLB games | Publication timing and product support confidence | Non-blocking for schema; required before broad product claims. |
| People chunk failure over 100 IDs | Retry/partial-success tuning | Non-blocking if partial and failed states are modeled. |

## 10. Build 003 handoff priorities

1. Define a versioned normalized model and compatibility boundary without carrying the misleading `gamePack` source label forward.
2. Define shared competition, source-result, availability, cutoff, and selected-value provenance types.
3. Specify adapter inputs/outputs and capability gating before changing request orchestration.
4. Encode the precedence table as contract tests against representative fixtures, including mixed-cutoff Game 2 and two-way identities.
5. Map v0.2.0 fields and consumers to the new model, explicitly retaining or retiring compatibility paths.
6. Define cache/freshness keys and snapshot migration rules before persistence work.

Production implementation, new UI fields, logo placement, PDF image embedding, and opportunistic live monitoring remain outside this closure decision.

