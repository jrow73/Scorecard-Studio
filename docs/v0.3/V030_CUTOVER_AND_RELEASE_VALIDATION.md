# Scorecard Studio v0.3.0 — Cutover and Release Validation

**Build:** 004.8b  
**Status:** Implemented and verified  
**Runtime mode:** `schema-v2`

## Cutover boundary

Build 004.8 replaces the normal v0.2.0 normalization call with a single schema-v2 composition pipeline:

1. Schedule selects one explicit game view and creates the normalized game/team/lineup skeleton.
2. Dated rosters, scoped People results, optional depth annotations, and dated staff enrich that snapshot.
3. Standings, Feed officials/venue detail, narrow Venue fallback, and verified earlier-game Boxscore context apply their explicit overlays.
4. Runtime contract validation must succeed before the snapshot reaches storage or consumers.

HTTP remains in `api.js`; normalization remains deterministic and performs no I/O. The app coordinator constructs closed adapter inputs and carries partial/failed source outcomes into normalization rather than converting failures to empty success.

## Consumer compatibility

The current field registry is the shared boundary for Home, Game Day, Field Diagnostic, the Designer, templates, and PDF generation. When the supplied model has `schemaVersion: 2`, the registry delegates to the compatibility resolver. Schema-v1 behavior remains in the registry only for representative designer/sample data and reference tests; the application does not create schema-v1 live snapshots.

All 223 canonical v0.2.0 fields and four aliases retain their accepted compatibility definitions. Repeated bullpen fields retain the historical `bullpen + additionalStarters` projection. The new display preference is deliberately separate and cannot alter saved-layout output.

Opening a layout:

- clones it;
- canonicalizes recognized aliases in memory;
- preserves unknown field IDs;
- performs no storage write.

An explicit user save prepares the compatible copy and then writes it. Layout and PDF-template schemas are unchanged.

## Persistence and refresh

IndexedDB version 4 adds two isolated stores:

- `normalizedSnapshotsV2`
- `adapterResultsV1`

Build 004.8 connects normalized-snapshot read/write behavior. A same-view selection may use a valid current-contract snapshot; manual refresh always recomputes. Wrong schema, contract, game, view, or invalid payloads are cache misses. The adapter-result store is installed for contract continuity but is not yet used by the app's request executor.

The `settings`, `layouts`, and `pdfTemplates` stores are neither migrated nor rewritten. The additional-starter preference uses the existing settings store and defaults to `false`.

## User-visible availability

Field Diagnostic now displays normalized capability requirements:

- `corePregame`
- `staff`
- `officials`
- `extendedVenue`

Resolution state and lineage determine Available, Partial, Missing, Source unavailable, or Error. A successful HTTP request alone does not guarantee field availability. Partial People chunks remain partial, failed identities are not zero-filled, and ambiguous managers remain unselected.

## Pitcher behavior

Normalized collections follow the accepted rule:

- selected probable starter is excluded;
- when usable depth annotations exist, matching `SP` pitchers become `additionalStarters` and the remaining dated-roster pitchers become `bullpen`;
- without usable annotations, the authoritative fallback is dated roster pitchers minus the selected starter.

Home and Game Day omit `additionalStarters` by default. The user may include them through the persisted “Include additional starters” checkbox. Saved-layout legacy bullpen fields always retain their compatibility union, independent of this preference.

## Verification evidence

### Automated

- `node --test tests/*.test.mjs`: 117 passed, 0 failed.
- `node --test tests/release_v0_3_0_cutover.test.mjs` from the application root: passed.
- Every production JavaScript file passed `node --check` through the release regression.
- End-to-end fixture composition validates schema version, selected-view identity, depth splitting, partial People availability, legacy field resolution, and opt-in display behavior.
- Static integration checks prove the v1 live normalizer is absent from bootstrap, the compatibility resolver fronts PDF/layout consumption, cache stores remain isolated, and the cache/version identity is coherent.

