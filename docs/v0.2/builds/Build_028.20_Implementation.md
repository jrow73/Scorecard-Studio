# Build 028.20 — Build 028 Closure

## Baseline

Build 028.19 full checkpoint (`Scorecard-Studio_v0.2.0_Build028.19_Checkpoint.zip`).

## Scope

This is the closure pass for Build 028. It contains only two small Designer toolbar text changes plus documentation reconciliation. No Designer workflow, data, rendering, formatting, palette, sorting, or persistence behavior is intentionally changed.

## UI changes

1. **Close Layout Designer**
   - Designer header button text changes from `Back to Layouts` to `Close Layout Designer`.
   - Existing navigation behavior is unchanged.

2. **Compact PDF page navigation**
   - Designer PDF page controls change from `Previous` / `Next` text to `←` / `→`.
   - Accessible labels/titles retain the meanings `Previous PDF page` and `Next PDF page`.
   - Page-number display and navigation behavior are unchanged.

## Documentation reconciliation

- `Build_028_Implementation.md` now describes the final accepted Build 028 state rather than the first implementation round.
- `DESIGNER_COMPLETION_INVENTORY.md` records Build 028 as closed and identifies Builds 029–032 as the remaining v0.2.0 runway.
- `AI.md` is reconciled to the same current roadmap.
- `README.md` is intentionally unchanged.

## Remaining v0.2.0 roadmap

- **Build 029 — Pregame Data Context & Semantics:** doubleheader-aware pregame snapshots, venue-local First Pitch, Team Game Number.
- **Build 030 — Layout Settings Workflow:** consistent parent/child modal architecture with fixed chrome and transactional Save/Cancel behavior.
- **Build 031 — Text Template Workflow Completion:** finish generic Text Template palette/creation workflow, preferably flattening its redundant hierarchy if implementation risk remains reasonable.
- **Build 032 — v0.2.0 Designer Completion / Release Review:** full regression and release-readiness pass; no planned new feature scope.

## Acceptance checks

1. Designer header reads **Close Layout Designer** and still returns to Layouts.
2. Designer page-navigation controls display **←** and **→** and still navigate pages correctly.
3. Screen-reader/title text identifies those controls as Previous/Next PDF page.
4. Build label reports 028.20.
5. `README.md` is byte-for-byte unchanged from the 028.19 checkpoint.
