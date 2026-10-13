# Build 009 — Pregame Field Registry + Normalized Data Model

Status: implementation specification; no application implementation or acceptance run is included in this documentation package.

## Outcome

Introduce one normalized pregame model and central registry between API adapters and Designer/Game Day/PDF consumers. Define the complete traditional v0.2.0 catalog in [FIELD_REGISTRY.md](FIELD_REGISTRY.md), but implement only the scalar slice below in Build 009. Build 008 remains the accepted Game Day foundation.

Read `AI.md`, the registry, `PREGAME_DATA_INVENTORY.md`, and `GAME_PACK_FIELD_MATRIX.md`; inspect current application modules and stored layout shape before editing. The latter two documents may contain older source assumptions; the registry records the Build 008 corrections and their evidence limits.

## Required implementation

1. Add focused ES modules for pure normalization, field definitions/resolution, and shared formatting, using existing modules where appropriate. Keep HTTP in the API layer and IndexedDB in storage. No framework, server, build system, or new dependency is required.
2. Normalize all data already displayed by Game Day (including player seasonStats, collections, personnel and standings) to the registry's shapes and availability model. Have Game Day consume that model without changing its established visible coverage. This does not require making every normalized leaf selectable in Designer.
3. Implement these exact selectable scalar fields:
   - `game.date`, `game.startTime`, `game.venue.name`.
   - `game.weather.temperature`, `game.weather.condition`, `game.weather.wind`, `game.weather.summary`.
   - For both `away` and `home`: `team.name`, `team.locationName`, `team.shortName`, `team.clubName`, `team.abbreviation`, `team.record.wins`, `team.record.losses`, `team.record.pct`, `team.record.display`, `manager.name`, `startingPitcher.player.name`.
   - This is 29 canonical fields: seven game fields plus eleven for each side. Full expanded IDs always include their side prefix.
4. Populate Designer's grouped field dropdown from supported registry entries. Use a normalized sample fixture for preview and the same resolver/formatter for real PDF values. Remove the two hard-coded team-name resolution branches. Both existing IDs retain identical meanings.
5. Give each mapping independent identity; allow duplicate fields on the same page and across pages. Use existing mapping IDs if present; supply stable IDs for legacy placements without changing their coordinates, format or order. Delete/edit by mapping identity, never by field ID.
6. Implement dependency-driven hydration for generation. Only the manager fields in this initial selectable slice need coaches. Existing Game Day still explicitly hydrates its coaches/standings categories on opening. Team W-L/PCT and embedded player season stats never automatically trigger extra requests. Deduplicate repeated needs and reject stale responses after game/date changes.
7. Preserve per-field missing/error status and nonfatal supplemental failures. Missing printed values are blank; valid zero remains zero. Unsupported stored mappings survive load/save with a visible warning. Continue to use historical game dates and seasonStats rather than current-game stats.

The complete runtime catalog may be generated now with remaining families marked planned/unverified, or expanded incrementally later. Only supported fields are selectable; planned entries must not appear functional. Document which approach was used. All normalized facts needed by existing Game Day still need working adapters in this build.

## Explicitly deferred

Repeated-row/block editor and rendering, bench/bullpen overflow UI, standings-block picker, defense diagram mapping, custom composite templates, new name/precision/alignment/color/conditional-format controls, text-fit controls, supplemental player-stat fallback, advanced research, and general import/export tooling. Fixed weather and record composites are included. Preserve existing font-size behavior and baseline-left positioning. Do not modify `README.md`.

## Acceptance checklist

| Check | Expected evidence |
|---|---|
| Registry contract | 29 supported IDs are unique; both side expansions match; required metadata exists; dependency graph is acyclic; resolvers are pure |
| Shared resolution | Same normalized input produces matching Designer preview and PDF text for every supported field; no raw API path lookup in these consumers |
| Team representations | Full/location/short/club/abbreviation independently map; location is not mislabeled city; test fixture distinction St. Petersburg vs Tampa Bay |
| Duplicate placements | Map `away.team.name` twice on one page and once on another, with different point sizes; save/reload, edit/delete one; others remain intact and generate correctly |
| Legacy persistence | Open an existing Build 007/008 two-field layout and its PDF Blob; generate without data loss, coordinate shifts or font-size changes; unknown field round-trip is preserved and warned |
| Lazy requests | Home: no coaches/standings calls. Team-only layout: none. Manager duplicated: one request per team/date key. Opening Game Day: only its required supplemental calls, with same-league standings deduplicated |
| Failures and selection races | Coaches failure leaves base data usable; missing manager prints blank and UI explains it; changing game/date during fetch never displays old supplemental data |
| Numeric/missing data | Zero wins, zero temperature, null weather parts, partial record and missing starter handled distinctly; records require both parts and weather has no dangling punctuation |
| Collection normalization | Nine lineup slots preserve gaps; ID joins preserve missing members; absent vs empty bench/bullpen differs; duplicate IDs, two-way roles and unposted lineups are covered without building their mapping UI |
| Game Day regression | Existing game/team/manager/standings/lineup/starter/bench/bullpen/umpire/venue/weather sections retain coverage and readable loading/error states |
| Historical/no spoilers | Reuse historical manager-change and player YTD cases; date parameters match selection. Current-game stats, scores and live defense never leak into normalized pregame fields; uncertain historical membership is reported, not guessed |
| PDF geometry | Multi-page source; browser resize; same stored percentages, point sizes and baseline-left anchor yield unchanged physical placement |
| Environment | Run module/syntax checks and targeted fixture tests, then browser acceptance Local and Online where available; report any environment not tested rather than claiming it passed |

Use targeted normalization/resolution/hydration tests with fixtures, plus manual PDF/IndexedDB acceptance where automation is impractical. No broad rewrite or unrelated refactoring. Early-day/MiLB data gaps are limitations to report, not reasons to invent fallback values or silently expand scope.

## Delivery and completion gate

Deliver changed implementation/documentation files only, a concise test report, and a convenience ZIP using repository-relative paths. Do not commit, push or deploy without a separate request. Mark Build 009 complete in `AI.md` only after implementation and required acceptance evidence exist; otherwise retain pending status and list remaining checks. This documentation-only package contains `AI.md`, `docs/FIELD_REGISTRY.md`, and this file, with no README or application changes.
