# Scorecard Studio v0.4.0 — Canonical Repository Manifest

**Canonical archive:** `Scorecard-Studio_v0.4.0_canonical-repository.zip`  
**Prepared:** 2026-10-13  
**Application identity:** `0.4.0`, internal Build `004.9`

## Source reconciliation

The canonical repository combines:

- `Scorecard-Studio_v0.4.0_complete-release.zip` as the application and release-evidence baseline; and
- the four early-v0.4 authority documents found only in `Scorecard-Studio_v0.4.0_Final.zip`.

The complete-release versions of `docs/v0.4/builds/Build_004.md` and `docs/v0.4/builds/Build_004_9_CHECKPOINT.md` are retained because they record final smoke acceptance and Build 004 closure.

One second copy of `BUILD_009_IMPLEMENTATION.md` was removed after confirming that both copies were byte-identical.

## Documentation organization

- Cross-version application references remain directly under `docs/`.
- v0.2.0 release and Designer history are under `docs/v0.2/`, with build records in `docs/v0.2/builds/`.
- v0.3.0 architecture and release records are under `docs/v0.3/`, with build records in `docs/v0.3/builds/`.
- v0.4.0 contracts and release records are under `docs/v0.4/`, with build records in `docs/v0.4/builds/`.
- Repository-local documentation references and the one affected historical test path were updated to the canonical locations.

## Application integrity

The deployed application files are unchanged from the final v0.4.0 complete release. Documentation reorganization does not alter `index.html`, `app-meta.json`, CSS, JavaScript, schemas, storage behavior, or PDF behavior.

Verification requires:

1. all 248 applicable v0.3/v0.4 checks plus five final-release integrity checks to pass;
2. all production JavaScript and the browser-acceptance runner to pass syntax validation;
3. every explicit repository-local documentation path to resolve;
4. final browser cache identity `040`; and
5. protected README SHA-256 `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.
