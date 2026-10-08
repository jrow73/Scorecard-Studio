# Scorecard Studio v0.3.0 — Baseline Data-Source Audit

**Audit build:** 001.1  
**Observed implementation:** committed Scorecard Studio v0.2.0  
**Audit date:** 2026-10-05  
**Evidence authority:** executable files in `Scorecard-Studio_v0.2.0_final.zip`  
**Baseline SHA-256:** `D1726D62573A72A54FA8395598AEFD8C644CDDA753CCE8E753473E4CC67B54BE`

## 1. Purpose and authority

This document describes the data flow that the committed v0.2.0 code actually executes. It is authoritative for the Build 001.1 baseline questions:

- which requests exist;
- when and where each request is made;
- which parameters are supplied;
- which response properties are consumed;
- how values are transformed and which source wins;
- where results live in memory or storage; and
- which application surfaces consume them.

This is an implementation audit, not a promise that an MLB endpoint is stable and not the final v0.3.0 model design. When prose documents and executable behavior differ, this audit reports the executable behavior and classifies the older prose rather than silently rewriting it.

## 2. Executive data-flow map

```text
Favorite team + selected date
        |
        v
Hydrated Schedule  ---------------------> state.schedule / selected Schedule game
        |                                      |
        |                                      +--> Home game choice/status/time
        |                                      +--> normalized game/team/lineup/SP
        v
Two dated Team Rosters (hard requirement)
        |
        +--> collect roster + lineup + probable-pitcher IDs
        |
        +--> bulk People byDateRange (soft failure)
        +--> prior-day Standings by league (soft failure)
        +--> prior Game boxscore for completed Game 1 (conditional soft failure)
                      |
                      v
             normalizePregameData(feed = null)
                      |
                      +--> Home pregame display
                      +--> initial live-PDF-ready model

On explicit later use:
  Game Day ----------> Game Feed + Coaches + Standings refresh
  Field Diagnostic --> Game Feed + mapped-source hydration
  Live PDF ----------> Coaches when mapped; Game Feed for umpire/extended-venue fields

All live models/payloads: page memory only
IndexedDB: preferences, layouts, PDF templates only
```

The important architectural fact is that selected-game hydration is already **Schedule + Roster + People + Standings first**. The Game Feed is a later, narrow supplemental source even though many registry entries still declare `sourceRequirements: ["gamePack"]`.

## 3. Complete request inventory

### 3.1 MLB request families

| ID | Request | Wrapper | Active caller/trigger | Cardinality |
|---|---|---|---|---|
| S1 | `GET /api/v1/schedule` | `fetchFavoriteTeamSchedule` | Initial load, favorite/date refresh; once more on deliberate Game 2 selection | One per load; optional extra Game 2 refresh |
| F1 | `GET /api/v1.1/game/{gamePk}/feed/live` | `fetchGameFeed` | Game Day, Field Diagnostic, or live PDF needing specific feed-only fields | At most one reused in-memory payload per selected game, unless selection is reset |
| B1 | `GET /api/v1/game/{gamePk}/boxscore` | `fetchGameBoxscore` | Selected Game 2 when an earlier same-day matchup is already Final | Zero or one |
| R1 | `GET /api/v1/teams/{teamId}/roster` | `fetchTeamRoster` | Every selected-game core load | Two; away and home |
| P1 | `GET /api/v1/people` | `fetchPeoplePregameStats` | Every selected-game core load after rosters | One per 100 unique IDs; normally one |
| C1 | `GET /api/v1/teams/{teamId}/coaches` | `fetchTeamCoaches` | Game Day; Field Diagnostic/live PDF when manager fields require it | Up to two per hydration action |
| T1 | `GET /api/v1/standings` | `fetchLeagueStandings` | Every selected-game core load; Game Day refreshes it | One per unique league ID, normally one for MLB opponents |

Every MLB request is a `GET` with `Accept: application/json` and browser fetch option `cache: "no-store"`. There is no retry, timeout, abort controller, response schema validation, persistent response cache, or in-flight request deduplication.

### 3.2 Non-MLB runtime fetch

