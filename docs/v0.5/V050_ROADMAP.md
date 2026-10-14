# Scorecard Studio v0.5 Roadmap

**Status:** Complete; v0.5.0 released as Build 005.2  
**Date:** 2026-10-14  
**Baseline:** accepted Scorecard Studio v0.4.0, Build 004.9

## Release objective

Make Game Day more context-aware and informative without making its tables busier. v0.5 adapts Advanced mode to the selected game's competition phase, adds honest regular/postseason player-stat switching, improves venue presentation when an evidenced field outline exists, and exposes optional player identity details through accessible popovers.

Automatic cloud synchronization is not part of v0.5. It remains deferred to a possible post-v1 release. Existing local backup and restore remain the supported portability workflow.

## Product principles

1. Show facts that are meaningful for the selected competition phase.
2. Keep regular-season, spring, half-season, and postseason records separately labeled and sourced.
3. Never invent missing rankings, pronunciation, or diagrams.
4. Preserve established pregame cutoffs and no-spoiler behavior.
5. Treat diagrams and popovers as progressive enhancement.
6. Support mouse, keyboard, and touch.

## Planned builds

### Build 001 — Evidence and context contract

#### Build 001.1 — Roadmap and source findings

**Status:** Complete.

- Record season classification, postseason stat scopes, field-diagram feasibility, and player identity fields.
- Separate confirmed behavior from discovery-gated behavior.
- Make no runtime change.

#### Build 001.2 — Fixture discovery

**Status:** Complete (2026-10-13). See `V050_BUILD_001_2_CHECKPOINT.md`.

- Capture representative MLB season/special-event controls.
- Verify first-half and second-half standings across supported MiLB levels.
- Verify separate regular/postseason player totals through Single-A.
- Capture formal/preferred-name and optional-pronunciation cases.
- Record current MLB venue-ID coverage separately from diagram reuse approval.

**Acceptance:** satisfied by DISC-023 through DISC-027 plus reused DISC-003/DISC-012 controls.

### Build 002 — Season-aware Game Day

#### Build 002.1 — Competition-phase classifier

**Status:** Complete (2026-10-13). See `V050_BUILD_002_1_CHECKPOINT.md`.

- Add normalized presentation context independent from raw game-type labels.
- Classify MLB preseason, early/midseason, playoff-race season, postseason, and unknown contexts.
- Classify MiLB first/second half from explicit standings capability rather than a universal date.
- Preserve raw type and provenance for diagnostics.

#### Build 002.2 — Contextual Advanced team cards

**Status:** Complete (2026-10-14), including Build 002.2a through 002.2f, the Build 002.4 wrap-up, and its 002.4a postseason-standings correction. See the Build 002 checkpoint series and `V050_BUILD_002_4_CHECKPOINT.md`.

Retain the accepted Standard card during applicable regular-season contexts. In postseason, label Schedule records at their actual current-series scope and remove division-race fields.

Adapt Advanced mode:

| Context | Preferred summary |
| --- | --- |
| MLB preseason | Runs scored/allowed, run differential, and home/away records scoped to Spring |
| MLB regular season before Sept. 1 | Runs scored/allowed, run differential, and home/away records |
| MLB regular season Sept. 1 onward | League Rank, Wild Card Rank, Wild Card Games Back when returned |
| MLB postseason | Postseason/series context and verified regular-season finish; no live division-race framing |
| MiLB regular season | Active-half performance facts plus the explicitly scoped half standings |
| Unknown | Hide claims whose competition meaning cannot be established |

- Show division/half standings only when meaningful.
- Preserve the accepted same-division layout: Away Team | Shared Standings | Home Team.
- Avoid duplicating the same facts in team summaries and standings.
- For postseason Standard and Advanced views, place a shared series-context card between the team cards when series metadata is returned.
- Keep completed postseason games at their pregame series cutoff even when the Schedule response has already advanced the current-series record.
- For September MLB regular-season games, append the two explicit source Wild Card groups to Other Standings while suppressing the response's auxiliary division-leader groups.

#### Build 002.3 — Postseason player-stat toggle

**Status:** Complete (2026-10-13), including the Build 002.3a multi-round postseason aggregate correction. See `V050_BUILD_002_3_CHECKPOINT.md`.

- Show a page-wide `Regular Season | Postseason` control only for postseason games.
- Keep it with the sticky Game Day controls.
- Switch lineups, bench, selected starters, additional starters, and bullpen together.
- Fetch/cache scopes independently; switching must not refetch.
- Combine `F,D,L,W` through the established pregame cutoff.
- Distinguish true zero appearances from unavailable data.
- Keep selection local to the Game Day session/game.
- Initially leave generated PDF behavior unchanged.

**Tentative default:** Postseason. If there are no prior postseason appearances, show a clear empty state rather than silently changing scopes.

