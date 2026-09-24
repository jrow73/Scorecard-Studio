# Build 025 — Live Game PDF Integration

**Baseline:** Build 024 Final / 024.3  
**Purpose:** Add a deliberately narrow live-game PDF path before continuing Designer feature work, so accepted Designer output can be A/B tested against real MLB pregame data.

## Scope

Build 025 adds live PDF generation to the Home-page selected game. It does **not** add Field Palette/Layout Settings redesign, text-fit controls, or release-review work; those move to Builds 026–028.

### 1. Home-page live generation

When a selected game's feed has loaded, Home now shows:

- a **Layout** selector populated from saved layouts; and
- **Generate Live PDF**.

The most recently chosen live-generation layout is remembered in browser settings as `livePdfLayoutId`. This is only a convenience preference; Build 025 does not introduce a broader Favorite Layout feature.

### 2. One shared PDF renderer

Designer **Generate Test PDF** and Home **Generate Live PDF** both call the same `buildPopulatedPdf(layout, model)` rendering path.

The only intentional difference is the model supplied to that renderer:

- Designer supplies deterministic `DESIGNER_SAMPLE_MODEL` Representative Data.
- Home supplies the normalized/hydrated model for the selected real game.

This makes Build 025 an integration/A-B checkpoint rather than a second independent implementation of PDF drawing.

### 3. Dependency-driven live hydration

Before live generation, Scorecard Studio calls `collectLayoutFieldIds(layout)` and hydrates the selected game only for sources required by those mapped fields.

Examples:

- a layout using Game Pack-native fields requires no extra supplemental request;
- manager/coaching fields request Coaches data;
- standings/division fields request Standings data.

The normalized live model is then passed to the shared renderer.

### 4. Game-selection safety

Selecting or changing a game immediately clears the previously loaded feed for generation purposes. **Generate Live PDF** remains unavailable until the newly selected game's feed loads successfully.

Generation also verifies that the selected game did not change during supplemental hydration.

### 5. Generation notices

The shared renderer retains the existing Test PDF behavior for:

- unavailable mapped values left blank;
- repeated-collection overflow;
- empty repeated layouts; and
- unsupported/error mappings.

The same notices are shown after live generation so Representative Data and live-data output can be compared under the same rules.

## Deferred roadmap

Following the Build 025 scope change:

- **Build 026 — Field Palette & Layout Settings**
- **Build 027 — Text Overflow & Fit Controls**
- **Build 028 — v0.2.0 Designer Completion / Release Review**

## Acceptance checklist

1. Load Build 025 with at least one saved/mapped layout.
2. On Home, select a favorite-team game whose Game Pack/feed loads successfully.
3. Verify the new Layout selector lists saved layouts and Generate Live PDF is enabled only after the game loads.
4. Choose the same layout used for Designer acceptance testing.
5. In Designer, click **Generate Test PDF** and save the Representative Data output.
6. Return Home and click **Generate Live PDF** for the selected real game.
7. Verify the live PDF uses the selected layout's original source PDF and preserves the same placement, alignment, font, size, color, name-format, conditional-formatting, repeated-layout, Record Layout, Text Template, and Individual Placement behavior as the Test PDF.
8. Verify real game values replace Representative Data values and unavailable live values are left blank rather than filled from Representative Data.
9. If the selected layout maps manager/coaching or standings fields, verify those values populate through supplemental hydration when available.
10. Change to another game (including a doubleheader game when available) and verify live generation cannot use the previous game's feed while the new selection is loading.
11. Change the Layout selector, generate, reload the app, and verify the last selected live-generation layout remains selected when that layout still exists.
12. Verify Designer Generate Test PDF remains independent of the selected live game and produces the deterministic Representative Data fixture.
13. Compare the Test PDF and Live PDF field-for-field. Record any discrepancies as Build 025 integration defects rather than changing unrelated Designer UX.

## Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `docs/AI.md`
- `docs/DESIGNER_COMPLETION_INVENTORY.md`
- `docs/PREGAME_DATA_INVENTORY.md`
- `docs/ArchivedBuildDocs/BUILD_025_IMPLEMENTATION.md`
- `tests/build025.test.mjs`
