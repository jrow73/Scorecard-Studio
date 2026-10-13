# Build 019.2 Implementation — Formatting Final Cleanup

## Purpose

Build 019.2 is a narrow acceptance-test cleanup pass for Build 019 Formatting. It addresses the final three UI issues found during Build 019.1 testing without changing the formatting inheritance model or expanding Build 019 scope.

## Changes

### 1. Inspector color palette stays inside the Inspector

The inline formatting color palette now opens to the right from its control rather than aligning its right edge to the narrow color button. This prevents the palette from extending off the left edge of the Inspector panel.

Acceptance:
- Open the color palette from an item in the right-side Inspector.
- All nine swatches and the Custom Color option remain visible within the Inspector area.
- Selecting a swatch still updates the selected item immediately.

### 2. Font size uses fixed quick-pick choices plus free typing

The browser datalist/search behavior has been removed. Font Size is now a compact editable field with a separate dropdown containing fixed common sizes:

`6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 36`

Acceptance:
- Opening the Font Size dropdown always shows the full fixed list.
- Typing into the Font Size field does not filter the dropdown.
- A custom value may still be typed directly.
- Typed values commit only on Enter or blur, so typing `12` never temporarily applies `1 pt`.
- Selecting a quick-pick size applies it immediately.

### 3. Conditional-formatting controls are kept on one horizontal line when space permits

The Hitter Conditional Formatting and Pitcher Conditional Formatting headings and option controls now use a horizontal, wrapping layout instead of a stacked grid.

Acceptance:
- At normal Layout Settings width, each conditional-formatting checkbox and its associated text remain on the same line with the section heading/control row.
- The row may wrap naturally only when the available width is too narrow.
- The three Hitter or Pitcher profile rows remain hidden until their corresponding checkbox is enabled.

## Regression checks

Build 019.2 must preserve all previously accepted Build 019/019.1 behavior:

- Helvetica, 10 pt, Black, Regular neutral App defaults.
- Helvetica / Times / Courier only.
- Layout formatting defaults persist.
- Hitter and Pitcher conditional formatting are opt-in and independent.
- Conditional formatting applies to the entire player/pitcher item when enabled.
- Inline Inspector font face, font size, Bold, Italic, color, and Restore Defaults work.
- Text Templates inherit the formatting context of the object that created them.
- Partial field/object overrides remain property-specific.
- Designer preview and generated PDF formatting remain consistent.
- Maximum width, auto-shrink, and wrapping remain deferred.

## Automated test

Run:

`node tests/build019.test.mjs`

Expected result:

`Build 019.2 formatting defaults, opt-in conditional formatting, inline Inspector controls, fixed font-size choices, color palette positioning, and PDF-font regression tests passed.`
