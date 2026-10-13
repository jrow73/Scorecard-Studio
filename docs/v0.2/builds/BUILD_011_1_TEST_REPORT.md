# Build 011.1 Test Report — Designer PDF Zoom

Status: CODE CHECKS PASS; BROWSER ACCEPTANCE REQUIRED

## Static checks
- `node --check js/app.js`: PASS.
- Zoom is viewer state only and is not written to layout mappings.
- Placement click handling continues to derive x/y percentages from the rendered PDF canvas bounds, so equivalent visual PDF locations resolve to equivalent underlying coordinates at every zoom level.
- PDF generation code is unchanged by viewer zoom.

## Browser acceptance
1. Open an existing Build 011 layout at 100% and note an existing marker location.
2. Change to 150% and 200%; verify only the PDF enlarges and the marker stays attached to the same PDF location.
3. Scroll within the enlarged PDF viewport.
4. Place a test field at 200%, generate the PDF, and verify placement corresponds to the clicked PDF location.
5. Switch pages while zoomed and verify the selected zoom remains active.
6. Exercise +/- and each preset, including disabled behavior at 50% and 200%.
7. Confirm browser/application controls remain normal size throughout.

## Alignment regression hot-fix
- `node --check js/app.js`: PASS after hot-fix.
- Confirm a repeated block can place Left-, Center-, and Right-aligned columns at 100% and 200% zoom.
- Confirm the generated PDF honors each selected alignment and that zoom does not change the alignment anchor.

## Alignment preview regression retest

Acceptance testing identified a Designer-only regression: center/right repeated-column markers were visually rendered as left-anchored even though their saved alignment metadata and PDF-generation alignment path remained present.

Retest requirements:

1. Open an existing Build 011 repeated block containing left, center, and right aligned columns and confirm all three preview around their stored anchors correctly.
2. Place a new center-aligned column and confirm the red anchor falls through the horizontal center of the preview text.
3. Place a new right-aligned column and confirm the preview terminates at the red anchor.
4. Repeat at 100% and 200% viewer zoom.
5. Generate the test PDF and confirm final output matches the Designer alignment.

## Anchor-dot acceptance refinement

Expected browser behavior:
- Left-aligned repeated-column preview: red dot sits at the text's left alignment anchor.
- Center-aligned preview: red dot sits at the horizontal center anchor used for the text.
- Right-aligned preview: red dot sits at the text's right alignment anchor.
- Changing Designer zoom must not move the dot relative to the underlying PDF coordinate.
- Generated PDF geometry remains unchanged.
