# Scorecard Studio — Build 017.1 Test Report

## Automated verification

- `node --check js/app.js` — PASS
- `node --check js/field-registry.js` — PASS
- `node --check js/slot-content.js` — PASS
- `node --check js/formatter.js` — PASS
- `node --check js/normalize.js` — PASS
- `node tests/build017.test.mjs` — PASS
- Designer HTML duplicate-ID check — PASS

## Build 017.1 regression coverage added

- Name Format capability on Starting Lineup, Bench, and Bullpen player-name fields.
- Non-name fields do not expose the player-name capability.
- Repeated player-name resolution honors Last Name and First Initial + Last Name formatting.
- Short contextual tokens such as `[Player Name]`, `[Jersey #]`, `[AVG]`, `[W-L]`, and `[ERA]` resolve in their own record context.
- Cross-context short tokens remain blank.
- Existing long-form Build 017 contextual tokens remain valid.

## Manual acceptance still required

The browser UI portions of the acceptance checklist should be exercised locally, particularly object lifecycle actions, the mutually exclusive collection Inspector workspaces, Starting Pitcher palette expansion, and Designer/generated-PDF visual agreement.
