# Build 025.3 — Name-Format Fidelity & Cross-Page Clipboard Fix

## Purpose

Build 025.3 is a corrective follow-up to the Build 025 live-PDF integration. Acceptance testing found two remaining defects that are independent of the new pregame API model:

1. Player Name formats were not reliably resolving the exact API-backed name property in every Designer/PDF rendering path. Boxscore Name was the visible failure, but First Name and Use Name also needed source-fidelity verification.
2. The Designer clipboard could be cleared when navigating between PDF pages after copying an object or multi-selection.

This build does not change the Build 025.2 pregame Schedule/Roster/People/Standings architecture.

## 025.3-01 — Canonical player-name source fidelity

All player contexts now use the same shared formatter contract:

| Name Format | Source property |
| --- | --- |
| Full Name | `player.name` (normalized from API `fullName`) |
| First Initial + Last Name | `player.initLastName` |
| Last Name | `player.lastName` |
| First Name | `player.firstName` |
| Use Name + Last Name | `player.useName` + `player.useLastName` |
| Boxscore Name | `player.boxscoreName` |

The formatter no longer substitutes Use Name for First Name or Use Last Name for Last Name. Missing source variants render blank rather than silently becoming Full Name. This prevents a plausible-looking value from hiding a bad mapping.

Human-readable/legacy stored format labels such as `Boxscore Name`, `First Name`, and `Use Name + Last Name` are canonicalized to the same formatter keys so older saved layouts do not silently fall back to Full Name.

## 025.3-02 — Shared Text Template formatter path

`slot-content.js` now imports the Build 025.3 formatter explicitly, and `app.js` loads the Build 025.3 slot-content module. This removes the possibility that direct fields and repeated/record Text Templates use different cached formatter module versions in the browser.

This is especially important for Starting Pitcher and Bullpen record Text Templates, where acceptance testing showed different incorrect Boxscore Name behavior despite the normalized data containing valid values.

## 025.3-03 — Representative Data hardening

Representative Data now includes deliberately different values for Full/First/Use/Boxscore name forms so incorrect mappings are visually obvious rather than accidentally passing because several properties contain the same text.

Examples used by acceptance testing include:

- Bo Yu: Full `Bo Yu`; First `Robert`; Use `Bo Yu`; Initial `R. Yu`; Boxscore `Yu, B`.
- Nico Bell: First `Nicholas`; Use `Nico Bell`; Boxscore `Bell, N`.
- Silas Crowe: First `Silas`; Use `Si Crowe`; Boxscore `Crowe, S`.
- Thaddeus McAllister: First `Thaddeus`; Use `Thad McAllister`; Boxscore `McAllister, T`.

## 025.3-04 — Clipboard survives page navigation

Designer Previous/Next Page navigation now clears stale source-page selection with `preserveClipboard: true`.

Expected behavior:

1. Select one object or a multi-selection.
2. Copy it.
3. Navigate to another PDF page with Previous/Next.
4. Clipboard remains available.
5. Paste on the destination page normally.

Existing paste-once behavior, ghost placement, and Away/Home translation remain unchanged.

## Changed files

- `js/formatter.js`
- `js/slot-content.js`
- `js/sample-data.js`
- `js/app.js`
- `index.html`
- `app-meta.json`
- `tests/build0253.test.mjs`
- `docs/AI.md`
- `docs/Build_025_3_Implementation.md`

## Acceptance checklist

### Name formats — Representative Data

For at least one Lineup, Bench, Bullpen, and Starting Pitcher Player Name placement/template, verify all six formats independently:

- [ ] Full Name uses the representative Full Name.
- [ ] First Initial + Last uses the explicit Initial + Last value.
- [ ] Last Name uses Last Name.
- [ ] First Name uses First Name, not Use Name.
- [ ] Use Name + Last uses Use Name + Use Last Name.
- [ ] Boxscore Name uses Boxscore Name.
- [ ] Silas Crowe Bullpen Boxscore renders `Crowe, S`.
- [ ] Thaddeus McAllister Starting Pitcher Boxscore renders `McAllister, T`.
- [ ] Thaddeus McAllister Use Name renders `Thad McAllister` while First Name remains `Thaddeus`.

### Name formats — Live data

- [ ] A player whose API `boxscoreName` differs from Full Name prints that exact value.
- [ ] A player whose `firstName` and `useName` differ prints the correct distinct values in each format.
- [ ] Lineup, Bench, Starting Pitcher, Bullpen, and Individual Placement use the same name-source rules.

Taylor Ward is a useful live-data check when available: API data has First Name `Joseph`, Use Name `Taylor`, Full Name `Taylor Ward`, and Boxscore Name `Ward, T`.

### Clipboard

- [ ] Copy a single object on page 1, click Next Page, and confirm Paste remains enabled.
- [ ] Paste the object successfully on page 2.
- [ ] Repeat using Previous Page.
- [ ] Repeat with a multi-selection.
- [ ] Confirm initiating clipboard ghost placement before page navigation also remains usable after the page change.
- [ ] Confirm Away -> Home / Home -> Away translated paste behavior is unchanged.

### Regression

- [ ] Build 025.2 pregame lineup/SP/Bench/Bullpen behavior remains unchanged.
- [ ] Pregame player/team stat cutoff behavior remains unchanged.
- [ ] Designer Test PDF and Home Live PDF continue to use the shared renderer.
