# Build 002.1 Checkpoint

Updated: 2026-10-09

## Baseline

- Working tree: `V040_Build002_1_work`
- Copied intact from accepted Build 001.8.
- Build 001.8 regression baseline: 160 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Inventory current persistent and reproducible browser stores.
2. Define the versioned JSON backup envelope and binary-PDF representation.
3. Define generic setting registration, portability, validation, and future-setting behavior.
4. Define whole-app and single-layout scope, references, conflicts, preflight, and atomic restore.
5. Add executable contract evidence without activating partial export/import UI.
6. Package documentation, schema, fixture, and tests only; do not modify `README.md`.

## Checkpoints

- [x] C0 — Build 001.8 copied and Build 002.1 scope frozen.
- [x] C1 — Storage/settings inventory completed.
- [x] C2 — Backup/restore contract and JSON schema completed.
- [x] C3 — Representative future-setting fixture and 6 contract tests pass.
- [x] C4 — 166 regressions, coverage-report check, and protected README hash pass.
- [x] C5 — 5-file ZIP and SHA-256 sidecar created; extraction and per-file hashes verified.

## Resume instruction

Resume at the first unchecked checkpoint. Do not add runtime export/import controls in Build 002.1.
