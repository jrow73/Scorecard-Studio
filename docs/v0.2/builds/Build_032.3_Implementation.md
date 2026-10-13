# Build 032.3 — Designer Terminology Cleanup

## Purpose

Replace user-facing implementation terms such as **slot** and **anchor** with language that describes what the scorekeeper is actually doing. Internal data structures, selectors, geometry modes, and helper names continue to use the existing implementation terminology.

## Changes

- Repeated-layout size controls are now orientation-aware:
  - vertical list: **Number of rows**
  - horizontal list: **Number of columns**
  - grid: existing **Grid rows / Grid columns** controls remain unchanged.
- **Slot field** is now simply **Field**.
- Repeated-layout placement instructions are orientation-aware:
  - vertical: **top row / bottom row**
  - horizontal: **leftmost column / rightmost column**
  - grid: **top-left position / bottom-right position**
  - one-record layout: place the **record** at a point.
- Adding content to an existing repeated layout now uses **Add item to the row**, **Add item to the column**, **Add item to the position**, or **Add item to the record** as appropriate.
- Field/Text Template placement instructions now refer to the placement **point** rather than an alignment anchor.
- Repeated-layout overlays/tooltips now identify **row**, **column**, or grid **row/column** positions rather than slot numbers.
- Repeated-layout summaries now use **N-row list** / **N-column list** rather than N-slot list.
- Delete confirmations, placement success/error messages, and PDF-generation notices no longer expose slot-content terminology.
- The legacy Individual Placement fallback label now says **Position N** rather than **Slot N**.

## Deliberately unchanged

Internal code and persisted-layout structures continue to use names such as `slot`, `anchor`, `slotRows`, `slotColumns`, `slot-grid-v1`, and related helper names. Build 032.3 is a user-interface vocabulary cleanup, not a schema migration.

## Manual acceptance checks

1. Create a vertical repeated layout and confirm the control says **Number of rows** and placement prompts request the **top row** and **bottom row**.
2. Create a horizontal repeated layout and confirm **Number of columns**, **leftmost column**, and **rightmost column** wording.
3. Create a grid and confirm **top-left position** / **bottom-right position** wording.
4. Add a Field or Text Template to each arrangement and confirm the prompt says to click a **point** and explains where the item will repeat.
5. Create/edit a Starting Pitcher Record Layout and confirm no one-record **slot** terminology is displayed.
6. Check repeated-layout overlays, summaries, delete confirmation, and PDF-generation notices for natural row/column/item wording.
7. Confirm existing layouts still open and render without migration or geometry changes.

## Automated checks

`tests/build0323.test.mjs` verifies the new orientation-aware wording and guards against the principal retired user-facing phrases returning.
