# Scorecard Studio v0.3.0 — Contract Fixture Matrix

**Introduced:** Build 003.4  
**Model authority:** `schemas/v030-normalized-game.schema.json`  
**Contract tests:** `tests/v030-model-contract.test.mjs` and `tests/v030-contract-scenarios.test.mjs`

## Purpose

The Build 003 fixture suite converts the source-policy and normalized-model decisions into repeatable acceptance controls. Every fixture is synthetic contract data: it demonstrates required semantics without claiming that invented names, identifiers, or values came from a live response.

All eight snapshots conform to normalized schema version 2 and contract revision `0.3.0-draft.1`.

## Matrix

| Fixture | Contract boundary proved | Required assertion |
|---|---|---|
| `v030-ordinary-pregame.json` | Normal posted-lineup pregame path | Both lineups are posted; probable starters and role-specific stats remain available. |
| `v030-missing-lineup.json` | Successful Schedule response without a posted lineup | State is `notPosted`, slots remain empty, and lineage is `unposted` rather than failed or present-empty. |
| `v030-game2-mixed-cutoff.json` | Same-day Game 2 source precedence | Game 2 Schedule owns identity/lineup, Game 1 Final Boxscore owns postgame record/player totals, and prior-day Standings owns rank/games back. |
| `v030-two-way-roles.json` | One identity in independent legitimate roles | The same person ID remains in lineup and starting-pitcher views with separate hitting and pitching scopes. |
| `v030-manager-ambiguity.json` | Multiple manager-like coaching candidates | Candidates are retained, state is `ambiguous`, and `selected` remains null. |
| `v030-variable-officials.json` | Source-faithful non-four-person crew | All six officials and source roles survive; fixed home/first/second/third slots are compatibility projections only. |
| `v030-milb-capability-absence.json` | Successful Single-A depth-chart response with omitted roster annotations | Additional starters are unavailable/empty and bullpen falls back to dated-roster pitchers minus the selected starter. |
| `v030-scoped-competition-stats.json` | Explicit non-regular competition statistics | Spring hitting, pitching, and standings scopes remain spring-specific; regular-season totals are not substituted. |

## Cross-fixture invariants

Every snapshot must satisfy all of the following:

1. Schema ID, schema version, and contract revision are explicit.
2. Source-result IDs, lineage IDs, and lineage target/coverage pairs are unique.
3. Every lineage reference resolves to a declared source result.
4. Available, partial, and present-empty targets exist in the normalized data.
5. The overloaded `gamePack` label does not appear anywhere in schema-v2 data or provenance.
6. A successful request is not automatically interpreted as an available concept.
7. Missing or ambiguous values are not converted into zeros, empty confirmed records, or guessed selections.
8. Hitting and pitching statistics retain independent competition and cutoff scopes.
9. Role views preserve identity without globally deduplicating a two-way player.
10. Exact lineage overrides the most-specific ancestor subtree record deterministically.

## Fixture maintenance

`tools/generate-v030-scenario-fixtures.mjs` deterministically generates the seven Build 003.4 fixtures from the schema-v2 structural baseline. The mixed-cutoff fixture remains the hand-audited Build 003.1 control.

When a compatible contract clarification changes fixture content:

1. update the generator and contract tests together;
2. regenerate all seven scenario files;
3. validate all eight snapshots against the schema;
4. review changed lineage, not only changed values; and
5. increment `contractRevision` if the accepted meaning changes.

An incompatible shape or meaning change requires a new normalized `schemaVersion`, not silent fixture drift.
