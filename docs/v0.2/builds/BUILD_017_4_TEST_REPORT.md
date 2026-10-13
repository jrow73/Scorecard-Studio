# Build 017.4 Test Report

## Automated/source checks

Build 017.4 was checked as an overlay on the reconstructed Build 017.3 baseline.

- `node --check js/app.js` — PASS
- `tests/build017.test.mjs` — PASS
- `tests/build0172.test.mjs` — PASS
- `tests/build0173.test.mjs` — PASS
- `tests/build0174.test.mjs` — PASS
- Duplicate HTML ID scan — PASS (none found)

## Build 017.4 targeted coverage

The new regression test verifies that:

- Record Layout remains one record / one anchor.
- Record Layout creation is explicitly marked as a record workflow and repeated-arrangement controls are suppressed.
- Record children continue to support both Field and Text Template content.
- `Place New Item` remains available in the subordinate workspace while an existing block child is selected.
- `Place New Item` remains outside the top Selected Object parent card.

## Manual acceptance still required

Browser interaction should confirm the complete UI state transitions, especially:

1. Starting Pitcher -> Record Layout never exposes Vertical/Horizontal/Grid or slot-count controls.
2. A Starting Pitcher Record Layout accepts a mixed Field/Text Template/Field sequence.
3. Selecting an existing child leaves `Place New Item` visible below the child editor.
4. Clicking that action opens a new-item workflow scoped to the same parent.
5. Build 017.3 progressive reveal, Name Format capability gating, and contextual tokens remain correct.
