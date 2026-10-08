# Scorecard Studio v0.3.0 — Build 005

## Build 005.1 — Release-Candidate Audit

**Status:** Complete  
**Date:** 2026-10-08  
**Candidate:** `0.3.0-dev • Build 004.8b`  
**Scope:** Release-candidate integrity, cumulative verification, legacy-layout acceptance evidence, protected-document boundary, and final-promotion readiness

### Objective

Audit the accepted Build 004.8b cumulative overlay as one release candidate without adding features or changing application behavior. Confirm that local assets and module imports resolve, browser cache identity is coherent through the nested module graph, schema-v2 is the only live normalization path, storage remains non-destructive, legacy v0.2 layouts remain compatible, and the v1 end-state README remains unchanged.

### Files changed in this increment

- `docs/Build_005.md`
- `docs/V030_RELEASE_CANDIDATE_AUDIT.md`
- `tests/release_v0_3_0_candidate.test.mjs`

No application source, schema, fixture, saved-layout structure, PDF-template structure, storage schema, or `README.md` was changed.

### Findings

1. The candidate is internally coherent at `0.3.0-dev • Build 004.8b` with browser cache key `030b0048b`.
2. Every local HTML asset and static JavaScript module import resolves to an existing candidate file.
3. Every versioned browser dependency uses the same accepted cache identity, including the nested schema-v2 normalizer/contract chain corrected during Build 004.8b.
4. The live application imports `normalizeV030Pregame` and does not import or invoke the schema-v1 `normalizePregameData` path.
5. IndexedDB remains at version 4 with the existing settings, layouts, and PDF-template stores plus isolated normalized-snapshot and adapter-result stores.
6. The normalized contract revision is `0.3.0-draft.2`, so pre-004.8b normalized snapshots cannot be reused as current records.
7. The README hash remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`. It is treated as the protected v1 end-state document, not a v0.3 status ledger.
8. No release-blocking defect remains from the accepted evidence.

### Verification evidence

- Cumulative Build 002–004 contract suite: 123 passed, 0 failed.
- Dedicated Build 004.8b release regression: passed, including syntax checks of every production JavaScript file.
- Build 005.1 candidate integrity suite: 4 passed, 0 failed.
- User acceptance: browser smoke test reported no browser issue.
- User acceptance: an unchanged v0.2 Designer scorecard layout generated a live PDF with starter, bench, lineup, and bullpen names populated.
- User acceptance: an unchanged v0.2 Designer name-test layout generated all supported name formats from known API values after Build 004.8b.

Archived per-build tests remain historical evidence and intentionally contain mutually exclusive exact build/version assertions. They are not an aggregate current-release command. Current release acceptance is represented by the cumulative contract suite, `release_v0_3_0_cutover.test.mjs`, and `release_v0_3_0_candidate.test.mjs`.

### Release posture

Build 005.1 passes. The candidate is ready for Build 005.2 final identity promotion. The dormant adapter-result execution cache remains a non-blocking future performance option; normalized-snapshot persistence is the active v0.3 cache boundary.

### Carryover to Build 005.2

- Promote `0.3.0-dev` to `0.3.0`.
- Assign a final release cache identity and update current release assertions.
- Add final release notes and installation/rollback instructions without modifying `README.md`.
- Repeat automated release gates after the identity-only change.

---

## Build 005.2 — Final v0.3.0 Promotion

**Status:** Complete  
**Date:** 2026-10-08  
**Release identity:** `0.3.0 • Build 005.2`  
**Browser cache identity:** `030b0052`

### Objective

Promote the accepted Build 004.8b release candidate from its development identity to final v0.3.0 without changing application behavior, user data, layout/PDF compatibility, or the v1 end-state README.

### Files changed in this increment

- `app-meta.json`
- `index.html`
- `docs/Build_005.md`
- `docs/V030_RELEASE_CANDIDATE_AUDIT.md`
- `docs/V030_RELEASE_NOTES_0.3.0.md`
- `docs/V030_INSTALLATION_AND_ROLLBACK.md`
- browser module files whose import URLs carry the final cache identity
- `tests/release_v0_3_0_candidate.test.mjs`
- `tests/release_v0_3_0_cutover.test.mjs`
- `tests/v030-cutover-integration.test.mjs`

`README.md`, runtime feature logic, API requests, normalized schema, contract revision, IndexedDB version/stores, saved layouts, and PDF templates were not changed.

### Promotion changes

- `app-meta.json` now identifies final version `0.3.0` and Build `005.2`.
- Snapshot producer metadata now records Build `005.2`; the application version was already `0.3.0`.
- All versioned browser imports use `030b0052`, including nested schema-v2 modules.
- Current release assertions now reject the prior development identity and cache key.
- Release notes and installation/rollback guidance are explicit and separate from the protected README.

### Verification

- The 123-test cumulative contract suite passes under the final identity.
- The release-candidate integrity and final cutover/release checks pass.
- Every production JavaScript file passes syntax validation.
- The README protection hash remains unchanged.
- No user acceptance finding required a behavior change during promotion.

### Carryover to Build 005.3

- Perform the final acceptance smoke test against the promoted identity.
- Produce and independently verify both the complete v0.3.0 release archive and the changed-files-only release archive.
- Record archive manifests and SHA-256 checksums.

---

## Build 005.3 — Final Release Packaging

**Status:** Complete  
**Date:** 2026-10-08  
**Release identity:** `0.3.0 • Build 005.2`  
**Packaging increment:** `005.3`

### Objective

Package the accepted v0.3.0 application in both supported delivery forms after the promoted build passed user acceptance: a complete standalone repository archive and a minimal changed-files archive for installations that already include Build 005.2.

### User acceptance gate

The promoted Build 005.2 identity passed the user's quick checks. No application correction was required before packaging.

### Files changed in this increment

- `docs/Build_005.md`
- `docs/V030_RELEASE_PACKAGE_MANIFEST.md`
- `tests/v030-cutover-integration.test.mjs`
- `tests/v030-layout-compatibility.test.mjs`
- `tests/v030-player-name-format-compatibility.test.mjs`
- `tests/v030-schedule-normalizer.test.mjs`

The test changes remove development-workspace path dependencies from the clean release and make the ambiguous-selection assertion compare the stable error code rather than JavaScript module-instance identity. No application source, schema, fixture, tool, saved-layout structure, PDF-template structure, storage schema, or `README.md` was changed.

### Release products

- `Scorecard-Studio_v0.3.0_complete-release.zip` — complete, standalone v0.3.0 repository contents.
- `Scorecard-Studio_v0.3.0_Build005.3_changed-files.zip` — Build 005.3 documentation and portable test-path corrections, for overlay on an installation that already includes Build 005.2.
- `Scorecard-Studio_v0.3.0_SHA256SUMS.txt` — external checksums for both archives, avoiding a self-referential checksum inside the release archive.

### Verification

- The complete archive was extracted independently and compared file-for-file and hash-for-hash with its frozen staging tree.
- The changed-files archive was extracted independently and compared file-for-file and hash-for-hash with its staging tree.
- The current 123-test v0.3 contract suite passes from the complete release tree.
- The five release-candidate/final-cutover checks pass from the complete release tree.
- Every production JavaScript file passes syntax validation.
- Release identity remains `0.3.0 • Build 005.2`, and browser cache identity remains `030b0052`.
- The protected `README.md` remains byte-for-byte unchanged with SHA-256 `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Release posture

