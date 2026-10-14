# Scorecard Studio v0.5 — Build 002.2 Checkpoint

**Status:** Complete  
**Date:** 2026-10-13  
**Runtime identity:** v0.5.0-dev, Build 002.2a

## Outcome

Game Day now applies the Build 002.1 competition classifier to both standings hydration and the Advanced team presentation. Standard retains its accepted Record, PCT, Games Played, Division Rank, and Games Back list.

## Advanced presentation

| Context | Team summary | Embedded standings |
| --- | --- | --- |
| MLB spring/preseason | Spring Record, Spring PCT, Spring Rank, Games Back when returned | Spring Training group |
| MLB regular season before Sept. 1 | Season Record, Current Streak, Last 10 | Division group |
| MLB regular season Sept. 1 onward | League Rank, Wild Card Rank, Wild Card Games Back when exposed | Division group |
| Postseason | Postseason Record, Postseason PCT, Games Played | Postseason group when returned |
| MiLB regular season | Explicit First Half or Second Half record, PCT, rank, and games back | Active returned half group |
| Unknown/special event | Concise unavailable explanation | No unsupported standings claim |

The early-season presentation intentionally uses existing normalized fields rather than expanding the saved snapshot contract solely for run differential. This preserves compatibility with stored v0.3/v0.4 normalized records.

## Hydration rules

- September MLB games request ordinary division standings and Wild Card-with-leaders standings.
- The normalizer keeps the division record as the primary team row and overlays only the separately scoped Wild Card fields.
- MiLB regular-season games probe first-half and second-half standings. A started second half wins; otherwise a started first half wins. If neither has games, ordinary regular-season standings are used as a conservative fallback.
- Preseason and postseason retain their explicitly scoped standings types.
- Special or unrecognized game types do not request standings.

## Layout behavior

- Same-division games retain `Away Team | Shared Standings | Home Team` on sufficiently wide Advanced layouts.
- At narrower widths, the three regions stack without document-level horizontal overflow.
- The separate Other Standings section still receives source-returned groups that do not contain either selected team.

### Build 002.2a smoke-test correction

- Wild Card-with-leaders response groups remain available for team-rank calculation but are no longer rendered as standalone Other Standings tables. This removes the stray one-team division cards seen in September MLB games.
- On wide Home layouts, the schedule card now caps itself to the available viewport and gives its remaining height to the schedule list. Long schedules scroll inside that card instead of extending the document.

## Verification

- 54 focused classifier, normalization-contract, Game Day, and compatibility tests pass.
- JavaScript syntax checks pass.
- Live browser smoke testing loaded v0.5.0-dev Build 002.2 against the Stats API.
- A current postseason game rendered Postseason Record/PCT/Games Played and omitted regular-season race framing.
- The same Advanced view at a 760-pixel viewport stacked to one column with no document-level horizontal overflow.
- No browser-console errors were reported.

## Next action

Build 002.3: add the page-wide Regular Season/Postseason player-stat toggle for postseason games, with independently cached scopes and a single selection applied across every player section.
