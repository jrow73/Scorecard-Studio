# Scorecard Studio v0.3.0 — Build 002 Closure

**Build:** 002.1–002.7  
**Closed:** 2026-10-06  
**Application baseline:** committed Scorecard Studio v0.2.0  
**Production-code changes:** none

## 1. Outcome

Build 002 is complete. It converted the Build 001 discovery backlog into a bounded, reproducible evidence set and an explicit source-adoption policy for the v0.3.0 normalized-model design.

The closure does not claim universal endpoint behavior. It records what is authoritative, conditional, optional, unavailable, deferred, or rejected; which fallback survives; and what cutoff/provenance must accompany each accepted value.

## 2. Increment ledger

| Increment | Completed scope | Principal output |
|---|---|---|
| 002.1 | Evidence harness and manifest | Bounded capture schema/tool, comparison contract, first reproducible controls |
| 002.2 | Schedule, Feed timing, exceptional states | Raw state requirements, lineup/official availability boundaries, variable postseason crew |
| 002.3 | Rosters, People statistics, Coaches | Active-membership scope, aggregate selection, two-way identity, manager/staff ambiguity |
| 002.4 | Standings, venues, timezones | Prior-day cutoff, typed standings tokens/groups, narrow Venue source and IANA timezone |
| 002.5 | Depth charts and team logos | Annotation-only pitcher roles, authoritative bullpen fallback, optional current-brand asset |
| 002.6 | MiLB and competition coverage | Endpoint-specific capability matrix and explicit sport/game-type routing |
| 002.7 | Findings and adoption decisions | Final precedence, availability, provenance, blocker classification, and Build 003 handoff |

## 3. Authoritative closure artifacts

| Question | Authority after Build 002 |
|---|---|
| What was requested and captured? | `V030_API_EVIDENCE_MANIFEST.md` plus focused fixtures |
| What did the evidence show? | `V030_API_FINDINGS.md` |
| Which levels/competitions were supported, conditional, absent, or untested? | `V030_COMPETITION_CAPABILITY_MATRIX.md` |
| Which source owns each concept and what fallback/cutoff applies? | `V030_SOURCE_ADOPTION_DECISIONS.md` |
| Which questions remain open, deferred, or rejected? | `V030_API_DISCOVERY_BACKLOG.md`, Build 002.7 closure table |
| What does v0.2.0 actually do? | `V030_DATA_SOURCE_AUDIT.md`, `V030_NORMALIZED_FIELD_MATRIX.md`, and executable baseline code |

The older `PREGAME_DATA_INVENTORY.md`, `GAME_PACK_FIELD_MATRIX.md`, and prose `FIELD_REGISTRY.md` retain their Build 001 authority classifications. They are product/history references, not the final v0.3.0 source-precedence authority.

## 4. Evidence accounting

- 120 minimized evidence fixtures.
- DISC-001 through DISC-012 actively investigated.
- DISC-013 through DISC-016 retained as non-blocking opportunistic validations, with partial evidence where available.
- DISC-017 through DISC-020 deferred to later product work.
- DISC-021 retains the Schedule-based derivation without new fan-out.
- DISC-022 remains rejected.
- Complete responses were fingerprinted but not retained; selected paths and asset metadata remain reproducible under the evidence schema.

## 5. Final decisions

1. Hydrated Schedule remains the selected-game base and original pregame source.
2. Dated roster remains active-membership authority; calendar-date scope is not game-specific membership.
3. People statistics are authoritative only with explicit sport, game type, stat type, and cutoff; spring, regular, and postseason totals remain separate.
4. Prior-day Standings remains ordinary pregame standings authority; returned source groups may be normalized, but intraday league reconstruction is rejected.
5. Game Feed remains officials authority and an acceptable already-loaded extended-venue source; it is not the default source for all traditional scorecard data.
6. The narrow season-scoped Venue endpoint is preferred for extended venue data when Feed is not otherwise required.
7. Depth-chart roles are optional annotations after active-roster intersection. They may identify `additionalStarters`, but dated roster and probable pitcher retain membership/starter authority.
8. Core Bullpen is active roster pitchers minus the selected starter minus annotated additional starters; users may include additional starters in the displayed Bullpen. Without annotations, roster-pitchers-minus-starter remains authoritative fallback.
9. Current logo SVGs are optional current-brand assets with validation and text fallback; they are not historical branding truth.
10. MLB/MiLB and spring/postseason behavior is routed by explicit context and per-source capability, never by an implicit MLB default or one global support flag.

## 6. Acceptance checklist

- [x] Every planned DISC-001–012 investigation has evidence, a limitation, and a disposition.
- [x] Conflicting sources have a documented precedence and fallback rule.
- [x] MiLB and competition-type boundaries are explicit.
- [x] Regular-season, spring, and postseason stat scopes are separate.
- [x] Availability distinguishes unposted, present-empty, omitted, unsupported, ambiguous, partial, failed, and stale states.
- [x] Required source-result and selected-value provenance is specified.
- [x] Rare/live carryovers are classified as non-blocking.
- [x] No production application code or `README.md` was changed.
- [x] The unchanged v0.2.0 release regression suite remains green.
- [x] The cumulative evidence suite remains green.

## 7. Non-blocking carryovers

- Same-game ordinary MLB lineup/probable/official publication milestones.
- Live delayed and transient suspended states.
- Real future doubleheader transition and between-games roster transaction.
- Live simultaneous two-way role case.
- Live neutral-site/international transition.
- Future/pregame timing at intended MiLB levels.
- Induced People chunk failure and broader rare staff ambiguity cases.
- Product decisions for full coaching catalog, venue-dimension fields, historical branding, and logo/PDF placement.

These observations may refine refresh policy, capability confidence, or later product behavior. They do not require reopening the core source-adoption decisions unless materially contradictory evidence appears.

## 8. Bounded Build 003 plan

The next build is normalized-model design, not another open-ended endpoint search.

### Build 003.1 — Versioned model and provenance contract

- Define the v0.3.0 root/context/source-result/availability/provenance types.
- Define competition and effective-cutoff representations.
- Specify canonical game-state mapping while preserving raw source status.

### Build 003.2 — Adapter and capability contracts

- Define typed inputs/outputs for Schedule, Feed, Boxscore, roster, People, Coaches, Standings, Venue, depth-chart, and logo adapters.
- Separate fetch requirements from provenance labels.
- Encode sport/game-type capability gating and partial-failure behavior.

### Build 003.3 — Compatibility and migration map

- Map v0.2.0 normalized paths and executable registry fields to the new model.
- Decide which compatibility paths remain temporarily supported and which aspirational containers are deferred.
- Specify snapshot/cache versioning and migration boundaries before persistence.

### Build 003.4 — Contract fixtures and implementation plan

- Turn source precedence and mixed-cutoff rules into model-level contract fixtures/tests.
- Cover Game 2 overlays, two-way identity, missing lineup, manager ambiguity, variable officials, MiLB capability absence, and scoped statistics.
- Produce an ordered implementation plan without bundling unrelated UI/catalog work.

No new API evidence should be required to start Build 003.1. Opportunistic evidence can be added later without blocking the model contract.

