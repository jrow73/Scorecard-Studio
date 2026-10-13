# Build 004.8 Checkpoint

**Build:** Scorecard Studio `0.4.0-dev • Build 004.8d`  
**Date:** 2026-10-12  
**Scope:** Final Home control sizing and non-duplicative Game Day team/standings presentation

## Completed

- Bounded Home Date and Level controls at desktop, tablet, and phone widths.
- Split team facts into Compact/Standard record context and Advanced race-position context.
- Confirmed the normalized model exposes Wild Card Games Back and omitted the row when that value is not applicable or unavailable.
- Embedded relevant division standings in Advanced team presentations only.
- Added the requested three-column shared-division Advanced layout with a safe stacked fallback.
- Preserved Other Standings as Advanced-only content.
- Tightened only the Advanced player/stat tables to 640px so the full-screen two-team layout can fit without horizontal scrolling; Standard widths remain unchanged.
- Removed the repetitive Settings summary card and paired Favorite Team with Appearance at wide widths.
- Changed Home to load the complete selected-level schedule automatically while preselecting the saved favorite team's game whenever the levels match.
- Removed redundant Home actions and status, moved search and result count into their relevant areas, narrowed Level, and removed the selected-game empty-state gap.
- Split Home into sibling Schedule and Selected Game cards, with a fixed schedule header and independently scrolling results on wide screens.
- Made short schedules content-sized while retaining bounded scrolling for long schedules, and condensed each game to one status presentation.
- Advanced runtime, export, cache, and browser identity to Build 004.8d without changing `README.md`.

## Resume / acceptance gate

- 245 applicable v0.3/v0.4 automated checks pass.
- Application, Designer-interaction, and browser-acceptance JavaScript syntax checks pass.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.
- Package changed files only relative to the accepted Build 004.7d working tree.
- Request the six-step Build 004.8 smoke test documented in `docs/v0.4/builds/Build_004.md`.
