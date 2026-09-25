# Build 026.3 — Final Build 026 Palette & Settings Polish

Build 026.3 is the final polish/fix pass planned for Build 026 after the 026.2 acceptance pass. It keeps the underlying field registry and saved layout model intact while refining Custom Field Selector navigation, Designer palette behavior, and validation presentation.

## Scope

### 1. Sticky Custom Field Selector header and close action
- The Custom Field Selector header remains visible while its field cards scroll.
- The sticky area contains the Layout Settings label, Select Custom Fields title/help, live selected count, search box, and a standard **X** close button.
- Clicking **X** with no pending selection changes returns directly to the main Layout Settings screen.
- Clicking **X** after modifying field selections opens a confirmation dialog warning that unsaved changes will be discarded.
- **Cancel** returns to the selector without losing changes; **Discard Changes** restores the last saved selector state and returns to Layout Settings.
- The existing bottom **Cancel** and **Save** actions remain available.

### 2. Starting Pitcher palette collapse fix
- A placed Starting Pitcher object's instance/detail rows now live inside the Starting Pitcher collapsible container.
- Collapsing Starting Pitcher hides both its available record fields and its placed-instance rows, matching Lineup, Bench, and Bullpen behavior.

### 3. Dark-theme PDF validation dialog
- The wrong-page-count replacement-PDF warning keeps the Build 026.2 validation behavior but now uses the Scorecard Studio dark-theme modal styling.

### 4. Text Template removed from finite Available Data counts
- Text Template remains available as an unlimited Designer tool.
- Text Template no longer adds `1` to the main **Available Data** count.
- The Text Template category/item no longer displays a misleading `1 available` / `Available` status when no instance exists.
- Existing Text Template instance counts remain meaningful when templates have actually been placed.

### 5. Conditional bottom Collapse All
- The bottom **Collapse All** control is hidden while the top **Collapse All** control is visible in the palette viewport.
- It appears after the top control has scrolled out of view, preserving access without duplicating the control unnecessarily.

### 6. Search-aware card bulk selection
- Custom Field Selector card counts continue to report the complete card state (`X of Y selected`).
- With no search active, **Select All / Deselect All** operate on the complete card.
- With a search active, those controls operate only on the fields currently exposed by the search within that card.
- Hidden/non-matching fields retain their prior selection state.

## Deliberate behavior retained

A Text Template token that is already present continues to resolve even if its field is later removed from the layout palette. A user who manually types a valid token may also use it. The palette is a discovery/clutter-management tool, not a restriction/security boundary.

## Acceptance checklist

1. Open Layout Settings → Select Custom Fields and scroll down. Confirm the header/search area remains visible.
2. Open the selector and click **X** without making changes. Confirm it returns immediately to Layout Settings.
3. Reopen, change at least one field, click **X**, and confirm the discard warning appears. Verify **Cancel** preserves the pending change and **Discard Changes** restores the prior saved selection.
4. Place a Starting Pitcher record/object, collapse its Starting Pitcher palette item, and confirm all placed instance/detail rows are hidden until expanded again.
5. Attempt to replace a layout PDF with a different-page-count PDF and confirm the warning uses the application dark theme.
6. Configure a layout with zero enabled data fields. Confirm **Available Data** displays `0`, while Text Template remains available without `1 available` being shown.
7. Scroll the Designer palette. Confirm the bottom **Collapse All** is hidden while the top control is visible and appears once the top control scrolls out of view.
8. In Custom Fields, search for a term such as `Name` that exposes only a subset of a larger card. Click **Select All** or **Deselect All** and confirm only the matching visible rows change while the card's `X of Y selected` count still reflects the complete card.

## Changed files

- `index.html`
- `css/styles.css`
- `js/app.js`
- `app-meta.json`
- `docs/AI.md`
- `docs/Build_026.3_Implementation.md`
- `tests/build0263.test.mjs`