`loadAppMetadata()` performs `GET ./app-meta.json?ts={Date.now()}` with `cache: "no-store"`. It consumes only `version` and `build` and writes version/build labels in the page. It does not enter the pregame model or browser storage. Static script/style/PDF-library asset loading by the browser is outside the application's data API layer.

## 4. Endpoint-by-endpoint audit

### S1 — Hydrated Schedule

**Request**

```text
GET https://statsapi.mlb.com/api/v1/schedule
  ?sportId={sportId || 1}
  &teamId={selectedFavoriteTeamId}
  &date={YYYY-MM-DD}
  &hydrate=lineups,weather,venue,team,probablePitcher
```

**Callers and timing**

- `loadFavoriteTeamPregame()` calls it for initial startup, date changes, manual Home refresh, and favorite-team changes.
- `refreshDoubleheaderSelectionContext()` calls it again only when selecting a game whose `gameNumber > 1`. The refresh uses the selected game's official date, one participating team ID, and its sport ID. Successful returned games replace matching `state.schedule` entries by `gamePk`.

**Response data consumed by `normalizeSchedule()`**

- envelope: `dates[].games[]`;
- game identity/timing: `gamePk`, `gameDate`, `officialDate`, `season`, `sport.id`, `gameType`, `gameNumber`, `doubleHeader`, `dayNight`;
- status/result: `status.startTimeTBD`, `status.statusCode`, `status.abstractGameState`, `status.detailedState`, `teams.{side}.isWinner`, `isTie`;
- teams: `teams.{side}.team` retained as `awayTeamData`/`homeTeamData`, plus name, ID, and league ID copied to convenience properties;
- personnel: `teams.{side}.probablePitcher`, `lineups.awayPlayers`, `lineups.homePlayers`;
- setting: complete `venue` object retained as `venueData`, venue name copied, and `weather` retained.

**Transformation and normalized destinations**

- `gamePk` becomes text; numeric IDs/season/game number are coerced to numbers where possible.
- Missing sport defaults to the requested sport and then to `1`; missing game number defaults to `1`; missing `doubleHeader` defaults to `"N"`.
- Missing team labels become `Away Team`/`Home Team`; missing venue label becomes `Venue TBD` in the Schedule DTO, although normalization later converts absent model values to `null` where appropriate.
- Schedule values populate normalized `context`, `game`, `{side}.team`, `{side}.lineup`, and `{side}.startingPitcher`.
- Schedule lineup array order becomes `battingOrder: index + 1`. Its `primaryPosition` is treated as today's lineup assignment and converted to full position name/number where recognized.

**Downstream consumers**

- Home game choice buttons, status, displayed start time, lineup status, selected matchup, venue, and weather;
- the join key/input set for roster, People, standings, and conditional prior-boxscore requests;
- the normalized model used by Game Day, Field Diagnostic, and live PDF generation;
- doubleheader completion/result detection and streak advancement;
- generated PDF filename and date context.

**Failure and cache behavior**

- The initial request is a hard gate: failure renders Home's pregame error.
- The Game 2 refresh is best effort: failure retains the previous Schedule snapshot.
- The normalized Schedule array lives only in `state.schedule`. It is replaced on a new load and is not persisted.

### R1 — Dated Team Roster

**Request**

```text
GET https://statsapi.mlb.com/api/v1/teams/{teamId}/roster
  ?date={officialDate}
  &hydrate=person
```

`date` is conditionally added by the wrapper but is always supplied by the active caller. `hydrate=person` is always supplied.

**Caller and timing**

`loadPregameCore()` requests away and home rosters concurrently immediately after a Schedule game is selected.

**Response data consumed**

- `roster[]` membership;
- `roster[].person.id` and hydrated person metadata;
- `roster[].jerseyNumber`;
- `roster[].position`, with person `primaryPosition` as a fallback;
- person identity/name variants, `primaryNumber`, `batSide.code`, `pitchHand.code`, and `primaryPosition` after joining with People and Schedule records.

**Transformation and normalized destinations**

