# Build 029 — Pregame Data Context & Semantics

## Baseline

Build 028 Final (`Scorecard-Studio_v0.2.0_Build028_Final.zip`). `README.md` is intentionally unchanged.

## Build 029 first implementation round

This round targets the pregame snapshot boundary for same-day doubleheaders plus the PDF-specific start-time and team-game-number plumbing discussed during Build 029 planning.

### 1. Game 2 player YTD statistics

The existing Build 028 path remains authoritative for the first game a club plays on a selected date:

- roster is loaded for the selected official date;
- player statistics use the existing People `byDateRange` request through the previous calendar day;
- missing values continue to remain blank rather than being inferred.

For a selected Game 2, Scorecard Studio now looks for an earlier **completed same-day game between the same two teams** using schedule `gameNumber`, team IDs, official date, and completed-game status. When found, it requests:

`/api/v1/game/{earlierGamePk}/boxscore`

Each player's Game 1 `seasonStats` becomes the preferred YTD source for Game 2. If a player on the selected-game roster is absent from the earlier boxscore, the existing previous-day People result remains the fallback for that player.

No batting or pitching rate arithmetic is performed by Scorecard Studio. MLB's post-Game-1 `seasonStats` supplies the already-updated AVG/OBP/SLG/OPS, ERA/WHIP, and cumulative counting values.

### 2. Game 2 team record and Team Game Number

For the first game of the day, team record remains sourced from the previous-day standings snapshot.

For Game 2, the earlier completed game's boxscore team `record` is used as the selected game's pregame W-L / games-played state.

A new field is added for each side:

- `away.team.gameNumber`
- `home.team.gameNumber`

Definition:

`Team Game Number = completed games entering the selected game + 1`

This is intentionally separate from `game.number`, which remains the within-day Game 1 / Game 2 indicator supplied by MLB.

### 3. PDF scheduled start time

Build 029 preserves the scheduled UTC instant internally but renders `game.startTime` using the venue's IANA timezone when available.

For PDF generation:

- normal scheduled game -> print the ballpark-local clock time only (for example `1:10 PM`);
- `startTimeTBD: true` -> `game.startTime` normalizes to null, so the mapped PDF field remains blank.

When a layout maps `game.startTime` and the schedule-hydrated venue does not contain timezone metadata, the deliberate PDF-generation path may request the selected game's live feed to obtain richer venue metadata. This does not add broad per-game feed fan-out to date browsing.

### 4. Homepage scope intentionally unchanged

This round does **not** redesign homepage browsing.

The homepage continues to use the existing selected-date schedule path and its current lineup/readiness behavior. Build 029 does not require loading rich game feeds for every game returned by a date search. Future all-games / all-leagues browsing can therefore remain schedule-first and load richer data only after a user selects a particular game or requests a generated scorecard.

The separate homepage presentation ideas discussed during planning — viewer-local schedule time and `TBD` display — remain available for a later UI-focused pass and are not required for this first Build 029 package.

## Changed files

- `app-meta.json`
- `index.html`
- `js/api.js`
- `js/app.js`
- `js/normalize.js`
- `js/field-registry.js`
- `js/sample-data.js`
- `docs/FIELD_REGISTRY.md`
- `docs/PREGAME_DATA_INVENTORY.md`
- `docs/Build_029_Implementation.md`
- `tests/build029.test.mjs`

## Focused acceptance tests

### A. Game 1 control

Use gamePk `777447` (St. Louis at Chicago White Sox, June 19, 2025).

Expected:

- player YTD stats remain based on the existing previous-day cutoff;
- no earlier-game boxscore override is applied;
- team record reflects games completed before Game 1;
- Team Game Number equals pregame games played + 1;
- existing Build 028 scorecard values should otherwise remain unchanged.

### B. Game 2 doubleheader snapshot

Use gamePk `777458`.

Expected:

- earlier completed game `777447` is detected by same official date, same team pair, lower `gameNumber`, and completed status;
- players present in the Game 1 boxscore use Game 1 `seasonStats` for the Game 2 pregame snapshot;
- a selected-game roster player absent from Game 1 falls back to previous-day People stats;
- St. Louis and Chicago use the post-Game-1 team record as their Game 2 pregame record;
- with 74 completed games entering Game 2, each club's Team Game Number resolves to `75`.

### C. Scheduled start-time rendering

For a normal game with venue timezone metadata:

- a `2025-06-19T18:10:00Z` scheduled instant at `America/Chicago` renders on the PDF as `1:10 PM`;
- no timezone abbreviation is printed in the PDF field.

For a game with `startTimeTBD: true`:

- the PDF `Scheduled Start` field resolves missing and prints blank.

### D. Regression

- Designer representative-data PDF behavior remains unchanged.
- Existing saved layouts continue resolving `game.number` as the within-day game number.
- New Team Game Number fields are additive to the registry and do not replace Games Played or Game Number (Day).
- `README.md` remains untouched.

## Automated check

`tests/build029.test.mjs` verifies the focused normalization and field-resolution rules above, including Game 1 boxscore YTD preference, fallback People stats, team Game Number, venue-local instant formatting, and TBD blanking.


## Build 029.1 refinement

Build 029.1 keeps the Build 029 post-Game-1 player-stat approach and adds explicit handling for the two real Game 2 availability states.

### Before Game 1 is final

When the earlier same-day game is not yet complete, Scorecard Studio does **not** infer its result or manufacture Game 2 statistics. Game 2 therefore uses the same previous-day player and standings snapshot available for Game 1. Lineups remain blank if MLB has not posted the Game 2 lineup, while known metadata such as teams, probable starting pitchers, managers, and Team Game Number may still populate.

Team Game Number remains knowable before Game 1 is complete. For a scheduled Game 2, it is derived from the previous-day completed-games count plus the within-day game number. Example: a club with 73 completed games entering a doubleheader will show Game #74 for Game 1 and Game #75 for Game 2.

### After Game 1 is final

When the earlier same-day game is Final, Game 2 uses Game 1 boxscore `seasonStats` for players when available, the post-Game-1 team record for W-L/games played, and advances the winning/losing streak from the previous-day standings using the known Game 1 result. Missing player boxscore entries continue to fall back to previous-day People stats.

Division rank, league rank, wild-card rank, games-back values, Last 10, and other standings-context fields intentionally remain at the pre-Game-1 standings snapshot. Exact intraday reconstruction of those values would require tracking other clubs' same-day completion state across MLB/MiLB and is outside the intended lightweight browser architecture.

### Fresh Game 2 selection

Selecting a Game 2 triggers one targeted refresh of that team's schedule for the selected date before the richer pregame load. This lets a browser session opened earlier in the day discover that Game 1 has since become Final and pick up newly posted Game 2 lineup/probable-pitcher information without introducing league-wide polling or homepage fan-out. If the refresh fails, the existing schedule snapshot remains usable and the conservative previous-day fallback applies.

### User-facing limitation note

Recommended wording for a later UI pass:

> **Doubleheader note:** Before Game 1 is complete, Game 2 uses the same pregame statistics available before Game 1. After Game 1 is complete, Game 2 player statistics, team record, game number, and streak update through Game 1 when available. Division, league, and wild-card standings remain based on the pregame standings from before Game 1.

## Build 029 closure

Build 029.1 was accepted as the functional endpoint for Build 029 after manual PDF acceptance testing of the June 19, 2025 STL at CHW doubleheader plus ordinary-game regression checks.

Accepted behavior:

- Game 1 continues to use the previous-day pregame player/statistics boundary.
- Game 2 uses Game 1 boxscore `seasonStats` only after Game 1 is Final.
- Before Game 1 is Final, Game 2 conservatively falls back to the same previous-day player/team/streak snapshot available for Game 1; no Game 1 result is inferred.
- Game 2 W-L, games played, Team Game Number, and streak update through Game 1 after Game 1 becomes Final.
- Game 2 lineups remain blank until MLB posts them; Game 1 lineup content is never borrowed.
- Division/league/wild-card rank, games-back, Last 10, and other standings-context fields remain at the pre-Game-1 snapshot for Game 2 by design.
- `startTimeTBD: true` leaves the PDF Start Time field blank.
- Normal-game PDF start time remains ballpark-local.
- Team Game Number is available as a distinct field from MLB's within-day `game.number`.

Manual acceptance testing passed all planned line items, including the historical Game 1 control, historical Game 2 post-Game-1 snapshot, ordinary non-doubleheader regression, ballpark-local PDF start time, lineup behavior, and registry/representative-data checks.

### Deferred from Build 029

The following were explicitly deferred and are not Build 029 closure blockers:

- homepage/date-browser time presentation changes;
- a user-facing Game 2 data-quality/disclosure indicator explaining which standings fields remain at the pre-Game-1 snapshot;
- live validation of the Scheduled/In Progress -> Final doubleheader transition when a future real doubleheader becomes available.

A future disclosure UI may fit well as a small information/notification icon associated with Game 2, with a tooltip on pointer devices and a compact tap/click modal on touch devices.

`README.md` remains intentionally unchanged.
