# Build 015 Test Report — Designer Workspace Foundation

Status: static checks passed; browser acceptance required.

## Static validation completed

- `js/app.js` passes JavaScript syntax validation.
- HTML contains no duplicate IDs.
- Designer workspace contains one palette, one PDF stage, and one inspector/tool panel.
- Existing Build 014 PDF generation code paths remain present.

## Acceptance checklist

1. Open an existing Build 014 layout in the Designer.
   - Normal Scorecard Studio sidebar/top bar should disappear.
   - Back to Layouts should restore the normal application view.

2. Scroll a long Field Palette and then a long Inspector/Tools panel.
   - The PDF viewport should remain visible and stationary in the center workspace.
   - The left and right panels should scroll independently.

3. Existing-layout compatibility.
   - Existing scalar, composite, repeated, grid, and individual mappings should render where they did in Build 014.
   - Generate a PDF and compare placement to the accepted Build 014 result.

4. New-layout field selection.
   - Create a new layout and open the Designer.
   - The Choose Data panel should be visible.
   - Select only a few categories and confirm the working palette is reduced.
   - Re-open Choose Data later and add another category.

5. Placed / Unplaced behavior.
   - Place a scalar field from Unplaced.
   - Confirm it moves to Placed.
   - Click the Placed entry and verify the corresponding mapping is shown/selected.

6. Live scalar editing.
   - Select a scalar field on the PDF.
   - Change font size and X/Y coordinates.
   - Confirm the preview changes without deleting/replacing the field.

7. Live composite editing.
   - Select composite/free text.
   - Change font size, alignment, template text, and coordinates.
   - Confirm multiline preview still works.

8. Direct movement.
   - Drag a scalar/composite or individual mapping.
   - Use Arrow keys for small nudges and Shift+Arrow for larger nudges.
   - Confirm final PDF placement matches the Designer.

9. Repeated collection editing.
   - Click a field within a repeated block and change its font size/alignment.
   - Select a block guide and adjust block X/Y where enabled.
   - Confirm all repeated slots update consistently.

10. Selection keyboard actions.
    - Escape deselects.
    - Delete/Backspace removes a selected object.

11. PDF-only zoom regression test.
    - Repeat selection, drag, and nudge at 100% and 200% zoom.
    - Generated PDF coordinates must be unchanged by viewer zoom.

12. Generate PDF.
    - Verify the longstanding Designer-width/stretch issue does not become worse under the new fixed workspace.
    - Record separately if it still reproduces; it is not a mapping-accuracy failure.

## Known/deferred

- Undo/Redo is not implemented in Build 015.
- Full-capacity synthetic sample records are not implemented in Build 015.
- Conditional color formatting is not implemented in Build 015.
