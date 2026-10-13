# Scorecard Studio v0.3.0 — Release Notes

**Release:** `0.3.0`  
**Build:** `005.2`  
**Release date:** 2026-10-08

## Highlights

Scorecard Studio v0.3.0 replaces the live pregame normalization path with a validated schema-v2 model while preserving existing v0.2 Designer layouts and PDF templates.

- Schedule selection preserves distinct game views, statuses, dates, TBD state, original posted lineups, probable starters, weather, venue identity, and team identity.
- Dated active rosters and explicitly scoped People statistics populate bench, pitcher, hitting, and pitching data without silently zero-filling unavailable results.
- Managers, coaches, standings, variable umpire crews, venue detail, and verified doubleheader Game 1 context use explicit source and cutoff rules.
- Starting pitchers, depth-chart-annotated additional starters, and core bullpen pitchers remain distinct normalized groups. The authoritative fallback remains dated roster pitchers minus the selected starter.
- Users may optionally include additional starters in the Home/Game Day bullpen display. Existing saved-layout bullpen fields retain their historical compatibility projection.
- All 223 established fields and four aliases resolve through the schema-v2 compatibility boundary.
- Player-name formats preserve Stats API full, formal first, last, preferred/use, initialized-last, and boxscore values when supplied; derivation is only a fallback.
- Normalized snapshots use version-aware browser persistence without rewriting settings, layouts, or PDF templates.
- The public interface displays the release version as `0.3.0`; the internal Build `005.2` identifier remains available in application metadata for diagnostics.

## Compatibility

- Existing v0.2 layouts and PDF templates require no migration or resave.
- Opening a layout remains non-destructive.
- Schema-v1 and obsolete schema-v2 cache records are derived data and are recomputed when incompatible.
- The v0.2 reference normalizer remains in the repository for historical tests and sample/reference purposes but is not used by the live application bootstrap.

## Acceptance evidence

- 123 cumulative contract/evidence/normalization/compatibility/persistence tests pass.
- Final release integrity, cache coherence, asset resolution, and production JavaScript syntax checks pass.
- A v0.2-created scorecard layout generated a live PDF with lineup, bench, starter, and bullpen content under schema v2.
- A v0.2-created name-test layout generated every supported player-name format with values matching known API data.

## Deferred work

- The separately installed adapter-result store is not yet connected to request-unit execution; this is a future performance optimization, not a correctness dependency.
- Layout export/import and other README-described v1 end-state capabilities remain future roadmap work.

## Protected product roadmap

`README.md` continues to describe the intended v1 public-release end state. It is not a v0.3 current-state changelog and was not modified for this release.
