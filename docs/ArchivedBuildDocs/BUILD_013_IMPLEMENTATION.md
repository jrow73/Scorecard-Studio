# Build 013 Implementation — Composite / Free Text

Status: implementation complete; browser acceptance pending.

## Scope

Build 013 adds a generic composite/free-text mapping type to the Layout Designer.
It is independent of any particular scorecard section and can be placed anywhere
on a PDF page.

## Designer workflow

1. Enter ordinary text in the **Text template** box.
2. Select a supported scalar field from **Insert field** and press **Insert Field**.
3. Scorecard Studio inserts a readable token such as `[Temperature]` or
   `[Away Team — Full Name]` at the current caret position.
4. Choose font size and Left / Center / Right alignment.
5. Press **Place Composite Text** and click the desired baseline alignment anchor
   on the PDF.

The template string is stored exactly as entered. Users are not required to know
or type canonical field IDs.

## Stored mapping shape

Composite text uses the existing `layout.mappings` collection with a content
discriminator:

```js
{
  id,
  field: null,
  content: {
    type: "template",
    template: "Weather: [Temperature]°F, [Conditions]"
  },
  pageIndex,
  xPercent,
  yPercent,
  fontSize,
  alignment: "left" | "center" | "right",
  anchor: "baseline-left" | "baseline-center" | "baseline-right"
}
```

Layouts containing composite mappings advance to schema version 5. Existing
scalar and repeated mappings are unchanged and require no migration.

## Resolution behavior

- Tokens are resolved through the existing canonical single-value field registry.
- Registry formatting is reused for dates, times, decimals, records, and existing
  composite registry fields such as Weather Summary.
- Unavailable or unknown token values resolve to an empty string; the token name
  is never printed into the generated PDF.
- Literal text remains exactly as entered.
- Fields referenced by a template participate in source-requirement discovery,
  so a template containing a manager field still requests coach data.

## Designer preview

The Designer resolves the template against the established sample model and
shows both an inline preview in the controls and a mapped overlay on the PDF.
The overlay honors the selected alignment anchor and PDF-only zoom behavior.

## Deliberately deferred

Build 013 does not add conditionals, formulas, colors, rich text, per-token
formatting, optional punctuation suppression, or repeated-collection tokens.
Those can be layered onto the stored template model later without changing the
basic placement contract.

## Startup hotfix

A Build 013 startup regression was found during browser acceptance testing. The new composite-preview initialization referenced `DESIGNER_SAMPLE_MODEL` before the module had initialized that constant, causing module startup to abort before Home data loading and sidebar navigation handlers completed. The application startup call now occurs after all module-level constants and function definitions are initialized. No Composite / Free Text behavior or stored mapping schema changed.

## PDF generation newline hotfix
During browser acceptance testing, a composite/free-text template containing a line break caused pdf-lib StandardFonts (WinAnsi) to throw `WinAnsi cannot encode " " (0x000a)` during PDF generation. Composite text is now split into logical lines before drawing. Each line is drawn separately from the same alignment anchor, with 1.2x font-size line spacing. The stored template remains unchanged and scalar/repeated-field generation behavior is unaffected.


## Multiline Designer preview hotfix
Browser acceptance confirmed that stored composite templates and generated PDFs preserved line breaks, but the Designer control preview and PDF mapping overlay collapsed newline whitespace into a single line. The hotfix updates only Designer CSS: the control preview now uses preserved/wrapping whitespace, while composite mapping markers preserve explicit line breaks and apply left/center/right text alignment per line around the existing stored anchor. PDF generation, template storage, and coordinate logic are unchanged.
