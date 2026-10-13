# Build 002.4 Checkpoint

Updated: 2026-10-09

## Baseline

- Working tree: `V040_Build002_4_work`
- Copied intact from accepted Build 002.3.
- Build 002.3 regression baseline: 179 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Resolve each identity conflict through explicit Replace, Keep Both, or Skip.
2. Generate collision-safe layout/PDF identities and copy names.
3. Rewrite layout-to-PDF and favorite-layout references through one remap table.
4. Protect existing layouts from replacement of a PDF they also reference.
5. Build validated storage operations without mutating preflight data.
6. Commit accepted settings, layouts, and PDFs in one abort-on-error transaction.
7. Do not add product UI controls.

## Checkpoints

- [x] C0 — Build 002.3 copied and Build 002.4 scope frozen.
- [x] C1 — Explicit policies, collision-safe identities, and reference remapping implemented.
- [x] C2 — One-transaction multi-store commit path implemented.
- [x] C3 — 7 focused policy, remap, shared-PDF safety, and abort tests pass.
- [x] C4 — 186 regressions, coverage check, browser smoke, docs, identity, and protected README hash pass.
- [x] C5 — 12-file ZIP and SHA-256 sidecar created; extraction and per-file hashes verified.

## Resume instruction

Resume at the first unchecked checkpoint. Do not add import/export UI in Build 002.4.
