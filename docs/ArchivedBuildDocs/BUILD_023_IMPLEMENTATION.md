# Scorecard Studio — Build 023 Implementation

**Baseline:** v0.2.0 Build 022.3 (accepted)  
**Milestone:** v0.2.0 Designer completion  
**Purpose:** Stabilize a deterministic fictional Representative Data fixture and make Designer Test PDF generation independent of live game selection.

## Scope

Build 023 establishes Representative Data as the Designer's permanent test fixture. The Designer is for layout authoring and validation; real game-day scorecards are generated elsewhere in the application.

### Fictional Representative Data

All recognizable real teams, players, managers, umpires, and venue names in the representative model and field-catalog examples are replaced with fictional equivalents. The fixture intentionally exercises layout differences rather than trying to imitate a particular real game.

The two fictional clubs are **Lakeview Foxes** and **Grand Valley Copperheads**. The fixture includes deliberately varied player/person names (short, long, accented, apostrophe, hyphen/compound, initials, and suffix cases), mixed single/double-digit jersey numbers, L/R/S hitters, L/R pitchers, and contrasting manager-name lengths.

Collection depths remain the accepted stress-test sizes:

- 9 starting-lineup players per team
- 6 bench players per team
- 14 bullpen pitchers per team
- 1 starting pitcher per team
- 6 umpires

The fictional venue is **Harbor Field at Crescent Bay**, deliberately sized as a long venue-name stress case comparable to the longest current MLB regular-season ballpark names.

Representative Data remains deterministic. It is not randomized at runtime; the same layout should always preview against the same fixture.

### Generate Test PDF

`Generate Test PDF` now always renders `DESIGNER_SAMPLE_MODEL`.

It no longer:

- requires a game to be selected on Home;
- hydrates live supplemental pregame data;
- changes behavior based on today's lineups or game availability; or
- uses a selected live game to name the Designer test output.

Test filenames use the fictional matchup and end in `_TEST.pdf` so the output is visibly distinct from a real game-day scorecard.

Real game-day PDF generation remains outside the Designer workflow.

## Remaining v0.2.0 roadmap

1. **Build 024 — Designer Workflow & Inspector Cleanup** — progressive reveal, Text Template/name-format parity and blank-value cleanup, compact Inspector/header work, toolbar Copy/Paste, delete-path consistency, helper-text/footer cleanup.
2. **Build 025 — Field Palette & Layout Settings** — dark-theme settings redesign, Standard/Custom palette selection, custom field picker, conditional-format toggles, palette collapse behavior, Umpire Crew consolidation.
3. **Build 026 — Text Overflow & Fit Controls** — evaluate and implement an intentional overflow policy such as truncate and/or shrink-to-fit with a defined maximum width/minimum size; evaluate wrapping separately.
4. **Build 027 — v0.2.0 Designer Completion / Release Review** — fresh-layout regression, persistence/reload, documentation reconciliation, final defect cleanup and release readiness.

## Acceptance focus

- Designer preview and Test PDF show only the fictional fixture.
- Test PDF can be generated with no game selected on Home.
- Test PDF placement/formatting remains unchanged from Build 022.3.
- Lineup/bench/bullpen/umpire maximum representative depths remain populated.
- Representative names visibly exercise short and long text cases.
- Real game-day workflows outside Designer remain untouched.

## Changed/new files

- `app-meta.json`
- `index.html`
- `js/app.js`
- `js/field-diagnostic.js`
- `js/field-registry.js`
- `js/sample-data.js`
- `tests/build023.test.mjs`
- `docs/AI.md`
- `docs/DESIGNER_COMPLETION_INVENTORY.md`
- `docs/BUILD_023_IMPLEMENTATION.md`

`README.md` is intentionally unchanged.
