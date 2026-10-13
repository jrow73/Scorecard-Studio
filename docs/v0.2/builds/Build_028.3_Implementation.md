# Build 028.3 — Formatting Card UI

## Scope

This decimal build is intentionally limited to the Designer Inspector **Formatting** card. The accepted Build 028.2 Date Format and palette-state fixes are preserved unchanged.

## Changes

- Keeps **Formatting** as a sibling card beneath **Selected Item**.
- Uses the agreed upper-right state indicator:
  - `□` when collapsed.
  - `−` when expanded.
- The whole Formatting header remains clickable to expand/collapse.
- Formatting starts collapsed when the Designer is opened and keeps its open/closed state while the user moves among selected items during that Designer session.
- Places **X (pt)** and **Y (pt)** side-by-side in one compact position row.
- Compresses Alignment and typography controls to reduce vertical space.
- Groups the formatting controls using simple divider lines rather than additional nested cards.
- Moves **Current Defaults** down next to **Restore Defaults**:
  - divider above Current Defaults,
  - Current Defaults on its own row,
  - Restore Defaults on its own row,
  - divider below that group before Shrink to Fit.
- Keeps **Shrink to Fit**, **Name format**, and **Date format** within Formatting.

## Explicitly deferred from this pass

- Moving Text Template editor / Preview / Insert Field controls into Selected Item.
- Individual Placement workflow changes.
- Modal styling changes.

Those remain separate focused acceptance slices.

## Acceptance checks

1. Select a normal mapped field and confirm Selected Item and Formatting render as distinct sibling cards.
2. Formatting is collapsed on first entry to Designer.
3. Click anywhere on the Formatting header; it expands and the upper-right indicator changes from `□` to `−`.
4. Select several different mapped items while Formatting is open; it remains open. Collapse it and repeat; it remains collapsed.
5. X and Y appear side-by-side and each label/input remains on one line.
6. Alignment and typography controls use the compact layout.
7. Current Defaults and Restore Defaults appear as separate rows between divider lines.
8. Shrink to Fit and field-specific presentation controls continue to function as before.
