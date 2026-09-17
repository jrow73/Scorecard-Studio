# Build 017.4 Implementation

## Purpose

Build 017.4 is a focused Designer hotfix following Build 017.3 acceptance testing. It resolves two remaining workflow problems without changing the underlying pregame-data model or the Build 017.3 Inspector rules.

## 1. Starting Pitcher Record Layout semantics

A Starting Pitcher Record Layout represents exactly one record. It therefore uses one anchor and does not ask the user to choose a Repeated Layout arrangement.

### Required behavior

- Selecting **Record Layout** for Away or Home Starting Pitcher must not reveal Vertical list, Horizontal list, Grid, slot-count, or grid-dimension controls.
- A Record Layout is created as a one-record, one-anchor container.
- After its anchor is placed, the user may add any ordered mixture of **Field** and **Text Template** child content.
- Each child retains its own alignment and font-size configuration. Player-name fields retain capability-gated Name Format behavior.
- Example valid record content:
  1. Field: Jersey #, centered, 10 pt
  2. Text Template: `([Throws]) [F. Lastname], ([W-L Record] | [ERA])`, left, 10 pt
  3. Field: Games Started, right, 10 pt

### Repeated Layout distinction

Repeated Layouts continue to support Vertical list, Horizontal list, and Grid because those controls define how multiple records/slots are distributed. Record Layouts do not use those controls.

## 2. Persistent Place New Item action

`Place New Item` remains a child-workspace action and must not return to the top Selected Object parent card. However, it must remain naturally available while the user is editing an existing child of a multi-child container.

### Required behavior

For a placed Repeated Layout or Record Layout with established geometry:

- Parent Edit Layout workspace: **Place New Item** is available below the parent editor.
- Existing child Selected Item workspace: **Place New Item** is also available below the child editor.
- Clicking it transitions directly into the scoped Place New Item workflow for that same parent.
- After placing a child, the user can continue the natural add/edit/add loop without first reopening Edit Layout.
- The child workspace remains strictly scoped to the selected parent.

## Preserved Build 017.3 behavior

Build 017.4 must preserve all accepted Build 017.3 fixes:

- Name Format is shown only for exact fields with the player-name formatting capability.
- Text Template Insert Field labels and inserted tokens are context-aware inside record/collection contexts.
- `Place New Item` is not a parent-card action.
- Unrelated repeated layouts and their Remove Item actions do not leak into the active child workspace.
- Place New Item uses progressive reveal.
- Branch-specific controls remain hidden until Content Type is selected.
- Required configuration begins unselected, and Add Slot Content remains disabled until all required choices are complete.

## Acceptance checks

1. Choose Starting Pitcher -> Record Layout. No Arrangement, Number of Slots, Grid Rows, or Grid Columns controls appear.
2. Place the Starting Pitcher record anchor. Add a Field, then a Text Template, then another Field. All remain children of the same single record.
3. Select an existing child in a Bench, Bullpen, Lineup, Umpire, or Starting Pitcher Record Layout. `Place New Item` remains visible below the child editor.
4. Click `Place New Item` from the child editor. The new-item workflow remains scoped to that same parent.
5. Recheck Build 017.3 Name Format, contextual-token, scoping, and progressive-reveal behavior for regressions.

## Files changed

- `index.html` - Build 017.4 identity/cache-busting.
- `js/app.js` - Record Layout workflow gating and persistent child-workspace Place New Item action.
- `css/styles.css` - hard UI guard preventing repeated-arrangement controls from displaying during Record Layout creation.
- `tests/build0174.test.mjs` - targeted Build 017.4 regression checks.
- `docs/ArchivedBuildDocs/BUILD_017_4_IMPLEMENTATION.md` - implementation and acceptance specification.
- `docs/ArchivedBuildDocs/BUILD_017_4_TEST_REPORT.md` - source/regression test results.
