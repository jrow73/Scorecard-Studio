# Build 001.8 Checkpoint

Updated: 2026-10-09

## Baseline

- Working tree: `V040_Build001_8_work`
- Copied intact from accepted Build 001.7.
- Build 001.7 current regression baseline: 154 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Add a consolidated cross-surface acceptance gate for the full v0.4 Build 001 contract.
2. Verify favorite-team competition scope at MLB, Triple-A, Double-A, High-A, and Single-A.
3. Verify date/level browsing, doubleheaders, readiness transitions, missing probable starters, no-game dates, and terminal states.
4. Verify Game Day research coverage and classified/fallback pitcher truthfulness.
5. Verify schema-v2 Designer data, old-layout equivalence, and deterministic Core/Combined/Additional pitcher blocks.
6. Fix only defects within accepted Build 001 scope; record later work as carryover.
7. Close Build 001 and produce a verified changed-files-only package without modifying `README.md`.

## Checkpoints

- [x] C0 — Build 001.7 copied and closure scope frozen.
- [x] C1 — Cross-surface acceptance matrix implemented; 6 focused checks pass.
- [x] C2 — No acceptance defect found; Build 001 application behavior remains unchanged.
- [x] C3 — 160 regressions, coverage-report check, and browser smoke test pass.
- [x] C4 — Build 001 closure, acceptance matrix, and carryovers documented.
- [x] C5 — 9-file ZIP and SHA-256 sidecar created; extraction and per-file hashes verified.

## Resume instruction

Resume at the first unchecked checkpoint. Do not broaden Build 001.8 into new product features.
