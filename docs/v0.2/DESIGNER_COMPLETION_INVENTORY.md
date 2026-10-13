# Scorecard Studio — Designer Completion Inventory

> **Final v0.2.0 status (Oct 3, 2026):** The planned Designer roadmap is complete through Build 032.5, and Release Prep plus all RC corrections have passed acceptance. Builds 018–032 below are retained as implementation history. Post-v0.2.0 touch and game-day work is deferred to future development.


**Baseline:** Build 032.5 accepted; planned v0.2.0 Designer roadmap complete  
**Milestone:** v0.2.0 — Complete Field Mapping & Formatting  
**Purpose:** Historical Designer completion inventory plus authoritative v0.2.0 Designer closure status for release review.

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
| Full-card regression/acceptance | Build 032 complete; release review current | Required for release | Designer implementation closed at 032.5; final v0.2.0 release acceptance remains |
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

Build 027 implements the v0.2.0 long-text policy: unrestricted text remains the default, while any text-bearing placement may opt in to a maximum width with shrink-to-fit. The preferred font size remains unchanged in layout data; the final resolved Representative or live value is measured independently at render time and reduced only when needed. No minimum font size, wrapping, clipping, truncation, or automatic neighbor-based boundary inference is imposed. Existing mappings therefore retain their prior size and anchor semantics unless the designer explicitly enables a width limit.

Build 027.2 completes the Designer polish after technical acceptance: shrink-to-fit is grouped with the other formatting controls above the formatting/content divider; the option is labeled **Enable Shrink to Fit** with the checkbox on the same compact line; Maximum Width uses a compact inline point-value field; redundant remove/help UI is removed; and the draggable circular endpoint is replaced by a precision crosshair with a larger invisible hit target.

Build 027.3 separates the enabled state from the stored width. Unchecking **Enable Shrink to Fit** now disables fitting without deleting the designer-selected `fitWidthPoints`; re-enabling restores the same boundary. Existing Build 027–027.2 layouts with a stored width and no explicit enabled flag remain enabled for backward compatibility.

## Preview and collection robustness

Designer preview should not depend on the accidental membership count of one sample game. Deterministic synthetic records should fill unused configured collection slots so users can evaluate the complete geometry of lineups, benches, bullpens, umpire crews, and similar collections. Synthetic identities should be collection-aware and compatible with Name Format.

Under-capacity collections are normal. Only actual membership beyond a layout's configured capacity is overflow. Unusually large configured capacities may receive a soft design-time warning, but the Designer should not impose an MLB-specific hard maximum that prevents college, youth, or other scorecards.

## Undo/Redo

Historical Build 017 note: Full Designer Undo/Redo was still required at this checkpoint. It was subsequently implemented and accepted in Build 020.

## Generation-result UX

Generation already reports conditions such as collection overflow and incomplete layouts. The final v1 workflow should clearly distinguish successful generation, warnings, and non-blocking notices even when the browser save/download interaction occurs. This is a UX refinement, not a change to field resolution or PDF-generation semantics.

## Remaining build path to v0.2.0

Build 028 is accepted through Build 028.20 and is closed. Builds 023–028 are complete. The remaining v0.2.0 work is deliberately split into three focused completion builds plus the final release review.

1. **Build 029 — Pregame Data Context & Semantics** — define the exact pregame cutoff for the selected game, including earlier same-day doubleheader games; correct team/player YTD context; display First Pitch in the venue timezone; add Away/Home Team Game Number.
2. **Build 030 — Layout Settings Workflow** — standardize the parent Layout Settings modal and its Layout Details / Custom Fields / Default Formatting child views using fixed header/footer chrome, scrollable bodies, bottom-right Cancel/Save actions, and consistent unsaved-change handling.
3. **Build 031 — Text Template Workflow Completion** — finish the generic Text Template palette/creation workflow for v0.2.0, preferably flattening the redundant category/item hierarchy if the palette architecture supports it cleanly.
4. **Build 032 — Designer Remaining Tweaks** — full fresh-layout/full-scorecard regression, persistence/reload, Representative Test PDF/live PDF comparison, viewport/multi-page checks, documentation reconciliation, and final release readiness. No planned feature expansion.

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

Builds 027 and 028 are complete. Remaining v0.2.0 roadmap: Build 029 Pregame Data Context & Semantics; Build 030 Layout Settings Workflow; Build 031 Text Template Workflow Completion; Build 032 Designer Remaining Tweaks, followed by the v0.2.0 release review.

