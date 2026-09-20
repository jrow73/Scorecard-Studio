# Scorecard Studio - Build 018.1 Implementation

**Milestone:** v0.2.0-dev  
**Baseline:** Build 018  
**Theme:** Field-catalog metadata, representative sample data, and testable Designer previews

## 1. Objective

Build 018.1 addresses a testing and usability gap discovered during Build 018 acceptance testing: the Designer could expose a valid field while still showing `[blank]` because the built-in Designer sample model did not contain representative values for the expanded catalog.

Build 018.1 establishes a shared field-catalog metadata layer and a comprehensive representative sample model so active fields can be understood and tested without depending on whichever values happen to exist in one live GamePack.

This is a field-catalog foundation build. It does **not** implement the future New Scorecard Standard/Custom field-selection screen.

## 2. Registry metadata contract

Every active catalog field now carries these user-facing metadata properties in addition to the Build 018 catalog controls:

```text
label
category
description
exampleValue
visibilityTier: standard | custom
catalog: true
```

Compatibility-only fields remain resolvable but are not active catalog choices:

```text
catalog: false
visibilityTier: null
description: null
exampleValue: null
```

### `description`

A concise explanation suitable for a future tooltip, information icon, field browser, or help surface. The label remains intentionally short; the description explains unfamiliar abbreviations or semantics without forcing explanatory text into every checklist row.

Examples:

- **OPS** - `OPS: on-base percentage plus slugging percentage.`
- **WHIP** - `WHIP: walks plus hits allowed per inning pitched.`
- **Position Number** - `Traditional defensive position number (P=1 through RF=9).`

### `exampleValue`

A deterministic display example that is always available even when no live game currently supplies that field.

Examples:

- OPS - `.841`
- W-L - `14-7`
- Position Number - `8`
- Division Games Back - `2.5`

The example value is catalog metadata. It is not written into generated scorecards as if it were live data.

## 3. Representative sample model

Build 018.1 moves the Designer sample model into a dedicated module:

- `js/sample-data.js`

The same model can now be imported by both the Designer and automated tests.

The representative model includes values for every active Build 018 catalog family, including:

- game/date/start/day-night/game-of-day number;
- venue identity and characteristics;
- weather and fixed/repeated umpires;
- Home/Away team identity, league/division, record, standings, and manager;
- Starting Pitcher identity and active stat family;
- Lineup and Bench identity, positions, primary positions, and active batting family;
- Bullpen identity and active pitching family.

The representative model is deliberately deterministic. It is a Designer/test fixture, not a claim about the currently selected MLB game.

## 4. Designer preview behavior

The Designer continues to resolve preview text through the same registry/resolver/formatter path used by normal field placement. Build 018.1 simply gives that path a complete representative model.

As a result, active fields should show meaningful preview values rather than `[blank]` during ordinary Designer layout work.

Examples include:

- `Seattle Mariners`
- `86-65`
- `Logan Gilbert`
- `14-7`
- `3.11`
- `.841`
- `.287/.352/.489`
- `8`
- `Pat Hoberg`

A real generated scorecard still uses the selected game's actual hydrated data. Representative values are not substituted when live values are missing.

## 5. Description/tool-tip foundation

The current Palette now makes field descriptions/example values available as native hover tooltips for direct field items and Starting Pitcher child fields where the browser supports them.

This is intentionally lightweight. Build 018.1 does not design the future Custom Fields browser.

The intended later workflow is:

1. New Scorecard offers **Standard Fields** or **Custom Fields**.
2. Standard Fields uses fields marked `visibilityTier: standard`.
3. Custom Fields starts with Standard fields selected, allows the user to add any active Custom field, and allows Standard fields to be unselected.
4. The Custom selector can show the concise field label plus an example value.
5. An information icon/tap/hover surface can expose `description` without creating a wall of explanatory text.
6. When appropriate, a live value from the currently selected game may later replace the static example, with `exampleValue` remaining the deterministic fallback.

That UI remains future work.

## 6. Test strategy

Build 018.1 intentionally separates automated verification from manual acceptance.

### Automated verification

`tests/build0181.test.mjs` verifies that every active catalog definition:

- has a valid Standard/Custom visibility tier;
- has a nonblank `description`;
- has a nonblank `exampleValue`;
- resolves against the representative sample model;
- formats to visible text rather than blank;
- remains available through the registry metadata helper functions.

The test also verifies representative values for team identity, Starting Pitcher W-L, lineup position number, Slash Line, bullpen W-L, and umpire role.

### Manual acceptance

The human acceptance test is intentionally short:

- [ ] Open the Designer and browse several Game, Team, Starting Pitcher, Lineup, Bench, Bullpen, and Umpire fields.
- [ ] Confirm preview text now shows representative baseball values instead of a wall of `[blank]` placeholders.
- [ ] Confirm sample values look plausible and make the field's meaning understandable.
- [ ] Hover field items / Starting Pitcher child fields on desktop and confirm descriptive tooltip text is useful where supported.
- [ ] Generate a PDF for an actual selected game and confirm generated output uses **real game data**, not representative sample data.
- [ ] Confirm a legitimately unavailable live field remains blank rather than being filled with its `exampleValue`.
- [ ] Confirm existing Build 017/018 layouts still open and generate normally.

## 7. Changed files

- `index.html` - Build 018.1 identity and `app.js` cache key.
- `js/app.js` - imports the shared representative sample model; exposes field metadata in lightweight Palette tooltips.
- `js/field-registry.js` - adds `description` and `exampleValue` metadata plus lookup helpers.
- `js/sample-data.js` - new comprehensive representative Designer/test model.
- `tests/build0181.test.mjs` - automated metadata and representative-data coverage.
- `docs/BUILD_018_1_IMPLEMENTATION.md` - this implementation and acceptance contract.
- `docs/FIELD_REGISTRY.md` - registry metadata contract update.
- `docs/DESIGNER_COMPLETION_INVENTORY.md` - records representative preview data/catalog metadata foundation.

`README.md` remains intentionally unchanged.

## 8. Automated regression set

Run from the repository root:

```bash
node tests/build017.test.mjs
node tests/build0172.test.mjs
node tests/build0173.test.mjs
node tests/build0174.test.mjs
node tests/build018.test.mjs
node tests/build0181.test.mjs
```

All six should pass before browser acceptance testing.

## 9. Explicitly deferred

Build 018.1 does not implement:

- the New Scorecard Standard/Custom selection screen;
- persistent per-layout enabled-field selections;
- a full searchable Custom Fields browser;
- live-current-game values inside that future selector;
- mobile-specific information-popover UI;
- automatic test-layout generation containing every field;
- any new MLB API request solely for sample/preview purposes.

Those features can consume the metadata established here without changing canonical field IDs.
