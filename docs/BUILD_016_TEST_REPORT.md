# Build 016.2 Acceptance Test Report

Status: Browser acceptance required.

## 1. Empty selection and synchronized selection
1. Open Designer. The right panel should show only `Nothing selected`; no creation/editing tools should be visible.
2. Click a placed data item in the left palette when it has one instance. The parent/child instance and PDF object should remain highlighted and the inspector should show its existing properties.
3. Click a placed PDF object. Its corresponding left-palette item/instance should highlight and the same inspector should appear.
4. Select a different object. The prior selection must clear everywhere.
5. Click empty PDF space or press Escape. Return to `Nothing selected`.

## 2. Palette behavior
6. Expand Game Information. Available fields should appear, but merely expanding the category must not mark them as Unplaced/unfinished.
7. Search for a field such as `weather` and verify the palette filters appropriately.
8. Switch to `Used only`; only directly placed or Text-Template-referenced data should remain visible.
9. Create `Today's date: [Game Date]` as a Text Template. Game Date should show as used while remaining reusable.

## 3. New Single Item / Text Template
10. Click an unused single-value field. The right panel should ask `Single Item` vs `Text Template`.
11. Choose one option. The question should collapse to a compact Usage summary with `Change`; only the controls relevant to that choice should remain visible.
12. Create a second instance of an already-used field and confirm child instances appear under the same parent data item.

## 4. Repeated Layout progressive flow
13. Click a collection such as Away Lineup and choose `Repeated Layout`.
14. Confirm there is no redundant Collection dropdown and no Slot Field configuration yet.
15. Choose arrangement/capacity and click `Set Placement`.
16. Follow the temporary top-of-workspace instructions for first and final/opposite slot anchors.
17. After the second click, the instructions should disappear, the completed repeated-layout instance should be selected, and only then should `Fields in each slot` controls appear.
18. Add one or more slot fields and verify alignment/font/placement output.
19. Re-select the repeated-layout child instance from the left palette. It should reopen the existing layout inspector without a generic block selector. `Change Placement` should allow re-geometrizing it.

## 5. Calm typed editing
20. Select a placed item with X=250. Begin editing the X box to 255 by deleting the final digit. The PDF object must remain at X=250 while the box temporarily contains `25`.
21. Finish typing `255` and press Tab/Enter or click elsewhere. The object should move once to X=255.
22. Repeat with font size 10 -> 12. The object must not temporarily render at 1 pt while typing.
23. Press Escape during an edit and confirm the prior value is restored.
24. Alignment dropdowns, drag movement, and keyboard nudges should still update immediately.

## 6. Zoom behavior
25. Put the pointer over a recognizable location near the lower-right of the PDF and wheel-zoom in. That PDF point should remain under/near the pointer instead of disappearing off the viewport.
26. Repeat near the upper-left and center.
27. On touch/iPad, pinch around a recognizable location. The midpoint between the fingers should remain the zoom focus.
28. Use +/- and percentage presets; the current viewport center should be preserved.
29. Generate a PDF after zooming and verify viewer zoom has no effect on final PDF geometry.

## 7. Regression and stretch issue
30. Verify legacy Build 015/016 layouts open and retain scalar/template/repeated/individual mappings.
31. Generate a PDF and verify Single Item L/C/R alignment, repeated blocks, individual placement, and Text Templates still agree between preview and output.
32. Recheck the longstanding post-generation Designer width/stretch issue. Record whether the new width constraints and message wrapping eliminate it.

Known deferred items: full Undo/Redo history; Starting Pitcher record expansion; conditional/static color formatting.


### Build 016.2 Interaction Hotfix
- Restored native wheel/trackpad scrolling in the PDF viewport. Scorecard Studio no longer intercepts wheel, Ctrl+wheel, or touch pinch gestures.
- Browser/device zoom gestures are left to the browser. PDF-only zoom remains available through the explicit minus, percentage, and plus controls; those controls preserve the visible viewport center.
- Added a conventional disclosure chevron to palette category headers so collapsed and expanded state is visually obvious while the full header remains clickable.