#### Build 002.4 — Coordinated team/stat context wrap-up

**Status:** Complete (2026-10-14); smoke tests accepted with the Build 002.4a correction. See `V050_BUILD_002_4_CHECKPOINT.md` and `V050_BUILD_002_4A_CHECKPOINT.md`.

- Make the postseason selector switch final regular-season team context together with player statistics while preserving the pregame series card.
- Add a verified `First Half | Second Half` team-and-player context selector for MiLB second-half games.
- Replace redundant Advanced summaries with competition-scoped performance facts and matchup-aware home/away highlighting.
- Restore weather hydration/fallback and finish the Compact postseason-series presentation.

### Build 003 — Venue presentation and field outlines

#### Build 003.1 — Field-outline extraction spike

**Status:** Complete (2026-10-13), with a no-go decision. See `V050_BUILD_003_1_CHECKPOINT.md`.

- Build an independent, development-only Savant geometry extractor.
- Reduce source SVG to allowlisted geometry keyed by MLB venue ID.
- Preserve fence labels/orientation only when reliably parsed.
- Add fixtures and minimum-coverage validation.
- Document refresh and attribution.
- Complete terms/reuse review before release.

**Go/no-go:** if stable extraction or acceptable reuse cannot be established, retain textual dimensions and ship the rest of v0.5 without diagrams.

**Decision:** No-go for v0.5. The observed Savant geometry is embedded in an undocumented compiled application bundle, and an authorized automated collection and redistribution path for that geometry was not established. The reference project was inspiration only and its licensing does not control an independent Scorecard Studio implementation. No extractor, copied geometry, or runtime Savant dependency is included.

#### Build 003.2 — Theme-aware diagram renderer

**Status:** Skipped under the Build 003.1 no-go decision.

- Render accepted geometry as inline SVG using application theme variables.
- Update immediately for System, Light, and Dark modes.
- Provide venue-specific accessible descriptions.
- Scale without horizontal overflow and stack on narrow screens.
- Keep runtime assets local to the static application.

#### Build 003.3 — Game/Venue/Officials layout

**Status:** Skipped under the Build 003.1 no-go decision. The user's proposed Officials relocation was conditional on a field diagram being available, so the accepted Game/Venue/Officials layout and textual field-dimension fallback remain unchanged.

- Move Officials beneath Game information in Advanced mode.
- Use compact columns when wide and a readable stack when narrow.
- Place the diagram beside Venue & Weather.
- Hide printed dimensions only while a valid diagram is present.
- Do not reserve empty diagram space on failure or absence.

### Build 004 — Player identity popovers

#### Build 004.1 — Identity projection

**Status:** Complete (2026-10-14). See `V050_BUILD_004_1_CHECKPOINT.md`.

- Preserve formal first/last, preferred/display name, and optional pronunciation.
- Compare normalized Unicode-aware name values before deciding whether the formal name differs.
- Preserve API pronunciation verbatim.

#### Build 004.2 — Accessible interaction

**Status:** Complete (2026-10-14); smoke tests accepted. See `V050_BUILD_004_2_CHECKPOINT.md`.

- Apply popovers consistently to lineup, bench, and pitching names.
- Support hover, focus, Enter/Space, touch tap, Escape, outside click, and second-tap dismissal.
- Keep popovers inside the viewport and above sticky/table overflow layers.
- Avoid table reflow and accidental activation during touch scrolling.

### Build 005 — Integration and release closure

#### Build 005.1 — Cross-feature integration

**Status:** Complete (2026-10-14); user acceptance recorded. See `V050_BUILD_005_1_CHECKPOINT.md`.

- Exercise every Game Day detail level and season context.
- Verify sticky controls under narrow wrapped headers.
- Verify theme changes with a diagram or popover visible.
- Verify refresh/cache/game changes cannot carry stale scopes or popovers.
- Confirm Home, Layout Designer, saved layouts, and PDFs remain unchanged unless deliberately added later.

#### Build 005.2 — Acceptance and packaging

**Status:** Complete (2026-10-14). See `V050_BUILD_005_2_CHECKPOINT.md` and `V050_RELEASE_PACKAGE_MANIFEST.md`.

- Run automated contract/integration coverage.
- Perform desktop, narrow-browser, keyboard, and available touch-device smoke tests.
- Update release documentation and manifests.
- Record unsupported cases as carryovers.
- Produce the canonical v0.5.0 archive only after acceptance.

## Explicitly out of scope

- Automatic cloud synchronization or OAuth.
- User-authored stadium diagrams.
- Guaranteed MiLB field outlines.
- Audio pronunciation or guessed pronunciation.
- Making generated PDFs follow the Game Day player-stat toggle.
- Live scores or other spoiler-bearing additions.

## Next action

v0.5.0 is complete. Begin future work from the accepted Build 005.2 release baseline.
