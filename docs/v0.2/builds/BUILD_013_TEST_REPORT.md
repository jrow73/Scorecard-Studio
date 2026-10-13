# Build 013 Test Report — Composite / Free Text

Status: static/targeted checks pass; Local and Online browser acceptance pending.

## Automated/static checks

- `node --check js/app.js` passes.
- Existing canonical scalar fields remain available to normal scalar placement.
- Composite mappings use the existing `layout.mappings` array and do not mutate
  repeated-block storage.
- Template field extraction recognizes inserted registry-label tokens and feeds
  their canonical IDs into source-requirement discovery.
- Template resolution preserves literal text and substitutes unavailable/unknown
  tokens with blank text.
- PDF generation sends composite output through the same point-based font sizing
  and alignment-aware draw helper already validated for repeated columns.
- Existing Build 012 repeated vertical/horizontal/grid generation paths are
  unchanged.

## Browser acceptance checklist

1. Open an existing Build 012 layout and verify prior scalar/repeated mappings
   still display and generate correctly.
2. Create `Weather: [Temperature]°F, [Conditions]` using **Insert Field** rather
   than manually typing tokens; confirm the Designer preview resolves sample data.
3. Place the template Left, Center, and Right in three locations and confirm the
   red anchor dot represents the chosen alignment anchor.
4. Place a literal-only note such as `Visitors:` and confirm it generates.
5. Create `[Away Team — Full Name] ([Away Team — W-L Record])` and verify the
   selected game's values appear in the generated PDF.
6. Test a field that is unavailable for the selected game and verify its token is
   left blank rather than printed literally.
7. Place a composite while the Designer is at 200% PDF zoom; confirm generated
   placement is unchanged by viewer zoom.
8. Save/reopen the layout and verify the exact template text, alignment, font
   size, and placement survive IndexedDB round-trip.

## Known/deferred items

- Post-generation stretched Designer DOM remains a known UI issue.
- Full-slot synthetic sample data and unusually-large repeated-block warnings
  remain future Designer UX work.
- Conditional template syntax and punctuation cleanup for missing values are out
  of Build 013 scope.

## Startup regression / hotfix

Browser acceptance initially exposed a startup failure: Home remained in the loading state and Game Day, Layouts, and Layout Designer navigation did not respond. Root cause was a temporal-dead-zone reference to the Build 013 Designer sample model during module startup. The startup call was moved to the end of the module so all required constants exist before initialization begins.

Retest required:
- Home completes game loading for the selected date.
- Changing dates reloads the game normally.
- Game Day, Layouts, and Layout Designer sidebar navigation responds.
- Composite / Free Text controls still initialize and preview correctly.

## Acceptance hotfix: composite line breaks
- Reproduced the PDF-generation failure path for composite text containing LF/CRLF line breaks.
- Updated PDF text drawing to split newline-delimited content and draw each line independently, avoiding WinAnsi newline encoding errors.
- JavaScript syntax check passes after the change.
- Browser acceptance still required for single-line and multi-line composite PDF output.


## Multiline Designer preview hotfix
Browser acceptance confirmed multiline composite text generates correctly in the PDF and missing token values resolve blank. A remaining Designer-only mismatch collapsed line breaks in the control preview and mapping overlay. CSS now preserves explicit line breaks in both surfaces.

Retest required:
- Enter a two- or three-line composite and verify the Preview box shows the same line breaks.
- Place it and verify the PDF-viewer mapping overlay shows the same line breaks.
- Verify Left, Center, and Right multiline mappings remain anchored to their stored red-dot position.
- Generate the PDF and confirm output is unchanged from the already-validated multiline PDF behavior.
