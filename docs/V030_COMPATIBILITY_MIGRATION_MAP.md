# Scorecard Studio v0.3.0 — Compatibility and Migration Map

**Introduced:** Build 003.3  
**Source field authority:** committed v0.2.0 `js/field-registry.js`  
**Target model authority:** `docs/V030_NORMALIZED_MODEL_V2.md`  
**Machine-readable map:** `tests/fixtures/model-contract/v030-compatibility-map.json`

## 1. Purpose and boundary

This contract lets existing layouts and field IDs resolve against normalized schema version 2 without pretending the two model versions are structurally identical. It covers all 223 fields resolvable by the committed v0.2.0 registry: 171 catalog fields and 52 compatibility-only fields.

Build 003.3 changes no production resolver, persistence code, application UI, or `README.md`. It defines the boundary the later implementation must honor.

## 2. Dispositions

Every v1 registry field has exactly one v2 disposition:

- `direct`: the semantic value and path/row path remain valid.
- `projected`: a renamed, typed, selected, role-scoped, or collection-level v2 value is exposed through the v1 field contract.
- `derived`: the v1 display value is recomputed from named v2 dependencies.
- `unsupported`: no safe equivalent exists. None of the current 223 fields require this disposition, but it is mandatory for unknown future or damaged layout IDs.

Unavailable source data never becomes a fabricated zero, empty record, or substitute statistic. A compatibility resolver renders the existing blank placeholder and retains the schema-v2 availability/lineage state for diagnostics.

## 3. Principal path migrations

| v1 concept | schema-v2 target | compatibility rule |
|---|---|---|
| `game.date` | `game.dates.officialDate` | renamed official-date projection |
| `game.startTime` | `game.dates.scheduledStart` | scheduled-start projection |
| `game.number` | `game.gameNumber` | renamed path |
| venue city/state/country | `game.venue.location.*` | renamed paths |
| venue capacity/turf/roof | `game.venue.fieldInfo.*` | renamed paths |
| fixed umpire slots | `game.umpires.crew[]` | select by normalized role; absent role stays unavailable |
| manager name/number | `<side>.manager.selected.*` | expose only the selected unambiguous manager |
| lineup rows | `<side>.lineup.slots[]` | collection projection preserving batting order |
| rank scalars | `<rank>.value` | typed rank projection |
| games-back text | `<gamesBack>.raw` | preserve source-faithful display text |
| `last10` | `lastTen` | renamed path; display derives from wins/losses |
| hitter statistics | `.stats.hitting.totals.*` | explicit hitting scope |
| pitcher statistics | `.stats.pitching.totals.*` | explicit pitching scope |
| record/slash/compact/weather displays | named dependencies | deterministic v1 formatting projections |

The machine-readable map carries the exact target for each field, including every non-catalog starting-pitcher and bullpen statistic.

## 4. Bullpen compatibility and the new pitcher split

Schema version 2 stores three distinct groups: `startingPitcher`, `additionalStarters`, and `bullpen`. When reliable `SP` annotations exist, the core bullpen excludes the selected starter and all additional starters. Without reliable annotations, the authoritative fallback remains dated-roster pitchers minus the selected starter.

The old v1 `bullpen[]` contract predates that split. Its compatibility projection is therefore:

```text
legacy bullpen = schema-v2 bullpen + schema-v2 additionalStarters
```

The union preserves v0.2.0 roster-minus-starter behavior and source order, with duplicate person IDs removed. A new v0.3.0 presentation control may omit or include `additionalStarters`; that choice changes only the displayed collection, never stored membership or provenance. Existing layouts continue to include them through the legacy projection.

## 5. Consumer capabilities replace endpoint labels

The v1 `sourceRequirements` values are retained only as audited input metadata. They do not drive schema-v2 fetching. Every mapped field instead requests one or more normalized capabilities:

- `corePregame` for game/team/player/stat concepts;
- `officials` for umpire fields;
- `extendedVenue` for venue detail beyond schedule identity; and
- `staff` for manager fields.

`pitcherRoles` and `game2Overlay` remain planner capabilities used by group classification and source-precedence policy. They are not falsely attached to every affected field: a missing optional depth chart must not block the legacy pitcher pool, and a Game 2 overlay is selected by context rather than by layout field ID.

No schema-v2 field requirement contains `gamePack`. Adapter selection remains the planner's responsibility.

## 6. Aliases and unknown fields

The four established aliases remain readable:

- `away.teamName` → `away.team.name`
- `home.teamName` → `home.team.name`
- `away.startingPitcher.name` → `away.startingPitcher.player.name`
- `home.startingPitcher.name` → `home.startingPitcher.player.name`

Known aliases canonicalize in memory during layout load. They are written back only when the user explicitly saves the layout. Loading alone must not mutate IndexedDB.

An unknown field ID is preserved during load/save, resolves as `unsupported`, renders the normal blank placeholder, and produces one diagnostic per layout. This makes older or externally edited layouts recoverable instead of destructively pruning information.

## 7. Persistence and invalidation

### Layouts

Layout schema versioning is independent from normalized-game schema versioning. Existing layouts retain their field IDs and do not require a database migration merely because normalized data moves to version 2.

### Normalized snapshots

A normalized snapshot key contains the namespace, normalized `schemaVersion`, `contractRevision`, `gamePk`, and deterministic `selectedViewKey`. Only schema version 2 snapshots are accepted by the new reader.

Schema-v1 snapshots are discarded and recomputed. They must not be upgraded in place because v1 cannot reconstruct source-result outcomes, effective scope/cutoff, availability states, or selected-value lineage. A guessed migration would create false provenance.

### Adapter results

Adapter cache keys contain the namespace, adapter contract revision, and complete semantic request key defined in Build 003.2. A semantic-key change, adapter-contract revision change, or declared freshness trigger invalidates reuse. Successful units and valid partial successes may be cached; a failed unit is never cached as an empty success.

### Generated artifacts

Existing PDF/export blobs are unaffected. They are rendered artifacts, not normalized snapshots or adapter-result caches.

## 8. Implementation requirements for a later build

1. Add a version-aware compatibility resolver in front of schema-v2 data.
2. Keep field IDs stable; do not rewrite layouts on read.
3. Implement named projections exactly as declared in the machine map.
4. Carry availability/lineage through projection and formatting.
5. Key snapshots and adapter results with their respective version boundaries before enabling persistence.
6. Add the optional “include additional starting pitchers” presentation setting without changing stored pitcher membership.
