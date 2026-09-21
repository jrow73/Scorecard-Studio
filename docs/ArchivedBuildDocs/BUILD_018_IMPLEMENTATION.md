# Scorecard Studio - Build 018 Implementation

**Milestone:** v0.2.0-dev  
**Baseline:** committed Build 017 Final (through 017.4)  
**Theme:** Field catalog completion, Standard/Custom metadata, compatibility-safe cleanup

## 1. Objective

Build 018 turns the completed field review/audit into a finite runtime field catalog. It closes accepted pregame-field gaps without redesigning the Build 017 Designer object model.

The key architectural change is to separate:

- **support/resolution** - whether a field ID can still resolve; from
- **active catalog exposure** - whether the Designer should continue to advertise the field; from
- **future default exposure** - whether an active field is Standard or Custom.

This allows existing Build 017 layouts to keep rendering older pitching fields while the active v1 field catalog becomes intentionally smaller.

## 2. Registry metadata

Every active selectable field has:

```text
availability: supported
catalog: true
visibilityTier: standard | custom
```

Compatibility-only Build 017 fields have:

```text
availability: supported
catalog: false
visibilityTier: null
```

`getSupportedFields()` remains the compatibility/resolution view. `getCatalogFields()` is the user-facing active catalog view. The current Designer uses the active catalog. The future New Scorecard Standard/Custom selector is explicitly deferred.

## 3. Implemented field additions

### Game / venue / weather / umpires

Added active fields for Day/Night, game-of-day Game Number, venue city/state/country/capacity/turf/roof, and fixed Home Plate/First/Second/Third Base umpire names. Weather Summary remains Standard; component weather values are Custom.

Venue Time Zone remains normalized application metadata only and is not registered as a scorecard field.

### Team / record / personnel

Added League Name, Division Name, season-to-date Games Played, Manager Jersey Number, and the currently normalized standings scalars (division/league/wild-card rank, division games back, streak, Last 10 W/L/display). Standings fields remain dependent on standings hydration and render blank when unavailable.

Division Leader is not exposed in Build 018 because its boolean display convention remains undecided. League/Wild Card games-back fields are not exposed until exact source semantics are verified.

### Player position

Added Today's Position Full Name and derived Today's Position Number for lineup players. Defensive-number mapping is P=1, C=2, 1B=3, 2B=4, 3B=5, SS=6, LF=7, CF=8, RF=9. DH and unknown/non-defensive roles resolve blank.

Primary Position remains distinct from Today's Position. Primary Position abbreviation/name are exposed for lineup and bench with the accepted tiers.

### Batting

Lineup and Bench now share the accepted active batting family:

- AVG - Standard
- OBP, SLG, OPS, HR, RBI, Games Played, Plate Appearances, Stolen Bases, Slash Line - Custom

Plate Appearances and Stolen Bases are normalized from the existing season batting object. Slash Line is derived locally from AVG/OBP/SLG and resolves blank unless all three components are present.

### Starting Pitcher

Active catalog:

- Standard: Player Name, Jersey #, Throws, Games Started, W-L, ERA
- Custom: Wins, Losses, WHIP

Previously exposed Build 017 pitching leaves continue to resolve with their same field IDs but are `catalog: false` so saved layouts do not break.

### Bullpen

Active catalog:

- Standard: Pitcher Name, Jersey #, Throws, W-L, ERA, WHIP
- Custom: Games Started, Wins, Losses

W-L is normalized locally from Wins/Losses. Build 017 bullpen IP, SO, Saves, and Holds remain compatibility-only and resolvable.

### Player Name Format

Added **Boxscore Name** as the sixth Player Name Format choice. If the requested source-backed variant is unavailable, formatting falls back to Full Name exactly like the other name variants. No name parts are manufactured by splitting Full Name.

## 4. Designer catalog behavior

User-facing field selectors now consume `getCatalogFields()` or catalog-filtered record-context fields. Compatibility-only fields therefore do not appear as new choices.

Legacy resolution paths still use the complete supported registry so older mappings and older field tokens remain functional.

No Standard-only filtering is applied yet. Both Standard and Custom active fields remain visible in the current Build 018 Designer. `visibilityTier` is metadata for the later scorecard setup workflow.

## 5. Home/Away symmetry

Side-specific fields are generated from shared builders wherever practical. Build 018 tests assert symmetry for Starting Pitcher, Lineup, Bench, and Bullpen active catalogs.

## 6. Explicitly deferred / out of scope

Build 018 does not implement:

