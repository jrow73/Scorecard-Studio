# Scorecard Studio v0.4.0 — Build 002

## Build 002.1 — Storage Inventory and Backup Format Contract

**Status:** Complete  
**Date:** 2026-10-09  
**Target identity:** future `0.4.0-dev • Build 002.2` runtime  
**Baseline:** accepted v0.4.0 Build 001.8

### Objective

Define a safe, extensible backup and restore contract before adding runtime controls. Identify user-owned versus reproducible storage, freeze a versioned JSON envelope, make future preferences registry-driven, and define reference, integrity, conflict, and atomicity behavior.

### Files changed

- `docs/v0.4/builds/Build_002.md`
- `docs/v0.4/V040_BACKUP_RESTORE_CONTRACT.md`
- `schemas/v040-backup-envelope-v1.schema.json`
- `tests/fixtures/v040-backup/complete-v1.json`
- `tests/v040-backup-contract.test.mjs`

No application source, application identity, IndexedDB schema, saved record, normalized model, PDF behavior, UI, or `README.md` changed.

### Accepted decisions

1. `settings`, `layouts`, and referenced `pdfTemplates` are the only portable IndexedDB stores.
2. Normalized snapshots and adapter results are reproducible caches and are excluded.
3. Backup format version 1 is a JSON envelope supporting complete and single-layout scopes.
4. PDF bytes use Base64 plus decoded size and SHA-256 integrity metadata.
5. Future settings participate through a central definition registry; the backup engine does not hard-code product preference names.
6. Adding an ordinary future preference requires a definition/default/normalizer, not a backup-engine change.
7. Unknown settings are reported and skipped by an importer that cannot validate them. Missing newer settings receive current defaults.
8. Favorite-layout references are remapped when Keep Both changes layout identity.
9. The retired additional-starter preference and last-used live-PDF selection are not portable.
10. Layouts retain unknown properties and compatibility-only fields. Import never upgrades old bullpen blocks merely by reading them.
11. Preflight performs no writes. Accepted restore commits are atomic across settings, layouts, and PDFs.
12. Replace, Keep Both, and Skip operate on a layout/PDF unit rather than independently corrupting references.

### Verification

- The schema and representative complete-backup fixture parse as JSON.
- Contract tests verify required envelope fields, generic setting values, future-setting round-trip preservation, PDF byte length/hash, layout-to-PDF references, store inclusion/exclusion, and the protected README hash.
- The current regression suite remains unchanged except for the additive contract tests.

### Deferred to Build 002.2

Build 002.2 owns the settings-definition registry and deterministic exporter. It must prove the generic path with the fixture's synthetic `futureDisplayDensity` setting without adding product UI for that preference.

### Build 002.1 acceptance

Build 002.1 is accepted when the portable-state boundary, version-1 envelope, future-setting extension mechanism, binary integrity rules, compatibility policy, and transactional restore requirements are explicit and executable as contract evidence, without exposing a partial user workflow.

### Next action

Proceed to Build 002.2, Generic Settings Registry and Deterministic Export Engine.

---

## Build 002.2 — Generic Settings Registry and Deterministic Export Engine

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 002.2`  
**Baseline:** accepted v0.4.0 Build 002.1

### Objective

Implement the read-only half of the version-1 backup contract: one extensible settings-definition registry, one consistent portable-storage snapshot, and a deterministic exporter for complete and single-layout backups. Do not expose product controls or implement import writes yet.

### Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `js/storage.js`
- `js/v040-backup-settings.js`
- `js/v040-backup-export.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-build001-acceptance.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `tests/v040-backup-export.test.mjs`
- `docs/v0.4/builds/Build_002.md`

`README.md`, the IndexedDB version/store structure, saved layouts, normalized snapshots, PDF rendering, import behavior, and product UI did not change.

### Implemented behavior

