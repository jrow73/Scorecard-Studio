# Build 028.15 - Sort Control State Reset

## Scope
Focused correction to Build 028.14 Bench/Bullpen collection sorting. No changes to sorting rules or rendering order.

## Changes
- New Bench and Bullpen repeated-layout workflows initialize sorting to `Sort: None`.
- Sort dropdown options are rebuilt from the collection currently being created, rather than from a previously selected block.
- Draft sort field/direction are isolated from existing block state.
- A sort selected before `Set Placement` is persisted onto the newly created repeated block.
- Switching collection context clears an invalid/stale draft sort and returns to `Sort: None`.
- Existing repeated blocks continue to load their own saved sort field and direction when edited.

## Acceptance checks
1. Create Bench first; choose a sort field/direction; place it.
2. Start Bullpen: it must show Bullpen sort fields and `Sort: None`.
3. Create a brand-new layout and start Bullpen first: it must show `Sort: None` and Bullpen fields.
4. Choose a Bullpen sort before `Set Placement`; after placement/editing, that block must retain its chosen sort.
5. Re-select the earlier Bench block: its saved Bench sort must still be intact.
