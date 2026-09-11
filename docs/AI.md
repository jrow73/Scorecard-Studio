# Project: Scorecard Studio

## Overview

Scorecard Studio is a lightweight, fully browser-based web application
for creating pre-game baseball scorecards.

The app lets users upload multi-page PDF scorecard templates, customize
how MLB or MiLB player and game data is formatted and color-coded, map
data fields interactively to PDF pages, and generate filled-in PDFs
using live data from the MLB Stats API.

Scorecard Studio is intentionally a **pre-game preparation tool**, not a
live in-game display. Generated scorecards are intended to be printed or
imported into an annotation app such as GoodNotes for use during the
game.

The application is hosted as a static site using GitHub Pages. All
user-created layouts, settings, PDF templates, mappings, and cached data
are stored locally in the user's browser. No locally hosted Python server or
application backend is required.

As of **v0.1.0**, the browser architecture has been proven end-to-end in both
the local VS Code Live Server environment and the deployed GitHub Pages
environment.

---

## Architecture Principles

-   **Static web application:** The production application must run
    directly from GitHub Pages without a server-side runtime.
-   **Browser-first:** MLB API access, PDF manipulation, layout design,
    storage, and scorecard generation should occur in the user's browser
    whenever possible.
-   **No framework:** Use vanilla HTML, CSS, and JavaScript with
    standard ES modules.
-   **Modular JavaScript:** Keep application responsibilities separated
    into focused modules rather than placing the entire application in
    one large `app.js`.
-   **Local-first data:** User layouts, settings, PDF templates, and
    cached game data remain on the user's device unless explicitly
    exported by the user.
-   **Portable layouts:** Layouts must be exportable and importable so
    users can back up their work and transfer it between browsers or
    devices.
-   **Pregame only:** Do not introduce live scores, inning state, or
    other spoiler-prone in-game information into the primary workflow.

-   **Lazy/on-demand pregame hydration:** The Home / Select Game workflow should
    use the schedule and game-feed/game-pack data needed to identify and preview
    available games. Do not fetch supplemental manager, standings, player-stat,
    or other cross-reference data merely because a game appears on Home.
    Supplemental data should be fetched when the user explicitly opens Game Day for a selected game, or after the user selects the game
    and layout to generate (or invokes an equivalent one-click generation
    workflow), and ideally only for field categories actually required by that
    layout.

### Development environment terminology

During development and acceptance testing:

- **Local** means the VS Code Live Server version (for example, `127.0.0.1:5000`).
- **Online** means the deployed GitHub Pages version (`github.io/Scorecard-Studio/`).

Major builds should be acceptance-tested in both environments when practical.

---

## Tech Stack

-   **Frontend:** Vanilla HTML, CSS, and JavaScript.
-   **JavaScript structure:** Native ES modules.
-   **Libraries (via CDN or another static-compatible distribution):**
    -   `pdf-lib` for reading and writing PDFs, font sizing, RGB text
        coloring, and multi-page PDF generation.
    -   `pdfjs-dist` for detecting PDF page count and rendering PDF
        pages onto HTML canvas elements.
    -   `localForage` (recommended) or native IndexedDB for browser
        storage.
-   **Data Source:** MLB Stats API (`https://statsapi.mlb.com/api/v1/`)
    --- public, free, HTTPS, and no API key required.
-   **Hosting:** Static hosting via GitHub Pages (`github.io`).
-   **Server-side runtime:** None.

Because Scorecard Studio will normally be hosted as a GitHub **project
site**, application resources should use relative paths rather than
root-relative paths so the application works correctly beneath the
repository path.

---

## Suggested Repository Structure

``` text
Scorecard-Studio/
│
├── index.html
├── styles.css
├── .nojekyll
│
├── js/
│   ├── app.js
│   ├── api.js
│   ├── storage.js
│   ├── layouts.js
│   ├── designer.js
│   ├── pdf.js
│   ├── formatter.js
│   └── settings.js
│
├── assets/
│   ├── icons/
│   └── ...
│
├── docs/
│   └── ...
│
├── README.md
└── CHANGELOG.md
```

`app.js` should coordinate the application rather than contain every
application responsibility.

