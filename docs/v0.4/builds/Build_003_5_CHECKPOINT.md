# Build 003.5 Checkpoint

## Baseline

- Accepted v0.4.0 Build 003.4b.
- Build 003.4b accepted regression baseline: 216 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

- Close preference portability across complete and single-layout backups.
- Reconcile Chrome/Edge manual acceptance evidence from Builds 002.7a through 003.4b.
- Run the complete v0.3/v0.4 regression and browser-loading checks.
- Publish Build 003 closure evidence and define the Build 004 planning boundary.
- Defect corrections only; no new preference, backup-format, storage-schema, or product-feature scope.

## Checkpoints

- [x] C0 — Build 003.4b copied and Build 003.5 closure scope frozen.
- [x] C1 — Preference portability and isolation regression complete.
- [x] C2 — Full accepted automated regression passes.
- [x] C3 — Browser runtime and responsive workflow acceptance recorded.
- [x] C4 — Build 003 closure and Build 004 handoff documentation complete.
- [x] C5 — Changed-files archive and checksum independently verified.

## Resume rule

Resume at the first unchecked checkpoint. Package only files changed from Build 003.4b plus runtime files required by the new cache identity; do not include this checkpoint file.
