# Build 032.2a — Inspector Card Spacing Correction

## Status
Correction candidate for Build 032.2 acceptance testing.

## Reason for correction
Build 032.2 successfully standardized the Field Palette `Collapse All` controls and PDF-toolbar page arrows, and its Text Template Editor and Formatting-control treatments are retained. Manual review showed that the Inspector-card spacing did not reach the intended visual target: the subordinate cards still had too much perceived outer space and the gap between the eyebrow (`SELECTED ITEM`, `NEW OBJECT`, etc.) and the item title remained too large.

## Change
The `Selected Object` card is now the explicit visual reference for Inspector card chrome.

- `Selected Item` and `New Object` / `Create New Item` cards use the same 10px outer padding as `Selected Object`.
- The subordinate workspace heading no longer adds its own grid gap between the eyebrow and title.
- The eyebrow-to-title spacing is reduced to the same 2px margin used by `Selected Object`.
- Existing internal content spacing, dividers, controls, and workflow behavior are otherwise unchanged.

## Preserved Build 032.2 changes
- compact `Collapse All` controls
- standardized PDF-toolbar page-navigation arrows
- clearer Text Template Editor textarea treatment
- compact Formatting controls

## Files changed from Build 032.2
- `app-meta.json`
- `css/styles.css`
- `tests/build0322a.test.mjs`
- `docs/Build_032.2a_Implementation.md`

`README.md` is unchanged.

## Manual acceptance checklist
- [ ] `Selected Item` outer padding visually matches `Selected Object`.
- [ ] `New Object` / `Create New Item` outer padding visually matches `Selected Object`.
- [ ] Eyebrow-to-title spacing is compact and visually matches `Selected Object`.
- [ ] Internal content spacing remains readable.
- [ ] Accepted Build 032.2 button, toolbar, Editor, and Formatting changes remain intact.
