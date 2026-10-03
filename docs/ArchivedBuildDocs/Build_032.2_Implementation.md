# Build 032.2 — Designer Control & Inspector Visual Consistency

## Status
Implementation candidate for Build 032 acceptance testing.

## Scope
Build 032.2 is the visual-consistency pass identified after Build 032.1. It intentionally does not change Designer placement behavior or data logic.

### 1. Compact Designer action buttons
The Field Palette `Collapse All` controls now use the same compact secondary-action sizing as Inspector actions such as `Deselect` and `New Instance`.

The large blue `Place … on Scorecard` workflow buttons remain intentionally unchanged.

### 2. PDF-toolbar page arrows
The previous/next page arrow buttons now use the same toolbar-icon dimensions as Undo, Redo, Copy, Paste, Zoom, and Layout Settings.

### 3. Inspector card outer spacing
`New Object` / `Create New Item` and `Selected Item` cards use compact, balanced outer padding so the bottom edge does not carry noticeably more empty space than the top edge.

### 4. Text Template Editor affordance
The generic, selected-item, and repeated-record Text Template editor textareas now have a slightly stronger input treatment:

- clearer border contrast
- subtly distinct editable background
- stronger hover border
- visible focus treatment

No Text Template behavior or token handling changes in this pass.

### 5. Compact Formatting controls
Formatting inputs and dropdowns are reduced to a denser 28px control height, visually closer to the nearby `Choose text field to insert…` selector. This includes:

- X / Y position inputs
- Alignment
- font family
- font size picker
- Bold / Italic controls
- color summary control
- Maximum Width

Logical grouping and divider structure remain unchanged.

## Files changed
- `app-meta.json`
- `index.html`
- `css/styles.css`
- `tests/build0322.test.mjs`
- `docs/Build_032.2_Implementation.md`

## Manual acceptance checklist

### Button sizing
- [ ] Top and bottom `Collapse All` buttons visually match compact Inspector secondary actions.
- [ ] `Deselect`, `New Instance`, and other existing compact actions remain unchanged.
- [ ] Large blue `Place … on Scorecard` buttons remain large primary actions.
- [ ] Previous/next page arrows match the dimensions/alignment of the other PDF-toolbar icon buttons.

### Inspector spacing
- [ ] New Object / Create New Item cards have balanced top and bottom outer padding.
- [ ] Selected Item cards have balanced top and bottom outer padding.
- [ ] Internal section spacing/dividers remain readable and are not compressed accidentally.

### Text Template Editor
- [ ] New generic Text Template textarea is clearly recognizable as editable.
- [ ] Existing Text Template textarea uses the same treatment.
- [ ] Repeated-record Text Template textarea uses the same treatment.
- [ ] Focus state is visible without being distracting.

### Formatting
- [ ] X / Y, Alignment, font, size, style, color, and Maximum Width controls appear noticeably more compact.
- [ ] Formatting controls remain usable and do not overflow the Inspector.
- [ ] Formatting behavior itself remains unchanged.

## Out of scope
Build 032.3 remains reserved for user-facing placement terminology cleanup. Build 032.4 remains reserved for Designer header cleanup and final Build 032 integration review.
