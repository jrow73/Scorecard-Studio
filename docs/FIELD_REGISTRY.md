# Scorecard Studio — Field Registry

Status: Build 010 active contract. Build 009 scalar registry is accepted; Build 010 adds the starting-lineup repeated-field slice and repeated-block placement foundation. Target: complete v0.2.0 traditional pregame field library. Registry schema version: 1.

## 1. Authority and evidence

This document turns the candidates in `PREGAME_DATA_INVENTORY.md` into a canonical field contract, using `GAME_PACK_FIELD_MATRIX.md` for source evidence and `AI.md` for architecture constraints. It governs field identity and collection semantics; the inventory remains the discovery backlog and the matrix remains fixture evidence. See [BUILD_009_IMPLEMENTATION.md](BUILD_009_IMPLEMENTATION.md) for the deliberately smaller implementation slice.

The supplied attachments precede the documentation refresh described in the “Plan Web Pivot” conversation. This contract incorporates that conversation's Build 008 findings: Game Day exists; coaches and standings were browser-tested; historical player season statistics and date-appropriate managers were tested, including a manager change. Those are reported observations, not newly executed tests or an API guarantee. The matrix's gamePk 822955 fixture verifies a single pregame snapshot. Early-day completeness, umpire timing, MiLB consistency, and exact historical cutoff semantics remain unproven.

## 2. Separate data, fields, and placements

1. The normalized model stores typed pregame values and availability/provenance independently of API shape.
2. The registry declares what a field means, its normalized path or resolver, dependencies, type, category, and collection context.
3. A mapping instance selects a field, optional row, and rendering instructions for one location in one layout.

**Any registry field may be mapped zero, one, or many times in the same layout, including on the same page.** Each placement has a unique mapping ID. Never key mappings by field ID, remove a field from the catalog after placement, or enforce uniqueness on `(field, row)`. Selecting fields for a layout is a convenience filter, not a one-use allocation. Deleting or editing one mapping must not affect another mapping of the same field.

Team full name, location name, short name, club name, and abbreviation are distinct semantic fields. A layout may use all five. Location is MLB's location value, not a promise of the geographic city or the marketing name: the fixture has Tampa Bay's location as St. Petersburg and short name as Tampa Bay. Label it “Location,” not “City only.”

## 3. Registry contract

Each definition contains:

| Property | Contract |
|---|---|
| `id` | Stable canonical identifier; never an API path or translated UI label |
| `label`, `category`, `order` | Human label, grouped catalog category, deterministic display order |
| `valueType` | `text`, `integer`, `decimal`, `boolean`, `date`, `instant`, `innings`, or `gamesBack` |
| `kind` | `atomic`, `derived`, or `composite` |
| `cardinality` | `single` or `repeated`; repeated is independent of kind |
| `path` / `resolver` | Atomic normalized path, or named pure resolver; no network or DOM access |
| `dependencies` | Canonical field dependencies; acyclic, transitive, same row context unless explicitly stated |
| `sourceRequirements` | Adapter requirement keys such as `gamePack`, `coaches`, `standings`; derived from dependencies for composed fields |
| `collection` | Repeated collection descriptor and allowed selectors, otherwise absent |
| `defaultFormat` | Presentation defaults only; overridden independently per mapping |
| `availability` | Catalog capability: `supported`, `planned`, or `unverified`; distinct from a game's missing values |
| `introducedIn`, `aliases` | Version provenance and explicit legacy aliases, if any |

Atomic means one normalized fact, even if an adapter renamed a key or converted its type. Derived means deterministic selection/calculation from facts, such as defense assignment. Composite means display composition of multiple values, such as W-L. A repeated name is atomic + repeated; a repeated slash line is composite + repeated. Objects and arrays are internal structures, never implicitly stringified PDF fields.

Example declaration (illustrative ES-module structure):

