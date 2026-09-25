# Scorecard Studio — Designer Completion Inventory

**Baseline:** Build 026.4 accepted; Builds 023–026 complete  
**Milestone:** v0.2.0 — Complete Field Mapping & Formatting  
**Purpose:** Authoritative inventory of remaining work before the Layout Designer is functionally complete for the traditional pregame scorecard v1 scope.

## Completion standard

The Designer is functionally complete when a user can take a blank scorecard PDF, map the traditional pregame information they reasonably want, format it appropriately, edit the design safely, judge the design with representative preview data, and generate the scorecard without workarounds for obvious Designer limitations.

Advanced broadcaster-style matchup research, one-click generation, backup/export/import, and broader application polish are not prerequisites for this Designer milestone.

## Current inventory

| Designer area | Current state | v1 classification | Remaining action |
|---|---|---|---|
| PDF/layout workspace | Complete | Required / done | Freeze unless a demonstrated defect appears |
| Data Palette/navigation | Complete | Required / done | Build 026.4 accepted: Standard/Custom per-layout palette, searchable Custom picker, accordion/collapse behavior, dynamic counts, and restore-to-Standard workflow |
| Single Item | Complete | Required / done | No planned structural work |
| Text Template | Complete core workflow | Required / done | Preserve contextual token behavior; revisit only for demonstrated punctuation/missing-value need |
| Repeated Layout | Complete core workflow | Required / mostly done | Synthetic preview/capacity robustness remains |
| Record Layout | Complete | Required / done | Preserve single-anchor, mixed Field/Text Template child model |
| Individual Placement | Complete | Required / done | No planned structural work |
| Starting Pitcher | Complete | Required / done | Build 017 accepted |
| Parent/child Inspector workflow | Complete | Required / done | Preserve scoped child workspace and persistent Place New Item action |
| Canonical field coverage | Build 018.3 live diagnostic and normalization closure complete | Complete for Build 018 | Field catalog verified against representative and live selected-game data |
| Player name formatting | Boxscore Name representative behavior verified | Complete for Build 018 | Source-like compact names retained, including occasional disambiguation |
| Font size/alignment | Complete | Required / done | Preserve |
| Static text color | Complete | Required / done | Build 019 accepted |
| Conditional/data-driven color | Complete narrow scope | Required / done | Build 019 hitter/pitcher handedness opt-in retained; Build 026 only redesigns the settings presentation |
| Long-text fit behavior | Deferred to Build 027 | Required / investigate | Evaluate maximum width + shrink-to-fit/truncate; wrapping separately |
| Representative preview data | Build 023 fictional fixture | Required / Build 023 | Deterministic fictional teams/people/venue; 9 lineup / 6 bench / 14 bullpen / 6 umpires with text-width stress cases |
| Capacity/overflow behavior | Functional | Required / refine | Keep under-capacity normal; improve preview guidance/warnings |
| Undo/Redo | Complete | Required / done | Build 020 accepted |
| Generation-result UX | Functional | v1 polish | Separate success from warnings/notices clearly |
| Full-card regression/acceptance | Pending Build 028 | Required | Final Designer completion/release-review pass |
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

## Build 018 / 018.1 field-catalog result

Build 018 reconciles the active v1 field catalog, assigns Standard/Custom visibility metadata, preserves older resolvable IDs as compatibility-only, and closes the accepted Game/Team/Player/Umpire field gaps. Build 018.1 adds concise per-field descriptions, deterministic example values, and a shared representative Designer sample model.

The representative model is a preview/test fixture only. Generated scorecards continue to use selected-game data and must remain blank when a requested live value is unavailable. The field descriptions/example values are intended to support both current Designer understanding and a future Custom Fields selector without creating a wall of explanatory text.

Browser acceptance remains required before these builds are considered closed.

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

## Remaining build path to v0.2.0

Build 026.4 is accepted and is the baseline for the remaining v0.2.0 Designer runway. Builds 023–026 are complete.

