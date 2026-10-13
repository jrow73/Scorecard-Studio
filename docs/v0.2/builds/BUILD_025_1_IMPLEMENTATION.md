# Build 025.1 — Pregame Schedule + Roster Plumbing

## Purpose

Build 025.1 corrects two live-PDF acceptance defects found during Build 025 testing:

1. Historical games were inheriting the mutable end-of-game batting order / bench / bullpen state from `/api/v1.1/game/{gamePk}/feed/live` instead of the original pregame personnel.
2. `boxscoreName` was not consistently available through the live-feed player objects used by the normalizer.

The Build 025 PDF renderer itself is intentionally unchanged. This revision changes the data sources that feed the existing normalized pregame model.

## API source model

### Schedule

The selected-date Schedule request now hydrates:

`lineups,weather,venue,team,probablePitcher`

The Schedule response is the authoritative source for:

- game metadata
- teams
- venue / weather available in Schedule
- original submitted 9-player lineups
- game-specific lineup positions
- probable / announced starting pitcher IDs

### Date-specific rosters

For each selected game, Scorecard Studio requests the away and home rosters with:

`/api/v1/teams/{teamId}/roster?date={officialDate}&hydrate=person`

Roster data supplies:

- player IDs
- jersey numbers
- full / first / last / use names
- `boxscoreName`
- bats / throws
- primary roster position

Schedule players and probable pitchers are joined to roster records by MLB player ID.

## Derived pregame collections

### Starting lineup

The starting lineup is taken from Schedule `lineups.awayPlayers` / `lineups.homePlayers`. Historical substitutions in the live game feed no longer replace the pregame starters.

### Bench

When a submitted lineup exists:

`Bench = date-specific roster non-pitchers - starting-lineup player IDs`

When a lineup has not been posted, Bench is intentionally blank. Scorecard Studio does not present all non-pitchers as an authoritative bench before the starting lineup is known.

### Starting pitcher

Schedule `probablePitcher` is treated as the pregame authoritative starter and enriched from the date-specific roster.

Known assumption: late scratched-starter behavior has not been independently validated. If Schedule does not provide `probablePitcher`, all Starting Pitcher fields remain blank.

### Bullpen

When the probable pitcher is available:

`Bullpen = date-specific roster pitchers - starting-pitcher ID`

When the probable pitcher is unavailable:

`Bullpen = all date-specific roster pitchers`

No literal `Unavailable`, `N/A`, or similar diagnostic text is printed into scorecard fields.

## Live-feed use after 025.1

The large `/feed/live` request is no longer required simply to select a game or populate the basic pregame lineup / bench / starter / bullpen model.

It is loaded on demand only when mapped fields still require information currently sourced from the game feed, including:

- player season-stat fields
- umpire fields
- extended venue metadata not present in the Schedule response

The existing Game Day / Field Diagnostic views also load the game feed when opened because those diagnostic views exercise the broader field registry.

## Boxscore Name

`boxscoreName` remains a supported Player Name format. It now comes directly from the roster `person.boxscoreName` value. It is not derived from full name.

Representative Data regression checks verify:

- Home Bullpen sample `Silas Crowe` → `Crowe`
- Home Starting Pitcher sample `Thaddeus McAllister` → `McAllister, T`

## PDF warnings

If a layout maps Starting Pitcher fields but Schedule does not provide a probable pitcher, those mapped scorecard fields remain blank and the generation notices include the appropriate `Away SP data is unavailable.` / `Home SP data is unavailable.` message.

The broader PDF warning/reporting presentation remains future work.

## Acceptance checks

1. Select a completed historical game with substitutions. Confirm the Home page and generated PDF use the original 9-player Schedule lineup, not the final batting-order occupants.
2. Confirm players who later entered the historical game remain present in the derived pregame Bench / Bullpen as appropriate.
3. Confirm the announced Starting Pitcher is removed from the Bullpen.
4. Confirm `boxscoreName` prints the API roster value, including initial-disambiguated values where MLB supplies them.
5. Select an upcoming game before lineups are posted. Confirm Lineup and Bench placements are blank.
6. For that same game, confirm Bullpen is still derived from roster pitchers, excluding the probable starter when one is available.
7. If no probable starter is available, confirm SP placements are blank and all roster pitchers remain bullpen candidates.
8. Generate the same saved layout through Designer Representative Data and Live PDF and compare the Player Name formats.

## Automated check

`node tests/build0251.test.mjs`

The test covers Schedule hydration, roster plumbing, lineup/bench/bullpen derivation, missing-lineup behavior, missing-SP behavior, and representative Boxscore Name formatting.