Module names and structure may evolve as the application grows.

---

## Data Model Principles

Scorecard Studio should distinguish between **application preferences**
and **layouts**.

### Application Preferences

Application-wide user preferences may include:

-   Favorite team.
-   Default league or sport.
-   General display preferences.
-   Other settings that are not specific to a scorecard layout.

Changing an application preference should not modify a saved layout.

### Layout

A layout represents a scorecard design and its associated rendering
instructions. It may include:

-   Unique layout ID.
-   Name.
-   Description.
-   Source PDF template.
-   Page definitions.
-   Field mappings.
-   Coordinate information.
-   Formatting rules.
-   Conditional styling rules.

A layout should not contain unrelated application preferences such as
the user's favorite team.

---

## Pregame Data Loading Strategy

Scorecard Studio should separate **game discovery** from **scorecard data
hydration**.

### Home / Select Game

The Home page should remain lightweight. Use the schedule and existing
game-feed/game-pack data to show the favorite team's game(s), lineup status,
basic game metadata, and other information already available from the base
pregame source.

Do **not** preload supplemental cross-reference data such as:

- manager/coaching personnel;
- team standings, streak, or last-10 data;
- supplemental player statistics only if a later, verified fallback requires them;
- other optional supplemental statistics not already in the Game Pack;
- other data requiring additional MLB API requests.

The user may choose a different game, a different layout, or take no generation
action at all.

### Generate Scorecard

Once a specific game and layout are selected, inspect the layout's mapped fields
to determine what supplemental data is actually required.

Conceptually:

```text
Schedule / Game Pack
        ↓
Home / Select Game
        ↓
Game + Layout selected
        ↓
Inspect mapped field requirements
        ↓
Fetch only required supplemental categories
        ↓
Normalize / hydrate pregame model
        ↓
Generate scorecard
```

A layout that needs only game-feed fields should require no supplemental API
requests. A layout that maps manager or standings fields should
trigger only the hydration needed for those mapped fields. Team W-L/PCT and embedded player season/YTD statistics are Game Pack-native; do not add per-player requests merely because a layout uses statistics.

### Future one-click generation

A future **Today's Scorecard** action may combine the favorite team and favorite
layout into a quick-generation workflow. It should follow the same rule:
identify today's favorite-team game, inspect the favorite layout, hydrate only
the missing data required by that layout, and generate the scorecard.

This loading strategy is both a performance optimization and an architectural
boundary: supplemental endpoints exist to satisfy scorecard field requirements,
not to inflate the Home-page data payload.

---

## User Workflows & Core Features

### 1. Template Setup & Data Customization

#### Upload & Page Detection

-   User uploads a blank PDF scorecard template.
-   The app detects the total number of pages using `pdf.numPages`.
-   Each page can be rendered independently for mapping.
-   The UI clearly identifies the active page, for example
    `Page 1 of 3`.

#### Field Customizer Panel

Before placing data, the user configures data display rules.

Possible formatting options include:

-   **Name Format:** Full Name, Last Name Only, Initial + Last Name.
-   **Combined Strings:** Ability to chain attributes, for example
    `#17 Ohtani (DH)`.
-   **Handedness:** Display bats and/or throws (`L`, `R`, `S`).
-   **Positions:** Display position using abbreviation or another
    supported format.
-   **Conditional Styling:** Custom text colors based on handedness,
    position type, or other supported conditions.
-   **Typography:** Font size in points.
-   **Alignment:** Left, Center, or Right.

#### Interactive Field Mapping

-   User selects a data element and clicks on the active PDF canvas to
    place it.
-   Mappings are page-aware.
-   Coordinates are stored as relative percentages so mappings remain
    independent of the displayed canvas size.
-   Each mapping may store its own formatting and styling rules.

Example conceptual mapping:

```json
{
  "field": "away.team.name",
  "pageIndex": 0,
  "position": {
    "xPercent": 0.1425,
    "yPercent": 0.3271,
    "anchor": "baseline-left"
  },
  "format": {
    "fontSize": 10,
    "alignment": "left"
  }
}
```

The exact schema may evolve, but mappings should function as rendering
instructions rather than simple X/Y field locations.

