# Build 027.3 — Text Overflow & Fit Controls

## Baseline

Build 026.4 is the accepted source-of-truth baseline for Build 027. Build 027 passed technical acceptance; Build 027.3 adds the final persistence correction after the 027.2 UI-polish pass, with no change to the fitting algorithm.

## Goal

Add an intentional, opt-in long-text policy without changing existing placement behavior. Most text remains unrestricted. A designer can enable a maximum width only for a placement that may collide with neighboring content or cross source-PDF box lines.

## Implemented behavior

- Existing placements have **no width limit by default**.
- Every text-bearing scalar mapping, Text Template, Repeated/Record Layout child, and Individual Placement can opt in to **Shrink to fit width**.
- Enabling the option stores `fitWidthPoints` on that placement/content item.
- The configured formatting `fontSize` remains the **preferred font size**. No rendered/shrunk font size is persisted.
- At each render, the final resolved text is measured at the preferred font size.
- If the resolved text fits within `fitWidthPoints`, it renders at the preferred font size.
- If it exceeds the width, the renderer scales the font size proportionally so the longest rendered line fits the boundary.
- **No minimum font size is imposed.** This preserves legitimate very-small scorecard text, including 4 pt designs.
- The shrink decision is recalculated independently for every resolved value and every PDF generation. Representative-data behavior never carries into a later live PDF and vice versa.
- Left, center, and right alignment semantics remain unchanged.

## Designer interaction

The Selected Item Inspector groups shrink-to-fit with the other formatting controls. The checkbox sits on the same line immediately to the left of **Enable Shrink to Fit**. It is off by default. When enabled:

- **Maximum Width** appears on the next compact line with its numeric input and `pt` unit;
- the scorecard shows a blue width boundary for the selected placement;
- a precision crosshair at the boundary can be dragged to change the width, while retaining a larger invisible pointer/touch target;
- left-aligned items extend the boundary to the right of the anchor;
- right-aligned items extend it to the left; and
- centered items use a symmetric total width around the anchor.

A divider follows the shrink-to-fit controls, separating formatting from field/content options such as Name format. There is no separate remove button or explanatory paragraph. Unchecking **Enable Shrink to Fit** disables the active width constraint but preserves the previously chosen `fitWidthPoints`. Rechecking the option restores that exact width instead of recalculating a default. The browser preview also shrinks the current Representative Data value when needed, so the Designer gives immediate feedback before Test PDF generation.

## PDF rendering

`drawAlignedPdfText()` now accepts the optional placement width. The PDF path uses the embedded pdf-lib font metrics (`font.widthOfTextAtSize`) and calculates:

`actualSize = preferredSize * (fitWidth / measuredWidth)`

only when `measuredWidth > fitWidth`. Otherwise `actualSize = preferredSize`.

Test PDF and Live PDF continue to share the same rendering path.

## Acceptance checklist

1. Existing Build 026 layouts render unchanged until a width limit is explicitly enabled.
2. Enable **Enable Shrink to Fit** on a normal scalar field; confirm the compact Maximum Width row and blue width guide appear.
3. Drag the crosshair boundary handle and confirm the numeric point value follows it; verify the crosshair can be positioned precisely on a source-PDF box edge.
4. Confirm left-, center-, and right-aligned boundaries grow from the correct anchor semantics.
5. Confirm a Representative Data value that already fits remains at its preferred font size.
6. On the name-test layout, constrain the placement containing **Theodore Fitzpatrick III** and confirm the Representative/Test PDF shrinks that resolved value to fit.
7. Generate a live PDF using the same layout. If the live name in Theodore's placement is short enough, confirm it renders at the preferred size rather than retaining the Representative Data shrink.
8. In a placement where Representative Data fits, use live data containing a longer value such as **Joshua-Douglas** and confirm the live value shrinks when it exceeds the configured width.
9. Confirm a 4 pt preferred font size remains allowed and that shrink-to-fit can go below 4 pt if required by the configured width.
10. Confirm Text Templates, Repeated Layout children, Record Layout children, and Individual Placement items use the same behavior.
11. Reload the app/layout and confirm the optional width persists.
12. Uncheck **Enable Shrink to Fit** and confirm the placement returns to unrestricted rendering at its preferred font size. Recheck it and confirm the prior Maximum Width is restored exactly rather than recalculated.

## Out of scope

Build 027 does not add wrapping, clipping, ellipsis/truncation, a hard minimum font size, automatic inference from neighboring objects, or a global width requirement for every placement.
