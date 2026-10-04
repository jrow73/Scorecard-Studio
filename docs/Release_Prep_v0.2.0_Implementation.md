# v0.2.0 Release Prep — Implementation

**Baseline:** Build 032.5 Final  
**Purpose:** Release engineering and hygiene only; no new Designer feature scope.

## Changes

1. Standardized first-party browser cache-busting keys to `?v=020rc` for the initial v0.2.0 release-candidate cycle. The subsequent RC-corrections package bumps the key to `?v=020rc1`. This includes `index.html` CSS/app references and internal ES-module imports.
2. Kept `app-meta.json` at `0.2.0-dev` / Build `032.5`. The public version is not promoted to `0.2.0` until manual release acceptance passes.
3. Normalized source-file headers to `Version: 0.2.0-dev` and removed stale per-file Build labels. Git/build documentation remains the source of file history.
4. Removed nine DOM registry references confirmed to have no consumers in current `app.js`. No behavior or markup was changed for this cleanup.
5. Reconciled `docs/AI.md` and `docs/DESIGNER_COMPLETION_INVENTORY.md` with an explicit current release-prep status and corrected specific stale roadmap/Undo-Redo statements. Historical implementation material remains for context.
6. Added `tests/release_v0_2_0.test.mjs` as the authoritative current release-prep regression entry point. Historical build tests remain useful development records but are not expected to all pass against later builds because many assert build-specific metadata or superseded UI.

## Release-prep acceptance

Run:

```text
node tests/release_v0_2_0.test.mjs
```

Expected result:

```text
v0.2.0 release-prep regression checks passed.
```

Manual spot checks before the full release acceptance pass:

- Load the app normally and confirm Home and Layouts open without console/module-load errors.
- Open the Designer and confirm the final `Layout Designer` header remains with no development eyebrow.
- Open representative Text Template workflows and confirm accepted Editor / Insert into editor terminology remains.
- Generate a representative Test PDF to confirm the release-prep cleanup did not disturb the Designer/PDF path.

## Intentionally unchanged

- `README.md`
- application behavior and data model
- accepted Designer workflows
- historical build test files
- `app-meta.json` release status (`0.2.0-dev`) pending manual release acceptance

## Final release disposition — October 3, 2026

Manual release acceptance and the subsequent RC Corrections passed. The final release cut promotes the application to `0.2.0`, replaces the RC cache key with final key `020`, adds the MIT license, and reconciles the README. See `Release_v0.2.0.md` for the final release record.