- Roster membership is the base for `{side}.bench[]` and `{side}.bullpen[]`.
- Bench is generated only after a Schedule lineup exists: roster non-pitchers minus lineup IDs, sorted by player name. With no posted lineup it is `[]`, avoiding a guessed bench.
- Bullpen is roster pitchers minus the Schedule probable starter, sorted by player name. With no probable starter it contains every roster pitcher.
- Roster rows enrich Schedule lineup and starter records by player ID.
- Jersey number precedence is roster `jerseyNumber`, then People `primaryNumber`, then Schedule/base `primaryNumber`.

**Downstream consumers**

Home lineup/pitcher/bench/bullpen lists, Game Day, repeated field collections, Field Diagnostic, and live PDF mappings.

**Failure and cache behavior**

The two roster calls use `Promise.all`; either failure rejects the entire selected-game core load. Successful payloads remain in `state.selectedSupplemental.rosters` only.

### P1 — Bulk People pregame statistics and metadata

**Request**

```text
GET https://statsapi.mlb.com/api/v1/people
  ?personIds={up to 100 comma-separated unique numeric IDs}
  &hydrate=stats(
      group=[hitting,pitching],
      type=[byDateRange],
      startDate={season}-01-01,
      endDate={officialDate minus one UTC calendar day}
    )
```

The wrapper de-duplicates IDs, converts them to finite numbers, chunks at 100, issues chunks concurrently, and flattens `result.people`. With no valid IDs it returns `{ people: [] }` without a request.

**Caller and input construction**

`loadPregameCore()` builds the ID union from both dated rosters, both Schedule lineups, and both probable pitchers.

**Response data consumed**

- `people[].id` for the lookup map;
- player identity/name variants: `fullName`, `firstName`, `lastName`, `useName`, `useLastName`, `boxscoreName`, `firstLastName`/`nameFirstLast`, `lastFirstName`, `initLastName`, `lastInitName`, `nameSuffix`, `nameTitle`, `pronunciation`;
- `primaryNumber`, `batSide.code`, `pitchHand.code`, `primaryPosition`;
- `stats[]`, including each group's `group.displayName`, `splits[]`, split `sport.id`/`sport.code`, and split `stat`.

**Split selection and source precedence**

- Hitting and pitching groups are matched case-insensitively by `group.displayName`.
- The aggregate split prefers `sport.id === 0` or `sport.code === "All"` (case-insensitive); if absent, the first split is used.
- For Game 2 after a completed Game 1 boxscore was loaded, that boxscore's player `seasonStats` wins. Otherwise People `byDateRange` is used.

**Stat properties consumed and normalized**

- shared: batting `gamesPlayed` then pitching `gamesPlayed` fallback;
- batting: `avg`, `obp`, `slg`, `ops`, `plateAppearances`, `stolenBases`, `homeRuns`, `rbi`;
- pitching: `gamesPitched`, `gamesStarted`, `wins`, `losses`, `era`, `whip`, `inningsPitched`, `hits`, `runs`, `earnedRuns`, `baseOnBalls`, `strikeOuts`, `saves`, `saveOpportunities`, `holds`, `blownSaves`, `winPercentage`, `strikeoutWalkRatio`, `strikeoutsPer9Inn`, `walksPer9Inn`, `hitsPer9Inn`, `homeRunsPer9`, `pitchesPerInning`, and pitching `homeRuns` as a fallback for the common home-run leaf.
- values intended as numbers are converted to finite numbers or `null`;
- W-L record is composed only when both wins and losses exist;
- slash line is composed only when AVG, OBP, and SLG all exist, stripping a leading zero for display-like source strings;
- innings pitched remains the source value rather than being treated as a decimal.

**Normalized destinations and consumers**

People metadata populates every player-bearing normalized record. Stats populate `{side}.lineup[].stats`, `{side}.bench[].stats`, `{side}.startingPitcher.stats`, and `{side}.bullpen[].stats`. Consumers are Home, Game Day, runtime field resolution/formatting, Field Diagnostic, and live PDF generation.

**Failure and cache behavior**

All chunks use `Promise.all`, so one failed chunk rejects the whole People family. `loadPregameCore()` catches that through `Promise.allSettled` and substitutes `{ people: [] }`; identity can still fall back to roster/Schedule data, but all People-backed statistics become missing unless the Game 1 boxscore supplies them. The merged payload lives only in `state.selectedSupplemental.people`.

