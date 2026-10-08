# Scorecard Studio v0.3.0 Compatibility Resolver

**Build:** 004.6  
**Status:** Implemented and regression-tested  
**Authority:** Runtime implementation of the Build 003.3 compatibility migration map

## Purpose

The compatibility boundary lets existing v0.2.0 layouts read schema-v2 normalized snapshots without changing their saved field identifiers or silently rewriting stored layouts. It is the only layer that reconstructs v0.2.0-shaped field values from schema v2.

The boundary is intentionally separate from application bootstrap. Until the Build 004.8 cutover, v0.2.0 remains the user-visible control path.

## Runtime modules

- `js/v030-compatibility-definitions.js` is generated from `tests/fixtures/model-contract/v030-compatibility-map.json`. It contains the complete frozen declaration set: 223 canonical fields and four recognized aliases.
- `js/v030-compatibility-resolver.js` resolves direct, projected, derived, and repeated fields against a schema-v2 snapshot. Results carry support, disposition, availability, lineage, row context, and formatting context.
- `js/v030-layout-compatibility.js` loads an independent copy of a saved layout, canonicalizes recognized aliases in memory, preserves unknown identifiers, and resolves field bindings without storage side effects.

`tools/generate-v030-compatibility-definitions.mjs` reproducibly generates the declaration module. `tools/generate-v030-compatibility-layout-fixtures.mjs` reproduces the representative saved-layout fixture.

## Field resolution rules

1. Every canonical v0.2.0 field in the Build 003.3 map is registered. Capability requirements replace endpoint/source labels at the compatibility boundary.
2. The four known aliases canonicalize before lookup. The result retains both the requested identifier and canonical identifier for diagnostics.
3. Repeated fields require a positive one-based slot, a zero-based `rowIndex`, or a semantic role. Variable official crews can therefore resolve both by source order and by normalized role.
4. Direct and projected atomic values resolve through their declared schema-v2 path. Derived values use only their declared dependencies and projection rule.
5. Missing, omitted, failed, ambiguous, and present-empty concepts remain blank for rendering. The resolver retains the most specific applicable lineage state instead of inventing a value.
6. Unknown field identifiers are unsupported and render blank. Layout loading and explicit-save preparation preserve the original unknown identifier unchanged.

## Layout persistence rules

Opening a layout never requests a persistent write. Known aliases are canonicalized only in the cloned in-memory layout. Canonical identifiers become eligible for persistence only when the caller performs an explicit user save.

Unknown identifiers are never deleted or renamed. A layout containing one or more unknown identifiers produces one aggregate diagnostic for that layout, while every occurrence remains in place for future round trips.

The layout storage schema remains independent of normalized-snapshot schema versioning.

## Bullpen compatibility and the v0.3 preference

Schema v2 keeps three different pitching concepts:

- `startingPitcher`: the selected probable starter;
- `additionalStarters`: other dated-roster pitchers carrying a reliable `SP` label; and
- `bullpen`: the core bullpen.

Legacy v0.2.0 `away.bullpen[]` and `home.bullpen[]` fields always project the person-ID-deduplicated union `bullpen + additionalStarters`. This preserves existing saved-layout output even after schema v2 gains more precise role metadata.

The new v0.3.0 presentation helper defaults to the core bullpen and accepts `includeAdditionalStarters: true` to display the same union. That option changes only returned display rows. It does not mutate normalized membership, the snapshot, or the legacy projection.

## Verification boundary

The Build 004.6 tests prove that:

- generated declarations exactly reproduce the authoritative machine map;
- all 223 canonical field identifiers resolve as supported;
- all four aliases canonicalize;
- representative direct, projected, derived, role-selected, and repeated fields resolve;
- a representative saved layout produces the same visible values through the v0.2.0 and schema-v2 resolvers;
- alias loading does not mutate the supplied layout or trigger persistence;
- unknown fields survive load and explicit-save preparation and render blank with one layout diagnostic;
- legacy bullpen output retains additional starters regardless of the new display preference; and
- ambiguous manager selection stays blank and carries its explicit ambiguous lineage.

The unchanged v0.2.0 application path and release regression remain the control through Build 004.8.