**Mapping coordinate convention:** the stored X/Y coordinate identifies the
**baseline-left text anchor** on the PDF page. The browser Designer may render
the PDF at any display scale, but the stored percentages and point-size values
remain independent of browser size. Generated PDFs use the same baseline anchor
directly, without a visual-center offset.

#### Save Layout

Save the layout definition and source PDF template in browser storage.

The PDF binary should be stored as a `Blob` in IndexedDB rather than
LocalStorage.

---

### 2. Pregame Data

The application retrieves the data necessary to prepare a scorecard
before the game.

Examples include:

-   Game date and first pitch time.
-   Away and home teams.
-   Venue.
-   Weather when available.
-   Lineup-posted status.
-   Starting pitchers.
-   Starting lineups.
-   Bench players.
-   Bullpen pitchers.
-   Relevant player identifiers and metadata.
-   Relevant pregame/YTD statistics as supported by the MLB Stats API.
-   Other pregame information added as the data inventory is developed.

Do not use final scores, current inning, live play state, or other
in-game information as part of the normal pregame workflow.

---

### 3. Daily Scorecard Generation

#### Select Layout

User selects a saved layout from IndexedDB.

#### Select Game

-   Fetch the appropriate schedule from the MLB Stats API.
-   Display available games as `Away Team @ Home Team`.
-   Clearly indicate loading and error states.
-   Favorite-team preferences may be used to simplify or prioritize the
    game-selection experience.

#### Fetch Pregame Data

After a game is selected, retrieve the data required by the chosen
layout.

API requests should be organized through a dedicated API module rather
than scattered throughout UI code.

#### Merge & Download

When the user selects **Generate Scorecard**:

1.  Retrieve the saved source PDF.
2.  Fetch or retrieve the required pregame data.
3.  Apply the layout's field mappings.
4.  Apply formatting and conditional styling rules.
5.  Draw the resulting text onto the appropriate PDF pages using
    `pdf-lib`.
6.  Generate the completed PDF in the browser.
7.  Trigger a download for printing or import into another application.

Provide clear UI states such as:

-   `Loading games...`
-   `Loading pregame data...`
-   `Generating PDF...`
-   `Scorecard ready.`

---

### 4. Browser Storage

Use IndexedDB, either directly or through `localForage`, for persistent
browser storage.

Recommended logical data categories include:

``` text
settings
layouts
pdfTemplates
gameCache
```

Use a dedicated storage module so the rest of the application does not
depend directly on IndexedDB implementation details.

Conceptual interface:

``` javascript
storage.getSetting(...)
storage.setSetting(...)

storage.getLayout(...)
storage.saveLayout(...)
storage.deleteLayout(...)
storage.listLayouts(...)
```

All browser-storage operations must include appropriate error handling.

Browser storage is device- and browser-specific. GitHub Pages hosts the
application itself, but does not store each user's layouts or PDF
templates.

---

### 5. Backup & Portability

Export/import is a core data-safety feature, not merely a convenience.

Users must be able to export their saved layouts, formatting rules,
settings as appropriate, and source PDF templates into a portable backup
file and import that file on another browser or device.

A future backup format may use a custom extension such as:

``` text
MyScorecardStudioBackup.scorecard
```

The underlying package may use a ZIP-compatible structure such as:

``` text
manifest.json
settings.json

layouts/
    <layout-uuid>/
        layout.json
        template.pdf
```

The backup format should include a schema/version identifier so future
versions of Scorecard Studio can migrate older backups when necessary.

---

## Error Handling

Explicit `try/catch` error handling is required around operations that
can reasonably fail, including:

-   MLB Stats API requests.
-   IndexedDB/localForage operations.
-   PDF loading and parsing.
-   PDF generation.
-   Backup export/import.
-   File reading.
-   Data/schema migration.

Errors should be surfaced to the user with useful, human-readable
messages rather than only appearing in the browser console.

---

## UI Principles

-   Keep the interface lightweight and understandable.
-   Clearly identify loading, success, empty, and error states.
-   Display the active PDF page during layout design, for example
    `Page 1 of 3`.
