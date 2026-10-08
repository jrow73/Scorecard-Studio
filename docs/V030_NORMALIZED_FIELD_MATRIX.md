# Scorecard Studio v0.3.0 — Normalized Field Matrix

**Build:** 001.2  
**Observed implementation:** committed Scorecard Studio v0.2.0  
**Audit date:** 2026-10-05  
**Companion:** `docs/V030_DATA_SOURCE_AUDIT.md`  
**Baseline SHA-256:** `D1726D62573A72A54FA8395598AEFD8C644CDDA753CCE8E753473E4CC67B54BE`

## 1. Purpose and authority

Build 001.1 traced the system from request to consumer. This document reverses that view and traces every executable field family from normalized concept back to its real sources and forward to its consumers.

This matrix is authoritative for:

- the fields and collections that v0.2.0 can actually resolve;
- the real source hierarchy behind each field family;
- active versus compatibility-only catalog status;
- normalized values that exist but are not separately exposed;
- documented concepts that are not implemented; and
- the source/provenance vocabulary recommended for later v0.3.0 design.

It does not change the runtime registry, normalized schema, historical documentation, or application behavior.

## 2. Method and notation

The executable evidence is `normalize.js`, `field-registry.js`, `formatter.js`, `field-diagnostic.js`, `slot-content.js`, and their callers in `app.js`.

- `{side}` expands identically to `away` and `home`.
- A row with several comma-separated leaves represents every named executable field, not a proposed wildcard.
- **Active** means `catalog: true`; the Designer can offer the field through Standard or Custom catalogs.
- **Compatibility** means `catalog: false`; `resolveField()` still supports the ID, but the active catalog hides it.
- **Internal/unexposed** means the normalizer produces the value but no independent runtime field ID exposes it.
- **Planned/unimplemented** means a historical document describes the concept but current normalization/registry does not produce it.
- “People” means the bulk, prior-day `byDateRange` request. “Prior boxscore” means the completed earlier same-day game used only for a later game in the same doubleheader context.

The runtime has four explicit legacy aliases:

| Legacy ID | Canonical ID |
|---|---|
| `away.teamName` | `away.team.name` |
| `home.teamName` | `home.team.name` |
| `away.startingPitcher.name` | `away.startingPitcher.player.name` |
| `home.startingPitcher.name` | `home.startingPitcher.player.name` |

## 3. Executable catalog census

| Family | Active | Compatibility | Total |
|---|---:|---:|---:|
| Game, venue, weather, umpires | 21 | 0 | 21 |
| Team identity | 14 | 0 | 14 |
| Team record/game number | 12 | 0 | 12 |
| Selected-team standings | 16 | 0 | 16 |
| Manager | 4 | 0 | 4 |
| Starting pitcher | 18 | 42 | 60 |
| Starting lineup | 36 | 2 | 38 |
| Bench | 32 | 0 | 32 |
| Bullpen | 18 | 8 | 26 |
| **Total** | **171** | **52** | **223** |

Additional catalog facts:

- Active tiers: 64 Standard and 107 Custom.
- Cardinality: 125 scalar fields and 98 repeated fields.
- Declared runtime source requirements: 203 `gamePack`, 16 `standings`, and 4 `coaches`.
- All 223 fields resolve as available or partial against `DESIGNER_SAMPLE_MODEL`, including compatibility fields.

The census proves that the executable field paths are internally coherent. It also quantifies the source-label problem: `gamePack` covers 91% of all fields even though the live feed supplies only a narrow subset in the current production flow.

## 4. Recommended source vocabulary

Build 001.2 uses the following precise terms when describing current behavior and recommends them for later v0.3.0 work:

| Key | Meaning | Current loading mode |
|---|---|---|
| `schedule` | Hydrated selected-date Schedule response and normalized Schedule DTO | Core/eager |
| `roster` | Team roster scoped to `officialDate`, hydrated with person | Core/eager; both teams are hard requirements |
| `peopleStats` | Bulk People metadata and hitting/pitching `byDateRange` through the day before the selected game | Core/eager; soft failure |
| `standings` | Regular-season standings scoped to the day before the selected game | Core/eager; per-league soft failure |
| `priorGameBoxscore` | Completed earlier same-day game's boxscore, used as a Game 2 overlay | Conditional; soft failure |
| `gameFeed` | `/feed/live`, currently used for umpires and richer game/venue fallback | Lazy/on demand |
| `coaches` | Date/season-scoped team coaches response | Lazy/on demand |
| `derived` | Deterministic local selection, exclusion, calculation, composition, or formatting | No request |

`derived` should not be treated as a fetch requirement. It belongs in provenance/transformation metadata. Likewise, a value's **fetch dependencies** and its **selected provenance** are different facts: a player number may be produced from roster, People, or Schedule fallback after the same core loading plan.

## 5. Executable field matrix

### 5.1 Game, venue, weather, and umpires

| Executable field IDs | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `game.date`, `game.startTime`, `game.dayNight`, `game.number` | 4 active | Schedule first; Game Feed fallback | TBD start forces `null`; day/night title-cased; number numeric | Home indirectly, Game Day, Diagnostic, PDF |
| `game.venue.name` | 1 active | Feed-over-Schedule shallow venue merge | Missing becomes `null` in model | Home, Game Day, Diagnostic, PDF |
| `game.venue.city`, `.state`, `.country`, `.capacity`, `.turfType`, `.roofType` | 6 active | Feed-over-Schedule shallow venue merge | State prefers `stateAbbrev`; capacity numeric | Game Day, Diagnostic, PDF; live-PDF hydration currently forces feed for these IDs |
| `game.weather.temperature`, `.condition`, `.wind` | 3 active | Entire Schedule weather object, else Game Feed weather | Temperature numeric; no component-level source merge | Home, Game Day, Diagnostic, PDF |
| `game.weather.summary` | 1 active composite | Dependencies above | Joins available condition, temperature, wind; partial allowed | Diagnostic, PDF/templates |
| `game.umpires.home.name`, `.first.name`, `.second.name`, `.third.name` | 4 active | Game Feed `officials[]` only | Matched by role text, never array position | Game Day, Diagnostic, PDF |
| `game.umpires.crew[].name`, `.role` | 2 active repeated | Game Feed `officials[]` only | Source order preserved; positive slot or semantic role selector required | Game Day, Diagnostic, repeated/individual PDF mappings |

**Registry mismatch:** every row above is labeled `gamePack`. Schedule is the normal primary source for the first 15 fields; only umpires are strictly feed-backed. The weather summary is derived and has no request of its own.

### 5.2 Team identity

| Executable field family | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `{side}.team.name`, `.locationName`, `.shortName`, `.clubName`, `.abbreviation`, `.league.name`, `.division.name` | 14 active (7 per side) | Entire hydrated Schedule team object; Game Feed team only when Schedule team object is absent | `clubName` falls back to `teamName`; other missing leaves remain `null` | Home/Game Day headings/cards, Diagnostic, PDF |

**Registry mismatch:** all 14 fields are labeled `gamePack`, although the selected-game production path uses hydrated Schedule team data.

### 5.3 Team record and game number

| Executable field family | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `{side}.team.record.gamesPlayed`, `.wins`, `.losses`, `.pct` | 8 active (4 per side) | Completed prior same-day boxscore team record; otherwise prior-day Standings | Games played prefers W + L; PCT parsed, not recomputed | Game Day, Diagnostic, PDF |
| `{side}.team.record.display` | 2 active composites | Record wins + losses | Missing unless both components exist | Diagnostic, PDF/templates |
| `{side}.team.gameNumber` | 2 active | Record plus Schedule within-day number | Prior-day games played + Schedule game number; after completed Game 1, post-Game-1 games played + 1 | Diagnostic, PDF |

**Registry mismatch:** all 12 fields are labeled `gamePack`. Their actual source set is `standings`, optionally overridden by `priorGameBoxscore`, plus `schedule` and `derived` for game number/display.