## Build 026 — Field Palette & Layout Settings — accepted through Build 026.4

Build 026 closes the field-palette/settings phase of the v0.2.0 Designer runway. The accepted baseline provides registry-driven Standard defaults and persistent Custom field selections; a searchable Custom Field Selector with balanced Away/Home grouping, per-card counts and bulk controls, Restore Standard Fields, sticky close/search controls, and explicit support for zero selected fields; Layout Details editing and same-page-count PDF replacement; collapsed-by-default default-formatting controls; palette accordion/collapse behavior; Team-format Manager placement; Starting Pitcher record cleanup; Text Template filtering against enabled fields without destroying existing tokens; and dynamic field/availability counts.

Builds 027 and 028 are now accepted. The remaining v0.2.0 Designer work is Build 029 Pregame Data Context & Semantics, Build 030 Layout Settings Workflow, Build 031 Text Template Workflow Completion, and Build 032 Designer Remaining Tweaks, followed by the v0.2.0 release review.


## Build 028 final accepted state
Build 028 is closed through Build 028.20. It completed date-format controls; representative-name review; palette used-state simplification and first-class Defensive Alignment; compact Inspector/Formatting cleanup; Individual Placement progressive reveal; Starting Pitcher workflow/context/conditional-format corrections; Bench/Bullpen forced Repeated Layout workflows; per-instance Bench/Bullpen sorting; Team Information Text Template context retention; stronger modal separation; Inspector action polish; Paste/Zoom popover dismissal; Custom Color interaction fixes; and final Designer toolbar-space cleanup.

The remaining v0.2.0 runway is intentionally outside Build 028: Build 029 data context, Build 030 Layout Settings workflow, Build 031 Text Template workflow completion, and Build 032 Designer Remaining Tweaks, followed by the v0.2.0 release review.


## Build 031 final closure (Oct 2, 2026)

Build 031 — Text Template Workflow Completion is accepted and closed through Build 031.1. The generic Text Template palette is flattened to `Text Template -> instances`; creation enters the editor directly; the abandoned empty chooser panel is removed; and shared Text Template editing terminology is standardized to **Editor** and **Insert into editor**. Acceptance confirmed that the shared terminology also appears in repeated-record Text Template areas, so no Build 031.2 consistency fix is required. The next implementation bucket is **Build 032 — Designer Remaining Tweaks**, followed by the **v0.2.0 release review**.


## Build 032 final closure (Oct 3, 2026)

Build 032 — Designer Remaining Tweaks is complete through Build 032.5. The accepted final Designer cleanup includes: Unused-only Field Palette filtering and dynamic `used of available` counts; standardized Designer action/toolbar sizing and Inspector visual density; clearer Text Template Editor affordance and compact Formatting controls; removal of exposed slot/anchor terminology in favor of row/column/position/point wording; Starting Pitcher Record Layout row semantics; Defensive Alignment Text Template support with sequential role carry-forward and Player Name format handling; repeated-record Editor/Insert into editor label consistency; and removal of the development-only Designer workspace/build eyebrow.

With Builds 029–032 closed, the **planned v0.2.0 Designer feature/workflow roadmap is complete**. The remaining step is the **v0.2.0 release review**, focused on full regression, persistence/reload, Representative Test PDF and Live PDF comparison, multi-page/viewport behavior, import/export, documentation reconciliation, and release readiness. New Designer feature expansion should be deferred unless the release review exposes a blocking defect.

## v0.2.0 release-candidate review closure items (Oct 3, 2026)

The full manual v0.2.0 release-acceptance pass confirmed the completed Designer feature/workflow set. Release-candidate corrections are limited to: explicit Favorite Layout semantics/UI; removal of the invalid Pitcher role from lineup-derived Defensive Alignment; cleanup of abandoned brand-new repeated/record objects when initial placement is cancelled with Escape; and suppression of an iPad/WebKit child-dialog ghost outline. These are release corrections, not a new Designer feature build.

### Deferred Touch-Friendly Designer investigation

- Provide a touch-accessible multi-select mode (and evaluate touch lasso) so iPad users can access multi-formatting, align/distribute, multi-delete, and multi-item copy/paste.
- Evaluate pinch-to-zoom for the PDF workspace.
- Improve gesture arbitration so an intended swipe/pan beginning on a placed object does not unexpectedly drag that object.
- Preserve the existing toolbar zoom, touch scrolling, and Undo recovery behavior while investigating these changes.

These touch items are post-v0.2.0 roadmap work and do not block the current Designer release.