-   Preserve the existing pregame/no-spoilers philosophy.
-   Use full team names in normal UI where practical; abbreviations may
    be used where appropriate for filenames or compact displays.
-   Mapping behavior must remain accurate regardless of canvas display
    size.
-   Canvas clicks must capture relative coordinates based on the actual
    rendered PDF page.
-   Formatting previews should match generated PDF output as closely as
    practical.

---

## Development and Migration Strategy

The existing locally hosted Python version of Scorecard Studio should be
retained separately as a **reference implementation** during the web
rewrite.

Do not mechanically translate the Python application or copy the old
project wholesale into the new repository.

Reuse and refine:

-   Product terminology.
-   User workflows.
-   UI concepts.
-   Layout/profile concepts.
-   Existing field-mapping knowledge.
-   MLB Stats API research.
-   Pregame data organization.
-   Existing visual design where useful.

Replace:

-   `server.py`.
-   Python API retrieval and caching.
-   Python filesystem storage.
-   ReportLab PDF generation.
-   Local `/data/` storage assumptions.

The old application can be archived after the browser-based application
reaches acceptable feature parity.

---

## Development Roadmap

Development should proceed in small, testable builds. Build numbers identify
acceptance-test milestones; not every Git commit requires a new build number.

### v0.1.0 — Browser Architecture Milestone — COMPLETE

The v0.1.0 milestone proved that Scorecard Studio can function as a fully
browser-based application.

#### Build 001 — Web Foundation — COMPLETE

- GitHub Pages application shell.
- Direct browser access to the MLB Stats API.
- Verified MLB schedule retrieval both Local and Online.

#### Build 002 — Browser Storage — COMPLETE

- Native IndexedDB storage abstraction.
- Persistent application settings.
- Favorite-team persistence.
- Verified browser storage both Local and Online.

#### Build 003 — Pregame Application Shell — COMPLETE

- Favorite-team-driven game selection.
- Pregame game metadata.
- Starting pitchers.
- Starting lineups.
- Bench.
- Bullpen.
- Lineup status.
- Spoiler-free pregame presentation.

#### Build 004 — PDF Upload & Persistence — COMPLETE

- Multi-page PDF upload.
- Page detection and browser rendering with PDF.js.
- Page navigation.
- PDF Blob persistence in IndexedDB.
- Restore and render after browser reload.

#### Build 005 — Layout Management — COMPLETE

- Named persistent layouts.
- Layout metadata.
- Associated source PDFs.
- Open, edit, duplicate, and delete workflows.

#### Build 006 — Interactive Layout Designer Proof — COMPLETE

- Page-aware field placement.
- Percentage-based X/Y coordinates.
- Persistent mappings.
- Multi-page mapping.
- Browser-resize independence.
- Representative sample-data preview.
- Preview text scaling with the rendered PDF.
- Mapping deletion.

#### Build 007 — PDF Generation Proof — COMPLETE

- Browser-side PDF writing with `pdf-lib`.
- Real selected-game data written onto mapped PDF fields.
- Point-size preservation.
- Multi-page generation.
- Final mapping convention established as **baseline-left**.
- Designer and generated PDF use the same mapping anchor semantics.
- Verified end-to-end both Local and Online.

### v0.2.0 — Field Library & Formatting Milestone — ACTIVE ROADMAP

The goal of v0.2.0 is to make the Designer capable of mapping and formatting
the traditional pregame information a scorekeeper may reasonably want on a
scorecard.

The detailed candidate field inventory is maintained in:

`docs/PREGAME_DATA_INVENTORY.md`

The v0.2.0 work should proceed iteratively rather than attempting to define the
entire mapping UI in one build. Expected areas include:

- Verify what pregame data is available in the game feed.
- Identify supplemental MLB Stats API requests for missing data.
- Build a normalized pregame data model independent of individual API endpoints.
- Expand game, team, personnel, lineup, pitcher, bench, bullpen, umpire,
  standings, venue, and weather fields.
