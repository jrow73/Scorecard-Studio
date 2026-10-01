# Build 029 — Closure Summary

## Status

**Accepted and ready for baseline commit.**

Build 029 / 029.1 closes the pregame-data boundary work for same-day doubleheaders while preserving the lightweight browser-first architecture.

## Accepted scope

- Added separate Away/Home Team Game Number fields.
- Preserved MLB `game.number` as the within-day Game 1 / Game 2 value.
- Game 1 continues to use previous-day pregame statistics.
- Game 2 uses Game 1 boxscore `seasonStats` only after Game 1 is Final.
- Before Game 1 is Final, Game 2 falls back to the previous-day player/team/streak snapshot and does not infer unavailable results.
- After Game 1 is Final, Game 2 advances player YTD stats, team W-L/games played, Team Game Number, and winning/losing streak through Game 1.
- Game 2 lineups remain blank until MLB posts them; Game 1 lineup data is never reused.
- Division/league/wild-card rank, games-back, Last 10, and similar context remain at the pre-Game-1 snapshot for Game 2 by design.
- PDF Start Time uses ballpark-local time for normal games.
- `startTimeTBD: true` leaves the PDF Start Time field blank.
- A selected Game 2 performs one targeted date-schedule refresh so an already-open browser can discover a newly Final Game 1/newly posted Game 2 data without homepage-wide polling.

## Acceptance result

Manual acceptance passed all planned checks:

- historical Game 1 control (`777447`);
- historical Game 2 post-Game-1 snapshot (`777458`);
- expected Game 2 W-L / Game # / streak values;
- intentional retention of pre-Game-1 standings-context fields;
- normal non-doubleheader regression;
- ballpark-local PDF start time;
- TBD PDF start-time blanking;
- lineup behavior;
- field-registry and representative-data behavior.

The Scheduled/In Progress -> Final Game 1 transition cannot be reproduced faithfully from historical MLB data. Synthetic automated coverage is accepted for now; live validation is deferred until a future real doubleheader occurs.

## Explicitly deferred

- Homepage/date-browser time-display changes.
- Game 2 disclosure/information UI for standings fields that remain at the pre-Game-1 snapshot. A small notification/info icon with tooltip or compact modal is the preferred future direction.
- League-wide intraday standings reconstruction. This was intentionally rejected as unnecessary complexity/API traffic, especially for eventual MLB/MiLB scale.

## Future API research captured during Build 029

### Team logos

`https://www.mlbstatic.com/team-logos/{teamId}.svg`

Potential Designer asset source; verify MLB/MiLB and historical coverage before implementation.

### Pitcher depth-chart roles

`/api/v1/teams/{teamId}/roster/depthChart?season={season}`

Potential source for SP-vs-reliever role metadata. Keep the current roster-pitchers-minus-starting-pitcher bullpen construction as the fallback until MLB/MiLB consistency is verified.

## Documentation rule

`README.md` was not modified. Current Build 029 documents remain in root `/docs` for review and may be moved to `/docs/archived` before the baseline Git commit, following the project workflow.
