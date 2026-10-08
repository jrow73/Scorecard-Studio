# Scorecard Studio v0.3.0 Persistence and Refresh Contract

**Build:** 004.7  
**Status:** Implemented and regression-tested  
**Production module:** `js/v030-persistence.js`

## Purpose and boundary

Build 004.7 provides the versioned persistence policy required by schema v2 without connecting it to the current v0.2.0 application bootstrap. Storage access is injected through a narrow backend interface, so this increment cannot open, migrate, or rewrite the existing settings, layouts, or PDF-template stores.

The Build 004.8 cutover may connect this controller to browser storage after parity evidence is complete.

## Independent stores

The controller uses exactly two logical stores:

| Store | Namespace | Contents |
|---|---|---|
| `normalizedSnapshotsV2` | `normalized-game` | Complete validated schema-v2 normalized snapshots |
| `adapterResultsV1` | `adapter-result` | Successful normalized adapter candidate units plus retry metadata |

Layouts, settings, PDF templates, and generated exports are not accepted by this controller. Their existing stores and schemas are outside cache migration.

## Normalized-snapshot identity

A snapshot key contains all of:

```text
normalized-game|schema=<schemaVersion>|contract=<contractRevision>|gamePk=<gamePk>|view=<selectedViewKey>
```

Values are percent-encoded. A snapshot write requires:

- normalized schema ID `scorecard-studio.normalized-game`;
- schema version `2`;
- the current normalized contract revision;
- a complete valid snapshot, including source results and lineage; and
- explicit `gamePk` and selected Schedule view identity.

Reads accept only the current schema and contract revision. A schema-v1 record, mismatched revision, malformed snapshot, selected-view mismatch, or payload/key identity mismatch returns `recompute`. No in-place upgrade is attempted because schema v1 cannot reconstruct schema-v2 scope or provenance.

## Adapter-result identity

An adapter key contains:

```text
adapter-result|contract=<adapterContractRevision>|request=<semanticRequestKey>
```

The semantic request key already contains every declared scope input in canonical order. Date, cutoff, person set, game type, standings type, sport, season, profile, team, and selected game therefore cannot collide when they differ. The adapter contract revision prevents an old parser/adapter contract from being read under a new one.

Adapter records persist normalized candidates, not complete raw responses.

## Partial execution and retries

Adapter writes follow the declaration for that adapter:

1. Successful units with valid candidate material are retained.
2. Failed units remain explicit retry descriptors with their unit key, semantic request key, affected person IDs when applicable, and retryability.
3. A partial read returns retained successful units plus only retryable failed units as retry work.
4. A successful retry merges into the existing record without refetching successful units.
5. Non-retryable units remain explicit terminal failures and are never scheduled as retries.
6. Failed-only executions are not cached.
7. For adapters declaring `emptyIsFailure`, an empty successful unit is converted to retry work and cannot become an empty cache hit.
8. Failures are never converted into zero-valued player statistics or empty success.

## Freshness policy

Freshness begins with key identity. A semantic-scope mismatch is a miss even if the payload otherwise looks usable.

Declared triggers then operate in three modes:

- `selection` and `consumer-demand` are lookup triggers. A same-key valid record may be reused.
- `retry-failed-units` preserves successful units and returns only the failed retry set.
- status transitions, milestones, scope/cutoff/team/date/season changes, prior-game finality, required-field absence, explicit cache expiry, and manual refresh invalidate the matching record.

The Team Logo adapter additionally enforces its evidence-backed 14-day TTL. Other adapters have no invented time TTL; their freshness remains event- and semantic-scope-based.

Normalized snapshots recompute after upstream-changing events. Selecting the exact same Schedule view may reuse its valid snapshot; selecting another view produces another key.

## Backend contract

`createV030PersistenceController` requires a backend exposing:

```text
get(store, key)
put(store, record)
delete(store, key)
```

The controller supplies only the two new store names. This keeps persistence policy testable without granting it access to existing user-authored data.

## Verification

The Build 004.7 suite proves that:

- schema, contract, game, and selected-view changes produce distinct snapshot keys;
- adapter revision and every semantic scope change produce distinct adapter keys;
- schema-v1 snapshots cannot be read as schema v2 or upgraded in place;
- invalid/mismatched payloads require recomputation;
- event and TTL boundaries return deterministic hit, miss, partial-retry, or recompute decisions;
- successful partial units survive a failed-unit retry cycle;
- failed-only and invalid empty-success operations create no cache entry;
- non-retryable failures stay visible without entering the retry plan; and
- the controller accesses neither layouts nor existing settings/PDF stores.