- Add season/YTD player statistics appropriate for traditional scorecards.
- Add team record and standings information.
- Add manager/personnel fields where available.
- Develop repeated-field mapping for batting-order rows.
- Develop variable-length collection behavior for bench and bullpen.
- Add atomic and composite/display fields.
- Add name-format options.
- Add font size, alignment, and color controls.
- Add conditional formatting such as bats/throws handedness.
- Add prefixes, suffixes, separators, and composite templates.
- Determine fit behavior for long values, including optional shrink-to-fit or
  other maximum-width behavior.
- Continue testing against real scorecard designs and actual MLB games.

Build numbers within v0.2.0 should remain flexible because field architecture
and formatting controls are expected to require multiple iterations.

### Build 008 — Game Day / Pregame Data — COMPLETE

- Browsable Game Day view, explicitly opened for the selected game.
- Game Pack supplies team records and player season/YTD statistics.
- Lazy Coaches and Standings API hydration; Home remains lightweight.
- Historical date selection and Today reset, with spoiler-free selection.
- Historical embedded player statistics and date-appropriate manager retrieval
  were reported verified, including a manager-change case.
- Timing/completeness across early-day and MiLB feeds remains conditional.

### Build 009 — Pregame Field Registry + Normalized Data Model — COMPLETE

Build 009 has been accepted after Local and Online testing and layout-generation verification. The full traditional v0.2.0 registry contract is in
[docs/FIELD_REGISTRY.md](docs/FIELD_REGISTRY.md). The bounded implementation and
acceptance requirements are in
[docs/BUILD_009_IMPLEMENTATION.md](docs/BUILD_009_IMPLEMENTATION.md).

- Define the full family architecture now; implement the documented 29-field
  scalar slice in Build 009, plus normalization for existing Game Day coverage.
- Keep the normalized model, registry and mapping instances separate.
- Designer preview, Game Day and PDF generation share normalized semantics;
  Designer and PDF use the same field resolver and formatter.
- Each registry field may be mapped multiple times, with independent mapping
  IDs, row bindings, placement and formatting. Home/Away families are symmetric.
- Team-name representations are separate fields, never one global layout choice.
- Use explicit repeated collection contracts for lineup, bench and bullpen;
  repeated-block UI, custom composites and advanced formatting come later.
- Preserve baseline-left anchors, point sizes, page percentages, existing
  IndexedDB layouts/PDF Blobs, historical-date behavior and no-spoilers rules.
- Hydrate only missing dependencies; opening Game Day explicitly may request
  its displayed categories independently of PDF mappings.
- Do not modify README.md as part of this build's documentation work.


### Build 010 — Repeated Block Foundation + Starting Lineups — COMPLETE

Build 010 establishes the reusable repeated-block architecture, using starting
lineups as the first implementation. It should not create nine unrelated copies
of every lineup field. Instead, a block binds a row template to a collection and
repeats that row over layout-defined geometry.

- A block's **capacity** is a property of the layout, independent of the number
  of members in the selected game's collection. MLB layouts may normally use
  nine lineup rows, while college, youth, or other baseball layouts may define
  ten or more.
- For a vertical block, the Designer should preserve the proven Python-mapper
  workflow: place the first row and last row, then infer the intermediate row
  spacing. Persist page-relative starting coordinates plus physical PDF-point
  spacing rather than browser pixels.
- One repeated row may contain multiple independently placed columns, such as
  jersey number, player name, position, handedness, and statistics. All columns
  share the same collection row selection but retain independent formatting.
- Repeated columns must support per-column `left`, `center`, and `right`
  alignment semantics. Existing `baseline-left` mappings retain their exact
  meaning and coordinates; new alignment-aware behavior must not reinterpret or
  move legacy mappings.
- Fewer members than capacity leave unused rows blank. More members than
  capacity produce a visible overflow condition; never silently discard players
  or invent additional PDF pages.
- Horizontal repetition, grids, continuation blocks, and variable-length bench
  and bullpen workflows are planned extensions of the same block model rather
  than separate collection-specific systems.


Implementation notes for Build 010:

