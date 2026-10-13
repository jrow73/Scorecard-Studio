# Scorecard Studio v0.2.0 Release

**Release status:** Final  
**Release date:** October 3, 2026  
**Development baseline:** Build 032.5 plus accepted v0.2.0 Release Prep and RC Corrections

## Release summary

v0.2.0 completes the primary Layout Designer milestone. The release includes the browser-based Layout Library and Designer, representative-data Test PDF generation, live pregame PDF generation, persistent browser storage, formatting and Text Template workflows, repeated collections, Defensive Alignment, undo/redo, multi-select, copy/paste, alignment/distribution tools, shrink-to-fit controls, and explicit Favorite Layout behavior.

## Release-candidate closure

Manual release acceptance covered startup/Home, Layout Manager and persistence, Designer core workflows, PDF generation and pregame data, cancellation/edge cases, and iPad/touch use. The four RC findings were corrected and accepted:

- Favorite Layout is now an explicit preference distinct from the temporary/last-used Home layout selection.
- Defensive Alignment no longer exposes the invalid Pitcher role.
- Escape during the initial placement of a new Starting Pitcher Record, Starting Lineup, Bench, or Bullpen discards the incomplete object rather than leaving an orphaned mapping.
- The iPad/WebKit ghost outline around Layout Settings child dialogs is suppressed.

## Known intentional limitations

For Game 2 of a same-day doubleheader, completed Game 1 data may advance supported player YTD values, team W/L, game number, and streak. Standings-derived values, including division/league/wild-card position and Last 10, remain based on the previous-day snapshot. Last 10 cannot be safely advanced from an aggregate record without knowing which oldest game leaves the rolling ten-game window.

Browser storage remains device/browser-local. Cloud synchronization and general backup/import are not part of v0.2.0.

## Deferred roadmap

- Touch-Friendly Designer investigation: touch multi-select/lasso alternative, pinch-to-zoom, safer pan-versus-drag handling, and touch access to multi-item operations.
- Game-day/Home improvements, including timezone presentation and doubleheader disclosure.
- Collection/player-role refinements where useful, including future bullpen SP-versus-P information.
- Team-logo support and other post-v0.2.0 data/UI enhancements.

## Release engineering

- User-facing application version promoted from `0.2.0-dev` to `0.2.0`.
- Development build suffix removed from displayed release metadata.
- First-party asset cache key finalized as `020`.
- MIT license added at repository root.
- README reconciled to describe implemented v0.2.0 behavior and clearly identify deferred capabilities.