Build 005.3 closes Build 005 and the v0.3.0 release sequence. The complete archive is appropriate for a clean installation or repository publication. The changed-files archive is appropriate only for the established cumulative-overlay workflow after Build 005.2.

---

## Build 005.4 — Public Version-Label Correction

**Status:** Complete  
**Date:** 2026-10-08  
**Public release label:** `0.3.0`  
**Internal runtime build:** `005.2`  
**Browser cache identity:** `030b0054`

### Objective

Remove the internal build suffix from the ordinary user-facing version label while preserving Build `005.2` in `app-meta.json`, normalized-snapshot producer metadata, and diagnostic build-specific surfaces.

### Changes

- The shared `[data-app-version-label]` text now prefers the public semantic version and displays `0.3.0`.
- Dedicated build-label and build-prefix elements retain access to Build `005.2` where a diagnostic or historical surface requests it.
- The browser cache identity advances to `030b0054` across the complete module graph so browsers load the corrected application bootstrap.
- Final release tests explicitly reject the former combined public label.
- The cutover integration test recognizes the Build 005.4 cache identity.
- Installation, release-note, and package-manifest documentation now describe the final presentation and packages.

### Scope boundary

No API behavior, normalized data, source precedence, persistence schema, saved layout, PDF template, application feature, or protected README content changed.

### Verification

- The 123-test cumulative v0.3 contract suite passes.
- The five final release checks pass, including the public-label and uniform-cache assertions.
- Every production JavaScript file passes syntax validation.
- The complete and changed-files archives are independently extracted and compared to their frozen staging trees by relative path, size, and SHA-256.
- `README.md` remains unchanged with SHA-256 `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Release posture

Build 005.4 supersedes the Build 005.3 package products and is the final v0.3.0 distribution. The public interface displays `0.3.0`; internal metadata continues to identify the accepted runtime as Build `005.2`.