```js
{
  id: 'away.lineup[].stats.slashLine',
  label: 'Away Lineup — AVG / OBP / SLG',
  category: 'Away / Lineup / Batting', order: 40,
  valueType: 'text', kind: 'composite', cardinality: 'repeated',
  resolver: 'battingSlashLine',
  dependencies: ['away.lineup[].stats.avg', 'away.lineup[].stats.obp',
                 'away.lineup[].stats.slg'],
  sourceRequirements: ['gamePack'], collection: 'away.lineup',
  defaultFormat: { separator: '/' },
  availability: 'planned', introducedIn: 'v0.2.0'
}
```

Definitions can be generated from family templates. The runtime catalog expands `{side}` to exactly `away` and `home`; no literal `{side}` is persisted. `[]` is a stable repeated-field token, not executable JavaScript. Registry lookup uses known descriptors and validated selectors, never `eval` or arbitrary object traversal supplied by a layout.

## 4. Normalized model and resolution

```text
schemaVersion
context { gamePk, season, sportId, selectedDate, retrievedAt }
game { date, startTime, dayNight, type, number, venue, weather, umpires }
away / home {
  team, manager, coaches,
  lineup[9], startingPitcher, bench[], bullpen[], defense
}
standings { groups[] }
meta { fields, collections, sources }
```

Atomic leaf IDs equal paths below. Composite IDs are virtual resolver paths and need not be stored. `game.startTime` is the scheduled ISO instant, while `game.date` is the official date-only string; never parse a date-only string into a timezone-shifted day. Preserve null for missing values; never turn absence into zero, an empty object, or “TBD.” Uniform numbers are strings. Rates are finite decimal values with conventional formatter defaults (AVG/PCT three decimals, ERA/WHIP two); retain source text in provenance where needed. Innings pitched uses baseball notation, not a decimal fraction: `154.2` means 154 innings and two outs. Validate it and use outs for any arithmetic. Games-back values are tagged numeric/leader/not-applicable/unknown; raw `-` alone does not prove leader or zero.

`resolveField(model, fieldId, selector)` returns `{ value, state, reason, provenance }`. States: `available`, `partial`, `missing`, `notRequested`, `error`, `unsupported`. An invalid/unknown ID or selector is an explicit diagnostic, never executed or silently rebound. Derived/composite results propagate dependency status. Missing values render blank by default; diagnostics remain visible in the UI, not printed into the PDF. Optional mapping placeholders may be offered later. Valid zero and false remain available. Failed supplemental requests cannot erase Game Pack values.

Store source, response path, selected date, retrieval time, season/stat scope, and known cutoff limitations in metadata; keep them out of field identity. A snapshot is bound to its gamePk/date. Reject stale async results after selection changes.

## 5. Complete family catalog

The tables and leaf lists below are exhaustive for this version's traditional registry. Each comma-separated leaf expands to a distinct field. All `{side}` families must have identical Home/Away definitions, types, formatting capabilities, and availability policy. Runtime values may differ in completeness. Internal IDs are join keys, hidden from the normal field picker.

### Game, venue, weather, and umpires

| Canonical ID or leaf family | Kind / type | Source and meaning |
|---|---|---|
| `game.date` | atomic / date | `gameData.datetime.officialDate` |
| `game.startTime` | atomic / instant | `gameData.datetime.dateTime`; scheduled, never actual first pitch |
| `game.dayNight`, `game.type` | atomic / text | `datetime.dayNight`, `game.type` |
| `game.number` | atomic / integer | `gameData.game.gameNumber`; within day's scheduled games |
| `game.venue.name` | atomic / text | `gameData.venue.name` |
| `game.venue.capacity` | atomic / integer | `venue.fieldInfo.capacity` |
| `game.venue.turfType`, `.roofType` | atomic / text | `venue.fieldInfo` |
| `game.venue.city`, `.state`, `.country` | atomic / text | Matching `venue.location` properties when supplied; country conditional |
| `game.venue.timeZone` | atomic / text | `venue.timeZone.id`; IANA identifier when supplied |
| `game.venue.dimensions.leftLine`, `.leftCenter`, `.center`, `.rightCenter`, `.rightLine` | atomic / integer | Corresponding `venue.fieldInfo` distance fields; feet |
| `game.weather.temperature` | atomic / decimal | `gameData.weather.temp`; Fahrenheit input |
| `game.weather.condition`, `.wind` | atomic / text | `gameData.weather.condition`, `.wind`; preserve wind text, do not invent parsed speed/direction |
| `game.weather.summary` | composite / text | temperature + condition + wind; omit absent component and its punctuation |
| `game.umpires.home.name`, `.first.name`, `.second.name`, `.third.name` | atomic / text | `liveData.boxscore.officials[]`, matched by `officialType`, never array order |
| `game.umpires.additional[].name`, `.role` | atomic / text, repeated | Remaining officials with explicit role; source order, ID deduplication |

