# Scorecard Studio v0.5 — Build 002.4 Checkpoint

**Status:** Complete; smoke test accepted with the Build 002.4a correction  
**Date:** 2026-10-14  
**Implementation baseline:** Build 002.2f / runtime Build 002.3f  
**Runtime identity after integration:** v0.5.0-dev, Build 002.4

## Outcome

Build 002 now closes with a coordinated team-and-player competition context instead of independent labels that repeat the same standings facts.

- Restores Schedule weather hydration and uses Feed weather as a fallback when the Schedule projection is sparse.
- Shows the postseason Series Context in Compact, Standard, and Advanced modes with plain `Game N, Best of N` text.
- Replaces duplicated early-season MLB, Spring, and MiLB-half Advanced facts with Runs Scored, Runs Allowed, Run Differential, Home Record, and Away Record.
- Shows both home/away records and highlights the matchup-relevant record using the selected-team standings treatment.
- Extends the postseason selector so Regular Season displays final team records and standings while Postseason retains pregame series records.
- Adds a verified MiLB `First Half | Second Half` selector during the second half. It changes player totals, team records, and standings together and defaults to Second Half.
- Derives the MiLB half boundary from explicit second-half standings history; if that boundary cannot be established, the split-stat selector is withheld.
- Keeps alternate standings isolated from the original postseason series snapshot so switching scopes cannot reintroduce completed-game spoilers.

## Verification

- All 53 current v0.5 plus affected normalization/schema tests pass.
- Static integration checks require independent cached player and standings scopes, dynamic selector choices, series-safe rendering, and Build 002.4 cache identities.
- The repository-wide historical suite was also run; its remaining failures are the expected frozen v0.2/v0.3/v0.4 build-identity and superseded-UI assertions rather than failures in the current v0.5 suite.

## Smoke-test focus

1. Confirm weather appears for a game whose Schedule response includes weather and for one requiring Feed fallback.
2. Confirm an MLB early-season Advanced card shows the five performance facts and highlights Away Record on the away card and Home Record on the home card.
3. Confirm Spring and MiLB half-season Advanced cards use the same performance layout with competition-scoped values.
4. During an MLB postseason game, switch between Regular Season and Postseason and verify team records/standings and all player tables change together while Series Context remains pregame-safe.
5. During a MiLB second-half game, switch between First Half and Second Half and verify team records, division tables, and all player tables change together without another request.
6. Confirm Series Context appears in Compact and uses plain `Game N, Best of N` text.

