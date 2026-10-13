# Scorecard Studio v0.4.0 — Release Package Manifest

**Release:** Scorecard Studio v0.4.0  
**Runtime build:** 004.9  
**Browser cache identity:** `040`  
**Package date:** 2026-10-12

## Release products

### Complete standalone release

`Scorecard-Studio_v0.4.0_complete-release.zip`

This archive contains the complete accepted application tree for a clean installation or publication. Files are stored at the archive root rather than inside an additional wrapper directory.

### Release changes over Build 004.9

`Scorecard-Studio_v0.4.0_release-changes.zip`

This archive is intended only for an installation already updated through accepted Build 004.9. It contains the final version/cache identity changes, release documentation and tests, and the current-identity assertions affected by promotion.

### Checksum sidecar

`Scorecard-Studio_v0.4.0_SHA256SUMS.txt`

The sidecar records SHA-256 checksums for both ZIP archives. It remains external so the complete archive is not required to contain a checksum of itself.

## Frozen release identity

- `app-meta.json`: version `0.4.0`, build `004.9`
- browser cache identity: `040`
- normalized contract revision: `0.3.0-draft.2`
- IndexedDB version: 4
- backup envelope format version: 1
- protected README SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`

## Verification requirements

Release packaging is accepted only when all of the following are true:

1. The complete archive extracts without error and its relative path set, file sizes, and SHA-256 hashes exactly match the frozen release staging tree.
2. The release-changes archive extracts without error and exactly matches the changed files relative to accepted Build 004.9.
3. The 248 applicable v0.3/v0.4 checks and five final-release integrity checks pass from the release staging tree.
4. Every production JavaScript file and the browser acceptance runner pass syntax validation.
5. `app-meta.json`, browser cache identity, storage version, backup format, and protected README hash match the frozen values above.
6. ZIP entry paths use forward slashes and contain no wrapper directory.

## Installation selection

- For a clean installation or publication, use the complete standalone archive.
- If Build 004.9 is already installed, use the release-changes archive.
- Do not apply the release-changes archive directly to v0.3.0; it assumes all v0.4.0 Builds 001–004.9 are already installed.

Detailed installation, browser-cache, backup, and rollback guidance is in `docs/v0.4/V040_INSTALLATION_AND_ROLLBACK.md`.
