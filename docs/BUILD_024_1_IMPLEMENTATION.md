# Scorecard Studio — Build 024.1 Implementation

**Baseline:** v0.2.0 Build 024  
**Purpose:** Resolve first-round Build 024 acceptance findings without expanding Build 024 scope.

## Acceptance fixes

- Reintroduce compact explicit PDF zoom controls through a toolbar magnifier popover. The toolbar icon reflects neutral / zoomed-in / zoomed-out state; the popover provides minus, current zoom, plus, and Reset while preserving Ctrl/Cmd+wheel behavior.
- Make disabled Paste behave like the other disabled toolbar actions while retaining its tooltip. If ordinary Paste is the only valid action, clicking Paste starts ghost placement directly; the popup appears only when an Away→Home or Home→Away choice is actually available. Ineligible translation actions remain hidden.
- Correct repeated-layout Text Template progressive reveal: Alignment is chosen before the template editor is shown, token-only templates are valid without free-typed text, and Player Name format appears only when Player Name is selected.
- Simplify repeated Text Template insertion controls by relying on descriptive select placeholders (`Choose text field to insert…`, `Choose name format…`) and reset those pickers after each token insertion.
- Scope the Individual Placement mapping list to the collection currently being edited.
- Preserve parent editing context after removing a child item. Repeated-layout child deletion returns to that parent's Place New Item workflow; Individual Placement child deletion returns to the corresponding collection workflow.
- Align representative player-name fields with the live API/normalized data contract. Compound surnames such as `Van Buren`, `St. James`, and `De la Cruz` are explicitly represented as `lastName` / `useLastName` / `boxscoreName`; suffixes such as `III` remain separate from the surname. Production formatting continues to prefer explicit API fields rather than parsing full names.

## Deferred

- Home-page live-game Generate PDF remains on the Build 025 working list.
- Field Palette / Layout Settings redesign and Umpire Crew consolidation remain Build 025.

## Targeted acceptance

1. At 100%, the toolbar shows the neutral zoom icon. Open it and verify `− 100% + Reset`; zoom in/out and confirm icon state and Reset behavior.
2. With no clipboard, Paste is visibly disabled and still shows its tooltip. Copy a neutral/mixed selection and confirm Paste immediately starts ordinary ghost placement. Copy a Home-only or Away-only selection and confirm the popup contains only ordinary Paste plus the one valid translation.
3. Add repeated-layout Text Template content using inserted tokens only. Confirm Alignment appears before the editor, no keyboard literal is required, Player Name alone reveals Name Format, and insertion pickers reset after Insert Field.
4. Open Individual Placement for Umpire Crew (or another collection) and confirm its Existing/Individual mappings list shows only that collection.
5. Select a repeated child and Remove Item or press Delete. Confirm the child is removed and the parent remains in Place New Item mode.
6. Exercise representative compound/suffix names across Full, First Initial + Last, Last, Use Name + Last, and Boxscore formats.

`README.md` remains intentionally unchanged.
