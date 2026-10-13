# Build 002.2 Checkpoint

Updated: 2026-10-09

## Baseline

- Working tree: `V040_Build002_2_work`
- Copied intact from accepted Build 002.1.
- Build 002.1 regression baseline: 166 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Add the central setting-definition registry and current portability decisions.
2. Add a deterministic complete/single-layout export engine.
3. Encode referenced PDF bytes as Base64 with decoded size and SHA-256.
4. Read settings, layouts, and PDFs from one read-only IndexedDB transaction.
5. Prove synthetic future-setting extension without backup-engine edits.
6. Do not add import, restore writes, or product controls.

## Checkpoints

- [x] C0 — Build 002.1 copied and Build 002.2 scope frozen.
- [x] C1 — Settings registry and one-transaction storage snapshot implemented.
- [x] C2 — Deterministic exporter and 6 focused export tests implemented.
- [x] C3 — 172 regressions, coverage check, and browser smoke test pass.
- [x] C4 — Build documentation, identity, and protected README hash pass.
- [x] C5 — 12-file ZIP and SHA-256 sidecar created; extraction and per-file hashes verified.

## Resume instruction

Resume at the first unchecked checkpoint. Do not implement import or UI controls in Build 002.2.
