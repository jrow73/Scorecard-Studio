# Scorecard Studio v0.4.0 — Installation and Rollback

## Install the final release

1. Preserve the currently installed application bundle as the rollback artifact.
2. For a clean installation, extract `Scorecard-Studio_v0.4.0_complete-release.zip` into the deployment location.
3. If accepted Build 004.9 is already installed, overlay `Scorecard-Studio_v0.4.0_release-changes.zip` instead.
4. Do not delete browser storage. Existing settings, layouts, and PDF templates remain compatible.
5. Reload the application. The user-facing version label should display `0.4.0`.
6. Refresh the selected schedule once so browser modules and game data load under the final release identity.

## Acceptance after installation

- Open Home, Game Day, Layouts, and Settings.
- Confirm existing layouts and PDF templates remain available.
- Generate one test PDF and one live scorecard PDF.
- Confirm appearance and backup controls remain available.
- For a cross-timezone game, confirm the browser shows both relevant times and the PDF uses the game-local time only.

## Rollback

Rollback replaces application files only:

1. Restore the accepted Build 004.9 application bundle.
2. Reload the browser.
3. Do not clear, migrate backward, or replace IndexedDB data.

Build 004.9 and v0.4.0 use the same normalized schema, IndexedDB version, backup envelope, settings, layout, and PDF-template contracts.

## Recovery boundary

If a problem is limited to stale browser modules, confirm the deployed files carry cache identity `040` and perform a normal reload. Clearing all site data is not a standard installation or rollback step because it removes user-authored local content.
