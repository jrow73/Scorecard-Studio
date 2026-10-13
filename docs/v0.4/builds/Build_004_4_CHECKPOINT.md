# Build 004.4 Checkpoint

Updated: 2026-10-10

## Baseline

- Working tree: `V040_Build004_4_work`
- Copied from the user-accepted Build 004.3 overlay.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Make the Layout Library the normal Layouts landing view.
2. Move creation into a focused internal workflow with no write before confirmation.
3. Replace full-width records and distant controls with compact cards and local actions.
4. Remove eager library PDF rendering while preserving Designer PDF loading.
5. Reuse existing duplicate, favorite, confirmed-delete, Settings, and version-1 single-layout export contracts.
6. Preserve all saved-layout, PDF-template, backup, normalized-data, and storage compatibility.
7. Advance runtime and backup-export identity to Build 004.4 without modifying `README.md`.

## Checkpoints

- [x] C0 — Build 004.3 Home workflow accepted by user smoke test.
- [x] C1 — Library-first and focused-creation views implemented.
- [x] C2 — Compact responsive cards and local actions implemented.
- [x] C3 — Displaced detail card and eager PDF preview removed from the product workflow.
- [x] C4 — Existing storage operations and version-1 export reused.
- [x] C5 — Focused library, shell, backup, cutover, and syntax checks pass.
- [x] C6 — Full applicable v0.3/v0.4 suite passes 217 checks.
- [x] C7 — Changed-files overlay and extraction verification completed.

## Resume instruction

Build 004.4 is complete. Request the eight-step Layout Library smoke test documented in `docs/v0.4/builds/Build_004.md`. After acceptance, begin Build 004.5 from this working tree.
