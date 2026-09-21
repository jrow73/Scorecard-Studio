# Build 019 Implementation — Formatting

## Purpose

Build 019 adds a formatting system to the Layout Designer without turning every placement workflow into a font-control panel. Formatting is defined primarily at the layout level, inherited automatically by placed objects, and overridden only where the scorecard needs an exception.

Build 018 Final is the authoritative baseline for this build.

## Scope

Build 019 includes:

- Layout-level formatting defaults.
- Font face, font size, text color, bold, and italic.
- Alignment remains a separate frequently-used placement control.
- Field/object formatting overrides through a dedicated **Formatting…** action.
- Property-level overrides: changing only font size continues to inherit face, color, bold, and italic from the active layout profile.
- Existing Designer palette categories drive normal formatting inheritance.
- Player handedness profiles can replace the normal player profile for an entire collection slot.
- Text Templates inherit one formatting context as a whole; tokens inside the template do not bring their own formatting.
- Designer preview and generated PDF output use the same effective formatting rules.
- A clean Build 019 formatting data model; Build 018 Designer layouts do not receive a legacy-formatting compatibility layer. Existing test layouts may be recreated for Build 019 acceptance.

Explicitly deferred:

- Maximum field width.
- Auto-shrink / shrink-to-fit.
- Automatic text wrapping.
- General conditional-expression rules.
- User-supplied font files or font embedding management.

## Formatting Inheritance

The effective formatting cascade is:

**App Defaults → Layout Formatting Profile → Slot Handedness Profile (when applicable) → Object/Child Property Overrides**

New Build 019 placements inherit their active layout profile. They do not need formatting controls displayed during initial placement.

### App / Initial Layout Defaults

| Profile | Font | Size | Color | Bold | Italic |
| --- | --- | ---: | --- | --- | --- |
| Game Information | Helvetica | 12 pt | Black | Yes | No |
| Away Team Information | Helvetica | 14 pt | Blue | No | No |
| Away Player Information | Helvetica | 10 pt | Blue | No | No |
| Home Team Information | Helvetica | 14 pt | Red | No | No |
| Home Player Information | Helvetica | 10 pt | Red | No | No |
| Player Bats Left | Helvetica | 10 pt | Black | No | No |
| Player Bats Right | Helvetica | 10 pt | Blue | No | No |
| Player Bats Switch | Helvetica | 10 pt | Green | No | No |
| Pitcher Throws Left | Helvetica | 10 pt | Black | No | No |
| Pitcher Throws Right | Helvetica | 10 pt | Blue | No | No |
| Pitcher Throws Switch | Helvetica | 10 pt | Green | No | No |

A new layout receives these defaults. Build 019 acceptance should use a new/recreated layout so every placed object participates in the same inheritance model.

## Palette Category Mapping

No new Field Registry category system is introduced. The Designer already divides fields into the required semantic groups:

- Game Information
- Away Team Information
- Away Players
- Home Team Information
- Home Players

These existing rules are reused to choose the normal formatting profile.

## Layout Settings

A **Layout Settings** button is available from both the selected Layout view and the Designer header.

The Formatting Defaults dialog provides one row per profile with:

- Font face
- Font size
- Color
- Bold
- Italic

**Reset to App Defaults** repopulates all rows with Scorecard Studio defaults. **Save Layout Settings** persists the profiles with the layout.

Changing a layout profile immediately affects Build 019 objects that still inherit that property. Explicit field overrides remain unchanged.

## Field / Object Overrides

The selected-object Inspector keeps **Alignment** visible and separate.

Formatting is summarized compactly and edited through **Formatting…**. The override dialog supports:

- Font face override, or Inherit.
- Font size override, or Inherit.
- Optional color override.
- Optional Bold override.
- Optional Italic override.
- **Use Layout Default** to remove all overrides.

Overrides are property-level. Example: a bullpen child may override only its font size to 6 pt while continuing to inherit the layout's font, handedness color, bold, and italic settings.

## Collection-Slot Handedness

