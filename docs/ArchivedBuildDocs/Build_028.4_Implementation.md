# Build 028.4 — Formatting Header / Item Action Polish

## Scope

This decimal build is intentionally limited to two UI corrections discovered during Build 028.3 acceptance. No formatting behavior, field logic, palette behavior, or PDF rendering logic is changed.

## Changes

- Keeps **Create New Item** and **Remove Item** at the same compact size whether Formatting is collapsed or expanded.
  - Buttons do not grow to fill the Selected Item card.
  - Compact padding, 12 px text, and single-line labels are enforced consistently.
- Removes the extra Build 028.3 `□` / `−` state indicators from the Formatting header.
- Retains the existing standard chevron as the only expand/collapse indicator.
- The full Formatting header remains clickable.

## Acceptance checks

1. Select a collection child that exposes Create New Item / Remove Item.
2. With Formatting collapsed, confirm both buttons use the compact Selected Object-style sizing and remain on one line when space permits.
3. Expand Formatting and confirm neither button changes size.
4. Collapse and expand repeatedly; button sizing remains unchanged.
5. Confirm Formatting shows only the existing chevron state indicator — no trailing square when collapsed and no trailing minus when expanded.
6. Confirm clicking anywhere on the Formatting header still toggles the section.

## Deferred / unchanged

All other Build 028 cleanup items remain unchanged and are intentionally outside this patch.
