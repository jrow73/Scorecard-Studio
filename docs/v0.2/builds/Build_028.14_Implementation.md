# Build 028.14 — Bench/Bullpen Collection Sorting

## Scope

This decimal build adds optional per-block sorting for Bench and Bullpen Repeated Layouts only.

### UI

- Edit Layout shows a compact sort dropdown for Bench/Bullpen blocks.
- Default state is `Sort: None` and preserves source order.
- Choosing a sort field reveals compact ascending/descending triangle controls.
- The active direction is visually emphasized; the inactive direction remains available.
- Sorting is stored on the individual repeated-layout block, so separate blocks may use different orders.

### Sort field behavior

- Sort choices are derived from the active catalog fields for the selected Bench/Bullpen collection rather than a hard-coded preset list.
- Integer and decimal fields sort numerically.
- Text fields sort case-insensitively.
- Jersey number is treated numerically when possible.
- Player Name sorts by Last Name.
- Composite-style display fields such as W-L and Slash Line are excluded because their natural sort semantics are ambiguous.
- Missing/blank values always sort to the bottom in either direction.
- Equal values preserve original source order.

### Rendering contract

Sorting changes only which source collection row is assigned to each displayed repeated-layout slot. It does not reorder or mutate the normalized source data.

The same display-slot → source-slot selector is used for:

- ordinary fields,
- Text Template token resolution,
- mixed field/template slots,
- conditional handedness formatting,
- Designer Representative Data preview,
- Test PDF / live PDF generation.

This keeps every child in a displayed row bound to the same Bench/Bullpen player.

## Explicit non-scope

- Starting Lineup remains in batting order and receives no sort control.
- Starting Pitcher and Defensive Alignment are unchanged.
- No sorting is added to Umpires or other collections in this build.
- No new registry fields are introduced.