## Umpire Repeated-Layout Hotfix Acceptance

- Select **Umpire Crew** in the palette, choose **Repeated Layout**, configure a 4-slot layout, and select **Set Placement**.
- Verify the new child instance remains under **Umpire Crew** and the selected object remains Umpire Crew throughout both geometry clicks.
- Add an umpire slot field and verify the preview uses umpire sample data rather than lineup player data.
- Regression-check one lineup, one bench, and one bullpen repeated layout.


## Build 016.2 consolidated candidate acceptance

1. Plain mouse wheel over the PDF scrolls; it does not zoom.
2. Ctrl/Cmd+wheel over the PDF changes PDF-only zoom in small 5% steps. Confirm the page simply grows/shrinks normally and the side panels do not scale.
3. Confirm the passive Zoom percentage follows Ctrl/Cmd+wheel and Reset returns to 100%.
4. Confirm palette groups show clear collapsed/expanded disclosure indicators.
5. Confirm Umpire Crew is under Game Information.
6. Confirm Away/Home Players contain Starting Pitcher, Starting Lineup, Bench, and Bullpen; team metadata remains under Team Information.
7. Create and edit a Text Template. Confirm Preview is directly under the template box and Insert Field is available while editing an already-placed template, inserting at the caret.
8. Type an X/Y/font-size replacement and confirm intermediate keystrokes do not move the object. Confirm Enter/Tab/click-away commits it.
9. Use a numeric spinner or Arrow Up/Down and confirm each deliberate increment updates the PDF immediately.
10. On a tall desktop window, confirm the right inspector remains compact and top-stacked rather than stretching controls vertically.
11. Create a repeated layout geometry but add no slot fields. Confirm its palette instance says No fields. Generate a PDF containing other mapped content: the empty block should be skipped with a non-blocking notice and must not produce an overflow warning.
12. Regression: Umpire Crew -> Repeated Layout -> Set Placement must remain Umpire Crew through placement and PDF output.
13. Regression: existing scalar, Text Template, repeated, individual, alignment, drag/nudge, page navigation, and generated-PDF placement remain correct.

## Final 016.2 Interaction Hotfix Acceptance Checks

- [ ] With a placed item off-screen on the current PDF page, click its Palette instance and verify the PDF viewport scrolls it into view and centers it.
- [ ] Select an instance on another PDF page and verify the Designer switches pages and then scrolls the selected object into view.
- [ ] Normal mouse wheel/trackpad scrolling over the PDF viewport scrolls rather than zooms.
- [ ] `Ctrl`/`Cmd` + wheel over the PDF changes PDF-only zoom in small 10% increments.
- [ ] The passive Zoom percentage updates and Reset returns the PDF to 100%.
- [ ] On iPad/remote touch, one-finger drag can pan the PDF viewport and pinch/spread is not intercepted by Scorecard Studio.
- [ ] Existing mapping placement and generated PDF coordinates remain unchanged after zooming/panning.



## Final 016.2 UX cleanup acceptance

1. Create three separate Text Templates from three different fields; each new draft must contain only its initiating field token and any text entered for that instance.
2. Expand a Palette category, place/deselect items, and press Escape; the category must remain open until explicitly collapsed.
3. Verify category headers, used fields, unused fields, and instance children have consistent parent/child indentation.
4. Select scalar, template, and individual mappings and verify the exact anchor is shown by a small crosshair rather than a large red dot.
5. Create a lineup Individual Placement by role. After each placement, verify progress updates and the next unplaced role is offered; selecting the Individual Placement parent resumes the workflow, while selecting a child edits only that child.
6. Regression: Palette navigation still scrolls selected objects into view and Ctrl/Cmd+wheel zoom/pan behavior remains as accepted.
