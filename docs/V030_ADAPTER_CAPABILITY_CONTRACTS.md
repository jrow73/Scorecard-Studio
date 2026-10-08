# Scorecard Studio v0.3.0 — Adapter and Capability Contracts

**Introduced:** Build 003.2  
**Normalized-model authority:** `docs/V030_NORMALIZED_MODEL_V2.md`  
**Source-policy authority:** `docs/V030_SOURCE_ADOPTION_DECISIONS.md`  
**Machine-readable registry:** `tests/fixtures/model-contract/v030-adapter-registry.json`

## 1. Contract boundary

Adapters retrieve and minimally interpret one source family. They do not directly construct the final normalized game model, resolve field-registry mappings, decide UI presentation, or silently substitute another adapter.

The layers remain separate:

1. **Planning** selects adapters from consumer capabilities and game context.
2. **Execution** returns a source-result envelope with unit outcomes and normalized candidates.
3. **Normalization policy** joins candidate identities and applies source precedence.
4. **Lineage** records which candidate won, why, its cutoff, and rejected fallbacks.

A successful HTTP response is not the same as an available concept. A successful MiLB depth-chart request can yield an omitted roster; a successful People response can yield empty splits; a feed can return a present-empty officials collection.

## 2. Adapter set

Schema version 2 recognizes exactly these adapter IDs:

| Adapter | Endpoint/asset family | Accepted concepts | Default planning |
|---|---|---|---|
| `schedule` | Schedule with controlled hydration | game/state/dates, competition, teams, original lineup, probable pitchers, weather, venue identity | Core/required for a selected game |
| `feed` | Game Feed | officials; already-loaded extended venue detail; feed state observation | Lazy/consumer or milestone triggered |
| `boxscore` | Game Boxscore | earlier-game postgame player totals and selected-team record | Conditional on a prior same-day game being Final |
| `roster` | Dated active roster | active membership, roster position/status, jersey/person metadata | Core per side/date for bench/pitcher pool |
| `people` | People plus scoped `byDateRange` statistics | person identity and scoped hitting/pitching totals | Batched after relevant IDs are known |
| `coaches` | Dated team Coaches | manager candidates and full coaching staff | Lazy by consumer capability |
| `standings` | Explicitly typed Standings | selected-team standings and returned source groups | Core prior-day regular scope; explicit outside regular season |
| `venue` | Season-scoped hydrated Venue | extended location/timezone/field metadata | Conditional when detail is needed and Feed is unavailable |
| `depthChart` | Team depth chart | optional active-roster-intersected role annotations | Optional; never blocks pitcher groups |
| `teamLogo` | Current team-logo SVG asset | validated current-brand asset reference | Optional asset request |

`gamePack` is not an adapter, request requirement, provenance label, or compatibility alias in schema version 2.

## 3. Request input and semantic-key rules

Every adapter accepts a typed input object and produces a deterministic semantic request key before network execution.

Canonical key format:

```text
<adapter>|v1|<name>=<percent-encoded-value>|<name>=<percent-encoded-value>...
```

Rules:

1. Parameter names use the adapter contract's declared order; callers do not control ordering.
2. Strings use UTF-8 percent encoding.
3. Date-only and UTC instant representations remain distinct.
4. Boolean values are `true` or `false`; integers use base-10 canonical text.
5. Set-like arrays are deduplicated, sorted by their declared canonical comparator, then comma-joined.
6. Ordered arrays are preserved only when order changes source meaning.
7. Optional absent parameters are omitted. Explicit null is allowed only where the input schema assigns it meaning.
8. Defaulted parameters are materialized in the key so a future default change cannot collide with an older request.
9. Secrets, session values, volatile headers, and retrieval time never enter the key.
10. Chunked requests receive one parent operation ID and one request key per chunk.

The key identifies request semantics for deduplication/cache/provenance. It is not necessarily the literal URL.

## 4. Source-result envelope

Every execution returns one envelope:

```text
contractRevision
operationId
adapter
input
requestKey?                  absent only when planning/validation fails before keying
startedAtUtc?
completedAtUtc?
outcome                     success | partial | failed | notRequested
effective
units[]
candidates[]
failures[]
```

### Unit outcomes

One unit is the smallest independently retryable request: one team/date roster, one standings request, one People chunk, or one logo asset. Each unit records:

```text
unitKey
requestKey
outcome                     success | failed | notRequested
requestedAtUtc?
retrievedAtUtc?
response { status?, contentType?, bodySha256? }
error { code, summary, retryable }?
```

