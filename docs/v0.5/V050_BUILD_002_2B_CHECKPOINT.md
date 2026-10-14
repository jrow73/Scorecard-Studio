# Scorecard Studio v0.5 — Build 002.2b Checkpoint

**Status:** Complete  
**Date:** 2026-10-13  
**Implementation baseline:** accepted runtime Build 002.3a  
**Runtime identity after integration:** v0.5.0-dev, Build 002.3b

> Superseded for completed-game series-record handling by `V050_BUILD_002_2C_CHECKPOINT.md`.

## Outcome

The late correction to Build 002.2 now treats postseason data as series context instead of ordinary standings and exposes the source-provided MLB Wild Card race in September. The public corrective scope remains Build 002.2b; the runtime advances monotonically from 002.3a to 002.3b because Build 002.3 had already shipped.

## Postseason presentation

- Schedule `seriesDescription`, `seriesGameNumber`, and `gamesInSeries` are preserved in the selected schedule item and normalized Game model when returned.
- Standard and Advanced team cards label Schedule `leagueRecord` values as **Series Record**. They no longer describe that current-round record as a cumulative postseason record.
- PCT, Games Played, Division Rank, and Games Back are suppressed from postseason team summaries.
- Standard and Advanced views place a shared center card between the team cards. It shows the source series description, game number/maximum series length, best-of length, and a current series lead/tie statement derived from the two source records.
- The center card stacks between the teams on narrower screens.
- Missing series metadata falls back to a generic Postseason Series title; missing records produce an explicit unavailable message.
- Postseason views do not render the prior “Contextual standings are not available” message beneath each team.

## September MLB Wild Card presentation

- Existing September MLB hydration continues to request both `regularSeason` and `wildCardWithLeaders` standings.
- Only records explicitly returned as `wildCard` become visible Wild Card tables in Other Standings.
- Auxiliary `divisionLeaders` records remain data-only and do not become duplicate or one-team cards.
- Wild Card rows use `wildCardRank` and `wildCardGamesBack`, not division-rank fallbacks.
- American League and National League Wild Card tables show W–L, PCT, WCGB, streak, Last 10, and returned clinch/elimination state.
- The standings cutoff date is displayed above the Wild Card tables.
- Division standings remain available alongside the two Wild Card tables.

## Compatibility

- The normalized schema adds an optional `game.series` object. Existing saved snapshots remain valid.
- Series claims are driven by explicit postseason game type and source-returned Schedule fields.
- No series bracket, cumulative postseason team record, or Wild Card table is synthesized from unrelated records.

## Verification

- JavaScript syntax checks pass for all modified runtime modules.
- Fifty focused competition-context, schedule normalization, standings normalization, player-scope, model-contract, and field-outline gate tests pass.
- New regression tests cover truthful Series Record labels, center-card series output, explicit Wild Card visibility, division-leader suppression, and normalized series metadata.

## Smoke-test focus

1. Open an MLB LCS Game 2 in Standard and Advanced modes. Confirm the team cards say Series Record and the center card reports the series name, Game 2 of 7, Best of 7, and the correct 1–0 leader.
2. Confirm no Division Rank, Games Back, Postseason PCT, or unavailable-standings message appears in those postseason team cards.
3. Open an MLB regular-season game on or after September 1 in Advanced mode. Confirm both league Wild Card tables appear at the bottom of Other Standings after the ordinary division cards.
4. Confirm the Wild Card tables contain full source groups—not one-team division-leader cards—and use WC Rank/WCGB headings.
5. Check Standard and Advanced layouts at a narrow viewport and confirm the series card stacks without document-level horizontal overflow.
