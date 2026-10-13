# Build 002.7 Checkpoint

## Baseline

- Copied intact from accepted Build 002.6.
- Build 002.6 accepted regression baseline: 198 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

- Run the backup workflow in each locally available supported browser engine.
- Verify desktop and narrow-screen Settings presentation, IndexedDB readiness, and complete-backup download integrity.
- Close Build 002 with an explicit acceptance record and user smoke-test handoff.
- Defect corrections only; no version-1 format, registry, preference, or feature expansion.

## Checkpoints

- [x] C0 — Build 002.6 copied and Build 002.7 acceptance scope frozen.
- [x] C1 — Reusable browser-acceptance harness and closure assertions complete.
- [x] C2 — Accepted automated regression suite passes.
- [x] C3 — Automatable browser acceptance passes; managed Edge headless limitation recorded for manual smoke.
- [x] C4 — Build 002 closure documentation and user smoke checklist complete.
- [x] C5 — Changed-files archive and checksum independently verified.

## Resume rule

Resume at the first unchecked checkpoint. Package only files changed from Build 002.6; do not include this checkpoint file.