### T1 — League Standings

**Request**

```text
GET https://statsapi.mlb.com/api/v1/standings
  ?leagueId={leagueId}
  &standingsTypes=regularSeason
  &date={officialDate minus one day}
  &season={season}
```

The wrapper requires `leagueId`; `date` and `season` are optional in the wrapper but always supplied by active callers.

**Callers and timing**

- `loadPregameCore()` calls `fetchPregameStandings()` for the unique away/home league IDs on every selected-game load.
- Game Day independently requests the same prior-day standings again for league IDs taken from Game Feed teams. `forceSupplemental` is accepted by `loadGameDay()` but not used to change this behavior.

**Response data consumed**

- `records[].teamRecords[]`, matched to each selected team by `team.id`;
- `leagueRecord` or fallback `record`: `wins`, `losses`, `gamesPlayed`, `pct`/`winningPercentage`;
- `divisionLeader`;
- `divisionRank`, `leagueRank`, `wildCardRank`;
- `gamesBack` or fallback `divisionGamesBack`;
- `streak.streakCode` or `streak.code`;
- `records.splitRecords[]`, selecting `type === "lastTen"` or text matching “last ten” in type/description, with fallback to `lastTen`; consumes wins/losses.

**Transformation and normalized destinations**

- The first standings payload containing the team wins; payload order is the unique league-ID order.
- Team pregame record normally comes from the matched prior-day team record.
- Games played is computed as wins + losses when both exist; source `gamesPlayed` is used only when they do not.
- `pct` is parsed to a number; it is not recomputed from W-L.
- Rank, games back, streak, and Last 10 populate `{side}.team.standings`.
- Only selected-team scalars are normalized. The root `standings.groups` collection remains `[]`; no full standings table is built.

**Doubleheader precedence**

- A completed earlier same-day boxscore team record overrides the Standings record for wins/losses/games played/PCT.
- Rank, games back, and Last 10 remain from the prior-day Standings response.
- Prior-day streak is advanced by the earlier Schedule result: a same-direction streak increments; the opposite result resets to `W1`/`L1`; a tie or unknown result leaves it unchanged.

**Failure and cache behavior**

Per-league requests use `Promise.allSettled`; successful leagues are retained. If the outer core standings operation fails, normalization receives `[]`. Game selection still succeeds with missing record/standings values. Payloads live only in `state.selectedSupplemental.standingsPayloads`; Game Day's refreshed payloads are used for its new model but are not written back to `state.selectedSupplemental`.

### B1 — Earlier same-day Game Boxscore

**Request**

```text
GET https://statsapi.mlb.com/api/v1/game/{earlierGamePk}/boxscore
```

**Trigger and selection rule**

The request is made only for a selected game whose `gameNumber > 1` when `state.schedule` contains an earlier game on the same official date, between the same two team IDs, with a lower game number and a completed status. Completion is accepted when abstract state is `Final`, status code is `F`, or detailed status begins with `Final`. The highest qualifying earlier game number is selected.

**Response data consumed**

- `teams.{side}.players.*.person.id` and `.seasonStats`;
- `teams.{side}.team.id` and `.team.record`.

No other boxscore properties are consumed by the current normalization path.

**Precedence and destinations**

- Each player's Game 1 `seasonStats` overrides that player's prior-day People statistics for all normalized role views.
- The matching team's Game 1 `team.record` overrides the prior-day Standings record.
- `team.gameNumber` becomes Game 1 postgame games played + 1.
- The earlier game's result comes from the refreshed Schedule DTO, not the boxscore, and advances the standings streak only.

**Failure and cache behavior**

This is best effort under `Promise.allSettled`. Failure leaves `earlierSameDayBoxscore: null`, so the model conservatively uses prior-day People and Standings values even if the Schedule says Game 1 is Final. The payload lives only in `state.selectedSupplemental.earlierSameDayBoxscore`.

### F1 — Game Feed / Game Pack

**Request**

```text
GET https://statsapi.mlb.com/api/v1.1/game/{gamePk}/feed/live
```

**Callers and triggers**

