# Scorecard Studio v0.5 — Research Findings

**Status:** Build 001.2 evidence incorporated  
**Date:** 2026-10-13  
**Baseline:** accepted Scorecard Studio v0.4.0, Build 004.9

## 1. Season and competition context

The normalized model already distinguishes competition scope. Regular-season, spring-training, half-season, and postseason totals must remain separate.

### MLB presentation phases

1. **Preseason** — spring-training and exhibition contexts.
2. **Regular season, early/midseason** — regular-season games before September 1.
3. **Regular season, playoff race** — regular-season games on or after September 1.
4. **Postseason** — Wild Card, Division Series, League Championship Series, and World Series.
5. **Other/unknown** — All-Star or unrecognized contexts, with conservative display.

September 1 is a presentation rule, not an API fact. It controls prominence of MLB Wild Card information and must not change the underlying data scope.

### MiLB presentation phases

Official MiLB material documents split-season qualification. Build 001.2 then verified explicit `firstHalf` and `secondHalf` Stats API standings at Triple-A, Double-A, High-A, and Single-A.

Therefore MiLB must:

- use returned half-season standings when available;
- avoid a hard-coded universal half-transition date;
- fall back to ordinary division context when half standings are unavailable;
- never label overall records as half records without source evidence;
- never apply MLB Wild Card labels.

Primary procedural reference: <https://www.milb.com/events/playoffs/procedures>

## 2. Postseason player-stat scopes

Regular-season totals are not a substitute for postseason totals, and date range alone does not safely imply postseason inclusion.

For postseason games, v0.5 should independently hydrate/cache:

- **Regular Season:** game type `R`
- **Postseason:** game types `F,D,L,W` combined through the pregame cutoff

Build 001.2 verified populated, distinct postseason People totals at all four supported MiLB levels using explicit sport and competition scopes. Per-player absence remains possible and must be modeled honestly.

The toggle changes only Game Day player-stat presentation. It does not initially change the selected game, roster, lineup, team context, venue, officials, or generated PDF.

## 3. Baseball Savant field diagrams

The referenced scorecard-prep site demonstrates a suitable static-site method:

1. A development-time script discovers Baseball Savant's current player-page bundle.
2. It extracts park SVG components keyed by MLB venue ID.
3. It keeps geometry/distance labels while removing source colors.
4. It packages a local JSON artifact.
5. The page renders inline SVG with its own theme-aware CSS.

Inspected sources:

- <https://skipple.github.io/mlb-scorecard-prep/>
- <https://skipple.github.io/mlb-scorecard-prep/tools/build-stadiums.js>
- <https://baseballsavant.mlb.com/savant-player/660271>

On 2026-10-13, the referenced artifact contained 37 venue IDs and covered all 30 current venue IDs in Scorecard Studio's 2026 MLB team control. This is coverage evidence, not permission or a stable API guarantee.

Recommended boundaries:

- implement an independent extractor rather than copying the reference code;
- extract only during development/release, never in Game Day;
- commit a sanitized, validated local geometry artifact;
- allowlist SVG elements/attributes;
- fail visibly if the upstream bundle structure or minimum coverage changes;
- attribute the source and confirm reuse terms before release;
- treat diagrams as MLB-only unless separately evidenced;
- retain textual field dimensions as the universal fallback.

## 4. Player identity and pronunciation

People metadata distinguishes:

- `fullName` — usually the preferred public name;
- `firstName` / `lastName` — formal components;
- `useName` / `useLastName` — preferred components;
- `fullFMLName` — may include middle names;
- `pronunciation` — optional and sometimes partial.

Build 001.2 captured four controls:

| Displayed name | Formal first + last | Pronunciation |
| --- | --- | --- |
| Cal Raleigh | Caleb Raleigh | `rah-lee` |
| Josh Naylor | Joshua-Douglas Naylor | unavailable |
| Shohei Ohtani | same as displayed | `show-HEY oh-TAWN-ee` |
| Aaron Judge | same as displayed | unavailable |

The popover must:

- show `firstName + lastName` only when it differs from the displayed name;
- show pronunciation whenever supplied;
- preserve source text verbatim and never synthesize missing syllables;
- disappear entirely when neither item adds information;
- support hover, keyboard, and touch.

Verified endpoint: <https://statsapi.mlb.com/api/v1/people?personIds=663728,647304,660271,592450>

## 5. Remaining gates

1. Stable access, attribution, and reuse terms for derived Baseball Savant geometry.
2. Diagram coverage for alternate, international, neutral-site, and future renamed/replaced parks.
3. Whether generated scorecards should ever honor the Game Day Regular Season/Postseason selection.

These gates are isolated so they cannot block season-aware presentation, the player-stat toggle, or player identity popovers.