Internal: `game.id`, `game.venue.id`, each umpire `.id`, feed status and timing. Umpire objects contain `id`, `name`, `role`. Additional official roles are not coerced into one of the four bases. Availability before first pitch is conditional. Venue location leaf names must be validated against the actual payload during adapter implementation; the fixture matrix only establishes `location.*`.

### Team identity, records, and standings context

| Prefix / leaves | Kind / type | Source |
|---|---|---|
| `{side}.team`: `name`, `locationName`, `shortName`, `clubName`, `abbreviation` | atomic / text | `gameData.teams.{side}`; clubName falls back to teamName only |
| `{side}.team.league.name`, `{side}.team.division.name` | atomic / text | Same team's league/division objects |
| `{side}.team.record`: `gamesPlayed`, `wins`, `losses` | atomic / integer | Same team's `record` |
| `{side}.team.record.pct` | atomic / decimal | `record.winningPercentage`; do not recompute by default |
| `{side}.team.record.display` | composite / text | wins + losses, default `W-L` |
| `{side}.team.record.divisionLeader` | atomic / boolean | Feed flag, when supplied |
| `{side}.team.standings`: `divisionRank`, `leagueRank`, `wildCardRank` | atomic / integer | Date-scoped Standings response; league/wild-card rank conditional |
| `{side}.team.standings`: `divisionGamesBack`, `leagueGamesBack`, `wildCardGamesBack` | atomic / gamesBack | Standings; feed placeholders are insufficient |
| `{side}.team.standings.streak` | atomic / text | Standings streak code; retain direction/count in adapter metadata if supplied |
| `{side}.team.standings.last10.wins`, `.losses` | atomic / integer | Standings last-ten split |
| `{side}.team.standings.last10.display` | composite / text | last10 wins + losses; do not assume ten completed games |

Internal: `{side}.team.id`, league/division IDs. The inventory's ambiguous `team.standings.gamesBack` is a documented alias of `divisionGamesBack`; `team.standings.last10` aliases `last10.display`. No arithmetic across standings contexts.

### Personnel

`{side}.manager.name` and `.number` are atomic text, with internal `.id`. Source: date-scoped Coaches API, matched by manager job/role, not first roster entry. Manager number may be absent. Ambiguous multiple managers produce missing/ambiguous status rather than arbitrary selection.

`{side}.coaches.bench[]`, `.hitting[]`, `.pitching[]`, `.other[]` are repeated personnel collections. Each expands leaves `name`, `number`, `role` (atomic text) and internal `id`. Match explicit source jobs; preserve multiple coaches within one role, sort by normalized role then name then ID, and do not invent role assignments. Manager is excluded from these lists. Hitting coaches are not constrained to one person. Bench/pitching collections also tolerate co-coaches. Role-specific availability must be verified; Build 008 primarily demonstrated manager retrieval.

The inventory's singular `coaches.bench.name` and `coaches.pitching.name` are superseded draft paths, not automatic aliases to the first person. A scalar placement must explicitly select a row or compose the collection in a future UI.

### Shared player leaves

For each player-bearing prefix `P` below, register atomic text leaves:

