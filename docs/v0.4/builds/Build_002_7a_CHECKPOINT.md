# Build 002.7a Checkpoint

## Baseline

- Copied intact from Build 002.7.
- Build 002.7 accepted regression baseline: 201 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Confirmed defect

A complete Chrome backup restored successfully into clean Edge storage, including layouts, PDF templates, and live scorecard generation. The restored favorite-team setting persisted but did not repopulate the already-open Settings/Home UI until a hard refresh.

## Scope

- Refresh restored favorite-team state immediately after a successful commit.
- Repopulate the Settings team selector with the restored favorite selected.
- Refresh Home's favorite-team schedule/readiness state using the normal startup behavior.
- Preserve the version-1 format, transaction, stored values, and `README.md`.

## Checkpoints

- [x] C0 — Build 002.7 copied and patch scope frozen.
- [x] C1 — Post-restore favorite-team UI refresh implemented.
- [x] C2 — Focused regression and accepted suite pass.
- [x] C3 — Browser smoke passes.
- [x] C4 — Changed-files archive and checksum independently verified.

## Resume rule

Resume at the first unchecked checkpoint. Package only files changed from Build 002.7; do not include this checkpoint file.
