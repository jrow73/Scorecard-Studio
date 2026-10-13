# Build 022.2 Implementation

## Purpose

Build 022.2 is a narrow acceptance-test correction for repeated layouts that contain only one selectable child definition.

Build 022.1 correctly recognized complete repeated layouts during multi-selection, but structural promotion was only activated when more than one selectable object was selected. A one-child repeated layout could therefore be copied as a complete repeated layout, yet a full lasso of that same layout still behaved like a single child for movement and deletion.

## Change

Structural selection is now independent of the number of selected child objects.

When a lasso fully encloses all rendered instances of a repeated layout, the Designer records that repeated layout as complete. Structural operations then promote the selection to the repeated-layout parent even when there is only one selectable child definition.

This applies to:

- keyboard-arrow movement;
- dragging the selected repeated layout;
- Delete/Backspace deletion.

Formatting remains child-level. A user can still select the repeated child and change its font, color, style, or other applicable formatting without exposing or formatting the parent anchor.

Partial lasso selections do not promote to the parent. If only part of a repeated layout is selected, existing child-level behavior is preserved.

## Acceptance checks

1. Create or use a repeated layout with one child definition, such as a bullpen containing one Text Template column.
2. Lasso the entire repeated layout so every rendered row is enclosed.
3. Press Up/Down/Left/Right and verify the complete repeated layout moves, including its parent geometry.
4. Drag the selected repeated layout and verify the complete object moves together.
5. Press Delete and verify the entire repeated layout, including its parent anchors, is removed.
6. Undo and verify the entire repeated layout is restored.
7. Lasso only part of the repeated layout and verify it does not promote to the complete parent.
8. Verify formatting changes still apply to the selected child content as before.

## Out of scope

No copy/paste, ghost-placement, translation, formatting, or clipboard behavior was changed in Build 022.2.
