# Build 004.3 Checkpoint

Updated: 2026-10-10

## Baseline

- Working tree: `V040_Build004_3_work`
- Copied from the user-accepted Build 004.2 overlay.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Keep favorite-team startup selection intact.
2. Remove arbitrary first-game selection from general date-and-level schedules.
3. Add instant, network-free schedule filtering by team, available abbreviation, and league.
4. Keep search selection-neutral and distinguish zero filtered results from no scheduled games.
5. Place schedule choices and selected-game details together on wide screens and stack them on narrow screens.
6. Preserve Schedule-only Home loading, existing Game Day/PDF hydration, storage contracts, layouts, backups, and `README.md`.
7. Advance runtime and backup-export identity to Build 004.3.

## Checkpoints

- [x] C0 — Build 004.2 shell accepted by user smoke test.
- [x] C1 — Favorite and general-schedule selection policies separated explicitly.
- [x] C2 — Local selection-neutral filtering and distinct zero-match state implemented.
- [x] C3 — Intentional unselected state gates selected-game actions.
- [x] C4 — Responsive adjacent schedule/detail workspace implemented.
- [x] C5 — Focused Home, identity, backup, cutover, shell, and syntax checks pass.
- [x] C6 — Full applicable v0.3/v0.4 suite passes 213 checks.
- [x] C7 — Changed-files overlay and extraction verification completed.

## Resume instruction

Build 004.3 is complete. Request the seven-step Home smoke test documented in `docs/v0.4/builds/Build_004.md`. After acceptance, begin Build 004.4 from this working tree.
