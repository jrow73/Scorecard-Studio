# Scorecard Studio v0.3.0 Release Package Manifest

**Release:** Scorecard Studio v0.3.0  
**Runtime build:** 005.2  
**Packaging build:** 005.4  
**Browser cache identity:** `030b0054`  
**Package date:** 2026-10-08

## Release products

### Complete standalone release

`Scorecard-Studio_v0.3.0_complete-release.zip`

This archive contains a complete repository tree suitable for a clean installation or publication. It includes:

- the accepted application files from the promoted Build 005.2 tree with the Build 005.4 public-version-label correction;
- the unchanged v0.2-era README, license, historical documentation, and historical test evidence;
- all v0.3 Build 001–005 documentation and architecture records;
- all v0.3 schemas, implementation modules, fixtures, current contract tests, and maintenance/capture tools.

Files are stored at the archive root rather than inside an additional wrapper directory.

Where a v0.2 final file and a planning-era workspace file shared a path, the accepted application-tree file remains authoritative. In particular, the packaged `README.md`, `docs/AI.md`, and active `docs/FIELD_REGISTRY.md` come from the accepted application tree. Historical/planning copies do not overwrite them.

### Build 005.4 changed files

`Scorecard-Studio_v0.3.0_Build005.4_changed-files.zip`

This archive is intended only for the established cumulative-overlay installation through Build 005.3. It contains:

- `index.html`
- `js/app.js`
- `js/field-diagnostic.js`
- `js/field-registry.js`
- `js/slot-content.js`
- `js/v030-compatibility-resolver.js`
- `js/v030-context-overlay-normalizer.js`
- `js/v030-cutover.js`
- `js/v030-persistence.js`
- `js/v030-roster-people-normalizer.js`
- `js/v030-schedule-normalizer.js`
- `docs/Build_005.md`
- `docs/V030_INSTALLATION_AND_ROLLBACK.md`
- `docs/V030_RELEASE_PACKAGE_MANIFEST.md`
- `docs/V030_RELEASE_NOTES_0.3.0.md`
- `tests/release_v0_3_0_candidate.test.mjs`
- `tests/release_v0_3_0_cutover.test.mjs`
- `tests/v030-cutover-integration.test.mjs`

The application change affects only the public version label. The cache-key and test changes ensure the corrected asset is loaded and verified. Runtime Build `005.2` remains the internal producer identity.

### Checksum sidecar

`Scorecard-Studio_v0.3.0_SHA256SUMS.txt`

The sidecar records SHA-256 checksums for both ZIP archives. Checksums are intentionally external so the complete archive is not required to contain a checksum of itself.

## Frozen release identity

- `app-meta.json`: version `0.3.0`, build `005.2`
- browser cache identity: `030b0054`
- normalized contract revision: `0.3.0-draft.2`
- IndexedDB version: 4
- protected README SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`

Build 005.4 is a presentation/packaging correction and does not change the runtime build identifier.

## Verification requirements

Release packaging is accepted only when all of the following are true:

1. The complete ZIP extracts without error and its relative path set, file sizes, and SHA-256 file hashes exactly match the frozen complete-release staging tree.
2. The changed-files ZIP extracts without error and exactly matches its 18-file staging tree.
3. The current v0.3 contract suite passes from the extracted complete archive.
4. The release-candidate and final-cutover tests pass from the extracted complete archive.
5. Every production JavaScript file passes syntax validation.
6. `app-meta.json`, cache identity, and the protected README hash match the frozen values above.

## Installation selection

- For a clean installation or GitHub release, use the complete standalone archive.
- If Build 005.3 is already installed through the sequential overlay workflow, use the Build 005.4 changed-files archive.
- Do not apply the Build 005.4 changed-files archive directly to v0.2.0; it assumes every earlier v0.3 increment is already present.

Detailed installation, browser-cache, backup, and rollback guidance remains in `docs/V030_INSTALLATION_AND_ROLLBACK.md`.
