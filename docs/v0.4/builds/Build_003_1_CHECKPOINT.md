# Build 003.1 Checkpoint

## Baseline

- Accepted v0.4.0 Build 002.7a.
- Accepted regression baseline: 202 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

- Activate the existing `appPreferencesV1.appearance` contract.
- Expose System, Light, and Dark choices in Settings.
- Apply and persist the choice immediately.
- Preserve system-mode responsiveness to operating-system color-scheme changes.
- Keep backup format, layouts, normalized data, PDF rendering, and `README.md` unchanged.

## Checkpoints

- [x] C0 — Build 002.7a copied and Build 003.1 scope frozen.
- [x] C1 — Appearance runtime and Settings workflow implemented.
- [x] C2 — Focused tests and full accepted suite pass.
- [x] C3 — Browser smoke and protected-file verification pass.
- [x] C4 — Changed-files archive and checksum independently verified.

## Resume rule

Resume at the first unchecked checkpoint. Package only files changed from Build 002.7a; do not include this checkpoint file.