```text
P.player.name                 P.player.number
P.player.firstName            P.player.lastName
P.player.useName              P.player.useLastName
P.player.boxscoreName         P.player.firstLastName
P.player.lastFirstName        P.player.initLastName
P.player.lastInitName         P.player.nameSuffix
P.player.nameTitle            P.player.pronunciation
P.player.bats                 P.player.throws
P.player.primaryPosition.abbreviation
P.player.primaryPosition.name
P.position.abbreviation       P.position.name
```

Internal `P.player.id` joins shared player metadata. Name variants are actual source facts; name-format selection on a mapping may choose those facts without changing the mapping's field ID. Never reconstruct culturally complex names by splitting the full name. If a selected variant is absent, use full name and signal fallback in preview; explicitly mapping the absent variant itself follows the normal missing-value rule.

Sources: `gameData.players.ID{id}` properties from the matrix, plus boxscore `person.fullName`, `jerseyNumber`, and `position`. `player.name` prefers metadata fullName then boxscore person.fullName; `player.number` prefers game-specific jerseyNumber then primaryNumber. `firstLastName` may use nameFirstLast as an equivalent source fallback. Primary position and game assignment are different facts; never replace an unknown lineup assignment with primary position silently. Optional pronunciation/suffix/title remain null when absent.

Prefixes:

| P | Cardinality and stat family |
|---|---|
| `{side}.lineup[]` | repeated, batting |
| `{side}.bench[]` | repeated, batting |
| `{side}.startingPitcher` | single, pitching |
| `{side}.bullpen[]` | repeated, pitching |
| `{side}.defense.{position}` | single, derived role view; shared player leaves, no separate stat family |

Lineup and defense `position` means posted pregame assignment. Bench/bullpen position uses the pregame boxscore designation when present and may explicitly fall back to primary position with provenance. Starting pitcher position is the selected pitching role. `P.identity` is a composite of number + name + position, default `#44 Julio Rodríguez CF`; punctuation for missing components is omitted.

### Batting season/YTD family

Apply to `P.stats` for lineup and bench. All leaves are atomic unless marked composite. Source is only `liveData.boxscore.teams.{side}.players.ID{id}.seasonStats.batting`.

| Normalized leaves | Type | Raw property differences |
|---|---|---|
| `gamesPlayed`, `plateAppearances`, `atBats`, `hits`, `runs`, `doubles`, `triples`, `homeRuns`, `rbi`, `stolenBases`, `caughtStealing`, `totalBases`, `hitByPitch`, `sacBunts`, `sacFlies` | integer | Same raw names |
| `walks`, `strikeouts` | integer | `baseOnBalls`, `strikeOuts` |
| `avg`, `obp`, `slg`, `ops`, `babip`, `atBatsPerHomeRun` | decimal | Same raw names |
| `slashLine` | composite / text | AVG / OBP / SLG |
| `compact` | composite / text | slashLine + homeRuns + rbi; default `.284/.351/.492 • 18 HR • 67 RBI` |

For slashLine, require all three components; missing one makes the result missing rather than a misleading shortened ratio. Compact omits an unavailable labeled segment. Do not derive OPS or rates from rounded components when source values are absent in this version.

### Pitching season/YTD family

Apply to `P.stats` for startingPitcher and bullpen. Source is the same player's `seasonStats.pitching`, never current-game `stats.pitching`.

| Normalized leaves | Type | Raw property differences |
|---|---|---|
| `gamesPlayed`, `gamesPitched`, `gamesStarted`, `wins`, `losses`, `hits`, `runs`, `earnedRuns`, `homeRuns`, `saves`, `saveOpportunities`, `holds`, `blownSaves` | integer | Same raw names; hits/runs/HR are allowed |
| `walks`, `strikeouts` | integer | `baseOnBalls`, `strikeOuts` |
| `era`, `whip`, `winPercentage`, `strikeoutWalkRatio`, `strikeoutsPer9Inn`, `walksPer9Inn`, `hitsPer9Inn`, `homeRunsPer9`, `pitchesPerInning` | decimal | Same raw names |
| `inningsPitched` | innings | Preserve baseball notation |
| `opponentAvg` | decimal, unverified | Reserved candidate; no verified source or safe denominator established; unavailable, no automatic request |
| `record` | composite / text | wins + losses, both required |
| `compact` | composite / text | record + ERA + WHIP; omit missing labeled segments |

