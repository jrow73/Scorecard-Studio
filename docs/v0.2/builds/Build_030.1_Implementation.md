# Build 030.1 — Layout Settings Workflow Polish

## Purpose

Build 030.1 is the acceptance-fix round for the Build 030 parent/child Layout Settings workflow. It does not change the underlying settings data model. The goal is consistent transactional behavior and button placement across all three child editors.

## Changes

### Child footer layout

All child editors now use a common footer pattern:

- Restore action, when applicable, at bottom-left.
- Cancel and Save adjacent at bottom-right.
- Layout Details has no restore action, so only Cancel and Save appear at bottom-right.

Restore labels are standardized as:

- Custom Fields: **Restore Standard Fields**
- Default Formatting: **Restore App Defaults**

### Unsaved-change protection

Layout Details, Custom Fields, and Default Formatting all use the same dirty-state close behavior.

When a child has unsaved changes, each of these close paths prompts before discarding:

- X button
- Cancel button
- Esc key

If the child has no unsaved changes, those actions close immediately without a prompt.

### State-aware buttons

Save is disabled until a child differs from its saved state.

Restore buttons are disabled when the child already matches the relevant baseline:

- Custom Fields: standard field selection
- Default Formatting: application formatting defaults

Restoring a custom saved configuration to its baseline counts as a change and enables Save.

### Default Formatting parent summary

The parent Layout Settings card no longer attempts to summarize individual font/color/conditional settings. It displays only one of:

- **Currently using app defaults**
- **Currently using custom formatting**

## Manual Acceptance Checklist

### Layout Details

- [ ] Open child with no edits: Save is disabled.
- [ ] Change name or description: Save becomes enabled.
- [ ] Revert the edit to the saved value: Save becomes disabled again.
- [ ] Select a valid replacement PDF: Save becomes enabled.
- [ ] With unsaved changes, X prompts before discard.
- [ ] With unsaved changes, Cancel prompts before discard.
- [ ] With unsaved changes, Esc prompts before discard.
- [ ] With no unsaved changes, X/Cancel/Esc close without prompting.
- [ ] Save commits immediately and refreshes the parent summary.

### Custom Fields

- [ ] Cancel and Save are adjacent at bottom-right.
- [ ] Restore Standard Fields is at bottom-left.
- [ ] Save is disabled until the field selection changes.
- [ ] Restore Standard Fields is disabled when the draft already equals the standard selection.
- [ ] Restore Standard Fields becomes enabled when the draft differs from standard.
- [ ] Restoring a custom saved selection to standard enables Save.
- [ ] X, Cancel, and Esc all prompt when unsaved changes exist.
- [ ] Save commits immediately and refreshes the parent summary.

### Default Formatting

- [ ] Cancel and Save are adjacent at bottom-right.
- [ ] Restore App Defaults is at bottom-left.
- [ ] Save is disabled until formatting changes.
- [ ] Restore App Defaults is disabled when the editor already matches application defaults.
- [ ] Restore App Defaults becomes enabled when the editor differs from application defaults.
- [ ] Restoring custom saved formatting to application defaults enables Save.
- [ ] X, Cancel, and Esc all prompt when unsaved changes exist.
- [ ] Save commits immediately and refreshes the parent summary.

### Parent summary

- [ ] A layout matching application formatting defaults reads **Currently using app defaults**.
- [ ] A layout with any custom default-formatting setting reads **Currently using custom formatting**.
- [ ] Parent Layout Settings still has Close only and does not become a second transaction boundary.

## Scope Notes

Build 030.1 remains limited to Layout Settings workflow polish. No homepage work, Text Template workflow work, or unrelated Designer features are included.
