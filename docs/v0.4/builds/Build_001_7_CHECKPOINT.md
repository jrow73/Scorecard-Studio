# Build 001.7 Checkpoint

Updated: 2026-10-09

## Baseline

- Working tree: `V040_Build001_7_work`
- Copied intact from accepted Build 001.6.
- Build 001.6 current regression baseline: 149 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Add an explicit per-block pitcher group for new away/home bullpen repeated blocks.
2. Support Core Bullpen, Combined Pitchers, and Additional Starters.
3. Treat missing mode on every existing layout as Combined Pitchers without rewriting it during load.
4. Apply the selected rows consistently to Designer preview, Test PDF, live PDF, sorting, overflow, and conditional formatting.
5. Persist the choice only through normal explicit layout saves.
6. Do not add a global Home or Game Day preference.

## Checkpoints

- [x] C0 — Build 001.6 copied and scope frozen.
- [x] C1 — Shared pitcher-group collection contract implemented and compatibility-tested.
- [x] C2 — Designer create/edit workflow and persistence implemented.
- [x] C3 — Preview/Test PDF/live PDF/sort/overflow/conditional paths use the selected group.
- [x] C4 — Current regression and browser smoke tests pass.
- [x] C5 — Documentation and verified changed-files package complete.

## Resume instruction

Resume at the first unchecked checkpoint. Preserve the working tree and keep missing `pitcherGroup` equivalent to `combined`.
