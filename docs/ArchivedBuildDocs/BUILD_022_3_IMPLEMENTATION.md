# Build 022.3 Implementation

## Purpose

Correct the remaining Build 022 structural-selection edge case for a Repeated Layout or Record that contains only one child definition.

## Problem

A full lasso around a one-child repeated structure could identify the child, but the Designer still behaved like an ordinary single-object selection. In particular, beginning a drag re-selected the child and cleared the complete-parent state before structural movement could run.

## Changes

- Lasso completion now commits the complete repeated-block IDs atomically with the selected child set, before the overlay/Inspector are rendered.
- A complete repeated structure is considered a structural/group selection even when the normalized child selection contains only one item.
- Beginning a drag no longer collapses an already-selected one-child structural selection back to a normal single selection.
- Complete structural selections use the multi-selection halo, making the parent-aware state visible even when only one child definition exists.
- Existing parent-aware arrow nudge, drag, delete, copy/paste, and Undo/Redo paths continue to use the structural selection helper.
- Partial child selections remain ordinary child-level selections; formatting remains child-level.

## Targeted acceptance check

1. Create or use a Repeated Layout with one child definition (for example, a one-template bullpen).
2. Lasso the entire repeated structure.
3. Confirm the selected content receives the multi-selection halo.
4. Arrow-nudge vertically and horizontally; the complete repeated structure should move.
5. Drag the selected content; the complete repeated structure should move.
6. Delete it; the parent and children should be removed together.
7. Undo; the complete structure should return.
8. Repeat with a one-child Record block.
9. Verify a partial lasso still edits only the selected child content.

## Metadata

`app-meta.json` is updated to Build 022.3. `README.md` is unchanged.
