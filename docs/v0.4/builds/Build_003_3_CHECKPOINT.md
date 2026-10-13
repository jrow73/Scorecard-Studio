# Build 003.3 Checkpoint

## Baseline

- User-accepted v0.4.0 Build 003.2.
- Accepted regression baseline: 210 passing checks.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

- Apply the correct System/Light/Dark theme before the main stylesheet paints whenever a startup mirror is available.
- Keep IndexedDB `appPreferencesV1` authoritative and synchronize only the appearance value to a startup-only browser mirror.
- Honor reduced-motion preferences across application animation, transitions, and smooth scrolling.
- Improve keyboard entry, visible focus, and dialog naming without redesigning the interface.
- Preserve backup semantics, saved layouts, normalized data, PDF output, and `README.md`.

## Checkpoints

- [x] C0 — Build 003.2 copied and scope frozen.
- [x] C1 — Startup-theme continuity implemented and covered.
- [x] C2 — Reduced-motion and keyboard/dialog accessibility implemented and covered.
- [x] C3 — Full accepted suite, interactive browser acceptance, and protected-file checks pass; local headless launcher limitation documented.
- [x] C4 — Changed-files archive and checksum independently verified.

## Resume rule

Resume at the first unchecked checkpoint. Package only files changed from Build 003.2; do not include checkpoint files.
