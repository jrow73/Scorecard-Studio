# Build 015 Implementation — Designer Workspace Foundation

Status: implementation complete; browser acceptance pending.

## Purpose

Build 015 reorganizes the Layout Designer around the user's editing workflow without replacing the placement/rendering engine proven in Builds 010–014.

## Implemented

1. **Full-screen Designer mode**
   - Normal application sidebar and top bar are hidden while designing.
   - `Back to Layouts` exits Designer mode.
   - The Designer uses the browser window as a dedicated workspace.

2. **Three-panel workspace**
   - Left: scorecard data palette.
   - Center: PDF viewport with existing PDF-only zoom and page controls.
   - Right: selected-object inspector and placement tools.
   - Palette and inspector scroll independently; the PDF viewport remains on screen.

3. **Scorecard-specific data palette**
   - Categories can be enabled/disabled per layout.
   - New layouts start with the Choose Data panel open.
   - Existing layouts default to all categories for backward compatibility.
   - Choices filter the working scalar-field palette and composite Insert Field list.
   - Categories can be changed later; they are not permanent exclusions.
   - Palette items are divided into Unplaced and Placed lists.

4. **Live selected-object inspector**
   - Scalar/composite mappings, individual collection mappings, repeated-block columns, and repeated blocks can be selected from the PDF.
   - Inspector exposes only properties supported by the selected object.
   - X/Y uses PDF-point coordinates measured from the rendered page's top-left coordinate system used by the Designer.
   - Font/alignment/template changes redraw immediately and save automatically.

5. **Direct manipulation**
   - Scalar/composite and individual mappings can be dragged on the PDF.
   - Arrow keys nudge selected objects by 0.5 pt.
   - Shift+Arrow nudges by 5 pt.
   - Delete/Backspace deletes the selected object.
   - Escape deselects it.

6. **Progressive disclosure**
   - Existing placement controls are retained for compatibility but grouped into collapsible tool sections.
   - The new inspector handles fine-tuning after placement, eliminating the previous delete-and-replace workflow for ordinary adjustments.

## Compatibility

- Existing layout schema and PDF coordinate semantics are preserved.
- No migration is required for Build 014 layouts.
- Vertical/horizontal/grid repeated blocks, individual placement, composite/free text, PDF-only zoom, and PDF generation remain in the same stored models.
- `designerPaletteGroups` and `designerPaletteConfigured` are optional layout UX metadata and do not affect generated PDFs.

## Deferred

Undo/Redo is documented as a required Designer feature but is intentionally deferred until the interaction model has completed acceptance testing. Conditional color, synthetic full-capacity sample data, and generation-message cleanup also remain future UX work.