Historical per-build tests that assert obsolete exact build labels are mutually exclusive by design. They remain evidence artifacts; they are not combined as a present-release suite.

### Browser smoke control

Local browser control: Seattle favorite, 2025-07-03, Kansas City at Seattle.

- Startup displayed `0.3.0-dev • Build 004.8` and initialized IndexedDB.
- Home loaded a validated schema-v2 model with posted lineups, weather, venue, starters, and bullpen.
- Enabling the additional-starter setting added three annotated SP rows per club in the observed control; disabling it restored the default list.
- Game Day displayed managers, standings, lineups, scoped batting/pitching totals, four officials, and T-Mobile Park detail.
- Field Diagnostic completed with 171 Available and no Partial, Missing, Source unavailable, or Error rows for this historical control.
- Browser console warnings/errors: none.
- The preference was returned to its default off state after the smoke test.

PDF generation could not be exercised interactively in the clean smoke profile because it contained no user PDF template. Its unchanged generation path is covered by compatibility-binding parity, static integration checks, and the dedicated release regression. A saved-layout/PDF-template acceptance pass remains a final-release task.

## Rollback

Rollback is an application-bundle operation: restore the Build 004.7 application files (or the previously deployed bundle). Do not migrate layouts backward. The prior bundle ignores the new derived-cache stores. Restoring Build 004.8 later can reuse only records that still pass the exact schema, contract, game, and selected-view checks.

## Release posture

Build 004.8b closes Build 004's implementation gate and is ready for continued user acceptance. It intentionally remains `0.3.0-dev`; final version promotion and deployment acceptance are separate release actions.

## Build 004.8a acceptance correction

A real saved-layout/live-PDF smoke test found that lineup and bullpen rows could display jersey number, handedness, and position while omitting the player name. The affected slots requested legacy derived name formats, while their schema-v2 player objects intentionally carried only the canonical full name. The starting-pitcher and bench slots in that template requested full names and therefore rendered correctly.

Build 004.8a corrects the shared formatting boundary. Exact legacy name components still win when present; otherwise supported derived formats are inferred from the canonical full name, including common suffix handling, and finally fall back to that full name instead of blank output. Automated coverage now verifies all supported formats and the repeated-slot path used by lineup and bullpen PDF fields. The browser cache key is `030b0048a`, and the visible development identity is `0.3.0-dev • Build 004.8a`.

This correction does not rewrite saved layouts or PDF templates and does not alter normalized data, source precedence, bullpen classification, or page geometry.

Post-correction verification: 121 cumulative tests passed, along with the dedicated application-root release regression and production JavaScript syntax checks.

## Build 004.8b source-fidelity correction

Acceptance used a PDF layout created by the v0.2 Designer, loaded unchanged by Build 004.8a, and populated from live schema-v2 data. That test confirmed the compatibility binding itself remained intact while revealing that schema-v2 had collapsed distinct Stats API player-name values into one canonical name before formatting.

Build 004.8b retains the API variants on normalized person objects and resolves each legacy format from its matching source value. People identity wins per field, followed by hydrated dated roster and Schedule; a missing field does not prevent another source from supplying that one variant. In particular, formal `firstName`, preferred `useName`, API `initLastName`, and source-authored `boxscoreName` are no longer reconstructed from `fullName` when supplied.

The normalized contract revision is `0.3.0-draft.2`, which makes older cached snapshots ineligible without deleting IndexedDB or user settings. The browser cache key is `030b0048b`, and the visible development identity is `0.3.0-dev • Build 004.8b`.

The old v0.2 layout remains the authoritative user-acceptance control: it should be reopened without editing or resaving, populated with refreshed game data, and used to generate the same name-test PDF. No layout/PDF-template migration is part of this correction.

Automated verification: 123 cumulative tests passed, including schema coverage, exact source-precedence, and repeated-slot format assertions, plus the dedicated release regression and production JavaScript syntax checks.
