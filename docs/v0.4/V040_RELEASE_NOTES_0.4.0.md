# Scorecard Studio v0.4.0 — Release Notes

**Release:** `0.4.0`  
**Runtime build:** `004.9`  
**Release date:** 2026-10-12

## Highlights

Scorecard Studio v0.4.0 turns the schema-v2 application introduced in v0.3 into a more complete, portable, responsive pregame workflow.

- Home loads the complete schedule for the chosen date and level, preselects the favorite team's game when applicable, and provides immediate local search.
- Game Day offers remembered Compact, Standard, and Advanced detail levels with clearer team facts, standings, lineups, bench, pitching groups, staff, officials, venue, and weather presentation.
- The application uses a compact four-destination shell: Home, Game Day, Layouts, and Settings. Designer remains contextual to a saved layout.
- Layout Library, Layout Settings, and Field Palette use focused workflows with search, collapsible categories, verified Away/Home mirroring, and responsive modal containment.
- Complete and single-layout backups include portable settings, layouts, and referenced PDFs with integrity checks, preflight review, conflict handling, and atomic restore.
- System, Light, and Dark appearance preferences apply immediately, persist, and participate in complete backups.
- Keyboard, reduced-motion, narrow-screen, mouse, and touch behavior received dedicated refinement, including safeguards against accidental touch dragging.
- Home and Game Day show user-local and game-local first-pitch times when they differ. Generated scorecards use only the game's venue-local time.

## Compatibility

- Existing v0.3 settings, layouts, and PDF templates require no migration or resave.
- IndexedDB remains at version 4.
- Backup envelope format remains version 1.
- Opening a saved layout remains non-destructive.
- Schema-v2 snapshots and adapter results remain derived cache data and may be recomputed when necessary.

## Acceptance evidence

- 248 applicable v0.3/v0.4 automated checks pass.
- Final asset resolution, module import, cache identity, storage boundary, backup boundary, product-surface, and README integrity checks pass.
- All production JavaScript files pass syntax validation.
- Manual acceptance covered the principal desktop, narrow-screen, touch, backup, Game Day, Layout, Designer, and PDF workflows.

## Deferred work

- Cloud synchronization remains a future product investigation and is not included in v0.4.0.
- Provider authentication, remote revisions, cross-device conflict handling, and deletion propagation require a separate design and security boundary.

## Protected product roadmap

`README.md` remains the protected v1 end-state document. The v0.4.0 current state, compatibility guarantees, and deferred scope are recorded here and in the v0.4 build documentation.
