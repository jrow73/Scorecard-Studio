# Scorecard Studio — Build 017.2 Test Report

## Automated verification

- `node --check js/app.js` — PASS
- `node --check js/field-registry.js` — PASS
- `node --check js/slot-content.js` — PASS
- `node --check js/formatter.js` — PASS
- `node --check js/normalize.js` — PASS
- `node tests/build017.test.mjs` — PASS
- `node tests/build0172.test.mjs` — PASS
- Designer HTML duplicate-ID check — PASS

## Build 017.2 targeted coverage

- Name Format visibility remains driven by the exact selected field's `playerName` capability.
- Parent/layout editing explicitly hides Name Format.
- Text Template child editing does not expose generic Name Format.
- Parent Selected Object controls are structurally separated from the subordinate editing workspace.
- Edit Layout is a parent action and switches from a selected repeated child to the actual parent block selection/anchor.
- Place New Item switches to the parent context and starts with Content Type as the first slot-content decision.
- Selected Item is a named workspace rather than a persistent mode button.
- Remove Item remains child-only while parent Delete retains complete-object semantics.
- Starting Pitcher record rows no longer use the Build 017.1 `offsetX` click-region workaround.
- Starting Pitcher record rows expose explicit collapsed/expanded chevrons and use the full summary row as the details toggle.
- Record-level Starting Pitcher creation remains available from the expanded record controls.
- Existing Build 017/017.1 contextual-token and player-name-format regression tests remain green.

## Browser smoke check

A local HTTP/headless-Chromium load was attempted. The headless process did not terminate cleanly in the container environment (external PDF-library/network and browser-service behavior), so it was treated as inconclusive rather than a pass/fail browser acceptance result. No application JavaScript syntax error was found by the automated checks above.

## Manual acceptance still required

Build 017.2 is specifically a Designer interaction/Inspector hotfix, so local browser acceptance remains the release gate. Exercise the checklist in `BUILD_017_2_IMPLEMENTATION.md`, with particular attention to:

- parent identity staying stable when selecting different children;
- parent Delete versus child Remove Item;
- Edit Layout X/Y reflecting the parent anchor;
- Change Placement remaining inside the Edit Layout workflow;
- Place New Item progressive reveal for Field versus Text Template;
- Name Format appearing only for Player Name fields;
- Starting Pitcher row-wide expand/collapse on both Away and Home.
