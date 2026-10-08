# Scorecard Studio v0.3.0 — Schedule Normalizer

**Introduced:** Build 004.3  
**Production module:** `js/v030-schedule-normalizer.js`  
**Input contract:** Build 004.2 `schedule` adapter  
**Output contract:** normalized schema version 2

## 1. Boundary

The Schedule normalizer consumes an already retrieved hydrated Schedule payload plus the exact semantic selection and deterministic execution metadata. It performs no HTTP, clock read, caching, storage, rendering, or application initialization.

Its output is a complete schema-v2 skeleton. Only Schedule-owned concepts are populated. Required containers owned by later adapters exist in neutral form and carry explicit lineage states; empty structural containers do not falsely claim successful source data.

## 2. API

### `selectScheduleView(payload, selection)`

`selection` is the closed Schedule semantic input:

```text
gamePk
sportId
selectedDate
hydrateProfile = pregame-v1
```

Selection rules:

1. flatten every date bucket without losing bucket/date indexes;
2. match `gamePk` exactly as text;
3. require the containing bucket date to equal `selectedDate`;
4. require exactly one remaining view; and
5. derive `<gamePk>:<bucketDate>:<gameNumber>` as `selectedViewKey`.

No response-order tie-break exists. No same-game view from another date bucket is substituted. Failures use `MATCHING_VIEW_MISSING` or `SELECTION_AMBIGUOUS` and retain bounded candidate summaries for diagnostics.

### `normalizeScheduleSnapshot(payload, selection, execution)`

Execution metadata provides request/retrieval/snapshot timestamps, response status/hash, producer identity, and optional fixture kind. The function does not generate timestamps or random IDs.

The output passes through `createNormalizedSnapshot`, including relational validation and required lineage coverage.

## 3. Status and date policy

The complete available raw tuple is retained:

- `abstractGameState`;
- `codedGameState`;
- `detailedState`;
- `statusCode`; and
- `abstractGameCode`.

Canonical status prioritizes explicit terminal/special meanings before generic Final codes:

1. cancelled;
2. postponed;
3. suspended;
4. delayed;
5. final;
6. live;
7. pregame;
8. scheduled; otherwise
9. unknown.

Dates remain separate:

- original `gameDate` → `originalScheduledStart`;
- `rescheduleDate` → `rescheduledStart`;
- `rescheduleGameDate` → `rescheduledDate`;
- `resumeDate` → `resumeStart`; and
- `resumeGameDate` → normalized `resumeDate`.

`scheduledStart` prefers a known rescheduled start, then original start. When `startTimeTBD` is true in scheduled/pregame/unknown state, `scheduledStart` is null so a placeholder time cannot be displayed. The raw original timestamp remains auditable. A historical Final view keeps its completed-game timestamp even if the source retains a stale TBD flag.

## 4. Competition and teams

Game-type mapping is explicit:

| Source code | Segment |
|---|---|
| `S` | `spring` |
| `R` | `regular` |
| `F` | `wildCard` |
| `D` | `divisionSeries` |
| `L` | `leagueChampionship` |
| `W` | `worldSeries` |

Other non-empty codes map to `other`; missing codes map to `unknown`.

Team identity includes IDs/names, sport, league, division, and a Schedule league record when present. Team game number, typed standings, and logo remain not requested. Placeholder-team flags set `game.status.teamsTBD` without discarding the source identity.

## 5. Lineups and probable pitchers

Hydrated `lineups.<side>Players` retains source order. Slots receive one-based batting order. Publication state is:

- nine or more slots: `posted` / available;
- one through eight slots: `partial`;
- explicit empty array: `notPosted` with `present-empty` lineage; or
- missing path: `notPosted` with `unposted` lineage.

The normalizer never fills a missing lineup from roster membership. Primary position is retained as an explicitly labeled Schedule projection, not represented as authoritative in-game defensive alignment.

Probable pitchers populate `startingPitcher` identity/position only. Their `stats` object is empty with an exact `not-requested` lineage override. Missing probable pitchers remain null/omitted; they are not selected from roster pitchers.

## 6. Source boundaries

Schedule-owned values:

- selected competition/game context;
- raw/canonical status and dates;
- team identity and Schedule league record;
- probable-pitcher identity;
- original lineup publication/order;
- Schedule weather; and
- venue ID/name.

Explicitly not owned in Build 004.3:

- officials;
- extended venue location/timezone/field details;
- player statistics;
- roster-derived bench and pitcher groups;
- manager/coaches;
- depth-chart annotations;
- team standings and returned standings groups; and
- logos.

Exact lineage overrides prevent the containing Schedule-owned subtree from making those neutral placeholders appear available.

## 7. Reproducible fixtures

`tools/generate-v030-schedule-contract-fixtures.mjs` creates:

- the bounded ordinary/missing source cases;
- an ordinary posted-lineup normalized output; and
- a missing-lineup normalized output.

Tests require byte-for-byte reproduction and validate both outputs against the full schema-v2 machine contract. Lifecycle tests additionally consume the captured multi-view postponed/rescheduled evidence without modifying it.