- Game Day always ensures a feed is loaded.
- Field Diagnostic always ensures a feed is loaded before resolving the catalog.
- Live PDF hydration fetches it only when requested fields include fixed umpire names, extended venue properties, or `game.startTime` when Schedule venue data lacks a timezone.
- Once loaded, `state.selectedFeed` is reused across those surfaces until the selected game/date is reset. The Game Day refresh button does not force a new feed because `forceSupplemental` is unused.

**Response data consumed by active paths**

- context fallback: `gameData.game.pk`, `.season`, `.sport.id`, `.type`, `.gameNumber`;
- game fallback: `gameData.datetime.officialDate`, `.dateTime`, `.dayNight`;
- venue: `gameData.venue`, including `id`, `name`, `fieldInfo.capacity`, `fieldInfo.turfType`, `fieldInfo.roofType`, `location.city`, `location.stateAbbrev`/`state`, `location.country`, and `timeZone.id`/`tz`;
- weather fallback: `gameData.weather.temp`, `.condition`, `.wind`;
- team fallback: `gameData.teams.{side}` when no Schedule team object exists;
- umpires: `liveData.boxscore.officials[].official.id`, `.official.fullName`, and `.officialType`;
- Game Day header directly reads feed date/season/team IDs, names, and league IDs before rendering the normalized model.

**Merge and precedence details**

- Schedule context normally wins for date, sport, season, game type/number, team objects, lineup, and starting pitcher.
- Venue is a shallow object merge: `{ ...scheduleVenue, ...feedVenue }`. A feed top-level property replaces the corresponding Schedule property; nested objects are not deep-merged.
- Weather uses `scheduleWeather || feedWeather`, so a truthy Schedule weather object wins as a whole rather than merging individual fields.
- `startTimeTBD` from Schedule forces normalized start time to `null`; otherwise Schedule `gameDate` precedes feed `dateTime`.
- Umpires come only from the feed. Officials are preserved as `crew[]`, matched to home/first/second/third by role text, and unmatched roles go to `additional[]`.

**Important non-use**

The active normalizer does **not** use live-feed lineup, bench, bullpen, probable-pitcher, player metadata, player `seasonStats`, or team record when a selected Schedule game is present. `app.js` still contains raw-feed helper functions for lineup/bench/bullpen/player merging, but the current render path does not call them.

**Normalized destinations and consumers**

Feed data fills missing/finer `context`, `game`, venue/weather, team fallback, and umpires. It feeds Game Day, Field Diagnostic, and field-dependent live PDFs. It is not required for the initial Home normalized model.

**Failure and cache behavior**

Game Day and Field Diagnostic cannot proceed without it. A live PDF that explicitly needs a feed-only field fails hydration if the request fails. The response is retained only in `state.selectedFeed`.

### C1 — Team Coaches

**Request**

```text
GET https://statsapi.mlb.com/api/v1/teams/{teamId}/coaches
  ?date={officialDate}
  &season={season}
```

`date` and `season` are optional in the wrapper but supplied by active callers.

**Callers and timing**

- Game Day requests away and home coaches every time `loadGameDay()` runs, even though its `forceSupplemental` argument is unused.
- Field Diagnostic/live PDF hydration requests coaches when the selected registry fields' transitive requirement set contains `coaches` (currently manager fields).

**Response data consumed and transformation**

- `roster[]` entries are filtered first for exact case-insensitive `job` or `title` equal to `manager`; otherwise the first entry whose job/title contains “manager” is used.
- `person.id`, `person.fullName`, and `jerseyNumber` become `{side}.manager.id/name/number`.
- The current code does not detect ambiguous multiple managers and does not normalize other coaches. `{side}.coaches` is always `[]`.

**Downstream consumers**

Game Day team cards, manager registry fields, Field Diagnostic, and live PDF mappings.

**Failure and cache behavior**

Away/home calls use `Promise.allSettled`; one side may remain available. Game Day uses the returned payload only for that normalization pass. Field/PDF hydration copies it into a local supplemental object. Neither path writes coaches back to `state.selectedSupplemental`, so a later hydration action may request them again.

## 5. Normalized model and exact source precedence

### 5.1 Top-level shape actually produced

