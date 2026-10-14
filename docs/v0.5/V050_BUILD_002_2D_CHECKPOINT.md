# Scorecard Studio v0.5 — Build 002.2d Checkpoint

**Status:** Complete  
**Date:** 2026-10-13  
**Implementation baseline:** corrective Build 002.2c / runtime Build 002.3c  
**Runtime identity after integration:** v0.5.0-dev, Build 002.3d

## Outcome

Other Standings now preserves the Game Day left/right team relationship for interleague games. On a wide screen, all standings groups for the away team's league remain in the left column and all groups for the home team's league remain in the right column. The established one-column narrow-screen layout is unchanged.

MLB Wild Card status now uses the source API's `wildCardEliminationNumber` rather than its general `eliminationNumber`. The general field can indicate that a club is eliminated from its division race even while it remains alive in—or has clinched—a Wild Card position.

## Observed API distinction

For the 2026-09-23 MLB Wild Card response, the Padres, Cubs, and Phillies returned general `eliminationNumber: "E"` but Wild Card `wildCardEliminationNumber: "-"`. The former is not a valid Wild Card-status signal. Scorecard Studio now projects the latter into the Wild Card table.

## Verification

- Regression coverage proves that opposite-league division groups receive the correct away/home column assignment regardless of source order.
- Regression coverage proves that Wild Card rows ignore the general elimination marker and preserve the Wild Card-specific marker.
- Existing same-league and narrow-screen standings behavior remains covered.

## Smoke-test focus

1. Open a September MLB interleague game in Advanced mode and scroll to Other Standings.
2. Confirm both divisions associated with the away team's league are on the left and both divisions associated with the home team's league are on the right.
3. Confirm the National League Wild Card table does not label the Padres, Cubs, or Phillies eliminated for the 2026-09-23 cutoff.
4. Narrow the browser and confirm all standings groups stack into one column.
