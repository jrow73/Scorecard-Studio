# Build 017 Implementation

Status: **Implementation complete; browser acceptance pending.**  
Baseline: accepted `ScorecardStudio_v0.2.0_Build016.zip`.

## Scope delivered

- Away and Home Starting Pitcher are presented as single records in the Designer palette, with expandable attributes.
- Each Starting Pitcher attribute remains independently reusable as a Single Item.
- The runtime registry exposes the established source-backed Starting Pitcher player/pitching family: Player Name, Jersey #, Throws, games/games pitched/games started, W, L, W-L, ERA, WHIP, IP, hits, runs, earned runs, home runs, walks, strikeouts, saves, save opportunities, holds, blown saves, established pitching rate fields, and the compact pitching summary. Unverified opponent AVG remains excluded.
- Record Layout reuses the existing block/slot geometry and content machinery with one record, one slot, and one placement anchor. It is identified by `type: "record"` plus a record context; it is not hard-coded as a separate Starting-Pitcher rendering engine.
- Repeated Layout and Record Layout slot content now share `content.type = "field" | "template"` resolution. Template tokens are restricted to the current collection/record context and resolve against the current row or record.
- Player Name supports Full Name, First Initial + Last Name, Last Name, First Name, and Use Name + Last Name. Formatting is stored on the content placement and falls back to the source full name when the selected source-backed variant is unavailable; names are never split heuristically.
- Slot content retains independent X anchor/offset, font size, and Left/Center/Right alignment.

## Compatibility

- Existing field-only repeated columns continue to work. On load, a legacy column without `content` receives `{ type: "field", field }` without changing its geometry.
- Existing scalar mappings, Text Templates, Individual Placement, repeated vertical/horizontal/grid layouts, coordinates, alignment, and PDF generation remain on their accepted paths.
- Legacy Starting Pitcher field IDs remain canonicalized.
- The Build 016 template token labels `[Away Starting Pitcher]` and `[Home Starting Pitcher]` remain resolvable after the new explicit `— Player Name` labels were introduced.
- New layout data raises the layout schema floor to 7 only when Record Layout or slot-template content is created; existing records require no destructive migration.

## Deliberate exclusions

Build 017 does not add static or conditional colors, fit/shrink behavior, Undo/Redo, full-capacity synthetic preview filling, capacity-warning polish, or a broader batter/pitcher field-coverage expansion outside the Starting Pitcher record.

## Changed implementation surfaces

- `js/field-registry.js`: Starting Pitcher field family, record metadata, composites, and legacy label compatibility.
- `js/normalize.js`: established pitching leaves already present in the embedded season/YTD feed.
- `js/formatter.js`: source-backed player-name formatting.
- `js/slot-content.js`: shared contextual field/template slot resolver.
- `js/app.js`: Designer palette, Record Layout workflow, slot-content editor/preview/inspector, persistence, dependency collection, and PDF output.
- `index.html`: Build 017 controls and cache keys.