- Adds `repeatedBlocks` alongside legacy scalar `mappings`; existing baseline-left scalar mappings are not reinterpreted.
- Starting-lineup blocks persist collection, layout capacity, PDF page, first-row percentage, physical row spacing in PDF points, and independent column definitions.
- Designer supports first/last-row placement and independently placed lineup columns with left/center/right X anchors.
- Initial repeated lineup fields are batting order, jersey number, player name, position, bats, AVG, OBP, SLG, OPS, HR, and RBI for both Away and Home.
- Generation resolves each repeated field by a 1-based slot selector, leaves unused capacity blank, and visibly reports players beyond capacity.
- The normalized lineup preserves posted orders longer than nine rows instead of truncating them.
- Scalar and repeated column records now reserve `content: { type: "field", field: ... }` semantics so a later `type: "template"` can fit the same placement model without implementing template parsing in Build 010.
- Local browser acceptance validated multiple row/column combinations and mixed alignments; generated rows and columns matched the intended PDF geometry. Build 010 was accepted and committed on September 10, 2026.

### Build 011 — Variable-Length Bench + Bullpen Blocks — COMPLETE

Build 011 proves that the Build 010 repeated-block architecture is collection-
agnostic by extending it to the variable-length Away/Home bench and bullpen.
It deliberately preserves the same stored `repeatedBlocks` schema and the same
first/last-row geometry, per-column X placement, point-size, alignment, slot
resolution, blank-row, and overflow behavior already accepted for lineups.

- The Designer collection selector now offers Away/Home starting lineup, bench,
  and bullpen blocks.
- Bench columns expose jersey number, player name, position, bats, AVG, OBP,
  SLG, OPS, HR, and RBI.
- Bullpen columns expose jersey number, pitcher name, throws, wins, losses, ERA,
  WHIP, innings pitched, strikeouts, saves, and holds.
- Capacity remains layout-defined from 1 through 30 and is not inferred from the
  currently selected game.
- Existing Build 010 lineup blocks require no migration and retain their stored
  collection IDs, geometry, columns, and alignment semantics.
- Bench membership excludes posted lineup players; bullpen membership excludes
  the selected starter, using the normalized collections already established in
  Build 009/010.
- Fewer available members than layout capacity is normal: populated slots render
  and the unused slots remain blank. This is not an error condition.
- Members beyond capacity produce an explicit overflow notice; extra members do
  not alter spacing, create pages, or silently replace mapped slots.
- Horizontal/grid geometry, continuation blocks, custom sorting, composite/free-
  text templates, and broader formatting controls remain outside Build 011.

Browser acceptance completed September 10, 2026. Existing Build 010 lineup
blocks remained correct; multiple bench/bullpen capacities and mixed alignments
generated correctly; under-capacity blocks left unused slots blank; over-capacity
blocks generated correctly and reported overflow. The current generation-status
message is functional but easy to miss when the browser file-save dialog opens.
Future UX should separate successful generation from warnings, preferably with a
post-generation dialog/toast that summarizes unavailable values and overflow in
plain language.

### Future collection placement geometry

Repeated collection data must not be tied to one visual arrangement. A scorecard
may present the same collection vertically, horizontally, in a grid, or as
individually placed items. The long-term Designer should therefore ask how a
collection should be arranged rather than assuming a collection-specific layout.
Candidate user-facing modes are:

- **Vertical list** — the current 1-column repeated-block behavior.
- **Horizontal list** — repeated items distributed across one row.
- **Grid** — configurable rows and columns (for example 2 x 2, 1 x 4, or 4 x 1).
- **Individual placement** — each item/role receives its own independent anchor.

These are geometry choices, separate from the field columns rendered inside each
item slot. A grid slot might itself contain jersey number, name, and position as
independently aligned fields. Individual placement may also be role-based rather
than ordinal: examples include placing umpire roles at distinct labeled locations
or placing starting players at their defensive positions on a field diagram.
No collection should be permanently assigned to one of these modes.

Build 012 implements the geometry step with reusable vertical, horizontal, and
grid placement on top of the accepted repeated-block engine. New repeated blocks
use generalized slot geometry; fields are placed once relative to slot 1 and are
repeated through all slots. Individual/role-based placement remains compatible
with the architecture but is deliberately deferred until its UX and selector
semantics are sufficiently defined. Composite/free-text templates follow after
the geometry foundation.

### Planned composite / free-text template architecture

