# Scorecard Studio v0.3.0 — Normalized Contract Runtime

**Introduced:** Build 004.1  
**Production module:** `js/v030-contract.js`  
**Model authority:** `schemas/v030-normalized-game.schema.json`  
**Contract revision:** `0.3.0-draft.2`

## 1. Role

The contract runtime is the browser-safe foundation for future schema-v2 adapters, normalizers, compatibility resolution, and persistence. It centralizes relational behavior that must not be independently reimplemented by each consumer.

Build 004.1 does not import the module from `app.js`; therefore it changes no current request, normalized value, layout, export, or user-visible behavior.

## 2. Exports

### Closed vocabularies

- `NORMALIZED_SCHEMA_ID`
- `NORMALIZED_SCHEMA_VERSION`
- `NORMALIZED_CONTRACT_REVISION`
- `ADAPTER_IDS`
- `SOURCE_OUTCOMES`
- `AVAILABILITY_STATES`
- `LINEAGE_COVERAGE`
- `EFFECTIVE_KINDS`

Array vocabularies are frozen. Callers must not append local values; a vocabulary change belongs in the contract.

### Constructors

- `createEffectiveDescriptor(input)`
- `createSourceResult(input)`
- `createLineageRecord(input)`
- `createSnapshotMetadata(input)`
- `createNormalizedSnapshot(input, options?)`

Constructors validate closed discriminators, copy caller-owned containers, and fill only contract-defined neutral defaults. They do not:

- read the clock;
- generate IDs;
- select a source;
- infer availability;
- add a source result to lineage; or
- fetch, cache, persist, or render anything.

The caller remains responsible for semantic inputs. This preserves deterministic replay and prevents a convenience constructor from inventing provenance.

### JSON Pointer helpers

- `escapeJsonPointerToken(token)`
- `unescapeJsonPointerToken(token)`
- `parseJsonPointer(pointer)`
- `resolveJsonPointer(root, pointer)`

`resolveJsonPointer` returns `{ found, value, pointer, missingToken }`. A present `null` has `found: true`; an absent property has `found: false`. Traversal uses own properties and supports array indexes through standard JSON object-key semantics.

Malformed pointers and invalid `~` escapes raise `ContractRuntimeError` with code `POINTER_INVALID`.

### Lineage lookup

`findEffectiveLineage(records, target)` applies the contract order:

1. one exact target;
2. otherwise the longest matching subtree ancestor;
3. otherwise `null`.

Multiple winning records raise `LINEAGE_AMBIGUOUS`. Source order is never used as a tie-breaker.

### Validation

- `validateNormalizedSnapshot(snapshot, options?)` returns `{ valid, errors[] }`.
- `assertValidNormalizedSnapshot(snapshot, options?)` returns the same snapshot or throws `ContractValidationError` with code `SNAPSHOT_INVALID` and the complete error list.

`options.requiredTargets` may contain consumer/registry targets that must resolve through lineage. This allows adapters and later compatibility integration to apply the same core validator with an increment-specific coverage set.

## 3. Runtime validation boundary

The JSON Schema remains authoritative for complete structural shape and scalar types. Runtime validation adds cross-record and operational invariants:

- schema identity/version/revision presence;
- absence of the prohibited `gamePack` label;
- recognized adapters, outcomes, availability states, coverage, and effective kinds;
- unique source-result IDs and lineage IDs;
- unique lineage target/coverage pairs;
- closed selected, candidate, and rejected source references;
- existence of `available`, `partial`, and `present-empty` targets;
- prohibition on `/meta` lineage targets; and
- caller-declared lineage coverage.

Errors are accumulated so development diagnostics can show every contract defect from one validation pass. Constructors fail immediately on invalid local input because they cannot safely create the requested record.

## 4. Stable error codes

| Code | Meaning |
|---|---|
| `INPUT_INVALID` | A constructor input has the wrong local shape or closed-vocabulary value. |
| `POINTER_INVALID` | A JSON Pointer is malformed. |
| `LINEAGE_TARGET_INVALID` | Lineage attempts to target metadata. |
| `LINEAGE_AMBIGUOUS` | More than one lineage record wins for a target. |
| `SNAPSHOT_INVALID` | Aggregate assertion failure; inspect `error.errors`. |

Validation result entries use additional specific codes such as `SOURCE_ID_DUPLICATE`, `SOURCE_REF_DANGLING`, `LINEAGE_TARGET_DUPLICATE`, `LINEAGE_TARGET_MISSING`, and `LINEAGE_REQUIRED`.

Consumers should branch on codes, not English messages.

## 5. Integration rules

1. Future adapters use `createSourceResult`; they do not handcraft alternative envelopes.
2. Future normalization creates lineage with `createLineageRecord` only after source selection.
3. Renderer/compatibility consumers use `resolveJsonPointer` and `findEffectiveLineage`; they do not rely on truthiness or array order.
4. Snapshot persistence calls assertion validation before write in development and test builds.
5. Production telemetry may record error codes and paths but must not include raw response bodies, credentials, or stored layout content.
6. Build 004.2 may extend runtime helpers only when the extension remains consistent with the Build 003 machine contracts.
