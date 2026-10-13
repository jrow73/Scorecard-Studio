# Build 010 — Targeted Test Report

Status: automated/static checks passed; browser acceptance pending.

Checks performed:

- `node --check` on `js/app.js`, `js/field-registry.js`, `js/normalize.js`, and `js/formatter.js`.
- Registry count: 29 existing single-value fields retained; 22 repeated lineup fields added (11 per side).
- Repeated resolver requires a positive slot selector and resolves row-specific values.
- Valid numeric zero remains available for repeated statistics.
- Overflow helper distinguishes within-capacity vs beyond-capacity populated rows.
- Normalization fixture with a 10-player batting order preserves all 10 players instead of truncating at nine.
- Scalar field picker is restricted to single-cardinality fields; repeated lineup fields are exposed through the lineup-block column picker.

Still required in the browser:

- Designer first/last row interaction and physical placement.
- Mixed left/center/right column preview vs generated PDF alignment.
- Save/reload persistence of repeated blocks and columns in IndexedDB.
- Intentional capacity underflow/overflow behavior with real selected games.
- Build 009 scalar mapping geometry regression check.
- Local (VS Code Live Server) and Online (GitHub Pages) acceptance.