### 5.4 Selected-team standings context

| Executable field family | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `{side}.team.standings.divisionRank`, `.leagueRank`, `.wildCardRank`, `.divisionGamesBack` | 8 active (4 per side) | Prior-day Standings | Numeric ranks; games back retained as source scalar/text | Game Day, Diagnostic, PDF |
| `{side}.team.standings.streak` | 2 active | Prior-day Standings, then completed earlier-game Schedule result overlay | Same direction increments; opposite result resets; ties/unknown leave base unchanged | Game Day, Diagnostic, PDF |
| `{side}.team.standings.last10.wins`, `.losses`, `.display` | 6 active (3 per side) | Prior-day Standings | Finds `lastTen` split; display requires W and L | Game Day, Diagnostic, PDF |

The `standings` requirement is accurately named for these 16 fields, but current fetch behavior is not lazy: selected-game core hydration requests standings before any layout is chosen. For Game 2, only streak receives an intraday overlay; rank, games back, and Last 10 remain prior-day facts.

### 5.5 Manager

| Executable field family | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `{side}.manager.name`, `.number` | 4 active (2 per side) | Coaches response; exact `manager` job/title, then first entry containing “manager” | First match wins; absent source returns a null-valued manager object | Game Day, Diagnostic, PDF |

The `coaches` requirement is accurately named. The prose contract's ambiguous-manager state is not implemented, and no other coaching personnel are normalized.

### 5.6 Starting pitcher

| Executable field family | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `{side}.startingPitcher.player.name`, `.number`, `.throws` | 6 active (3 per side) | Membership from Schedule probable pitcher; metadata People → roster → Schedule; number specifically roster jersey → People/base primary number | Missing probable means the entire record is `null`; no pitchers-used fallback | Home, Game Day, Diagnostic, PDF |
| `{side}.startingPitcher.stats.gamesStarted`, `.wins`, `.losses`, `.record`, `.era`, `.whip` | 12 active (6 per side) | Completed prior-game boxscore `seasonStats`; otherwise prior-day People aggregate | Record requires W and L; numeric rates parsed | Game Day, Diagnostic, PDF |
| `{side}.startingPitcher.stats.gamesPlayed`, `.gamesPitched`, `.inningsPitched`, `.hits`, `.runs`, `.earnedRuns`, `.homeRuns`, `.walks`, `.strikeouts`, `.saves`, `.saveOpportunities`, `.holds`, `.blownSaves`, `.winPercentage`, `.strikeoutWalkRatio`, `.strikeoutsPer9Inn`, `.walksPer9Inn`, `.hitsPer9Inn`, `.homeRunsPer9`, `.pitchesPerInning`, `.compact` | 42 compatibility (21 per side) | Same stat precedence as active pitcher fields | All leaves are normalized; compact resolver joins record/ERA/WHIP and can be partial | Existing compatible mappings/templates; hidden from active catalog |

**Registry mismatch:** all 60 IDs are labeled `gamePack`, but the feed supplies neither membership nor live production stats in the active normalizer. The real source set is `schedule`, `roster`, `peopleStats`, optional `priorGameBoxscore`, and `derived`.

### 5.7 Starting lineup

| Executable field family | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `{side}.lineup[].player.number`, `.name`, `.bats` | 6 active (3 per side) | Membership/order from Schedule; metadata People → roster → Schedule; number favors roster jersey | Empty Schedule lineup produces `[]`; player IDs join records | Home, Game Day, Diagnostic, repeated/individual PDF mappings |
| `{side}.lineup[].position.abbreviation`, `.name`, `.number`, `.player.primaryPosition.abbreviation`, `.player.primaryPosition.name` | 10 active (5 per side) | Today's assignment from Schedule lineup person; primary position from People/roster/Schedule metadata | Recognized assignment abbreviation derives full name and traditional number; `DH` remains text | Home, Diagnostic, PDF |
| `{side}.lineup[].stats.avg`, `.obp`, `.slg`, `.ops`, `.homeRuns`, `.rbi`, `.gamesPlayed`, `.plateAppearances`, `.stolenBases`, `.slashLine` | 20 active (10 per side) | Completed prior-game boxscore; otherwise prior-day People aggregate | Slash line requires AVG/OBP/SLG; values parsed to numbers except composed text | Game Day, Diagnostic, PDF |
| `{side}.lineup[].battingOrder` | 2 compatibility (1 per side) | Schedule array order | Derived as one-based array index | Existing compatible mappings; hidden from active catalog |

