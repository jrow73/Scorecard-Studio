# Build 019.1 Implementation — Formatting UX & Conditional Formatting

## Purpose

Build 019.1 is the acceptance-test refinement pass for Build 019 Formatting. It keeps the underlying layout-default → conditional-profile → field-override model, while making formatting simpler and more scorecard-user-facing.

## Changes

### 1. Neutral App formatting defaults

Every App formatting profile now starts identically:

- Helvetica
- 10 pt
- Black
- Regular

This applies to Game Information, Away/Home Team Information, Away/Home Player Information, and all hitter/pitcher conditional profiles. New layouts therefore begin neutral rather than imposing a team-color or handedness convention.

### 2. Conditional formatting is opt-in

Layout Settings now exposes two optional sections:

**Hitter Conditional Formatting**  
`Format hitters according to their batting side (Left, Right, Switch)`

**Pitcher Conditional Formatting**  
`Format pitchers according to their throwing arm (Left, Right, Switch)`

Both are OFF by default. Their Left/Right/Switch formatting rows are hidden until the corresponding option is enabled.

When disabled, Away/Home Player Information is the end of the formatting cascade. A player's Bats or Throws value cannot change the formatting.

When enabled, the entire applicable repeated player row uses the corresponding Left/Right/Switch profile. Individual placed child fields can still apply their own formatting override.

### 3. Scorecard-oriented color picker

The browser's advanced color picker is no longer the first interaction. Formatting color controls now offer nine readable text swatches:

- Black `#000000`
- Dark Gray `#444444`
- Medium Gray `#777777`
- Red `#D32F2F`
- Blue `#1565C0`
- Green `#2E7D32`
- Orange `#C45100`
- Purple `#7B1FA2`
- Teal `#00796B`

A **Custom Color…** option opens the browser/OS advanced color picker. Internally, palette and custom colors are stored the same way as hexadecimal color values.

### 4. Formatting moved into the Inspector

The separate Formatting Override modal has been removed. A selected field/child now exposes compact formatting controls directly in the Inspector:

- Font family: Helvetica / Times / Courier
- Font size
- Bold
- Italic
- Text color
- Restore Defaults

The user-facing UI no longer exposes `Inherit` / `Override` terminology.

The Inspector shows a **Current Defaults:** reference line. Palette colors are shown by friendly name; custom colors are shown as a hexadecimal value.

### 5. Live editing and partial overrides

Discrete formatting choices (font family, Bold, Italic, color) update the Designer immediately.

Font size supports both common-size suggestions and free typing. Typed sizes commit on **Enter or blur**, not on each keystroke. Typing `12` therefore never temporarily applies `1 pt`.

Under the hood, field-specific formatting remains property-level. **Restore Defaults** clears the selected object's formatting overrides so it once again follows the currently applicable Layout Settings.

### 6. Standard PDF font families remain unchanged

Build 019.1 continues to expose only:

- Helvetica
- Times
- Courier

Generated PDFs use the corresponding built-in PDF font families and their Bold/Italic variants. No arbitrary local-system fonts are introduced.

## Acceptance checks

1. Create a brand-new layout. Confirm all normal Layout Settings formatting rows begin Helvetica / 10 / Black / Regular.
2. Confirm Hitter Conditional Formatting and Pitcher Conditional Formatting are both OFF and their Left/Right/Switch rows are hidden.
3. Set Away Player Information to Red and Home Player Information to Blue with both conditional options OFF. Place lineups and verify every away player is red and every home player is blue regardless of Bats value.
4. Enable Hitter Conditional Formatting. Configure distinct Left/Right/Switch colors and verify the entire hitter row follows the player's batting side in both Designer preview and generated PDF.
5. Disable Hitter Conditional Formatting again and verify team-player formatting resumes without deleting the saved Left/Right/Switch settings.
6. Repeat the enable/disable behavior for pitcher throwing-arm formatting.
7. Verify the nine color swatches appear and each updates the selected color. Verify Custom Color opens the advanced color picker.
8. Select a placed object. Confirm no formatting modal opens; formatting controls appear directly in the Inspector.
9. Verify the Inspector's Current Defaults line uses a friendly palette color name or a custom hex value as appropriate.
10. Change Font, Bold, Italic, and Color and verify the preview updates immediately.
11. Type `12` into Font Size. Verify the object does not temporarily render at `1 pt`; pressing Enter commits `12` and leaves focus without closing or navigating away from the Inspector.
12. Change only one formatting property and verify later Layout Setting changes still affect the other inherited properties.
13. Click Restore Defaults and verify all field-specific formatting changes are removed and the object returns to the applicable Layout Settings.
14. Generate a PDF and verify Font/Size/Color/Bold/Italic match the Designer result.
15. Run `node tests/build019.test.mjs` and confirm the Build 019.1 regression test passes.

## Deferred

Still intentionally outside Build 019/019.1:

- Maximum width
- Shrink-to-fit
- Text wrapping / auto-fit behavior
- Arbitrary installed fonts or font-file uploads
