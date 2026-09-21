# Build 020 Implementation — Designer Undo / Redo

Build 020 adds session-only Undo/Redo to the Layout Designer.

## History model

- Keeps up to 30 committed Designer layout snapshots in memory.
- History is reset when the Designer is opened and is not persisted across reloads/sessions.
- Undo restores the previous committed layout snapshot; Redo restores the next snapshot.
- A new edit after Undo clears the Redo branch.
- Designer autosave remains active. Repeated live edits use a 450 ms quiet period before committing, which naturally coalesces rapid arrow nudges, number-spinner changes, and drag movement into a single history state.
- Undo explicitly captures any still-pending live state before restoring the prior snapshot, so a fast Undo immediately after an edit still works.

## Controls

- Added `↶ Undo` and `↷ Redo` buttons to the Designer header.
- Buttons disable automatically when no corresponding history state is available.
- Keyboard shortcuts:
  - Ctrl/Cmd+Z — Undo
  - Ctrl+Y — Redo
  - Ctrl/Cmd+Shift+Z — Redo
- Native editing behavior is preserved while an INPUT, TEXTAREA, or SELECT is actively being edited.

## Focus behavior

Discrete Inspector SELECT changes (including Alignment and Font Face) now relinquish focus after the selection is committed. This lets the next keyboard-arrow press return to moving the selected scorecard object instead of cycling the previously used dropdown.

## Scope

Undo/Redo applies to Designer layout edits saved through the existing layout persistence path, including placement, movement, deletion, repeated-layout edits, individual mappings, templates, formatting, and layout formatting settings.

README.md is intentionally unchanged.
