# Build 009 — Implementation Test Report

**Status:** Implementation complete; browser acceptance pending.

## Implemented

- Added `js/normalize.js` as the pure Game Pack/supplemental normalization layer.
- Added `js/field-registry.js` with the 29 supported scalar Build 009 fields.
- Added `js/formatter.js` for shared Designer/PDF value formatting.
- Designer field choices are generated from the registry and grouped by category.
- Designer preview and PDF generation use the same registry resolver and formatter.
- Legacy Build 006/007/008 mappings using `away.teamName` / `home.teamName` resolve through explicit aliases.
- Mapping instances retain independent IDs; duplicate placement of the same field remains allowed.
- Unknown stored fields remain visible as unsupported and are preserved in layout storage.
- Game Day now renders from the normalized pregame model while retaining its established sections.
- PDF generation requests Coaches data only when a mapped manager field requires it; duplicate manager mappings deduplicate by side.
- Game Day keeps its explicit lazy Coaches/Standings hydration, with standings deduplicated by league.
- Stale Game Day supplemental results are rejected after a game/date selection change.
- Existing baseline-left placement, percentage coordinates, point-size behavior, IndexedDB DB version, and PDF Blob storage were not changed.

## Automated/static checks run

- `node --check` passed for:
  - `js/app.js`
  - `js/api.js`
  - `js/normalize.js`
  - `js/field-registry.js`
  - `js/formatter.js`
- Registry test: exactly **29** supported field IDs, all unique.
- Resolver/formatter fixture test passed for atomic fields, team W-L composite, weather composite, legacy team-name alias, and Coaches dependency discovery.
- Real game fixture `gamePk 822955` normalization test passed:
  - Seattle / Tampa Bay identities resolved;
  - nine lineup slots per team preserved;
  - bench and bullpen membership joined by player ID;
  - embedded YTD batting/pitching statistics normalized;
  - venue/date/record/starting-pitcher fields resolved through the registry.

## Browser acceptance still required

Run the Build 009 acceptance checklist in `docs/BUILD_009_IMPLEMENTATION.md`, with particular attention to:

1. Local and Online loading with no console/module errors.
2. All 29 registry fields appearing in grouped Designer choices.
3. Full/location/short/club/abbreviation values resolving independently.
4. Duplicate placement of `away.team.name` on the same and different pages, including save/reload and independent deletion.
5. Existing legacy two-field layouts loading and generating without coordinate/font changes.
6. Team-only generation making no Coaches/Standings requests.
7. Manager mapping triggering only the required Coaches request(s).
8. Game Day retaining manager, standings, lineup, pitching, bench, umpire, venue, and weather coverage.
9. Historical-date/no-spoilers behavior remaining intact.
10. PDF physical placement remaining unchanged after browser resizing.

Build 009 should remain **acceptance pending** until the Local and Online checks are completed.
