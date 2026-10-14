# Scorecard Studio v0.5 — Build 002.2c Checkpoint

**Status:** Complete  
**Date:** 2026-10-13  
**Implementation baseline:** corrective Build 002.2b / runtime Build 002.3b  
**Runtime identity after integration:** v0.5.0-dev, Build 002.3c

## Outcome

Completed postseason games remain spoiler-free. A source Schedule record that has already incorporated the selected final result is restored to the record entering that game. A source that already returns the pregame record is preserved unchanged.

## Cutoff rule

- Apply the rule only to a selected game whose normalized state is Final and whose Schedule response includes a positive `seriesGameNumber`.
- Count the games represented by both returned team records.
- If both totals equal the selected `seriesGameNumber`, the selected result is proven to be included. Remove one win from the returned winner and one loss from the returned loser.
- If both totals equal `seriesGameNumber - 1`, the response is already at the pregame cutoff and is not altered.
- If the totals or winner flags do not prove either condition, preserve the source values rather than guess.
- Record the rollback in normalized lineage as `remove-selected-final-game-result`.

This distinction covers the observed API difference: completed MLB ALCS Game 2 returned 1–1 for both teams, while completed Double-A Championship Game 3 returned the entering 1–1 records.

## Postseason standings isolation

The competition policy no longer requests a separate postseason standings response. Those standings were not displayed and could overwrite the cutoff-safe Schedule record with current results. Postseason player-stat scopes are unchanged.

## Verification

- The focused v0.5 and normalized-model suite passes 51 of 51 tests.
- Regression coverage proves that a final Game 2 postgame 1–1 response becomes the entering 1–0 / 0–1 state.
- Regression coverage proves that a final Game 3 response already containing two games remains 1–1 / 1–1.
- Live browser verification against MLB game 849813 displays Cleveland 1–0, Tampa Bay 0–1, and “Cleveland Guardians lead series, 1–0” even though the game status is Final.

## Smoke-test focus

1. Open completed ALCS Game 2. Confirm the cards show Cleveland 1–0 and Tampa Bay 0–1, with Cleveland leading the series 1–0.
2. Open completed Double-A Championship Game 3. Confirm the cards remain 1–1 and 1–1.
3. Open an upcoming postseason game and confirm its source pregame series record is unchanged.
4. Confirm the Regular Season / Postseason player-stat toggle still loads and switches normally.
