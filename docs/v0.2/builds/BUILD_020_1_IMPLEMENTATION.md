# Build 020.1 Implementation — Designer Toolbar Cleanup

Build 020.1 is a small UI refinement after Build 020 Undo/Redo acceptance testing. It does not change Undo/Redo behavior or history semantics.

## Changes

- Moved **Undo**, **Redo**, and **Layout Settings** from the Designer card header into the PDF viewer toolbar.
- Reduced those controls to familiar icon-only buttons:
  - `↶` Undo
  - `↷` Redo
  - `⚙` Layout Settings
- Preserved clear enabled/disabled states for Undo/Redo.
- Added accessible labels and hover tooltips:
  - Undo — includes `Ctrl/Cmd+Z`
  - Redo — includes `Ctrl+Y` / `Ctrl/Cmd+Shift+Z`
  - Layout Settings
- Kept comfortable click/tap targets despite the compact visual presentation.
- Removed the now-unnecessary header-space usage from those three Designer actions.

## Acceptance checks

1. Open the Designer and confirm Undo, Redo, and Settings appear in the PDF toolbar near the Zoom controls.
2. Confirm the three controls are icon-only.
3. Hover each icon and confirm its tooltip appears.
4. Confirm Undo/Redo remain disabled when no history is available and become enabled when appropriate.
5. Confirm Undo/Redo keyboard shortcuts and history behavior remain unchanged from Build 020.
6. Confirm Layout Settings still opens the Formatting Defaults dialog.
7. Confirm Generate Test PDF and Back to Layouts remain in the Designer header.
8. Confirm the PDF workspace gains the expected vertical space from removing the three larger header buttons.

## Out of scope

No Undo/Redo history logic, formatting behavior, field behavior, PDF generation behavior, or README content was changed in this patch.
