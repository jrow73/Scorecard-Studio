# Build 021 — Multi-Select

## Purpose

Build 021 adds temporary multi-selection to the Layout Designer so related placed items can be formatted, aligned, moved, nudged, reset, or deleted as one working selection. It does **not** create a permanent group in the saved layout.

Build 020.1 is the accepted baseline. Build 022 will address Duplicate Selection and Away ↔ Home duplication separately.

## Selection behavior

- Normal click continues to select one placed item.
- **Ctrl+Click** (Windows/Linux) or **Cmd+Click** (macOS) toggles a placed item into or out of the current multi-selection.
- Dragging on empty PDF space draws a selection rectangle. Items fully enclosed by the rectangle are selected.
- The same logical repeated-layout column is selected only once even though it renders in multiple repeated rows/slots.
- Clicking empty PDF space or pressing Escape clears the selection.
- Multi-selection is page-local. Changing PDF pages clears an active multi-selection.
- Repeated-layout parent guides remain single-selection objects. Multi-select operates on placed field/content items (`mapping`, `individual`, and repeated-column content) to avoid selecting a parent block and its children at the same time.

## Multi-Selection Inspector

When two or more items are selected, the normal item-specific Inspector is replaced with a compact multi-selection workspace.

It shows:

- selected item count;
- common Font Face;
- common Font Size;
- common Bold state;
- common Italic state;
- common Text Color;
- Restore Defaults;
- Align Left / Center / Right;
- Align Top / Middle / Bottom;
- Delete Selected.

A formatting value is shown only when every selected item has the same effective value. Mixed values are displayed as blank/`Mixed`. Changing a property applies only that property to every selected item; other formatting properties remain unchanged.

Restore Defaults clears explicit formatting overrides for every selected item. Each item then resolves its own applicable Layout Setting, including Away/Home and enabled conditional hitter/pitcher formatting.

Vertical alignment controls are disabled when the selection contains an item that cannot independently move vertically (for example, a repeated-layout column whose vertical position belongs to its parent layout).

## Group movement

- Drag any selected item to move the complete selection while preserving relative spacing.
- Arrow keys nudge the complete selection.
- Shift+Arrow retains the larger nudge behavior.
- Build 020 history coalescing applies to the group, so a drag or burst of rapid nudges is restored as one history change after the normal quiet period.

## Alignment

Alignment commands use the visible placement boxes on the current PDF page:

- Left / Center / Right align visual horizontal edges or centers.
- Top / Middle / Bottom align visual vertical edges or centers.

The objects remain independent after alignment; no persistent group is created.

## Delete

Delete Selected removes all selected placed items in one operation. Undo restores the saved layout state using the Build 020 history system.

## Explicitly deferred

The following are not part of Build 021:

- permanent grouping/ungrouping;
- distribute/equal-spacing commands;
- group resizing or rotation;
- Duplicate Selection;
- Away → Home duplication;
- Home → Away duplication;
- cross-page multi-selection.

## Acceptance checklist

1. Ctrl/Cmd-click can add and remove individual placed items from a selection.
2. Lasso selection selects only fully enclosed placed items and does not duplicate logical repeated-column selections.
3. Normal single selection still opens the existing full Inspector.
4. Two or more selected items show the compact multi-selection Inspector.
5. Identical formatting values display normally; differing values show Mixed/blank.
6. Changing one formatting property changes only that property across the selection.
7. Restore Defaults returns each selected item to its own applicable defaults.
8. Arrow keys move the entire selection while retaining relative spacing.
9. Shift+Arrow performs the existing larger nudge for the complete selection.
10. Dragging any selected item moves the complete selection.
11. Align Left/Center/Right operates on the visible placement boxes.
12. Align Top/Middle/Bottom operates when every selected item can move vertically.
13. Delete Selected removes all selected items and Undo restores them as one saved state.
14. Escape or clicking empty PDF space clears the multi-selection.
15. Changing PDF pages clears an active multi-selection.
16. Existing Undo/Redo, formatting, repeated-layout, Text Template, and individual-placement behavior remains intact.
