# Build 012 — Repeated Block Geometry

Status: **IMPLEMENTED — browser acceptance pending**

Build 012 generalizes the repeated-block engine introduced in Builds 010 and 011 so a repeated collection is no longer limited to a vertical list.

## Scope implemented

- Added three arrangement choices for newly created repeated blocks:
  - Vertical list (`N x 1`)
  - Horizontal list (`1 x N`)
  - Configurable grid (`rows x columns`)
- Grid capacity is calculated as `rows * columns`, with the existing 30-slot safety limit retained.
- Added a generalized slot geometry model (`slot-grid-v1`) that stores:
  - first-slot X/Y origin,
  - last-slot X/Y origin,
  - row spacing in PDF points,
  - column spacing in PDF points.
- Slot order is row-major: left-to-right across a row, then top-to-bottom.
- Reused the existing repeated-field model inside each slot. A slot may still contain multiple fields, each with its own font size and left/center/right alignment.
- Field placement is defined once against slot 1 and repeated at the same relative X offset in every slot.
- Existing Build 010/011 vertical blocks remain valid and render/generate through the legacy vertical path without migration.
- If an existing legacy block is deliberately re-geometrized in Build 012, its existing absolute field anchors are converted to slot-relative offsets so the current field positions are preserved.
- Build 011.1 PDF-only zoom behavior remains unchanged.

## Deliberately deferred

- Individual/free placement of collection members.
- Role-based placement such as defensive positions or separately labeled umpire positions.
- Composite/free-text templates.
- Broader Layout Designer UI/UX cleanup, including the known post-generation stretched-DOM issue.

The architecture keeps individual placement as a separate future geometry mode rather than associating any collection with one required arrangement.