1. A central setting-definition registry records stable key, default, normalizer, portability, migration, and optional reference type.
2. Ordinary future JSON-safe preferences extend the registry without changing the exporter.
3. Current portable settings are canonical favorite competition, application preferences, and a valid favorite-layout reference.
4. Legacy `favoriteTeam` is exported only through canonical `favoriteCompetition` migration when needed.
5. `livePdfLayoutId`, retired `includeAdditionalStarters`, and unregistered records are not exported.
6. One read-only IndexedDB transaction snapshots settings, layouts, and PDF templates consistently. Cache stores remain outside the transaction.
7. Complete export includes all layouts, their referenced PDFs exactly once, and registered portable settings.
8. Single-layout export includes one layout and its referenced PDF with no global settings.
9. Settings, layouts, and templates are sorted deterministically; stable serialization recursively orders object keys.
10. PDF bytes are verified for a PDF signature, Base64 encoded, measured from decoded bytes, and SHA-256 hashed.
11. Missing PDFs, duplicate identities, non-PDF data, invalid scope, and non-JSON data fail before an export result is produced.
12. Layout objects are cloned without compatibility rewrites, so historical missing `pitcherGroup` behavior and unknown properties survive.

### Verification

- 172 automated checks pass, including six focused exporter tests.
- Reversing settings, layouts, and PDF storage enumeration produces byte-identical JSON when backup ID/time are fixed.
- A synthetic registered `futureDisplayDensity` preference round-trips without exporter changes.
- Complete/single-layout scope, legacy setting migration, excluded state, orphan-PDF omission, missing references, PDF integrity, and the read-only multi-store snapshot are covered.
- Browser smoke testing confirmed the Build 002.2 identity and application bootstrap with the revised storage module.
- The generated field-coverage report remains current.
- The protected `README.md` remains unchanged.

### Deferred to Build 002.3

Build 002.3 owns parsing, bounds, schema/semantic validation, PDF decode/hash verification, compatibility analysis, unsupported-setting reporting, and generation of a no-write restore plan. It must not commit any record.

### Build 002.2 acceptance

Build 002.2 is accepted when exports are deterministic apart from explicit ID/time metadata, future preferences use registry extension rather than exporter edits, layouts and PDFs remain coherent, cache data remains excluded, and the current application still boots without exposing an incomplete workflow. Those conditions are satisfied.

### Next action

Proceed to Build 002.3, No-Write Import Validation and Restore-Plan Preview.

---

## Build 002.3 — No-Write Import Validation and Restore-Plan Preview

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 002.3`  
**Baseline:** accepted v0.4.0 Build 002.2

### Objective

Implement the read-only half of import: parse and bound a backup, validate its structure and semantics, verify every referenced PDF, analyze compatibility and registered settings, compare it with current browser storage, and produce an actionable restore plan without exposing or calling any write path.

### Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `js/v040-backup-import.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-backup-import-preflight.test.mjs`
- `tests/v040-build001-acceptance.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `docs/v0.4/builds/Build_002.md`

`README.md`, IndexedDB, current stored data, exporter output, normalization, saved-layout semantics, PDF rendering, conflict decisions, restore commit, and product UI did not change.

### Implemented behavior

1. Import accepts text only and returns structured validity, diagnostics, prepared records, and a restore plan with `writesPerformed: 0`.
2. Default bounds limit JSON bytes, setting/layout/PDF counts, individual decoded PDFs, and total decoded PDF bytes before a plan can succeed.
3. Envelope identity, exact supported format version, source metadata, scope, timestamps, arrays, closed properties, required layout identity, and duplicate record keys are validated.
4. A newer or otherwise unsupported envelope version fails as a whole; it is never guessed into partial storage.
5. Base64 is decoded strictly. Decoded size, PDF signature, and SHA-256 must match the manifest.
6. Every layout must have its referenced valid PDF. Orphan PDFs are warned and omitted from the plan.
7. Single-layout scope requires exactly one layout, one referenced PDF, and no global settings.
8. Layout compatibility analysis is non-destructive. Raw future properties and old blocks without `pitcherGroup` remain unchanged in prepared data.
9. Registered portable settings are normalized. Invalid known settings fail preflight; unregistered or excluded settings are listed as unsupported and skipped.
10. Portable layout references must point to an imported layout before they enter prepared data.
11. Current layout IDs, PDF keys, layout names, and setting keys are compared without mutation.
12. The restore plan distinguishes additions, storage-identity conflicts, name warnings, setting additions/replacements, and unsupported settings.
13. Layout/PDF identity conflicts explicitly require a later Replace, Keep Both, or Skip decision.
14. The preflight module has no dependency on `storage.js` and contains no storage-write function.