```text
schemaVersion: 1
context { gamePk, season, sportId, selectedDate, retrievedAt }
game { date, startTime, dayNight, type, number, venue, weather, umpires }
away / home {
  team { identity, league, division, record, gameNumber, standings },
  manager,
  coaches: [],
  lineup[], startingPitcher, bench[], bullpen[],
  defense: {}
}
standings { groups: [] }
meta { sources { gamePack, schedule, rosters, peopleStats, coaches, standings } }
```

The model has no per-value provenance, availability object, request error metadata, cache timestamp beyond model-level `retrievedAt`, or source cutoff description.

### 5.2 Precedence table

| Normalized concept | First choice | Fallback(s) | Notes |
|---|---|---|---|
| Game/date/context | Schedule | Game Feed | Schedule is present for normal selected-game flow |
| Start time | `null` when Schedule says TBD; else Schedule `gameDate` | Feed `dateTime` | Render-time timezone formatting is separate |
| Venue | Feed-over-Schedule shallow merge | whichever source exists | Nested objects are replaced, not deep-merged |
| Weather | Schedule object | Feed object | Whole-object `||`, no field merge |
| Umpires | Game Feed officials | none | Role-text matching, source order preserved in crew |
| Team metadata | Entire Schedule hydrated team object | Feed team object | Choice is object-level, then selected convenience fallbacks |
| Lineup membership/order/assignment | Schedule hydrated lineup | none | Feed boxscore lineup is not used by active normalizer |
| Starting pitcher | Schedule probable pitcher | none | Missing probable remains missing |
| Player identity | People person | roster person, then Schedule person | Individual leaves also use explicit fallbacks |
| Jersey number | roster `jerseyNumber` | People/base `primaryNumber` | Number remains source text where supplied |
| Bench membership | dated roster non-pitchers minus posted Schedule lineup | none | Blank until lineup exists |
| Bullpen membership | dated roster pitchers minus Schedule starter | all roster pitchers if starter absent | No SP/RP depth-chart classification |
| Player stats, Game 1 | People prior-day aggregate | empty/missing | End date is day before game |
| Player stats, Game 2 after Final Game 1 | Game 1 boxscore `seasonStats` | People prior-day aggregate | Override is per player ID |
| Team record, first game/pre-Game-1 Game 2 | prior-day Standings | missing | Games played prefers W+L calculation |
| Team record, Game 2 after Final Game 1 | Game 1 boxscore team record | prior-day Standings | Post-Game-1 record |
| Rank / GB / Last 10 | prior-day Standings | missing | Never reconstructed intraday |
| Streak for Game 2 after Final Game 1 | prior-day Standings streak, locally advanced by Schedule result | locally starts W1/L1 if base unparsable | Tie leaves base unchanged |
| Manager | exact manager entry in Coaches | first job/title containing manager | First match wins; ambiguity not surfaced |

### 5.3 Derived values

- recognized defensive abbreviations produce traditional position numbers and full names;
- Schedule lineup index produces batting order;
- W-L and slash-line strings are composed locally;
- team games played normally becomes wins + losses;
- selected team game number is:
  - prior-day games played + within-day `gameNumber` when no earlier boxscore is used;
  - earlier-game postgame games played + 1 when it is used;
- day/night is title-cased only for exact `day`/`night` text;
- all missing/non-finite numeric inputs become `null`.

## 6. Lifecycle, caching, storage, and refresh behavior

| Layer | What is retained | Lifetime/key | Reality in v0.2.0 |
|---|---|---|---|
| Browser HTTP cache | Nothing intentionally reusable | N/A | Every explicit fetch uses `cache: "no-store"` |
| `state.schedule` | normalized Schedule DTO array | Current team/date page state | Replaced on schedule load; selected Game 2 may merge refreshed rows |
| `state.selectedSupplemental` | rosters, People, prior-day standings, earlier game/boxscore | Current selected game | Reset on date/game selection; no explicit freshness timestamp |
| `state.selectedFeed` | raw Game Feed | Current selected game | Reused by Game Day, Diagnostic, and PDF; refresh action does not force replacement |
| `state.normalizedPregame` | last normalized model | Current selected game/action | Rebuilt after different hydration actions; not persisted |
| IndexedDB `settings` | favorite team/layout preferences | Persistent | No MLB/API data |
| IndexedDB `pdfTemplates` | user PDF blobs and metadata | Persistent | No MLB/API data |
| IndexedDB `layouts` | saved mappings/formatting/layout metadata | Persistent | No MLB/API data |

