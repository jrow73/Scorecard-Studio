# Scorecard Studio — Build 014 Implementation

## Status
Implementation complete; browser acceptance pending.

## Objective
Add Individual Collection Placement as the fourth collection-placement capability,
alongside vertical lists, horizontal lists, and grids. The build proves that a
collection member can be independently anchored anywhere on the scorecard by either
ordinal slot or semantic role.

## Implemented behavior

### Individual mapping model
Individual mappings are stored in `layout.individualMappings` with:

- unique mapping ID;
- collection ID;
- strategy (`slot` or `role`);
- selector (`{ slot }` or `{ role }`);
- repeated field ID;
- PDF page index;
- page-relative X/Y baseline anchor;
- PDF-point font size;
- left/center/right alignment and corresponding baseline anchor metadata.

Saving the first individual mapping advances the layout schema version to 6. No
migration is required for existing layouts.

### Slot/order strategy
Any supported repeated collection may be addressed by 1-based slot/order. Build 014
Designer choices include Away/Home starting lineups, benches, bullpens, and the umpire
crew.

### Role strategy
Role-aware placement is initially enabled only where role identity is stable:

- Away/Home starting lineup — role resolves from defensive-position abbreviation.
- Umpire crew — role resolves from the explicit MLB official assignment.

Bench and bullpen remain slot/order only.

### Umpire collection normalization
The normalized game model now preserves `game.umpires.crew[]` in source order while
continuing to populate the existing `home`, `first`, `second`, `third`, and
`additional` umpire views. The field registry exposes repeated umpire `name` and
`role` fields for individual placement.

### Designer and PDF rendering
The Designer provides collection, selector strategy, member/role, field, alignment,
and font-size controls. Placement uses the same PDF-relative click coordinate system
and zoom-safe overlay behavior as the accepted prior builds. PDF generation resolves
the stored selector against the selected game's normalized data and leaves unavailable
members blank through the existing missing-value path.

## Compatibility
Build 014 preserves:

- scalar mappings;
- Build 013 composite/free-text mappings and multiline handling;
- Build 010-012 repeated blocks, including vertical/horizontal/grid geometry;
- per-field left/center/right alignment;
- Designer PDF-only zoom;
- existing IndexedDB storage and PDF-generation behavior.

## Deferred
Build 014 deliberately does not attempt the final polished Designer workflow, drag
repositioning, combined multi-field individual cards, conditional role fallbacks, or
sample-data UX cleanup. Those remain candidates for the planned Designer UI/UX pass.
