# Build 011.1 Implementation — Designer PDF Zoom

Status: READY FOR BROWSER ACCEPTANCE

Build 011.1 adds PDF-viewer-only zoom to the Layout Designer. It is intentionally a usability/testing increment between accepted Build 011 and planned Build 012 grid geometry.

## Scope
- Zoom presets: 50%, 75%, 100%, 125%, 150%, 200%.
- Minus/plus controls step through the presets.
- Zoom applies only to the Designer PDF stage; surrounding application UI does not scale.
- Enlarged pages scroll inside the Designer PDF viewport.
- Zoom persists while moving between PDF pages during the current Designer session.
- Placement remains percentage/PDF-coordinate based. Viewer zoom does not alter stored mapping coordinates or generated PDF output.
- Existing mapping markers, repeated-row guides, and repeated-column previews scale with the rendered page.

## Deferred
Pinch gestures, wheel shortcuts, fit-width/fit-page modes, navigator thumbnails, and broader Designer UI polish remain deferred.

## Hot-fix: repeated-column alignment
- Restores/preserves Left, Center, and Right alignment selection while placing repeated-block columns.
- The selected field, font size, and alignment are now captured when **Place Collection Column** is pressed and carried through the placement click, rather than being re-read from the controls afterward.
- Viewer zoom remains independent of alignment and PDF generation semantics.

## Alignment preview hotfix

During browser acceptance testing, repeated-block center/right alignment values were still stored and used by PDF generation, but the Designer overlay preview rendered every repeated-column label from the left edge of its X anchor. This made existing Build 011 layouts appear to have lost their alignment and made new centered/right-aligned column placement look incorrect.

The Designer stylesheet now treats the stored X position as the alignment anchor for repeated-block preview markers:

- Left: preview begins at the anchor.
- Center: preview is shifted left by 50% of its rendered width.
- Right: preview is shifted left by 100% of its rendered width.

The existing baseline Y offset is preserved, and no stored mapping schema or PDF-generation geometry changed.

## Anchor-dot refinement

Browser acceptance identified one remaining preview-only regression: after restoring center/right text alignment, the red placement dot moved with the transformed preview text and therefore appeared at the preview's left edge. The dot is intended to represent the stored repeated-column X anchor, independent of text justification.

The repeated-marker CSS now compensates the dot position for center- and right-aligned previews so the text continues to render around its alignment anchor while the red dot remains exactly on that anchor. No stored coordinates or PDF-generation logic changed.