### Verification

- 179 automated checks pass, including seven focused import-preflight tests.
- Tests cover valid planning, current-storage conflicts, old-layout preservation, malformed Base64, size mismatch, invalid signature, hash mismatch, unsupported version, unknown properties, byte limits, scope violations, unsupported settings, invalid known settings, and a registered hypothetical future setting.
- Static evidence verifies that the preflight module imports no storage layer and contains no save, set, put, or delete path.
- The generated field-coverage report remains current.
- Browser smoke testing confirms the Build 002.3 identity and unchanged application bootstrap.
- The protected `README.md` remains unchanged.

### Deferred to Build 002.4

Build 002.4 owns explicit per-unit Replace, Keep Both, and Skip decisions; collision-safe ID/name generation; layout-to-PDF and setting-reference remapping; and one atomic multi-store commit with abort-on-error behavior. No UI is required until that commit path is proven.

### Build 002.3 acceptance

Build 002.3 is accepted when malformed, incompatible, oversized, corrupt, or semantically incoherent files cannot produce a writable plan; valid files produce complete user-reviewable actions; historical layout data remains raw and unchanged; and all processing remains demonstrably write-free. Those conditions are satisfied.

### Next action

Proceed to Build 002.4, Conflict Resolution and Atomic Restore Commit.

---

## Build 002.4 — Conflict Resolution and Atomic Restore Commit

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 002.4`  
**Baseline:** accepted v0.4.0 Build 002.3

### Objective

Turn a valid read-only preflight into an explicit, reference-safe commit plan and provide the single atomic IndexedDB write path that will eventually execute a user-confirmed restore. Keep the capability inaccessible from product UI until the later workflow build.

### Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `js/storage.js`
- `js/v040-backup-import.js`
- `js/v040-backup-restore.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-backup-restore.test.mjs`
- `tests/v040-build001-acceptance.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `docs/v0.4/builds/Build_002.md`

`README.md`, IndexedDB version/store structure, current stored records, export format, normalization, PDF generation, and product UI did not change.

### Implemented behavior

1. Each preflight identity conflict requires an explicit Replace, Keep Both, or Skip decision, either per layout or through a supplied default.
2. Missing, unsupported, or stale decisions cannot produce a commit plan.
3. Replace retains the imported layout and PDF identities and overwrites them together.
4. Replace is prohibited when the conflicting PDF is referenced by another existing layout; Keep Both or Skip is required instead.
5. Keep Both allocates collision-safe layout and PDF IDs and a case-insensitively unique copy name.
6. Keep Both rewrites `layout.id`, `layout.pdfTemplateId`, timestamps, and portable setting references through the same decision map.
7. Skip writes neither the layout nor its PDF. A favorite-layout setting targeting that skipped unit is also skipped with a diagnostic.
8. Historical layout structure, unknown future properties, and missing legacy `pitcherGroup` values remain unchanged unless identity fields must be remapped for Keep Both.
9. Commit plans require the same current-storage snapshot used for collision planning and retain a typed confirmation marker.
10. PDF operations recreate browser `Blob` records from bytes already authenticated by preflight.
11. Settings, layouts, and PDF templates are submitted once to one IndexedDB `readwrite` transaction spanning all three stores.
12. A synchronous write error aborts the transaction; IndexedDB transaction error/abort paths reject without reporting success.
13. The commit orchestrator accepts one complete operation set and cannot accept a raw or unconfirmed object.
14. No product control imports or calls the restore module in this build.

### Verification

- 186 automated checks pass, including seven focused restore tests.
- Replace, Keep Both, Skip, collision retry, unique names, favorite-layout remapping, raw-layout preservation, shared-PDF protection, stale decisions, missing current snapshots, one-call submission, and failure propagation are covered.
- Static storage evidence verifies one `readwrite` transaction across `settings`, `layouts`, and `pdfTemplates`, with transaction error and abort handlers.
- The generated field-coverage report remains current.
- Browser smoke testing confirms the Build 002.4 identity and unchanged product bootstrap with the revised storage module.
- The protected `README.md` remains unchanged.

