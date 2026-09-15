# Scorecard Studio — Designer Completion Inventory

**Baseline:** Build 016 accepted  
**Milestone:** v0.2.0 — Complete Field Mapping & Formatting  
**Purpose:** Track what remains before the Layout Designer can be considered functionally complete for the traditional pregame scorecard v1 scope.

## Completion standard

The Designer is functionally complete when a user can take a blank scorecard PDF, map the traditional pregame information they reasonably want, format it appropriately, edit the design safely, judge the design with representative preview data, and generate the scorecard without needing to work around obvious Designer limitations.

Advanced broadcaster-style matchup research is not part of this completion standard. Game Day/research features, one-click generation, backup/export/import, and broader application polish may continue after the Designer milestone.

## Current inventory

| Designer area | Build 016 state | v1 classification | Next action |
|---|---|---|---|
| PDF/layout workspace | Complete | Required / done | Freeze unless a demonstrated defect appears |
| Data Palette/navigation | Complete | Required / done | Freeze interaction model |
| Single Item | Complete | Required / done | No planned structural work |
| Text Template | Core complete | Required / mostly done | Confirm record/slot template coverage and missing-value punctuation needs |
| Repeated Layout | Core complete | Required / mostly done | Preview/capacity robustness remains |
| Individual Placement | Complete | Required / done | No planned structural work |
| Starting Pitcher | Incomplete Designer exposure | Required | **Build 017** |
| Canonical field coverage | Partial/needs audit | Required | Audit after Build 017 |
| Player name formatting | Not complete | Required | Add after field-coverage audit |
| Font size/alignment | Complete | Required / done | Preserve |
| Static text color | Deferred | Required | Add in formatting build |
| Conditional/data-driven color | Deferred | Scope decision | Prefer narrow handedness use case over generalized rules engine |
| Long-text fit behavior | Unresolved | Scope decision | Define intentional v1 policy |
| Synthetic collection preview data | Deferred | Required | Fill configured capacities deterministically |
| Capacity/overflow behavior | Functional | Required / refine | Keep under-capacity normal; improve guidance/warnings |
| Undo/Redo | Missing | Required | Add full Designer history |
| Generation-result UX | Functional | v1 polish | Separate success from warnings/notices clearly |
| Advanced matchup/research | Deferred | Not v1 Designer scope | Keep in Game Day/future research |

## Accepted foundation — do not redesign without cause

Builds 006–016 have established and browser-tested the following foundation:

- multi-page PDF upload/rendering and persistent layouts;
- PDF-relative mapping coordinates and PDF-point font sizes;
- baseline-aware generated-PDF placement;
- reusable data items with zero, one, or many placed instances;
- one authoritative selection across Palette, PDF Canvas, and Inspector;
- contextual editing with direct drag, keyboard nudge, numeric properties, alignment, and deletion;
- Single Item and Text Template creation;
- vertical, horizontal, and grid Repeated Layout geometry;
- Individual Placement by ordinal slot and supported semantic role;
- Umpire Crew as a normalized repeated collection;
- Palette search, Used-only filtering, task-oriented categories, and child instances;
- page navigation/scroll-to-selected-instance behavior; and
- Designer-only zoom that does not change persisted or generated PDF geometry.

## Build 017 — Starting Pitcher Record Expansion

Build 017 should remain intentionally narrow. Away and Home Starting Pitcher should become proper single player records in the Designer rather than effectively name-only data items. The existing canonical registry already defines the record and pitching-stat family.

Minimum user-facing record content should include:

- player name;
- jersey number;
- throws;
- wins;
- losses;
- W-L record;
- ERA;
- WHIP;
- innings pitched; and
- strikeouts.

Other already-supported canonical pitching leaves should be exposed consistently where practical, including games/games started, hits, runs, earned runs, home runs, walks, saves/holds where semantically applicable, and the existing compact pitching composite. `opponentAvg` remains unverified and must not be promoted merely to fill the UI.