`gamesPlayed` and `gamesPitched` remain distinct source fields. Player stats refer to the selected game's embedded season/YTD context, not a new full-season/current-day lookup. A two-way player's batting and pitching statistics occupy the appropriate role views and share player ID without overwriting each other.

### Defensive alignment

Expand `{position}` to `pitcher`, `catcher`, `firstBase`, `secondBase`, `thirdBase`, `shortstop`, `leftField`, `centerField`, `rightField`, `designatedHitter`. Derive role views for each side from that side's posted starting lineup and selected probable starter. Do not treat primary position as defensive assignment. DH is a batting role, not a fielder. Multiple candidates at one position are ambiguous; leave that role unresolved.

The matrix verifies `liveData.linescore.defense`, but it represents one current defense and can change during play. It must not populate both teams or replace pregame assignments. Only an explicitly side-identified pregame snapshot may be used as corroborating input. `allPositions[]` from a completed game is not a starting assignment source.

### Standings blocks

Canonical collection: `standings.groups[].rows[]`. A mapping selects one group with `{ scope: 'division' | 'league' | 'wildCard', reference: 'away' | 'home' }`; the adapter resolves the corresponding league/division ID for the selected game. A layout must specify scope: an unqualified `standings[]` cannot silently choose a division. Wild-card groups are conditional on supported source data.

Each row registers `team.name`, `team.locationName`, `team.shortName`, `team.clubName`, `team.abbreviation` (atomic text, null if the response lacks the variant), `wins`, `losses`, `rank` (atomic integer), `pct` (atomic decimal), `gamesBack` (atomic tagged gamesBack), `streak` (atomic text), `last10.wins`, `last10.losses` (atomic integer), `record`, `last10.display` (composite text). All are repeated. IDs are `standings.groups[].rows[].<leaf>`. Internal group scope/IDs and row team ID are required. Source: Standings teamRecords, with record type and scope retained. Do not combine one group's rank with another's GB. Do not add team-metadata calls to fill optional name forms in Build 009.

Sort by numeric rank then source order then team ID; retain tied ranks. Row selection means row position, not favorite team. Group resolution is contextual, not based on whichever response arrived first. The inventory's `standings[].*` paths are superseded drafts requiring explicit scope on import, not executable aliases.

## 6. Collection and identity semantics

### Lineup

- Normalize exactly nine slot containers in batting-order order. Array index 0 is batting slot 1. Field ID `away.lineup[].player.name` plus selector `{ slot: 1 }` resolves `away.lineup[0].player.name`; indices are not part of canonical field identity.
- Each slot has `battingOrder` (derived integer 1–9), nullable player/position/stats, and slot availability. Collection status distinguishes `notPosted`, `partial`, `posted`, and `unavailable`. A roster is not a posted lineup.
- Prefer the pregame battingOrder ID list and corroborating original-order codes (`100`, `200`, etc.). Validate duplicates and slots. Do not collapse missing slots or shift later batters upward. For historical feeds containing substitutes, select original starters using explicit original-order evidence; if unrecoverable, mark the slot unavailable rather than using the latest occupant.
- A mapping binds to the slot for each selected game, not to the player from the Designer sample. A pitcher who also bats may appear both here and at startingPitcher. Preserve the shared ID.

### Starting pitcher

Prefer `gameData.probablePitchers.{side}`; retain internal designation `probable` or `confirmed` only when evidence supports it. Missing probable pitchers remain missing. Never choose the first member of a completed game's pitchers-used list as a generic fallback. A full name supplied there can resolve even if detailed metadata/stat rows are missing.

### Bench and bullpen