**Registry mismatch:** all 38 IDs are labeled `gamePack`. Current live-feed batting order, boxscore players, and embedded stats are not used.

### 5.8 Bench

| Executable field family | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `{side}.bench[].player.number`, `.name`, `.bats`, `.player.primaryPosition.abbreviation`, `.player.primaryPosition.name`, `.position.abbreviation` | 12 active (6 per side) | Membership from dated roster; metadata People → roster; lineup IDs from Schedule | Only when lineup exists: roster non-pitchers minus lineup IDs; sorted by player name | Home, Game Day, Diagnostic, repeated/individual PDF mappings |
| `{side}.bench[].stats.avg`, `.obp`, `.slg`, `.ops`, `.homeRuns`, `.rbi`, `.gamesPlayed`, `.plateAppearances`, `.stolenBases`, `.slashLine` | 20 active (10 per side) | Completed prior-game boxscore; otherwise prior-day People aggregate | Same batting normalization as lineup | Game Day, Diagnostic, PDF |

**Registry mismatch:** all 32 IDs are labeled `gamePack`. Membership is a `roster + schedule + derived` result, and statistics are `peopleStats` or `priorGameBoxscore`.

### 5.9 Bullpen

| Executable field family | Count/status | Normalized source and precedence | Transformation / availability | Consumers |
|---|---:|---|---|---|
| `{side}.bullpen[].player.number`, `.name`, `.throws` | 6 active (3 per side) | Membership from dated roster; starter ID from Schedule; metadata People → roster | Roster pitchers minus selected starter, or all pitchers when starter missing; sorted by name | Home, Game Day, Diagnostic, repeated/individual PDF mappings |
| `{side}.bullpen[].stats.record`, `.era`, `.whip`, `.gamesStarted`, `.wins`, `.losses` | 12 active (6 per side) | Completed prior-game boxscore; otherwise prior-day People aggregate | Record is precomposed during normalization | Game Day, Diagnostic, PDF |
| `{side}.bullpen[].stats.inningsPitched`, `.strikeouts`, `.saves`, `.holds` | 8 compatibility (4 per side) | Same stat precedence | Direct normalized leaves | Existing compatible mappings; hidden from active catalog |

**Registry mismatch:** all 26 IDs are labeled `gamePack`. The current roster-pitchers-minus-starter rule does not distinguish rotation starters from relievers; the documented depth-chart endpoint remains future discovery work.

## 6. Classification by implementation status

### A. Implemented and actively exposed

All 171 active fields have a matching normalized path or implemented resolver. They appear in the active Standard/Custom catalog, participate in Diagnostic, and can be mapped into live PDFs.

This does **not** mean every selected game supplies a value. Lineups, probable pitchers, umpires, manager number, Wild Card rank, and other conditional facts can legitimately resolve as missing.

### B. Implemented and compatibility-only

All 52 compatibility fields remain resolvable but are excluded from `getCatalogFields()`:

- 42 starting-pitcher fields;
- 8 bullpen fields;
- 2 lineup batting-order fields.

These are not dead paths. The representative model resolves every one. They exist to preserve older mappings/contracts while keeping the active v0.2.0 catalog smaller.

### C. Normalized but not independently exposed

The model currently produces additional values that have no separate field ID:

