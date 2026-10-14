# Scorecard Studio v0.5 — Build 005.2 Checkpoint

**Status:** Complete  
**Date:** 2026-10-14  
**Release identity:** v0.5.0, Build 005.2  
**Browser cache identity:** `050b0052`

Build 005.2 promotes the accepted v0.5 candidate to its final release identity and produces the canonical release packages.

- Promotes `0.5.0-dev` to `0.5.0` without changing persisted schema or storage versions.
- Updates normalized-snapshot and backup producer metadata to the final identity.
- Applies one browser cache identity to every versioned production asset import.
- Incorporates the user-revised README, including the Game Day Research Companion and local backup/portability posture.
- Records the Baseball Savant field-outline no-go; no Savant runtime dependency or extracted geometry is included.
- Keeps generated PDFs independent from the Game Day player-stat scope selector, as documented out of scope.

The accepted current integration/release suite and production JavaScript syntax checks must pass before packaging. Historical frozen build tests remain evidence for their original increments and are not the v0.5 release gate.
