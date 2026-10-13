# Scorecard Studio v0.3.0 — Build 001 Closure

**Build:** 001.4  
**Status:** Closed  
**Closure date:** 2026-10-05  
**Application baseline:** committed Scorecard Studio v0.2.0  
**Baseline SHA-256:** `D1726D62573A72A54FA8395598AEFD8C644CDDA753CCE8E753473E4CC67B54BE`

## 1. Closure statement

Build 001 — Current Data Inventory and API Reconnaissance Planning — is complete.

The build established a code-backed map of the v0.2.0 data system, reconciled every executable field with its real source chain, separated current behavior from historical/planned documentation, and produced a prioritized evidence backlog for Build 002.

Build 001 made no application-code changes and no live MLB API probes. The committed v0.2.0 behavior remains the control against which future discoveries must be evaluated.

## 2. Completed increments

| Increment | Deliverable | Result |
|---|---|---|
| 001.1 | `V030_DATA_SOURCE_AUDIT.md` | Traced all runtime requests, parameters, consumed payload data, transformations, precedence, storage, and consumers |
| 001.2 | `V030_NORMALIZED_FIELD_MATRIX.md` | Reconciled all 223 executable fields and normalized/model gaps |
| 001.3 | `V030_API_DISCOVERY_BACKLOG.md` | Classified 22 discovery records and defined evidence/fixture requirements |
| 001.4 | This closure + `V030_BUILD_002_PLAN.md` | Accepted scope decisions and sequenced the active discovery build |

`Build_001.md` is the cumulative build record. The three detailed audit/backlog documents remain separate authorities rather than being collapsed into one summary.

## 3. Current implementation facts

### Request families

The v0.2.0 application uses seven MLB request families:

1. hydrated Schedule;
2. Game Feed / Game Pack;
3. Game Boxscore;
4. dated Team Roster;
5. bulk People with `byDateRange` hitting/pitching statistics;
6. dated Team Coaches; and
7. dated League Standings.

All explicit requests use `cache: "no-store"`. API data and normalized models live only in page memory. IndexedDB persists settings, layouts, and PDF templates—not MLB responses or normalized game snapshots.

### Production source model

The production path is Schedule/Roster/People/Standings-first:

- Schedule supplies selected-game context, original lineup, probable pitcher, team, venue/weather, status, and doubleheader metadata.
- Dated rosters establish game-date membership and support bench/bullpen derivation.
- People supplies canonical player metadata and prior-day pregame statistics.
- Standings supplies prior-day team record and standings context.
- A completed earlier same-day boxscore may override player statistics and team record for Game 2.
- Game Feed is lazy supplemental data for umpires and richer venue/game fallback.
- Coaches is lazy supplemental data for manager fields.

This differs materially from the older Game-Pack-first architecture preserved in historical prose.

### Executable field contract

The runtime registry contains:

- 223 resolvable fields;
- 171 active catalog fields (64 Standard, 107 Custom);
- 52 compatibility-only fields;
- 125 scalar and 98 repeated fields.

All 223 resolve against the representative model. The catalog is structurally coherent, but its source metadata is not: 203 fields are labeled `gamePack`, including fields actually populated by Schedule, roster, People, prior boxscore, or local derivation.

### Model gaps

The current normalized model lacks value-level provenance, cutoff metadata, explicit source errors, and rich availability states. It also contains unpopulated placeholders for:

- categorized coaching collections;
- defensive views; and
- full standings groups.

Several useful normalized values are not separately exposed, including game type, venue timezone, source IDs, player name variants, and detailed statistics. Those are catalog/model decisions, not automatically API gaps.

## 4. Doubleheader boundary

The accepted v0.2.0 Game 2 policy remains the architectural control:

- before Game 1 is Final, Game 2 uses the prior-day player/team/standings snapshot and does not infer Game 1 results;
- after Game 1 is Final, Game 2 may use Game 1 boxscore player `seasonStats`, post-Game-1 team record, next team game number, and a locally advanced streak;
- Game 2 lineup is never borrowed from Game 1;
- division/league/Wild Card rank, games back, Last 10, and related standings context remain prior-day values.

League-wide intraday reconstruction is rejected. Build 002 may adopt a reliable single-source between-games snapshot if one is discovered, but absence of such a source does not reopen reconstruction by inference.

## 5. Documentation authority