Build 017 must preserve Home/Away symmetry, normal missing-value behavior, multiple independent placements, Text Template compatibility for scalar leaves, PDF-relative coordinates, and existing layouts without unnecessary migration.

## Post-017 field coverage audit

Before fixing the exact scope of the next numbered build, compare the canonical `FIELD_REGISTRY.md` traditional field library against what the Designer actually exposes. The audit should identify:

1. canonical fields fully exposed and usable;
2. canonical fields resolvable in the runtime but absent from the Designer;
3. fields shown in the Designer but not aligned with the canonical registry;
4. planned/unverified registry fields that should remain hidden; and
5. places where a formatting option is preferable to creating another semantic field.

Pay particular attention to the broader batting and pitching season/YTD families and to player name variants.

## Formatting completion decisions

### Player name format

The normalized player model already preserves source-backed name variants. The Designer should eventually let a mapping choose an appropriate supported name representation without reconstructing culturally complex names by splitting `fullName`. Missing selected variants may fall back to full name with a preview indication, consistent with the field-registry contract.

### Static color

Basic user-selected text color belongs in the v1 Designer formatting scope. Color should remain a placement/column/content formatting property and must not alter field identity.

### Conditional color

Conditional formatting remains a scope decision. A narrow data-driven use case such as Bats/Throws handedness is a strong candidate. Do not build a generalized formula/rules engine merely because the architecture can support future conditional formatting. User-selected colors must not be hard-coded to a particular R/L convention.

### Long-text fit

The Designer needs an intentional v1 answer for values longer than their available scorecard space. Candidate behavior includes an optional maximum width with shrink-to-fit. Wrapping, clipping, or richer text-flow behavior should be added only if real scorecard designs require them. Existing mappings must not silently change size or anchor semantics.

## Preview and collection robustness

Designer preview should not depend on the accidental membership count of one sample game. Deterministic synthetic records should fill unused configured collection slots so users can evaluate the entire geometry of lineups, benches, bullpens, umpire crews, and future collections. Synthetic identities should be collection-aware and compatible with future name-format controls.

Under-capacity collections are normal. Only actual membership beyond a layout's configured capacity is an overflow condition. Unusually large configured capacities may receive a soft design-time warning, but the Designer should not impose an MLB-specific hard maximum that prevents college, youth, or other scorecards.

## Undo/Redo

Full Designer Undo/Redo remains required. It should cover meaningful Designer mutations such as creation, deletion, movement, nudge, property/format changes, Text Template edits, repeated geometry changes, and repeated-slot content changes. Implement history against the accepted Build 016 interaction model; avoid a partial history system that leaves common destructive actions outside the stack.

## Generation-result UX

Generation already reports conditions such as collection overflow and incomplete repeated layouts, but the final v1 workflow should make the distinction between successful generation, warnings, and non-blocking notices obvious even when the browser save/download interaction occurs. This is a UX refinement, not a change to field resolution or PDF generation semantics.

## Provisional remaining sequence

Only Build 017 is locked. Later build numbers remain flexible until the preceding acceptance/audit work establishes the real scope.

1. **Build 017 — Starting Pitcher Record Expansion**
2. **Field & Player-Format Coverage** — canonical registry audit, traditional-field gaps, name formats
3. **Designer Formatting** — static color; scoped conditional color and long-text fit decisions
4. **Undo/Redo** — full Designer editing history
5. **Preview & Collection Robustness** — synthetic full-capacity samples, capacity guidance, overflow UX
6. **Designer Completion/Polish** — generation feedback and full-card acceptance pass

## Scope held for later

The following should not delay Designer completion unless a real scorecard acceptance test demonstrates otherwise:

- advanced conditionals/formulas in Text Templates;
- rich text or per-token styling;
- generalized repeated-collection template expressions beyond the agreed v1 need;
- advanced matchup/situational research;
- historical reconstruction algorithms beyond verified pregame data semantics;
- one-click favorite-team/favorite-layout generation;
- backup/export/import and cross-device portability; and
- broader Game Day/application polish.
