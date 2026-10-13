# Build 032.3a — Starting Pitcher Record Layout Terminology

## Scope

Follow-up terminology correction to Build 032.3 for the Starting Pitcher Record Layout workflow. No data-model or placement behavior changes are included.

## Changes

- Record Layout placement now prompts the user to select the **row** where the record belongs, rather than an arbitrary point on the scorecard.
- Adding content to an existing Starting Pitcher Record Layout now prompts for the **point on the row** where the item belongs.
- The Record Layout child-workspace heading now says **Add item to the row**.
- The Record Layout usage description now says **Arrange several attributes on one row**.
- Internal `record`, `slot`, and `anchor` implementation terminology remains unchanged.

## Acceptance checks

1. Start a Home or Away Starting Pitcher Record Layout. The placement banner reads: `Click the row where the record should be placed on the scorecard. Press Escape to cancel.`
2. Add a field or Text Template to that Record Layout. The placement banner makes clear that the selected point is **on the row**.
3. The child-item workspace says **Add item to the row**.
4. Starting Lineup, Bench, Bullpen, grid, horizontal, and other Build 032.3 terminology remains unchanged.
5. Existing Record Layout placement and repeat/content behavior is unchanged.
