# Build 026 — Field Palette & Layout Settings

**Baseline:** Build 025 Final / 025.3  
**Status:** Implementation candidate — browser acceptance pending  
**Purpose:** Complete the planned Field Palette and Layout Settings redesign before long-text fit work begins in Build 027.

## Scope

Build 026 changes only Designer field availability/presentation and Layout Settings. Existing mapping identity, placement geometry, PDF rendering, Test PDF/live PDF behavior, and multi-instance semantics remain unchanged.

### 1. Standard vs Custom Field Palette

New layouts now choose one of two palette modes:

- **Standard Fields** — exposes fields whose registry metadata is `visibilityTier: standard`.
- **Custom Fields** — begins with the Standard set selected and lets the user add or remove any active v1 catalog field.

The mode is saved per layout as `paletteMode`. Custom selections are saved as canonical field IDs in `enabledFieldIds`.

Existing pre-Build-026 layouts are treated as **legacy full-palette layouts** until the user opens Layout Settings and saves an explicit Standard or Custom mode. This avoids silently hiding fields from an established design.

Fields already used by a layout remain visible/editable even if the user later removes that field from the active Custom palette. Removing a field from Custom availability never deletes an existing mapping.

### 2. Custom field picker

Custom mode provides a searchable field picker that:

- groups fields by registry category;
- shows the field label;
- shows the deterministic representative `exampleValue` where available;
- searches labels, categories, descriptions, and example values; and
- uses canonical registry field IDs for persistence.

The same Custom selection can be made while creating a new layout or later from Layout Settings.

### 3. Layout Settings redesign

Layout Settings now uses the application's dark theme rather than a light modal surface.

The dialog is organized into:

1. **Field Palette** — Standard/Custom mode plus Custom field picker.
2. **Formatting Defaults** — the accepted Build 019 formatting defaults.
3. **Conditional Formatting** — the existing hitter/pitcher handedness controls, presented as clearer opt-in cards.

`Reset Formatting` resets formatting/conditional values only; it does not alter the selected Field Palette mode or Custom field selection.

### 4. Palette cleanup and consolidation

Build 026 reduces duplicate/legacy palette presentation without removing canonical fields from the registry:

- Starting Pitcher is presented as the existing expandable record item instead of also exposing duplicate top-level Starting Pitcher scalar entries.
- Umpires are presented through the normalized **Umpire Crew** collection. The older fixed Home/First/Second/Third Base scalar umpire fields remain supported for existing saved mappings, but are no longer offered as new palette choices.
- Manager fields are grouped with the corresponding Away/Home Players area rather than Team Information.

### 5. Palette category behavior

The top-level Field Palette categories now behave as an accordion during normal browsing:

- opening one category collapses the previously open category;
- search and **Used only** can still force matching categories open; and
- selecting an object does not introduce a separate palette-level **New Instance** action.

### 6. Multiple instances remain unchanged

Build 026 does **not** remove the ability to create multiple instances of any supported item.

The accepted interaction remains:

- select an existing placed object; then
- use the object's existing **New Instance** action in the object/header workflow.

There is intentionally no redundant **New Instance** button/link added to Field Palette rows.

## Persistence / compatibility

New optional layout properties:

```json
{
  "paletteMode": "standard | custom",
  "enabledFieldIds": ["canonical.field.id"]
}
```

Compatibility rules:

- old layouts with neither property retain broad legacy palette access;
- existing mappings are never deleted when palette availability changes;
- canonical field IDs and generated-PDF rendering behavior are unchanged;
- `designerPaletteGroups` / `designerPaletteConfigured` remain tolerated for backward compatibility but are not used as the Build 026 field-selection contract.

## Acceptance checklist

### A. New layout — Standard Fields

- [ ] Create a new layout with **Standard Fields** selected.
- [ ] Open Designer and confirm only Standard registry fields are offered for new placement.
- [ ] Confirm Starting Pitcher appears once as the expandable Starting Pitcher item rather than multiple duplicate top-level Starting Pitcher entries.
- [ ] Confirm Umpire Crew appears as the umpire collection and fixed Home/1B/2B/3B umpire scalar choices are not offered for new placement.
- [ ] Confirm Manager appears under the corresponding Away/Home Players category.

### B. New layout — Custom Fields

- [ ] Choose **Custom Fields** during layout creation.
- [ ] Confirm the picker starts with the Standard set selected.
- [ ] Search by field name, category, and representative example value.
- [ ] Add at least one Custom-tier field and remove at least one Standard-tier field.
- [ ] Create the layout and confirm Designer availability matches the saved selection.

### C. Existing layout compatibility

- [ ] Open a Build 025-or-earlier layout and confirm its existing mappings still render and remain editable.
- [ ] Confirm its palette initially retains broad legacy availability rather than silently switching to Standard-only.
- [ ] Open Layout Settings, choose Standard or Custom, save, reload, and confirm the choice persists.
- [ ] Remove a field from Custom availability that is already placed and confirm the placed object remains visible/editable and still generates.

### D. Layout Settings

- [ ] Open Layout Settings from the Layouts page and from Designer.
- [ ] Confirm the dialog uses the app dark theme.
- [ ] Confirm Standard/Custom cards and the Custom picker are usable.
- [ ] Confirm hitter and pitcher conditional-format controls retain their previous on/off behavior and formatting values.
- [ ] Confirm **Reset Formatting** does not reset the field palette selection.

### E. Palette behavior / multiple instances

- [ ] Expand Game Information, then Away Players, and confirm the prior category collapses.
- [ ] Search for a field and confirm matching categories can display regardless of accordion state.
- [ ] Use **Used only** and confirm placed/referenced items remain discoverable.
- [ ] Create one instance of an item, select it, and use the existing object/header **New Instance** action to create a second instance.
- [ ] Confirm no redundant New Instance button/link appears in the Field Palette itself.

### F. Regression

- [ ] Existing Single Item, Text Template, Repeated Layout, Record Layout, and Individual Placement flows still work.
- [ ] Name Format behavior remains unchanged.
- [ ] Undo/Redo and Copy/Paste remain unchanged.
- [ ] Designer Generate Test PDF remains based on Representative Data.
- [ ] Home Generate Live PDF remains based on live normalized data.
- [ ] Build 025.3 cross-page clipboard behavior remains intact.

## Changed files

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `docs/Build_026_Implementation.md`
- `docs/AI.md`
- `docs/DESIGNER_COMPLETION_INVENTORY.md`
- `tests/build026.test.mjs`

`README.md` remains intentionally unchanged.
