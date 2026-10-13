# Build 026.1 — Layout Settings & Palette Acceptance Fixes

Build 026.1 is an acceptance-fix package against the Build 026 candidate. It keeps the Build 026 field-palette architecture while correcting the Settings and Designer workflows identified during acceptance review.

## Scope

1. **Custom Field Selector workflow**
   - Removed the embedded selector from the main Layout Settings screen.
   - The Field Palette card now reports `Standard Fields` or `Custom Fields · N selected` and opens a dedicated selector view.
   - `Select Custom Fields` temporarily replaces the main Settings content. `Save` returns with the draft selection; `Cancel` discards selector changes.
   - A selection identical to the Standard set is stored as Standard; any differing selection is Custom.

2. **Layout Details card**
   - Added editable Layout Name and Description to the top Settings card.
   - Added `Replace PDF` for swapping corrected artwork without rebuilding mappings.
   - Replacement PDFs must match the existing page count. Existing mappings, repeated layouts, individual mappings, formatting, and coordinates are preserved.

3. **Designer palette header cleanup**
   - Removed the instructional helper paragraph above the palette search/filter controls.

4. **Palette collapsing**
   - Added `Collapse All` controls above and below the palette data list.
   - Placed palette items with instance/detail content can be collapsed independently of their parent category.

5. **Manager categorization**
   - Manager is again grouped under Away/Home Team Information rather than Players.
   - Manager fields and manager context use Team formatting defaults.

6. **Repeated-layout placement state**
   - `Change Placement` is hidden until an initial geometry/placement exists.
   - New repeated layouts present only the initial placement action until placement is complete.

7. **Player Name Format alignment**
   - Supported choices: Full Name; First Initial + Last Name; Last Name; First Name; Use Name; Boxscore Name.
   - Removed `Use Name + Last Name` as a current option while retaining canonical handling of legacy saved labels.
   - `Use Name` renders the API-style `useName` value only.
   - First Initial + Last Name renders without a period (`R Yu`, not `R. Yu`).
   - Representative data includes differing `firstName`/`useName` values so the distinction is visible during testing.

8. **Default Formatting Options card**
   - Formatting controls are collapsed by default whenever Layout Settings opens.
   - `Open Formatting Options` expands the existing formatting controls; the button changes to `Close Formatting Options` while expanded.

## Acceptance checks

- Open Layout Settings and confirm the initial view contains Layout Details, Field Palette, and collapsed Default Formatting Options cards.
- Edit name/description, save, reopen, and confirm persistence.
- Select a replacement PDF with the same page count and confirm the artwork changes while placements remain intact. Confirm a mismatched page-count PDF is rejected.
- Open Select Custom Fields and confirm it replaces the Settings contents rather than appearing as a nested scroll area. Verify Save and Cancel behavior.
- Confirm the Designer palette no longer shows the helper paragraph and has Collapse All controls at top and bottom.
- Place a repeated object and confirm its palette detail can be independently collapsed.
- Confirm Manager appears under Team Information and inherits Team formatting.
- Start a new repeated layout and confirm Change Placement is absent until initial placement exists.
- Cycle all six Player Name Format options and confirm `R Yu`-style initials and first-name-only Use Name behavior.
- Open Layout Settings and confirm formatting is collapsed by default; expand and close it successfully.

## Automated contract

`tests/build0261.test.mjs` covers the principal source-level acceptance contract for the eight fixes.
