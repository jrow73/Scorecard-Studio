# Scorecard Studio v0.5 — Build 002.3 Checkpoint

**Status:** Complete  
**Date:** 2026-10-13  
**Runtime identity:** v0.5.0-dev, Build 002.3a

## Outcome

Postseason Game Day views now provide a page-wide `Regular Season | Postseason` player-stat control in the sticky section navigation. The control changes every player table together without reloading the selected game or making a new API request.

## Behavior

- The control is shown only when the selected game is classified as postseason and both player-stat scopes are configured.
- Postseason is the initial selection for a newly selected postseason game.
- The selection remains local to the current Game Day session and resets when the selected game changes.
- Lineups, bench, selected starters, additional starters, and bullpen all use the same selected scope.
- Regular-season and postseason data are loaded independently during Game Day hydration and retained in memory for immediate switching.
- Postseason totals combine the established `F,D,L,W` game-type set through the same pregame cutoff used elsewhere.
- A live status line identifies the scope currently displayed.

## Empty and zero states

- Missing or unusable returned statistics remain unavailable and render as em dashes.
- Returned statistics with zero recorded appearances remain legitimate zero values.
- The status text distinguishes unavailable data from a returned scope with no prior appearances; the application does not silently fall back to regular-season totals.

## Compatibility

- Non-postseason Game Day views keep their existing single-scope presentation and do not show the control.
- Generated scorecards retain the accepted pre-Build-002.3 behavior and do not follow the Game Day-only scope selection.
- The cached scope models are presentation-only and do not replace the saved normalized pregame snapshot.

### Build 002.3a smoke-test correction

- A combined postseason People response can contain one MLB split per completed round plus a single explicit `All` aggregate covering the requested `F,D,L,W` scope.
- The normalizer now selects that explicit aggregate when multiple exact-sport round splits exist. A player who appeared in more than one round therefore receives cumulative postseason totals instead of an ambiguous/unavailable result.
- A single exact-sport split remains preferred for ordinary one-scope requests, preserving regular-season behavior.

## Verification

- JavaScript syntax checks pass.
- 57 focused competition-context, normalization-contract, Game Day, Home, and Build 002.3 tests pass.
- Live browser verification loaded the October 13, 2026 Cleveland at Tampa Bay postseason game from the Stats API.
- The page defaulted to Postseason, then switched lineup, bench, and pitching values together to Regular Season and back to Postseason.
- The scope change completed from the already loaded models, with no refresh path invoked and no browser-console warnings or errors.

## Next action

Build 003.1: investigate a development-only Baseball Savant field-outline extraction process, validate venue coverage and geometry stability, and complete the reuse review before making a go/no-go decision for runtime diagrams.
