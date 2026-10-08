# Scorecard Studio v0.3.0 — Installation and Rollback

## Install the final release

1. Preserve a copy of the currently installed application bundle as the rollback artifact.
2. For a clean installation, extract the complete release archive. For the established cumulative repository already updated through Build 005.3, overlay the Build 005.4 changed-files package.
3. Do not delete browser storage. Existing settings, layouts, and PDF templates remain compatible.
4. Reload the application. The user-facing version label should display `0.3.0`.
5. Refresh the selected game once before final acceptance so the displayed data is retrieved under the promoted build.

The complete-release archive produced by Build 005.4 is suitable for a clean deployment without replaying incremental overlays. Internal metadata retains runtime Build `005.2` for traceability.

## Acceptance after installation

- Open Home, Game Day, Field Diagnostic, Layouts, and the Designer.
- Confirm the additional-starter preference remains off by default and affects presentation only.
- Generate a live PDF from an existing v0.2 layout.
- Generate the established name-test PDF and confirm a formal/preferred-name distinction plus a source-supplied boxscore name.
- Confirm saved layouts and PDF templates remain present.

## Rollback

Rollback replaces application files only:

1. Restore the accepted Build 004.8b application bundle.
2. Reload the browser.
3. Do not clear, migrate backward, or replace IndexedDB data.

Build 004.8b and v0.3.0 use the same normalized schema revision and storage structure. Derived normalized snapshots may be reused when they pass the exact contract/game/view checks; otherwise they are recomputed. Settings, layouts, and PDF templates are unaffected.

## Recovery boundary

If a problem is limited to stale browser modules, reload after confirming the deployed files carry cache identity `030b0054`. Clearing all site data is not a normal installation or rollback step because it would also remove user-authored local layouts and PDF templates.