- Source membership is `boxscore.teams.{side}.bench` / `.bullpen` in a pregame context. Join by player ID, never name. Deduplicate IDs within each collection, preserve source order, exclude posted lineup players from bench and selected starter from bullpen. Do not globally deduplicate across different roles; two-way players may legitimately occupy more than one view.
- An absent list is unavailable, not an empty confirmed collection. A present empty list can be known empty. Preserve a placeholder member if its ID is listed but metadata is missing; later members must not shift because of a failed join.
- A historic list may reflect later substitutions or usage. Do not infer the original bench by subtracting final lineup from a current roster. Use reconstructable pregame membership or mark uncertain/unavailable with provenance.
- Selection is `{ row: 1 }` for the first normalized member, not player ID. Collection size is variable; never assume four bench players or a fixed bullpen size from the fixture.

### Repeated placement contract (later v0.2.0 UI)

Single-row bindings use one-based `slot` or `row`. A repeated block specifies collection, optional standings group, start row, capacity, and row step in PDF points. All columns share the same row selection/order. Start coordinates remain page percentages; later rows add physical point offsets converted using page height. No browser-pixel spacing is persisted.

Fewer members than capacity leave blank rows. More members than capacity trigger a visible overflow warning; default behavior requires the user to adjust the block or explicitly accept truncation before generation. Never silently drop members, wrap into unrelated fields, or create pages. Multiple separately placed blocks can explicitly continue at a later start row. Sorting and overflow choices belong to the block instance, not field identity. Build 009 defines this contract but does not implement its editor or rendering.

## 7. Hydration and source adapters

| Requirement | Inputs / source | Trigger and boundaries |
|---|---|---|
| `gamePack` | Selected gamePk; `/api/v1.1/game/{gamePk}/feed/live` | Existing base retrieval; source for game/team/record/players/season stats/venue/weather/officials |
| `coaches` | Team ID, selected official game date, season; `/api/v1/teams/{teamId}/coaches` | Manager/coach dependencies; reuse Build 008 adapter and its date parameters |
| `standings` | League IDs, season, selected date, standings type; `/api/v1/standings` | Rank/GB/streak/last10/table dependencies; reuse Build 008 adapter |
| Future missing stats fallback | Player IDs and proven date/stat scope | Disabled in Build 009; requires evidence before adding any supplemental player-stat request |

Coaches adapter matches returned roster job/title metadata and maps person.fullName, jerseyNumber and ID. Standings adapter matches records/teamRecords by league/division and team ID, maps ranks/GB/streak and the last-ten split. Exact response extraction must be confirmed against Build 008 code/fixtures, especially split structure, rather than assuming the prose inventory's `lastTen` shorthand is a literal property.

Generation takes the transitive union of mapped dependencies, including composites and all repeated columns. Plan only missing supported sources. Duplicate placements and shared dependencies produce one request per key, not per mapping or row. Coaches cache key includes team/date/season; standings key includes league(s)/date/season/type; Game Pack is keyed by gamePk and freshness. Same-league opponents share standings retrieval. Keep in-flight deduplication, source error state and explicit retry; failed requests are not successful empty cache entries.

Home discovery must not fetch coaches/standings merely because a game is listed. Opening Game Day is a separate explicit hydration action and may request its displayed categories even without a layout. A layout needing only team names/records or embedded player stats produces no supplemental requests. Preview uses a deterministic normalized sample model and the same resolver/formatter, with no live hydration.

Preserve selected-date parameters for historical games. Reported historical tests support date-aware behavior but do not prove strictly before-first-pitch standings cutoffs, doubleheader between-game values, or universal retrospective lineup reconstruction. Preserve the date/cutoff evidence and mark unavailable when necessary; never substitute today's statistics/personnel or derive pregame records from final scores. Do not add an unverified historical reconstruction algorithm in this build.

## 8. Mapping instance and formatting contract

Illustrative target schema, not a mandate to rewrite existing stored layout shape:

```json
{
  "id": "mapping-unique-id",
  "field": "away.team.name",
  "pageIndex": 0,
  "position": { "xPercent": 0.18, "yPercent": 0.08, "anchor": "baseline-left" },
  "format": { "fontSize": 12, "alignment": "left" }
}
```

