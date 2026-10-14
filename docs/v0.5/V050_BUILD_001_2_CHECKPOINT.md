# Scorecard Studio v0.5 — Build 001.2 Checkpoint

**Status:** Complete  
**Date:** 2026-10-13  
**Runtime identity:** unchanged at v0.4.0 Build 004.9

## Objective

Establish fixture-backed evidence for season context, MiLB split seasons, postseason player statistics, player identity popovers, and MLB venue coverage before production implementation.

No application source, storage schema, saved layout, generated PDF, or visible UI changed.

## Results

### MiLB split seasons

Explicit first-half and second-half standings returned separate populated groups at every supported level:

| Level | League ID | Groups | Teams per group |
| --- | ---: | ---: | --- |
| Triple-A | 117 | 2 per half | 10, 10 |
| Double-A | 113 | 2 per half | 6, 6 |
| High-A | 116 | 2 per half | 6, 6 |
| Single-A | 122 | 2 per half | 6, 6 |

MiLB context can therefore be API-driven. The application must not assume one universal half-transition date.

### MiLB postseason player totals

Regular and combined-postseason queries returned distinct populated totals:

| Level | Player | Regular games | Prior postseason games |
| --- | --- | ---: | ---: |
| Triple-A | Jorbit Vivas | 100 | 2 |
| Double-A | A.J. Ewing | 28 | 2 |
| High-A | Marco Vargas | 95 | 2 |
| Single-A | Juneiker Caceres | 30 | 2 |

This supports offering the toggle at all currently supported levels, while retaining per-player unavailable handling.

### Player identity

The fixture covers formal-name differences with and without pronunciation, and identical formal/preferred names with and without pronunciation. Formal supplemental display is `firstName + lastName`; it deliberately excludes middle names from `fullFMLName`.

### MLB contexts

- gamePk `776498`: type `R`, official date `2025-09-01`.
- gamePk `778566`: type `A`, All-Star special-event fallback.
- Existing evidence supplies early regular-season, spring, and all four postseason round controls.

### Field-outline coverage

The current 2026 team fixture has 30 teams and 30 distinct MLB venue IDs. The externally inspected reference artifact matched all 30 and included 37 diagrams total. Legal/reuse review and independent extraction remain required.

## Files added

- `docs/v0.5/V050_ROADMAP.md`
- `docs/v0.5/V050_RESEARCH_FINDINGS.md`
- `docs/v0.5/V050_EVIDENCE_MANIFEST.md`
- `docs/v0.5/V050_BUILD_001_2_CHECKPOINT.md`
- `tests/v050-build0012-evidence.test.mjs`
- 20 bounded DISC-023 through DISC-027 fixtures

## Accepted decisions

1. MiLB half-season context uses explicit returned standings types.
2. The postseason player-stat toggle targets MLB through Single-A.
3. Combined postseason scope is `F,D,L,W` through the pregame cutoff.
4. Formal supplemental names use first and last components, not the middle-name-inclusive form.
5. Pronunciation remains optional and verbatim.
6. Field diagrams remain conditional despite complete current active-venue coverage.

## Validation

```text
node --test tests/v050-build0012-evidence.test.mjs tests/api-discovery-evidence.test.mjs
```

## Next action

Proceed to Build 002.1: implement the normalized competition-phase classifier and fixture-driven tests without yet changing visible Advanced team cards.
