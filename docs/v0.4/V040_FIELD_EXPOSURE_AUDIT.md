# Scorecard Studio v0.4 Field-Exposure Audit

**Status:** Reconciled through Build 001.6  
**Audited runtime:** v0.3.0 Build 005.4 package  
**Scope:** Registry, Designer eligibility, representative data, Game Day use, compatibility behavior, and schema-v2 candidates

## 1. Executive finding

The v0.3 registry remains mechanically healthy, and Build 001.6 now records an explicit product-surface decision for every resolvable field and every meaningful unregistered schema-v2 family.

- Every active catalog field has example metadata and resolves against the existing Designer representative model.
- The live Designer/Test PDF representative model is now contract-valid schema v2; schema v1 remains an explicit compatibility fixture.
- Game Day is now the research-level companion defined by the product contract.
- Designer now stores a per-block choice among core bullpen, additional starters, and their historical union.
- Several resolvable compatibility fields and normalized schema-v2 values require an explicit product disposition.

## 2. Registry baseline

| Classification | Count | Current behavior |
|---|---:|---|
| All resolvable definitions | 223 | Available through `getSupportedFields()` and retained for compatibility. |
| Active catalog definitions | 171 | Available to Standard/Custom catalog workflows unless a Designer-specific exception applies. |
| Standard tier | 64 | Default field set for new Standard layouts. |
| Custom tier | 107 | Available through Custom field selection, subject to Designer exceptions. |
| Compatibility-only | 52 | Resolvable by existing layouts/templates but hidden from new catalog selection. |
| Designer-eligible active fields | 167 | The 171 active fields minus four deliberately hidden fixed-role umpire scalars. |

The four active-but-Designer-hidden definitions are:

- `game.umpires.home.name`
- `game.umpires.first.name`
- `game.umpires.second.name`
- `game.umpires.third.name`

The variable `game.umpires.crew[]` name/role collection is the accepted Designer workflow. Build 001.6 must either reclassify the four fixed-role definitions as compatibility-only or document a reason for retaining the current active-but-hidden exception.

## 3. Active repeated collections

| Collection | Active fields | Existing representative rows | Current Designer workflow |
|---|---:|---:|---|
| Away lineup | 18 | 9 | Repeated layout and defensive alignment |
| Home lineup | 18 | 9 | Repeated layout and defensive alignment |
| Away bench | 16 | 6 | Repeated layout |
| Home bench | 16 | 6 | Repeated layout |
| Away bullpen | 9 | 14 | Repeated layout; historical combined pitcher projection for schema v2 |
| Home bullpen | 9 | 14 | Repeated layout; historical combined pitcher projection for schema v2 |
| Umpire crew | 2 | 6 | Variable repeated/individual crew workflow |

All active scalar and repeated definitions return `available` or `partial` against the current representative model when repeated definitions use slot 1. No active definition has blank `exampleValue` metadata.

## 4. Compatibility-only fields requiring review

The 52 compatibility definitions comprise:

- 42 starting-pitcher fields;
- 8 bullpen fields (`IP`, strikeouts, saves, and holds for away/home);
- 2 lineup batting-order fields.

Compatibility-only does not mean invalid or unavailable. These definitions resolve for existing layouts. Build 001.6 must decide whether each remains historical-only or becomes a Custom field. Saves, holds, innings pitched, strikeouts, batting order, and selected starter detail are plausible new-layout choices and should not remain hidden solely because they were previously classified together.

## 5. Representative-data assessment

### What is working

- All 171 active definitions have deterministic example metadata.
- All 171 resolve against `DESIGNER_SAMPLE_MODEL`.
- Collections deliberately exercise long names, name variants, handedness, positions, large bullpen capacity, and expanded umpire crews.
- Generate Test PDF uses the same representative model as the Designer canvas.

### What is no longer sufficient

`DESIGNER_SAMPLE_MODEL` declares `schemaVersion: 1`. It validates the legacy registry and compatibility behavior but not the final v0.3 runtime contract. It has one monolithic 14-pitcher `bullpen` per side and no `additionalStarters`, source results, lineage, typed standings tokens, availability state, categorized staff, or schema-v2 competition context.

