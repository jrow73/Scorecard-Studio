# Scorecard Studio v0.4 Product-Surface Contract

**Status:** Build 001.1 authority  
**Baseline:** v0.3.0 final  
**Purpose:** Assign clear responsibilities to each user-facing surface and prevent development scaffolding from becoming accidental product behavior.

## 1. Surface boundaries

| Surface | Primary job | Should contain | Should not become |
|---|---|---|---|
| Home | Select a game, communicate lineup readiness, and launch the next action | Favorite-team/today readiness; date and level browser; game list; compact matchup/time/status; optional probable `SP vs SP`; Generate Scorecard and Open Game Day actions | A roster, statistics, venue/weather, or API-debug dashboard |
| Game Day | Research-level pregame companion | Broad user-facing registry coverage; variable-length player/staff/official collections; standings; venue/weather; honest availability; advanced expandable detail | A constrained imitation of a printed scorecard or a raw diagnostic table |
| Settings | Persistent application preferences | Favorite level/team; favorite layout or related defaults; future system/light/dark appearance; other truly global behavior | Game-specific display choices or layout-specific PDF semantics |
| Layouts / Designer | Build deterministic printable scorecards | User-selected mappable fields; schema-v2 representative data; formatting; repeated collections; Test PDF; per-layout pitcher-group choices | A promise to expose every internal normalized or provenance value |
| Field Diagnostic | Development/release verification | Automated tests and generated engineering evidence after retirement | A normal end-user navigation destination |

## 2. Home contract

### 2.1 Initial state

On startup, Home reads the saved favorite competition and team, requests that team's schedule for the user's current local date, and displays one or more matching games without imposing an MLB default.

If no favorite exists, Home presents a concise setup route and still permits date/level game browsing.

### 2.2 Readiness states

| State | Meaning |
|---|---|
| Ready | Both original starting lineups are posted for the selected game view. |
| Partial | Exactly one starting lineup is posted, or the source explicitly supplies an incomplete lineup state. |
| Waiting | The game is scheduled but neither starting lineup is posted. |
| No game | No game matches the favorite team/date or selected date/level filter. |
| Postponed / Cancelled / Suspended / Final | Display the source-derived game state rather than forcing it into a readiness label. |
| Unavailable | The schedule request or required identity selection failed. |

Unknown source status tuples remain explicit rather than being mapped to the nearest familiar state.

### 2.3 Compact selected-game content

Home may display:

- away team at home team;
- scheduled time and current source status;
- lineup readiness;
- probable `SP vs SP`, using `TBD` independently for either missing pitcher;
- multiple-game selection when the team has a doubleheader or other same-date schedule;
- Open Game Day;
- Generate Scorecard and layout selection appropriate to that action.

Home does not need full lineup, bench, bullpen, statistics, officials, venue-detail, weather-detail, or standings sections.

### 2.4 Hydration boundary

Normal Home readiness uses Schedule data. It must not automatically fetch dated rosters, bulk People statistics, standings, coaches, depth charts, Feed, narrow Venue detail, or earlier-game Boxscore merely to render the landing page.

Full hydration occurs when:

- the user opens Game Day; or
- live PDF generation determines that the selected layout requires those capabilities.

Doubleheader identity may require a bounded Schedule refresh. A completed earlier game's Boxscore is not needed until a consumer requests values affected by the Game 2 overlay.

## 3. Game Day contract

Game Day is the scorecard companion. It favors completeness and navigation over print density.

### 3.1 Required domains

- game identity, dates, status, competition, and time;
- team identity, record, standings, streak, and recent performance;
- posted lineups and the full supported hitting-stat set;
- starting pitchers and the full supported pitching-stat set;
- additional starting pitchers and core bullpen as distinct groups;
- bench players and supported hitting data;
- manager and categorized coaching staff;
- variable source-faithful umpire crew;
- venue, location, surface, roof, capacity, weather, and other adopted detail;
- meaningful unavailable, ambiguous, partial, and fallback indicators.

Information may be grouped in expandable sections. “Nearly all registry information” does not require repeating equivalent composite and component values when one readable presentation communicates them without loss.

### 3.2 Pitcher truthfulness

When depth-chart annotations classify the active pitcher pool, Game Day displays:

1. Selected Starting Pitcher
2. Additional Starting Pitchers
3. Bullpen / Relievers

When usable annotations do not exist, the authoritative fallback remains dated roster pitchers minus the selected starter. Game Day labels that group **Other Active Pitchers — roles not classified** rather than representing every member as `RP`.

Game Day never inherits a Home display preference that suppresses research information.

## 4. Settings contract

Favorite Team is stored with competition context. The logical setting is:

```text
favoriteCompetition {
  levelKey
  sportId
  teamId
  teamName
  leagueId?
  leagueName?
}
```

This is a product model, not a requirement to expose raw IDs in the UI.

Existing v0.3 favorites contain MLB team identity only. Migration treats them as MLB (`sportId: 1`) and retains their team ID/name. Migration must not clear the favorite or require reselection.

Appearance and other future settings may extend the same surface. A setting is global only when changing it should intentionally affect every relevant workflow.

## 5. Designer and PDF contract

Layout output must be deterministic from the layout plus selected game data. Global Home controls must not silently change a saved layout's bullpen membership.

New repeated pitcher blocks store their own group mode:

- `core` — normalized `bullpen` only;
- `combined` — person-ID-deduplicated `bullpen + additionalStarters`; or
- `additional` — normalized `additionalStarters` only.

Build 001.7 persists that choice as `pitcherGroup` on each new bullpen repeated block. Existing blocks without the property retain historical `combined` behavior without being rewritten during load. Preview, Test PDF, live PDF, sorting, overflow, and conditional formatting all resolve through the same selected row set.

## 6. Field Diagnostic retirement

The current diagnostic's valuable responsibilities are:

- enumerate active catalog definitions;
- resolve each against a model;
- report availability, coverage, capability/source, and failures;
- catch catalog/sample/runtime drift.

Before removing its normal navigation and UI, Build 001.2 must reproduce those responsibilities through automated tests and a generated development report. Removal must not reduce release confidence or delete the underlying resolution metadata.

## 7. Acceptance principles

1. Home is useful before full roster/stat hydration completes.
2. Game Day does not hide known research information to imitate print constraints.
3. Settings own persistent user preferences.
4. Layouts own choices that affect generated PDF structure.
5. Debugging and coverage evidence remain available without occupying normal user navigation.
6. Every source limitation is represented as availability or fallback, not a fabricated fact.
