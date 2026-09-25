# Build 026.2 — Field Picker & Palette Persistence Fixes

Build 026.2 is the second acceptance-fix package for Build 026. It is intended to become the baseline for the full Build 026 acceptance pass.

## Scope

1. **Balanced Custom Field Selector layout**
   - The selector now presents matching Away and Home cards side-by-side in a predictable left/right pattern.
   - `Game / Weather` fields are displayed in the `Game` card so the top `Game | Game / Venue` row is better balanced.
   - Away/Home Team, Record, Standings, Personnel, Starting Pitcher, Starting Lineup, Bench, and Bullpen cards are paired row-for-row.
   - Game-wide Umpire fields remain a game-level card and span the selector width.
   - This is a presentation-only regrouping; field IDs and saved selections are unchanged.

2. **Dynamic Field Palette counts**
   - The total available-field count and Standard-field count in Layout Settings are now derived from the live field registry.
   - No field-count values are hard-coded in the explanatory copy.

3. **Replacement PDF page-count validation popup**
   - Selecting a replacement PDF with a different page count now opens a prominent `PDF Cannot Be Replaced` dialog.
   - The dialog reports the selected and required page counts and explains that matching page counts are required to preserve existing placements.
   - The current PDF and all layout mappings remain unchanged.

4. **Per-card bulk selection and counts**
   - Every Custom Field Selector card shows `X of Y selected`.
   - Every card always exposes `Select All` and `Deselect All` controls.
   - The unavailable action is disabled when the card is already fully selected or fully deselected.
   - Bulk controls operate on the entire card even while a search filter is active.

5. **Text Template Insert Field filtering**
   - Text Template `Insert Field` choices now use only fields currently enabled in the layout Field Palette.
   - The rule is enforced both before placement and when editing an already placed Text Template.
   - Existing tokens that reference a subsequently disabled field are preserved and continue to render; disabling a field only prevents new insertion.
   - Repeated-layout Text Template insertion follows the same enabled-field rule.

6. **Persist intentional zero-field custom palettes**
   - An explicitly saved empty field selection is now stored as a valid Custom configuration.
   - `[]` no longer falls back to the Standard field set.
   - Only layouts with no palette configuration at all retain the legacy/default fallback behavior.

## Acceptance Checklist

- [ ] Open Layout Settings and confirm the Field Palette description displays live total and Standard counts rather than hard-coded values.
- [ ] Open Select Custom Fields and confirm `Game` is paired with `Game / Venue`, with Temperature, Conditions, Wind, and Weather Summary inside `Game`.
- [ ] Confirm Away cards remain in the left column and their matching Home cards remain in the right column for Team, Record, Standings, Personnel, Starting Pitcher, Starting Lineup, Bench, and Bullpen.
- [ ] Confirm each card shows a live `X of Y selected` count.
- [ ] Confirm `Select All` and `Deselect All` work from fully selected, partially selected, and fully deselected states.
- [ ] Confirm Away cards can be cleared quickly without changing matching Home cards.
- [ ] Search for a field and confirm a card's bulk controls still apply to the complete card rather than only the visible search result.
- [ ] Attempt to replace a two-page layout PDF with a one-page PDF and confirm the prominent page-count dialog appears and the original PDF remains selected.
- [ ] Configure the layout with only one enabled field. Create and place a plain Text Template, then edit it and confirm Insert Field still offers only fields enabled by the palette.
- [ ] Disable a field already referenced by an existing Text Template; confirm the existing token still renders but the field is no longer offered for new insertion.
- [ ] Deselect every custom field, save the selector, save Layout Settings, and confirm the Designer offers no enabled data fields; the Text Template tool may remain available.
- [ ] Reopen Layout Settings and confirm the Custom Field Selector still contains zero selected fields rather than restoring Standard fields.

## Files Changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `docs/Build_026.2_Implementation.md`
- `tests/build0262.test.mjs`
