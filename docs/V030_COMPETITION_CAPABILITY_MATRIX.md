# Scorecard Studio v0.3.0 — Competition Capability Matrix

**Introduced:** Build 002.6  
**Evidence authority:** `docs/V030_API_EVIDENCE_MANIFEST.md`  
**Interpretation authority:** `docs/V030_API_FINDINGS.md`

## Purpose and status vocabulary

This matrix records only the bounded source capabilities observed through Build 002.6. It is not a claim that every club, season, game state, or competition will behave identically.

- **Supported** — the requested source and relevant shape were observed in the named context.
- **Conditional** — useful data was observed, but a required qualifier, fallback, or semantic limitation prevents unconditional use.
- **Absent** — the request succeeded but the relevant payload was omitted in the sampled control.
- **Untested** — no evidence fixture establishes the capability in that context.

All historical observations are current refetches unless a fixture is explicitly marked `live-snapshot`. They prove present retrievability, not what mutable data looked like on the original game date.

## Required context keys

Future adapters and normalized provenance must not infer competition from a team name or a calendar date alone. Preserve these keys when applicable:

| Key | Meaning |
|---|---|
| `sportId` | Level/sport identity: MLB `1`, Triple-A `11`, Double-A `12`, High-A `13`, Single-A `14` in the tested controls. |
| `gameType` | Competition segment: spring `S`, regular season `R`, Wild Card `F`, Division Series `D`, League Championship `L`, World Series `W`. |
| `season` | Requested/source season; not proof that every endpoint is historically versioned. |
| `officialDate` / cutoff | Game date or end-of-day standings/stat cutoff, retained separately from retrieval time. |
| `leagueId` / `divisionId` | Source group identity for standings and league-specific data. |
| `standingsType` | `regularSeason`, `springTraining`, `postseason`, or another explicitly requested source type. |
| `statType` and requested `gameType[]` | People-stat scope. A date range alone does not select spring or postseason statistics. |

The minimum competition identity is therefore `sportId + gameType`; endpoint-specific keys must be added rather than collapsed into an unqualified “season” label.

## Regular-season level matrix

| Source family | MLB | Triple-A | Double-A | High-A | Single-A | Evidence boundary |
|---|---|---|---|---|---|---|
| Hydrated Schedule game | Supported | Supported | Supported | Supported | Supported | Final historical controls at all four MiLB levels returned `R`, two probable pitchers, and two nine-player lineups. Live publication timing remains separately bounded. |
| Game feed / embedded boxscore | Supported | Supported | Supported | Supported | Supported | MiLB feeds returned team/player maps and officials; crew counts were 3/3/2/2 rather than an MLB four-person assumption. |
| Separate boxscore endpoint | Supported | Untested | Untested | Untested | Untested | Feed boxscore presence does not prove parity for the separate production request. |
| Dated active roster | Supported | Supported | Supported | Supported | Supported | High-A and Single-A controls each returned 27 active rows; prior builds covered Triple-A and Double-A. Membership remains date-scoped, not gamePk-scoped. |
| People `byDateRange` | Supported | Conditional | Conditional | Conditional | Conditional | Each MiLB level required explicit `sportId` plus `gameType=[R]`; each sampled pitcher returned its level split and `All`. The unscoped multi-person control returned identity only. |
| Dated coaches | Supported | Supported | Supported | Supported | Supported | Sampled staff sizes vary and repeated/ambiguous roles remain valid. No universal role taxonomy is claimed. |
| Regular-season standings | Supported | Supported | Supported | Supported | Supported | Triple-A and lower-level groups have non-MLB cardinalities; sampled AA/High-A/Single-A leagues each returned two six-team divisions. |
| Depth chart | Conditional | Absent | Absent | Absent | Absent | MLB is annotation-only. Sampled MiLB requests succeeded but omitted `roster`; dated roster-pitchers-minus-starter remains authoritative fallback. |
| Current team-logo SVG | Conditional | Conditional | Conditional | Conditional | Conditional | Current assets were observed at every sampled level. URLs are current-brand-only, optional, and require status/MIME validation plus text fallback. |
| Extended venue metadata | Supported | Supported | Untested | Untested | Untested | Lower-level game fixtures preserve venue identity, but the narrow season-scoped Venue endpoint was not separately compared for AA/High-A/Single-A. |

“Supported” above applies to the sampled historical Final controls and endpoint shape. It does not establish future/pregame MiLB availability, live transition timing, every league, or every club.

## MLB competition matrix

| Source family | Spring training (`S`) | Regular season (`R`) | Wild Card (`F`) | Division Series (`D`) | LCS (`L`) | World Series (`W`) | Boundary |
|---|---|---|---|---|---|---|---|
| Hydrated Schedule game | Supported | Supported | Supported | Supported | Supported | Supported | Each sampled Final control returned two probable pitchers and two nine-player lineups. Build 002.2 separately captured live postseason Scheduled/Pre-Game differences. |
| Game feed / embedded boxscore | Supported | Supported | Supported | Supported | Supported | Supported | Spring returned four officials; all four sampled postseason rounds returned six. Preserve role-bearing collections. |
| People `byDateRange` | Conditional | Supported | Conditional | Conditional | Conditional | Conditional | Competition totals require explicit `gameType[]`. Spring `S`, regular `R`, and combined `F,D,L,W` produced separate totals; do not merge them implicitly. |
| Standings | Conditional | Supported | Conditional | Conditional | Conditional | Conditional | Request explicit `springTraining` or `postseason`. The postseason response is standings data, not a bracket or round/series model. |
| Dated roster/coaches | Conditional | Supported | Conditional | Conditional | Conditional | Conditional | The endpoints are date-scoped rather than competition-scoped; no Build 002.6 evidence establishes special tournament roster semantics. |
| Depth chart | Untested | Conditional | Untested | Untested | Untested | Untested | Current, season-insensitive annotation cannot establish competition-specific or historical roles. |
| Team logo | Conditional | Conditional | Conditional | Conditional | Conditional | Conditional | Asset capability follows team ID and current brand, not game type or historical competition. |

## Adopted boundaries

1. Route sources with explicit competition context. Never let an MLB-default request silently stand in for MiLB, spring, or postseason data.
2. Keep regular-season, spring, and postseason People-stat aggregates separate. A combined display is a later product calculation with explicit provenance, not a source fact.
3. Preserve varying officials collections. Do not normalize MiLB to four officials or postseason to the regular-season crew shape.
4. Treat MiLB depth-chart omission as normal unavailability. It must not remove active pitchers or block roster-pitchers-minus-starter fallback.
5. Keep standings source-faithful. Do not impose MLB group counts on MiLB or interpret postseason standings as a bracket.
6. Surface unsupported or untested contexts as availability/provenance states, not fabricated empty data.

## Remaining validation

- Future/pregame and live-transition timing at each MiLB level.
- Separate MiLB boxscore endpoint parity.
- Narrow Venue endpoint comparison below Triple-A.
- Competition-specific roster rules and staff behavior in spring/postseason.
- Broader MiLB league, split-season, and organization coverage.
- Live observations capable of testing changes after these historical responses were captured.

