# Scorecard Studio v0.3.0 — Roster, People, Staff, and Pitcher Normalizer

**Introduced:** Build 004.4  
**Production module:** `js/v030-roster-people-normalizer.js`  
**Input:** Build 004.3 Schedule snapshot plus already-retrieved adapter payloads  
**Output:** enriched normalized schema version 2 snapshot

## 1. Boundary

The normalizer performs deterministic joins and projections only. It makes no HTTP requests, reads no clock, accesses no cache/storage, and does not initialize or alter the current application. The v0.2.0 user-visible path remains the behavioral control.

The caller supplies one dated active roster for each side, an optional chunked People result, optional dated coaches results, and optional current depth-chart results. All semantic inputs pass through the Build 004.2 closed input and request-key rules. The output passes through Build 004.1 relational validation.

## 2. Roster authority and role boundaries

Each roster must match both the selected side's team ID and the game's official date. A mismatch fails with `IDENTITY_JOIN_FAILED` before any identities are joined.

Within each derived collection, duplicate roster person IDs are reduced to the first dated-roster occurrence while preserving roster order. Deduplication does not cross role views: a two-way player may legitimately remain in both an original lineup slot and the selected starter role.

The Schedule snapshot continues to own:

- lineup publication, membership, and order; and
- probable-pitcher selection.

The dated roster owns:

- bench membership after a lineup exists;
- pitcher membership; and
- roster number/position enrichment.

No roster-derived lineup is created. With no posted lineup, `bench` stays empty and receives `unposted` lineage.

## 3. Pitcher classification

The normalized collections have distinct meanings:

| Collection | Membership rule |
|---|---|
| `startingPitcher` | Schedule-selected probable pitcher |
| `additionalStarters` | Dated roster pitchers, excluding selected starter, with a roster-matched depth `SP` annotation |
| `bullpen` | Dated roster pitchers excluding selected starter and, when usable, SP-annotated additional starters |

Depth-chart data is current-only annotation, never membership authority. Every annotation is intersected by person ID with the dated roster. Inactive or otherwise extra depth identities are ignored.

A depth result is usable for the split only when it contains at least one `SP` label matching a dated-roster pitcher. If not usable—including missing payload, omitted `roster`, empty result, request failure, or no matched SP—the authoritative fallback is:

```text
bullpen = dated roster pitchers - Schedule selected starter
additionalStarters = []
```

The bullpen lineage sets `fallbackUsed: true` in that case. The later user option to include additional starters in the displayed bullpen will combine collections only at the presentation boundary; it cannot change normalized membership.

## 4. People identity and statistics

People candidates enrich person identity by ID but never add membership. Statistic groups are selected independently using the complete semantic scope:

- person ID;
- requested sport/level ID;
- requested game-type set;
- requested `byDateRange` type;
- requested start/end dates; and
- hitting or pitching group.

Within a returned group, one exact requested-sport split is preferred. If no exact split exists, one explicit all-sport split may be selected and is labeled `aggregate.selection: all`. Multiple equally scoped splits are `ambiguous`; absence is `omitted`. Neither condition falls through to the first response item.

Only source-provided statistic keys are projected. Numeric-looking values are normalized, placeholder values become null, and missing totals are not created.

People units are independently retryable. Successful units are merged by person ID. If some units fail, the People source result is `partial`; successful people keep their statistics, while identities assigned to failed units retain `{}` and receive exact `failed` stats lineage. Zero-filled substitute statistics are prohibited.

## 5. Staff selection

Staff results are date/season scoped. Manager candidates are selected in this order:

1. entries with job ID `MNGR` or exact job `Manager`;
2. only when no explicit candidate exists, entries whose job/title contains Manager.

Exactly one candidate yields `available`; none yields `missing`; multiple candidates yield `ambiguous` and `selected: null`. Response order is not a tie-break.

All non-manager entries remain in `coaches`. Categories are deterministic: bench, bullpen, pitching, hitting, catching, base, other, or unknown. Staff people use the same schema-v2 person shape without claiming unavailable handedness or position details.

## 6. Lineage and failure semantics

Build 004.4 appends one source result per roster, coaches, and depth request plus one aggregate People source result. It replaces the Schedule skeleton's exact not-requested role lineage and adds exact statistic lineage where needed.

Important distinctions remain explicit:

- no posted lineup → bench `unposted`;
- valid empty derived collection → `present-empty`;
- successful depth response with no usable SP annotations → additional starters `omitted` plus bullpen fallback;
- depth never requested → additional starters `not-requested` plus bullpen fallback;
- ambiguous statistic split → `ambiguous`;
- missing returned statistic group/person → `omitted`; and
- failed People unit/person → `failed`.

## 7. Reproducible fixtures

`tools/generate-v030-roster-people-fixtures.mjs` writes one bounded source-case file and two normalized outputs:

- `v030-mlb-two-way-manager-depth-partial-people-normalized.json`; and
- `v030-milb-depth-absence-fallback-normalized.json`.

The first combines two-way roles, manager ambiguity, roster/depth intersection, an additional starter, and partial People units. The second proves the Single-A no-annotation fallback. Tests regenerate both byte-for-byte, validate the full schema, and assert the critical source-precedence invariants independently.