The envelope outcome is:

- `success` when every planned unit succeeds, including a valid source response with empty/omitted concepts;
- `partial` when at least one unit succeeds and at least one fails;
- `failed` when validation fails or no planned unit succeeds;
- `notRequested` when planning deliberately suppresses execution.

Do not cache a failed unit as a successful empty response.

### Candidate records

Candidates are normalized source-owned concepts, not final selected values:

```text
concept
targetHint
unitKey
state                       availability vocabulary from schema version 2
sourcePath?
effective
identityKeys
value?                      absent when unavailable
notes[]
```

`targetHint` identifies the intended normalized concept but does not bypass precedence. For example, Feed venue detail and Venue endpoint detail can both emit candidates for `/game/venue`; normalization chooses one and records the loser.

## 5. Capability resolution

Each adapter registry entry contains ordered capability rules plus a required default rule. A rule may constrain:

- sport IDs;
- game types;
- competition segments;
- source state or requested concept; and
- explicitly named prerequisites.

Capability states use the Build 002 matrix vocabulary:

- `supported`;
- `conditional`;
- `absent`; or
- `untested`.

Resolution uses the most-specific matching rule. Equal-specificity conflicts are invalid. The default rule must be last and is normally `untested`, never an optimistic universal support claim.

Capability affects planning and expected availability; it does not fabricate a candidate. An `absent` rule may suppress an optional request when repeated evidence already shows omission, while a diagnostic/manual probe can still execute if explicitly authorized.

## 6. Freshness and refresh policy

Build 002 did not establish universal minute-based TTLs. Adapter contracts therefore use event/scope triggers:

| Adapter | Freshness basis | Refresh/invalidation |
|---|---|---|
| Schedule | selected game state | selection, meaningful status transition, explicit milestone, manual refresh |
| Feed | selected game state and consumer need | first requiring consumer, meaningful status transition, manual refresh |
| Boxscore | prior-game finality | request only after prior game is Final; immutable for the snapshot unless manually refreshed |
| Roster | team + official calendar date | new team/date scope or manual correction |
| People | person set + full stat scope/cutoff | new IDs/scope/cutoff, Game 1 override evaluation, or retry failed units |
| Coaches | team + date + season | new scope or manual correction |
| Standings | sport/league + type + season + end-of-day cutoff | new scope/cutoff or manual correction |
| Venue | venue + season | new venue/season, missing required fields, or manual correction |
| Depth chart | current-only team + season request | on demand/manual; never treated as historical truth |
| Team logo | current asset URL | honor validated HTTP cache metadata; sampled success was 14 days |

Only `teamLogo` has an evidence-backed numeric cache directive. Other numeric TTLs remain implementation configuration to be proposed later, not source truth in this contract.

## 7. Adapter-specific contracts

### Schedule

Required input: `gamePk`, `sportId`, `selectedDate`, `hydrateProfile`. Output candidates include selected view, raw status tuple, dates, competition context, teams, lineups, probable pitchers, weather, and venue identity. If one gamePk returns multiple views, selection emits one deterministic `selectedViewKey` and retains ambiguity/failure if context cannot safely select.

Schedule is core authority, but dynamic fields can be `unposted` or `omitted`. A successful response with no matching view is a failed selection candidate, not a fabricated empty game.

### Feed

Required input: `gamePk`, `profile`. Profiles prevent an unbounded “whatever feed contains” contract. Accepted candidates are officials, feed state observation, and extended venue detail. Officials distinguish omitted, present-empty, and available collections. Feed is not the membership/lineup/statistics authority.

### Boxscore

Required input: `gamePk`, `relationship`, where the accepted production relationship is `earlierSameDayGame`. Planning requires the related game to be Final. Candidate player `seasonStats` and team record retain the earlier gamePk/state as effective scope. Failure leaves People/Standings fallback candidates eligible.

### Roster

Required input: `teamId`, `date`, `rosterType`, `hydrateProfile`. The v0.3.0 accepted roster type is explicit `active`. Candidate membership is calendar-date scoped. Omitted persons are not labeled organizationally absent. Same-date Game 1/Game 2 membership remains unresolved.

### People

Required input: deduplicated `personIds`, `sportId`, `gameTypes`, `statGroups`, `statType`, `startDate`, `endDate`, and `chunkSize`. IDs and set-like scope arrays are canonically sorted for keys.

Partial behavior is mandatory:

