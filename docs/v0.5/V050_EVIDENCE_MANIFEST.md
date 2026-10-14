# Scorecard Studio v0.5 — Evidence Manifest

**Schema:** `docs/V030_API_EVIDENCE_SCHEMA.md`, version 1  
**Fixture root:** `tests/fixtures/api-discovery/`  
**Capture date:** 2026-10-13

## DISC-023 — MiLB split-season standings

| Fixture | Level | Type |
| --- | --- | --- |
| `disc-023-117-firsthalf-2025.json` | Triple-A | firstHalf |
| `disc-023-117-secondhalf-2025.json` | Triple-A | secondHalf |
| `disc-023-113-firsthalf-2025.json` | Double-A | firstHalf |
| `disc-023-113-secondhalf-2025.json` | Double-A | secondHalf |
| `disc-023-116-firsthalf-2025.json` | High-A | firstHalf |
| `disc-023-116-secondhalf-2025.json` | High-A | secondHalf |
| `disc-023-122-firsthalf-2025.json` | Single-A | firstHalf |
| `disc-023-122-secondhalf-2025.json` | Single-A | secondHalf |

Each fixture retains both returned standings groups from an exact half-specific request.

## DISC-024 — MiLB regular/postseason player scopes

| Pair prefix | Level | Person ID |
| --- | --- | ---: |
| `disc-024-678391-aaa-*` | Triple-A | 678391 |
| `disc-024-805999-aa-*` | Double-A | 805999 |
| `disc-024-804614-high-a-*` | High-A | 804614 |
| `disc-024-821181-single-a-*` | Single-A | 821181 |

Each prefix has `regular-2025` and `postseason-2025` fixtures. Regular uses game type `R`; postseason uses `F,D,L,W`. Both use explicit sport ID, `byDateRange`, and a pregame cutoff.

## DISC-025 — Player identity

`disc-025-player-identity-pronunciation-controls.json` retains People objects for Cal Raleigh, Josh Naylor, Shohei Ohtani, and Aaron Judge.

## DISC-026 — Competition contexts

| Fixture | Expected evidence |
| --- | --- |
| `disc-026-776498-schedule-september-regular.json` | MLB `R` on September 1 |
| `disc-026-778566-schedule-all-star.json` | MLB `A` special-event fallback |

DISC-003 and DISC-012 provide early regular-season, spring, and postseason-round controls.

## DISC-027 — Active MLB venue IDs

`disc-027-mlb-active-venues-2026.json` retains the 2026 MLB team list hydrated with venue identity. It is the bounded Stats API side of the field-outline coverage comparison.

The separately inspected public Savant-derived artifact contained 37 venue IDs and covered all 30 active venue IDs in this fixture on 2026-10-13. Its body was not copied into Scorecard Studio.

## Interpretation boundary

These captures demonstrate current response shape and availability, not immutable historical truth or a service guarantee. Runtime behavior must retain explicit unavailable states and established no-spoiler cutoffs.