Build 001.6 should introduce a validated schema-v2 representative snapshot with:

- nine-player posted lineups and capacity/overflow cases;
- bench players and two-way identity where useful;
- one selected starter per team;
- core relievers plus several additional starters;
- a second fallback scenario in which depth classification is unavailable;
- all supported player-name variants, including disambiguated boxscore names;
- complete hitting and pitching totals used by candidate catalog fields;
- variable officials;
- one unambiguous manager and categorized coaches;
- typed standings values including a leader dash/raw token;
- representative venue/weather/date/status values;
- deterministic availability and lineage metadata.

The schema-v1 sample may remain as a compatibility fixture, but it should no longer be the sole Designer/Test PDF model.

## 6. Current Game Day gap

Game Day currently renders a hand-selected subset:

- team record, division, manager, selected standings and recent-performance values;
- lineup identity plus AVG/OBP/SLG/OPS/HR/RBI;
- selected starter and one combined nonstarter list with W-L/ERA/WHIP/K;
- abbreviated bench hitting summaries;
- umpire crew;
- selected venue and weather values.

It does not provide near-comprehensive active-registry coverage, categorized coaches, honest pitcher-group separation, or many advanced active/compatibility values. The current view also labels every displayed non-selected starter `RP`, including additional starters or fallback pitchers whose role is not known.

Build 001.5 should be driven by a family-level Game Day coverage matrix rather than copying the Field Diagnostic table. Equivalent component/composite values may share one readable presentation, but omission must be intentional.

## 7. Schema-v2 values needing disposition

The following families should be reviewed for Game Day, Designer, both, or internal-only status:

| Family | Initial disposition hypothesis |
|---|---|
| Game status and scheduled/original/rescheduled/resume dates | Game Day; selected compact status on Home; only stable printable values considered for Designer |
| Game type and competition context | Game Day; selected values may be Custom Designer fields |
| Venue timezone and adopted detail | Game Day; timezone and stable scalar detail may be Custom Designer fields |
| Team/league/division IDs | Internal joins; not user fields |
| Division leader, league/Wild Card games-back, clinch/elimination values | Game Day; evaluate Custom Designer exposure |
| Manager ambiguity/candidates | Game Day availability messaging; not a fabricated scalar |
| Categorized coaches | Game Day first; evaluate repeated Designer collections separately |
| Player source name variants | Formatting inputs, not necessarily separate fields |
| Player/position role labels | Game Day pitcher classification; selected printable role fields may be useful |
| Additional starters | Game Day distinct group and Designer pitcher-group source |
| Root standings groups | Game Day research; not automatically a PDF field family |
| Source results, request keys, lineage, provenance | Automated diagnostics/development; not ordinary user fields |
| Team logos | Optional visual asset feature after separate product/design acceptance |

## 8. Bullpen and pitcher-group contract

Schema v2 correctly stores:

- selected `startingPitcher`;
- `additionalStarters` when usable SP annotations exist; and
- core `bullpen`.

Existing v0.2/v0.3 field IDs intentionally project `bullpen + additionalStarters` to preserve saved-layout output. New layouts require an explicit per-block group mode:

| Mode | Rows |
|---|---|
| Core bullpen | `bullpen` only; when classification is unavailable this is the authoritative roster-pitchers-minus-starter fallback. |
| Combined pitchers | Person-ID-deduplicated `bullpen + additionalStarters`; historical behavior. |
| Additional starters | `additionalStarters` only; legitimately empty/unavailable without usable annotations. |

Existing blocks with no mode remain Combined Pitchers. New blocks must store a choice rather than read a global Home or Game Day preference.

## 9. Build 001.2 automation requirements

The replacement for the visible Field Diagnostic must verify:

1. Every `catalog: true` definition has label, description, example, tier, format, and an intentional surface disposition.
2. Every Designer-eligible definition is reachable through Standard or Custom workflows.
3. Every intentionally hidden active definition has an explicit reason; no silent exceptions remain.
4. Every exposed definition resolves against the validated schema-v2 representative model or carries an intentional representative unavailable state.
5. Repeated collections verify every applicable row, not only slot 1.
6. Format variants—especially player names, dates, positions, ranks, rates, and raw games-back tokens—have representative assertions.
7. Game Day family coverage and Designer catalog coverage are reported separately.
8. Compatibility-only fields continue resolving for legacy layouts.
9. Unknown fields remain preserved and render blank/unsupported safely.

