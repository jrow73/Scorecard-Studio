# Build 028.5 — Inspector Formatting Width Containment

## Scope

This is a deliberately narrow follow-up to Build 028.4. It fixes one regression only: opening the Inspector's Formatting section must not make the Inspector wider or introduce a horizontal scrollbar.

## Changes

- Prevented the Inspector column from exposing horizontal scrolling.
- Added `min-width: 0` / `max-width: 100%` containment to the Formatting card and its major control groups so children can shrink within the existing Inspector width.
- Allowed the compact typography toolbar to wrap when necessary rather than forcing all controls onto one row.
- Kept X/Y, Alignment, Current Defaults / Restore Defaults, Shrink to Fit, and field-specific formatting behavior unchanged.
- No changes were made to placement data, PDF generation, shrink-to-fit calculations, palette behavior, or selection workflows.

## Acceptance

1. Select an item and expand Formatting.
2. Confirm the Inspector retains its normal width and no left/right scrollbar appears at the bottom.
3. Confirm the right edges of X/Y, Alignment, font controls, Shrink to Fit, and Name/Date Format remain visible.
4. At narrower Inspector widths, typography controls may wrap to another row rather than overflow.
5. Collapse/re-expand Formatting and confirm the behavior remains stable.