- the New Scorecard Standard-vs-Custom field-selection UI;
- Game Type;
- venue dimensions;
- Venue Time Zone as a Designer field;
- coach collections;
- Opponent Batting Average;
- player pronunciation;
- a new dedicated defensive-alignment data family;
- a full Division Standings block;
- unresolved Division Leader display behavior;
- unresolved League/Wild Card games-back source semantics;
- static/conditional color;
- shrink-to-fit/wrapping;
- Undo/Redo;
- synthetic collection filling;
- cloud synchronization.

The existing second-lineup/Individual Placement workflow remains the supported defensive-diamond method for now.

## 7. Changed files

- `index.html` - Build 018 identity/cache keys.
- `js/app.js` - active-catalog use in Designer selectors; Build 018 cache keys.
- `js/field-registry.js` - Standard/Custom metadata, active catalog API, accepted field additions, compatibility-only flags.
- `js/normalize.js` - PA, SB, Slash Line, bullpen W-L, derived defensive position number.
- `js/formatter.js` - Boxscore Name format.
- `js/slot-content.js` - optional catalog-only record-context filtering while preserving compatibility resolution.
- `tests/build018.test.mjs` - Build 018 acceptance/regression coverage.
- `tests/build0174.test.mjs` - permits later build identity while retaining 017.4 functional regression checks.
- `docs/BUILD_018_IMPLEMENTATION.md` - this implementation/acceptance contract.
- `docs/BUILD_018_FIELD_REVIEW_CHECKLIST.md` - finalized product decisions.
- `docs/BUILD_018_FIELD_COVERAGE_AUDIT.md` - technical reconciliation.
- `docs/FIELD_REGISTRY.md`, `docs/GAME_PACK_FIELD_MATRIX.md`, `docs/PREGAME_DATA_INVENTORY.md`, `docs/AI.md` - Build 018 reconciliation notes.

`README.md` is intentionally unchanged.

## 8. Acceptance test

### Registry / catalog

- [ ] Every active catalog field has `visibilityTier` = `standard` or `custom`.
- [ ] `getCatalogFields()` excludes `catalog: false` compatibility entries.
- [ ] `getSupportedFields()` and direct `resolveField()` still recognize compatibility-only Build 017 IDs.
- [ ] Current Designer field selectors do not offer compatibility-only fields.
- [ ] Standard and Custom fields are both visible in Build 018; future setup filtering is not accidentally implemented early.

### Game / venue / team

- [ ] Game Number resolves as game-of-day/doubleheader number.
- [ ] Team Games Played resolves independently as season-to-date count.
- [ ] Venue city/state/country/capacity/turf/roof resolve when supplied.
- [ ] Venue Time Zone is not a registered Designer field.
- [ ] League, Division, Manager Number, and fixed umpire fields resolve when supplied.
- [ ] Missing standings hydration produces blanks rather than fabricated data or generation failure.

### Player fields

- [ ] Today's Position Abbreviation remains Standard for lineup.
- [ ] Today's Position Full Name and Position Number are available as Custom.
- [ ] Position Number maps defensive positions 1-9 correctly and leaves DH/unknown blank.
- [ ] Primary Position remains distinct from Today's Position.
- [ ] Bench exposes Primary Position as Standard.

### Batting / pitching

- [ ] Lineup and Bench expose identical active batting-stat families and tiers.
- [ ] PA and SB resolve from season batting stats.
- [ ] Slash Line renders `AVG/OBP/SLG` only when all components exist.
- [ ] Starting Pitcher active stats are exactly GS, W-L, ERA, W, L, WHIP with accepted tiers.
- [ ] Bullpen active stats are exactly W-L, ERA, WHIP, GS, W, L with accepted tiers.
- [ ] Legacy SP/Bullpen compatibility fields still resolve in existing mappings.

### Names / symmetry / regression

- [ ] Boxscore Name appears in all player-name format controls.
- [ ] Missing Boxscore Name falls back to Full Name.
- [ ] Home/Away field families remain symmetric.
- [ ] Existing Build 017 Record Layout, Repeated Layout, templates, Individual Placement, and PDF generation remain functional.
- [ ] Existing Build 017 mappings load without migration failure.
- [ ] Build 017 regression tests (excluding obsolete fixed build-number expectations) and Build 018 tests pass.

## 9. Automated verification included in package

Run from the repository root:

```bash
node tests/build017.test.mjs
node tests/build0172.test.mjs
node tests/build0173.test.mjs
node tests/build0174.test.mjs
node tests/build018.test.mjs
```

All five should pass before browser acceptance testing.