Custom templates are a general mapping capability, not a lineup-only feature.
A placement may eventually render either one canonical field or a template made
from static text plus allowlisted registry-field tokens. Examples include:

```text
[Away Team] ([W-L])
Weather: [temp] and [conditions]
[jersey] [lastname] ([position])
```

Templates used outside a repeated block resolve against the game/team context.
Templates inside a repeated block additionally receive that collection row as
their context. Template dependencies participate in the same lazy hydration
planning as ordinary fields. Arbitrary JavaScript is never allowed.

Build 010 should reserve compatible content/mapping semantics for templates but
should not implement the template editor/parser. That work is tentatively
planned after the collection-geometry work (currently Build 013). Future template behavior should support optional or smart
punctuation groups so missing values do not leave artifacts such as empty
parentheses or dangling separators.

### Later pre-v1.0 work

After the v0.2.0 field/formatting milestone, likely areas include:

- Backup/export/import and cross-device portability.
- Improved layout-management tooling.
- More polished scorecard generation workflow.
- MLB/MiLB league and team selection.
- Data caching and request optimization.
- Schema migration support.
- Error/recovery behavior.
- UI/UX polish.
- Documentation and onboarding.
- Other features discovered through regular scorekeeping use.

### v1.0 scope boundary

The v1.0 goal is a stable Scorecard Studio capable of producing traditional,
pregame-populated scorecards from user-defined PDF layouts.

Advanced broadcaster-style research data is **not required for v1.0**. Examples
include:

- head-to-head season-series records;
- records versus division opponents;
- home/road or other situational team splits;
- batter-vs-pitcher history;
- pitcher-vs-opponent history;
- recent-performance windows;
- platoon or situational splits;
- other sabermetric or research-heavy matchup data.

These may be added later without changing the core layout architecture.

### Game Day foundation and future advanced research

Build 008 established a browsable pregame
**Game Day** view for useful information that does not fit naturally
as fixed PDF fields.

Future advanced research in this view could surface matchup history, recent form, splits, player-vs-pitcher
notes, or other derived insights. The scorekeeper could selectively jot one or
two useful items into the scorecard's notes area rather than forcing all
research data into mapped PDF fields.

The philosophy should remain:

- **Scorecard PDF:** structured, predictable, repeatable, printable fields.
- **Pregame Research:** contextual, variable-length, browsable information.

---

## Versioning

**v0.1.0** is the completed browser-architecture milestone.

Development now proceeds toward **v0.2.0**, focused on the field library,
normalized pregame data, and formatting/mapping controls.

Use small, testable build numbers within a milestone. Git commit messages should
prefer a lightweight Conventional Commit style, for example:

```text
feat: add normalized pregame field registry (Build 009)
fix: align designer and PDF text to baseline anchors
docs: update pregame data inventory
```

Build numbers identify planned acceptance-test milestones. Smaller fixes and
documentation commits do not need their own build number.

---

## Coding Rules for AI

-   Use vanilla HTML, CSS, and JavaScript unless the project scope is
    deliberately changed.
-   Prefer native ES modules and focused JavaScript files over a
    monolithic `app.js`.
-   Keep `app.js` primarily responsible for application initialization
    and coordination.
-   Keep MLB API logic in a dedicated module.
-   Keep browser-storage logic in a dedicated module.
-   Keep PDF rendering/generation logic separated from general UI logic.
-   Keep layout/designer logic separated where practical.
-   Use relative resource paths compatible with GitHub Pages
    project-site hosting.
-   Ensure MLB API calls include explicit error handling.
-   Ensure PDF operations include explicit error handling.
-   Ensure IndexedDB/localForage operations include explicit error
    handling.
-   Ensure import/export operations include explicit error handling and
    validation.
-   Provide clear visual UI states for asynchronous operations.
-   Preserve the pregame-only/no-spoilers philosophy.
-   Store mapping coordinates as relative page coordinates rather than
    screen pixels.
-   Keep saved data structures versioned so future migrations are
    possible.
-   Avoid introducing build tools, frameworks, server-side runtimes, or
    unnecessary dependencies unless there is a demonstrated need.
