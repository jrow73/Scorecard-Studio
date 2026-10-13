# Scorecard Studio — Build 017.3 Test Report

## Automated checks

The Build 017.3 changed-file set was checked with:

- `node --check js/app.js`
- existing `tests/build017.test.mjs`
- existing `tests/build0172.test.mjs`
- new `tests/build0173.test.mjs`
- duplicate HTML ID scan

All automated checks passed before packaging.

## What the Build 017.3 test covers

The new regression test verifies source-level invariants for:

- exact-field Name Format capability gating;
- explicit hidden-state CSS for Name Format and progressive-reveal controls;
- contextual short labels/tokens for record Text Templates;
- Place New Item being outside the parent card;
- scoped child workspace suppression of the global repeated-layout inventory;
- progressive reveal by Content Type;
- blank/reset required settings; and
- disabled Add Slot Content until the selected branch is valid.

## Manual acceptance still required

Browser interaction is the acceptance gate for this build. In particular, verify the visual workflows listed in `BUILD_017_3_IMPLEMENTATION.md` for:

1. Game Date / other non-name fields;
2. Starting Pitcher contextual Text Templates;
3. Away Bench parent/child Inspector hierarchy;
4. absence of unrelated layout/remove-item leakage; and
5. Field vs Text Template progressive reveal and disabled-button behavior.
