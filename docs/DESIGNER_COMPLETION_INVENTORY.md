# Scorecard Studio — Designer Completion Inventory

**Baseline:** Build 017 accepted (including hotfixes through Build 017.4)  
**Milestone:** v0.2.0 — Complete Field Mapping & Formatting  
**Purpose:** Authoritative inventory of remaining work before the Layout Designer is functionally complete for the traditional pregame scorecard v1 scope.

## Completion standard

The Designer is functionally complete when a user can take a blank scorecard PDF, map the traditional pregame information they reasonably want, format it appropriately, edit the design safely, judge the design with representative preview data, and generate the scorecard without workarounds for obvious Designer limitations.

Advanced broadcaster-style matchup research, one-click generation, backup/export/import, and broader application polish are not prerequisites for this Designer milestone.

## Current inventory

| Designer area | Build 017 state | v1 classification | Remaining action |
|---|---|---|---|
| PDF/layout workspace | Complete | Required / done | Freeze unless a demonstrated defect appears |
| Data Palette/navigation | Complete | Required / done | Freeze interaction model |
| Single Item | Complete | Required / done | No planned structural work |
| Text Template | Complete core workflow | Required / done | Preserve contextual token behavior; revisit only for demonstrated punctuation/missing-value need |
| Repeated Layout | Complete core workflow | Required / mostly done | Synthetic preview/capacity robustness remains |
| Record Layout | Complete | Required / done | Preserve single-anchor, mixed Field/Text Template child model |
| Individual Placement | Complete | Required / done | No planned structural work |
| Starting Pitcher | Complete | Required / done | Build 017 accepted |
| Parent/child Inspector workflow | Complete | Required / done | Preserve scoped child workspace and persistent Place New Item action |
| Canonical field coverage | Needs audit | Required | **Next build candidate** |
| Player name formatting | Initial support implemented | Required / partial | Audit all applicable person-name fields and fallback behavior |
| Font size/alignment | Complete | Required / done | Preserve |
| Static text color | Not implemented | Required | Add in formatting build |
| Conditional/data-driven color | Not implemented | Scope decision | Prefer narrow handedness use case over generalized rules engine |
| Long-text fit behavior | Unresolved | Scope decision | Define intentional v1 policy |
| Synthetic collection preview data | Not implemented | Required | Fill configured capacities deterministically |
| Capacity/overflow behavior | Functional | Required / refine | Keep under-capacity normal; improve preview guidance/warnings |
| Undo/Redo | Missing | Required | Add full Designer history |
| Generation-result UX | Functional | v1 polish | Separate success from warnings/notices clearly |
| Full-card regression/acceptance | Pending | Required | Final Designer completion pass |
| Advanced matchup/research | Deferred | Not v1 Designer scope | Keep in Game Day/future research |

## Accepted foundation — do not redesign without cause

Builds 006–017.4 establish the accepted Designer foundation:

- multi-page PDF upload/rendering and persistent layouts;
- PDF-relative mapping coordinates and PDF-point font sizes;
- baseline-aware generated-PDF placement;
- reusable data items with zero, one, or many placed instances;
- one authoritative selection across Palette, PDF Canvas, and Inspector;
- contextual editing with direct drag, keyboard nudge, numeric properties, alignment, and deletion;
- Single Item and Text Template creation;
- vertical, horizontal, and grid Repeated Layout geometry;
- Record Layout as a single anchored record with an ordered mixture of Field and Text Template children;
- Individual Placement by ordinal slot and supported semantic role;
- Umpire Crew as a normalized repeated collection;
- Starting Pitcher as a record exposing identity, handedness, and supported pitching-stat leaves;
- contextual Text Template field labels/tokens inside record and collection context, while preserving fully qualified tokens outside context;
- capability-gated Name Format controls rather than a generic formatting control;
- progressive-reveal creation workflows with branch-specific controls and deliberate required selections;
- parent/container actions separated from child-content editing;
- child workspaces scoped to the selected parent only;
- Place New Item available in the child workspace while editing a container or existing child;
- Palette search, Used-only filtering, task-oriented categories, and child instances;
- page navigation/scroll-to-selected-instance behavior; and
- Designer-only zoom that does not change persisted or generated PDF geometry.

## Build 017 accepted result

Build 017, including acceptance hotfixes through Build 017.4, is complete. Away and Home Starting Pitcher are proper single player records rather than name-only data items. The Designer exposes the supported player identity/handedness and pitching-stat family and allows those values to be composed as individual fields and contextual Text Templates inside a one-record Record Layout.

