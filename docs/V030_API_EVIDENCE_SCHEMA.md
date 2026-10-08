# Scorecard Studio v0.3.0 — API Evidence Schema

**Schema version:** 1  
**Introduced:** Build 002.1  
**Applies to:** investigation fixtures in `tests/fixtures/api-discovery/`

**Asset-capture extension:** Build 002.5

## Purpose

This schema makes Build 002 API observations reproducible without retaining large raw payloads or confusing a current refetch with a fact recorded at an earlier game state. It is evidence for discovery decisions, not an application runtime model.

## Evidence kinds

| Value | Meaning |
|---|---|
| `live-snapshot` | Retrieved while the subject event was in the stated live or pregame state. |
| `historical-current` | Retrieved now for a past event. It shows what the API returns now, not necessarily what it returned before or during the event. |
| `recorded-prior` | Evidence captured previously whose original retrieval context is preserved. It must not be silently refreshed or relabeled as current. |

## Record shape

Each JSON fixture contains:

| Field | Requirement and meaning |
|---|---|
| `schemaVersion` | Integer schema version; currently `1`. |
| `captureId` | Unique lowercase capture name matching the fixture basename. |
| `investigationId` | Backlog identifier in `DISC-NNN` form. |
| `evidenceKind` | One of the three evidence kinds above. |
| `capturedAtUtc` | ISO 8601 UTC retrieval timestamp. |
| `context.subject` | Human-readable identifiers and reason for the fixture. |
| `context.gameState` | State known at retrieval, including ambiguity where relevant. |
| `request.method` | `GET`; the Build 002.1 harness performs no mutations. |
| `request.url` | Exact URL including query parameters. |
| `request.headers` | Only non-secret request metadata needed for reproduction. |
| `response.status` / `response.ok` | HTTP result. |
| `response.durationMs` | Observed request duration; diagnostic, not a service-level claim. |
| `response.headers` | Focused content/cache metadata. |
| `response.bodyBytes` | UTF-8 byte count of the full response before minimization. |
| `response.bodySha256` | SHA-256 fingerprint of the full response before minimization. |
| `selection.jsonPointers` | Ordered RFC 6901-style paths retained from a JSON response, or the derived `/asset` record for bounded asset inspection. |
| `selection.values` | Per-pointer `{ found, value }` result. Missing and present-null are distinguishable. Asset captures retain derived structure only, never the asset body. |
| `notes` | Limitations, interpretation boundaries, or capture-specific context. |

The full raw body is deliberately omitted. A fixture proves the selected values and fingerprints the complete response; it does not permit later inspection of paths that were not selected.

## Naming and storage

Fixture names use:

`disc-NNN-<subject>-<source>-<sequence>.json`

They must be written beneath `tests/fixtures/api-discovery/`. A capture ID must match its output basename. Use stable identifiers such as gamePk, team ID, or person ID rather than names alone.

## Capture controls

`tools/api-discovery-capture.mjs` enforces these Build 002.1 boundaries:

- HTTPS only;
- host allowlist: `statsapi.mlb.com` and `www.mlbstatic.com`;
- `GET` requests only;
- JSON response selection for API evidence;
- bounded SVG metadata selection for `capture-asset` evidence;
- at least one requested JSON pointer;
- output confined to the evidence fixture directory;
- no authentication, cookies, or caller-supplied secret headers;
- refusal to overwrite an existing fixture.

Example:

```text
node tools/api-discovery-capture.mjs capture --url <exact-url> --investigation DISC-001 --capture-id <id> --evidence-kind historical-current --subject <description> --game-state <state> --output <id>.json --pointer /path/to/value
```

For non-JSON assets:

```text
node tools/api-discovery-capture.mjs capture-asset --url <exact-url> --investigation DISC-009 --capture-id <id> --evidence-kind live-snapshot --subject <description> --output <id>.json
```

Asset fixtures retain response status, final URL/redirect state, focused cache/CORS headers, byte count, full-body hash, and derived SVG metadata such as `viewBox`, intrinsic dimensions, raster-image use, and default canvas transparency. The SVG source itself is not retained. A non-200 response is valid evidence when the missing-asset behavior is the subject.

## Comparison semantics

`compare` evaluates the union of pointer keys in two fixtures and reports value differences. Object key order does not create a difference; array order remains meaningful. `--fail-on-difference` makes a difference a non-zero process result for automated checks.

The comparison deliberately does not require timestamps, durations, headers, byte counts, or full-body hashes to match. Those fields describe the retrieval. Selected-value equality is the repeatability assertion; matching full-body hashes are stronger incidental evidence when observed.

## Interpretation rules

1. A successful capture proves presence and shape only for the recorded request and context.
2. An omitted pointer is not proof that a concept is unsupported.
3. `{ "found": false }`, `{ "found": true, "value": null }`, an empty collection, HTTP failure, and request failure are distinct outcomes.
4. A current historical response must not be used to reconstruct an unrecorded pregame state.
5. One fixture can demonstrate possibility, not general reliability.
6. Adoption decisions require the broader evidence and limitations recorded in later Build 002 increments.