1. **Build 023 — Representative Data & Test PDF** — deterministic fictional stress-test data; Designer Test PDF uses Representative Data only.
2. **Build 024 — Designer Workflow & Inspector Cleanup** — progressive reveal, Text Template/name-format and blank-value cleanup, compact Inspector/header, toolbar Copy/Paste, delete consistency, helper/footer cleanup.
3. **Build 025 — Live Game PDF Integration** — narrow A/B integration checkpoint: generate the Home-page selected game's live pregame scorecard from a saved layout using the same drawing path as Designer Test PDF.
4. **Build 026 — Field Palette & Layout Settings** — dark-theme settings, Standard/Custom field selection, custom field picker, conditional-format toggles, palette cleanup, Umpire Crew consolidation.
5. **Build 027 — Text Overflow & Fit Controls** — feasibility and implementation of intentional overflow behavior, with maximum-width/shrink-to-fit as the leading candidate and truncate/wrap evaluated as alternatives.
6. **Build 028 — Designer Completion / Release Review** — full-card/fresh-layout regression, persistence/reload, Test PDF/live PDF comparison, documentation reconciliation, and v0.2.0 release readiness.

## Scope held for later

The following should not delay v0.2.0 Designer completion unless a real scorecard acceptance test demonstrates otherwise:

- advanced conditionals/formulas in Text Templates;
- rich text or per-token styling;
- generalized repeated-collection template expressions beyond the agreed v1 need;
- advanced matchup/situational research;
- historical reconstruction algorithms beyond verified pregame data semantics;
- a dedicated favorite-layout preference beyond Build 025's remembered live-generation layout selection;
- backup/export/import and cross-device portability; and
- broader Game Day/application polish.


## Build 018.2 live-data closure pass

Build 018.2 adds a developer-facing Field Coverage Diagnostic that resolves every active catalog definition against the selected real game, displays representative vs live values, identifies required sources, and reports repeated-field coverage across all applicable members. This is now the primary acceptance tool for closing Build 018 field coverage.

The diagnostic also exposes whether a blank comes from genuine missing game data, a missing supplemental source, partial repeated coverage, or a resolver error. PDF generation now shares the same field-driven supplemental hydration path, including Standings when a mapped field requires it.

Two Build 018.1 acceptance defects are included: DH maps to `DH` in the derived Position Number field rather than blank, and representative Boxscore Name values model MLB-style compact source names rather than mechanically formatting every player as `Lastname, F`.


## Build 018.3 final acceptance closure

Build 018.3 closes the four remaining findings from the Build 018.2 Field Diagnostic review: Day/Night representative/live casing parity, realistic fixed-umpire examples, long-form division examples, and deterministic full names for today's posted defensive positions. The live diagnostic otherwise reported all active fields Available with complete repeated-field coverage in the acceptance game, and freshly generated PDFs populated the supplemental standings values that had been blank in Build 018.1.

A final 018.3-05 acceptance cleanup expands representative repeated collections to 9 lineup / 6 bench / 14 bullpen / 6 umpires and replaces sequential jersey samples with deterministic mixed single- and double-digit values. With these fixes, Build 018 field coverage is considered complete. Future work may build the user-facing Standard/Custom field-selection workflow on top of the registry metadata, but that interface is not part of Build 018.

## Build 024 — Designer Workflow & Inspector Cleanup

Build 024 addresses Text Template blank suppression and Player Name formatting parity, progressive Repeated Layout content creation, role-driven Individual Placement, toolbar Copy/Paste, compact selection actions, helper-text cleanup, delete-path consistency, and removal of persistent Designer footer/status panels. Umpire Crew consolidation remains grouped with Build 025.

Remaining v0.2.0 roadmap: Build 027 Text Overflow & Fit Controls; Build 028 Designer Completion / Release Review.

## Build 026 — Field Palette & Layout Settings — accepted through Build 026.4

Build 026 closes the field-palette/settings phase of the v0.2.0 Designer runway. The accepted baseline provides registry-driven Standard defaults and persistent Custom field selections; a searchable Custom Field Selector with balanced Away/Home grouping, per-card counts and bulk controls, Restore Standard Fields, sticky close/search controls, and explicit support for zero selected fields; Layout Details editing and same-page-count PDF replacement; collapsed-by-default default-formatting controls; palette accordion/collapse behavior; Team-format Manager placement; Starting Pitcher record cleanup; Text Template filtering against enabled fields without destroying existing tokens; and dynamic field/availability counts.

The remaining Designer work is intentionally narrow:

1. **Build 027 — Text Overflow & Fit Controls** — establish intentional long-text behavior with browser/PDF parity.
2. **Build 028 — Designer Completion / Release Review** — perform fresh-layout/full-scorecard regression, persistence/reload, Test PDF/live PDF comparison, documentation reconciliation, and v0.2.0 release-readiness review.
