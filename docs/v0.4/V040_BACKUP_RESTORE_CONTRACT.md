# Scorecard Studio v0.4 Backup and Restore Contract

**Status:** Version-1 authority; Build 002 closed by Build 002.7a  
**Format:** `scorecard-studio-backup`, version 1  
**Purpose:** Make user-created layouts, their PDF templates, and portable application settings recoverable without treating reproducible API data as user data.

Build closure, verification evidence, and manual-browser handoff are recorded in `docs/v0.4/builds/V040_BUILD_002_CLOSURE.md`.

## 1. Storage inventory

The current IndexedDB database is `scorecard-studio`, database version 4.

| Store | Key | Ownership | Backup policy | Reason |
|---|---|---|---|---|
| `settings` | `key` | Mixed | Registered records only | Contains durable preferences, legacy records, and transient selection state. |
| `layouts` | `id` | User-owned | Include | Layout definitions cannot be reconstructed from the API. |
| `pdfTemplates` | `key` | User-owned binary | Include when referenced | Original blank PDFs are required to use restored layouts. |
| `normalizedSnapshotsV2` | `key` | Reproducible cache | Exclude | Can be hydrated again from adopted sources. |
| `adapterResultsV1` | `key` | Reproducible cache | Exclude | Source-response cache is not user configuration. |

Session state held only in memory, generated scorecard PDFs, downloaded files, console data, API responses, and browser permissions are not part of a backup.

## 2. Settings policy

### 2.1 Registry, not a hard-coded export list

Build 002 will expose one settings-definition registry. A definition owns:

- stable key;
- current value schema/version where applicable;
- default value;
- normalizer/validator;
- portability: `portable`, `portableReference`, `migrationOnly`, or `excluded`;
- optional referenced entity type, such as `layout`;
- optional migration from earlier value shapes.

The backup engine enumerates registered definitions. A later feature adds its definition to the registry; it does not add special cases to the exporter or importer. The default for a newly registered ordinary preference is portable. Credentials, authorization grants, secrets, and device-specific handles must be explicitly excluded and must never rely on generic serialization.

### 2.2 Current setting decisions

| Key | Decision | Restore behavior |
|---|---|---|
| `favoriteCompetition` | Portable | Normalize through the v0.4 favorite-competition contract. |
| `appPreferencesV1` | Portable | Normalize through its versioned preferences contract. Future appearance values remain ordinary data. |
| `favoriteLayoutId` | Portable reference | Restore only if the referenced layout exists after conflict resolution; rewrite when Keep Both remaps that layout. |
| `livePdfLayoutId` | Excluded | Last-used UI selection is reconstructible and must not override the receiving browser's current workflow. |
| `favoriteTeam` | Migration only | Convert to `favoriteCompetition` only when no canonical favorite exists; do not preserve redundant legacy state. |
| `includeAdditionalStarters` | Excluded legacy | Retired global behavior must not override per-layout pitcher-group semantics. |

Unregistered settings are reported during export/import and are not written by an importer that does not understand them. This prevents an older application from activating arbitrary future or sensitive records. A newer application that registers a setting can import that setting from any version-1 backup containing it.

An older backup naturally lacks settings invented later. Restore leaves those absent and the current application supplies their current defaults.

## 3. Version-1 JSON envelope

The normative machine-readable structure is `schemas/v040-backup-envelope-v1.schema.json`.

Required top-level members are:

- `format`: constant `scorecard-studio-backup`;
- `formatVersion`: integer `1`;
- `backupId` and `createdAtUtc`;
- `source`: application version, build, and IndexedDB version for diagnostics;
- `scope`: `complete` or `singleLayout`;
- `settings`: portable setting records;
- `layouts`: unmodified compatible layout records;
- `pdfTemplates`: referenced templates with encoded bytes and integrity hashes.

Top-level and binary-record members are closed against unknown properties. Layout records deliberately preserve additional properties so a compatibility load cannot erase fields an older runtime does not understand. Setting values may contain any JSON-safe value accepted by their registered definition.

## 4. PDF representation and integrity

PDF template bytes are represented inside the JSON file as Base64 with:

- key;
- original filename;
- MIME type `application/pdf`;
- decoded byte length;
- optional source update time;
- Base64 value; and
- SHA-256 of decoded bytes.

Preflight must decode every PDF, verify its byte length and SHA-256, and verify that it is plausibly a PDF before any storage write. A layout whose `pdfTemplateId` has no matching valid template is invalid for restore. Orphan templates are not exported.

## 5. Export scopes

### Complete backup

Includes all layouts, every PDF referenced by those layouts exactly once, and all registered portable settings. Reference settings are included only when their targets are included or can be represented as empty.

### Single-layout backup

Includes one layout and its one referenced PDF. It contains no application settings. The restored layout therefore cannot silently become the receiving browser's favorite or last-used layout.

Both forms use the same envelope and import pipeline.

## 6. Determinism

Export order is stable:

1. settings by key;
2. layouts by ID;
3. PDF templates by key.

`backupId` and `createdAtUtc` are the only intentionally variable envelope values for the same stored input. Layout payloads are exported without compatibility-load rewrites. JSON serialization uses a single defined UTF-8 representation so tests can compare logical output and integrity consistently.

## 7. Import pipeline

Import has two phases.

### Preflight — no writes

1. Parse JSON and reject duplicate object keys where the parser permits detection.
2. Validate envelope identity and supported format version.
3. Enforce reasonable file, collection, and decoded-PDF size limits.
4. Validate registered settings without applying them.
5. Load layouts through non-destructive compatibility analysis and retain unknown layout fields.
6. Decode and hash PDF templates.
7. Verify every layout-to-PDF reference.
8. Compare IDs and names with existing storage.
9. Produce a human-readable restore plan containing additions, replacements, remaps, skips, warnings, and unsupported records.

A backup from a newer unsupported format version is rejected as a whole. It is never partially guessed into storage.

### Commit — deliberate and atomic

The user chooses the conflict policy after reviewing preflight. The commit executes the accepted plan in one multi-store IndexedDB transaction. Any validation, quota, or storage error aborts the transaction; partial layouts, PDFs, or settings must not remain.

## 8. Conflict policies

Each conflicting layout unit consists of the layout and its referenced PDF.

- **Replace:** overwrite the matching layout/PDF unit after explicit confirmation.
- **Keep Both:** generate new layout and PDF IDs, rewrite `layout.pdfTemplateId`, and rewrite included setting references using the same remap table.
- **Skip:** write neither member of the conflicting unit.

Names are user-facing collision warnings, not storage identity. Keep Both creates a deterministic nonblank copy name. A PDF is never replaced independently from the layout unit that owns it.

Complete restore may apply one default policy with per-item overrides. Single-layout restore uses the same policies but never imports global settings.

## 9. Compatibility guarantees

- Existing layout blocks without `pitcherGroup` remain historical Combined behavior and are not upgraded during import.
- Unknown saved-layout field IDs and future layout properties remain preserved under the existing compatibility rules.
- Missing settings receive current defaults.
- Registered future JSON-safe settings use the generic path without a backup-engine change.
- Unknown settings are reported and skipped by runtimes that cannot validate them.
- Retired settings cannot re-enable retired product behavior.
- Importing never mutates the backup file.

## 10. Security and privacy boundary

Backup files may contain user-created layout names and the original PDF templates. The import UI must say this plainly. Backups do not include API caches, browsing history, credentials, OAuth tokens, browser permissions, or generated scorecards. Imported strings are data and are never evaluated as markup or code.

## 11. Build 002 implementation sequence

1. **002.1:** storage inventory, format contract, schema, and representative fixture.
2. **002.2:** generic setting registry and deterministic export engine.
3. **002.3:** no-write import validation and restore-plan preview.
4. **002.4:** conflict resolution, ID/reference remapping, and atomic commit.
5. **002.5:** complete and single-layout user workflows.
6. **002.6:** round-trip, corruption, compatibility, quota, and interruption testing.
7. **002.7:** cross-browser acceptance and Build 002 closure.
8. **002.7a:** immediate Settings and Home refresh after a successful restore; no format or transaction change.

No partial import/export control is exposed before its underlying path can preserve layouts and PDFs together safely.
