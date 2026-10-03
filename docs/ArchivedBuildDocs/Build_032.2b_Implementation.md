# Build 032.2b — Inspector Card / Formatting Correction

## Status
Correction candidate for Build 032.2 acceptance testing.

## Reason for correction
Manual review of 032.2a confirmed the eyebrow-to-title spacing improvement, but three issues remained:

1. the visible Inspector card still had excessive edge padding because both the outer subordinate workspace and the inner Selected Item card contributed padding;
2. the divider beneath the Selected Item title had been removed; and
3. the Formatting inputs were still visually larger than the nearby compact field-selector control.

## Changes

### Inspector card spacing
- Keep the existing subordinate Inspector workspace as the single visible card.
- Use 10px outer padding, matching the Selected Object card.
- Remove the second layer of padding from the inner Selected Item section.
- Preserve the compact eyebrow-to-title spacing accepted in 032.2a.
- Restore the divider line beneath the Selected Item title.

### Formatting controls
- Reduce X/Y, Alignment, font family, font size, color, and Maximum Width controls to a compact 24px control height.
- Reduce internal control padding and typography-toolbar widths accordingly.
- Tighten Formatting group spacing without changing control behavior or logical grouping.

## Preserved 032.2 changes
- compact `Collapse All` controls
- standardized PDF-toolbar page-navigation arrows
- clearer Text Template Editor textarea treatment

## Files changed from Build 032.2a
- `app-meta.json`
- `css/styles.css`
- `tests/build0322b.test.mjs`
- `docs/Build_032.2b_Implementation.md`

`README.md` is unchanged.

## Manual acceptance checklist
- [ ] Selected Item content has approximately the same edge inset as Selected Object.
- [ ] New Object / Create New Item remains visually consistent with Selected Object.
- [ ] Divider line appears beneath the Selected Item title.
- [ ] Eyebrow-to-title spacing remains compact.
- [ ] Formatting text boxes and dropdowns are visibly more compact.
- [ ] Formatting controls remain usable and do not overflow the Inspector.
- [ ] Accepted Collapse All, page-arrow, and Text Template Editor changes remain intact.