A second mapping may use the exact same `field`, different ID/page/coordinates/font size. Repeated fields additionally carry `selector`, for example `{ "slot": 1 }`. Registry IDs and selectors define the data; font size in PDF points, font/color, name variant, numeric precision, date/timezone display, alignment, prefix/suffix, separator, template, missing-value policy, and fit behavior belong to each placement (or explicit block defaults). Global preferences may seed defaults but cannot rewrite saved mappings.

Composite defaults are named registry recipes, not stored source strings. Future custom templates may reference only allowlisted fields in the same row/context; their dependency union drives hydration. No arbitrary JavaScript templates. Build 009 supports fixed record/weather recipes needed for its slice. Build 010 reserves `content.type = "field" | "template"` placement semantics but does not implement a custom template editor/parser. W-L requires both values; weather and compact descriptions omit missing components and separators and return partial status. An entirely missing composite renders blank.

Baseline-left and existing Y-axis convention remain unchanged. Alignment/fit work must not change saved anchor meaning. Preserve existing point size and percentage coordinates exactly. New precision/fit controls and conditional colors are later work. Default long text behavior in Build 009 remains the existing renderer's behavior; do not silently introduce shrink-to-fit.

## 9. Compatibility and exclusions

Keep `away.team.name` and `home.team.name` unchanged. `{side}.startingPitcher.name` from conversational shorthand is an explicit alias to `{side}.startingPitcher.player.name`, not a second catalog entry. Concrete draft lineup paths such as `away.lineup[0].player.name` can be converted only by a validated adapter to `away.lineup[].player.name` + slot 1. Persisted storage must be inspected before assuming any such migration is necessary; only the two team-name mappings are proven existing fields.

Preserve unknown mappings and their formatting for round-trip storage, show an unsupported-field warning, and skip unsupported output with an explicit generation notice. Never delete them or guess a replacement. Existing PDF Blobs, IndexedDB layouts, page numbering and baseline anchors must survive. Do not bump or migrate the database solely to add runtime registry definitions.

Excluded visible fields: scores, inning/outs/count, play state, R/H/E/LOB totals, current-game batting/pitching stats, winning/losing pitcher, current-game save, actual first pitch, finish time, duration, and scoring marks. Feed status is internal discovery information, not a printable result. The matrix's verified firstPitch and live defense are not automatic authorization to expose them.

Advanced matchup history, splits, recent windows and broadcaster research remain beyond the traditional v0.2.0/v1.0 scope. Optional fields in this catalog may remain unavailable when upstream data is missing; catalog completeness does not claim universal source availability or complete UI implementation in Build 009.


## 10. Build 010 repeated-block implementation slice

Build 010 makes the first repeated family selectable: `{side}.lineup[]`. The supported per-row leaves are `battingOrder`, `player.number`, `player.name`, `position.abbreviation`, `player.bats`, `stats.avg`, `stats.obp`, `stats.slg`, `stats.ops`, `stats.homeRuns`, and `stats.rbi`, symmetrically for Away and Home. Repeated resolution requires a validated 1-based `{ slot }` selector.

A stored repeated block is separate from scalar mappings and contains a collection ID, layout-defined capacity, PDF page, vertical row geometry, and independent columns. Vertical geometry stores the first-row page percentage and physical row spacing in PDF points; the Designer derives that spacing from user placement of the first and last row. Each column stores its own field/content reference, X percentage, font size, alignment, and alignment-aware baseline anchor.

Existing scalar `baseline-left` mappings retain their exact coordinates and output semantics. Build 010 alignment applies to repeated columns only. Fewer posted members than block capacity leave blank rows. A posted member beyond capacity is an explicit overflow condition in generation status; it is never silently discarded without notice and never causes implicit page creation or whole-block scaling.

The normalized starting-lineup adapter must preserve orders longer than nine when the feed supplies them. It still supplies nine placeholder slots when no longer order is present so MLB lineup gaps remain positionally stable.

Custom free-text/composite templates remain deferred. Build 010 only reserves placement content semantics compatible with a later allowlisted, dependency-aware template parser.
