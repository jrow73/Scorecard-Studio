# Scorecard Studio v0.3.0 — Release-Candidate Audit

**Audit build:** 005.1  
**Candidate:** `0.3.0-dev • Build 004.8b`  
**Decision:** Pass; ready for final identity promotion

## Candidate boundary

The candidate is the cumulative v0.2.0 baseline with Builds 001 through 004.8b overlaid in order. Build 005.1 changes no runtime behavior. Its purpose is to establish that the accepted implementation is internally coherent before the development identity is promoted to final `0.3.0`.

`README.md` is outside the release-status documentation boundary. It describes the intended v1 public-release end state and remains unchanged unless a v1 feature becomes infeasible or the intended v1 feature set changes. Build progress, current limitations, and release evidence belong in build and validation documents.

## Automated gates

| Gate | Result | Evidence |
|---|---:|---|
| Build 002–004 cumulative contract suite | Pass | 123 tests passed |
| Build 004.8b release regression | Pass | Identity, cutover, persistence/UI bindings, and production JavaScript syntax |
| Local HTML asset resolution | Pass | Every relative `src`/`href` target exists |
| Static JavaScript import resolution | Pass | Every local static/dynamic relative module target exists |
| Browser cache-key coherence | Pass | All versioned dependencies use `030b0048b` |
| Live normalization cutover | Pass | Bootstrap uses schema-v2 composition and excludes the v1 normalizer |
| Storage isolation | Pass | Existing user stores retain their names; derived stores remain separate |
| README protection | Pass | SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE` |

The archived `build*.test.mjs` files are point-in-time acceptance artifacts. Many intentionally assert the exact identity or implementation state of the build that created them, and some retain platform-specific historical harness assumptions. Running all archived tests as one present-release suite therefore produces expected contradictions and is not a valid release gate.

## Manual acceptance evidence

The following evidence was supplied from the target browser environment:

1. Build 004.8 completed a general browser smoke test without observed browser issues.
2. A scorecard PDF layout originally created by the v0.2 Designer loaded unchanged under v0.3 and generated from live schema-v2 data.
3. Starting-pitcher and bench names rendered initially; the discovered lineup/bullpen compatibility defect was corrected in Build 004.8a.
4. A second unchanged v0.2 “name test” layout exercised Full, First, Last, First Initial + Last, Use Name, and Boxscore Name.
5. Build 004.8b generated all of those formats with values matching known Stats API data, including distinctions that cannot be derived safely from a full name.

This is the strongest available compatibility control because it exercises real browser-persisted v0.2 layouts rather than newly constructed v0.3 layouts.

## Final-promotion acceptance checklist

After Build 005.2 changes only release identity/cache metadata:

1. Confirm the displayed version is final `0.3.0`.
2. Load a representative game and confirm Home, Game Day, and Field Diagnostic open without browser warnings or errors.
3. Confirm the additional-starter option remains off by default and toggles presentation only.
4. Generate the unchanged v0.2 scorecard PDF and confirm lineup, bench, starter, and bullpen content.
5. Generate the unchanged v0.2 name-test PDF and spot-check a formal/preferred-name difference plus an API-supplied boxscore name.
6. Confirm saved layouts and PDF templates remain present; no IndexedDB clearing or migration is required.

## Deferred, non-blocking work

- Connecting the installed adapter-result store to request-unit execution is a future performance optimization, not a v0.3 correctness requirement.
- README-described v1 end-state features that are not yet implemented remain future roadmap items; their absence from v0.3 does not make the README inaccurate.
- Layout export/import remains a v1 end-state capability and is not required for v0.3 release promotion.

## Rollback

Rollback remains an application-bundle replacement. Restore the accepted Build 004.8b bundle if a final-identity packaging problem appears. Do not delete or downgrade settings, layouts, or PDF templates. Derived schema-v2 snapshots may remain; compatibility checks decide whether they are reusable.

## Final promotion record

Build 005.2 promoted the passing candidate to `0.3.0 • Build 005.2` with browser cache identity `030b0052`. The candidate values elsewhere in this document remain the historical identity that was audited; they are not stale assertions about the promoted bundle. No feature or persistence behavior changed during promotion.