### Deferred to Build 002.5

Build 002.5 owns the visible complete-backup and single-layout export controls plus the import file picker, preflight summary, per-conflict decisions, confirmation, commit progress/result, and post-restore UI refresh.

### Build 002.4 acceptance

Build 002.4 is accepted when no restore can commit without a valid preflight and complete decisions, every kept unit has coherent IDs and references, another layout's PDF cannot be damaged by replacement, and all accepted writes succeed or abort together. Those conditions are satisfied.

### Next action

Proceed to Build 002.5, Backup and Restore User Workflows.

---

## Build 002.5 — Backup and Restore User Workflows

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 002.5`  
**Baseline:** accepted v0.4.0 Build 002.4

### Objective

Expose the proven backup and restore engine as a deliberate Settings workflow. Support complete and single-layout downloads, keep file selection read-only through validation and conflict resolution, require a separate final confirmation, commit through the Build 002.4 atomic writer, and refresh affected application state after success.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/storage.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-backup-workflow.test.mjs`
- `tests/v040-build001-acceptance.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `docs/v0.4/builds/Build_002.md`

`README.md`, the backup envelope, registry, preflight rules, conflict semantics, IndexedDB version/store structure, normalized model, and PDF generation did not change.

### Implemented behavior

1. Settings now contains one Backup & Restore card explaining the portable-data boundary.
2. Complete Backup reads settings, layouts, and PDFs from one consistent read-only snapshot and downloads a version-1 JSON envelope.
3. Single Layout Backup uses the same snapshot and exports the selected layout and its referenced PDF without global settings.
4. Export filenames distinguish complete and named-layout backups and include an unambiguous UTC timestamp.
5. Restore uses a real JSON file-picker button and reports the selected filename and size.
6. File-size enforcement occurs before reading; selecting a file then runs the Build 002.3 preflight without writes.
7. The preview shows backup identity, scope, record counts, diagnostics, and conflict count.
8. Every storage-identity conflict exposes explicit Replace, Keep Both, or Skip choices.
9. Replace is disabled in the UI when the PDF belongs to another stored layout; the underlying commit planner independently enforces the same rule.
10. Review remains disabled until validation succeeds and every conflict has a decision.
11. Review builds a commit plan but performs no write. A separate modal shows exact layout, PDF, settings, Replace, Keep Both, and Skip counts.
12. Only Restore Now calls the atomic commit orchestrator. Progress, success, and failure are announced in the workflow.
13. A successful restore reloads portable preferences and layouts from storage, repopulates layout selectors, and refreshes application storage status.
14. User-provided names and diagnostics are inserted with text nodes rather than interpreted as markup.
15. The interface collapses to one column on narrow screens and retains disabled states when no single layout is available.
16. Storage exports its existing database version as source metadata, avoiding a duplicated UI constant.

### Verification

- 191 accepted automated checks pass, including five focused workflow checks and all exporter, preflight, restore, schema-v2, v0.4, and API-evidence regressions.
- Workflow checks verify all visible controls, the no-write file-selection boundary, separate review/commit stages, complete conflict choices, shared-PDF Replace blocking, consistent snapshot export, current source metadata, and cache-busted runtime entry points.
- Existing focused engine tests continue to cover deterministic exports, corrupt inputs, size/hash/signature failures, compatibility preservation, settings extension, ID/reference remapping, and atomic failure propagation.
- The generated field-coverage report remains current.
- Browser smoke testing confirms the Build 002.5 identity, Settings navigation, responsive Backup & Restore card, accessible file button, and correct no-layout disabled state. No restore was committed during the smoke test.
- The changed application JavaScript passes syntax validation.
- The protected `README.md` remains unchanged.

### Deferred to Build 002.6

Build 002.6 owns end-to-end round-trip, corruption, historical compatibility, quota/failure, and interruption recovery testing against the now-visible workflow. It may correct defects found by that matrix but should not broaden the version-1 format or preference scope.

### Build 002.5 acceptance

Build 002.5 is accepted when a user can download complete or single-layout backups, inspect a selected restore file without writes, resolve every conflict explicitly, review exact operations, commit only through the atomic path, and immediately see restored preferences and layouts after success. Those conditions are satisfied.

### Next action

Proceed to Build 002.6, Round-Trip and Failure-Matrix Testing.

---

## Build 002.6 — Round-Trip and Failure-Matrix Testing

**Status:** Complete  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 002.6`  
**Baseline:** accepted v0.4.0 Build 002.5

