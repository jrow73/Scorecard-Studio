# Build 032.4b — Repeated-Record Text Template Label Consistency

## Scope

Correct the remaining creation-state labels used when adding a new Text Template item to Starting Pitcher Record Layout, Starting Lineup, Bench, or Bullpen repeated layouts.

## Changes

- Changed the initial repeated-record Text Template textarea label from **Text template** to **Editor**.
- Changed the initial repeated-record token action from **Insert Field** to **Insert into editor**.
- These controls are shared by Starting Pitcher Record Layout, Starting Lineup, Bench, and Bullpen, so the correction applies consistently to all four workflows.
- No token, placement, saved-layout, or PDF-rendering behavior changed.
- Defensive Alignment and generic Text Template workflows were already correct and are unchanged.

## Acceptance checks

1. Create or edit a Starting Pitcher Record Layout and choose **Text Template** for a new row item.
2. Confirm the textarea is labeled **Editor** immediately, before placement.
3. Confirm the token button reads **Insert into editor** immediately, before placement.
4. Repeat for Starting Lineup, Bench, and Bullpen.
5. Place and reopen each item; confirm the wording remains unchanged after placement.
6. Confirm generic Text Template and Defensive Alignment Text Template creation still show **Editor** / **Insert into editor**.
7. Confirm token insertion and placement behavior are unchanged.