| Normalized values | Current role |
|---|---|
| `context.gamePk`, `season`, `sportId`, `selectedDate`, `retrievedAt` | Snapshot context/internal coordination |
| `game.type` | Normalized but not in runtime registry |
| `game.venue.id`, `.timeZone` | Internal/fallback formatting input; no field ID |
| Umpire IDs and `game.umpires.additional[]` objects | Join/structure data; all officials are also retained in exposed `crew[]` name/role rows |
| Team ID, league ID, division ID | Joins and request planning |
| `{side}.team.record.divisionLeader` | Normalized but not exposed |
| `{side}.manager.id` | Internal identity |
| Player IDs and name variants (`firstName`, `lastName`, `useName`, `useLastName`, `boxscoreName`, `firstLastName`, `lastFirstName`, `initLastName`, `lastInitName`, suffix/title/pronunciation) | Mostly consumed indirectly by Player Name Format from the mapped name field's `formatSource`; not distinct field IDs |
| Role-specific player/position leaves not selected by that role's registry family | Present in normalized records but not independently mappable |
| Additional batting/pitching leaves produced by `normalizeStats()` outside the active/compatibility subset for a given role | Available in the object, not registered for that role |
| `meta.sources` booleans | Diagnostic source-family hints only |

Unexposed does not automatically mean “should become a field.” Build 001.2 records the distinction so later catalog design can be intentional.

### D. Structurally present but never populated

The normalizer creates these containers but v0.2.0 never fills them:

| Container | Runtime value | Historical intent |
|---|---|---|
| `{side}.coaches` | Always `[]` | Repeated bench/hitting/pitching/other coach groups |
| `{side}.defense` | Always `{}` | Defensive role views derived from starting assignments |
| `standings.groups` | Always `{ groups: [] }` at root | Full division/league/Wild Card standings blocks |

No active runtime registry fields target these containers, so they do not create broken active field IDs. They are model/documentation placeholders.

### E. Documented/planned but not implemented

The historical documents describe several concepts beyond the executable v0.2.0 contract:

- venue dimensions;
- a mappable venue timezone;
- game type as an active field;
- team `divisionLeader`, league games back, and Wild Card games back fields;
- repeated categorized coaching staff;
- defensive-alignment role fields;
- full scoped standings groups/rows;
- explicit additional-umpire fields distinct from the general crew;
- separately mappable player name variants and player identity composites;
- compact batting composites;
- tagged games-back values rather than the current scalar/text;
- per-field availability and provenance objects;
- exactly nine placeholder lineup slots with `notPosted`/`partial`/`posted` collection state;
- manager ambiguity reporting;
- dependency-driven lazy standings/People/roster hydration;
- persistent/freshness-keyed API caches and in-flight deduplication.

These descriptions should be treated as design history or future candidates, not as claims about the committed runtime.

## 7. Consumer contract

| Consumer | Field/model use |
|---|---|
| Home | Direct normalized model use for team, venue/weather, lineup, starter, bench, bullpen; also direct Schedule status/time |
| Game Day | Direct normalized model use for selected-team records/standings, manager, players/stats, umpires, venue/weather |
| Field Diagnostic | Iterates all 171 active fields, resolves/formats values, and checks coarse source-family flags |
| Live PDF | Resolves active or persisted compatibility mappings, templates, repeated blocks, and individual collection selections |
| Designer preview/test PDF | Uses the representative model, not live sources; exercises the same field resolvers/formatters |

Compatibility IDs can still resolve when an existing layout refers to them, even though new catalog selection hides them. Unknown IDs resolve explicitly as unsupported. Missing normalized leaves render blank rather than substituting representative values.

## 8. Source-requirement reconciliation

### Why `gamePack` cannot remain the general requirement

The current metadata produces contradictions:

- Home can resolve many `gamePack` fields while `meta.sources.gamePack` is `false`, because Schedule/Roster/People/Standings already populated them.
- Live PDF code cannot use `sourceRequirements` to decide feed hydration. It separately hard-codes umpire and extended-venue field IDs.
- Player fields do not have a single source: membership, identity, jersey number, handedness, and statistics have different precedence chains.
- Game 2 may replace only some values with `priorGameBoxscore` while leaving other fields on prior-day sources.
- Derived composites require no network request but inherit the current `gamePack` label.