Handedness formatting applies to the **entire slot**, not merely the Bats/Throws token.

For lineup and bench slots:

- Bats L → Player Bats Left
- Bats R → Player Bats Right
- Bats S → Player Bats Switch

For bullpen and starting-pitcher slots:

- Throws L → Pitcher Throws Left
- Throws R → Pitcher Throws Right
- Throws S → Pitcher Throws Switch

Thus Jersey #, Player Name, Position, statistics, and Text Template children in a slot share the slot's effective handedness formatting unless a child property is explicitly overridden.

Umpire collections use Game Information formatting and have no handedness substitution.

## Text Template Rules

A Text Template has one formatting context for its entire rendered string.

- A template created from Game Date remains Game Information formatting even if tokens from other categories are inserted later.
- A template created from an Away Team field remains Away Team Information formatting.
- A Text Template used as content inside a repeated player slot inherits that slot's formatting, including handedness substitution.
- Embedded tokens do not individually change font or color.

## Font Support

Build 019 exposes three PDF-safe font families:

- Helvetica
- Times
- Courier

Generated PDFs use pdf-lib's built-in standard PDF fonts: Helvetica, Times Roman, and Courier, including their Bold/Italic variants. The Designer preview requests the same family and uses a platform fallback stack when that exact face is unavailable in the browser (for example, Helvetica falls back to Arial/sans-serif on Windows). No arbitrary system-font choices or user-supplied font files are exposed in Build 019.

## Layout Compatibility Decision

Build 019 intentionally does **not** carry forward the Build 018 per-object `fontSize` compatibility path. Formatting is always resolved through the Build 019 cascade: layout profile, optional handedness profile, then property-level object/child overrides.

Existing development/test layouts may be recreated for Build 019. This keeps the persisted model and rendering code simpler as the Designer approaches v0.2.0 completion.

## Acceptance Test

1. Create or recreate a layout for Build 019 acceptance. Open **Layout Settings** and verify all 11 profiles are present and initially populated with Helvetica-based App defaults.
2. Change one profile font to Times and another to Courier; verify both are available alongside Helvetica and no arbitrary/system font list is offered.
3. Change Away Player Information to a visibly different font size/color and save. Open the Designer and place a new Away Player field. Verify Designer preview uses the changed profile.
4. Change the same layout profile again. Verify that newly placed Build 019 object updates automatically without editing the object.
5. Select the object. Verify Alignment remains directly available in the Inspector and formatting is represented by a compact summary plus **Formatting…**.
6. Open **Formatting…**, override only font size, and apply. Change the corresponding layout color. Verify the object keeps its custom size but inherits the new layout color.
7. Choose **Use Layout Default**. Verify all field-specific formatting overrides are removed.
8. Create an Away or Home lineup repeated layout with Jersey #, Player Name, Position, and/or a Text Template. Verify every child in each sample slot uses the same slot color/style according to that player's Bats L/R/S value.
9. Override the font size of one repeated child (for example Player Name). Verify that child uses the custom size across slots while its color still follows each slot's handedness profile.
10. Create a bullpen repeated layout and verify whole-slot formatting follows Throws L/R/S using the pitcher profiles.
11. Create a Starting Pitcher Record Layout and verify its child content follows the starting pitcher's throwing-hand profile.
12. Start a Text Template from Game Date, add tokens from another category, and verify the entire template remains Game Information formatting.
13. Generate a Test PDF. Verify font family, size, color, bold, italic, handedness formatting, and field overrides match the Designer preview closely.
14. Use **Reset to App Defaults**, save, and verify the documented default profiles return.
15. Verify no Maximum Width, Shrink-to-Fit, or wrapping controls were introduced in Build 019.
16. Run `node tests/build019.test.mjs` and confirm it passes.

## Expected Changed Files

- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/formatting.js` (new)
- `tests/build019.test.mjs` (new)
- `docs/BUILD_019_IMPLEMENTATION.md` (new)

`README.md` is intentionally not changed.
