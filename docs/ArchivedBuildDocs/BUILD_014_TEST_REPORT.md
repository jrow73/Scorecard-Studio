# Scorecard Studio — Build 014 Test Report

## Automated/static checks completed

- `node --check js/app.js` — PASS
- `node --check js/field-registry.js` — PASS
- `node --check js/normalize.js` — PASS
- Synthetic umpire feed normalization — PASS: complete `game.umpires.crew[]` retained
  while named umpire views remain populated.
- Role-based repeated-field resolution — PASS for Home Plate (`HP`), First Base (`1B`),
  and starting-lineup defensive position (`SS`).
- Umpire repeated-field registry exposure — PASS for crew name and role.

## Browser acceptance checklist

1. Open an existing Build 013 layout and verify all prior scalar, composite, and
   repeated-block mappings remain unchanged.
2. Create an individual Away or Home lineup mapping using **Slot / order**. Place a
   player-name field, generate a PDF, and verify the selected batting-order slot is
   used.
3. Create a lineup mapping using **Role**. Place at least two defensive roles (for
   example SS and CF) at visibly different locations. Generate against a posted lineup
   and verify the players follow defensive position rather than batting-order slot.
4. Create umpire mappings using **Role**, preferably Home Plate and First Base. Test a
   game where officials are posted and verify the correct names are selected by role.
5. Create one Bench or Bullpen individual mapping and verify Role is unavailable while
   Slot / order remains usable.
6. Test Left, Center, and Right alignment on individual mappings.
7. Test placement at 200% Designer zoom and verify generated PDF coordinates are
   unchanged.
8. Save/reopen the layout and verify individual mappings persist and display correctly.
9. Generate against a game where a selected role/member is unavailable and verify the
   mapping is left blank rather than printing placeholder/token text.
10. Confirm existing vertical, horizontal, and grid repeated blocks still generate
    correctly.

## Known deferred UI items

The previously documented post-generation stretched Designer DOM issue remains
intentionally deferred. Build 014 also retains the current proof-of-concept control
layout pending the planned Designer UX cleanup.
