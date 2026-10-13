# Build 025.2 — Pregame API Fidelity Fix

## Purpose

Build 025.2 corrects two acceptance defects discovered while testing Build 025/025.1 live PDF generation against historical and upcoming MLB games:

1. historical team/player statistics were being sourced from completed-game `/feed/live` state and therefore included the selected game's result; and
2. `Boxscore Name` was not consistently using the API's canonical `boxscoreName` value across Lineup, Bench, Starting Pitcher, and Bullpen records.

This build keeps the shared live/Test PDF renderer introduced in Build 025 and replaces the live-PDF data plumbing behind the normalized pregame model.

## Authoritative pregame source model

### Schedule

Use:

`/api/v1/schedule?...&hydrate=lineups,weather,venue,team,probablePitcher`

The hydrated Schedule response supplies:

- original submitted batting lineups, including historical completed games;
- game-specific starting defensive positions;
- probable/starting pitcher ID + name;
- team identity and league/division metadata;
- venue/weather/status/date/time;
- game number / doubleheader metadata.

Do not use completed-game `liveData.boxscore.teams.{side}.battingOrder`, `bench`, or `bullpen` as pregame truth.

### Date-specific rosters

For each club use:

`/api/v1/teams/{teamId}/roster?date={officialDate}&hydrate=person`

The roster establishes the players available to that team on the selected game date and supplies jersey number, bats/throws, primary position, and person metadata.

Derived collections:

- **Bench** = roster non-pitchers minus the 9 Schedule lineup IDs.
- If no lineup is posted, **Bench stays blank**.
- **Bullpen** = roster pitchers minus Starting Pitcher.
- If Starting Pitcher is unavailable, SP fields stay blank and Bullpen contains all roster pitchers.

Missing-data diagnostics must never print words such as `Unavailable`, `N/A`, or `Unknown` onto the PDF. Missing mapped values render blank; generation warnings remain separate UI output.

### Bulk player metadata + pregame stats

Collect and de-duplicate all player IDs from both date-specific rosters, posted lineups, and probable pitchers. Fetch them in a single bulk People request (chunk at 100 IDs if ever necessary):

`/api/v1/people?personIds={ids}&hydrate=stats(group=[hitting,pitching],type=[byDateRange],startDate={seasonStart},endDate={dayBeforeGame})`

Use the returned People record as the canonical player-enrichment source for:

- full/first/last/use names;
- `boxscoreName`;
- bats / throws;
- primary position;
- pregame season-to-date hitting/pitching stats.

For each hitting/pitching stat group, use the split whose `sport.id == 0` / `code == "All"` when present. This is MLB's aggregate across multiple teams within the queried MLB stat context.

Validation examples from the API investigation:

- **Taylor Ward**: Baltimore + Seattle team splits plus a correct combined `All` split.
- **Seranthony Domínguez**: White Sox + Seattle team splits plus a correct combined `All` split.
- **Cal Raleigh**: Seattle-only split plus an identical `All` split.
- **Colt Emerson**: `splits: []` through the day before his MLB debut despite prior Triple-A play; MLB-only totals appeared after the debut. This prevents MiLB stats from appearing on an MLB debut scorecard.

### Team record / standings

Use the standings endpoint with:

`date = officialDate - 1 day`

Testing showed that a standings request for the game date includes that day's completed result; requesting the previous date produces the team's record entering the selected game.

Known edge case: for Game 2 of a same-day doubleheader, a calendar-day `D-1` cutoff will not include Game 1. This is deferred unless acceptance testing requires same-day doubleheader precision in v0.2.0.

### `/feed/live`

`/api/v1.1/game/{gamePk}/feed/live` is no longer authoritative for:

- starting lineup;
- Bench;
- Bullpen;
- Starting Pitcher;
- team W-L record;
- player season/YTD statistics.

It remains an on-demand supplemental source for fields not yet replaced by a narrower immutable source, currently including umpire crew and some extended venue metadata. Game Day and Field Diagnostic may still request it explicitly.

## Boxscore Name rule

`Name Format = Boxscore Name` must render only the canonical API `player.boxscoreName` value. Do not manufacture a value from Full Name and do not silently substitute Full Name if `boxscoreName` is absent.

This rule applies identically to:

- Lineup;
- Bench;
- Starting Pitcher;
- Bullpen.

## Future sport compatibility

Do not introduce new MLB-only `sportId=1` assumptions where selected-game sport context can be carried instead. Current MLB uses sport ID 1; future MiLB support is expected to use level-specific sport IDs. The `sport.id=0 / All` stat split is an aggregate marker, not equivalent to MLB sport ID 1.

## Acceptance checklist

- [ ] Historical completed game shows the original nine-player lineup from first pitch, not end-of-game replacements.
- [ ] Historical completed game Bench contains the pregame reserve position players.
- [ ] Historical completed game Bullpen contains all pregame pitchers except the SP.
- [ ] Upcoming game with no posted lineup leaves both Lineup and Bench blank.
- [ ] Upcoming game with probable SP but no lineup shows the SP and Bullpen = all other roster pitchers.
- [ ] Upcoming game with no probable SP leaves SP fields blank and Bullpen = all roster pitchers.
- [ ] Historical team W-L reflects the record entering the selected game. Opening Day should show 0-0.
- [ ] Historical player stats reflect season totals entering the selected game. Opening Day players should have no prior regular-season stat split.
- [ ] Traded-player stats use the combined `All` split rather than current-team-only totals.
- [ ] MLB debut player does not inherit prior MiLB season stats on an MLB scorecard.
- [ ] Lineup Boxscore Name renders API `boxscoreName`.
- [ ] Bench Boxscore Name renders API `boxscoreName`.
- [ ] Starting Pitcher Boxscore Name renders API `boxscoreName`.
- [ ] Bullpen Boxscore Name renders API `boxscoreName`.
- [ ] Game Day and Field Diagnostic still load their on-demand game feed when opened.
- [ ] Designer Generate Test PDF remains unchanged and continues to use deterministic Representative Data.

## Automated checks

`tests/build0252.test.mjs` verifies the new source contract, aggregate-stat resolution, Boxscore Name behavior, Bench blanking before lineups post, and missing-SP bullpen behavior.
