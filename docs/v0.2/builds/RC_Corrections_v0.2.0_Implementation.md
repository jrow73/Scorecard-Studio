# v0.2.0 Release Candidate Corrections

**Baseline:** accepted v0.2.0 Release Prep candidate (`0.2.0-dev`, Build `032.5`)  
**Scope:** release-review findings only; no new Designer feature expansion.

## Corrections

1. **Favorite Layout semantics/UI**
   - Added a separate `favoriteLayoutId` browser setting.
   - Layout Library selected-layout actions now include **Set as Favorite**; the current favorite is identified with `★ Favorite` and the action is disabled for that layout.
   - Home keeps the user's current in-session layout selection, but on a fresh load prefers the explicit favorite. The older `livePdfLayoutId` remains a fallback for browsers that have never set a favorite.
   - Deleting the favorite clears the favorite setting.

2. **Defensive Alignment role cleanup**
   - Removed the invalid Pitcher role from Home/Away Defensive Alignment. The role set now contains the nine lineup-derived roles supported by this workflow.
   - Opening a layout removes obsolete development-era Defensive Alignment mappings whose selector role is `P`, preventing stale `10 of 9 placed` states.

3. **Cancel incomplete repeated/record placement**
   - New Starting Pitcher Record Layout, Starting Lineup, Bench, and Bullpen objects are marked as discardable only during their initial placement transaction.
   - Pressing Escape before initial placement completes removes the unfinished object, saves the layout, and restores the palette/Inspector.
   - Cancelling placement changes on an already-established object does **not** delete that object.

4. **iPad child-modal outline**
   - Suppressed the focus outline on the transparent outer Layout Settings child `<dialog>`, leaving the styled inner child card as the only visible modal boundary.
   - No modal Save/Cancel/dirty-state behavior was changed.

5. **Release-candidate cache key**
   - Bumped first-party asset cache-busting from `020rc` to `020rc1` so browsers do not retain the pre-correction Release Prep assets.

## Deferred touch-friendly Designer investigation

Post-v0.2.0 roadmap item:

- touch-accessible multi-select mode and possible touch lasso;
- pinch-to-zoom for the PDF workspace;
- safer distinction between scrolling/panning and dragging placed objects;
- ensure multi-select actions (move, formatting, align/distribute, delete, copy/paste) are practical on touch devices.

These are usability improvements, not v0.2.0 release blockers. Toolbar zoom, normal touch scrolling, and standard touch controls remain functional.

## Known doubleheader limitation

For Game 2, player YTD statistics, overall W-L record, team Game #, and streak can update through completed Game 1. Standings-context fields such as division/league/wild-card rank/games-back and **Last 10** remain at the pre-Game-1 standings snapshot because they cannot be safely derived from Game 1 alone.

## Targeted acceptance

1. Set Layout A as Favorite, choose Layout B on Home, reload the app, and confirm Home defaults back to Layout A. Confirm changing the Home dropdown alone does not change the favorite.
2. Confirm Defensive Alignment shows nine roles with no Pitcher and reaches `9 of 9 placed` when complete. Open a development layout containing an old Pitcher placement and confirm it is removed.
3. For Starting Pitcher Record Layout, Starting Lineup, Bench, and Bullpen: begin initial placement and press Escape before clicking the PDF; repeat after the first point for two-point layouts. Confirm no abandoned object remains and palette counts return to the prior state.
4. Confirm **Change Placement** on an existing repeated/record object can still be cancelled without deleting the object.
5. On iPad Safari/Chrome, open a Layout Settings child and return to the parent; confirm the large child-dialog ghost outline no longer remains.
6. Run `node tests/release_v0_2_0.test.mjs`.

`app-meta.json` intentionally remains `0.2.0-dev` / Build `032.5` until final release acceptance is complete.

## Acceptance disposition — October 3, 2026

All four RC corrections passed manual verification and are accepted for v0.2.0. No additional RC feature work is required. The release may proceed to the final v0.2.0 metadata/documentation cut.
