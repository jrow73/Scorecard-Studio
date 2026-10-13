# Build 003.2 Checkpoint

## Baseline

- User-accepted v0.4.0 Build 003.1.
- Accepted regression baseline: 207 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

- Audit and correct light-mode contrast and surface separation across all application views.
- Replace dark-only dialog, Designer, status, and interaction colors with theme-aware tokens or overrides.
- Verify desktop and narrow layouts in explicit Light and Dark modes.
- Keep preference persistence, backup behavior, layouts, normalized data, PDF rendering, and `README.md` unchanged.

## Checkpoints

- [x] C0 — Build 003.1 copied and coverage scope frozen.
- [x] C1 — Theme tokens and specialized-surface corrections implemented.
- [x] C2 — Focused contrast/coverage tests and full accepted suite pass.
- [x] C3 — Multi-view browser/visual acceptance and protected-file checks pass.
- [x] C4 — Changed-files archive and checksum independently verified.

## Resume rule

Resume at the first unchecked checkpoint. Package only files changed from Build 003.1; do not include this checkpoint file.