### Recommended separation

Later v0.3.0 design should distinguish at least three layers:

1. **Fetch plan** — which adapters must run for a use case, with eager/lazy/conditional rules.
2. **Normalization policy** — how candidate sources are joined and which source wins for each concept.
3. **Value provenance** — which source actually supplied this value in this snapshot, including cutoff and transformations.

A field definition may reference a normalized path and semantic dependencies without pretending to identify one raw endpoint. Fetch planning should operate on model capabilities/domains such as `corePregame`, `officials`, or `manager`, or on explicit adapter requirements with fallback semantics—not on the current one-label-per-field approximation.

## 9. Provenance and availability requirements for v0.3.0

Build 001.2 does not select a final schema, but the current behavior requires future provenance to represent:

| Property | Reason |
|---|---|
| source family and endpoint/request key | Distinguish Schedule, roster, People, standings, prior boxscore, feed, coaches |
| raw response path or extraction rule | Make field lineage auditable |
| requested/retrieved timestamp | Support freshness and diagnostics |
| effective date, stat range, and cutoff | Preserve prior-day versus post-Game-1 meaning |
| selected-source reason and rejected fallbacks | Explain precedence and partial failures |
| transformations | Record numeric parsing, joins, exclusions, compositions, streak advancement, etc. |
| source request outcome | Separate “not requested,” “failed,” and “returned no value” |
| value availability | Separate available, missing, not posted, ambiguous, partial, unsupported, and stale where applicable |

For Game 2, provenance must be granular enough for these statements to coexist in one model:

```text
player stats: Game 1 postgame seasonStats
team W-L: Game 1 postgame record
streak: prior-day standings + known Game 1 result
division rank / GB / Last 10: prior-day standings snapshot
lineup: Game 2 Schedule lineup, or not posted
```

A single model-level source boolean cannot represent that state.

## 10. Existing-document reconciliation after field review

### `PREGAME_DATA_INVENTORY.md`

Use for candidate-field intent and the late Build 025.2/029 source overlays. Do not treat every listed normalized path as implemented. Coach groups, defense, standings tables, several composites, and advanced fields remain candidates or history.

### `GAME_PACK_FIELD_MATRIX.md`

Use as evidence that fields existed in a particular feed fixture. Do not infer runtime consumption or authority from “VERIFIED — Game Pack.” The executable normalizer deliberately sources most of those concepts elsewhere.

### `FIELD_REGISTRY.md`

Use for semantic and placement intent, but distinguish its planned complete-family contract from the 223-field executable registry. Its source-adapter table, cache behavior, availability/provenance model, lineup placeholders, manager ambiguity, coaching/defense/standings collections, and feed-season-stat language do not describe the current runtime.

### Runtime authority

- `js/field-registry.js`: executable IDs, catalog status, resolver, cardinality, tier.
- `js/normalize.js`: actual normalized shape and source precedence.
- `docs/V030_DATA_SOURCE_AUDIT.md`: request/caller/cache flow.
- this document: reconciled concept/field/source/consumer matrix.

## 11. Decisions enabled for the next builds

Build 001.2 establishes enough evidence to make later decisions without guessing:

- which source keys replace `gamePack`;
- whether fetch requirements belong on fields or model capabilities;
- which internal values deserve future field IDs;
- which planned containers should be implemented, deferred, or removed;
- whether compatibility fields remain supported during the v0.3.0 schema transition;
- how source failures and unposted data should differ from ordinary missing values;
- how to represent mixed-cutoff Game 2 snapshots;
- which API questions belong in the Build 001 discovery backlog rather than model design.

No application changes should be made from this matrix alone. The next implementation step should follow an explicit v0.3.0 model/provenance decision, not a mechanical renaming of `gamePack`.
