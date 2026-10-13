# Scorecard Studio v0.4.0 Build 001 Acceptance

**Status:** Accepted  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 001.8`  
**Baseline:** accepted v0.3.0 Build 005.4 plus v0.4.0 Builds 001.1–001.7

## Purpose

This is the closure gate for v0.4 Build 001. It consolidates the previously accepted product-surface, Settings, Home, Game Day, representative-data, field-catalog, and Designer pitcher-group contracts. It is acceptance evidence, not a new source of product behavior.

## Acceptance matrix

| Area | Closure case | Result | Evidence |
|---|---|---|---|
| Favorite team | MLB, Triple-A, Double-A, High-A, and Single-A retain their stored level and sport context | Pass | Consolidated acceptance test plus Settings foundation tests |
| Schedule requests | Favorite-team requests carry date, team ID, and saved sport ID; level browsing carries date and sport ID without a team filter | Pass | Consolidated acceptance test |
| Empty schedule | A successful Schedule response with no dates/games remains an empty result instead of a fabricated game | Pass | Consolidated request test and Home readiness tests |
| Multiple games | Both games of a same-date doubleheader retain independent `gamePk`, `gameNumber`, and doubleheader identity and sort deterministically | Pass | Consolidated acceptance test and normalized-model scenario tests |
| Readiness | Waiting, Partial, Ready, Final, Postponed, Cancelled, and Suspended remain distinct policy outcomes | Pass | Consolidated acceptance test and Home readiness tests |
| Probable starters | Either missing probable starter renders independently as `TBD` and does not alter lineup readiness | Pass | Consolidated acceptance test |
| Home boundary | Home remains Schedule-first and does not become the research dashboard | Pass | Home readiness and static surface tests |
| Game Day | Research sections remain available; selected starter, additional starters, classified bullpen, and unclassified fallback remain truthful | Pass | Consolidated acceptance test and Game Day research tests |
| Representative data | Schema-v2 sample validates and exercises classified/fallback pitchers, names, staff, officials, standings, availability, and lineage | Pass | Schema-v2 representative and field-coverage tests |
| Field exposure | 223 registry definitions retain explicit dispositions; generated coverage report is current | Pass | Generated report check and field-coverage tests |
| New layouts | Core, Combined, and Additional pitcher modes select deterministic row sets across Designer and PDF paths | Pass | Consolidated acceptance test and Designer pitcher-group tests |
| Old layouts | A bullpen block with no stored mode remains historical Combined behavior and is not rewritten on load | Pass | Consolidated acceptance test and compatibility tests |
| Browser entry point | Home, Game Day, and Layouts/Designer entry load under the Build 001.8 cache and runtime identity | Pass | Local browser smoke test |
| Protected contract | `README.md` remains unchanged | Pass | SHA-256 verification |

## Automated result

- 160 current regression checks pass, including 6 consolidated Build 001 closure checks.
- The generated field-coverage report is current.
- The browser smoke test loaded `0.4.0-dev • Build 001.8`, the Schedule-first Home surface, the Game Day research companion, and the Layout Library/Designer entry point.
- No acceptance defect required an application behavior change in Build 001.8.

## Carryovers beyond Build 001

These remain deliberately outside the accepted Build 001 scope:

1. Rookie-level support requires the discovery gate in `V040_GAME_SELECTION_SCOPE.md`; it is not advertised as supported.
2. College baseball and Korean professional baseball require separate provider and contract investigation.
3. Advanced matchup history, batter-versus-pitcher data, splits, and recent-form research remain unavailable unless a later build adopts authoritative sources.
4. Broader appearance features and other global preferences may extend Settings later.
5. New product capabilities should begin a separately scoped v0.4 Build 002 rather than silently extending this closure build.

## Closure decision

v0.4 Build 001 is accepted. Build 001.8 changes runtime identity and adds closure evidence; it does not alter source selection, normalization, storage, saved-layout semantics, or PDF rendering behavior.
