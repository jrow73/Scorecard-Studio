# Scorecard Studio - Build 018.3 Implementation

**Baseline:** v0.2.0 Build 018.2  
**Purpose:** Close the final field-diagnostic acceptance findings, strengthen representative roster coverage for Designer stress-testing, and freeze the Build 018 field-catalog work.

---

## 1. Scope

Build 018.3 is a focused closure/hotfix build. It does not add new catalog fields or new Designer workflow. It resolves the four issues found during the Build 018.2 Field Diagnostic review, plus the final representative-data depth/realism finding discovered during acceptance, and records Build 018 field coverage as complete.

### 018.2-01 - Day / Night display parity

- Normalize live `dayNight` values to `Day` / `Night` for user-facing field output.
- Keep the representative example aligned with the same display convention.

### 018.2-02 - Fixed umpire representative names

- Replace placeholder examples such as `First Umpire`, `Second Umpire`, and `Third Umpire` with realistic person-name examples.
- Keep the repeated umpire collection semantics unchanged.

### 018.2-03 - Division representative value

- Use long-form representative division names (for example `American League West`) to match the normalized live value returned by the current source path.
- Do not add a separate abbreviated-division field in this build.

### 018.2-04 - Today's Position Full Name

- Derive the full posted-game position name from the specific posted abbreviation when recognized.
- Examples: `LF -> Left Field`, `CF -> Center Field`, `RF -> Right Field`.
- Preserve `player.primaryPosition.name` as source-backed broader roster semantics, where `Outfielder` is valid.
- Keep Position Number derivation unchanged, including `DH -> DH`.

### 018.3-05 - Representative roster depth and jersey-number realism

- Keep each representative Starting Lineup at 9 players.
- Expand each representative Bench to 6 players.
- Expand each representative Bullpen to 14 pitchers so a maximum-depth bullpen design can be previewed without synthetic `[blank]` rows.
- Expand the representative Umpire Crew to 6 officials, including left-field and right-field postseason-style roles.
- Keep each Starting Pitcher collection at 1.
- Use deterministic, non-sequential jersey numbers with a deliberate mix of single- and double-digit values across lineup, bench, and bullpen.
- Populate all added representative members with complete child data so repeated-layout previews remain useful through the final slot.

---

## 2. Implementation details

### Normalization

`js/normalize.js` now normalizes Day/Night display text and maps known posted position abbreviations to deterministic full names. The source-provided position name remains a fallback for unrecognized abbreviations.

### Representative catalog data

`js/sample-data.js` and `js/field-registry.js` now use representative values that mirror the live normalized display contract for Day/Night, fixed umpires, and division names. The shared sample model also carries 9 lineup players, 6 bench players, 14 bullpen pitchers, and a 6-person umpire crew, with deterministic mixed-width jersey numbers for layout testing.

### Cache/version identity

Build labels and module cache keys are advanced to `018.3` so browsers do not mix the final normalization code with cached Build 018.2 modules.

---

## 3. Acceptance

### Automated verification

`tests/build0183.test.mjs` verifies the four field-diagnostic findings plus representative-data depth/realism:

1. Live and representative Day/Night values resolve as title-cased display text.
2. Fixed umpire examples are realistic names rather than role placeholders.
3. Division examples use the long-form convention.
4. A live player whose posted position is `LF` but whose source `name` is generic `Outfielder` normalizes to Today's Position Full Name `Left Field`, while Primary Position remains `Outfielder`.
5. Representative collection depths are 9 lineup / 6 bench / 14 bullpen / 6 umpires, and lineup/bench/bullpen jersey samples contain mixed single- and double-digit non-sequential values.

All prior Build 017 through Build 018.2 regression suites must continue to pass.

### Manual acceptance

1. Open Field Diagnostic for a selected live game.
2. Confirm Day / Night example and live value use consistent display casing.
3. Confirm fixed umpire examples look like person names.
4. Confirm Division example values use the same long-form convention as live values.
5. For a lineup containing LF/CF/RF players, confirm Today's Position Full Name shows `Left Field`, `Center Field`, or `Right Field` even when MLB's source position name is generic `Outfielder`.
6. Confirm Primary Position Full Name may still display `Outfielder`.
7. Generate a PDF containing Position Abbreviation, Position Number, and Today's Position Full Name and confirm all three are semantically consistent.
8. In Designer preview, confirm all 14 bullpen slots, all 6 bench slots, and all 6 umpire slots show representative values rather than running out of sample members.
9. Confirm representative jersey numbers vary non-sequentially and include both single- and double-digit widths.

---

## 4. Build 018 closure

With Build 018.3 accepted, the Build 018 field-catalog effort is considered complete:

- active fields have Standard/Custom visibility metadata;
- descriptions and representative examples are available;
- representative data covers the active catalog and maximum intended repeated-layout preview depths;
- live field coverage is visible in the Field Diagnostic;
- supplemental standings data hydrates into PDF generation;
- repeated-field live coverage is verified;
- player position semantics are normalized for scorecard use.

The future user-facing Standard/Custom field-selection interface remains deferred to a later build.

---

## 5. Changed/new files

- `index.html`
- `js/app.js`
- `js/field-diagnostic.js`
- `js/field-registry.js`
- `js/normalize.js`
- `js/sample-data.js`
- `tests/build0181.test.mjs`
- `tests/build0182.test.mjs`
- `tests/build0183.test.mjs`
- `docs/BUILD_018_3_IMPLEMENTATION.md`
- `docs/FIELD_REGISTRY.md`
- `docs/DESIGNER_COMPLETION_INVENTORY.md`

`README.md` is intentionally unchanged.
