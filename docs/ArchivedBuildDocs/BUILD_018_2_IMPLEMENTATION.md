# Scorecard Studio - Build 018.2 Implementation

**Milestone:** v0.2.0-dev  
**Baseline:** Build 018.1  
**Theme:** Live field-coverage diagnostic and final field-catalog verification

## 1. Objective

Build 018.2 adds an on-screen developer diagnostic that resolves every active field in the Scorecard Studio catalog against the currently selected real game. The purpose is to separate three questions that were previously difficult to distinguish during acceptance testing:

1. Is the field defined and selectable?
2. Can the field resolve and format representative test data?
3. Can the field actually obtain a live value from the selected MLB Game Pack and any required supplemental source?

The diagnostic is a temporary/developer-facing screen. It is not the future user-facing Standard/Custom field-selection interface, although it deliberately uses the same registry metadata that interface can later consume.

## 2. Field Coverage Diagnostic screen

A new sidebar entry, **Field Diagnostic (Dev)**, opens the live diagnostic for the game currently selected on Home.

For every active `catalog: true` registry definition the table shows:

- Category
- Field label and canonical field ID
- Standard/Custom tier
- Deterministic representative `exampleValue`
- Live value from the selected game
- Coverage for repeated collections
- Required source(s)
- Diagnostic status

Field descriptions are available from the field-name tooltip, while the status tooltip provides the resolver/source reason where applicable.

### Filters

The diagnostic can be filtered by:

- free-text search across label, ID, category, description, example, and live value;
- Standard vs Custom tier;
- diagnostic status.

## 3. Diagnostic status contract

The diagnostic uses these statuses:

- **Available** - the field resolves and formats successfully for the live game.
- **Partial** - some but not all applicable repeated members resolve, or a composite resolver reports partial data.
- **Missing** - the required source loaded, but no live value is available for this game/member.
- **Source unavailable** - a required source such as Coaches or Standings did not load.
- **Error** - field resolution is unsupported or reports an error.

A blank value is therefore not automatically treated as a defect. The diagnostic exposes enough context to distinguish legitimate absence from missing source hydration or resolver failure.

## 4. Repeated-field coverage

Repeated fields are evaluated across every applicable live collection member, rather than only slot 1.

Coverage is displayed as:

`resolved members / applicable members`

Examples:

- `9/9` - every posted lineup player has the value.
- `8/9` - one posted lineup player is missing the value.
- `0/4` - four applicable members exist but none resolve.
- `0/0` - the collection has no applicable live members.

This makes role-specific gaps visible. For example, the original Build 018.1 Position Number logic produced only 8/9 coverage for a nine-player lineup containing a DH.

## 5. Supplemental source hydration

Build 018.2 consolidates selected-game hydration for both PDF generation and the diagnostic.

The shared hydration path now inspects the selected field IDs and loads required supplemental sources before normalization:

- Game Pack - already selected/fetched game data;
- Coaches API - when manager fields require it;
- Standings API - when standings fields require it.

This closes an important Build 018 gap: standings fields could exist in the catalog and render on Game Day while still being blank during generated-PDF resolution because PDF hydration did not request standings data.

Representative/example values are never substituted into live output.

## 6. Build 018.1 acceptance fixes included

### 018.1-01 - Designated Hitter Position Number

The derived Position Number field now returns:

- P = `1`
- C = `2`
- 1B = `3`
- 2B = `4`
- 3B = `5`
- SS = `6`
- LF = `7`
- CF = `8`
- RF = `9`
- DH = `DH`

Because the field may legitimately contain either a number or `DH`, its active registry value type is text rather than integer.

The same rule applies to representative sample data and normalized live Game Pack data.

### 018.1-02 - Representative Boxscore Name behavior

Representative `boxscoreName` values now mimic MLB source behavior more realistically:

- normal cases default to a recognizable surname such as `Rodríguez`;
- occasional disambiguated examples such as `Lowe, B` and `Lowe, J` demonstrate that the source can use a more specific compact identifier when needed.

Boxscore Name remains a source-backed Name Format option, not an application-generated `Last, F` formatting rule.

## 7. Automated verification

`tests/build0182.test.mjs` verifies:

- representative DH Position Number resolves as `DH`;
- normalized live DH Position Number resolves as `DH`;
- representative Boxscore Name normally uses surname-only behavior and includes deliberate source-style disambiguation examples;
- the diagnostic produces one row for every active catalog field;
- repeated Position Number coverage is complete across a representative nine-player lineup including a DH;
- diagnostic summary states are valid;
- the on-screen diagnostic UI is present;
- the shared selected-game hydration path requests standings when required.

The Build 018.1 regression test is loosened only enough to permit later Build 018.x cache/build labels while preserving its original field-metadata assertions.

## 8. Manual acceptance test

### Diagnostic screen

- [ ] Select a real game on Home and open **Field Diagnostic (Dev)**.
- [ ] Confirm the selected matchup/date appears at the top.
- [ ] Confirm Game Pack, Coaches API, and Standings API source pills show their actual load state.
- [ ] Confirm the table displays the active catalog with Category, Field, Tier, Example, Live Value, Coverage, Source, and Status columns.
- [ ] Confirm Standard/Custom filtering works.
- [ ] Confirm status filtering works.
- [ ] Confirm free-text search works by field label or field ID.
- [ ] Hover a field name and confirm its description is available.
- [ ] Hover a non-Available status and confirm a useful reason is available where applicable.

### Live-data coverage

- [ ] Scan the **Standard** fields first. Any Standard field marked Missing, Partial, Source unavailable, or Error should be reviewed before Build 018 is considered closed.
- [ ] Then scan Custom fields. Determine whether blanks are legitimate game-specific absence or indicate a source/resolver gap.
- [ ] For repeated lineup fields, confirm coverage reflects the number of posted players (for example `9/9`).
- [ ] Confirm a lineup containing a DH shows complete Position Number coverage and a live value sample rather than failing solely because of the DH.

### Regression / output

- [ ] Generate a real-game PDF containing at least one standings field and confirm the live standings value now populates when the Standings API loaded.
- [ ] Confirm representative values never fill a legitimately unavailable live field in the generated PDF.
- [ ] Confirm Boxscore Name preview examples look source-like rather than mechanically formatting every player as `Lastname, F`.
- [ ] Confirm existing Build 017/018 layouts still open and generate normally.

## 9. Changed files

- `index.html` - Build 018.2 identity, sidebar diagnostic entry, diagnostic screen, cache keys.
- `css/styles.css` - diagnostic table, filters, statuses, and responsive layout.
- `js/app.js` - diagnostic loading/rendering/filtering plus shared supplemental hydration used by PDF generation.
- `js/field-diagnostic.js` - new pure diagnostic row/coverage/status helpers.
- `js/normalize.js` - DH Position Number behavior and more accurate supplemental-source flags.
- `js/sample-data.js` - DH representative Position Number and source-like Boxscore Name examples.
- `js/field-registry.js` - Position Number metadata/type updated for DH semantics.
- `tests/build0181.test.mjs` - forward-compatible Build 018.x cache/build assertion.
- `tests/build0182.test.mjs` - new regression and diagnostic tests.
- `docs/BUILD_018_2_IMPLEMENTATION.md` - this implementation and acceptance contract.
- `docs/FIELD_REGISTRY.md` - Build 018.2 live-diagnostic/Position Number contract.
- `docs/DESIGNER_COMPLETION_INVENTORY.md` - records live-data verification as the current Build 018 closure step.

`README.md` remains intentionally unchanged.

## 10. Automated regression set

Run from the repository root:

```bash
node tests/build017.test.mjs
node tests/build0172.test.mjs
node tests/build0173.test.mjs
node tests/build0174.test.mjs
node tests/build018.test.mjs
node tests/build0181.test.mjs
node tests/build0182.test.mjs
```

All seven should pass before browser acceptance testing.

## 11. Explicitly deferred

Build 018.2 does not implement:

- the user-facing New Scorecard Standard/Custom selector;
- persistent per-layout field enable/disable selections;
- a production field-browser/help screen;
- automatic decisions about whether a missing Custom field should be removed from the product;
- new MLB endpoints beyond the already established Game Pack, Coaches, and Standings sources;
- field dimensions, Game Type, Opponent Batting Average, or other post-v1 possibilities already deferred during Build 018 review.

The diagnostic is intended to give us the evidence needed to make those later decisions without guessing.
