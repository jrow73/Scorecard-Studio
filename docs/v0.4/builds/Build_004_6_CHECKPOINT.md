# Build 004.6e Checkpoint

**Acceptance:** User smoke accepted; Build 004.6 closed on 2026-10-11.  

**Build:** Scorecard Studio `0.4.0-dev • Build 004.6e`  
**Date:** 2026-10-11  
**Scope:** Compact Game Day research sheet, stable player/staff columns, aligned and named standings, Advanced pitching detail, stable core context, and empty-layout PDF guidance

## Completed

- Replaced the redundant Game Day introduction card with a compact toolbar and dense research sheet.
- Added a single-purpose no-game state.
- Moved venue/weather and officials to the top and kept section navigation sticky.
- Partitioned standings into participating-team groups for Standard and remaining groups for Advanced.
- Added stable standings labels and selected-team highlighting.
- Simplified pitching classification messages and removed `P?`.
- Removed duplicated visible Research Context while retaining closed Advanced technical details.
- Added disabled-state guidance and defensive errors for unmapped PDF layouts.
- Advanced runtime and cache identity to Build 004.6e without changing `README.md`.
- Capped and centered Game Day content on wide screens.
- Added a protected two-team gutter and shrink-safe columns.
- Kept pitcher and bench identity metadata inline when room permits and moved statistics next to the identity block.
- Kept Compact lineup tables content-sized rather than stretching their columns across wide displays.
- Converted pitching and bench lists to the same columnar table treatment used by lineups.
- Moved Bench directly below Starting Lineups and removed redundant pitcher role prefixes.
- Kept Game, Venue & Weather, Officials, and both team summaries fully expanded at every detail level.
- Limited the overview game number to doubleheaders, removed Day/Night and Competition, and shortened the missing-role notice.
- Added optional current-brand SVG team logos with automatic text-only fallback.
- Prevented manager and coaching titles from wrapping unnecessarily.
- Removed the forced Advanced table width and tightened Advanced stat columns.
- Added responsive stacking for Advanced paired player tables before horizontal crowding occurs.
- Bound relevant standings to the corresponding away/home team rather than source return order.
- Condensed shared same-division standings and arranged Other Standings in a responsive two-column grid.
- Added Advanced pitching columns for G, IP, BB, SV, and HLD while preserving the concise Standard set.
- Fixed lineup, bench, and pitching column measurements so independently rendered tables stay aligned.
- Bounded staff-role width so long titles wrap without moving the person-name column.
- Recovered authoritative MiLB division names from returned team division-record metadata when the group-level object contains only an ID.

## Resume / acceptance gate

- 234 applicable v0.3/v0.4 automated checks pass, including dedicated Build 004.6e table-alignment and MiLB standings-name regressions.
- JavaScript syntax checks pass.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.
- Populated historical-game browser preview confirms compact lineup/bench/pitching tables, live SVG team logos, stable core context in Compact, and correct detail-level hiding.

Package changed files only, then request the Build 004.6e smoke test documented in `docs/v0.4/builds/Build_004.md`.
