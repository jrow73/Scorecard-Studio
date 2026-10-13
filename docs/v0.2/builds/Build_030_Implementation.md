# Build 030 — Layout Settings Workflow

## Status
Implementation package for acceptance testing.

## Goal
Make Layout Settings a consistent parent/child workflow without changing the underlying settings model or expanding Designer scope.

## Architecture

### Parent — Layout Settings
The parent Layout Settings modal is now an overview/navigation surface only. It contains three read-only summary cards:

1. **Layout Details** — name, description, and scorecard PDF summary.
2. **Field Palette** — Standard/Custom state and selected-field count.
3. **Default Formatting Options** — representative default formatting and conditional-formatting state.

Each card has an **Open** button. The parent has one **Close** action and no Save/Cancel transaction of its own.

### Child editors
Each settings area opens in its own modal above the parent. The child editor is the transaction boundary:

- **Save** commits that child immediately and returns to the parent.
- **Cancel** or the **×** close control discards unsaved child changes and returns to the parent.
- Pressing Escape follows the same Cancel/discard behavior.
- After Save, the corresponding parent summary refreshes immediately.

Each child uses the same modal structure: fixed header, scrolling body, and fixed footer.

## Functional changes

### Layout Details child
- Edits Layout Name and Description.
- Supports replacement PDF selection using the existing same-page-count validation.
- Replacement PDF is not committed until **Save**.
- Cancel/× discards the selected replacement and text edits.

### Field Palette child
- Preserves the existing Standard/Custom field picker and Restore Standard Fields behavior.
- **Save** immediately persists `paletteMode` / `enabledFieldIds`.
- Cancel/× discards unsaved selection changes.
- Existing unsaved-change confirmation remains in place when attempting to close a dirty picker.

### Default Formatting Options child
- Preserves the existing formatting groups, color controls, and hitter/pitcher conditional formatting.
- **Save** immediately persists formatting defaults and conditional-formatting settings.
- **Reset Formatting** resets the child draft only; the reset is not persisted until Save.
- Cancel/× discards unsaved formatting edits.

## Out of scope
- No Text Template workflow changes (Build 031).
- No homepage changes.
- No changes to layout storage schema.
- No changes to field definitions, representative data, or live pregame data.
- `README.md` is unchanged.

## Acceptance checklist

### A. Parent workflow
- [ ] Open Layout Settings from the Designer toolbar.
- [ ] Parent shows three read-only cards: Layout Details, Field Palette, Default Formatting Options.
- [ ] Each card has an Open button.
- [ ] Parent has Close only; there is no parent Save or Cancel.

### B. Layout Details
- [ ] Open Layout Details; parent remains visually underneath.
- [ ] Change name/description, choose Cancel, reopen: original values remain.
- [ ] Change name/description, choose Save: parent summary updates immediately and values survive reopening/reload.
- [ ] Select a valid replacement PDF, Cancel: PDF is not replaced.
- [ ] Select a valid replacement PDF, Save: PDF is replaced and existing placements remain.
- [ ] Select a PDF with the wrong page count: existing validation/error behavior remains.

### C. Field Palette
- [ ] Open Field Palette; current selections match the saved layout.
- [ ] Change selections, Cancel/×: changes are discarded.
- [ ] Attempt to close with unsaved changes: discard confirmation appears.
- [ ] Change selections, Save: parent summary updates and Designer palette reflects the saved selection immediately.
- [ ] Restore Standard Fields behaves as a draft action until Save.

### D. Default Formatting Options
- [ ] Open formatting; current defaults and conditional settings are loaded.
- [ ] Change formatting, Cancel/×: changes are discarded.
- [ ] Change formatting, Save: parent summary updates and newly placed items use the new defaults.
- [ ] Reset Formatting then Cancel: prior saved defaults remain.
- [ ] Reset Formatting then Save: application defaults become the saved layout defaults.

### E. Modal behavior
- [ ] Child header and footer remain visible while long child content scrolls.
- [ ] Escape behaves like Cancel for each child.
- [ ] Saving one child does not require any additional parent-level Save.
- [ ] Closing the parent does not undo previously saved child changes.

### F. Regression
- [ ] Existing saved layouts open normally.
- [ ] Designer placement/formatting outside Layout Settings is unchanged.
- [ ] Representative Test PDF and Live PDF generation still work.
- [ ] No changes to `README.md`.
