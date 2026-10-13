# Build 001.5 Checkpoint

Updated: 2026-10-09

## Baseline

- Working tree: `V040_Build001_5_work`
- Copied intact from the verified Build 001.4 working tree.
- Build 001.4 regression baseline: 138 passing tests.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Accepted Build 001.5 scope

1. Turn Game Day into the dense pregame research companion.
2. Organize data into game overview, teams/standings, lineups, pitching groups, bench, staff, officials, venue/weather, and source/availability context.
3. Always present selected starter, additional starters, and core bullpen independently.
4. If depth-chart classification is unavailable, label the fallback honestly as `Other active pitchers — roles not classified`.
5. Retire Field Diagnostic from the product UI only after preserving its automated coverage replacement.
6. Do not change `README.md`, normalized schema, saved-layout format, or PDF behavior.

## Checkpoints

- [x] C0 — Build 001.4 copied; scope and baseline recorded.
- [x] C1 — Game Day presentation helpers and regression tests added.
- [x] C2 — Game Day markup/styles/runtime integration complete.
- [x] C3 — Field Diagnostic product route removed; automated evidence updated.
- [x] C4 — Full tests and browser smoke test pass.
- [x] C5 — Build documentation, verified changed-files ZIP, and SHA sidecar complete.

## Resume instruction

Resume from the first unchecked checkpoint. Run the focused Build 001.5 tests before continuing, then run the full accepted suite at C4. Do not recreate the working tree or discard completed files.
