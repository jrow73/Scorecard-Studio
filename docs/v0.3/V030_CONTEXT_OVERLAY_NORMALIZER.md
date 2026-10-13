# Scorecard Studio v0.3.0 — Context Overlay Normalizer

**Introduced:** Build 004.5  
**Production module:** `js/v030-context-overlay-normalizer.js`  
**Input:** schema-v2 snapshot plus already-retrieved Standings, Feed, Venue, and conditional Boxscore payloads  
**Output:** context-complete normalized schema version 2 snapshot

## 1. Boundary

The normalizer performs deterministic scope validation, source projection, and selected-value precedence. It makes no requests, reads no clock, accesses no storage, and does not connect schema version 2 to the current application.

Each supplied source uses its Build 004.2 semantic input. Execution metadata becomes a Build 004.1 source-result record; selected normalized concepts receive explicit lineage. The complete output is relationally validated.

## 2. Explicitly scoped standings

Standings input consists of:

```text
sportId + leagueIds + standingsType + season + cutoffDate
```

The sport and season must match the selected game. The cutoff is an end-of-day fact and remains separate from retrieval time. Ordinary pregame requests use the prior calendar day; spring and postseason require their explicit standings type.

Every returned `records[]` item becomes one group. Group identity is:

```text
<standingsType>:<sportId>:<leagueId>:<divisionId>
```

Groups and rows retain source order. The normalizer never creates missing divisions, league-wide tables, Wild Card tables, or intraday league state. A selected team row is matched by team ID and, when available, its known division; multiple equally scoped matches remain ambiguous.

Selected-team record and standings values come from the accepted team row. Ordinary game number is derived from prior-cutoff games played plus the selected within-day game number.

### Typed tokens

- rank: raw string plus an integer only when parseable;
- games back: raw string plus leader/ahead/behind/not-applicable/unknown and a number only when numeric;
- elimination: not-eliminated, remaining, eliminated, or unknown; and
- clinch: none, Wild Card, postseason, division, best record, or unknown.

A raw `"-"` games-back token means leader but retains `games: null`. It is not silently converted to numeric zero.

## 3. Variable officials

Feed `liveData.boxscore.officials` maps to `game.umpires.crew` in source order. Each entry retains ID, full name, and source role. No four-person assumption or positional array indexing is used.

Availability remains distinct:

- non-empty returned array → `available`;
- explicit empty array → `present-empty`;
- missing path in a successful response → `omitted`; and
- failed Feed request → `failed`.

Fixed Home/First/Second/Third displays remain later compatibility projections over this collection.

## 4. Extended venue precedence

Schedule remains authoritative for game-specific venue ID and name. Extended detail contains:

- city/state/country;
- IANA timezone;
- capacity, turf, roof; and
- any returned scalar dimensions.

Precedence is:

```text
already-loaded usable Feed detail
→ season-scoped narrow Venue response
→ unavailable
```

When both candidates exist, Feed wins and the Venue result is recorded as rejected. When Feed was loaded for officials but contains no usable venue object, the narrow Venue result wins. Separate subtree lineage covers location, timezone, and field information while preserving Schedule identity.

## 5. Game 2 overlay eligibility

The narrow Boxscore overlay is accepted only when all conditions hold:

1. selected game number is at least 2;
2. Boxscore semantic relationship is `earlierSameDayGame`;
3. related gamePk matches the verified earlier-game context;
4. earlier official date equals the selected game's official date;
5. earlier canonical status is Final; and
6. earlier and selected games contain the same two team IDs.

Any failure raises `IDENTITY_JOIN_FAILED`; response order or a same-team guess cannot enable the overlay.

## 6. Mixed-cutoff precedence

For an eligible overlay:

| Concept | Selected source/effective cutoff |
|---|---|
| selected game state, identity, lineup | selected-game Schedule |
| selected-team record | earlier Game 1 Final Boxscore |
| next team game number | derived from post-Game-1 record |
| returned player stat groups | earlier Game 1 Final Boxscore `seasonStats` |
| ranks, games back, Last 10, markers, groups | accepted prior-day Standings |
| streak | prior-day Standings streak plus one known Game 1 result |

Postgame Boxscore values record valid prior-cutoff Standings or People candidates as rejected. Only player/stat groups actually present in `seasonStats` are overwritten; missing Boxscore groups retain their previous value and provenance.

The streak has no selected source because neither source directly contains the normalized post-Game-1 value. Its lineage records both derivation inputs and the `advance-streak-one-known-result` transformation. Ties or an unknown team result leave the base streak unchanged.

This is intentionally not intraday standings reconstruction. League-wide ranks, games back, Last 10, and groups remain at their explicit end-of-day cutoff.

## 7. Reproducible fixtures

`tools/generate-v030-context-overlay-fixtures.mjs` writes three bounded source cases and outputs:

- `v030-variable-officials-feed-venue-normalized.json`;
- `v030-spring-scoped-standings-normalized.json`; and
- `v030-game2-production-mixed-cutoff-normalized.json`.

Tests regenerate them byte-for-byte, validate them against the full schema, and independently assert crew cardinality/order, venue precedence, spring scoping, typed standings tokens, mixed effective cutoffs, rejected candidates, and invalid-overlay rejection.
