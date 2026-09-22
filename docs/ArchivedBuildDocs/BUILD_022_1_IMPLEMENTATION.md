# Build 022.1 — Copy/Paste Acceptance Fixes

## Goal
Correct the three UX issues found during Build 022 acceptance testing without expanding the Copy/Paste feature scope.

## Changes

### 1. Single-use copied state
- Copy remains temporary Designer state rather than a persistent clipboard workflow.
- A successful paste clears the copied state and removes Paste / Away→Home / Home→Away controls.
- Escape/cancel clears the copied state.
- Moving on to a different selection or ordinary placement action also clears stale copied state.

### 2. Parent-aware repeated-layout structural actions
Lasso selection still selects the visible child content so group formatting continues to work exactly as in Build 021.

When a lasso fully encloses every rendered child instance of a repeated/record layout, the Designer also records that the complete parent layout is represented by the selection. Structural actions then promote that complete layout to its parent:
- arrow-key movement moves the repeated-layout anchor;
- group drag moves the repeated-layout anchor;
- Delete removes the complete repeated layout, including its anchors and child definitions.

Partial selections remain child-level. Selecting one lineup row or only some fields does not promote movement/delete to the parent.

### 3. Ghost preview reference-point fidelity
- Copy captures each copied unit's rendered visual bounds relative to its logical PDF anchor.
- Ghost placement and final placement now use the same logical group reference point and per-object offsets.
- The ghost renders one translucent outline per copied unit rather than a generic fixed-size rectangle.
- Repeated-layout ghosts use the rendered footprint of the complete repeated block, making large lineups/record layouts recognizable during placement.

## Acceptance checks
1. Copy → Paste → click PDF once; Paste controls disappear after commit.
2. Copy → Paste → Escape; Paste controls disappear and nothing is added.
3. Copy something, then move on to another ordinary Designer selection/action; stale Paste controls disappear.
4. Lasso one complete lineup row: formatting and child-level horizontal adjustments remain available; the parent is not promoted.
5. Lasso the complete repeated lineup and nudge it: the whole repeated layout moves together, including its anchors.
6. Drag a complete repeated-layout selection: the whole repeated layout moves as one structural unit.
7. Delete a complete repeated-layout selection: the entire repeated layout is removed; one Undo restores it.
8. Partial repeated-layout deletion still removes only the selected child definitions.
9. Single-object paste ghost shows the object's visual box in the same cursor-relative position where it will finally render.
10. Arbitrary multi-item ghost preserves the copied items' relative visual positions.
11. Repeated-layout ghost reflects the full repeated-layout footprint rather than a tiny generic box.
12. README.md remains unchanged.
