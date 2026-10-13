# Build 002.6 Checkpoint

## Baseline

- Copied intact from accepted Build 002.5.
- Build 002.5 accepted regression baseline: 191 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

- Complete and single-layout round trips.
- Corruption and semantic-incoherence rejection.
- Historical layout and unknown-property preservation.
- Quota, transaction-abort, and post-commit refresh failure behavior.
- Stale-file selection and in-progress confirmation interruption behavior.
- Defect corrections only; no version-1 format, preference, schema, or feature expansion.

## Checkpoints

- [x] C0 — Build 002.5 copied and Build 002.6 matrix frozen.
- [x] C1 — Interruption and truthful post-commit result handling implemented.
- [x] C2 — Round-trip and compatibility matrix complete.
- [x] C3 — Corruption, quota, transaction, and interruption matrix complete.
- [x] C4 — Accepted regression suite and browser smoke test pass.
- [x] C5 — Changed-files archive and checksum independently verified.

## Resume rule

Resume at the first unchecked checkpoint. Package only files changed from Build 002.5; do not include this checkpoint file.