The Build 017 acceptance cycle also established reusable Designer behavior beyond Starting Pitcher: Record Layout semantics, contextual token presentation/insertion, capability-based Name Format visibility, strict parent/child Inspector scoping, true progressive reveal, and the persistent child-content creation loop. These are now baseline behaviors, not future work.

## Next required audit — field and player-format coverage

Before adding more formatting features, compare `FIELD_REGISTRY.md` against what the Designer actually exposes. The audit should identify:

1. canonical fields fully exposed and usable;
2. canonical fields resolvable at runtime but absent from the Designer;
3. fields shown in the Designer that are not aligned with the canonical registry;
4. planned/unverified registry fields that should remain hidden;
5. applicable person-name fields that support Name Format and their fallback behavior; and
6. cases where a formatting option is preferable to creating another semantic field.

Pay particular attention to batting and pitching season/YTD families, team/game metadata, player name variants, managers/coaches where supported, and Home/Away symmetry.

## Formatting completion decisions

### Player name format

Build 017 introduced capability-gated Name Format behavior. The remaining task is coverage: verify that every appropriate person-name field exposes the supported representations and that non-name fields and parent/container objects never do. Do not reconstruct culturally complex names by splitting `fullName`; use source-backed normalized variants and the documented fallback contract.

### Static color

Basic user-selected text color remains in v0.2.0 Designer scope. Color should be a placement/child-content formatting property and must not alter field identity.

### Conditional color

Conditional formatting remains a scope decision. A narrow data-driven use case such as Bats/Throws handedness is a strong candidate. Do not build a generalized formula/rules engine merely because future architecture could support one. User-selected colors must not be hard-coded to a particular R/L/S convention.

### Long-text fit

The Designer still needs an intentional v1 policy for values longer than their available scorecard space. An optional maximum width with shrink-to-fit is the leading candidate. Wrapping, clipping, or richer text flow should be added only if real scorecard designs require them. Existing mappings must not silently change size or anchor semantics.

## Preview and collection robustness

Designer preview should not depend on the accidental membership count of one sample game. Deterministic synthetic records should fill unused configured collection slots so users can evaluate the complete geometry of lineups, benches, bullpens, umpire crews, and similar collections. Synthetic identities should be collection-aware and compatible with Name Format.

Under-capacity collections are normal. Only actual membership beyond a layout's configured capacity is overflow. Unusually large configured capacities may receive a soft design-time warning, but the Designer should not impose an MLB-specific hard maximum that prevents college, youth, or other scorecards.

## Undo/Redo

Full Designer Undo/Redo remains required. It should cover meaningful Designer mutations including creation, deletion, movement, nudge, property/format changes, Text Template edits, repeated geometry changes, Record Layout child changes, and repeated-slot content changes. Implement history against the accepted Build 017 interaction model rather than redesigning selection or Inspector behavior.

## Generation-result UX

Generation already reports conditions such as collection overflow and incomplete layouts. The final v1 workflow should clearly distinguish successful generation, warnings, and non-blocking notices even when the browser save/download interaction occurs. This is a UX refinement, not a change to field resolution or PDF-generation semantics.

## Provisional remaining build path to v0.2.0

Build 017 is accepted. The remaining build numbers are provisional until each preceding audit/acceptance pass fixes the next scope.

1. **Build 018 — Field & Player-Format Coverage Audit/Completion** — reconcile Designer exposure with the canonical registry; close traditional pregame field gaps; complete Name Format coverage.
2. **Designer Formatting** — static text color plus explicit v1 decisions/implementation for narrowly scoped conditional color and long-text fit.
3. **Undo/Redo** — coherent Designer editing history across all accepted object types and mutations.
4. **Preview & Collection Robustness** — deterministic full-capacity sample data, capacity guidance, and overflow UX refinement.
5. **Designer Completion/Polish** — generation feedback, complete scorecard-design regression pass, documentation cleanup, and v0.2.0 release readiness.

The exact numbering after Build 018 should remain flexible.

## Scope held for later

The following should not delay v0.2.0 Designer completion unless a real scorecard acceptance test demonstrates otherwise:

- advanced conditionals/formulas in Text Templates;
- rich text or per-token styling;
- generalized repeated-collection template expressions beyond the agreed v1 need;
- advanced matchup/situational research;
- historical reconstruction algorithms beyond verified pregame data semantics;
- one-click favorite-team/favorite-layout generation;
- backup/export/import and cross-device portability; and
- broader Game Day/application polish.