There is no server-data cache key, expiry/freshness policy, schema migration for snapshots, stale-while-revalidate behavior, request result registry, or persistent normalized snapshot. The docs' earlier references to coaches/standings/Game Pack cache keys and in-flight deduplication are design intent, not current code.

## 7. Downstream consumer audit

### Home / selected-game display

Home renders the model produced with `feed = null` and core supplemental data. It consumes normalized team names, venue/weather, lineup, starter, bench, and bullpen. It also directly consumes selected Schedule status/time and uses Schedule game identity for game selection.

### Game Day

Game Day ensures the feed, immediately renders a feed-enriched model, then always requests coaches and standings and renders again. Its cards consume selected-team record/standings/manager, lineup batting rates, starting-pitcher/bullpen pitching lines, bench batting summaries, umpires, venue, and weather. Its subtitle reads a few Game Feed properties directly.

### Field Diagnostic

The diagnostic ensures a feed, gathers all active catalog IDs, hydrates mapped requirements, resolves each registry field, and reports formatted availability/coverage. Source availability is inferred from coarse `model.meta.sources` flags; it is not per-value provenance.

### Live PDF generation

The selected layout is scanned for scalar, template-token, repeated-block, and individual mapping field IDs. Registry `sourceRequirements` cause manager/coaches hydration; a separate hard-coded field-ID check decides whether a Game Feed is required. The normalized model is resolved through `field-registry.js`, formatted, and drawn into the stored PDF template. Missing values are left blank and counted in the generation notice.

### Designer preview/test PDF

Designer preview and test PDFs use `DESIGNER_SAMPLE_MODEL`, not live APIs. They share field resolution and formatting code but do not validate live source availability.

## 8. Runtime contract gaps found during reconciliation

These are audit findings, not code changes in Build 001.1.

1. **`gamePack` does not mean Game Feed in the runtime field registry.** It labels Schedule/Roster/People/Standings-backed fields and is therefore neither accurate provenance nor an actionable adapter requirement.
2. **Fetch planning is split.** Coaches use registry requirements; feed loading uses a separate hard-coded field list; standings and People/rosters are already eagerly loaded regardless of mappings.
3. **Standings dependency is not lazy.** Core selection always requests prior-day standings, despite documentation that selected layouts drive supplemental standings hydration.
4. **Feed refresh is not forced.** `loadGameDay(forceSupplemental)` ignores its argument and reuses `state.selectedFeed`, including when the refresh button calls it with `true`.
5. **Coaches are not retained.** Successful coach payloads are not merged into the selected game's core supplemental state, so later diagnostic/PDF hydration can refetch them.
6. **The normalized model advertises incomplete families.** `coaches`, `defense`, and root standings groups exist structurally but are never populated.
7. **Manager ambiguity behavior differs from the prose contract.** Code selects the first matching manager; it does not return an ambiguous state.
8. **Lineup shape differs from older contract language.** With no posted lineup the runtime returns `[]`, not nine placeholder slots. When supplied, it preserves the Schedule array's actual length.
9. **No rich provenance/availability state exists in the normalized model.** Field resolution mostly distinguishes available/missing/unsupported from presence of normalized values, while request failures are collapsed to empty source payloads.
10. **Raw-feed helper code is dormant.** `lineupPlayers`, `benchPlayers`, `startingPitcher`, `bullpenPitchers`, and associated merge helpers remain in `app.js`, but no current caller uses them.

## 9. Existing-document reconciliation

### `PREGAME_DATA_INVENTORY.md`

**Classification: partially authoritative; mixed accepted behavior, discovery backlog, and historical design.**

Still aligned with code reality:

- the Build 025.2 source overlay (Schedule, dated rosters, People through prior day, prior-day Standings, supplemental feed);
- derived bench/bullpen rules;
- missing lineup means blank bench;
- Build 029/029.1 Game 2 player/team/streak behavior and prior-day broader standings limitation;
- future team-logo and depth-chart opportunities;
- normalized consumers should not know raw API shapes.

