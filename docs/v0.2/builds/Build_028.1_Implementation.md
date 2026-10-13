# Build 028.1 — Focused Acceptance Fixes

Build 028.1 intentionally contains only two corrections identified during the first Build 028 acceptance pass.

## 1. Game Date format scope

The custom **Date format** control is available only when the selected field is **Game Date** (`game.date`). It no longer appears for unrelated Single Item fields.

Acceptance checks:
- Place Game Date as a Single Item: Date format is visible and retains Build 028 formatting behavior.
- Place a non-date Single Item such as Away Team — Location: Date format is not shown.
- Select an existing Game Date placement: Date format is shown.
- Select an existing non-Game-Date placement: Date format is not shown.

## 2. Palette expandable-row header alignment

Expandable palette rows now use an explicit chevron cell in the same structural header row as the placement checkmark, item name, and right-side status/instance count.

The intended order is:

`chevron | checkmark | item name | status`

This applies across the palette, including ordinary expandable items and record-style expandable items such as Starting Pitcher.

Acceptance checks:
- Chevron and checkmark remain on the same line as the item name.
- Instance count / status remains right-aligned on that same row.
- Closed rows show a right-pointing chevron; open rows show a down-pointing chevron.
- Verify across Game Information, Away/Home Team Information, Away/Home Players, and Text Template where applicable.

## Out of scope for 028.1

No additional Build 028 cleanup items are intentionally changed in this pass. Modal styling, Formatting-card restructuring, and remaining Individual Placement workflow polish stay queued for later focused decimal builds.