-   Use `docs/FIELD_REGISTRY.md` for canonical v0.2.0 field identity, family and collection contracts; keep `docs/PREGAME_DATA_INVENTORY.md` as candidate/discovery context and `docs/GAME_PACK_FIELD_MATRIX.md` as source evidence.
-   Keep field definitions independent of the MLB endpoint that supplies the value.
-   Normalize API data before exposing it to the Designer.
-   Prefer atomic source fields plus configurable composite/display fields over hard-coded long display strings.
-   Store text mappings using page-relative percentages and an explicit `baseline-left` anchor unless a later schema deliberately introduces another anchor type.
-   Keep stored font sizes in PDF points; Designer display scaling must not alter persisted font size.
-   Treat advanced matchup/situational research as future scope rather than silently expanding the v1.0 field library.
-   Prefer incremental, testable changes over large rewrites.

## Build 009 implementation provenance

The Build 009 implementation was applied against the complete Scorecard Studio
project package supplied after the field-registry planning pass. The existing
Build 008 application source, current IndexedDB layout/storage shape, registry
contract, implementation specification, inventory, and Game Pack matrix were
available for inspection. Static/module checks and targeted fixture tests are
documented in `docs/BUILD_009_TEST_REPORT.md`; Local and Online browser
acceptance and final PDF placement testing were completed successfully.
## Build 011.1 — Designer PDF-only zoom
- Added as a pre-Build-012 usability/testing increment after Build 011 acceptance.
- Designer PDF zoom presets: 50/75/100/125/150/200%, with +/- stepping.
- Zoom changes only the rendered Designer PDF and its overlays; layout mappings remain stored in PDF-relative coordinates and generated output is unaffected.
- Enlarged PDF pages scroll within their own viewport and zoom persists across page changes in the Designer session.
- Advanced zoom gestures and broader Designer UX polish remain deferred.


## Build 012 — Repeated Block Geometry
- Generalizes repeated collections from vertical-only lists to vertical lists, horizontal lists, and configurable row-by-column grids.
- Treats vertical and horizontal lists as special cases of slot geometry (`N x 1` and `1 x N`).
- New block geometry stores first/last slot origins plus row/column spacing in PDF points.
- Grid/list slot order is row-major: left-to-right, then top-to-bottom.
- Existing per-slot fields retain independent font size and left/center/right alignment.
- Fields are mapped against slot 1 and repeated using a slot-relative X offset.
- Existing Build 010/011 vertical blocks remain backwards compatible and do not require migration.
- Re-geometrizing a legacy block converts its existing absolute field X anchors into relative offsets to preserve placement.
- Individual/free and role-based placement remain future geometry modes; no collection is assigned a mandatory layout geometry.
- Composite/free-text templates remain deferred until after geometry.
- Known Layout Designer UI cleanup items, including the post-generation stretched-DOM issue, remain deferred until the Designer feature set is further along.

## Build 013 — Composite / Free Text
- Adds generic composite/free-text mappings that may be placed anywhere on a layout.
- Templates combine literal text with readable field tokens inserted from the existing scalar field registry; users do not need to memorize canonical IDs.
- Example templates include `[Away Team — Full Name] ([Away Team — W-L Record])` and `Weather: [Temperature]°F, [Conditions]`.
- Composite mappings store the exact template string plus page-relative baseline anchor, PDF-point font size, and left/center/right alignment.
- Template tokens resolve through the existing normalized field registry and formatter during Designer preview and PDF generation.
- Unavailable or unknown token values render blank rather than printing token syntax.
- Template-referenced fields participate in source requirement discovery (for example manager tokens can trigger coach-data loading).
- Existing scalar mappings and Build 010–012 repeated blocks remain unchanged and backward compatible.
- Layout schema version 5 is introduced only when a composite/free-text mapping is stored.
- Advanced conditionals, formulas, rich text, per-token styling, and repeated-collection tokens remain future work.
- Build 012 was accepted in browser testing; vertical, horizontal, and grid repeated-block geometry all generated correctly.
- Future Designer sample-data work should fill unused preview slots with collection-aware synthetic identities (for example Sample Player / Sample Pitcher / Sample Umpire) while respecting eventual name-format choices; unusually large capacities should likely use a soft warning rather than an MLB-specific hard assumption.
