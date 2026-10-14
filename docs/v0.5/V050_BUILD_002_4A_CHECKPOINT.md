# v0.5 Build 002.4a checkpoint

**Status:** Complete; smoke tests accepted  
**Date:** 2026-10-14

Build 002.4a is a focused smoke-test correction to the Build 002 wrap-up.

- Postseason Regular Season team context now resolves standings at the participating teams' final regular-season game date. This avoids the Stats API's empty dated standings response after the regular season and applies to MLB and MiLB.
- If that historical schedule lookup is unavailable, the alternate team card remains empty rather than relabeling current-series data as a final regular-season record.
- MLB September Advanced team cards retain Runs Scored, Runs Allowed, Run Differential, Home Record, and Away Record, then add League Rank, Wild Card Rank, and Wild Card Games Back.
- Player-stat scope behavior is unchanged.

Verification targets include the contextual Game Day tests, player-stat scope tests, model/schema tests, and direct API checks for final-date regular-season standings.