## 10. Conclusion

Build 001.6 completes the required consumer decisions and representative-data modernization without weakening layout compatibility. The remaining near-term work is the deliberately separate per-block pitcher-group workflow in Build 001.7.

## 11. Build 001.2 automated replacement

Build 001.2 implements the mechanical portion of Section 9 as a portable audit, a regression test, and a generated report:

- `tools/generate-v040-field-coverage-report.mjs` audits the accepted application tree and can write or verify the report.
- `tests/v040-field-coverage.test.mjs` locks the accepted registry counts, resolution behavior, collection coverage, name formats, capability/source declarations, intentional Designer exceptions, and unknown-field behavior.
- `docs/v0.4/V040_FIELD_COVERAGE_REPORT.md` is the reproducible result and must remain byte-for-byte synchronized with the generator.

The replacement passes for the current schema-v1 fixture. It does not close the schema-v2 representative-data, explicit surface-disposition, or comprehensive Game Day requirements; those remain assigned to Builds 001.5 and 001.6. The Field Diagnostic remains in normal navigation during Build 001.2 so UI retirement is not bundled into the evidence-creation change.

## 12. Build 001.6 reconciliation

Build 001.6 supersedes the provisional findings in Sections 2–7 where they describe unfinished work:

- The live `DESIGNER_SAMPLE_MODEL` is schema v2 and is validated by the normalized runtime contract. The former schema-v1 sample is retained as `LEGACY_DESIGNER_SAMPLE_MODEL` solely for compatibility evidence.
- All 171 active registry fields are assigned to Game Day. The 167 existing Designer-eligible fields remain available to new layouts.
- The four fixed-role umpire aliases remain active for Game Day and saved layouts but hidden from new Designer selection; the variable six-row Umpire Crew is the accepted Designer workflow.
- All 52 compatibility-only fields remain resolvable for saved layouts and remain hidden from new catalogs. The two batting-order scalars are redundant with repeated-row order; Build 001.7 makes the eight detailed bullpen statistics group-deterministic but does not promote them without a separate catalog-adoption decision; the 42 detailed starter fields remain outside the accepted new-layout starter summary.
- Home is explicitly assigned zero hydrated registry fields because it is now Schedule-only. Its compact status and probable-starter values come from the Schedule browsing model rather than the normalized Game Day/Designer registry.
- Ten meaningful unregistered schema-v2 families now have recorded Home, Game Day, Designer, legacy, and internal dispositions in `js/v040-field-surfaces.js`.
- The representative snapshot covers posted nine-player lineups, six-player benches, variable officials, categorized staff, source-provided name variants, typed standings values, successful pitcher classification, classification failure, the authoritative roster-minus-starter fallback, source outcomes, and lineage.
- Existing saved layouts still receive the historical combined pitcher projection. Build 001.6 does not implement the Build 001.7 per-block pitcher-group choice early.

The generated `V040_FIELD_COVERAGE_REPORT.md` is the authoritative executable result for counts, resolution, collection depth, name formatting, and disposition completeness.

## 13. Build 001.7 pitcher-group implementation

Build 001.7 closes the workflow defined in Section 8:

- New away/home bullpen repeated blocks store `pitcherGroup: core | combined | additional`; new blocks default visibly to Core Bullpen.
- Existing blocks with no property remain Combined Pitchers and are not modified merely by loading or opening a layout.
- Core Bullpen reads normalized `bullpen`; Additional Starting Pitchers reads `additionalStarters`; Combined Pitchers uses a stable, person-ID-deduplicated union.
- A classification-unavailable fallback remains authoritative in Core Bullpen. Its Additional Starting Pitchers group is honestly empty/omitted.
- Sorting, preview slots, field and template resolution, conditional formatting, overflow warnings, Test PDF, and live PDF use one shared per-block selection.
- The choice belongs to the layout block. No Home, Game Day, or global application preference can change the generated roster.