| Question | Authority after Build 001 |
|---|---|
| What requests does v0.2.0 make and how are they cached? | `V030_DATA_SOURCE_AUDIT.md` plus executable `api.js`/`app.js` |
| Which source wins for a normalized value? | `V030_DATA_SOURCE_AUDIT.md`, `V030_NORMALIZED_FIELD_MATRIX.md`, and executable `normalize.js` |
| Which fields can v0.2.0 resolve? | Executable `js/field-registry.js` |
| Which current fields are active versus compatibility-only? | `V030_NORMALIZED_FIELD_MATRIX.md` and executable registry |
| What remains to investigate? | `V030_API_DISCOVERY_BACKLOG.md` |
| How will investigation be executed? | `V030_BUILD_002_PLAN.md` |
| What was historically observed in one Game Pack fixture? | `GAME_PACK_FIELD_MATRIX.md` |
| What is historical product/field intent? | `PREGAME_DATA_INVENTORY.md` and `FIELD_REGISTRY.md`, subject to Build 001 reconciliation |

The older documents remain unchanged and valuable as evidence/history. They are not literal descriptions of every current runtime path.

## 6. Accepted decisions

### MiLB compatibility boundary

MiLB is an architectural compatibility requirement. Build 002 must test representative levels, preserve sport/league identifiers, and identify unsupported families. Build 001 does not declare universal MiLB support or require every MLB field to exist at every level.

### Depth charts and logos

Both remain in Build 002:

- pitcher depth charts are higher priority because they may annotate or refine the existing bullpen/rotation model;
- team logos are a bounded asset feasibility study for later Designer/PDF work and must not imply historical brand accuracy merely because an SVG exists.

### Advanced research

Batter-versus-pitcher, platoon, situational, head-to-head, recent-form, and similar broadcaster research remains deferred. It is a possible future Game Day capability, not part of the traditional normalized scorecard core.

### Evidence before implementation

Build 002 may create investigation scripts, fixture manifests, minimized raw evidence, comparison output, and documentation. Production API adapters, the normalized model, registry, UI, and README remain unchanged until discovery results support an explicit adoption decision.

## 7. Known evidence controls

Build 002 begins with these existing controls:

| Control | Evidence |
|---|---|
| Recorded pregame feed | gamePk `822955`, SEA at TB, recorded Pre-Game/Preview on 2026-07-10 |
| Historical doubleheader Game 1 | gamePk `777447`, STL at CHW, 2025-06-19 |
| Historical doubleheader Game 2 | gamePk `777458`, same matchup/date |
| Traded-player aggregate splits | Taylor Ward; Seranthony Domínguez |
| Single-team aggregate split | Cal Raleigh |
| MLB-debut stat boundary | Colt Emerson |

The recorded pregame state of gamePk `822955` cannot be recreated by fetching the now-completed game; its historical documentation remains fixture evidence only.

## 8. Unknowns forwarded to Build 002

Build 002 must establish evidence for:

- Schedule publication timing and exceptional game states;
- umpire timing and crew roles;
- venue/timezone completeness and merge behavior;
- dated roster historical/transaction semantics;
- People-stat competition and sport scope;
- standings/Wild Card/date semantics;
- coaches roles, ambiguity, and historical behavior;
- depth-chart reliability and historical limitations;
- logo coverage and asset behavior;
- full standings group normalization;
- MiLB source-family parity; and
- spring-training/postseason boundaries.

Rare live cases—especially a real doubleheader transition—remain opportunistic validations and must not block all other discovery work.

## 9. Build 001 acceptance checklist

- [x] Immutable v0.2.0 baseline identified and hashed.
- [x] Every active API wrapper and `fetch()` caller inventoried.
- [x] Consumed response paths and source precedence documented.
- [x] Memory/cache/IndexedDB behavior documented.
- [x] All 223 executable fields reconciled.
- [x] Active, compatibility, internal, placeholder, and planned concepts separated.
- [x] Existing source documents classified without rewriting them.
- [x] API discovery questions prioritized and given evidence requirements.
- [x] Rejected and deferred scope recorded.
- [x] Build 002 split into bounded evidence increments.
- [x] No application code or README changes made.
- [x] v0.2.0 release regression check remains passing.

## 10. Closure outcome

Build 001 is complete and ready to archive as the reconnaissance foundation for v0.3.0. Build 002 should now execute the evidence plan without redesigning production behavior during discovery.