### Objective

Exercise the visible backup-and-restore workflow across complete and single-layout round trips, historical and future-compatible layout data, corruption, quota and transaction failures, and interrupted user actions. Correct only defects exposed by that matrix without expanding the version-1 format, registry, or preference scope.

### Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-backup-roundtrip-failure.test.mjs`
- `tests/v040-backup-workflow.test.mjs`
- `tests/v040-build001-acceptance.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `docs/v0.4/builds/Build_002.md`

`README.md`, the version-1 backup envelope, portable-setting registry, conflict semantics, IndexedDB schema, normalized model, and PDF generation did not change.

### Implemented hardening

1. Complete export, preflight, atomic restore, and re-export preserve portable data without drift.
2. Single-layout round trips remain isolated from global settings and sibling layouts.
3. Historical layouts without `pitcherGroup`, unknown layout fields, unknown nested properties, and preserved source objects survive round trips unchanged.
4. Duplicate layout/PDF identities, missing PDF references, and tampered hashes fail preflight without producing a writable plan.
5. Simulated quota failure aborts the multi-store transaction without publishing partial settings, layouts, or PDFs.
6. Successful transactions publish all three portable stores together.
7. Each selected restore file receives a selection token. A slower, stale read or preflight cannot replace a newer selection's preview or clear its busy state.
8. Restore confirmation is locked while commit is in progress, preventing duplicate commits and cancellation during the atomic write.
9. Commit failure and post-commit refresh failure now have distinct, truthful results. A refresh problem after a successful transaction reports that the restore was committed and recommends reloading; it no longer implies rollback.
10. Refresh helpers can propagate errors to the workflow while retaining their existing tolerant startup behavior.

### Verification

- 198 accepted automated checks pass, including seven focused round-trip and failure-matrix checks.
- The matrix covers complete and single-layout round trips, historical and unknown-property preservation, duplicate and missing records, hash tampering, quota abort, all-store publication, stale file-selection interruption, confirmation locking, and truthful post-commit refresh failure.
- The generated field-coverage report remains current.
- Browser smoke testing confirms the Build 002.6 identity, Settings navigation, IndexedDB-ready status, complete and single-layout controls, restore-file selection, and correct no-layout disabled state.
- Browser logs contain no warnings or errors.
- The changed application JavaScript passes syntax validation.
- The protected `README.md` remains unchanged.

### Deferred to Build 002.7

Build 002.7 owns cross-browser acceptance and Build 002 closure. It should not add backup features or change the version-1 contract unless acceptance reveals a release-blocking defect.

### Build 002.6 acceptance

Build 002.6 is accepted when portable data round-trips without drift, historical and unknown layout data is preserved, malformed or incoherent backups cannot become writable, quota and transaction failures publish nothing, stale selections cannot win, and post-commit outcomes remain truthful. Those conditions are satisfied.

### Next action

Proceed to Build 002.7, Cross-Browser Acceptance and Build 002 Closure.

---

## Build 002.7 — Cross-Browser Acceptance and Build 002 Closure

**Status:** Complete; Edge manual smoke requested  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 002.7`  
**Baseline:** accepted v0.4.0 Build 002.6

### Objective

Close the backup-and-restore sequence with repeatable browser acceptance, current runtime/export identity, narrow-screen verification, and an explicit manual-browser handoff. Do not change the version-1 backup format or add product behavior.

### Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `tools/run-v040-browser-acceptance.mjs`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v040-backup-browser-acceptance.test.mjs`
- `tests/v040-backup-roundtrip-failure.test.mjs`
- `tests/v040-backup-workflow.test.mjs`
- `tests/v040-build001-acceptance.test.mjs`
- `tests/v040-home-readiness.test.mjs`
- `tests/v040-settings-foundation.test.mjs`
- `docs/v0.4/builds/Build_002.md`
- `docs/v0.4/V040_BACKUP_RESTORE_CONTRACT.md`
- `docs/v0.4/builds/V040_BUILD_002_CLOSURE.md`

`README.md`, storage structure, the version-1 envelope and registry, conflict behavior, normalized data, and PDF generation did not change.

### Acceptance behavior

1. Runtime, normalized snapshots, and exported backup source metadata identify Build 002.7 consistently.
2. The reusable browser harness serves the real application from an isolated local origin and uses disposable browser profiles.
3. It verifies application identity, IndexedDB readiness, enabled complete-backup and restore-file controls, and the correct disabled single-layout state for an empty profile.
4. It captures the actual complete-backup Blob and verifies its format, version, scope, source identity, and collection structure.
5. It repeats the workflow at 1280×900 and 390×844, rejecting horizontal overflow or a Backup & Restore card outside the viewport.
6. It captures browser errors, unhandled rejections, and console warnings/errors.
7. It never selects an import file or commits a restore.
8. A browser that is installed but does not provide headless DOM output is reported as requiring manual acceptance instead of being falsely recorded as passed.

### Verification

- 201 accepted automated checks pass.
- Chrome 153 passes the full desktop and narrow automated matrix with no captured errors.
- The Codex in-app browser passes live Build 002.7 identity, Settings, IndexedDB, complete-backup creation, correct empty-profile control states, and console-log checks.
- Edge 154 is installed, but this managed installation returns no headless DOM output. It is therefore not claimed as automated acceptance; the closure checklist requests a short manual Edge smoke test.
- The generated field-coverage report remains current.
- Application and browser-harness JavaScript pass syntax validation.
- The protected `README.md` remains unchanged.

### Build 002 closure

The version-1 backup contract, extensible portable-setting registry, deterministic complete and single-layout exports, no-write preflight, explicit conflict decisions, atomic commit, visible Settings workflow, round-trip/failure matrix, and browser acceptance controls are complete. `docs/v0.4/builds/V040_BUILD_002_CLOSURE.md` is the closure authority and records the remaining manual Edge confirmation.

### Next action

Overlay Build 002.7 and complete the short manual Edge smoke checklist. After that confirmation, proceed to v0.4.0 Build 003 planning and preference implementation.

---

## Build 002.7a — Immediate Post-Restore Favorite Refresh

**Status:** Complete; fresh-profile Edge retest requested  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 002.7a`  
**Baseline:** accepted v0.4.0 Build 002.7

### Objective

Correct the one defect found during the manual Chrome-to-Edge restore: the restored favorite competition was committed correctly but did not appear in Settings or refresh the Home schedule until a hard reload. Keep the version-1 backup contract and restore transaction unchanged.

### Implementation

After a successful atomic restore, the application now performs the same favorite-dependent refresh work needed by the running interface:

1. reread registered settings from IndexedDB;
2. invalidate the Settings team-list cache;
3. reload the restored favorite's competition-level teams and select the saved team;
4. refresh saved layouts; and
5. reload the restored favorite's current-date Home schedule/readiness, or render the setup-required state when no favorite exists.

Commit failures and post-commit refresh failures retain their existing distinct messages. No backup fields, storage schema, conflict rules, or portable-data semantics changed.

### Verification

- A focused regression check requires the post-restore refresh to repopulate the favorite selector with `preserveSavedFavorite` and refresh Home immediately.
- The complete accepted automated suite passes.
- Runtime, normalized snapshot, export metadata, and cache-busting identity consistently report Build 002.7a.
- The generated field-coverage report remains current.
- The protected `README.md` remains unchanged.

### Manual acceptance

On the freshly cleared Edge profile, restore the complete Chrome backup. Without reloading, confirm that Settings immediately displays the restored favorite and Home immediately displays that favorite's current-date schedule/readiness state.
