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
user-created layouts, settings, PDF templates, and cached data are
stored locally in the user's browser. No locally hosted Python server or
application backend is required.

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

``` json
{
  "field": "away.lineup[0]",
  "pageIndex": 0,
  "position": {
    "xPercent": 0.1425,
    "yPercent": 0.3271
  },
  "format": {
    "template": "#{jersey} {initial}. {lastName} ({position})",
    "fontSize": 8,
    "alignment": "left"
  },
  "style": {
    "colorRule": "bats"
  }
}
```

The exact schema may evolve, but mappings should function as rendering
instructions rather than simple X/Y field locations.

#### Save Layout

Save the layout definition and source PDF template in browser storage.

The PDF binary should be stored as a `Blob` in IndexedDB rather than
LocalStorage.

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

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

------------------------------------------------------------------------

## Development Roadmap

Development should proceed in small, testable builds. Each build should
prove a limited set of architectural assumptions before additional
complexity is introduced.

### Build 001 --- Web Foundation

Goal: Prove the core static-hosting architecture.

-   Create the GitHub Pages application shell.
-   Establish `index.html`, CSS, and JavaScript modules.
-   Deploy the application through GitHub Pages.
-   Fetch and display today's MLB games directly from the deployed
    `github.io` application.
-   Confirm that the MLB Stats API endpoints required by the application
    can be called successfully from the browser, including CORS
    behavior.

Do not add PDF or IndexedDB functionality yet.

### Build 002 --- Browser Storage

Goal: Prove persistent local browser storage.

-   Establish the storage abstraction.
-   Save and retrieve basic application settings.
-   Confirm persistence across browser reloads.
-   Establish the initial IndexedDB/localForage data structure.

### Build 003 --- Pregame Application Shell

Goal: Recreate the useful pregame portions of the existing application.

-   Favorite-team setting.
-   Today's games.
-   First pitch.
-   Venue.
-   Weather when available.
-   Lineup-posted status.
-   Starting pitchers.
-   Starting lineups.
-   Bench.
-   Bullpen.

Maintain a pregame-only, spoiler-free experience.

### Build 004 --- PDF Upload & Persistence

Goal: Prove the browser PDF pipeline.

-   Upload a PDF.
-   Detect page count.
-   Render individual pages to canvas with `pdfjs-dist`.
-   Navigate between pages.
-   Save the original PDF Blob to IndexedDB.
-   Reload the application.
-   Retrieve and render the stored PDF again.

### Build 005 --- Layout Management

Goal: Establish persistent browser-based layouts.

-   Create layouts.
-   Name and describe layouts.
-   Associate a source PDF with a layout.
-   List saved layouts.
-   Edit layout settings.
-   Duplicate layouts.
-   Delete layouts.
-   Establish schema/version handling.

### Build 006 --- Interactive Layout Designer

Goal: Rebuild field mapping in the browser.

-   Select data fields.
-   Configure formatting.
-   Place fields on the active PDF page.
-   Store `pageIndex`, `xPercent`, and `yPercent`.
-   Edit and remove mappings.
-   Add formatting and conditional styling rules.
-   Ensure mappings remain accurate at different display sizes.

### Build 007 --- PDF Generation Proof

Goal: Prove end-to-end browser PDF writing.

Progress incrementally:

1.  Place static `Hello World` text on a mapped location.
2.  Place a real player name.
3.  Apply font sizing and alignment.
4.  Apply conditional color rules.
5.  Populate a lineup.
6.  Populate all currently supported mapped scorecard fields.

### Build 008 --- Backup & Portability

Goal: Protect user-created data and support device migration.

-   Export layouts and their PDF templates.
-   Include schema/version metadata.
-   Import exported backups.
-   Validate imported data.
-   Handle duplicate IDs and incompatible versions safely.

### Later Builds

After the browser architecture reaches feature parity with the useful
portions of the former local application, continue development of:

-   Expanded pregame data.
-   More flexible formatting rules.
-   Additional layout-management tools.
-   Improved designer workflow.
-   MLB/MiLB league and team selection.
-   Additional scorecard-generation options.
-   Schema migration support.
-   Other features identified through normal use.

------------------------------------------------------------------------

## Versioning During the Web Rewrite

Treat the browser implementation as a new architectural baseline.

During reconstruction, development builds may use a designation such as:

``` text
v0.1.0-web-dev
Build 001
```

Keep builds small and testable.

Once the browser implementation reaches functional parity with the
useful portions of the previous application, select an appropriate
public semantic version based on the project's maturity rather than
automatically continuing the old local application's version number.

------------------------------------------------------------------------

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
-   Prefer incremental, testable changes over large rewrites.
