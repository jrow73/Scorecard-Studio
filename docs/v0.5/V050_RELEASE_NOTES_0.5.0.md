# Scorecard Studio v0.5.0 Release Notes

Scorecard Studio v0.5.0 expands Game Day into a responsive, spoiler-safe pregame research companion while preserving the scorecard-generation and layout workflows accepted in v0.4.

## Highlights

- Competition-aware MLB, MiLB, Spring, September playoff-race, and postseason team context.
- Postseason `Regular Season | Postseason` player-and-team context switching.
- Verified MiLB `First Half | Second Half` context switching when split-season data is available.
- Postseason series context in every Game Day detail level without revealing results beyond the selected game's pregame cutoff.
- Team performance facts, matchup-aware home/away record highlighting, division context, and MLB Wild Card standings.
- Schedule weather hydration with Feed fallback.
- Accessible player identity popovers for distinct formal names and API-supplied pronunciation.
- A simplified user-facing Game Day page without development-oriented helper lines or source diagnostics.

## Deliberate exclusions

- Baseball Savant-derived field diagrams were not included because a stable authorized extraction and redistribution path was not established.
- Automatic cloud synchronization and OAuth are not included. Backup export/import remains the supported portability workflow.
- Pronunciations are never synthesized and audio pronunciation is not included.
- Generated PDFs do not follow the interactive Game Day player-stat scope selector.
- Live scores and other spoiler-bearing additions remain outside the product's pregame purpose.

## Compatibility

The release does not change the IndexedDB storage version, saved-layout structure, PDF-template structure, or normalized schema revision. Existing v0.4 browser data remains in place when the application files are upgraded normally. A complete backup before replacing application files remains recommended.
