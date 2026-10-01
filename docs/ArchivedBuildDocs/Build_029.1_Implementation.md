# Build 029.1 — Doubleheader Availability & Standings Boundary

## Baseline

Build 029 first-round changed-files package. `README.md` remains intentionally unchanged.

## Purpose

Refine Game 2 behavior so Scorecard Studio distinguishes between a doubleheader whose Game 1 has not yet finished and one whose Game 1 is Final. The app must use only information actually available at generation time and must not reconstruct intraday league/division standings.

## Implementation

### 1. Conservative Game 2 fallback before Game 1 is Final

If no earlier same-day completed game is available, Game 2 continues to use the previous-day People and Standings snapshots. No Game 1 result, player YTD change, team W-L change, or streak change is inferred.

Known Game 2 metadata remains usable. Team Game Number is calculated from previous-day completed games plus the selected game's within-day `gameNumber`, so Game # remains correct even before Game 1 ends. Game 2 lineups remain blank until MLB posts them.

### 2. Post-Game-1 Game 2 snapshot

When Game 1 is Final:

- player YTD stats prefer Game 1 boxscore `seasonStats`;
- missing player entries fall back to previous-day People stats;
- W-L and games played use the Game 1 postgame record;
- Team Game Number is post-Game-1 games played + 1;
- winning/losing streak advances from the previous-day standings using the known Game 1 result.

No rate-stat arithmetic is performed by Scorecard Studio.

### 3. Standings fields intentionally stay pre-Game-1

The following remain sourced from the previous-day standings snapshot for Game 2:

- division rank / games back;
- league rank / games back where exposed;
- wild-card rank / games back where exposed;
- Last 10 and other context that depends on broader same-day league results.

This avoids league-wide intraday reconstruction and keeps the approach scalable to MLB and MiLB.

### 4. Targeted refresh when Game 2 is selected

A deliberate Game 2 selection performs one selected-team schedule refresh for that date. This is intentionally narrow: it allows a browser opened before Game 1 to discover that Game 1 has since become Final and to pick up newly posted Game 2 lineup/probable-pitcher data, without changing the homepage into a multi-feed polling surface.

If that refresh fails, the app keeps the existing schedule snapshot and falls back conservatively.

## Acceptance checks

Using June 19, 2025 STL at CHW (`777447` / `777458`):

### Simulated Game 1 not Final

- Game 2 player stats remain at the June 18 snapshot.
- STL team record remains 38-35; CHW remains 23-50.
- Streak remains STL W1 / CHW L6.
- Team Game Number is still 75 for both clubs.
- Division rank and games back remain the pre-Game-1 values.

### Game 1 Final

- Game 2 player YTD stats use Game 1 boxscore `seasonStats` where available.
- STL team record becomes 39-35; CHW becomes 23-51.
- Streak becomes STL W2 / CHW L7.
- Team Game Number is 75.
- Division rank/games-back remain the pre-Game-1 snapshot by design.

### Regression

- Game 1 behavior remains unchanged.
- PDF start-time behavior from Build 029 remains unchanged.
- Existing layouts and representative data remain compatible.
- `README.md` is not modified.

## Automated check

`tests/build029.test.mjs` now covers both Game 2 branches, Team Game Number before Game 1 is Final, streak advancement after Game 1, and intentional retention of pre-Game-1 division standings.

## Acceptance and closure status

**Accepted.** Build 029.1 passed the complete manual acceptance checklist using the June 19, 2025 STL at CHW doubleheader and an ordinary-game regression sample.

Verified Game 2 values after Game 1 Final included:

- STL 39-35 / CHW 23-51 entering Game 2;
- Team Game Number 75 for both clubs;
- STL W2 / CHW L7;
- player YTD values updated through Game 1 without game-only/rate-stat artifacts;
- division rank and games-back intentionally unchanged from the pre-Game-1 standings snapshot;
- blank PDF Start Time for the Game 2 record with `startTimeTBD: true`.

The pre-/in-progress Game 1 branch remains covered synthetically because historical MLB data cannot reproduce a future Game 2 while Game 1 is still genuinely Scheduled or In Progress. This is a future live-validation item, not a release blocker.
