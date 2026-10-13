# Scorecard Studio v0.4.0 — Release-Candidate Audit

**Candidate:** accepted `0.4.0-dev • Build 004.9`  
**Release identity:** `0.4.0` with internal Build `004.9`  
**Decision:** Pass; ready for final release packaging

## Candidate boundary

The candidate is the accepted cumulative v0.4.0 implementation through Build 004.9. The release cut changes version and browser-cache identity, adds release evidence, and reconciles current status documentation. It does not change feature, persistence, normalized-data, saved-layout, backup, or PDF behavior.

Cloud synchronization is not part of v0.4.0. Provider selection, authentication, revisions, conflicts, and deletion propagation remain a future investigation.

## Automated gates

| Gate | Result | Evidence |
|---|---:|---|
| Applicable v0.3/v0.4 suite | Pass | 248 tests |
| Final release integrity suite | Pass | Asset/import resolution, cache coherence, identity, storage/backup boundaries, accepted product surfaces, and README protection |
| Production JavaScript syntax | Pass | Every file under `js/` plus the browser acceptance runner |
| Browser cache coherence | Pass | Every first-party versioned dependency uses `040` |
| Storage compatibility | Pass | IndexedDB version remains 4 |
| Backup compatibility | Pass | Backup envelope format remains version 1 |
| README protection | Pass | SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE` |

Historical build tests that assert superseded identities or intermediate UI structures remain point-in-time evidence and are not an aggregate final-release command.

The command-line Chrome acceptance harness cannot complete in this Windows session because Chrome's GPU process exits before the page loads. This is the same host limitation recorded during Build 004, not an application assertion failure. Manual Chrome and touch acceptance supplied throughout Build 004 remains the browser evidence for this release.

## Manual acceptance evidence

Acceptance during Builds 001–004 covered:

- Home schedule loading, favorite-team preselection, search, game selection, and responsive card layout;
- Compact, Standard, and Advanced Game Day content across MLB and MiLB examples;
- saved layouts, Field Palette selection, PDF generation, and existing layout compatibility;
- complete and single-layout backup/restore behavior across browsers;
- Light, Dark, and System appearance choices;
- narrow Layout Settings and child-dialog containment;
- mouse and touch Designer movement safeguards;
- responsive Game Day navigation; and
- user-local/game-local browser times with game-local-only PDF output.

## Final acceptance checklist

1. Confirm the header displays `0.4.0` without a development suffix.
2. Confirm existing settings, layouts, and PDF templates remain present.
3. Load one schedule, open Game Day, and generate one scorecard PDF.
4. Open Settings and confirm appearance and backup controls remain available.
5. Confirm a cross-timezone game retains the accepted dual-time browser display and game-local PDF time.

## Rollback

Rollback replaces application files with the accepted Build 004.9 bundle. Do not clear or downgrade browser storage. Build 004.9 and final v0.4.0 share the same storage schema, backup format, normalized model, and saved-layout contracts.