Needs reconciliation in a later field/model build:

- many older table rows still say Game Feed for lineup/player stats/identity even though the leading overlay supersedes them;
- candidate paths for coach collections, defense, and standings tables exceed the implemented model/catalog;
- source notes such as bats/throws from Game Pack conflict with current People/roster-first identity precedence;
- several candidate fields are not active runtime fields.

Authority after this audit: use it for product intent, field-discovery history, and explicit late-build overlays—not as a literal endpoint-to-field map.

### `GAME_PACK_FIELD_MATRIX.md`

**Classification: historical fixture evidence with a valid superseding overlay; not the current architecture.**

Still useful:

- it proves which values existed in a specific pregame feed fixture;
- the Build 025.2 table accurately redirects immutable/historical pregame families to Schedule/Roster/People/Standings;
- timing and universality cautions remain valid.

Not current production truth:

- the body and architecture diagram still present Game Pack as the base for teams, W-L, players, lineup/bench/bullpen, and season statistics;
- the claim that most traditional scorecards can be satisfied from Game Pack alone does not describe the current selected-game flow;
- feed fields' presence does not imply that the active normalizer consumes them.

Authority after this audit: retain as source-capability evidence and history. For actual v0.2.0 data flow, use this audit.

### `FIELD_REGISTRY.md`

**Classification: partially authoritative design contract; runtime JavaScript is authoritative for executable fields.**

Still aligned with code reality:

- separation of normalized data, field definitions, and placements;
- canonical IDs, aliases, repeated selectors, formatting, and mapping semantics;
- missing values render blank;
- most active field meanings and many normalized paths;
- Build 018 overlays describing diagnostic and representative data behavior.

Needs reconciliation:

- `gamePack` source requirements and the hydration table reflect the old feed-first architecture;
- batting/pitching source prose still names embedded feed `seasonStats` in sections superseded by Build 025.2 behavior;
- root standings groups, coach collections, defensive views, full provenance/status metadata, and some listed field families are not implemented;
- lineup placeholder/availability semantics, manager ambiguity handling, caching, in-flight deduplication, and lazy standings planning are design claims rather than current behavior;
- runtime `js/field-registry.js` exposes a deliberately smaller catalog and marks nearly all non-manager/non-standings fields as `gamePack`, even when their real sources are Schedule/Roster/People/Boxscore.

Authority after this audit: use the document for intended semantic/placement contract, but use `js/field-registry.js` for the v0.2.0 executable catalog and this audit for source behavior.

## 10. Authority matrix for v0.3.0 work

| Question | Authority after Build 001.1 |
|---|---|
| What requests does v0.2.0 make and when? | `V030_DATA_SOURCE_AUDIT.md` + executable `api.js`/`app.js` |
| Which source wins for a v0.2.0 value? | `V030_DATA_SOURCE_AUDIT.md` + executable `normalize.js` |
| Which fields can v0.2.0 actually resolve? | executable `js/field-registry.js` |
| What does the field/product intend conceptually? | `FIELD_REGISTRY.md` and `PREGAME_DATA_INVENTORY.md`, subject to reconciliation flags above |
| What was observed in the Game Pack fixture? | `GAME_PACK_FIELD_MATRIX.md` |
| What should the final v0.3.0 model/provenance/cache contract be? | Not decided by Build 001.1 |

## 11. Build 001.2 handoff items

The audit establishes the evidence needed for a field/model reconciliation without making code changes. The next pass should:

- replace the overloaded `gamePack` label with source requirements that distinguish Schedule, dated roster, People stats, prior game boxscore, Game Feed, Coaches, and Standings;
- decide whether requirements express fetch planning, provenance, or both;
- reconcile every executable field to its real normalized source path and fallback chain;
- define value-level provenance/cutoff/error representation, especially for mixed-time Game 2 models;
- decide the intended availability/placeholder semantics for unposted lineups and failed source families;
- identify aspirational normalized families that should be implemented, deferred, or removed from the v0.3.0 contract;
- separate selected-team standings scalars from a future full standings-table collection;
- define cache/freshness rules before any persistent game snapshot is introduced.

