# Build 002.3 Checkpoint

Updated: 2026-10-09

## Baseline

- Working tree: `V040_Build002_3_work`
- Copied intact from accepted Build 002.2.
- Build 002.2 regression baseline: 172 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Parse and bound version-1 backup JSON without storage writes.
2. Validate envelope structure, scope semantics, identities, and references.
3. Decode PDF data and verify size, signature, and SHA-256.
4. Analyze layouts non-destructively through existing compatibility rules.
5. Classify registered, unsupported, excluded, and reference settings.
6. Compare against current storage and generate an actionable restore plan.
7. Do not implement conflict decisions, ID remapping, commit, or UI controls.

## Checkpoints

- [x] C0 — Build 002.2 copied and Build 002.3 scope frozen.
- [x] C1 — Import bounds, parser, semantic validation, and PDF integrity implemented.
- [x] C2 — Compatibility, settings, current-storage comparison, and conflict plan implemented.
- [x] C3 — 7 focused corruption, compatibility, conflict, extensibility, and no-write tests pass.
- [x] C4 — 179 regressions, coverage check, browser smoke, docs, identity, and protected README hash pass.
- [x] C5 — 10-file ZIP and SHA-256 sidecar created; extraction and per-file hashes verified.

## Resume instruction

Resume at the first unchecked checkpoint. Build 002.3 must not expose or call a storage-write path.