1. Partition canonical person IDs into deterministic chunks.
2. Execute chunks independently and retain every successful chunk.
3. Set envelope outcome `partial` when successes and failures coexist.
4. Emit per-person/per-group candidates from successful chunks.
5. Emit `failed` availability for persons assigned only to failed chunks; never emit zero statistics.
6. Preserve valid empty splits as `present-empty`, distinct from chunk failure.
7. Prefer sport `0` / `All`; use one unambiguous split only with fallback provenance; emit `ambiguous` for multiple non-aggregate splits.
8. Retry only failed unit keys unless the semantic input changes.

The initial configured chunk size is 100 because that is current application behavior, not because Build 002 proved a universal API maximum. The value is explicit in every input/key.

### Coaches

Required input: `teamId`, `date`, `season`. Emit every staff row in source order plus manager candidates. Candidate selection recognizes explicit manager job IDs/jobs before a controlled title fallback. Zero or multiple candidates remain missing/ambiguous.

### Standings

Required input: `sportId`, `leagueIds`, `standingsType`, `season`, `cutoffDate`. League IDs are a canonical set. Emit source-faithful records keyed by standings type, sport, league, and division. Preserve raw ranks, games-back, elimination, and clinch tokens. Do not synthesize absent league/Wild Card groups.

### Venue

Required input: `venueId`, `season`, `hydrateProfile`. Accepted profile explicitly requests `location,fieldInfo,timezone`; hydration spelling/case belongs to the adapter. Emit field-level optional values. When an already-loaded Feed candidate is equivalent, planning may suppress this request and lineage selects Feed.

### Depth chart

Required input: `teamId`, `season`. Treat output as current-only. Intersect by person ID with authoritative active membership before emitting usable role annotations. Omitted MiLB roster is `omitted`, not an empty active roster. Depth-chart people never create pitcher membership or replace the selected probable starter.

### Team logo

Required input: `teamId`, `assetProfile`. Validate HTTP success, `image/svg+xml`, SVG root, and `viewBox`; record redirect/CORS/cache metadata as diagnostics. Emit a current-brand asset reference, never SVG body content or historical-brand truth. Failure is isolated from game data and falls back to text/abbreviation.

## 8. Planner capabilities

Consumers request normalized capabilities rather than raw adapters:

| Capability | Typical adapters | Notes |
|---|---|---|
| `corePregame` | Schedule, both Rosters, scoped People, scoped Standings | Required selected-game model; independent side/unit failures remain visible. |
| `officials` | Feed | Lazy and state-sensitive. |
| `extendedVenue` | already-loaded Feed or Venue | Planner avoids redundant Venue request when usable Feed detail exists. |
| `staff` | both Coaches | Lazy; independent away/home outcomes. |
| `pitcherRoles` | Depth chart | Optional annotation; never blocks core pitcher pool. |
| `currentTeamLogos` | Team logo | Optional asset; never blocks normalized game data. |
| `game2Overlay` | related Schedule state plus prior Boxscore | Conditional; applies only after earlier game Final. |
| `standingsGroups` | Standings | Can reuse the core scoped response when it already contains the requested groups. |

Fetch dependencies and selected provenance are deliberately different. A consumer capability can be satisfied from an already-loaded fallback, and a winning value can come from a different adapter than the planner's preferred candidate.

## 9. Error-code families

Adapters use stable diagnostic code families without leaking raw exceptions as contract values:

- `INPUT_INVALID`;
- `CAPABILITY_UNSUPPORTED`;
- `REQUEST_FAILED`;
- `HTTP_STATUS`;
- `CONTENT_TYPE_INVALID`;
- `PARSE_FAILED`;
- `SOURCE_SHAPE_INVALID`;
- `IDENTITY_JOIN_FAILED`;
- `SELECTION_AMBIGUOUS`;
- `MATCHING_VIEW_MISSING`;
- `ASSET_INVALID`.

Each failure also carries a concise summary and `retryable` flag. User-visible wording remains a consumer concern.

## 10. Build 003.3 handoff

The compatibility/migration pass can now map schema version 1 fields to normalized version 2 capabilities and paths without using raw endpoint names as field requirements. It must decide:

- the temporary version-1 projection for existing Home/Game Day/PDF consumers;
- field-registry target paths for scoped statistics and collection roots;
- replacement of `gamePack` requirements with normalized capabilities;
- which schema-version-1 placeholder families become populated, remain deferred, or are removed from compatibility output; and
- version-aware snapshot/cache storage and invalidation.

