# Build 026.4 — Final Field Palette Cleanup

Build 026.4 is a focused two-item follow-up to the Build 026.3 acceptance review. It preserves the accepted Build 026.3 behavior while removing one obsolete Starting Pitcher usage path and adding an explicit way to restore the current Standard field set in the Custom Field Selector.

## Scope

### 1. Remove `Single Item` from Starting Pitcher Record creation
- Starting Pitcher remains a record-style palette item.
- Creating a new Starting Pitcher object no longer offers **Single Item**.
- The supported new-object choices are **Text Template** and **Record Layout**.
- Existing legacy single-field Starting Pitcher mappings remain readable/editable; this change only removes the obsolete creation choice.

### 2. Restore Standard Fields in the Custom Field Selector
- The sticky Custom Field Selector header includes a **Restore Standard Fields** button.
- The action replaces the current unsaved draft selection with the field registry's current Standard set returned by `standardDesignerFieldIds()`.
- No field IDs are hard-coded into the restore action. Future changes to which fields are Standard are picked up automatically.
- The restore action does **not** save immediately. The user may still Save, Cancel, or close with the X.
- If the restored draft differs from the saved palette, the existing unsaved-changes warning applies when closing with X.
- The active search remains in place; cards/counts refresh to show the restored Standard selections within that search.

## Acceptance checklist

1. Open the Designer and start a new Away or Home Starting Pitcher object. Confirm the usage choices show **Text Template** and **Record Layout**, with no **Single Item** option.
2. Confirm an existing Starting Pitcher single-field mapping from an older layout can still be selected/rendered if present.
3. Open Layout Settings → Select Custom Fields and alter the field selection substantially, including testing a zero-field selection if desired.
4. Click **Restore Standard Fields** and confirm the selected count and card checkboxes immediately return to the current Standard configuration.
5. Click **Cancel** after restoring and confirm the previously saved palette remains unchanged.
6. Restore Standard Fields again, click **Save**, then save Layout Settings. Reopen the selector and confirm the Standard field set remains selected and the main Field Palette status reads **Standard Fields**.
7. Modify the picker, click **Restore Standard Fields**, then click the X before saving. If the restored draft differs from the saved palette, confirm the existing discard-unsaved-changes dialog appears.

## Changed files

- `index.html`
- `js/app.js`
- `app-meta.json`
- `docs/AI.md`
- `docs/Build_026.4_Implementation.md`
- `tests/build0264.test.mjs`
