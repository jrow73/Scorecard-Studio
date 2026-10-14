# Scorecard Studio v0.5 — Build 002.1 Checkpoint

**Status:** Complete  
**Date:** 2026-10-13  
**Visible UI:** unchanged

## Objective

Implement a pure, fixture-driven competition-phase classifier before changing Game Day presentation.

## Added contract

`js/v050-competition-context.js` classifies:

- MLB spring/preseason;
- MLB regular season before September 1;
- MLB regular-season playoff-race presentation on/after September 1;
- postseason game types with regular/postseason player-stat choices;
- MiLB first/second half only when explicit standings evidence identifies the half;
- MiLB regular-season fallback when half evidence is unavailable;
- All-Star and unknown contexts conservatively.

The output records the raw sport ID, game type, official date, optional split standings type, and the policy that produced the presentation phase. It also declares the appropriate standings request type and allowed player-stat scopes.

## Important boundaries

- September 1 is only an MLB presentation policy.
- No MiLB half is inferred from a date.
- Postseason player scope always combines `F,D,L,W`.
- All-Star and unknown events receive no guessed standings/stat scope.
- This build does not yet alter visible Game Day labels or cards.

## Files added

- `js/v050-competition-context.js`
- `tests/v050-competition-context.test.mjs`
- `docs/v0.5/V050_BUILD_002_1_CHECKPOINT.md`

## Validation

```text
node --test tests/v050-competition-context.test.mjs tests/v050-build0012-evidence.test.mjs tests/api-discovery-evidence.test.mjs
```

## Next action

Proceed to Build 002.2: connect the classifier to Game Day hydration and render contextual Advanced team summaries/standings while preserving the Standard card.
